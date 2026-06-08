/**
 * 默认 AI 配置文件
 * 可在设置页切换 DeepSeek、OpenAI、OpenAI 兼容服务和本地模型服务
 */

const aiConfig = {
  // 默认服务商，具体预设见 aiProviders.js
  provider: 'deepseek',

  // API密钥，本地模型可留空
  apiKey: '',

  // API接口地址，默认为DeepSeek的OpenAI兼容接口
  apiUrl: 'https://api.deepseek.com/v1/chat/completions',

  // 模型名称，可选择不同的模型，默认为deepseek-chat
  model: 'deepseek-chat',

  // 默认的系统提示词
  systemPrompt: '你是一个网络安全专家，可以回答用户关于网络安全的问题，提供专业的安全建议和指导。',

  // 对话参数
  parameters: {
    temperature: 0.7,    // 温度参数，控制输出的随机性，值越高表示越随机
    max_tokens: 1000,    // 每次请求返回的最大token数量
    top_p: 0.95,         // 核采样参数，控制输出的多样性
  }
};

export default aiConfig;
