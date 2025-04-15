// 靶场服务
import getRandomPort, { targetEnvironments } from '../config/targetEnvironments';

// 本地存储键名
const RUNNING_TARGETS_STORAGE_KEY = 'relum_running_targets';

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
  console.log('获取靶场环境 - 知识点ID:', knowledgeId);
  console.log('获取靶场环境 - 章节标题:', sectionTitle);
  console.log('已配置的知识点:', Object.keys(targetEnvironments));
  
  if (targetEnvironments[knowledgeId]) {
    console.log('找到知识点配置');
    console.log('知识点章节列表:', Object.keys(targetEnvironments[knowledgeId].sections || {}));
    
    if (
      targetEnvironments[knowledgeId] && 
      targetEnvironments[knowledgeId].sections && 
      targetEnvironments[knowledgeId].sections[sectionTitle]
    ) {
      console.log('找到匹配的靶场环境配置:', targetEnvironments[knowledgeId].sections[sectionTitle]);
      return targetEnvironments[knowledgeId].sections[sectionTitle];
    } else {
      console.log('未找到匹配的靶场环境配置');
    }
  } else {
    console.log('未找到知识点配置');
  }
  
  return null;
};

// 获取已运行的靶场环境
const getRunningTargets = () => {
  try {
    const storedTargets = localStorage.getItem(RUNNING_TARGETS_STORAGE_KEY);
    if (storedTargets) {
      return JSON.parse(storedTargets);
    }
  } catch (error) {
    console.error('获取已运行靶场环境失败:', error);
  }
  return {};
};

// 保存已运行的靶场环境到本地存储
const saveRunningTarget = (knowledgeId, sectionTitle, targetInfo) => {
  try {
    const runningTargets = getRunningTargets();
    
    // 使用双层键存储，便于查找：知识分类ID -> 章节标题 -> 靶场信息
    if (!runningTargets[knowledgeId]) {
      runningTargets[knowledgeId] = {};
    }
    
    runningTargets[knowledgeId][sectionTitle] = {
      ...targetInfo,
      timestamp: Date.now() // 记录启动时间
    };
    
    localStorage.setItem(RUNNING_TARGETS_STORAGE_KEY, JSON.stringify(runningTargets));
  } catch (error) {
    console.error('保存靶场环境状态失败:', error);
  }
};

// 删除已运行的靶场环境
const removeRunningTarget = (knowledgeId, sectionTitle) => {
  try {
    const runningTargets = getRunningTargets();
    
    if (runningTargets[knowledgeId] && runningTargets[knowledgeId][sectionTitle]) {
      delete runningTargets[knowledgeId][sectionTitle];
      
      // 如果知识点下没有任何运行的靶场，也删除这个知识点键
      if (Object.keys(runningTargets[knowledgeId]).length === 0) {
        delete runningTargets[knowledgeId];
      }
      
      localStorage.setItem(RUNNING_TARGETS_STORAGE_KEY, JSON.stringify(runningTargets));
    }
  } catch (error) {
    console.error('删除靶场环境状态失败:', error);
  }
};

// 检查特定靶场环境是否已运行
const isTargetRunning = (knowledgeId, sectionTitle) => {
  const runningTargets = getRunningTargets();
  return !!(runningTargets[knowledgeId] && runningTargets[knowledgeId][sectionTitle]);
};

// 获取特定靶场环境的运行信息
const getRunningTargetInfo = (knowledgeId, sectionTitle) => {
  const runningTargets = getRunningTargets();
  if (runningTargets[knowledgeId] && runningTargets[knowledgeId][sectionTitle]) {
    return runningTargets[knowledgeId][sectionTitle];
  }
  return null;
};

