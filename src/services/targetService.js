import { targetEnvironments } from '../config/targetEnvironments';
import {
  isMeaningfulImage,
  normalizeImage,
} from '../utils/targetEnvironmentUtils';
import { requestJson } from './apiClient';

const RUNNING_TARGETS_STORAGE_KEY = 'relum_running_targets';

const getTargetEnvironments = () => targetEnvironments;

const getTargetsForKnowledge = (knowledgeId) => (
  targetEnvironments[knowledgeId]?.sections || {}
);

const getTargetForSection = (knowledgeId, sectionTitle) => (
  targetEnvironments[knowledgeId]?.sections?.[sectionTitle] || null
);

const getRunningTargets = () => {
  try {
    const storedTargets = localStorage.getItem(RUNNING_TARGETS_STORAGE_KEY);
    return storedTargets ? JSON.parse(storedTargets) : {};
  } catch (error) {
    console.error('获取已运行靶场环境失败:', error);
    return {};
  }
};

const saveRunningTarget = (knowledgeId, sectionTitle, targetInfo) => {
  try {
    const runningTargets = getRunningTargets();
    const targetsByKnowledge = runningTargets[knowledgeId] || {};

    runningTargets[knowledgeId] = {
      ...targetsByKnowledge,
      [sectionTitle]: {
        ...targetInfo,
        timestamp: Date.now(),
      },
    };

    localStorage.setItem(RUNNING_TARGETS_STORAGE_KEY, JSON.stringify(runningTargets));
  } catch (error) {
    console.error('保存靶场环境状态失败:', error);
  }
};

const removeRunningTarget = (knowledgeId, sectionTitle) => {
  try {
    const runningTargets = getRunningTargets();
    const targetsByKnowledge = runningTargets[knowledgeId];

    if (!targetsByKnowledge?.[sectionTitle]) {
      return;
    }

    delete targetsByKnowledge[sectionTitle];

    if (Object.keys(targetsByKnowledge).length === 0) {
      delete runningTargets[knowledgeId];
    }

    localStorage.setItem(RUNNING_TARGETS_STORAGE_KEY, JSON.stringify(runningTargets));
  } catch (error) {
    console.error('删除靶场环境状态失败:', error);
  }
};

const isTargetRunning = (knowledgeId, sectionTitle) => (
  Boolean(getRunningTargets()[knowledgeId]?.[sectionTitle])
);

const getRunningTargetInfo = (knowledgeId, sectionTitle) => (
  getRunningTargets()[knowledgeId]?.[sectionTitle] || null
);

const toTargetPayload = (target) => ({
  dockerImage: target.dockerImage,
  port: target.port,
  internalPort: target.internalPort,
  description: target.description,
});

const mapStartError = (error, knowledgeId, sectionTitle) => {
  const message = error.message || '';

  if (message.includes('拉取镜像失败') || message.includes('pull')) {
    return {
      error: true,
      message: '启动失败: 拉取镜像失败',
      details: '可能是因为镜像不存在、网络问题或仓库认证失败',
      fix: '请检查镜像名称是否正确，并确保网络连接正常，可能需要手动拉取镜像',
    };
  }

  if (message.includes('端口') || message.includes('port')) {
    return {
      error: true,
      message: '启动失败: 端口分配失败',
      details: message,
      fix: '请检查端口是否被占用，或者尝试手动指定一个可用端口',
    };
  }

  if (message.includes('容器') || message.includes('container')) {
    return {
      error: true,
      message: '启动失败: 容器创建失败',
      details: message,
      fix: '可能是Docker资源不足或配置问题，尝试重启Docker或清理未使用的容器',
    };
  }

  if (message.includes('Docker')) {
    return {
      error: true,
      message: '启动失败: Docker服务问题',
      details: message,
      fix: '请确保Docker服务正在运行，并且有权限访问Docker API',
    };
  }

  return {
    error: true,
    message: `启动失败: ${message}`,
    requestDetails: `知识点: ${knowledgeId}, 章节: ${sectionTitle}`,
  };
};

const startTargetEnvironment = async (knowledgeId, sectionTitle) => {
  try {
    const runningInfo = getRunningTargetInfo(knowledgeId, sectionTitle);
    if (runningInfo) {
      return {
        ...runningInfo,
        status: '使用已运行的靶场环境',
      };
    }

    const target = getTargetForSection(knowledgeId, sectionTitle);
    if (!target) {
      return {
        error: true,
        message: '未找到对应的靶场环境',
        details: `知识点ID: ${knowledgeId}, 章节标题: ${sectionTitle}`,
        imageInfo: null,
      };
    }

    const result = await requestJson('/target/start', {
      method: 'POST',
      body: {
        target: toTargetPayload(target),
      },
    });

    const normalizedResult = {
      ...result,
      status: result.downloadStatus || '靶场环境已成功启动',
    };

    if (!normalizedResult.error) {
      saveRunningTarget(knowledgeId, sectionTitle, normalizedResult);
    }

    return normalizedResult;
  } catch (error) {
    console.error('启动靶场环境失败:', error);
    return mapStartError(error, knowledgeId, sectionTitle);
  }
};

const stopTargetEnvironment = async (knowledgeId, sectionTitle) => {
  try {
    const runningInfo = getRunningTargetInfo(knowledgeId, sectionTitle);
    if (!runningInfo?.containerName) {
      return { error: true, message: '未找到运行中的靶场环境' };
    }

    const result = await requestJson('/target/stop', {
      method: 'POST',
      body: {
        containerName: runningInfo.containerName,
      },
    });

    if (!result.error) {
      removeRunningTarget(knowledgeId, sectionTitle);
    }

    return result;
  } catch (error) {
    console.error('停止靶场环境失败:', error);
    return { error: true, message: `停止失败: ${error.message}` };
  }
};

const installDefaultTargets = async () => {
  try {
    return await requestJson('/target/install-defaults', { method: 'POST' });
  } catch (error) {
    console.error('安装默认靶场环境失败:', error);
    return { error: true, message: `安装失败: ${error.message}` };
  }
};

const getInstalledImages = async () => {
  try {
    const result = await requestJson('/target/images');
    const images = Array.isArray(result?.images)
      ? result.images.filter(isMeaningfulImage).map(normalizeImage)
      : [];

    return {
      ...result,
      images,
    };
  } catch (error) {
    console.warn('获取已安装镜像失败:', error);
    return { error: true, message: `获取失败: ${error.message}`, images: [] };
  }
};

const checkDockerInstalled = async () => {
  try {
    return await requestJson('/target/check-docker');
  } catch (error) {
    console.warn('检查Docker安装状态失败:', error);

    if (error.message.includes('JSON')) {
      return {
        installed: false,
        error: '服务器返回了无效响应，可能是Docker服务未运行',
        details: error.message,
      };
    }

    return {
      installed: false,
      error: '检查Docker状态失败，请确保Docker服务正在运行',
      details: error.message,
      fix: 'Docker未安装或无法访问，请重启Docker容器或检查Docker套接字挂载',
    };
  }
};

export {
  getTargetEnvironments,
  getTargetsForKnowledge,
  getTargetForSection,
  startTargetEnvironment,
  stopTargetEnvironment,
  installDefaultTargets,
  getInstalledImages,
  checkDockerInstalled,
  getRunningTargets,
  isTargetRunning,
  getRunningTargetInfo,
};
