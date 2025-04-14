// 靶场服务
import getRandomPort, { targetEnvironments } from '../config/targetEnvironments';

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
    
    // 使用完整的API URL而不是相对路径
    const apiUrl = window.location.hostname === 'localhost' 
      ? 'http://localhost:8080/api/target/start'
      : `${window.location.protocol}//${window.location.hostname}:8080/api/target/start`;
    
    console.log('正在请求启动靶场环境，URL:', apiUrl);
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Cache-Control': 'no-cache'
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
    
    // 先尝试获取文本内容进行调试
    const textContent = await response.text();
    console.log('API响应原始内容:', textContent);
    
    let result;
    try {
      // 然后将文本解析为JSON
      result = JSON.parse(textContent);
    } catch (jsonError) {
      console.error('JSON解析失败:', jsonError, '原始内容:', textContent);
      throw new Error(`JSON解析失败: ${jsonError.message}`);
    }
    
    return result;
  } catch (error) {
    console.error('启动靶场环境失败:', error);
    return { error: true, message: `启动失败: ${error.message}` };
  }
};

// 安装所有默认靶场环境
const installDefaultTargets = async () => {
  try {
    // 使用完整的API URL而不是相对路径
    const apiUrl = window.location.hostname === 'localhost' 
      ? 'http://localhost:8080/api/target/install-defaults'
      : `${window.location.protocol}//${window.location.hostname}:8080/api/target/install-defaults`;
    
    console.log('正在请求安装默认靶场环境，URL:', apiUrl);
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Cache-Control': 'no-cache'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP错误 ${response.status}`);
    }
    
    // 先尝试获取文本内容进行调试
    const textContent = await response.text();
    console.log('API响应原始内容:', textContent);
    
    let result;
    try {
      // 然后将文本解析为JSON
      result = JSON.parse(textContent);
    } catch (jsonError) {
      console.error('JSON解析失败:', jsonError, '原始内容:', textContent);
      throw new Error(`JSON解析失败: ${jsonError.message}`);
    }
    
    return result;
  } catch (error) {
    console.error('安装默认靶场环境失败:', error);
    return { error: true, message: `安装失败: ${error.message}` };
  }
};

// 获取已安装的Docker镜像
const getInstalledImages = async () => {
  try {
    // 使用完整的API URL而不是相对路径
    const apiUrl = window.location.hostname === 'localhost' 
      ? 'http://localhost:8080/api/target/images'
      : `${window.location.protocol}//${window.location.hostname}:8080/api/target/images`;
    
    console.log('正在请求获取已安装镜像，URL:', apiUrl);
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Cache-Control': 'no-cache'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP错误 ${response.status}`);
    }
    
    // 先尝试获取文本内容进行调试
    const textContent = await response.text();
    console.log('API响应原始内容:', textContent);
    
    let result;
    try {
      // 然后将文本解析为JSON
      result = JSON.parse(textContent);
    } catch (jsonError) {
      console.error('JSON解析失败:', jsonError, '原始内容:', textContent);
      throw new Error(`JSON解析失败: ${jsonError.message}`);
    }
    
    return result;
  } catch (error) {
    console.error('获取已安装镜像失败:', error);
    return { error: true, message: `获取失败: ${error.message}`, images: [] };
  }
};

// 检查Docker是否安装
const checkDockerInstalled = async () => {
  try {
    // 使用完整的API URL而不是相对路径
    // 在容器内部使用本地地址
    const apiUrl = window.location.hostname === 'localhost' 
      ? 'http://localhost:8080/api/target/check-docker'
      : `${window.location.protocol}//${window.location.hostname}:8080/api/target/check-docker`;
    
    console.log('正在请求Docker状态，URL:', apiUrl);

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Cache-Control': 'no-cache'
      },
    });
    
    if (!response.ok) {
      console.error('Docker状态检查API返回错误状态码:', response.status);
      throw new Error(`HTTP错误 ${response.status}`);
    }
    
    // 先尝试获取文本内容进行调试
    const textContent = await response.text();
    console.log('API响应原始内容:', textContent);
    
    let result;
    try {
      // 然后将文本解析为JSON
      result = JSON.parse(textContent);
    } catch (jsonError) {
      console.error('JSON解析失败:', jsonError, '原始内容:', textContent);
      throw new Error(`JSON解析失败: ${jsonError.message}`);
    }
    
    console.log('Docker状态检查结果:', result);
    return result;
  } catch (error) {
    console.error('检查Docker安装状态失败:', error);
    if (error.message.includes('JSON')) {
      return { 
        installed: false, 
        error: '服务器返回了无效响应，可能是Docker服务未运行',
        details: error.message
      };
    }
    // 添加更详细的错误信息
    return { 
      installed: false, 
      error: '检查Docker状态失败，请确保Docker服务正在运行',
      details: error.message,
      fix: 'Docker未安装或无法访问，请重启Docker容器或检查Docker套接字挂载'
    };
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