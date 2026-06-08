/**
 * AI 服务 - 处理与DeepSeek API的通信
 */
import deepseekConfig from '../config/ai';

const SAVED_CONFIG_KEY = 'deepseekConfig';

const getSavedConfig = () => {
  try {
    const savedConfig = localStorage.getItem(SAVED_CONFIG_KEY);
    return savedConfig ? JSON.parse(savedConfig) : null;
  } catch (error) {
    console.error('读取AI配置失败:', error);
    return null;
  }
};

const getActiveConfig = () => {
  const savedConfig = getSavedConfig();

  if (!savedConfig) {
    return deepseekConfig;
  }

  return {
    ...deepseekConfig,
    ...savedConfig,
    parameters: {
      ...deepseekConfig.parameters,
      ...savedConfig.parameters,
    },
  };
};

class AIService {
  /**
   * 发送对话消息到DeepSeek API
   * @param {Array} messages - 对话历史消息数组
   * @returns {Promise} - 返回API响应的Promise
   */
  async sendMessage(messages) {
    const activeConfig = getActiveConfig();

    // 检查API密钥是否已配置
    if (!activeConfig.apiKey) {
      throw new Error('DeepSeek API密钥未配置。请在配置文件中设置有效的API密钥。');
    }

    try {
      // 准备完整的消息数组，包括系统提示
      const completeMessages = [
        {
          role: 'system',
          content: activeConfig.systemPrompt,
        },
        ...messages.map(msg => ({
          role: msg.role,
          content: msg.content,
        })),
      ];

      // 构建请求配置
      const requestOptions = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${activeConfig.apiKey}`,
        },
        body: JSON.stringify({
          model: activeConfig.model,
          messages: completeMessages,
          temperature: activeConfig.parameters.temperature,
          max_tokens: activeConfig.parameters.max_tokens,
          top_p: activeConfig.parameters.top_p,
        }),
      };

      // 发送请求到DeepSeek API
      const response = await fetch(activeConfig.apiUrl, requestOptions);

      // 检查响应状态
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(
          `API请求失败: ${response.status} ${response.statusText}${
            errorData ? ` - ${JSON.stringify(errorData)}` : ''
          }`
        );
      }

      // 解析响应数据
      const data = await response.json();
      if (!data.choices?.[0]?.message) {
        throw new Error('API响应格式异常');
      }

      return data.choices[0].message;
    } catch (error) {
      console.error('DeepSeek API调用错误:', error);
      throw error;
    }
  }

  /**
   * 测试API连接
   * @returns {Promise<boolean>} - 连接是否成功
   */
  async testConnection() {
    try {
      // 发送一个简单的测试消息
      await this.sendMessage([{ role: 'user', content: '测试连接' }]);
      return true;
    } catch (error) {
      console.error('API连接测试失败:', error);
      return false;
    }
  }
}

// 创建单例实例
const aiService = new AIService();
export default aiService;
