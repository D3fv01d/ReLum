const { execFile } = require('child_process');

const DOCKER_COMMAND_TIMEOUT = Number.parseInt(process.env.DOCKER_COMMAND_TIMEOUT_MS, 10) || 10000;

const runDockerCommand = (args, options = {}) => {
  return new Promise((resolve, reject) => {
    execFile('docker', args, {
      timeout: DOCKER_COMMAND_TIMEOUT,
      ...options
    }, (error, stdout, stderr) => {
      if (error) {
        error.stderr = stderr;
        reject(error);
        return;
      }

      resolve({ stdout, stderr });
    });
  });
};

const splitDockerParams = (params = '') => (
  params.trim() ? params.trim().split(/\s+/) : []
);

const buildRunArgs = (platform, imageName, containerName, port, internalPort, options = {}) => {
  const args = [
    'run',
    '-d',
    '--platform',
    platform,
    '--name',
    containerName,
    '-p',
    `${port}:${internalPort}`,
  ];

  (options.env || []).forEach(env => {
    args.push('-e', env);
  });

  (options.volumes || []).forEach(volume => {
    args.push('-v', volume);
  });

  args.push(...splitDockerParams(options.dockerParams), imageName);

  return args;
};

module.exports = {
  buildRunArgs,
  runDockerCommand,
  splitDockerParams,
};
