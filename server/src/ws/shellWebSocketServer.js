const WebSocket = require('ws');

const sendMessage = (ws, type, content) => {
  ws.send(JSON.stringify({ type, content }));
};

const sendWelcomeMessages = (ws) => {
  sendMessage(ws, 'output', '已连接到ReLum安全实验Shell服务');
  sendMessage(ws, 'output', '该环境允许执行任何系统命令，适合进行安全测试和渗透实验');
  sendMessage(ws, 'output', '输入help查看可用命令示例');
};

const parseCommand = (message) => {
  const data = JSON.parse(message);

  if (!data || typeof data !== 'object' || data.type !== 'command' || typeof data.content !== 'string') {
    return { error: '无效的命令消息' };
  }

  return {
    command: data.content.trim(),
  };
};

const createShellWebSocketServer = ({
  server,
  shellService,
  isOriginAllowed,
  logger,
  maxPayload,
  commandMaxLength,
  path = '/api/shell',
}) => {
  const wss = new WebSocket.Server({
    server,
    path,
    maxPayload,
  });

  wss.on('connection', (ws, req) => {
    const ip = req.socket.remoteAddress;
    const origin = req.headers.origin;

    if (!isOriginAllowed(origin)) {
      logger.security(`拒绝WebSocket来源: ${origin || 'unknown'}`, 'anonymous', ip);
      ws.close(1008, 'Origin not allowed');
      return;
    }

    logger.info(`新的WebSocket连接来自: ${ip}`);

    const shellSession = shellService.createSession();
    sendWelcomeMessages(ws);

    ws.on('message', async (message) => {
      try {
        const { command, error } = parseCommand(message);

        if (error) {
          sendMessage(ws, 'error', error);
          return;
        }

        if (!command) {
          return;
        }

        if (command.length > commandMaxLength) {
          sendMessage(ws, 'error', `命令长度不能超过 ${commandMaxLength} 个字符`);
          return;
        }

        logger.info(`收到Shell命令，长度: ${command.length}`);

        try {
          const result = await shellService.executeCommand(shellSession, command);
          sendMessage(ws, 'output', result);
        } catch (error) {
          sendMessage(ws, 'error', `执行错误: ${error.message}`);
        }
      } catch (error) {
        logger.error(`消息处理错误: ${error.message}`);
        sendMessage(ws, 'error', '无效的消息格式');
      }
    });

    ws.on('close', () => {
      logger.info(`WebSocket连接关闭: ${ip}`);
      shellService.terminateSession(shellSession);
    });

    ws.on('error', (error) => {
      logger.error(`WebSocket错误: ${error.message}`);
    });
  });

  return wss;
};

module.exports = createShellWebSocketServer;
