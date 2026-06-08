const { spawn } = require('child_process');
const fs = require('fs');
const os = require('os');
const logger = require('../utils/logger');
const {
  buildRunArgs,
  runDockerCommand,
} = require('./dockerCommand');
const {
  getLocalIpAddress,
  getLocalNetworkIp,
} = require('./networkAddress');
const {
  allocateTargetPort,
  findAvailablePort,
} = require('./portAllocator');
const {
  ensureStorageDir,
} = require('./targetStorage');

// 检查Docker是否已安装
const checkDockerInstalled = async () => {
  if (fs.existsSync('/var/run/docker.sock')) {
    logger.info('Docker套接字文件存在，尝试使用套接字连接Docker');
  } else {
    logger.warn('Docker套接字文件不存在，可能需要挂载: /var/run/docker.sock');
  }

  let clientVersion;

  try {
    const versionResult = await runDockerCommand(['--version']);
    clientVersion = versionResult.stdout.trim();
    logger.info(`Docker客户端已安装: ${clientVersion}`);
  } catch (error) {
    logger.error(`Docker客户端未安装或无法访问: ${error.message}`);
    return { installed: false, message: `未找到Docker客户端: ${error.message}` };
  }

  try {
    const infoResult = await runDockerCommand(['info']);
    const serverVersion = infoResult.stdout.match(/Server Version: (.*)/);

    if (serverVersion?.[1]) {
      logger.info(`Docker守护进程运行正常，服务器版本: ${serverVersion[1]}`);
    } else {
      logger.info('Docker守护进程运行正常，但无法获取服务器版本');
    }

    return { installed: true, version: clientVersion };
  } catch (infoError) {
    logger.warn(`Docker客户端无法连接到守护进程: ${infoError.message}`);
    logger.info('尝试使用显式DOCKER_HOST环境变量重试连接');

    try {
      await runDockerCommand(['info'], {
        env: {
          ...process.env,
          DOCKER_HOST: 'unix:///var/run/docker.sock',
        },
      });

      logger.info('使用显式套接字路径成功连接到Docker守护进程');
      return { installed: true, version: clientVersion, socketTest: '使用显式套接字成功' };
    } catch (altError) {
      logger.warn(`使用显式套接字路径仍然无法连接: ${altError.message}`);
      return {
        installed: false,
        message: '找到Docker客户端但无法连接到Docker守护进程，请确保Docker服务正在运行，并且已正确挂载Docker套接字',
        error: infoError.message,
        clientVersion,
      };
    }
  }
};

// 检查镜像是否存在
const checkImageExists = async (imageName) => {
  try {
    await runDockerCommand(['image', 'inspect', imageName]);
    return true;
  } catch (error) {
    return false;
  }
};

// 拉取Docker镜像
const pullImage = (imageName) => {
  return new Promise((resolve, reject) => {
    logger.info(`开始拉取镜像: ${imageName}`);

    const pullProcess = spawn('docker', ['pull', imageName]);

    pullProcess.stdout.on('data', (data) => {
      logger.info(`拉取进度: ${data.toString().trim()}`);
    });

    pullProcess.stderr.on('data', (data) => {
      logger.info(`拉取信息: ${data.toString().trim()}`);
    });

    pullProcess.on('close', (code) => {
      if (code !== 0) {
        logger.error(`镜像拉取失败: ${imageName}，退出码: ${code}`);
        reject(new Error(`拉取镜像失败: ${imageName}`));
      } else {
        logger.info(`镜像拉取成功: ${imageName}`);
        resolve();
      }
    });
  });
};

// 检查容器是否已运行
const checkContainerRunning = async (containerName) => {
  const { stdout } = await runDockerCommand([
    'ps',
    '--filter',
    `name=${containerName}`,
    '--format',
    '{{.Names}}',
  ]);

  return stdout.trim() === containerName;
};

