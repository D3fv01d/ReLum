import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faDownload,
  faServer,
  faExclamationTriangle,
  faCheckCircle,
  faSync,
  faSearch,
  faTimes
} from '@fortawesome/free-solid-svg-icons';
import {
  checkDockerInstalled,
  installDefaultTargets,
  getInstalledImages
} from '../services/targetService';
import {
  getExerciseNameForImage,
  getFilteredEnvironmentGroups,
  getImageName,
  getTargetEnvironmentStats,
  isImageInstalled,
} from '../utils/targetEnvironmentUtils';

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
        setDockerError(result.error || result.message || '无法连接到Docker服务');
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
      console.warn('获取已安装镜像失败:', error);
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
                      const imageName = getImageName(image);
                      const exerciseName = getExerciseNameForImage(imageName);

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
            <div className="mb-3 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="text-white">可用靶场环境</div>
                <div className="text-xs text-gray-400">
                  共 {filteredEnvironmentCount} 个匹配环境
                </div>
              </div>
              <div className="relative md:w-80">
                <label htmlFor="target-environment-search" className="sr-only">
                  搜索靶场环境
                </label>
                <FontAwesomeIcon
                  icon={faSearch}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
                  aria-hidden="true"
                />
                <input
                  id="target-environment-search"
                  type="search"
                  value={environmentQuery}
                  onChange={(event) => setEnvironmentQuery(event.target.value)}
                  placeholder="搜索名称、分类或镜像"
                  className="w-full rounded-md border border-gray-600 bg-gray-900 py-2 pl-9 pr-10 text-sm text-white outline-none transition placeholder:text-gray-500 focus:border-blue-400"
                />
                {environmentQuery && (
                  <button
                    type="button"
                    onClick={() => setEnvironmentQuery('')}
                    className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded text-gray-400 hover:bg-gray-700 hover:text-white"
                    aria-label="清空靶场搜索"
                  >
                    <FontAwesomeIcon icon={faTimes} aria-hidden="true" />
                  </button>
                )}
              </div>
            </div>
            <div className="space-y-4">
              {availableEnvironmentGroups.length === 0 ? (
                <div className="rounded bg-gray-700 p-4 text-sm text-gray-300">
                  没有找到匹配的靶场环境。
                </div>
              ) : availableEnvironmentGroups.map(({ category, sections }) => (
                <div key={category} className="bg-gray-700 p-4 rounded">
                  <h3 className="text-lg font-semibold text-white mb-3 capitalize">
                    {category.replace(/-/g, ' ')} 靶场
                  </h3>

                  <div className="space-y-2">
                    {sections.map(({ sectionName, target }) => {
                      const isInstalled = isImageInstalled(installedImages, target.dockerImage);

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
