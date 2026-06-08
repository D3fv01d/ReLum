import React, { useEffect, useRef, useState } from 'react';
import AIChat from './AIChat';
import FloatingTools from './FloatingTools';
import { TerminalPanel } from './TerminalPanel';

function TerminalFeature() {
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

export default TerminalFeature;
