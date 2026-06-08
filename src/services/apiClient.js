const DEFAULT_API_PORT = '8080';

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

const requestJson = async (path, options = {}) => {
  const { body, headers, ...restOptions } = options;
  const requestHeaders = {
    Accept: 'application/json',
    'Cache-Control': 'no-cache',
    ...headers,
  };

  const requestOptions = {
    ...restOptions,
    headers: requestHeaders,
  };

  if (body !== undefined) {
    requestHeaders['Content-Type'] = 'application/json';
    requestOptions.body = JSON.stringify(body);
  }

  const response = await fetch(`${getApiBaseUrl()}${path}`, requestOptions);
  const data = await parseJsonResponse(response);

  if (!response.ok) {
    throw new Error(data?.message || `HTTP错误 ${response.status}`);
  }

  return data;
};

export { getApiBaseUrl, requestJson };
