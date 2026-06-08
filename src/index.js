import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import App from './App';
import deepseekConfig from './config/ai';
import ErrorBoundary from './components/ErrorBoundary';

// 初始化配置（从本地存储加载）
const savedConfig = localStorage.getItem('deepseekConfig');
if (savedConfig) {
  try {
    const parsedConfig = JSON.parse(savedConfig);
    Object.assign(deepseekConfig, parsedConfig);
    console.log('已加载DeepSeek API配置');
  } catch (error) {
    console.error('加载DeepSeek API配置失败:', error);
  }
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
