import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCheck,
  faCircleExclamation,
  faCloudArrowDown,
  faServer,
  faSpinner,
} from '@fortawesome/free-solid-svg-icons';

const TargetStatusTab = ({
  dockerError,
  dockerInstalled,
  installResult,
  installing,
  loading,
  onInstallDefaults,
  stats,
}) => (
  <div className="target-status-panel">
    <section className={`connection-panel ${dockerInstalled ? 'connected' : ''}`}>
      <span className="connection-icon">
        <FontAwesomeIcon icon={loading ? faSpinner : faServer} className={loading ? 'animate-spin' : ''} />
      </span>
      <div>
        <p>Docker 服务</p>
        <h3>{loading ? '正在检测连接' : dockerInstalled ? '已连接并可用' : '当前不可用'}</h3>
        <small>{dockerInstalled ? '可以安装和启动本地靶场' : dockerError || '等待检测本地 Docker 服务'}</small>
      </div>
      {!loading && (
        <span className={`connection-badge ${dockerInstalled ? 'online' : ''}`}>
          {dockerInstalled ? <FontAwesomeIcon icon={faCheck} /> : <FontAwesomeIcon icon={faCircleExclamation} />}
          {dockerInstalled ? '正常' : '异常'}
        </span>
      )}
    </section>

    <section className="install-summary">
      <div className="section-heading compact">
        <div>
          <p className="section-kicker">本机镜像</p>
          <h3>靶场安装情况</h3>
        </div>
        <strong>{stats.installedCount} / {stats.totalEnvironments}</strong>
      </div>
      <div className="progress-track" aria-label="靶场安装进度" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow={stats.installPercent}>
        <span style={{ width: `${stats.installPercent}%` }} />
      </div>
      <div className="install-summary-footer">
        <span>{stats.installPercent}% 已安装</span>
        <button
          type="button"
          onClick={onInstallDefaults}
          disabled={installing || !dockerInstalled}
          className="button button-primary"
        >
          <FontAwesomeIcon icon={installing ? faSpinner : faCloudArrowDown} className={installing ? 'animate-spin' : ''} />
          {installing ? '正在安装' : '安装默认靶场'}
        </button>
      </div>
    </section>

    {installResult && (
      <div className={`settings-result ${installResult.error ? 'error' : 'success'}`} role="status">
        <FontAwesomeIcon icon={installResult.error ? faCircleExclamation : faCheck} />
        <div>
          <strong>{installResult.error ? '安装失败' : '安装处理完成'}</strong>
          <span>
            {installResult.error
              ? installResult.message
              : `已安装或确认 ${installResult.installed} 个环境${installResult.failed > 0 ? `，${installResult.failed} 个失败` : ''}`}
          </span>
        </div>
      </div>
    )}
  </div>
);

export default TargetStatusTab;
