const DEFAULT_API_PORT = '8080';
const DEFAULT_API_TIMEOUT_MS = 15000;

const trimTrailingSlash = (value) => value.replace(/\/+$/, '');

const getApiBaseUrl = () => {
  const configuredBaseUrl = process.env.REACT_APP_API_BASE_URL;
  if (configuredBaseUrl) {
    return trimTrailingSlash(configuredBaseUrl);
  }

  const { protocol, hostname } = window.location;
  return `${protocol}//${hostname}:${DEFAULT_API_PORT}/api`;
};

const parseJsonResponse = async (response) => {
  const text = await response.text();

  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch (error) {
    throw new Error(`JSON解析失败: ${error.message}`);
  }
};

const getRequestTimeout = (timeoutMs) => {
  const configuredTimeout = Number.parseInt(process.env.REACT_APP_API_TIMEOUT_MS, 10);
  return timeoutMs || configuredTimeout || DEFAULT_API_TIMEOUT_MS;
};

const getResponseMeta = (response) => ({
  requestId: response.headers.get('X-Request-Id') || null,
  rateLimit: {
    limit: response.headers.get('X-RateLimit-Limit') || null,
    remaining: response.headers.get('X-RateLimit-Remaining') || null,
    reset: response.headers.get('X-RateLimit-Reset') || null,
  },
});

const createApiError = (response, data) => {
  const error = new Error(data?.message || `HTTP错误 ${response.status}`);
  error.status = response.status;
  Object.assign(error, getResponseMeta(response));
  return error;
};

const requestJson = async (path, options = {}) => {
  const { body, headers, timeoutMs, ...restOptions } = options;
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => {
    controller.abort();
  }, getRequestTimeout(timeoutMs));

  const requestHeaders = {
    Accept: 'application/json',
    'Cache-Control': 'no-cache',
    ...headers,
  };

  const requestOptions = {
    ...restOptions,
    headers: requestHeaders,
    signal: controller.signal,
  };

  if (body !== undefined) {
    requestHeaders['Content-Type'] = 'application/json';
    requestOptions.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(`${getApiBaseUrl()}${path}`, requestOptions);
    const data = await parseJsonResponse(response);

    if (!response.ok) {
      throw createApiError(response, data);
    }

    return data;
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('请求超时，请检查后端服务或网络连接');
    }

    throw error;
  } finally {
    window.clearTimeout(timeoutId);
  }
};

export { getApiBaseUrl, requestJson };
