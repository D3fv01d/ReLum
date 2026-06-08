import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBrain, faTerminal } from '@fortawesome/free-solid-svg-icons';

function FloatingTools({ onToggleTerminal, onToggleAIChat }) {
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

export default FloatingTools;
