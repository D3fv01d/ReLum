const SAVED_CONFIG_KEY = 'deepseekConfig';

const DEFAULT_PARAMETERS = {
  temperature: 0.7,
  max_tokens: 1000,
  top_p: 0.95,
};

const clampNumber = (value, fallback, min, max) => {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return fallback;
  }

  return Math.min(Math.max(number, min), max);
};

const safeString = (value, fallback, maxLength) => {
  if (typeof value !== 'string') {
    return fallback;
  }

  return value.trim().slice(0, maxLength);
};

const isSafeApiUrl = (value) => {
  try {
    const url = new URL(value);
    return (
      url.protocol === 'https:' ||
      (url.protocol === 'http:' && ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname))
    );
  } catch (error) {
    return false;
  }
};

export const buildSafeAiConfig = (config = {}, fallback = {}) => {
  const fallbackParameters = fallback.parameters || DEFAULT_PARAMETERS;
  const candidateApiUrl = safeString(config.apiUrl, fallback.apiUrl || '', 500);
  const apiUrl = isSafeApiUrl(candidateApiUrl)
    ? candidateApiUrl
    : fallback.apiUrl || '';

  return {
    apiKey: safeString(config.apiKey, fallback.apiKey || '', 500),
    apiUrl,
    model: safeString(config.model, fallback.model || 'deepseek-chat', 100),
    systemPrompt: safeString(config.systemPrompt, fallback.systemPrompt || '', 4000),
    parameters: {
      temperature: clampNumber(config.parameters?.temperature, fallbackParameters.temperature, 0, 1),
      max_tokens: Math.round(clampNumber(config.parameters?.max_tokens, fallbackParameters.max_tokens, 100, 8000)),
      top_p: clampNumber(config.parameters?.top_p, fallbackParameters.top_p, 0, 1),
    },
  };
};

export const loadSavedAiConfig = (fallback) => {
  try {
    const savedConfig = localStorage.getItem(SAVED_CONFIG_KEY);
    return savedConfig ? buildSafeAiConfig(JSON.parse(savedConfig), fallback) : null;
  } catch (error) {
    console.error('读取AI配置失败:', error);
    return null;
  }
};

export const persistAiConfig = (config, fallback) => {
  const safeConfig = buildSafeAiConfig(config, fallback);
  localStorage.setItem(SAVED_CONFIG_KEY, JSON.stringify(safeConfig));
  return safeConfig;
};
