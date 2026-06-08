import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faDownload,
  faServer,
  faExclamationTriangle,
  faCheckCircle,
  faSync
} from '@fortawesome/free-solid-svg-icons';
import {
  checkDockerInstalled,
  installDefaultTargets,
  getInstalledImages
} from '../services/targetService';
import { targetEnvironments } from '../config/targetEnvironments';

const TargetSettings = () => {
  const [loading, setLoading] = useState(false);
  const [installing, setInstalling] = useState(false);
  const [dockerInstalled, setDockerInstalled] = useState(null);
  const [dockerError, setDockerError] = useState(null);
  const [installedImages, setInstalledImages] = useState([]);
  const [installResult, setInstallResult] = useState(null);
  const [activeTab, setActiveTab] = useState('status');

  // 计算统计信息
  const getStats = () => {
    // 计算环境总数量
    let totalEnvironments = 0;
    let totalSize = 0;
    Object.keys(targetEnvironments).forEach(category => {
      const sections = targetEnvironments[category].sections;
      if (sections) {
        totalEnvironments += Object.keys(sections).length;

        // 估算大小（每个镜像约100MB）
        totalSize += Object.keys(sections).length * 100;
      }
    });

    // 计算已安装的环境
    const installedCount = installedImages.length;
    const installedSize = installedCount * 100; // 估算已安装大小

    return {
      totalEnvironments,
      totalSize,
      installedCount,
      installedSize,
      installPercent: totalEnvironments ? Math.round((installedCount / totalEnvironments) * 100) : 0
    };
  };

  // 检查Docker安装状态
  const checkDocker = async () => {
    setLoading(true);
    setDockerError(null);

    try {
      const result = await checkDockerInstalled();
      setDockerInstalled(result.installed);
      if (!result.installed) {
        setDockerError(result.error || result.message || '无法连接到Docker服务');
      }
    } catch (error) {
      setDockerError(error.message);
      setDockerInstalled(false);
    } finally {
      setLoading(false);
    }
  };

  // 获取已安装的镜像
  const fetchInstalledImages = async () => {
    try {
      const result = await getInstalledImages();
      if (result.images) {
        setInstalledImages(result.images);
      }
    } catch (error) {
      console.error('获取已安装镜像失败:', error);
    }
  };

  // 安装默认靶场环境
  const handleInstallDefaults = async () => {
    setInstalling(true);
    setInstallResult(null);

    try {
      const result = await installDefaultTargets();
      setInstallResult(result);

      // 刷新已安装镜像列表
      await fetchInstalledImages();
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
    await checkDocker();
    await fetchInstalledImages();
  };

  // 初始化
  useEffect(() => {
    const init = async () => {
      await checkDocker();
      await fetchInstalledImages();
    };

    init();
  }, []);

  const stats = getStats();

  return (
    <div className="bg-gray-800 rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">靶场环境管理</h2>
        <button
          onClick={handleRefresh}
          className="px-3 py-1 bg-gray-700 text-white rounded hover:bg-gray-600 flex items-center"
          disabled={loading}
        >
          <FontAwesomeIcon icon={faSync} className={`mr-2 ${loading ? 'animate-spin' : ''}`} />
          刷新状态
        </button>
      </div>

      {/* 导航选项卡 */}
      <div className="flex mb-4 border-b border-gray-700">
        <button
          className={`px-4 py-2 ${activeTab === 'status' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400'}`}
          onClick={() => setActiveTab('status')}
        >
          系统状态
        </button>
        <button
          className={`px-4 py-2 ${activeTab === 'environments' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400'}`}
          onClick={() => setActiveTab('environments')}
        >
          靶场环境
        </button>
        <button
          className={`px-4 py-2 ${activeTab === 'settings' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400'}`}
          onClick={() => setActiveTab('settings')}
        >
          管理选项
        </button>
      </div>

      {/* 各个选项卡的内容 */}
      {activeTab === 'status' && (
        <div>
          {/* Docker状态信息和统计信息 */}
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

          {/* 安装统计 */}
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
                ></div>
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
                ></div>
              </div>
              <div className="mt-2 text-xs text-gray-400">{stats.installedSize} MB 已使用</div>
            </div>
          </div>

          {/* 安装操作 */}
          <div className="bg-gray-700 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-white mb-3">一键管理</h3>

            <button
              onClick={handleInstallDefaults}
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
      )}

      {activeTab === 'environments' && (
        <div>
          <div className="mb-4">
            <div className="text-white mb-2">已安装靶场环境</div>

            {installedImages.length === 0 ? (
              <div className="bg-gray-700 p-4 rounded text-gray-300">
                尚未安装任何靶场环境。请前往"管理选项"安装靶场环境。
              </div>
            ) : (
              <div className="bg-gray-700 rounded overflow-hidden">
                <table className="min-w-full divide-y divide-gray-600">
                  <thead className="bg-gray-800">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">题目名称</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">镜像名称</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">状态</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-600">
                    {installedImages.map((image, index) => {
                      // 处理image可能是对象或字符串的情况
                      const imageName = typeof image === 'string'
                        ? image
                        : (image.fullName || `${image.repository || '未知'}:${image.tag || 'latest'}`);

                      // 查找对应的题目名称
                      let exerciseName = "未知题目";
                      // 遍历所有靶场类别和题目，找到使用该镜像的题目
                      Object.keys(targetEnvironments).forEach(category => {
                        const sections = targetEnvironments[category].sections || {};
                        Object.keys(sections).forEach(sectionName => {
                          if (sections[sectionName].dockerImage === imageName) {
                            exerciseName = `${sectionName} (${category})`;
                          }
                        });
                      });

                      return (
                        <tr key={index} className={index % 2 === 0 ? 'bg-gray-700' : 'bg-gray-750'}>
                          <td className="px-4 py-3 text-sm text-white">{exerciseName}</td>
                          <td className="px-4 py-3 text-sm text-gray-400">{imageName}</td>
                          <td className="px-4 py-3 text-sm">
                            <span className="px-2 py-1 text-xs rounded-full bg-green-900 text-green-300">
                              已安装
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div>
            <div className="text-white mb-2">可用靶场环境</div>
            <div className="space-y-4">
              {Object.keys(targetEnvironments).map(category => (
                <div key={category} className="bg-gray-700 p-4 rounded">
                  <h3 className="text-lg font-semibold text-white mb-3 capitalize">
                    {category.replace(/-/g, ' ')} 靶场
                  </h3>

                  <div className="space-y-2">
                    {Object.keys(targetEnvironments[category].sections || {}).map(sectionName => {
                      const target = targetEnvironments[category].sections[sectionName];
                      // 检查镜像是否已安装，处理不同格式的镜像名称
                      const isInstalled = installedImages.some(image => {
                        if (typeof image === 'string') {
                          return image === target.dockerImage;
                        } else {
                          return image.fullName === target.dockerImage ||
                                 `${image.repository}:${image.tag}` === target.dockerImage;
                        }
                      });

                      return (
                        <div key={sectionName} className="flex justify-between items-center p-2 bg-gray-800 rounded">
                          <div>
                            <div className="text-white">{sectionName}</div>
                            <div className="text-gray-400 text-xs">{target.dockerImage}</div>
                          </div>
                          <div>
                            {isInstalled ? (
                              <span className="px-2 py-1 text-xs rounded-full bg-green-900 text-green-300">
                                已安装
                              </span>
                            ) : (
                              <span className="px-2 py-1 text-xs rounded-full bg-gray-600 text-gray-300">
                                未安装
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'settings' && (
        <div>
          <div className="bg-gray-700 p-4 rounded-lg mb-4">
            <h3 className="text-lg font-semibold text-white mb-3">安装与管理</h3>

            <div className="space-y-3">
              <button
                onClick={handleInstallDefaults}
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
                onClick={handleRefresh}
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
              <p>
                <span className="font-semibold text-white">使用方法：</span>
                <ol className="list-decimal list-inside ml-2 mt-1 space-y-1">
                  <li>确保您的系统已安装Docker并启动Docker服务</li>
                  <li>点击"安装所有默认靶场环境"下载基础靶场</li>
                  <li>在知识库页面中，点击对应章节的实验按钮启动环境</li>
                  <li>如果环境未安装，系统会自动下载并启动</li>
                </ol>
              </p>
              <p>
                <span className="font-semibold text-white">注意事项：</span>
                <ul className="list-disc list-inside ml-2 mt-1 space-y-1">
                  <li>靶场环境将使用本地硬盘空间和系统资源</li>
                  <li>默认靶场环境大约需要1-2GB存储空间</li>
                  <li>请在实验完成后关闭不需要的环境以释放系统资源</li>
                </ul>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TargetSettings;
