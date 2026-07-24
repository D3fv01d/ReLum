import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRobot, faServer } from '@fortawesome/free-solid-svg-icons';
import AiSettingsPanel from '../components/settings/AiSettingsPanel';
import TargetSettings from '../components/TargetSettings';

function Settings() {
  const [activeTab, setActiveTab] = useState('target');

  return (
    <main className="app-page settings-page">
      <header className="page-heading">
        <div>
          <p className="page-eyebrow">本地配置</p>
          <h1>设置</h1>
          <p>管理 Docker 靶场与 AI 服务连接。修改会写入本机配置。</p>
        </div>
      </header>

      <div className="settings-layout">
        <nav className="settings-nav" aria-label="设置分类">
          <button
            type="button"
            className={activeTab === 'target' ? 'active' : ''}
            onClick={() => setActiveTab('target')}
          >
            <FontAwesomeIcon icon={faServer} />
            <span><strong>靶场环境</strong><small>Docker 与镜像</small></span>
          </button>
          <button
            type="button"
            className={activeTab === 'ai' ? 'active' : ''}
            onClick={() => setActiveTab('ai')}
          >
            <FontAwesomeIcon icon={faRobot} />
            <span><strong>AI 服务</strong><small>云端与本地模型</small></span>
          </button>
        </nav>

        <section className="settings-content">
          {activeTab === 'target' ? <TargetSettings /> : <AiSettingsPanel />}
        </section>
      </div>
    </main>
  );
}

export default Settings;
