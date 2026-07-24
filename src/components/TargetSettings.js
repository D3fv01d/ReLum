import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faSync
} from '@fortawesome/free-solid-svg-icons';
import {
  checkDockerInstalled,
  installDefaultTargets,
  getInstalledImages
} from '../services/targetService';
import {
  getFilteredEnvironmentGroups,
  getTargetEnvironmentStats,
} from '../utils/targetEnvironmentUtils';
import TargetEnvironmentsTab from './target/TargetEnvironmentsTab';
import TargetManagementTab from './target/TargetManagementTab';
import TargetStatusTab from './target/TargetStatusTab';

const TargetSettings = () => {
  const [loading, setLoading] = useState(false);
  const [installing, setInstalling] = useState(false);
  const [dockerInstalled, setDockerInstalled] = useState(null);
  const [dockerError, setDockerError] = useState(null);
  const [installedImages, setInstalledImages] = useState([]);
  const [installResult, setInstallResult] = useState(null);
  const [activeTab, setActiveTab] = useState('status');
  const [environmentQuery, setEnvironmentQuery] = useState('');

  const stats = useMemo(
    () => getTargetEnvironmentStats(installedImages),
    [installedImages]
  );

  const availableEnvironmentGroups = useMemo(
    () => getFilteredEnvironmentGroups(environmentQuery),
    [environmentQuery]
  );

  const filteredEnvironmentCount = useMemo(
    () => availableEnvironmentGroups.reduce((sum, group) => sum + group.sections.length, 0),
    [availableEnvironmentGroups]
  );

  // 检查Docker安装状态
  const checkDocker = useCallback(async () => {
    setLoading(true);
    setDockerError(null);

    try {
      const result = await checkDockerInstalled();
      setDockerInstalled(result.installed);
      if (!result.installed) {
        setDockerError('无法连接到 Docker 服务，请确认 Docker Desktop 已启动');
      }
    } catch (error) {
      setDockerError(error.message);
      setDockerInstalled(false);
    } finally {
      setLoading(false);
    }
  }, []);

  // 获取已安装的镜像
  const fetchInstalledImages = useCallback(async () => {
    try {
      const result = await getInstalledImages();
      if (result.images) {
        setInstalledImages(result.images);
      }
    } catch (error) {
      setInstalledImages([]);
    }
  }, []);

  // 安装默认靶场环境
  const handleInstallDefaults = async () => {
    setInstalling(true);
    setInstallResult(null);

    try {
      const result = await installDefaultTargets();
      setInstallResult(result);

      // 刷新已安装镜像列表
      await Promise.all([
        checkDocker(),
        fetchInstalledImages()
      ]);
    } catch (error) {
      setInstallResult({
        error: true,
        message: `安装失败: ${error.message}`
      });
    } finally {
      setInstalling(false);
    }
  };

  // 刷新状态
  const handleRefresh = async () => {
    await Promise.all([
      checkDocker(),
      fetchInstalledImages()
    ]);
  };

  // 初始化
  useEffect(() => {
    const init = async () => {
      await Promise.all([
        checkDocker(),
        fetchInstalledImages()
      ]);
    };

    init();
  }, [checkDocker, fetchInstalledImages]);

  return (
    <div className="settings-panel target-settings-panel">
      <div className="settings-panel-heading">
        <div>
          <p className="section-kicker">Docker</p>
          <h2>靶场环境</h2>
        </div>
        <button
          type="button"
          onClick={handleRefresh}
          className="button button-secondary button-small"
          disabled={loading}
        >
          <FontAwesomeIcon icon={faSync} className={loading ? 'animate-spin' : ''} />
          刷新
        </button>
      </div>

      <div className="settings-tabs" role="tablist" aria-label="靶场环境设置">
        <button
          type="button"
          className={activeTab === 'status' ? 'active' : ''}
          onClick={() => setActiveTab('status')}
        >
          系统状态
        </button>
        <button
          type="button"
          className={activeTab === 'environments' ? 'active' : ''}
          onClick={() => setActiveTab('environments')}
        >
          靶场环境
        </button>
        <button
          type="button"
          className={activeTab === 'settings' ? 'active' : ''}
          onClick={() => setActiveTab('settings')}
        >
          管理选项
        </button>
      </div>

      {activeTab === 'status' && (
        <TargetStatusTab
          dockerError={dockerError}
          dockerInstalled={dockerInstalled}
          installResult={installResult}
          installing={installing}
          loading={loading}
          onInstallDefaults={handleInstallDefaults}
          stats={stats}
        />
      )}

      {activeTab === 'environments' && (
        <TargetEnvironmentsTab
          availableEnvironmentGroups={availableEnvironmentGroups}
          environmentQuery={environmentQuery}
          filteredEnvironmentCount={filteredEnvironmentCount}
          installedImages={installedImages}
          onEnvironmentQueryChange={setEnvironmentQuery}
        />
      )}

      {activeTab === 'settings' && (
        <TargetManagementTab
          dockerInstalled={dockerInstalled}
          installing={installing}
          loading={loading}
          onInstallDefaults={handleInstallDefaults}
          onRefresh={handleRefresh}
        />
      )}
    </div>
  );
};

export default TargetSettings;
