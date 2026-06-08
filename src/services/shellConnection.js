const DEFAULT_SHELL_PORT = '8080';
const RECONNECT_DELAY_MS = 2000;

const getShellWebSocketUrl = () => {
  if (process.env.REACT_APP_SHELL_WS_URL) {
    return process.env.REACT_APP_SHELL_WS_URL;
  }

  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const host = window.location.hostname;
  const port = window.location.port === '3000' || window.location.port === ''
    ? DEFAULT_SHELL_PORT
    : window.location.port;

  return `${protocol}//${host}:${port}/api/shell`;
};

class RealShellConnection {
  constructor(onMessage, onError, onClose) {
    this.onMessage = onMessage;
    this.onError = onError;
    this.onClose = onClose;
    this.websocket = null;
    this.connected = false;
    this.retryCount = 0;
    this.maxRetries = 3;
    this.reconnectTimeout = null;
    this.shouldReconnect = false;
  }

  connect() {
    try {
      this.shouldReconnect = true;
      const wsUrl = getShellWebSocketUrl();

      this.onMessage(`正在连接到Shell服务...(${wsUrl})`);
      this.websocket = new WebSocket(wsUrl);

      this.websocket.onopen = () => {
        this.connected = true;
        this.retryCount = 0;
        this.onMessage('连接成功! 安全隧道已建立');
        this.onMessage('输入 help 查看可用命令');
      };

      this.websocket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          if (data.type === 'output') {
            this.onMessage(data.content);
          } else if (data.type === 'error') {
            this.onError(data.content);
          }
        } catch (error) {
          this.onMessage(event.data);
        }
      };

      this.websocket.onerror = (error) => {
        console.error('WebSocket错误:', error);
        this.onError('连接错误：无法连接到Shell服务');
        this.reconnect();
      };

      this.websocket.onclose = () => {
        this.connected = false;
        this.onClose('Shell连接已关闭');

        if (this.shouldReconnect) {
          this.reconnect();
        }
      };
    } catch (error) {
      console.error('WebSocket初始化错误:', error);
      this.onError(`连接初始化失败: ${error.message}`);
    }
  }

  reconnect() {
    if (!this.shouldReconnect || this.reconnectTimeout) {
      return;
    }

    if (this.retryCount >= this.maxRetries) {
      this.onError(`连接失败，已尝试${this.maxRetries}次`);
      return;
    }

    this.retryCount += 1;
    this.onMessage(`尝试重新连接(${this.retryCount}/${this.maxRetries})...`);

    this.reconnectTimeout = setTimeout(() => {
      this.reconnectTimeout = null;
      this.connect();
    }, RECONNECT_DELAY_MS);
  }

  send(command) {
    if (!this.connected || !this.websocket) {
      this.onError('未连接到Shell服务');
      return;
    }

    try {
      this.websocket.send(JSON.stringify({
        type: 'command',
        content: command,
      }));
    } catch (error) {
      console.error('发送命令错误:', error);
      this.onError(`发送命令失败: ${error.message}`);
    }
  }

  disconnect() {
    this.shouldReconnect = false;

    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    if (!this.websocket) {
      this.connected = false;
      return;
    }

    if (this.websocket.readyState === WebSocket.OPEN) {
      try {
        this.websocket.send(JSON.stringify({
          type: 'command',
          content: 'exit',
        }));
      } catch (error) {
        console.error('发送退出命令失败:', error);
      }
    }

    try {
      this.websocket.close();
    } catch (error) {
      console.error('关闭WebSocket连接错误:', error);
    }

    this.websocket = null;
    this.connected = false;
  }
}

const createShellConnection = (onMessage, onError, onClose) => (
  Promise.resolve(new RealShellConnection(onMessage, onError, onClose))
);

export { getShellWebSocketUrl, RealShellConnection, createShellConnection };
