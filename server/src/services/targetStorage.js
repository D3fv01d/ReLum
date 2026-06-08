const fs = require('fs');
const os = require('os');
const path = require('path');

const getStoragePath = () => {
  const platform = os.platform();

  if (platform === 'linux') {
    return '/opt/relum/targets';
  }

  if (platform === 'darwin') {
    return path.join(os.homedir(), 'Library/Application Support/ReLum/targets');
  }

  if (platform === 'win32') {
    return 'C:\\ProgramData\\ReLum\\targets';
  }

  return path.join(os.homedir(), '.relum/targets');
};

const ensureStorageDir = () => {
  const storagePath = getStoragePath();

  if (!fs.existsSync(storagePath)) {
    fs.mkdirSync(storagePath, { recursive: true });
  }

  return storagePath;
};

module.exports = {
  ensureStorageDir,
  getStoragePath,
};
