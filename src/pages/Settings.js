import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRobot, faServer } from '@fortawesome/free-solid-svg-icons';
import AiSettingsPanel from '../components/settings/AiSettingsPanel';
import TargetSettings from '../components/TargetSettings';

function Settings() {
  const [activeTab, setActiveTab] = useState('ai');

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">系统设置</h1>

      <div className="flex border-b border-gray-700 mb-6">
        <button
          className={`py-2 px-4 ${activeTab === 'ai' ? 'text-blue-500 border-b-2 border-blue-500 -mb-px' : 'text-gray-400'}`}
          onClick={() => setActiveTab('ai')}
        >
          <FontAwesomeIcon icon={faRobot} className="mr-2" />
          AI助手设置
        </button>
        <button
          className={`py-2 px-4 ${activeTab === 'target' ? 'text-blue-500 border-b-2 border-blue-500 -mb-px' : 'text-gray-400'}`}
          onClick={() => setActiveTab('target')}
        >
          <FontAwesomeIcon icon={faServer} className="mr-2" />
          靶场环境设置
        </button>
      </div>

      {activeTab === 'ai' && <AiSettingsPanel />}
      {activeTab === 'target' && <TargetSettings />}
    </div>
  );
}

export default Settings;
