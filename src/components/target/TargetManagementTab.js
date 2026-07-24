import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCloudArrowDown, faRotate } from '@fortawesome/free-solid-svg-icons';

const TargetManagementTab = ({
  dockerInstalled,
  installing,
  loading,
  onInstallDefaults,
  onRefresh,
}) => (
  <div className="management-actions">
    <section>
      <div>
        <h3>安装默认靶场</h3>
        <p>拉取项目配置中标记为默认安装的 Docker 镜像。</p>
      </div>
      <button
        type="button"
        onClick={onInstallDefaults}
        disabled={installing || !dockerInstalled}
        className="button button-primary"
      >
        <FontAwesomeIcon icon={faCloudArrowDown} className={installing ? 'animate-spin' : ''} />
        {installing ? '正在安装' : '开始安装'}
      </button>
    </section>
    <section>
      <div>
        <h3>重新读取本机状态</h3>
        <p>刷新 Docker 连接和已安装镜像列表。</p>
      </div>
      <button type="button" className="button button-secondary" onClick={onRefresh} disabled={loading}>
        <FontAwesomeIcon icon={faRotate} className={loading ? 'animate-spin' : ''} />
        刷新状态
      </button>
    </section>
  </div>
);

export default TargetManagementTab;
