/**
 * AI 服务 - 处理云端和本地大模型 API 通信
 */
import { getAiProviderPreset } from '../config/aiProviders';
import { getActiveAiConfig } from './aiConfigService';

const buildChatMessages = (config, messages) => [
  {
    role: 'system',
    content: config.systemPrompt,
  },
  ...messages.map(msg => ({
    role: msg.role,
    content: msg.content,
  })),
];

const createHeaders = (headers = {}) => ({
  'Content-Type': 'application/json',
  ...headers,
});

const appendQueryParam = (url, key, value) => {
  const parsedUrl = new URL(url);
  parsedUrl.searchParams.set(key, value);
  return parsedUrl.toString();
};

const parseOpenAiCompatibleResponse = (data) => {
  const message = data.choices?.[0]?.message;
  const content = message?.content || data.choices?.[0]?.text;

  if (!content) {
    throw new Error('OpenAI兼容接口响应格式异常');
  }

  return {
    role: message?.role || 'assistant',
    content,
  };
};

const buildOpenAiCompatibleRequest = (config, messages) => {
  const headers = createHeaders();

  if (config.apiKey) {
    headers.Authorization = `Bearer ${config.apiKey}`;
  }

  return {
    url: config.apiUrl,
    options: {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model: config.model,
        messages: buildChatMessages(config, messages),
        temperature: config.parameters.temperature,
        max_tokens: config.parameters.max_tokens,
        top_p: config.parameters.top_p,
        stream: false,
      }),
    },
    parseResponse: parseOpenAiCompatibleResponse,
  };
};

const buildOllamaRequest = (config, messages) => {
  const headers = createHeaders();

  if (config.apiKey) {
    headers.Authorization = `Bearer ${config.apiKey}`;
  }

  return {
    url: config.apiUrl,
    options: {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model: config.model,
        messages: buildChatMessages(config, messages),
        stream: false,
        options: {
          temperature: config.parameters.temperature,
          top_p: config.parameters.top_p,
          num_predict: config.parameters.max_tokens,
        },
      }),
    },
    parseResponse(data) {
      const content = data.message?.content || data.response;

      if (!content) {
        throw new Error('Ollama响应格式异常');
      }

      return {
        role: 'assistant',
        content,
      };
    },
  };
};

const buildAnthropicRequest = (config, messages) => {
  const chatMessages = messages
    .filter(message => message.role === 'user' || message.role === 'assistant')
    .map(message => ({
      role: message.role,
      content: message.content,
    }));

  return {
    url: config.apiUrl,
    options: {
      method: 'POST',
      headers: createHeaders({
        'x-api-key': config.apiKey,
        'anthropic-version': '2023-06-01',
      }),
      body: JSON.stringify({
        model: config.model,
        system: config.systemPrompt,
        messages: chatMessages,
        temperature: config.parameters.temperature,
        max_tokens: config.parameters.max_tokens,
        top_p: config.parameters.top_p,
      }),
    },
    parseResponse(data) {
      const content = data.content
        ?.map(part => part.type === 'text' ? part.text : '')
        .join('')
        .trim();

      if (!content) {
        throw new Error('Anthropic响应格式异常');
      }

      return {
        role: 'assistant',
        content,
      };
    },
  };
};

const toGeminiRole = (role) => role === 'assistant' ? 'model' : 'user';

const buildGeminiRequest = (config, messages) => {
  const endpoint = config.apiUrl.includes('{model}')
    ? config.apiUrl.replace('{model}', encodeURIComponent(config.model))
    : config.apiUrl;

  return {
    url: appendQueryParam(endpoint, 'key', config.apiKey),
    options: {
      method: 'POST',
      headers: createHeaders(),
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: config.systemPrompt }],
        },
        contents: messages.map(message => ({
          role: toGeminiRole(message.role),
          parts: [{ text: message.content }],
        })),
        generationConfig: {
          temperature: config.parameters.temperature,
          topP: config.parameters.top_p,
          maxOutputTokens: config.parameters.max_tokens,
        },
      }),
    },
    parseResponse(data) {
      const content = data.candidates?.[0]?.content?.parts
        ?.map(part => part.text || '')
        .join('')
        .trim();

      if (!content) {
        throw new Error('Gemini响应格式异常');
      }

      return {
        role: 'assistant',
        content,
      };
    },
  };
};

const requestBuilders = {
  'openai-compatible': buildOpenAiCompatibleRequest,
  ollama: buildOllamaRequest,
  anthropic: buildAnthropicRequest,
  gemini: buildGeminiRequest,
};

class AIService {
  /**
   * 发送对话消息到DeepSeek API
   * @param {Array} messages - 对话历史消息数组
   * @returns {Promise} - 返回API响应的Promise
   */
  async sendMessage(messages, configOverride = null) {
    const activeConfig = getActiveAiConfig(configOverride);
    const providerPreset = getAiProviderPreset(activeConfig.provider);

    if (providerPreset.requiresApiKey && !activeConfig.apiKey) {
      throw new Error(`${providerPreset.label} API密钥未配置。请在设置页面填写API密钥。`);
    }

    if (!activeConfig.apiUrl) {
      throw new Error('AI接口地址未配置。请在设置页面填写API接口地址。');
    }

    if (!activeConfig.model) {
      throw new Error('AI模型名称未配置。请在设置页面填写模型名称。');
    }

    const buildRequest = requestBuilders[activeConfig.apiFormat] || buildOpenAiCompatibleRequest;
    const request = buildRequest(activeConfig, messages);

    try {
      const response = await fetch(request.url, request.options);
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(
          `API请求失败: ${response.status} ${response.statusText}${
            errorData ? ` - ${JSON.stringify(errorData)}` : ''
          }`
        );
      }

      const data = await response.json();
      return request.parseResponse(data);
    } catch (error) {
      console.error('AI API调用错误:', error);
      throw error;
    }
  }

  /**
   * 测试API连接
   * @returns {Promise<boolean>} - 连接是否成功
   */
  async testConnection(configOverride = null) {
    try {
      // 发送一个简单的测试消息
      await this.sendMessage([{ role: 'user', content: '测试连接' }], configOverride);
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