// 启动Docker容器
const startContainer = async (imageName, containerName, port, internalPort = 80, options = {}) => {
  const isRunning = await checkContainerRunning(containerName);

  if (isRunning) {
    logger.info(`容器已在运行中: ${containerName}`);

    try {
      const containerInfo = await getContainerInfo(containerName);
      const ports = containerInfo.NetworkSettings.Ports;
      const portMapping = ports[`${internalPort}/tcp`] || ports[`${internalPort}/udp`];

      if (portMapping?.length > 0) {
        const actualPort = parseInt(portMapping[0].HostPort, 10);
        logger.info(`容器 ${containerName} 使用端口: ${actualPort}`);
        return { status: 'running', containerName, port: actualPort };
      }
    } catch (infoError) {
      logger.warn(`获取容器端口映射失败: ${infoError.message}`);
    }

    return { status: 'running', containerName, port };
  }

  await runDockerCommand(['rm', '-f', containerName]).catch(() => null);

  const hostPlatform = os.platform() === 'darwin' && os.arch() === 'arm64'
    ? 'linux/arm64'
    : 'linux/amd64';

  const runWithPlatform = async (platform) => {
    const args = buildRunArgs(platform, imageName, containerName, port, internalPort, options);

    logger.info(`启动容器: ${containerName} 从镜像 ${imageName}, 端口 ${port}:${internalPort}`);
    logger.debug(`运行命令: docker ${args.join(' ')}`);

    return runDockerCommand(args);
  };

  logger.info(`检测到主机平台: ${hostPlatform}`);

  try {
    const { stdout } = await runWithPlatform(hostPlatform);
    logger.info(`容器启动成功: ${containerName}, ID: ${stdout.trim()}`);
    return { status: 'started', containerName, port };
  } catch (error) {
    const stderr = error.stderr || '';

    if (stderr.includes('port is already allocated')) {
      logger.warn(`端口 ${port} 已被占用，尝试寻找其他可用端口`);
      const newPort = await findAvailablePort(port + 100, 65000);
      logger.info(`找到新的可用端口: ${newPort}`);
      return startContainer(imageName, containerName, newPort, internalPort, options);
    }

    if (stderr.includes('platform') && stderr.includes('does not match')) {
      const alternatePlatform = hostPlatform === 'linux/arm64' ? 'linux/amd64' : 'linux/arm64';
      logger.warn(`平台兼容性错误，尝试使用 ${alternatePlatform}`);

      try {
        await runWithPlatform(alternatePlatform);
        logger.info(`使用备选平台 ${alternatePlatform} 成功启动容器`);
        return { status: 'started', containerName, port };
      } catch (altError) {
        logger.error(`使用备选平台启动失败: ${altError.message}`);
        throw new Error(`无法启动容器: 原始错误=${stderr}, 备选平台错误=${altError.stderr || altError.message}`);
      }
    }

    logger.error(`启动容器失败: ${containerName}, 错误: ${error.message}`);
    if (stderr) {
      logger.error(`错误详情: ${stderr}`);
    }
    throw new Error(`启动容器失败: ${error.message}`);
  }
};

// 停止容器
const stopContainer = async (containerName) => {
  try {
    await runDockerCommand(['stop', containerName]);
    logger.info(`容器已停止: ${containerName}`);
  } catch (error) {
    logger.error(`停止容器失败: ${containerName}, 错误: ${error.message}`);
    throw error;
  }
};

// 获取容器信息
const getContainerInfo = async (containerName) => {
  try {
    const { stdout } = await runDockerCommand(['inspect', containerName]);
    return JSON.parse(stdout)[0];
  } catch (error) {
    logger.error(`获取容器信息失败: ${containerName}, 错误: ${error.message}`);
    throw error;
  }
};

// 启动靶场环境
const startTargetEnvironment = async (target) => {
  try {
    // 确保Docker已安装
    const dockerInstalled = await checkDockerInstalled();
    if (!dockerInstalled.installed) {
      return { error: true, message: dockerInstalled.message };
    }

    // 确保存储目录
    ensureStorageDir();

    // 获取本机IP - 提前获取方便状态报告
    const localIp = await getLocalIpAddress();

    // 检查镜像是否存在
    const imageExists = await checkImageExists(target.dockerImage);
    let downloadStatus = '';

    // 如果镜像不存在，下载它
    if (!imageExists) {
      downloadStatus = '正在下载镜像，请稍候...';
      logger.info(`开始下载镜像: ${target.dockerImage}`);
      await pullImage(target.dockerImage);
      downloadStatus = '镜像下载完成，准备启动容器...';
    } else {
      downloadStatus = '使用已存在的镜像，准备启动容器...';
    }

    const port = await allocateTargetPort(target.port);
    logger.info(`最终使用端口: ${port}`);

    // 生成容器名称
    const containerName = target.containerName ||
      `relum-${target.dockerImage.split('/').pop().replace(/:/g, '-')}-${Date.now().toString().slice(-6)}`;

    // 准备容器启动选项
    const options = {
      env: target.env || [],
      volumes: target.volumes || [],
      dockerParams: target.dockerParams || ''
    };

    // 确定内部端口
    const internalPort = target.internalPort || 80;

    // 获取本机平台信息
    const platform = os.platform() + '/' + os.arch();
    logger.info(`本机平台: ${platform}`);

    // 启动容器
    logger.info(`正在启动容器 ${containerName}，端口 ${port}，平台: ${platform}`);
    downloadStatus = '端口分配成功，正在启动容器...';
    const result = await startContainer(target.dockerImage, containerName, port, internalPort, options);

    downloadStatus = '容器启动成功，环境已就绪';

    const actualPort = result.port || port;
    const localNetworkIp = getLocalNetworkIp();

    return {
      error: false,
      message: `靶场环境已启动`,
      containerName,
      port: actualPort,
      downloadStatus,
      platform,
      // 使用公网IP作为主要访问地址
      ipAddress: localIp,
      // 保存不同访问URL以供选择
      url: `http://${localIp}:${actualPort}`,
      localUrl: `http://localhost:${actualPort}`,
      localNetworkUrl: `http://${localNetworkIp}:${actualPort}`,
      // 是否是公网IP
      isPublicIp: localIp !== 'localhost' && localIp !== localNetworkIp,
      accessUrls: {
        public: `http://${localIp}:${actualPort}`,
        localhost: `http://localhost:${actualPort}`,
        localNetwork: `http://${localNetworkIp}:${actualPort}`
      }
    };
  } catch (error) {
    logger.error(`启动靶场环境失败: ${error.message}`);
    return { error: true, message: `启动失败: ${error.message}` };
  }
};

