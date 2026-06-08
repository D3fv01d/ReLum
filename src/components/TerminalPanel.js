import React, { useState, useRef, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faTerminal,
  faBrain,
  faTimes,
  faChevronUp,
  faChevronDown,
  faGripLines,
  faPlayCircle,
  faStop,
  faSpinner,
  faExpand,
  faWindowRestore,
  faPaperPlane,
  faRobot,
  faUser
} from '@fortawesome/free-solid-svg-icons';
import { createShellConnection } from '../services/shellConnection';

const MAX_COMMAND_HISTORY = 50;

// AI对话组件
function AIChat({ showAIChat, setShowAIChat, position, onDragStart }) {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: '你好，我是ReLum AI助手。有任何关于网络安全的问题，请随时提问。' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // 导入AI服务
  const [aiService, setAiService] = useState(null);

  // 加载AI服务
  useEffect(() => {
    // 动态导入AI服务
    import('../services/aiService').then(module => {
      setAiService(module.default);
    }).catch(error => {
      console.error('加载AI服务失败:', error);
      setApiError('加载AI服务失败，请刷新页面重试');
    });
  }, []);

  // 自动滚动到对话底部
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // 自动聚焦输入框
  useEffect(() => {
    if (showAIChat && inputRef.current) {
      inputRef.current.focus();
    }
  }, [showAIChat]);

  // 处理消息发送
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    // 添加用户消息
    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setApiError(null);

    try {
      // 检查AI服务是否已加载
      if (!aiService) {
        throw new Error('AI服务尚未加载完成，请稍后再试');
      }

      // 准备消息历史
      const messageHistory = messages.concat(userMessage);

      // 调用AI服务发送请求
      const response = await aiService.sendMessage(messageHistory);

      // 添加AI响应到消息列表
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: response.content
      }]);
    } catch (error) {
      console.error('AI对话错误:', error);

      // 显示错误消息
      setApiError(error.message);

      // 添加错误消息到对话中
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `抱歉，发生了错误：${error.message}`
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="fixed bg-[#1E1E1E] shadow-2xl rounded-lg overflow-hidden flex flex-col z-40 border border-[#444]"
      style={{
        width: '350px',
        height: '500px',
        right: `${position.right}px`,
        top: `${position.top}px`,
      }}
    >
      {/* 对话框标题栏 */}
      <div
        className="flex items-center justify-between bg-[#2D2D2D] p-3 border-b border-[#444] cursor-move"
        onMouseDown={onDragStart}
      >
        <div className="flex items-center">
          <FontAwesomeIcon icon={faBrain} className="text-primary mr-2" />
          <div className="text-sm font-medium text-white">ReLum AI 安全助手</div>
        </div>
        <button
          className="text-gray-400 hover:text-white"
          onClick={() => setShowAIChat(false)}
          title="关闭对话"
          aria-label="关闭 AI 对话"
        >
          <FontAwesomeIcon icon={faTimes} />
        </button>
      </div>

      {/* 对话内容区域 */}
      <div className="flex-1 p-4 overflow-y-auto bg-[#1E1E1E]">
        {messages.map((message, index) => (
          <div key={index} className={`mb-4 ${message.role === 'user' ? 'flex justify-end' : 'flex justify-start'}`}>
            <div className={`rounded-lg p-3 max-w-[80%] ${
              message.role === 'user' ? 'bg-primary/20 text-white' : 'bg-[#2A2A2A] text-gray-200'
            }`}>
              <div className="flex items-center mb-1">
                <FontAwesomeIcon
                  icon={message.role === 'user' ? faUser : faRobot}
                  className={`mr-2 ${message.role === 'user' ? 'text-primary' : 'text-gray-400'}`}
                />
                <span className="text-xs font-medium">
                  {message.role === 'user' ? '您' : 'AI助手'}
                </span>
              </div>
              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start mb-4">
            <div className="bg-[#2A2A2A] rounded-lg p-3">
              <div className="flex items-center">
                <FontAwesomeIcon icon={faRobot} className="text-gray-400 mr-2" />
                <span className="text-xs font-medium">AI助手</span>
              </div>
              <div className="mt-2 flex items-center">
                <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce mx-1" style={{ animationDelay: '0.2s' }}></div>
                <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
          </div>
        )}
        {apiError && !isLoading && (
          <div className="bg-red-800/20 text-red-400 text-xs rounded p-2 mb-2">
            <p className="font-medium">错误:</p>
            <p>{apiError}</p>
            <p className="mt-1">请前往<a href="/settings" className="text-primary underline">设置页面</a>配置API</p>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* 输入区域 */}
      <form onSubmit={handleSendMessage} className="border-t border-[#444] p-3 bg-[#2D2D2D] flex">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 bg-[#1E1E1E] text-white p-2 rounded-l-md outline-none border border-[#444] border-r-0"
          placeholder="输入安全问题..."
          disabled={isLoading}
        />
        <button
          type="submit"
          className={`bg-primary px-3 rounded-r-md flex items-center justify-center ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-primary/90'}`}
          disabled={isLoading}
          aria-label="发送 AI 对话消息"
        >
          <FontAwesomeIcon icon={faPaperPlane} className="text-white" />
        </button>
      </form>
    </div>
  );
}

// 悬浮工具组件
export function FloatingTools({ onToggleTerminal, onToggleAIChat }) {
  return (
    <div className="fixed right-8 top-1/2 transform -translate-y-1/2 flex flex-col gap-4 z-10">
      <button
        className="bg-primary w-14 h-14 rounded-full flex items-center justify-center text-white shadow-lg hover:bg-primary/90 transition-all duration-200"
        onClick={onToggleTerminal}
        aria-label="打开或关闭安全实验终端"
        title="终端"
      >
        <FontAwesomeIcon icon={faTerminal} className="text-xl" />
      </button>
      <button
        className="bg-primary w-14 h-14 rounded-full flex items-center justify-center text-white shadow-lg hover:bg-primary/90 transition-all duration-200"
        onClick={onToggleAIChat}
        aria-label="打开或关闭 AI 安全助手"
        title="AI 助手"
      >
        <FontAwesomeIcon icon={faBrain} className="text-xl" />
      </button>
    </div>
  );
}

// 终端面板组件
export function TerminalPanel({ showTerminal, setShowTerminal }) {
  const [terminalInput, setTerminalInput] = useState('');
  const [terminalHeight, setTerminalHeight] = useState(288); // 72 * 4 = 288px (h-72)
  const [isDragging, setIsDragging] = useState(false);
  const [isFloating, setIsFloating] = useState(false); // 新增：是否悬浮模式
  const [floatingPosition, setFloatingPosition] = useState({ x: 100, y: 100 }); // 新增：悬浮窗位置
  const [draggingWindow, setDraggingWindow] = useState(false); // 新增：是否正在拖拽悬浮窗
  const dragStartY = useRef(0);
  const dragStartX = useRef(0); // 新增：拖拽悬浮窗的起始X坐标
  const startHeight = useRef(0);
  const startPosition = useRef({ x: 0, y: 0 }); // 新增：悬浮窗拖拽起始位置
  const terminalEndRef = useRef(null);
  const inputRef = useRef(null);
  const shellConnectionRef = useRef(null);
  const [shellActive, setShellActive] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const commandHistoryRef = useRef([]);
  const commandHistoryIndexRef = useRef(null);
  const floatingWidth = 600; // 悬浮窗宽度
  const floatingHeight = 400; // 悬浮窗高度

  const [terminalHistory, setTerminalHistory] = useState([
    { type: 'output', content: '欢迎使用 ReLum 安全实验终端!' },
    { type: 'output', content: '输入 help 查看可用命令' },
  ]);

  // 自动滚动到终端底部
  useEffect(() => {
    if (terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [terminalHistory]);

  // 自动聚焦输入框
  useEffect(() => {
    if (showTerminal && inputRef.current) {
      inputRef.current.focus();
    }
  }, [showTerminal]);

  // 组件卸载时断开连接
  useEffect(() => {
    return () => {
      if (shellConnectionRef.current) {
        shellConnectionRef.current.disconnect();
      }
    };
  }, []);

  // 处理拖拽开始（底部终端调整高度）
  const handleDragStart = (e) => {
    e.preventDefault();
    dragStartY.current = e.clientY;
    startHeight.current = terminalHeight;
    setIsDragging(true);
  };

  // 处理悬浮窗拖拽开始
  const handleFloatingDragStart = (e) => {
    if (isFloating) {
      e.preventDefault();
      dragStartX.current = e.clientX;
      dragStartY.current = e.clientY;
      startPosition.current = { ...floatingPosition };
      setDraggingWindow(true);
    }
  };

  // 处理拖拽移动
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isDragging) {
        // 调整底部终端高度
        const delta = dragStartY.current - e.clientY;
        const newHeight = Math.max(100, Math.min(window.innerHeight * 0.8, startHeight.current + delta));
        setTerminalHeight(newHeight);
      } else if (draggingWindow) {
        // 移动悬浮窗
        const deltaX = e.clientX - dragStartX.current;
        const deltaY = e.clientY - dragStartY.current;

        // 确保悬浮窗不会被拖出屏幕
        const newX = Math.max(0, Math.min(window.innerWidth - floatingWidth, startPosition.current.x + deltaX));
        const newY = Math.max(0, Math.min(window.innerHeight - floatingHeight, startPosition.current.y + deltaY));

        setFloatingPosition({ x: newX, y: newY });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setDraggingWindow(false);
    };

    if (isDragging || draggingWindow) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, draggingWindow, floatingWidth]);

  // 切换悬浮模式
  const toggleFloatingMode = () => {
    setIsFloating(!isFloating);

    // 如果切换到悬浮模式，设置初始位置在屏幕中央
    if (!isFloating) {
      const x = Math.max(0, (window.innerWidth - floatingWidth) / 2);
      const y = Math.max(0, (window.innerHeight - floatingHeight) / 2);
      setFloatingPosition({ x, y });
    }
  };

  // 连接本地Shell
  const connectShell = () => {
    if (shellActive || isConnecting) return;

    setIsConnecting(true);
    setTerminalHistory(prev => [...prev, { type: 'output', content: '正在尝试连接到Shell服务...' }]);

    // 创建Shell连接
    createShellConnection(
      // 收到消息
      (message) => {
        setTerminalHistory(prev => [...prev, { type: 'output', content: message }]);
      },
      // 错误处理
      (error) => {
        setTerminalHistory(prev => [...prev, { type: 'output', content: error, error: true }]);
        setIsConnecting(false);
      },
      // 连接关闭
      (message) => {
        setTerminalHistory(prev => [...prev, { type: 'output', content: message }]);
        setShellActive(false);
        setIsConnecting(false);
      }
    ).then(connection => {
      shellConnectionRef.current = connection;
      connection.connect();
      setShellActive(true);
      setIsConnecting(false);
    }).catch(error => {
      setTerminalHistory(prev => [...prev, {
        type: 'output',
        content: `Shell连接初始化失败: ${error.message}`,
        error: true
      }]);
      setIsConnecting(false);
    });
  };

  // 断开Shell连接
  const disconnectShell = () => {
    if (!shellActive || !shellConnectionRef.current) return;

    shellConnectionRef.current.disconnect();
    shellConnectionRef.current = null;
  };

  const rememberCommand = (command) => {
    const history = commandHistoryRef.current;

    if (history[history.length - 1] !== command) {
      commandHistoryRef.current = [...history, command].slice(-MAX_COMMAND_HISTORY);
    }

    commandHistoryIndexRef.current = null;
  };

  const handleTerminalInputChange = (e) => {
    setTerminalInput(e.target.value);
  };

  const handleTerminalKeyDown = (e) => {
    const history = commandHistoryRef.current;
    const currentValue = e.currentTarget.value.trim();
    const currentHistoryIndex = commandHistoryIndexRef.current ??
      (currentValue ? history.lastIndexOf(currentValue) : null);

    if (e.key === 'ArrowUp' && history.length > 0) {
      e.preventDefault();
      const nextIndex = currentHistoryIndex === null || currentHistoryIndex === -1
        ? history.length - 1
        : Math.max(0, currentHistoryIndex - 1);

      commandHistoryIndexRef.current = nextIndex;
      setTerminalInput(history[nextIndex] || '');
      return;
    }

    if (e.key === 'ArrowDown' && currentHistoryIndex !== null && currentHistoryIndex !== -1) {
      e.preventDefault();
      const nextIndex = currentHistoryIndex + 1;

      if (nextIndex >= history.length) {
        commandHistoryIndexRef.current = null;
        setTerminalInput('');
        return;
      }

      commandHistoryIndexRef.current = nextIndex;
      setTerminalInput(history[nextIndex] || '');
    }

    if (e.key !== 'ArrowUp' && e.key !== 'ArrowDown') {
      commandHistoryIndexRef.current = null;
    }
  };

  // 处理命令提交
  const handleTerminalSubmit = (e) => {
    e.preventDefault();
    const command = terminalInput.trim();
    if (!command) return;

    rememberCommand(command);

    // 添加用户输入到历史记录
    setTerminalHistory(prev => [...prev, { type: 'input', content: command }]);

    // 如果Shell连接活跃，发送命令到Shell
    if (shellActive && shellConnectionRef.current) {
      // 特殊处理clear命令
      if (command.toLowerCase() === 'clear') {
        // 清空历史记录，只保留一个清除成功的消息
        setTimeout(() => {
          setTerminalHistory([
            { type: 'output', content: '终端已清除' },
          ]);
        }, 100);
      }
      // 发送到shell
      shellConnectionRef.current.send(command);
    } else {
      // 未连接时只处理少数基本命令
      if (command.toLowerCase() === 'help') {
        setTerminalHistory(prev => [...prev, {
          type: 'output',
          content: '可用命令:\n- help: 显示帮助信息\n- clear: 清除终端\n- shell: 连接到Shell服务'
        }]);
      } else if (command.toLowerCase() === 'clear') {
        setTerminalHistory([
          { type: 'output', content: '终端已清除' },
        ]);
      } else if (command.toLowerCase() === 'shell') {
        connectShell();
      } else {
        setTerminalHistory(prev => [...prev, {
          type: 'output',
          content: '请先连接到Shell服务。输入 shell 命令建立连接。'
        }]);
      }
    }

    // 清空输入框
    setTerminalInput('');
  };

  // 处理终端点击事件，聚焦输入
  const handleTerminalClick = () => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  // 渲染悬浮模式的终端
  if (isFloating && showTerminal) {
    return (
      <div
        className="fixed bg-[#1E1E1E] shadow-2xl rounded-lg overflow-hidden flex flex-col z-40 border border-[#444]"
        style={{
          width: `${floatingWidth}px`,
          height: `${floatingHeight}px`,
          left: `${floatingPosition.x}px`,
          top: `${floatingPosition.y}px`,
        }}
      >
        {/* 悬浮窗标题栏 */}
        <div
          className="flex items-center justify-between bg-[#2D2D2D] p-2 border-b border-[#444] cursor-move"
          onMouseDown={handleFloatingDragStart}
        >
          <div className="flex items-center space-x-2">
            <FontAwesomeIcon icon={faTerminal} className="text-primary mr-2" />
            <div className="text-sm font-medium text-white">ReLum 安全实验终端</div>

            {/* Shell控制按钮 */}
            {isConnecting ? (
              <div className="ml-4 bg-yellow-600 text-white text-xs px-2 py-1 rounded flex items-center">
                <FontAwesomeIcon icon={faSpinner} className="mr-1 animate-spin" />
                正在连接...
              </div>
            ) : shellActive ? (
              <button
                className="ml-4 bg-red-600 hover:bg-red-700 text-white text-xs px-2 py-1 rounded flex items-center"
                onClick={disconnectShell}
              >
                <FontAwesomeIcon icon={faStop} className="mr-1" />
                断开Shell
              </button>
            ) : (
              <button
                className="ml-4 bg-green-600 hover:bg-green-700 text-white text-xs px-2 py-1 rounded flex items-center"
                onClick={connectShell}
              >
                <FontAwesomeIcon icon={faPlayCircle} className="mr-1" />
                连接Shell
              </button>
            )}

            {shellActive && (
              <div className="ml-2 flex items-center">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse mr-1"></div>
                <span className="text-green-400 text-xs">已连接</span>
              </div>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <button
              className="text-gray-400 hover:text-white"
              onClick={toggleFloatingMode}
              title="固定到底部"
              aria-label="固定终端到底部"
            >
              <FontAwesomeIcon icon={faWindowRestore} />
            </button>
            <button
              className="text-gray-400 hover:text-white"
              onClick={() => setShowTerminal(false)}
              title="关闭终端"
              aria-label="关闭终端"
            >
              <FontAwesomeIcon icon={faTimes} />
            </button>
          </div>
        </div>

        {/* 终端内容区域 */}
        <div
          className="flex-1 p-3 overflow-y-auto font-mono text-sm text-gray-300 bg-[#1E1E1E]"
          onClick={handleTerminalClick}
        >
          {terminalHistory.map((entry, index) => (
            <div key={index} className={`mb-1 ${entry.type === 'input' ? 'text-gray-300' : entry.error ? 'text-red-400' : 'text-green-400'}`}>
              {entry.type === 'input' ? (
                <div className="font-mono text-sm tracking-wide">
                  <span className="text-primary mr-1">$</span> {entry.content}
                </div>
              ) : (
                <div className="font-mono text-sm tracking-wide" style={{ whiteSpace: 'pre-line' }}>{entry.content}</div>
              )}
            </div>
          ))}

          {/* 当前输入行 */}
          <form onSubmit={handleTerminalSubmit} className="flex items-start mb-1">
            <span className="text-primary mr-2 font-mono">$</span>
            <input
              ref={inputRef}
              type="text"
              value={terminalInput}
              onChange={handleTerminalInputChange}
              onKeyDown={handleTerminalKeyDown}
              className="flex-1 bg-transparent outline-none text-white font-mono text-sm tracking-wide border-none p-0 m-0"
              autoFocus
            />
          </form>
          <div ref={terminalEndRef} />
        </div>
      </div>
    );
  }

  // 正常底部终端
  return (
    <div
      className={`fixed bottom-0 left-0 right-0 bg-[#1E1E1E] shadow-lg transition-all duration-300 z-30 ${showTerminal ? '' : 'h-0'} overflow-hidden flex flex-col`}
      style={{ height: showTerminal ? `${terminalHeight}px` : '0px' }}
    >
      {/* 拖拽手柄 */}
      <div
        className="absolute top-0 left-0 right-0 h-1 bg-primary cursor-ns-resize z-10 flex justify-center items-center"
        onMouseDown={handleDragStart}
      >
        <div className="w-20 h-1 bg-primary rounded-full"></div>
      </div>

      <div className="flex items-center justify-between bg-[#2D2D2D] p-2 border-b border-[#444]">
        <div className="flex items-center space-x-2">
          <div className="text-sm font-medium text-white">ReLum 安全实验终端</div>
          <FontAwesomeIcon icon={faGripLines} className="text-gray-500 ml-2 cursor-move" onMouseDown={handleDragStart} />

          {/* Shell控制按钮 */}
          {isConnecting ? (
            <div className="ml-4 bg-yellow-600 text-white text-xs px-2 py-1 rounded flex items-center">
              <FontAwesomeIcon icon={faSpinner} className="mr-1 animate-spin" />
              正在连接...
            </div>
          ) : shellActive ? (
            <button
              className="ml-4 bg-red-600 hover:bg-red-700 text-white text-xs px-2 py-1 rounded flex items-center"
              onClick={disconnectShell}
            >
              <FontAwesomeIcon icon={faStop} className="mr-1" />
              断开Shell
            </button>
          ) : (
            <button
              className="ml-4 bg-green-600 hover:bg-green-700 text-white text-xs px-2 py-1 rounded flex items-center"
              onClick={connectShell}
            >
              <FontAwesomeIcon icon={faPlayCircle} className="mr-1" />
              连接Shell
            </button>
          )}

          {shellActive && (
            <div className="ml-2 flex items-center">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse mr-1"></div>
              <span className="text-green-400 text-xs">已连接</span>
            </div>
          )}
        </div>
        <div className="flex items-center space-x-2">
          {/* 新增悬浮模式按钮 */}
          <button
            className="text-gray-400 hover:text-white"
            onClick={toggleFloatingMode}
            title="弹出终端"
            aria-label="弹出终端"
          >
            <FontAwesomeIcon icon={faExpand} />
          </button>
          <button
            className="text-gray-400 hover:text-white"
            onClick={() => setShowTerminal(prev => !prev)}
            aria-label={showTerminal ? '收起终端' : '展开终端'}
            title={showTerminal ? '收起终端' : '展开终端'}
          >
            <FontAwesomeIcon icon={showTerminal ? faChevronDown : faChevronUp} />
          </button>
          <button
            className="text-gray-400 hover:text-white"
            onClick={() => setShowTerminal(false)}
            aria-label="关闭终端"
            title="关闭终端"
          >
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>
      </div>

      <div
        className="flex-1 p-3 overflow-y-auto font-mono text-sm text-gray-300 bg-[#1E1E1E]"
        onClick={handleTerminalClick}
      >
        {terminalHistory.map((entry, index) => (
          <div key={index} className={`mb-1 ${entry.type === 'input' ? 'text-gray-300' : entry.error ? 'text-red-400' : 'text-green-400'}`}>
            {entry.type === 'input' ? (
              <div className="font-mono text-sm tracking-wide">
                <span className="text-primary mr-1">$</span> {entry.content}
              </div>
            ) : (
              <div className="font-mono text-sm tracking-wide" style={{ whiteSpace: 'pre-line' }}>{entry.content}</div>
            )}
          </div>
        ))}

        {/* 当前输入行 */}
        <form onSubmit={handleTerminalSubmit} className="flex items-start mb-1">
          <span className="text-primary mr-2 font-mono">$</span>
          <input
            ref={inputRef}
            type="text"
            value={terminalInput}
            onChange={handleTerminalInputChange}
            onKeyDown={handleTerminalKeyDown}
            className="flex-1 bg-transparent outline-none text-white font-mono text-sm tracking-wide border-none p-0 m-0"
            autoFocus
          />
        </form>
        <div ref={terminalEndRef} />
      </div>
    </div>
  );
}

// 导出一个组合组件，方便在页面中使用
export default function TerminalFeature() {
  const [showTerminal, setShowTerminal] = useState(false);
  const [showAIChat, setShowAIChat] = useState(false);
  const [aiChatPosition, setAiChatPosition] = useState({ right: 100, top: 80 });
  const [isDraggingAIChat, setIsDraggingAIChat] = useState(false);
  const dragStartPos = useRef({ x: 0, y: 0 });
  const startPos = useRef({ right: 0, top: 0 });

  // 切换终端显示
  const toggleTerminal = () => {
    setShowTerminal(prev => !prev);
  };

  // 切换AI对话显示
  const toggleAIChat = () => {
    setShowAIChat(prev => !prev);
  };

  // 处理AI对话框拖拽
  const handleAIChatDragStart = (e) => {
    e.preventDefault();
    setIsDraggingAIChat(true);
    dragStartPos.current = { x: e.clientX, y: e.clientY };
    startPos.current = { ...aiChatPosition };
  };

  // 处理拖拽移动
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isDraggingAIChat) {
        const deltaX = dragStartPos.current.x - e.clientX;
        const deltaY = e.clientY - dragStartPos.current.y;

        // 计算新位置，确保不超出屏幕
        const newRight = Math.max(10, Math.min(window.innerWidth - 100, startPos.current.right + deltaX));
        const newTop = Math.max(10, Math.min(window.innerHeight - 200, startPos.current.top + deltaY));

        setAiChatPosition({ right: newRight, top: newTop });
      }
    };

    const handleMouseUp = () => {
      setIsDraggingAIChat(false);
    };

    if (isDraggingAIChat) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDraggingAIChat]);

  return (
    <>
      <FloatingTools onToggleTerminal={toggleTerminal} onToggleAIChat={toggleAIChat} />
      <TerminalPanel showTerminal={showTerminal} setShowTerminal={setShowTerminal} />
      {showAIChat && (
        <AIChat
          showAIChat={showAIChat}
          setShowAIChat={setShowAIChat}
          position={aiChatPosition}
          onDragStart={handleAIChatDragStart}
        />
      )}
    </>
  );
}
