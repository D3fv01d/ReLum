const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const dotenv = require('dotenv');
const logger = require('./utils/logger');
const dockerService = require('./services/dockerService');

// 判断是否在Docker环境中运行
const isRunningInDocker = process.env.SHELL_ACCESS_ENABLED === 'true' || false;

// 根据环境选择合适的Shell服务实现
const shellService = isRunningInDocker 
  ? require('./services/dockerShellService') 
  : require('./services/shellService');

// 记录运行环境
logger.info(`服务运行于${isRunningInDocker ? 'Docker' : '本地'}环境`);

// 加载环境变量
dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

// 安全增强中间件
app.use(helmet());
app.use(cors());
app.use(express.json());

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

app.post('/api/target/start', async (req, res) => {
  try {
    const { target } = req.body;
    
    if (!target || !target.dockerImage) {
      return res.status(400).json({ error: true, message: '缺少必要参数' });
    }
    
    const result = await dockerService.startTargetEnvironment(target);
    res.status(200).json(result);
  } catch (error) {
    logger.error(`启动靶场环境失败: ${error.message}`);
    res.status(500).json({ error: true, message: error.message });
  }
});

app.post('/api/target/install-defaults', async (req, res) => {
  try {
    // 从请求中引入环境配置
    const targetEnvironments = require('../../src/config/targetEnvironments');
    const result = await dockerService.installDefaultTargets(targetEnvironments);
    res.status(200).json(result);
  } catch (error) {
    logger.error(`安装默认靶场环境失败: ${error.message}`);
    res.status(500).json({ error: true, message: error.message });
  }
});

app.get('/api/target/images', async (req, res) => {
  try {
    const images = await dockerService.getInstalledImages();
    res.status(200).json({ images });
  } catch (error) {
    logger.error(`获取已安装镜像失败: ${error.message}`);
    res.status(500).json({ error: true, message: error.message, images: [] });
  }
});

// 创建HTTP服务器
const server = http.createServer(app);

// 创建WebSocket服务器
const wss = new WebSocket.Server({ server, path: '/api/shell' });

// WebSocket连接处理
wss.on('connection', (ws, req) => {
  const ip = req.socket.remoteAddress;
  logger.info(`新的WebSocket连接来自: ${ip}`);
  
  // 添加调试信息
  logger.info(`WebSocket握手请求头: ${JSON.stringify(req.headers)}`);
  
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
      
      if (data.type === 'command') {
        const command = data.content.trim();
        logger.info(`收到命令: ${command}`);
        
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

// 处理进程终止
process.on('SIGINT', () => {
  logger.info('正在关闭服务器...');
  server.close(() => {
    logger.info('服务器已关闭');
    process.exit(0);
  });
}); 