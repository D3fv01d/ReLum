/**
 * AI 服务 - 处理与DeepSeek API的通信
 */
import deepseekConfig from '../config/ai';

class AIService {
  /**
   * 发送对话消息到DeepSeek API
   * @param {Array} messages - 对话历史消息数组
   * @returns {Promise} - 返回API响应的Promise
   */
  async sendMessage(messages) {
    // 检查API密钥是否已配置
    if (!deepseekConfig.apiKey) {
      throw new Error('DeepSeek API密钥未配置。请在配置文件中设置有效的API密钥。');
    }

    try {
      // 准备完整的消息数组，包括系统提示
      const completeMessages = [
        {
          role: 'system',
          content: deepseekConfig.systemPrompt,
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
          'Authorization': `Bearer ${deepseekConfig.apiKey}`,
        },
        body: JSON.stringify({
          model: deepseekConfig.model,
          messages: completeMessages,
          temperature: deepseekConfig.parameters.temperature,
          max_tokens: deepseekConfig.parameters.max_tokens,
          top_p: deepseekConfig.parameters.top_p,
        }),
      };

      // 发送请求到DeepSeek API
      const response = await fetch(deepseekConfig.apiUrl, requestOptions);
      
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