import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBrain, faTerminal } from '@fortawesome/free-solid-svg-icons';

function FloatingTools({ onToggleTerminal, onToggleAIChat }) {
  return (
    <div className="floating-tools">
      <button
        className="tool-button"
        onClick={onToggleTerminal}
        aria-label="打开或关闭安全实验终端"
        title="终端"
      >
        <FontAwesomeIcon icon={faTerminal} className="text-xl" />
      </button>
      <button
        className="tool-button"
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
