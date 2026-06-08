import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faDownload,
  faSync,
} from '@fortawesome/free-solid-svg-icons';

const TargetManagementTab = ({
  dockerInstalled,
  installing,
  loading,
  onInstallDefaults,
  onRefresh,
}) => (
  <div>
    <div className="bg-gray-700 p-4 rounded-lg mb-4">
      <h3 className="text-lg font-semibold text-white mb-3">安装与管理</h3>

      <div className="space-y-3">
        <button
          onClick={onInstallDefaults}
          disabled={installing || !dockerInstalled}
          className={`w-full px-4 py-2 rounded flex items-center justify-center ${
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
              安装所有默认靶场环境
            </>
          )}
        </button>

        <button
          className="w-full px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-500 flex items-center justify-center"
          onClick={onRefresh}
          disabled={loading}
        >
          <FontAwesomeIcon icon={faSync} className={`mr-2 ${loading ? 'animate-spin' : ''}`} />
          刷新靶场状态
        </button>
      </div>
    </div>

    <div className="bg-gray-700 p-4 rounded-lg">
      <h3 className="text-lg font-semibold text-white mb-3">使用说明</h3>

      <div className="text-gray-300 space-y-2 text-sm">
        <p>
          靶场环境采用Docker容器技术，提供独立且安全的实验环境。每个知识点对应一个专门的靶场环境，便于您进行实践操作。
        </p>
        <div>
          <span className="font-semibold text-white">使用方法：</span>
          <ol className="list-decimal list-inside ml-2 mt-1 space-y-1">
            <li>确保您的系统已安装Docker并启动Docker服务</li>
            <li>点击"安装所有默认靶场环境"下载基础靶场</li>
            <li>在知识库页面中，点击对应章节的实验按钮启动环境</li>
            <li>如果环境未安装，系统会自动下载并启动</li>
          </ol>
        </div>
        <div>
          <span className="font-semibold text-white">注意事项：</span>
          <ul className="list-disc list-inside ml-2 mt-1 space-y-1">
            <li>靶场环境将使用本地硬盘空间和系统资源</li>
            <li>默认靶场环境大约需要1-2GB存储空间</li>
            <li>请在实验完成后关闭不需要的环境以释放系统资源</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
);

export default TargetManagementTab;
