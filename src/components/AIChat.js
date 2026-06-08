import React, { useEffect, useRef, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBrain,
  faTimes,
  faPaperPlane,
  faRobot,
  faUser,
} from '@fortawesome/free-solid-svg-icons';

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

export default AIChat;
