const isValidPort = (port) => (
  port === null ||
  port === undefined ||
  (Number.isInteger(port) && port > 0 && port <= 65535)
);

const isValidDockerImage = (imageName) => (
  typeof imageName === 'string' &&
  imageName.length <= 255 &&
  /^[a-z0-9]+(?:[._/-][a-z0-9]+)*(?::[A-Za-z0-9_.-]+)?$/.test(imageName)
);

const isValidContainerName = (containerName) => (
  containerName === undefined ||
  (
    typeof containerName === 'string' &&
    containerName.length <= 128 &&
    /^[A-Za-z0-9][A-Za-z0-9_.-]*$/.test(containerName)
  )
);

const isValidRequiredContainerName = (containerName) => (
  containerName !== undefined && isValidContainerName(containerName)
);

const isValidStringArray = (value) => (
  value === undefined ||
  (
    Array.isArray(value) &&
    value.every(item => typeof item === 'string' && item.length <= 500 && !/[\r\n]/.test(item))
  )
);

const isValidDockerResourceId = (value) => (
  typeof value === 'string' &&
  value.length > 0 &&
  value.length <= 255 &&
  !/[\s\r\n]/.test(value) &&
  /^[A-Za-z0-9_./:@-]+$/.test(value)
);

const isValidProjectRelativePath = (value) => (
  value === undefined ||
  (
    typeof value === 'string' &&
    value.length > 0 &&
    value.length <= 255 &&
    !value.startsWith('/') &&
    !value.split(/[\\/]/).includes('..') &&
    !/[\r\n\0]/.test(value)
  )
);

const validateTargetPayload = (target) => {
  if (!target || typeof target !== 'object') {
    return '缺少必要参数';
  }

  if (!isValidDockerImage(target.dockerImage)) {
    return 'Docker镜像名称格式无效';
  }

  if (!isValidPort(target.port) || !isValidPort(target.internalPort)) {
    return '端口参数无效';
  }

  if (!isValidContainerName(target.containerName)) {
    return '容器名称格式无效';
  }

  if (!isValidStringArray(target.env) || !isValidStringArray(target.volumes)) {
    return '环境变量或卷挂载参数无效';
  }

  if (target.dockerParams !== undefined && typeof target.dockerParams !== 'string') {
    return 'Docker扩展参数无效';
  }

  if (
    !isValidProjectRelativePath(target.localBuildContext) ||
    !isValidProjectRelativePath(target.localDockerfile)
  ) {
    return '本地镜像构建路径无效';
  }

  return null;
};

module.exports = {
  isValidDockerImage,
  isValidDockerResourceId,
  isValidProjectRelativePath,
  isValidRequiredContainerName,
  validateTargetPayload,
};
