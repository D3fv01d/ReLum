const https = require('https');
const os = require('os');
const logger = require('../utils/logger');

const getLocalNetworkIp = () => {
  const interfaces = os.networkInterfaces();

  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && iface.internal === false) {
        return iface.address;
      }
    }
  }

  return 'localhost';
};

const getPublicIpAddress = () => new Promise((resolve) => {
  const req = https.request({
    hostname: 'api.ipify.org',
    port: 443,
    path: '/',
    method: 'GET',
  }, res => {
    let data = '';

    res.on('data', chunk => {
      data += chunk;
    });

    res.on('end', () => {
      if (res.statusCode === 200) {
        logger.info(`获取到公网IP: ${data}`);
        resolve(data.trim());
        return;
      }

      logger.warn(`获取公网IP失败，状态码: ${res.statusCode}`);
      resolve(null);
    });
  });

  req.on('error', (error) => {
    logger.warn(`获取公网IP出错: ${error.message}`);
    resolve(null);
  });

  req.setTimeout(3000, () => {
    logger.warn('获取公网IP超时');
    req.destroy();
    resolve(null);
  });

  req.end();
});

const getLocalIpAddress = async () => {
  try {
    const publicIp = await Promise.race([
      getPublicIpAddress(),
      new Promise((resolve) => {
        setTimeout(() => {
          logger.warn('获取公网IP总体超时，回退到本地IP');
          resolve(null);
        }, 5000);
      }),
    ]);

    if (publicIp) {
      return publicIp;
    }

    logger.info('使用本地网络接口IP作为备选');
    const localNetworkIp = getLocalNetworkIp();
    logger.info(localNetworkIp === 'localhost'
      ? '未找到本地IP地址，使用localhost'
      : `使用本地IP地址: ${localNetworkIp}`);

    return localNetworkIp;
  } catch (error) {
    logger.error(`获取IP地址时出错: ${error.message}`);
    return 'localhost';
  }
};

module.exports = {
  getLocalIpAddress,
  getLocalNetworkIp,
};
