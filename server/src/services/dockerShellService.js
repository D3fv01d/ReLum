/**
 * Docker环境中的Shell服务
 * 在Docker容器中运行时，使用此服务处理Shell命令
 */

const { spawn } = require('child_process');
const { v4: uuidv4 } = require('uuid');
const logger = require('../utils/logger');
const path = require('path');
const fs = require('fs');
const os = require('os');

// 活跃会话存储
const activeSessions = new Map();

// 危险命令警告（仅作记录，不阻止执行）
const DANGEROUS_COMMANDS = [
  'sudo', 'su', 'chmod', 'chown', 'dd', 'mkfs', 'mount', 'umount',
  'reboot', 'shutdown', 'halt', 'poweroff', 'init', 
  'passwd', 'adduser', 'deluser', 'useradd', 'userdel',
  'rm -rf /'
];

// 检查是否是危险命令（仅记录，不阻止）
const isDangerousCommand = (command) => {
  const mainCommand = command.split(' ')[0].toLowerCase();
  return DANGEROUS_COMMANDS.includes(mainCommand) || 
         DANGEROUS_COMMANDS.some(dc => command.includes(dc));
};

// 获取Docker容器内的工作目录
const getDockerWorkingDirectory = () => {
  // 使用容器内的/app目录作为默认工作目录
  return '/app';
};

// 创建新的Shell会话
const createSession = () => {
  const sessionId = uuidv4();
  
  // 在Docker环境中使用容器内的工作目录
  const workingDir = getDockerWorkingDirectory();
  
  const session = {
    id: sessionId,
    createdAt: new Date(),
    lastActivity: new Date(),
    workingDirectory: workingDir,
    commands: []
  };
  
  activeSessions.set(sessionId, session);
  logger.info(`创建新的Docker Shell会话: ${sessionId}, 工作目录: ${workingDir}`);
  
  return session;
};

// 执行命令的包装函数，添加超时
const executeCommandWithLimits = (command, cwd) => {
  return new Promise((resolve, reject) => {
    let output = '';
    let errorOutput = '';
    
    // 分割命令和参数
    const parts = command.split(' ');
    const cmd = parts[0];
    const args = parts.slice(1).filter(arg => arg.trim() !== '');
    
    // 特殊命令处理
    if (cmd === 'cd') {
      // cd命令需要特殊处理，因为它改变的是当前进程的目录，而不是创建新进程
      try {
        const targetDir = args[0] || '.';
        const newDir = path.resolve(cwd, targetDir);
        
        // 检查目录是否存在且可访问
        const hostSystemPath = process.env.HOST_SYSTEM_PATH || '/host-system';
        const isInHostSystem = newDir.startsWith(hostSystemPath);
        
        if (!fs.existsSync(newDir) || !fs.statSync(newDir).isDirectory()) {
          return reject(new Error(`cd: ${targetDir}: 没有这样的目录`));
        }
        
        // 返回新目录路径，让调用者更新会话的工作目录
        return resolve({ type: 'cd', newDir });
      } catch (error) {
        return reject(error);
      }
    }
    
    if (cmd === 'help') {
      // 自定义help命令
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
      return resolve(helpText);
    }
    
    // 创建子进程执行命令
    const process = spawn(cmd, args, {
      cwd,
      shell: true,
      timeout: 15000, // 15秒超时
    });
    
    // 收集输出
    process.stdout.on('data', (data) => {
      output += data.toString();
    });
    
    process.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });
    
    // 处理进程结束
    process.on('close', (code) => {
      if (code !== 0) {
        if (errorOutput) {
          reject(new Error(errorOutput));
        } else {
          reject(new Error(`命令执行失败，退出代码: ${code}`));
        }
      } else {
        resolve(output || '命令执行成功（无输出）');
      }
    });
    
    // 处理错误
    process.on('error', (err) => {
      reject(new Error(`执行错误: ${err.message}`));
    });
    
    // 处理超时
    process.on('timeout', () => {
      process.kill();
      reject(new Error('命令执行超时（15秒）'));
    });
  });
};

// 执行命令
const executeCommand = async (session, command) => {
  if (!session || !activeSessions.has(session.id)) {
    throw new Error('无效的会话');
  }
  
  // 更新最后活动时间
  session.lastActivity = new Date();
  session.commands.push({
    timestamp: new Date(),
    command
  });
  
  // 记录命令执行
  logger.command(command, session.id);
  
  // 处理特殊命令
  if (command.trim().toLowerCase() === 'exit') {
    terminateSession(session);
    return '会话已终止';
  }
  
  // 特殊处理clear命令，直接返回空结果
  if (command.trim().toLowerCase() === 'clear') {
    return '';  // 返回空字符串，前端会清除历史
  }
  
  // 检查是否为危险命令，但仍允许执行
  if (isDangerousCommand(command)) {
    logger.security(`执行危险命令: ${command}`, session.id);
    // 允许执行，但记录警告
  }
  
  try {
    // 执行命令
    const result = await executeCommandWithLimits(
      command, 
      session.workingDirectory
    );
    
    // 处理特殊返回值
    if (result && typeof result === 'object' && result.type === 'cd') {
      session.workingDirectory = result.newDir;
      return `当前目录: ${result.newDir}`;
    }
    
    return result;
  } catch (error) {
    logger.error(`命令执行错误 [${session.id}]: ${error.message}`);
    throw error;
  }
};

// 终止会话
const terminateSession = (session) => {
  if (!session) return;
  
  logger.info(`终止Docker Shell会话: ${session.id}`);
  activeSessions.delete(session.id);
};

// 定期清理长时间不活跃的会话
setInterval(() => {
  const now = new Date();
  activeSessions.forEach(session => {
    const inactiveMinutes = (now - session.lastActivity) / (1000 * 60);
    if (inactiveMinutes > 30) { // 30分钟不活跃则自动清理
      logger.info(`自动清理不活跃会话: ${session.id}`);
      terminateSession(session);
    }
  });
}, 5 * 60 * 1000);

module.exports = {
  createSession,
  executeCommand,
  terminateSession
}; 