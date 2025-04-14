const { exec, spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const os = require('os');
const logger = require('../utils/logger');

// Docker镜像存储位置
const getStoragePath = () => {
  const platform = os.platform();
  
  if (platform === 'linux') {
    return '/opt/relum/targets';
  } else if (platform === 'darwin') {
    return path.join(os.homedir(), 'Library/Application Support/ReLum/targets');
  } else if (platform === 'win32') {
    return 'C:\\ProgramData\\ReLum\\targets';
  } else {
    return path.join(os.homedir(), '.relum/targets');
  }
};

// 确保存储目录存在
const ensureStorageDir = () => {
  const storagePath = getStoragePath();
  if (!fs.existsSync(storagePath)) {
    fs.mkdirSync(storagePath, { recursive: true });
  }
  return storagePath;
};

// 检查Docker是否已安装
const checkDockerInstalled = () => {
  return new Promise((resolve, reject) => {
    // 优先检查socket文件是否存在
    if (fs.existsSync('/var/run/docker.sock')) {
      logger.info('Docker套接字文件存在，尝试使用套接字连接Docker');
    } else {
      logger.warn('Docker套接字文件不存在，可能需要挂载: /var/run/docker.sock');
    }

    // 先检查Docker客户端版本
    exec('docker --version', (error, stdout, stderr) => {
      if (error) {
        logger.error(`Docker客户端未安装或无法访问: ${error.message}`);
        resolve({ installed: false, message: `未找到Docker客户端: ${error.message}` });
      } else {
        const clientVersion = stdout.trim();
        logger.info(`Docker客户端已安装: ${clientVersion}`);
        
        // 然后检查Docker守护进程
        exec('docker info', { timeout: 10000 }, (infoError, infoStdout, infoStderr) => {
          if (infoError) {
            logger.error(`Docker客户端无法连接到守护进程: ${infoError.message}`);
            
            // 尝试不同的环境变量配置
            const alternativeCommand = 'DOCKER_HOST=unix:///var/run/docker.sock docker info';
            logger.info('尝试使用显式DOCKER_HOST环境变量重试连接');
            
            exec(alternativeCommand, { timeout: 10000 }, (altError, altStdout, altStderr) => {
              if (altError) {
                logger.error(`使用显式套接字路径仍然无法连接: ${altError.message}`);
                resolve({ 
                  installed: false, 
                  message: '找到Docker客户端但无法连接到Docker守护进程，请确保Docker服务正在运行，并且已正确挂载Docker套接字',
                  error: infoError.message,
                  clientVersion
                });
              } else {
                logger.info('使用显式套接字路径成功连接到Docker守护进程');
                resolve({ installed: true, version: clientVersion, socketTest: '使用显式套接字成功' });
              }
            });
          } else {
            const serverVersion = infoStdout.match(/Server Version: (.*)/);
            if (serverVersion && serverVersion[1]) {
              logger.info(`Docker守护进程运行正常，服务器版本: ${serverVersion[1]}`);
            } else {
              logger.info('Docker守护进程运行正常，但无法获取服务器版本');
            }
            resolve({ installed: true, version: clientVersion });
          }
        });
      }
    });
  });
};

// 检查镜像是否存在
const checkImageExists = (imageName) => {
  return new Promise((resolve, reject) => {
    exec(`docker image inspect ${imageName}`, (error, stdout, stderr) => {
      if (error) {
        resolve(false);
      } else {
        resolve(true);
      }
    });
  });
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
const checkContainerRunning = (containerName) => {
  return new Promise((resolve, reject) => {
    exec(`docker ps --filter "name=${containerName}" --format "{{.Names}}"`, (error, stdout, stderr) => {
      if (error) {
        reject(error);
      } else {
        resolve(stdout.trim() === containerName);
      }
    });
  });
};

// 启动Docker容器
const startContainer = (imageName, containerName, port, internalPort = 80, options = {}) => {
  return new Promise(async (resolve, reject) => {
    try {
      // 检查是否已经有同名容器在运行
      const isRunning = await checkContainerRunning(containerName);
      
      if (isRunning) {
        logger.info(`容器已在运行中: ${containerName}`);
        resolve({ status: 'running', containerName, port });
        return;
      }
      
      // 停止并移除任何同名的容器
      exec(`docker rm -f ${containerName} 2>/dev/null || true`, async (error) => {
        // 构建Docker运行命令
        let runCmd = `docker run -d --name ${containerName} -p ${port}:${internalPort}`;
        
        // 添加环境变量
        if (options.env && Array.isArray(options.env)) {
          options.env.forEach(env => {
            runCmd += ` -e ${env}`;
          });
        }
        
        // 添加卷挂载
        if (options.volumes && Array.isArray(options.volumes)) {
          options.volumes.forEach(volume => {
            runCmd += ` -v ${volume}`;
          });
        }
        
        // 添加自定义Docker参数
        if (options.dockerParams) {
          runCmd += ` ${options.dockerParams}`;
        }
        
        // 添加镜像名称
        runCmd += ` ${imageName}`;
        
        // 启动新容器
        logger.info(`启动容器: ${containerName} 从镜像 ${imageName}`);
        logger.debug(`运行命令: ${runCmd}`);
        
        exec(runCmd, (error, stdout, stderr) => {
          if (error) {
            logger.error(`启动容器失败: ${containerName}, 错误: ${error.message}`);
            reject(new Error(`启动容器失败: ${error.message}`));
          } else {
            logger.info(`容器启动成功: ${containerName}, ID: ${stdout.trim()}`);
            resolve({ status: 'started', containerName, port });
          }
        });
      });
    } catch (error) {
      reject(error);
    }
  });
};

// 停止容器
const stopContainer = (containerName) => {
  return new Promise((resolve, reject) => {
    exec(`docker stop ${containerName}`, (error, stdout, stderr) => {
      if (error) {
        logger.error(`停止容器失败: ${containerName}, 错误: ${error.message}`);
        reject(error);
      } else {
        logger.info(`容器已停止: ${containerName}`);
        resolve();
      }
    });
  });
};

// 获取容器信息
const getContainerInfo = (containerName) => {
  return new Promise((resolve, reject) => {
    exec(`docker inspect ${containerName}`, (error, stdout, stderr) => {
      if (error) {
        logger.error(`获取容器信息失败: ${containerName}, 错误: ${error.message}`);
        reject(error);
      } else {
        try {
          const containerInfo = JSON.parse(stdout)[0];
          resolve(containerInfo);
        } catch (parseError) {
          reject(new Error(`解析容器信息失败: ${parseError.message}`));
        }
      }
    });
  });
};

// 配置靶场环境暴露端口
const findAvailablePort = (startPort = 10000, endPort = 20000) => {
  return new Promise((resolve, reject) => {
    // 获取当前使用的端口
    exec('netstat -tln | grep -E \':[0-9]+\'', (error, stdout, stderr) => {
      try {
        // 解析所有已用端口
        const usedPorts = new Set();
        stdout.split('\n').forEach(line => {
          const match = line.match(/:(\d+)/);
          if (match && match[1]) {
            usedPorts.add(parseInt(match[1], 10));
          }
        });
        
        // 查找可用端口
        for (let port = startPort; port <= endPort; port++) {
          if (!usedPorts.has(port)) {
            return resolve(port);
          }
        }
        
        reject(new Error('找不到可用端口'));
      } catch (err) {
        reject(err);
      }
    });
  });
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
    
    // 检查镜像是否存在
    const imageExists = await checkImageExists(target.dockerImage);
    
    // 如果镜像不存在，下载它
    if (!imageExists) {
      await pullImage(target.dockerImage);
    }
    
    // 分配端口
    let port = target.port;
    if (!port) {
      port = await findAvailablePort();
    }
    
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
    
    // 启动容器
    const result = await startContainer(target.dockerImage, containerName, port, internalPort, options);
    
    return {
      error: false,
      message: `靶场环境已启动`,
      containerName,
      port,
      url: `http://localhost:${port}`
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
const getInstalledImages = () => {
  return new Promise((resolve, reject) => {
    exec('docker images --format "{{.Repository}}:{{.Tag}} {{.ID}} {{.Size}} {{.CreatedSince}}"', (error, stdout, stderr) => {
      if (error) {
        logger.error(`获取镜像列表失败: ${error.message}`);
        reject(error);
      } else {
        const images = stdout.trim().split('\n')
          .filter(line => line.trim() !== '')
          .map(line => {
            const [fullName, id, size, createdSince] = line.split(' ');
            
            // 将全名分割为仓库和标签
            const [repository, tag] = fullName.includes(':') 
              ? fullName.split(':') 
              : [fullName, 'latest'];
            
            return {
              repository,
              tag,
              fullName,
              id,
              size,
              createdSince
            };
          });
        
        resolve(images);
      }
    });
  });
};

// 获取运行中的容器
const getRunningContainers = () => {
  return new Promise((resolve, reject) => {
    exec('docker ps --format "{{.ID}} {{.Names}} {{.Image}} {{.Ports}} {{.Status}}"', (error, stdout, stderr) => {
      if (error) {
        logger.error(`获取容器列表失败: ${error.message}`);
        reject(error);
      } else {
        const containers = stdout.trim().split('\n')
          .filter(line => line.trim() !== '')
          .map(line => {
            const [id, name, image, ports, ...statusParts] = line.split(' ');
            const status = statusParts.join(' ');
            
            // 解析端口映射
            const portMappings = [];
            if (ports) {
              const portRegex = /(\d+\.\d+\.\d+\.\d+):(\d+)->(\d+)\/(\w+)/g;
              let match;
              while ((match = portRegex.exec(ports)) !== null) {
                portMappings.push({
                  hostIp: match[1],
                  hostPort: match[2],
                  containerPort: match[3],
                  protocol: match[4]
                });
              }
            }
            
            return {
              id,
              name,
              image,
              portMappings,
              status,
              isRelumContainer: name.startsWith('relum-')
            };
          })
          .filter(container => container.isRelumContainer); // 只返回由ReLum启动的容器
        
        resolve(containers);
      }
    });
  });
};

// 移除镜像
const removeImage = (imageId) => {
  return new Promise((resolve, reject) => {
    exec(`docker rmi -f ${imageId}`, (error, stdout, stderr) => {
      if (error) {
        logger.error(`移除镜像失败: ${imageId}, 错误: ${error.message}`);
        reject(error);
      } else {
        logger.info(`镜像已移除: ${imageId}`);
        resolve();
      }
    });
  });
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
  findAvailablePort
}; 