import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import App from './App';
import deepseekConfig from './config/ai';
import ErrorBoundary from './components/ErrorBoundary';
import { loadSavedAiConfig } from './services/aiConfigStorage';

// 初始化配置（从本地存储加载）
const savedConfig = loadSavedAiConfig(deepseekConfig);
if (savedConfig) {
  Object.assign(deepseekConfig, savedConfig);
  console.log('已加载DeepSeek API配置');
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>
);