// 安装所有默认靶场环境
const installDefaultTargets = async (targetEnvironments) => {
  try {
    // 确保Docker已安装
    const dockerInstalled = await checkDockerInstalled();
    if (!dockerInstalled.installed) {
      return { error: true, message: dockerInstalled.message };
    }

    // 确保存储目录
    ensureStorageDir();

    const results = [];
    const errors = [];

    // 遍历所有靶场环境
    for (const category in targetEnvironments) {
      const sections = targetEnvironments[category].sections;

      for (const sectionName in sections) {
        const target = sections[sectionName];

        // 只下载默认安装的镜像
        if (target.defaultInstall) {
          try {
            // 检查镜像是否存在
            const imageExists = await checkImageExists(target.dockerImage);

            // 如果镜像不存在，下载它
            if (!imageExists) {
              await pullImage(target.dockerImage);
              results.push(`成功安装: ${sectionName} (${target.dockerImage})`);
            } else {
              results.push(`已存在: ${sectionName} (${target.dockerImage})`);
            }
          } catch (err) {
            errors.push(`安装失败 ${sectionName}: ${err.message}`);
          }
        }
      }
    }

    return {
      error: false,
      installed: results.length,
      failed: errors.length,
      results,
      errors
    };
  } catch (error) {
    logger.error(`安装默认靶场环境失败: ${error.message}`);
    return { error: true, message: `安装失败: ${error.message}` };
  }
};

// 获取已安装的Docker镜像
const getInstalledImages = async () => {
  try {
    const { stdout } = await runDockerCommand(['images', '--format', '{{json .}}']);

    return stdout.trim().split('\n')
      .filter(line => line.trim() !== '')
      .map(line => JSON.parse(line))
      .map(image => {
        const repository = image.Repository || '未知';
        const tag = image.Tag || 'latest';

        return {
          repository,
          tag,
          fullName: `${repository}:${tag}`,
          id: image.ID,
          size: image.Size,
          createdSince: image.CreatedSince,
        };
      });
  } catch (error) {
    logger.warn(`获取镜像列表失败: ${error.message}`);
    throw error;
  }
};

// 获取运行中的容器
const getRunningContainers = async () => {
  try {
    const { stdout } = await runDockerCommand(['ps', '--format', '{{json .}}']);

    return stdout.trim().split('\n')
      .filter(line => line.trim() !== '')
      .map(line => JSON.parse(line))
      .map(container => {
        const portMappings = [];
        const portRegex = /(?:(\d+\.\d+\.\d+\.\d+):)?(\d+)->(\d+)\/(\w+)/g;
        let match;

        while ((match = portRegex.exec(container.Ports || '')) !== null) {
          portMappings.push({
            hostIp: match[1] || '0.0.0.0',
            hostPort: match[2],
            containerPort: match[3],
            protocol: match[4],
          });
        }

        return {
          id: container.ID,
          name: container.Names,
          image: container.Image,
          portMappings,
          status: container.Status,
          isRelumContainer: container.Names.startsWith('relum-'),
        };
      })
      .filter(container => container.isRelumContainer);
  } catch (error) {
    logger.warn(`获取容器列表失败: ${error.message}`);
    throw error;
  }
};

// 移除镜像
const removeImage = async (imageId) => {
  try {
    await runDockerCommand(['rmi', '-f', imageId]);
    logger.info(`镜像已移除: ${imageId}`);
  } catch (error) {
    logger.error(`移除镜像失败: ${imageId}, 错误: ${error.message}`);
    throw error;
  }
};

// 导出模块
module.exports = {
  checkDockerInstalled,
  checkImageExists,
  pullImage,
  startContainer,
  stopContainer,
  getContainerInfo,
  startTargetEnvironment,
  installDefaultTargets,
  getInstalledImages,
  getRunningContainers,
  removeImage,
};
