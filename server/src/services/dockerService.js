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
    exec('docker --version', (error, stdout, stderr) => {
      if (error) {
        logger.error(`Docker未安装或无法访问: ${error.message}`);
        resolve({ installed: false, message: `未找到Docker: ${error.message}` });
      } else {
        // 检查Docker是否正在运行
        exec('docker info', (infoError, infoStdout, infoStderr) => {
          if (infoError) {
            logger.error(`Docker已安装但未运行: ${infoError.message}`);
            resolve({ installed: false, message: 'Docker已安装但未运行，请启动Docker服务' });
          } else {
            logger.info(`Docker已安装并运行: ${stdout.trim()}`);
            resolve({ installed: true, version: stdout.trim() });
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
const startContainer = (imageName, containerName, port, internalPort = 80) => {
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
        // 启动新容器
        logger.info(`启动容器: ${containerName} 从镜像 ${imageName}`);
        
        exec(`docker run -d --name ${containerName} -p ${port}:${internalPort} ${imageName}`, (error, stdout, stderr) => {
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
    
    // 生成容器名称
    const containerName = `relum-${target.dockerImage.split('/').pop().replace(/:/g, '-')}`;
    
    // 启动容器
    const result = await startContainer(target.dockerImage, containerName, target.port);
    
    return {
      error: false,
      message: `靶场环境已启动`,
      containerName,
      port: target.port,
      url: `http://localhost:${target.port}`
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
    exec('docker images --format "{{.Repository}}:{{.Tag}}"', (error, stdout, stderr) => {
      if (error) {
        reject(error);
      } else {
        const images = stdout.trim().split('\n').filter(img => img.startsWith('relum/'));
        resolve(images);
      }
    });
  });
};

module.exports = {
  checkDockerInstalled,
  startTargetEnvironment,
  stopContainer,
  installDefaultTargets,
  getInstalledImages
}; 