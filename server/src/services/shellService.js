const os = require('os');
const createShellService = require('./createShellService');

const helpText = `ReLum安全实验终端帮助:\n\n` +
  `该终端允许执行任何系统命令，请谨慎使用。\n` +
  `安全实验使用示例:\n` +
  `- ls -la: 列出目录内容（包括隐藏文件）\n` +
  `- pwd: 显示当前目录\n` +
  `- whoami: 显示当前用户\n` +
  `- ps aux: 显示所有进程\n` +
  `- netstat -an: 显示网络连接\n` +
  `- cat /etc/passwd: 查看系统用户信息\n` +
  `- find / -name "*.conf" 2>/dev/null: 查找配置文件\n` +
  `- exit: 断开Shell连接\n\n` +
  `注意: 危险命令(rm -rf、chmod等)仍然可以执行，请谨慎操作以免损坏系统`;

module.exports = createShellService({
  name: 'Shell',
  getWorkingDirectory: () => os.homedir(),
  helpText,
});
