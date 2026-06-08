const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');
const crypto = require('crypto');
const logger = require('./utils/logger');
const {
  isValidDockerImage,
  isValidDockerResourceId,
  isValidRequiredContainerName,
  validateTargetPayload,
} = require('./utils/targetValidation');
const dockerService = require('./services/dockerService');

// 加载环境变量
dotenv.config();

// 判断是否在Docker环境中运行
const isRunningInDocker = process.env.SHELL_ACCESS_ENABLED === 'true' || false;

// 根据环境选择合适的Shell服务实现
const shellService = isRunningInDocker
  ? require('./services/dockerShellService')
  : require('./services/shellService');

// 记录运行环境
logger.info(`服务运行于${isRunningInDocker ? 'Docker' : '本地'}环境`);

const app = express();
app.disable('x-powered-by');

const PORT = process.env.PORT || 8080;
const JSON_BODY_LIMIT = process.env.JSON_BODY_LIMIT || '1mb';
const SHELL_COMMAND_MAX_LENGTH = Number.parseInt(process.env.SHELL_COMMAND_MAX_LENGTH, 10) || 2000;
const SHELL_WS_MAX_PAYLOAD = Number.parseInt(process.env.SHELL_WS_MAX_PAYLOAD, 10) || 8192;
const allowedOrigins = (process.env.CORS_ORIGIN || '')
  .split(',')
  .map(origin => origin.trim())
  .filter(Boolean);

const isOriginAllowed = (origin) => {
  if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes('*')) {
    return true;
  }

  return allowedOrigins.includes(origin);
};

const corsOptions = {
  origin(origin, callback) {
    if (isOriginAllowed(origin)) {
      callback(null, true);
      return;
    }

    callback(null, false);
  },
};

