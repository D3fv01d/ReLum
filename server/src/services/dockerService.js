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
        // 获取现有容器的端口映射
        try {
          const containerInfo = await getContainerInfo(containerName);
          const ports = containerInfo.NetworkSettings.Ports;
          const portMapping = ports[`${internalPort}/tcp`] || ports[`${internalPort}/udp`];
          if (portMapping && portMapping.length > 0) {
            const actualPort = parseInt(portMapping[0].HostPort, 10);
            logger.info(`容器 ${containerName} 使用端口: ${actualPort}`);
            resolve({ status: 'running', containerName, port: actualPort });
            return;
          }
        } catch (infoError) {
          logger.warn(`获取容器端口映射失败: ${infoError.message}`);
        }
        resolve({ status: 'running', containerName, port });
        return;
      }
      
      // 停止并移除任何同名的容器
      exec(`docker rm -f ${containerName} 2>/dev/null || true`, async (error) => {
        try {
          // 检测主机平台
          const hostPlatform = os.platform() === 'darwin' && os.arch() === 'arm64' ? 'linux/arm64' : 'linux/amd64';
          logger.info(`检测到主机平台: ${hostPlatform}`);
          
          // 构建Docker运行命令，根据主机平台调整
          let runCmd = `docker run -d --platform ${hostPlatform} --name ${containerName} -p ${port}:${internalPort}`;
          
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
          logger.info(`启动容器: ${containerName} 从镜像 ${imageName}, 端口 ${port}:${internalPort}`);
          logger.debug(`运行命令: ${runCmd}`);
          
          exec(runCmd, (error, stdout, stderr) => {
            if (error) {
              // 检查是否是端口绑定错误
              if (stderr && stderr.includes('port is already allocated')) {
                logger.warn(`端口 ${port} 已被占用，尝试寻找其他可用端口`);
                // 递归调用，寻找新端口
                findAvailablePort(port + 100, 65000)  // 大幅增加步长，避免连续端口被占用
                  .then(newPort => {
                    logger.info(`找到新的可用端口: ${newPort}`);
                    startContainer(imageName, containerName, newPort, internalPort, options)
                      .then(result => resolve(result))
                      .catch(err => reject(err));
                  })
                  .catch(err => reject(err));
              } 
              // 检查是否是平台兼容性错误
              else if (stderr && stderr.includes('platform') && stderr.includes('does not match')) {
                // 尝试使用不同的平台选项
                const alternatePlatform = hostPlatform === 'linux/arm64' ? 'linux/amd64' : 'linux/arm64';
                logger.warn(`平台兼容性错误，尝试使用 ${alternatePlatform}`);
                
                let altRunCmd = `docker run -d --platform ${alternatePlatform} --name ${containerName} -p ${port}:${internalPort}`;
                
                // 添加其他参数
                if (options.env && Array.isArray(options.env)) {
                  options.env.forEach(env => {
                    altRunCmd += ` -e ${env}`;
                  });
                }
                
                if (options.volumes && Array.isArray(options.volumes)) {
                  options.volumes.forEach(volume => {
                    altRunCmd += ` -v ${volume}`;
                  });
                }
                
                if (options.dockerParams) {
                  altRunCmd += ` ${options.dockerParams}`;
                }
                
                altRunCmd += ` ${imageName}`;
                
                logger.info(`尝试使用备选平台启动: ${altRunCmd}`);
                exec(altRunCmd, (altError, altStdout, altStderr) => {
                  if (altError) {
                    logger.error(`使用备选平台启动失败: ${altError.message}`);
                    reject(new Error(`无法启动容器: 原始错误=${stderr}, 备选平台错误=${altStderr}`));
                  } else {
                    logger.info(`使用备选平台 ${alternatePlatform} 成功启动容器`);
                    resolve({ status: 'started', containerName, port });
                  }
                });
              } else {
                logger.error(`启动容器失败: ${containerName}, 错误: ${error.message}`);
                if (stderr) {
                  logger.error(`错误详情: ${stderr}`);
                }
                reject(new Error(`启动容器失败: ${error.message}`));
              }
            } else {
              logger.info(`容器启动成功: ${containerName}, ID: ${stdout.trim()}`);
              resolve({ status: 'started', containerName, port });
            }
          });
        } catch (innerError) {
          reject(innerError);
        }
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
const findAvailablePort = (startPort = 10000, endPort = 65000) => {
  return new Promise((resolve, reject) => {
    // 预定义一些备用端口，当随机检测失败时使用
    const backupPorts = [
      8080, 8081, 8082, 8083, 8084, 8085, 8086, 8087, 8088, 8089,  // 常用Web端口
      9000, 9001, 9002, 9003, 9004, 9005, 9006, 9007, 9008, 9009,  // 常用Web端口
      3000, 3001, 3002, 3003, 3004, 3005, 3006, 3007, 3008, 3009,  // 常用开发端口
      5000, 5001, 5002, 5003, 5004, 5005, 5006, 5007, 5008, 5009,  // 常用应用端口
      7000, 7001, 7002, 7003, 7004, 7005, 7006, 7007, 7008, 7009   // 常用应用端口
    ];
    
    // 使用备选端口列表的标志
    const useBackupPort = startPort > 40000; // 如果已经尝试了较高范围的端口，就使用备选表
    
    if (useBackupPort) {
      // 随机选择一个备用端口
      const randomIndex = Math.floor(Math.random() * backupPorts.length);
      const backupPort = backupPorts[randomIndex];
      logger.info(`使用备选端口列表，尝试端口: ${backupPort}`);
      
      // 使用简化的检测方法
      const net = require('net');
      const server = net.createServer();
      
      server.once('error', (err) => {
        server.close();
        // 如果端口被占用，尝试下一个备选端口
        if (err.code === 'EADDRINUSE') {
          logger.warn(`备选端口 ${backupPort} 已被占用，尝试下一个`);
          findAvailablePort(50000, endPort)  // 确保继续使用备选模式
            .then(port => resolve(port))
            .catch(err => reject(err));
        } else {
          reject(err);
        }
      });
      
      server.once('listening', () => {
        const port = server.address().port;
        server.close();
        logger.info(`找到可用的备选端口: ${port}`);
        resolve(port);
      });
      
      server.listen(backupPort);
      return;
    }
    
    // 直接使用操作系统分配的动态端口 - 最可靠的方法
    if (startPort === 10000) { // 只在首次调用时使用动态端口
      const net = require('net');
      const server = net.createServer();
      
      server.once('error', (err) => {
        server.close();
        logger.error(`创建测试服务器失败: ${err.message}`);
        // 如果动态端口失败，尝试随机端口
        startPort = Math.floor(Math.random() * 20000) + 20000;
        logger.info(`动态端口分配失败，随机选择起始端口: ${startPort}`);
        findAvailablePort(startPort, endPort)
          .then(port => resolve(port))
          .catch(err => reject(err));
      });
      
      server.once('listening', () => {
        const port = server.address().port;
        server.close();
        logger.info(`系统分配动态端口成功: ${port}`);
        resolve(port);
      });
      
      // 端口设为0让操作系统自动分配
      server.listen(0);
      return;
    }
    
    // 随机选择一个端口
    const port = Math.floor(Math.random() * (endPort - startPort)) + startPort;
    logger.info(`随机选择端口: ${port}`);
    
    // 使用简单的socket测试
    const net = require('net');
    const server = net.createServer();
    
    server.once('error', (err) => {
      server.close();
      
      // 如果端口被占用，递归尝试
      if (err.code === 'EADDRINUSE') {
        logger.warn(`端口 ${port} 已被占用，尝试另一个端口`);
        // 增大步长
        const nextStartPort = port + 1000;
        
        // 如果已经尝试了较高的端口范围，切换到备选端口模式
        if (nextStartPort > 40000) {
          logger.warn(`常规端口分配失败，切换到备选端口模式`);
          findAvailablePort(50000, endPort)  // 50000以上表示使用备选列表
            .then(port => resolve(port))
            .catch(err => reject(err));
        } else {
          findAvailablePort(nextStartPort, endPort)
            .then(port => resolve(port))
            .catch(err => reject(err));
        }
      } else {
        logger.error(`端口检测错误: ${err.message}`);
        reject(err);
      }
    });
    
    server.once('listening', () => {
      const assignedPort = server.address().port;
      server.close();
      logger.info(`找到可用端口: ${assignedPort}`);
      resolve(assignedPort);
    });
    
    server.listen(port);
  });
};

// 获取本机IP地址
const getLocalIpAddress = () => {
  const interfaces = os.networkInterfaces();
  // 尝试从各种网络接口中找到一个非内部的IPv4地址
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      // 跳过内部和非IPv4地址
      if ('IPv4' !== iface.family || iface.internal !== false) {
        continue;
      }
      // 找到一个可用的外部IPv4地址
      return iface.address;
    }
  }
  // 如果没有找到，返回localhost
  return 'localhost';
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
    const localIp = getLocalIpAddress();
    
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
    
    // 分配端口
    let port = target.port;
    
    // 如果没有指定端口，首先尝试使用系统动态分配
    if (!port) {
      try {
        logger.info(`尝试使用系统动态分配端口...`);
        const net = require('net');
        const server = net.createServer();
        
        // 创建临时服务器让系统分配可用端口
        await new Promise((resolve, reject) => {
          server.once('error', (err) => {
            server.close();
            logger.error(`创建临时服务器失败: ${err.message}`);
            resolve(null); // 不抛出错误，会进入下一个分配尝试
          });
          
          server.once('listening', () => {
            port = server.address().port;
            server.close();
            logger.info(`系统成功分配动态端口: ${port}`);
            resolve(port);
          });
          
          // 端口设为0让系统自动分配
          server.listen(0);
        });
      } catch (err) {
        logger.warn(`系统动态分配端口失败: ${err.message}`);
      }
    }
    
    // 如果系统动态分配失败，尝试备选策略
    if (!port) {
      let portAssignAttempts = 0;
      const maxPortAssignAttempts = 3; // 减少尝试次数
      
      // 尝试从备选端口列表中选择
      while (!port && portAssignAttempts < maxPortAssignAttempts) {
        try {
          logger.info(`尝试从端口列表分配 (尝试 ${portAssignAttempts + 1}/${maxPortAssignAttempts})...`);
          
          // 使用备选端口列表
          if (portAssignAttempts === 0) {
            // 第一次尝试备选端口列表
            port = await findAvailablePort(50000, 65000);
          } else if (portAssignAttempts === 1) {
            // 第二次尝试随机端口
            const randomPort = Math.floor(Math.random() * 20000) + 20000;
            port = await findAvailablePort(randomPort, randomPort + 10000);
          } else {
            // 最后尝试常用端口
            port = await findAvailablePort(8000, 9000);
          }
          
          logger.info(`端口分配成功: ${port}`);
          break;
        } catch (portError) {
          portAssignAttempts++;
          logger.warn(`端口分配失败 (尝试 ${portAssignAttempts}/${maxPortAssignAttempts}): ${portError.message}`);
          
          if (portAssignAttempts >= maxPortAssignAttempts) {
            // 最后尝试一些硬编码端口
            const emergencyPorts = [8080, 8081, 9000, 9001, 3000, 3001, 5000, 5001];
            logger.warn(`尝试紧急备用端口...`);
            
            for (const emergencyPort of emergencyPorts) {
              try {
                const net = require('net');
                const server = net.createServer();
                let isAvailable = false;
                
                await new Promise((resolve) => {
                  server.once('error', () => {
                    server.close();
                    resolve(false);
                  });
                  
                  server.once('listening', () => {
                    isAvailable = true;
                    server.close();
                    resolve(true);
                  });
                  
                  server.listen(emergencyPort);
                });
                
                if (isAvailable) {
                  port = emergencyPort;
                  logger.info(`紧急端口可用: ${port}`);
                  break;
                }
              } catch (e) {
                logger.debug(`紧急端口 ${emergencyPort} 检测失败: ${e.message}`);
              }
            }
            
            if (!port) {
              throw new Error(`无法分配可用端口，所有尝试都失败了`);
            }
          }
        }
      }
    }
    
    if (!port) {
      throw new Error('无法分配可用端口，请尝试手动指定端口或稍后再试');
    }
    
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
    
    return {
      error: false,
      message: `靶场环境已启动`,
      containerName,
      port: result.port || port,  // 使用实际分配的端口，可能与请求的不同
      downloadStatus,
      platform,
      ipAddress: localIp,
      url: `http://${localIp}:${result.port || port}`,
      localUrl: `http://localhost:${result.port || port}`
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