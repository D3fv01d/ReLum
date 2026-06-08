import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCheckCircle,
  faDownload,
  faExclamationTriangle,
  faServer,
  faSync,
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
  <div>
    <div className="mb-6 bg-gray-700 p-4 rounded-lg">
      <div className="flex items-center mb-4">
        <FontAwesomeIcon
          icon={faServer}
          className={`mr-2 text-xl ${dockerInstalled ? 'text-green-400' : 'text-red-400'}`}
        />
        <h3 className="text-lg font-semibold text-white">Docker状态</h3>
      </div>

      {loading ? (
        <div className="flex items-center text-gray-300">
          <FontAwesomeIcon icon={faSync} className="animate-spin mr-2" />
          检查中...
        </div>
      ) : dockerInstalled === null ? (
        <div className="text-gray-300">未检查Docker状态</div>
      ) : dockerInstalled ? (
        <div className="flex items-center text-green-400">
          <FontAwesomeIcon icon={faCheckCircle} className="mr-2" />
          Docker已正确安装并运行
        </div>
      ) : (
        <div>
          <div className="flex items-center text-red-400 mb-2">
            <FontAwesomeIcon icon={faExclamationTriangle} className="mr-2" />
            Docker未安装或无法访问
          </div>
          {dockerError && (
            <div className="text-gray-300 text-sm mt-1 bg-gray-800 p-2 rounded">
              错误: {dockerError}
            </div>
          )}
          <div className="mt-2 text-gray-300 text-sm">
            <p>请确保：</p>
            <ol className="list-decimal ml-5 mt-1 space-y-1">
              <li>Docker已正确安装</li>
              <li>Docker服务已启动并运行</li>
              <li>当前用户有权限访问Docker</li>
            </ol>
            <p className="mt-1">然后点击"刷新状态"按钮重试。</p>
          </div>
        </div>
      )}
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
      <div className="bg-gray-700 p-4 rounded-lg">
        <h3 className="text-lg font-semibold text-white mb-3">靶场环境</h3>
        <div className="flex justify-between items-center">
          <span className="text-gray-300">已安装:</span>
          <span className="text-white">{stats.installedCount} / {stats.totalEnvironments}</span>
        </div>
        <div className="w-full bg-gray-600 rounded-full h-2 mt-2">
          <div
            className="bg-blue-500 h-2 rounded-full"
            style={{ width: `${stats.installPercent}%` }}
          />
        </div>
        <div className="mt-2 text-xs text-gray-400 text-right">{stats.installPercent}%</div>
      </div>

      <div className="bg-gray-700 p-4 rounded-lg">
        <h3 className="text-lg font-semibold text-white mb-3">存储空间</h3>
        <div className="flex justify-between items-center">
          <span className="text-gray-300">已使用:</span>
          <span className="text-white">{stats.installedSize} MB / ~{stats.totalSize} MB</span>
        </div>
        <div className="w-full bg-gray-600 rounded-full h-2 mt-2">
          <div
            className="bg-green-500 h-2 rounded-full"
            style={{ width: `${stats.installPercent}%` }}
          />
        </div>
        <div className="mt-2 text-xs text-gray-400">{stats.installedSize} MB 已使用</div>
      </div>
    </div>

    <div className="bg-gray-700 p-4 rounded-lg">
      <h3 className="text-lg font-semibold text-white mb-3">一键管理</h3>

      <button
        onClick={onInstallDefaults}
        disabled={installing || !dockerInstalled}
        className={`px-4 py-2 rounded flex items-center ${
          dockerInstalled ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-gray-600 text-gray-400 cursor-not-allowed'
        }`}
      >
        {installing ? (
          <>
            <FontAwesomeIcon icon={faSync} className="animate-spin mr-2" />
            安装中...
          </>
        ) : (
          <>
            <FontAwesomeIcon icon={faDownload} className="mr-2" />
            一键安装默认靶场环境
          </>
        )}
      </button>

      {!dockerInstalled && (
        <div className="mt-2 text-yellow-400 text-sm">
          <FontAwesomeIcon icon={faExclamationTriangle} className="mr-1" />
          请先安装Docker才能安装靶场环境
        </div>
      )}

      {installResult && (
        <div className={`mt-4 p-3 rounded ${installResult.error ? 'bg-red-900/30 text-red-300' : 'bg-green-900/30 text-green-300'}`}>
          <div className="font-semibold mb-1 flex items-center">
            <FontAwesomeIcon
              icon={installResult.error ? faExclamationTriangle : faCheckCircle}
              className="mr-2"
            />
            {installResult.error ? '安装过程出现错误' : '安装处理完成'}
          </div>
          {installResult.error ? (
            <div>{installResult.message}</div>
          ) : (
            <div>
              <div>成功安装/确认: {installResult.installed} 个环境</div>
              {installResult.failed > 0 && (
                <div>安装失败: {installResult.failed} 个环境</div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  </div>
);

export default TargetStatusTab;
