const AI_PROVIDER_PRESETS = {
  deepseek: {
    id: 'deepseek',
    label: 'DeepSeek',
    apiFormat: 'openai-compatible',
    defaultApiUrl: 'https://api.deepseek.com/v1/chat/completions',
    defaultModel: 'deepseek-chat',
    requiresApiKey: true,
    description: 'DeepSeek 官方 API，兼容 OpenAI Chat Completions 格式。',
  },
  openai: {
    id: 'openai',
    label: 'OpenAI',
    apiFormat: 'openai-compatible',
    defaultApiUrl: 'https://api.openai.com/v1/chat/completions',
    defaultModel: 'gpt-4o-mini',
    requiresApiKey: true,
    description: 'OpenAI 官方 Chat Completions API。',
  },
  'openai-compatible': {
    id: 'openai-compatible',
    label: 'OpenAI 兼容',
    apiFormat: 'openai-compatible',
    defaultApiUrl: '',
    defaultModel: '',
    requiresApiKey: false,
    description: '适配任意兼容 /v1/chat/completions 的云端、私有化或网关服务。',
  },
  ollama: {
    id: 'ollama',
    label: 'Ollama 本地',
    apiFormat: 'ollama',
    defaultApiUrl: 'http://localhost:11434/api/chat',
    defaultModel: 'llama3.1',
    requiresApiKey: false,
    local: true,
    description: 'Ollama 原生本地 API，默认地址为 localhost:11434。',
  },
  'lm-studio': {
    id: 'lm-studio',
    label: 'LM Studio 本地',
    apiFormat: 'openai-compatible',
    defaultApiUrl: 'http://localhost:1234/v1/chat/completions',
    defaultModel: 'local-model',
    requiresApiKey: false,
    local: true,
    description: 'LM Studio 本地 OpenAI 兼容服务。',
  },
  vllm: {
    id: 'vllm',
    label: 'vLLM 本地/私有',
    apiFormat: 'openai-compatible',
    defaultApiUrl: 'http://localhost:8000/v1/chat/completions',
    defaultModel: 'local-model',
    requiresApiKey: false,
    local: true,
    description: 'vLLM OpenAI 兼容服务。',
  },
  localai: {
    id: 'localai',
    label: 'LocalAI 本地',
    apiFormat: 'openai-compatible',
    defaultApiUrl: 'http://localhost:8081/v1/chat/completions',
    defaultModel: 'local-model',
    requiresApiKey: false,
    local: true,
    description: 'LocalAI OpenAI 兼容服务。',
  },
  anthropic: {
    id: 'anthropic',
    label: 'Anthropic Claude',
    apiFormat: 'anthropic',
    defaultApiUrl: 'https://api.anthropic.com/v1/messages',
    defaultModel: 'claude-3-5-sonnet-latest',
    requiresApiKey: true,
    description: 'Anthropic Messages API。',
  },
  gemini: {
    id: 'gemini',
    label: 'Google Gemini',
    apiFormat: 'gemini',
    defaultApiUrl: 'https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent',
    defaultModel: 'gemini-1.5-flash',
    requiresApiKey: true,
    description: 'Google Gemini generateContent API。',
  },
};

const AI_PROVIDER_OPTIONS = [
  AI_PROVIDER_PRESETS.deepseek,
  AI_PROVIDER_PRESETS.openai,
  AI_PROVIDER_PRESETS['openai-compatible'],
  AI_PROVIDER_PRESETS.ollama,
  AI_PROVIDER_PRESETS['lm-studio'],
  AI_PROVIDER_PRESETS.vllm,
  AI_PROVIDER_PRESETS.localai,
  AI_PROVIDER_PRESETS.anthropic,
  AI_PROVIDER_PRESETS.gemini,
];

const getAiProviderPreset = (provider) => (
  AI_PROVIDER_PRESETS[provider] || AI_PROVIDER_PRESETS['openai-compatible']
);

export {
  AI_PROVIDER_OPTIONS,
  AI_PROVIDER_PRESETS,
  getAiProviderPreset,
};
