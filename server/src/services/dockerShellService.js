const createShellService = require('./createShellService');

const helpText = `ReLum Docker安全实验终端帮助:\n\n` +
  `该终端允许执行Docker容器内的命令，并可访问挂载的主机文件系统。\n` +
  `安全实验使用示例:\n` +
  `- ls -la: 列出目录内容（包括隐藏文件）\n` +
  `- pwd: 显示当前目录\n` +
  `- whoami: 显示当前用户\n` +
  `- ps aux: 显示所有进程\n` +
  `- netstat -an: 显示网络连接\n` +
  `- cd /host-system: 进入主机文件系统（如需查看主机文件）\n` +
  `- find /app -name "*.js" 2>/dev/null: 查找应用中的JS文件\n` +
  `- exit: 断开Shell连接\n\n` +
  `注意: 主机文件系统被挂载在/host-system目录下（只读模式）\n` +
  `默认工作目录为/app（应用根目录）`;

module.exports = createShellService({
  name: 'Docker Shell',
  getWorkingDirectory: () => process.env.RELUM_DOCKER_SHELL_CWD || '/app',
  helpText,
});
