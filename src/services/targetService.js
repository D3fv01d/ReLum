// 靶场服务
import targetEnvironments from '../config/targetEnvironments';

// 获取靶场环境配置
const getTargetEnvironments = () => {
  return targetEnvironments;
};

// 获取特定知识点下的所有靶场环境
const getTargetsForKnowledge = (knowledgeId) => {
  if (targetEnvironments[knowledgeId] && targetEnvironments[knowledgeId].sections) {
    return targetEnvironments[knowledgeId].sections;
  }
  return {};
};

// 获取特定知识点下特定章节的靶场环境
const getTargetForSection = (knowledgeId, sectionTitle) => {
  if (
    targetEnvironments[knowledgeId] && 
    targetEnvironments[knowledgeId].sections && 
    targetEnvironments[knowledgeId].sections[sectionTitle]
  ) {
    return targetEnvironments[knowledgeId].sections[sectionTitle];
  }
  return null;
};

// 启动靶场环境
const startTargetEnvironment = async (knowledgeId, sectionTitle) => {
  try {
    const target = getTargetForSection(knowledgeId, sectionTitle);
    
    if (!target) {
      return { error: true, message: '未找到对应的靶场环境' };
    }
    
    const response = await fetch('/api/target/start', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        target: {
          dockerImage: target.dockerImage,
          port: target.port,
          description: target.description
        }
      }),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP错误 ${response.status}`);
    }
    
    const result = await response.json();
    return result;
  } catch (error) {
    console.error('启动靶场环境失败:', error);
    return { error: true, message: `启动失败: ${error.message}` };
  }
};

// 安装所有默认靶场环境
const installDefaultTargets = async () => {
  try {
    const response = await fetch('/api/target/install-defaults', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP错误 ${response.status}`);
    }
    
    const result = await response.json();
    return result;
  } catch (error) {
    console.error('安装默认靶场环境失败:', error);
    return { error: true, message: `安装失败: ${error.message}` };
  }
};

// 获取已安装的Docker镜像
const getInstalledImages = async () => {
  try {
    const response = await fetch('/api/target/images', {
      method: 'GET',
    });
    
    if (!response.ok) {
      throw new Error(`HTTP错误 ${response.status}`);
    }
    
    const result = await response.json();
    return result;
  } catch (error) {
    console.error('获取已安装镜像失败:', error);
    return { error: true, message: `获取失败: ${error.message}`, images: [] };
  }
};

// 检查Docker是否安装
const checkDockerInstalled = async () => {
  try {
    const response = await fetch('/api/target/check-docker', {
      method: 'GET',
    });
    
    if (!response.ok) {
      throw new Error(`HTTP错误 ${response.status}`);
    }
    
    const result = await response.json();
    return result;
  } catch (error) {
    console.error('检查Docker安装状态失败:', error);
    if (error.message.includes('JSON')) {
      return { installed: false, error: '服务器返回了无效响应，可能是Docker服务未运行' };
    }
    return { installed: false, error: error.message };
  }
};

export {
  getTargetEnvironments,
  getTargetsForKnowledge,
  getTargetForSection,
  startTargetEnvironment,
  installDefaultTargets,
  getInstalledImages,
  checkDockerInstalled
}; 