// 启动靶场环境
const startTargetEnvironment = async (knowledgeId, sectionTitle) => {
  try {
    // 检查本地存储中是否已有运行的靶场环境
    const runningInfo = getRunningTargetInfo(knowledgeId, sectionTitle);
    if (runningInfo) {
      console.log('使用已运行的靶场环境:', runningInfo);
      return {
        ...runningInfo,
        status: '使用已运行的靶场环境'
      };
    }
    
    const target = getTargetForSection(knowledgeId, sectionTitle);
    
    if (!target) {
      return { 
        error: true, 
        message: '未找到对应的靶场环境',
        details: `知识点ID: ${knowledgeId}, 章节标题: ${sectionTitle}`,
        imageInfo: null
      };
    }
    
    // 使用完整的API URL而不是相对路径
    const apiUrl = window.location.hostname === 'localhost' 
      ? 'http://localhost:8080/api/target/start'
      : `${window.location.protocol}//${window.location.hostname}:8080/api/target/start`;
    
    console.log('正在请求启动靶场环境，URL:', apiUrl);
    console.log('发送请求数据:', {
      target: {
        dockerImage: target.dockerImage,
        port: target.port,
        internalPort: target.internalPort,
        description: target.description
      }
    });
    
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
          internalPort: target.internalPort,
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
      
      // 更新状态消息
      if (result.downloadStatus) {
        // 如果是下载状态，传递给调用者
        result.status = result.downloadStatus;
      } else {
        // 默认成功消息
        result.status = '靶场环境已成功启动';
      }
      
      // 保存到本地存储
      if (!result.error) {
        saveRunningTarget(knowledgeId, sectionTitle, result);
      }
      
      console.log('靶场环境启动结果:', result);
    } catch (jsonError) {
      console.error('JSON解析失败:', jsonError, '原始内容:', textContent);
      throw new Error(`JSON解析失败: ${jsonError.message}`);
    }
    
    return result;
  } catch (error) {
    console.error('启动靶场环境失败:', error);
    
    // 根据错误类型提供更详细的信息
    if (error.message.includes('拉取镜像失败') || error.message.includes('pull')) {
      return { 
        error: true, 
        message: `启动失败: 拉取镜像失败`, 
        details: `可能是因为镜像不存在、网络问题或仓库认证失败`,
        fix: '请检查镜像名称是否正确，并确保网络连接正常，可能需要手动拉取镜像'
      };
    } else if (error.message.includes('端口') || error.message.includes('port')) {
      return { 
        error: true, 
        message: `启动失败: 端口分配失败`, 
        details: error.message,
        fix: '请检查端口是否被占用，或者尝试手动指定一个可用端口'
      };
    } else if (error.message.includes('容器') || error.message.includes('container')) {
      return { 
        error: true, 
        message: `启动失败: 容器创建失败`, 
        details: error.message,
        fix: '可能是Docker资源不足或配置问题，尝试重启Docker或清理未使用的容器'
      };
    } else if (error.message.includes('Docker')) {
      return { 
        error: true, 
        message: `启动失败: Docker服务问题`, 
        details: error.message,
        fix: '请确保Docker服务正在运行，并且有权限访问Docker API'
      };
    }
    
    // 默认错误信息
    return { 
      error: true, 
      message: `启动失败: ${error.message}`,
      requestDetails: `知识点: ${knowledgeId}, 章节: ${sectionTitle}`
    };
  }
};

// 停止靶场环境
const stopTargetEnvironment = async (knowledgeId, sectionTitle) => {
  try {
    const runningInfo = getRunningTargetInfo(knowledgeId, sectionTitle);
    if (!runningInfo || !runningInfo.containerName) {
      return { error: true, message: '未找到运行中的靶场环境' };
    }
    
    // 使用完整的API URL而不是相对路径
    const apiUrl = window.location.hostname === 'localhost' 
      ? 'http://localhost:8080/api/target/stop'
      : `${window.location.protocol}//${window.location.hostname}:8080/api/target/stop`;
    
    console.log('正在请求停止靶场环境，URL:', apiUrl);
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Cache-Control': 'no-cache'
      },
      body: JSON.stringify({
        containerName: runningInfo.containerName
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
      
      // 从本地存储中删除
      if (!result.error) {
        removeRunningTarget(knowledgeId, sectionTitle);
      }
      
      console.log('靶场环境停止结果:', result);
    } catch (jsonError) {
      console.error('JSON解析失败:', jsonError, '原始内容:', textContent);
      throw new Error(`JSON解析失败: ${jsonError.message}`);
    }
    
    return result;
  } catch (error) {
    console.error('停止靶场环境失败:', error);
    return { error: true, message: `停止失败: ${error.message}` };
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
      
      // 确保images数组存在且格式化每个镜像对象
      if (result.images) {
        // 处理镜像数据，确保每个镜像都有必需的属性
        result.images = Array.isArray(result.images) ? result.images.map(image => {
          // 如果image只是一个字符串，转换为对象
          if (typeof image === 'string') {
            const [repository, tag = 'latest'] = image.split(':');
            return {
              fullName: image,
              repository: repository,
              tag: tag,
              id: image,
              size: '未知',
              createdSince: '未知'
            };
          }
          
          // 确保对象包含所有必需的属性
          return {
            repository: image.repository || image.name || image.Image || '未知',
            tag: image.tag || image.Tag || 'latest',
            fullName: image.fullName || image.FullName || `${image.repository || image.name || image.Image || '未知'}:${image.tag || image.Tag || 'latest'}`,
            id: image.id || image.ID || image.Id || image.fullName || `${image.repository || '未知'}-${Date.now()}`,
            size: image.size || image.Size || '未知',
            createdSince: image.createdSince || image.CreatedSince || '未知'
          };
        }) : [];
      } else {
        result.images = [];
      }
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
  stopTargetEnvironment,
  installDefaultTargets,
  getInstalledImages,
  checkDockerInstalled,
  getRunningTargets,
  isTargetRunning,
  getRunningTargetInfo
}; 