const createRequestId = () => (
  typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID()
    : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`
);

const createRateLimiter = ({ windowMs, maxRequests }) => {
  const buckets = new Map();

  return (req, res, next) => {
    const now = Date.now();
    const key = req.ip || req.socket.remoteAddress || 'unknown';
    const bucket = buckets.get(key) || { count: 0, resetAt: now + windowMs };

    if (bucket.resetAt <= now) {
      bucket.count = 0;
      bucket.resetAt = now + windowMs;
    }

    bucket.count += 1;
    buckets.set(key, bucket);

    res.setHeader('X-RateLimit-Limit', String(maxRequests));
    res.setHeader('X-RateLimit-Remaining', String(Math.max(maxRequests - bucket.count, 0)));
    res.setHeader('X-RateLimit-Reset', String(Math.ceil(bucket.resetAt / 1000)));

    if (bucket.count > maxRequests) {
      res.status(429).json({ error: true, message: '请求过于频繁，请稍后再试' });
      return;
    }

    next();
  };
};

// 安全增强中间件
app.use((req, res, next) => {
  req.requestId = req.get('X-Request-Id') || createRequestId();
  const startedAt = Date.now();

  res.setHeader('X-Request-Id', req.requestId);

  res.on('finish', () => {
    logger.info(`${req.method} ${req.originalUrl} ${res.statusCode} ${Date.now() - startedAt}ms requestId=${req.requestId}`);
  });

  next();
});
app.use(helmet());
app.use(cors(corsOptions));
app.use(express.json({ limit: JSON_BODY_LIMIT }));
app.use('/api/target', createRateLimiter({
  windowMs: Number.parseInt(process.env.TARGET_RATE_LIMIT_WINDOW_MS, 10) || 60 * 1000,
  maxRequests: Number.parseInt(process.env.TARGET_RATE_LIMIT_MAX, 10) || 120,
}));

// 健康检查路由
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Docker靶场环境API
app.get('/api/target/check-docker', async (req, res) => {
  try {
    const dockerStatus = await dockerService.checkDockerInstalled();
    res.status(200).json(dockerStatus);
  } catch (error) {
    logger.error(`检查Docker失败: ${error.message}`);
    res.status(500).json({
      installed: false,
      error: true,
      message: error.message
    });
  }
});

// 获取所有可用的靶场环境镜像
app.get('/api/target/images', async (req, res) => {
  try {
    const images = await dockerService.getInstalledImages();
    res.status(200).json({ images });
  } catch (error) {
    logger.warn(`获取已安装镜像失败: ${error.message}`);
    res.status(500).json({ error: true, message: error.message, images: [] });
  }
});

// 获取正在运行的容器
app.get('/api/target/containers', async (req, res) => {
  try {
    const containers = await dockerService.getRunningContainers();
    res.status(200).json({ containers });
  } catch (error) {
    logger.warn(`获取运行中容器失败: ${error.message}`);
    res.status(500).json({ error: true, message: error.message, containers: [] });
  }
});

// 启动靶场环境
app.post('/api/target/start', async (req, res) => {
  try {
    const { target } = req.body;
    const validationError = validateTargetPayload(target);

    if (validationError) {
      return res.status(400).json({ error: true, message: validationError });
    }

    const result = await dockerService.startTargetEnvironment(target);
    res.status(200).json(result);
  } catch (error) {
    logger.error(`启动靶场环境失败: ${error.message}`);
    res.status(500).json({ error: true, message: error.message });
  }
});

// 停止靶场环境
app.post('/api/target/stop', async (req, res) => {
  try {
    const { containerName } = req.body;

    if (!isValidRequiredContainerName(containerName)) {
      return res.status(400).json({ error: true, message: '容器名称格式无效' });
    }

    logger.info(`停止靶场环境: ${containerName}`);
    await dockerService.stopContainer(containerName);
    res.status(200).json({ error: false, message: '靶场环境已停止' });
  } catch (error) {
    logger.error(`停止靶场环境失败: ${error.message}`);
    res.status(500).json({ error: true, message: error.message });
  }
});

// 获取容器详细信息
app.get('/api/target/container/:name', async (req, res) => {
  try {
    const { name } = req.params;

    if (!isValidRequiredContainerName(name)) {
      return res.status(400).json({ error: true, message: '容器名称格式无效' });
    }

    const containerInfo = await dockerService.getContainerInfo(name);
    res.status(200).json({ containerInfo });
  } catch (error) {
    logger.error(`获取容器信息失败: ${error.message}`);
    res.status(500).json({ error: true, message: error.message });
  }
});

// 拉取Docker镜像
app.post('/api/target/pull', async (req, res) => {
  try {
    const { imageName } = req.body;

    if (!isValidDockerImage(imageName)) {
      return res.status(400).json({ error: true, message: 'Docker镜像名称格式无效' });
    }

    // 异步拉取镜像，不等待完成
    dockerService.pullImage(imageName)
      .then(() => logger.info(`镜像拉取成功: ${imageName}`))
      .catch(err => logger.error(`镜像拉取失败: ${err.message}`));

    res.status(200).json({ error: false, message: '开始拉取镜像，请稍后查看结果' });
  } catch (error) {
    logger.error(`拉取镜像请求失败: ${error.message}`);
    res.status(500).json({ error: true, message: error.message });
  }
});

// 删除Docker镜像
app.delete('/api/target/image/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidDockerResourceId(id)) {
      return res.status(400).json({ error: true, message: 'Docker镜像ID格式无效' });
    }

    await dockerService.removeImage(id);
    res.status(200).json({ error: false, message: '镜像已删除' });
  } catch (error) {
    logger.error(`删除镜像失败: ${error.message}`);
    res.status(500).json({ error: true, message: error.message });
  }
});

app.post('/api/target/install-defaults', async (req, res) => {
  try {
    // 从请求中引入环境配置
    const { targetEnvironments } = require('../../src/config/targetEnvironments');
    const result = await dockerService.installDefaultTargets(targetEnvironments);
    res.status(200).json(result);
  } catch (error) {
    logger.error(`安装默认靶场环境失败: ${error.message}`);
    res.status(500).json({ error: true, message: error.message });
  }
});

app.use((req, res) => {
  res.status(404).json({
    error: true,
    message: '接口不存在',
    requestId: req.requestId,
  });
});

app.use((error, req, res, next) => {
  if (res.headersSent) {
    next(error);
    return;
  }

  const statusCode = error.status || error.statusCode || 500;
  const message = error.type === 'entity.parse.failed'
    ? '请求体格式无效'
    : error.message;

  logger.error(`请求处理失败: ${error.message} requestId=${req.requestId}`);
  res.status(statusCode).json({
    error: true,
    message: statusCode >= 500 ? '服务器内部错误' : message,
    requestId: req.requestId,
  });
});

// 创建HTTP服务器
const server = http.createServer(app);

// 创建WebSocket服务器
const wss = new WebSocket.Server({
  server,
  path: '/api/shell',
  maxPayload: SHELL_WS_MAX_PAYLOAD,
});

// WebSocket连接处理
wss.on('connection', (ws, req) => {
  const ip = req.socket.remoteAddress;
  const origin = req.headers.origin;

  if (!isOriginAllowed(origin)) {
    logger.security(`拒绝WebSocket来源: ${origin || 'unknown'}`, 'anonymous', ip);
    ws.close(1008, 'Origin not allowed');
    return;
  }

  logger.info(`新的WebSocket连接来自: ${ip}`);

  // 创建Shell会话
  const shellSession = shellService.createSession();

  // 发送欢迎消息
  ws.send(JSON.stringify({
    type: 'output',
    content: '已连接到ReLum安全实验Shell服务'
  }));

  ws.send(JSON.stringify({
    type: 'output',
    content: '该环境允许执行任何系统命令，适合进行安全测试和渗透实验'
  }));

  ws.send(JSON.stringify({
    type: 'output',
    content: '输入help查看可用命令示例'
  }));

  // 处理消息
  ws.on('message', async (message) => {
    try {
      const data = JSON.parse(message);

      if (!data || typeof data !== 'object' || data.type !== 'command' || typeof data.content !== 'string') {
        ws.send(JSON.stringify({
          type: 'error',
          content: '无效的命令消息'
        }));
        return;
      }

      const command = data.content.trim();

      if (!command) {
        return;
      }

      if (command.length > SHELL_COMMAND_MAX_LENGTH) {
        ws.send(JSON.stringify({
          type: 'error',
          content: `命令长度不能超过 ${SHELL_COMMAND_MAX_LENGTH} 个字符`
        }));
        return;
      }

      logger.info(`收到Shell命令，长度: ${command.length}`);

      try {
        // 执行命令并返回结果
        const result = await shellService.executeCommand(shellSession, command);

        ws.send(JSON.stringify({
          type: 'output',
          content: result
        }));
      } catch (error) {
        ws.send(JSON.stringify({
          type: 'error',
          content: `执行错误: ${error.message}`
        }));
      }
    } catch (error) {
      logger.error(`消息处理错误: ${error.message}`);
      ws.send(JSON.stringify({
        type: 'error',
        content: '无效的消息格式'
      }));
    }
  });

  // 处理关闭
  ws.on('close', () => {
    logger.info(`WebSocket连接关闭: ${ip}`);
    shellService.terminateSession(shellSession);
  });

  // 处理错误
  ws.on('error', (error) => {
    logger.error(`WebSocket错误: ${error.message}`);
  });
});

// 启动服务器
server.listen(PORT, () => {
  logger.info(`服务器运行在端口 ${PORT}`);
});

let isShuttingDown = false;

const shutdown = (signal) => {
  if (isShuttingDown) {
    return;
  }

  isShuttingDown = true;
  logger.info(`收到${signal}信号，正在关闭服务器...`);

  wss.clients.forEach((client) => {
    client.close(1001, 'Server shutting down');
  });

  const forceExitTimer = setTimeout(() => {
    logger.error('服务器关闭超时，强制退出');
    process.exit(1);
  }, 5000);
  forceExitTimer.unref();

  server.close(() => {
    clearTimeout(forceExitTimer);
    logger.info('服务器已关闭');
    process.exit(0);
  });
};

// 处理进程终止
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
