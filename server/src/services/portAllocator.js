const net = require('net');
const logger = require('../utils/logger');

const BACKUP_PORTS = [
  8080, 8081, 8082, 8083, 8084, 8085, 8086, 8087, 8088, 8089,
  9000, 9001, 9002, 9003, 9004, 9005, 9006, 9007, 9008, 9009,
  3000, 3001, 3002, 3003, 3004, 3005, 3006, 3007, 3008, 3009,
  5000, 5001, 5002, 5003, 5004, 5005, 5006, 5007, 5008, 5009,
  7000, 7001, 7002, 7003, 7004, 7005, 7006, 7007, 7008, 7009,
];

const EMERGENCY_PORTS = [8080, 8081, 9000, 9001, 3000, 3001, 5000, 5001];

const probePort = (port) => new Promise((resolve, reject) => {
  const server = net.createServer();

  server.once('error', (error) => {
    server.close();
    reject(error);
  });

  server.once('listening', () => {
    const assignedPort = server.address().port;
    server.close();
    resolve(assignedPort);
  });

  server.listen(port);
});

const allocateSystemPort = async () => {
  try {
    const port = await probePort(0);
    logger.info(`系统分配动态端口成功: ${port}`);
    return port;
  } catch (error) {
    logger.error(`创建测试服务器失败: ${error.message}`);
    throw error;
  }
};

const findAvailablePort = (startPort = 10000, endPort = 65000) => {
  const useBackupPort = startPort > 40000;

  if (useBackupPort) {
    const backupPort = BACKUP_PORTS[Math.floor(Math.random() * BACKUP_PORTS.length)];
    logger.info(`使用备选端口列表，尝试端口: ${backupPort}`);

    return probePort(backupPort)
      .then(port => {
        logger.info(`找到可用的备选端口: ${port}`);
        return port;
      })
      .catch(error => {
        if (error.code === 'EADDRINUSE') {
          logger.warn(`备选端口 ${backupPort} 已被占用，尝试下一个`);
          return findAvailablePort(50000, endPort);
        }

        throw error;
      });
  }

  if (startPort === 10000) {
    return allocateSystemPort().catch(() => {
      const nextStartPort = Math.floor(Math.random() * 20000) + 20000;
      logger.info(`动态端口分配失败，随机选择起始端口: ${nextStartPort}`);
      return findAvailablePort(nextStartPort, endPort);
    });
  }

  const port = Math.floor(Math.random() * (endPort - startPort)) + startPort;
  logger.info(`随机选择端口: ${port}`);

  return probePort(port)
    .then(assignedPort => {
      logger.info(`找到可用端口: ${assignedPort}`);
      return assignedPort;
    })
    .catch(error => {
      if (error.code !== 'EADDRINUSE') {
        logger.error(`端口检测错误: ${error.message}`);
        throw error;
      }

      logger.warn(`端口 ${port} 已被占用，尝试另一个端口`);
      const nextStartPort = port + 1000;

      if (nextStartPort > 40000) {
        logger.warn('常规端口分配失败，切换到备选端口模式');
        return findAvailablePort(50000, endPort);
      }

      return findAvailablePort(nextStartPort, endPort);
    });
};

const allocateEmergencyPort = async () => {
  logger.warn('尝试紧急备用端口...');

  for (const emergencyPort of EMERGENCY_PORTS) {
    try {
      const port = await probePort(emergencyPort);
      logger.info(`紧急端口可用: ${port}`);
      return port;
    } catch (error) {
      logger.debug(`紧急端口 ${emergencyPort} 检测失败: ${error.message}`);
    }
  }

  throw new Error('无法分配可用端口，所有尝试都失败了');
};

const allocateTargetPort = async (preferredPort) => {
  if (preferredPort) {
    return preferredPort;
  }

  try {
    logger.info('尝试使用系统动态分配端口...');
    return await allocateSystemPort();
  } catch (error) {
    logger.warn(`系统动态分配端口失败: ${error.message}`);
  }

  const strategies = [
    () => findAvailablePort(50000, 65000),
    () => findAvailablePort(Math.floor(Math.random() * 20000) + 20000, 50000),
    () => findAvailablePort(8000, 9000),
  ];

  for (const [index, strategy] of strategies.entries()) {
    try {
      logger.info(`尝试从端口列表分配 (尝试 ${index + 1}/${strategies.length})...`);
      const port = await strategy();
      logger.info(`端口分配成功: ${port}`);
      return port;
    } catch (error) {
      logger.warn(`端口分配失败 (尝试 ${index + 1}/${strategies.length}): ${error.message}`);
    }
  }

  return allocateEmergencyPort();
};

module.exports = {
  allocateTargetPort,
  findAvailablePort,
};
