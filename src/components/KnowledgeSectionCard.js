import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBook,
  faCheckCircle,
  faClock,
  faCode,
  faCopy,
  faExclamationTriangle,
  faExternalLinkAlt,
  faInfoCircle,
  faPlayCircle,
  faPowerOff,
} from '@fortawesome/free-solid-svg-icons';
import DetailedTutorial from './DetailedTutorial';

const difficultyClassName = {
  beginner: 'bg-green-500/20 text-green-400',
  intermediate: 'bg-blue-500/20 text-blue-400',
  advanced: 'bg-yellow-500/20 text-yellow-400',
  expert: 'bg-red-500/20 text-red-400',
};

const difficultyLabel = {
  beginner: '入门',
  intermediate: '中级',
  advanced: '高级',
  expert: '专家',
};

const studyTime = {
  beginner: '30分钟',
  intermediate: '1小时',
  advanced: '2小时',
  expert: '3小时+',
};

const getFlagStatusIcon = (status) => {
  if (status?.type === 'success') {
    return faCheckCircle;
  }

  if (status?.type === 'error') {
    return faExclamationTriangle;
  }

  return faInfoCircle;
};

const KnowledgeSectionCard = ({
  category,
  categoryId,
  copyStatus,
  flagStatus,
  flagValue,
  index,
  onCopyUrl,
  onExperiment,
  onFlagChange,
  onFlagVerify,
  onStopEnvironment,
  section,
  targetEnvStatus,
}) => {
  const status = targetEnvStatus || {};
  const publicUrl = status.accessUrls?.public || status.url;
  const localUrl = status.localUrl || status.accessUrls?.localhost;

  return (
    <div className="bg-[#2A2A2A] rounded-lg p-6">
      <div className="flex justify-between items-start mb-4">
        <h2 className="text-xl font-semibold">{section.title}</h2>
        <span className={`px-3 py-1 rounded-full text-sm ${difficultyClassName[section.difficulty] || difficultyClassName.expert}`}>
          {difficultyLabel[section.difficulty] || difficultyLabel.expert}
        </span>
      </div>

      <p className="text-gray-300 mb-6">{section.content}</p>

      <div id={`tutorial-${index}`}>
        <DetailedTutorial categoryId={categoryId} category={category} section={section} />
      </div>

      {section.examples && section.examples.length > 0 && (
        <div>
          <h3 className="text-lg font-medium mb-3 flex items-center">
            <FontAwesomeIcon icon={faCode} className="text-primary mr-2" />
            示例代码
          </h3>
          <div className="bg-[#1E1E1E] rounded-lg p-4 mb-4">
            <pre className="text-gray-300 overflow-x-auto">
              {section.examples.map((example, exampleIndex) => (
                <div key={exampleIndex} className="mb-2 font-mono">
                  <span className="text-gray-500 select-none mr-2">{exampleIndex + 1}.</span>
                  <code className="text-primary">{example}</code>
                </div>
              ))}
            </pre>
          </div>
        </div>
      )}

      {section.code && (
        <div>
          <h3 className="text-lg font-medium mb-3 flex items-center">
            <FontAwesomeIcon icon={faCode} className="text-primary mr-2" />
            示例代码
          </h3>
          <div className="bg-[#1E1E1E] rounded-lg p-4 mb-4">
            <pre className="text-gray-300 overflow-x-auto font-mono">
              <code className="text-primary whitespace-pre-wrap">{section.code}</code>
            </pre>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center mt-4">
        <span className="text-gray-500 text-sm flex items-center">
          <FontAwesomeIcon icon={faClock} className="mr-1" />
          预计学习时间: {studyTime[section.difficulty] || studyTime.expert}
        </span>

        <div className="flex space-x-2">
          <button
            type="button"
            className="bg-[#333333] hover:bg-[#444444] text-white px-3 py-1 rounded flex items-center text-sm transition-colors duration-200"
            onClick={() => document.getElementById(`tutorial-${index}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
          >
            <FontAwesomeIcon icon={faBook} className="mr-1" />
            学习
          </button>
          <button
            className="bg-primary hover:bg-primary/90 text-white px-3 py-1 rounded flex items-center text-sm transition-colors duration-200"
            onClick={() => onExperiment(section)}
            disabled={status.loading}
          >
            <FontAwesomeIcon icon={faPlayCircle} className="mr-1" />
            实验
            {status.loading && (
              <span className="ml-1 animate-spin">⋯</span>
            )}
          </button>
        </div>
      </div>

      {status.error && (
        <div className="mt-2 p-3 bg-[#1E1E1E] rounded-lg">
          <div className="text-red-400 text-sm flex items-start">
            <FontAwesomeIcon icon={faExclamationTriangle} className="mr-2 mt-0.5" />
            <div>
              <div className="font-medium">{status.error}</div>
              {status.details && (
                <div className="text-gray-400 text-xs mt-1">{status.details}</div>
              )}
              {status.fix && (
                <div className="text-yellow-400 text-xs mt-1">
                  <span className="font-medium">建议解决方法: </span>{status.fix}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {status.loading && (
        <div className="mt-2 p-3 bg-[#1E1E1E] rounded-lg text-blue-400 text-sm">
          <div className="flex items-center">
            <div className="animate-spin mr-2 h-4 w-4 border-2 border-blue-400 border-t-transparent rounded-full"></div>
            <span className="font-medium">{status.status || '正在启动环境...'}</span>
          </div>
          <div className="mt-2 text-gray-400 text-xs">
            <p>请稍等，靶场环境正在启动中。这可能需要一点时间：</p>
            <ul className="ml-4 mt-1 list-disc space-y-1">
              <li>检查Docker服务</li>
              <li>下载或准备镜像</li>
              <li>分配可用网络端口</li>
              <li>启动容器并配置网络</li>
            </ul>
          </div>
        </div>
      )}

      {!status.loading && !status.error && status.url && (
        <div className="mt-2 p-3 bg-[#1E1E1E] rounded-lg">
          <div className="flex items-center text-green-400 text-sm mb-2">
            <FontAwesomeIcon icon={faCheckCircle} className="mr-1" />
            {status.status || '靶场环境已成功启动'}
          </div>

          <div className="space-y-1">
            {status.accessUrls?.public && (
              <div className="text-sm flex">
                <span className="text-gray-400 w-20">公网地址:</span>
                <a href={status.accessUrls.public} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline truncate">
                  {status.accessUrls.public}
                </a>
              </div>
            )}
            {!status.accessUrls?.public && (
              <div className="text-sm flex">
                <span className="text-gray-400 w-20">访问地址:</span>
                <a href={status.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline truncate">
                  {status.url}
                </a>
              </div>
            )}
            {status.accessUrls?.localNetwork && (
              <div className="text-sm flex">
                <span className="text-gray-400 w-20">局域网:</span>
                <a href={status.accessUrls.localNetwork} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline truncate">
                  {status.accessUrls.localNetwork}
                </a>
              </div>
            )}
            <div className="text-sm flex">
              <span className="text-gray-400 w-20">本地地址:</span>
              <a href={localUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline truncate">
                {localUrl}
              </a>
            </div>
            <div className="text-sm flex">
              <span className="text-gray-400 w-20">端口:</span>
              <span className="text-white">{status.port}</span>
            </div>
            <div className="text-sm flex">
              <span className="text-gray-400 w-20">容器名称:</span>
              <span className="text-white truncate">{status.containerName}</span>
            </div>
          </div>

          <div className="mt-4 border-t border-gray-700 pt-3">
            <div className="text-sm text-gray-300 mb-2 font-medium">提交flag:</div>
            <div className="flex">
              <input
                type="text"
                className="flex-1 bg-[#333] border border-gray-600 rounded-l px-3 py-1 text-sm focus:outline-none focus:border-primary"
                placeholder="输入获取到的flag"
                value={flagValue}
                onChange={(event) => onFlagChange(section.title, event.target.value)}
              />
              <button
                className="bg-primary hover:bg-primary/90 text-white rounded-r px-3 py-1 text-sm"
                onClick={() => onFlagVerify(section)}
              >
                验证
              </button>
            </div>
            {flagStatus && (
              <div className={`mt-2 text-sm ${
                flagStatus.type === 'success' ? 'text-green-400' :
                flagStatus.type === 'error' ? 'text-red-400' : 'text-yellow-400'
              }`}>
                <FontAwesomeIcon
                  icon={getFlagStatusIcon(flagStatus)}
                  className="mr-1"
                />
                {flagStatus.message}
              </div>
            )}
          </div>

          <div className="mt-4 flex space-x-2">
            <a href={publicUrl} target="_blank" rel="noopener noreferrer" className="bg-primary hover:bg-primary/90 text-white px-3 py-1 rounded text-xs flex items-center">
              <FontAwesomeIcon icon={faExternalLinkAlt} className="mr-1" />
              打开环境
            </a>
            <button className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-1 rounded text-xs flex items-center" onClick={() => onCopyUrl(status.url)}>
              <FontAwesomeIcon icon={faCopy} className="mr-1" />
              复制地址
              {copyStatus && <span className="ml-1">{copyStatus}</span>}
            </button>
            <button
              className="bg-red-700 hover:bg-red-600 text-white px-3 py-1 rounded text-xs flex items-center"
              onClick={() => onStopEnvironment(section)}
            >
              <FontAwesomeIcon icon={faPowerOff} className="mr-1" />
              关闭环境
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default KnowledgeSectionCard;
