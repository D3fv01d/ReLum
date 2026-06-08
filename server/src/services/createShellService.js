const { spawn } = require('child_process');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs');
const logger = require('../utils/logger');

const COMMAND_TIMEOUT_MS = 15000;
const SESSION_TTL_MINUTES = 30;
const SESSION_CLEANUP_INTERVAL_MS = 5 * 60 * 1000;

const DANGEROUS_COMMANDS = [
  'sudo', 'su', 'chmod', 'chown', 'dd', 'mkfs', 'mount', 'umount',
  'reboot', 'shutdown', 'halt', 'poweroff', 'init',
  'passwd', 'adduser', 'deluser', 'useradd', 'userdel',
  'rm -rf /',
];

const getMainCommand = (command) => command.trim().split(/\s+/)[0]?.toLowerCase() || '';

const isDangerousCommand = (command) => {
  const mainCommand = getMainCommand(command);
  return DANGEROUS_COMMANDS.includes(mainCommand) ||
    DANGEROUS_COMMANDS.some(dangerousCommand => command.includes(dangerousCommand));
};

const getShellInvocation = (command) => {
  if (process.platform === 'win32') {
    return {
      command: 'cmd.exe',
      args: ['/d', '/s', '/c', command],
    };
  }

  return {
    command: process.env.SHELL || '/bin/sh',
    args: ['-lc', command],
  };
};

const resolveCdTarget = (command, cwd) => {
  const targetDir = command.trim().slice(2).trim() || '.';
  const newDir = path.resolve(cwd, targetDir);

  if (!fs.existsSync(newDir) || !fs.statSync(newDir).isDirectory()) {
    throw new Error(`cd: ${targetDir}: 没有这样的目录`);
  }

  return newDir;
};

const createShellService = ({ name, getWorkingDirectory, helpText }) => {
  const activeSessions = new Map();

  const createSession = () => {
    const sessionId = uuidv4();
    const workingDirectory = getWorkingDirectory();
    const session = {
      id: sessionId,
      createdAt: new Date(),
      lastActivity: new Date(),
      workingDirectory,
      commands: [],
    };

    activeSessions.set(sessionId, session);
    logger.info(`创建新的${name}会话: ${sessionId}, 工作目录: ${workingDirectory}`);

    return session;
  };

  const executeCommandWithLimits = (command, cwd) => {
    return new Promise((resolve, reject) => {
      const trimmedCommand = command.trim();

      if (trimmedCommand === 'cd' || trimmedCommand.startsWith('cd ')) {
        try {
          return resolve({ type: 'cd', newDir: resolveCdTarget(trimmedCommand, cwd) });
        } catch (error) {
          return reject(error);
        }
      }

      if (trimmedCommand === 'help') {
        return resolve(helpText);
      }

      const shell = getShellInvocation(command);
      let output = '';
      let errorOutput = '';

      const child = spawn(shell.command, shell.args, {
        cwd,
        shell: false,
        timeout: COMMAND_TIMEOUT_MS,
      });

      child.stdout.on('data', (data) => {
        output += data.toString();
      });

      child.stderr.on('data', (data) => {
        errorOutput += data.toString();
      });

      child.on('close', (code) => {
        if (code !== 0) {
          reject(new Error(errorOutput || `命令执行失败，退出代码: ${code}`));
          return;
        }

        resolve(output || '命令执行成功（无输出）');
      });

      child.on('error', (error) => {
        reject(new Error(`执行错误: ${error.message}`));
      });

      child.on('timeout', () => {
        child.kill();
        reject(new Error(`命令执行超时（${COMMAND_TIMEOUT_MS / 1000}秒）`));
      });
    });
  };

  const terminateSession = (session) => {
    if (!session) return;

    logger.info(`终止${name}会话: ${session.id}`);
    activeSessions.delete(session.id);
  };

  const executeCommand = async (session, command) => {
    if (!session || !activeSessions.has(session.id)) {
      throw new Error('无效的会话');
    }

    const trimmedCommand = command.trim();

    session.lastActivity = new Date();
    session.commands.push({
      timestamp: new Date(),
      command,
    });

    logger.command(command, session.id);

    if (trimmedCommand.toLowerCase() === 'exit') {
      terminateSession(session);
      return '会话已终止';
    }

    if (trimmedCommand.toLowerCase() === 'clear') {
      return '';
    }

    if (isDangerousCommand(command)) {
      logger.security(`执行危险命令: ${command}`, session.id);
    }

    try {
      const result = await executeCommandWithLimits(command, session.workingDirectory);

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

  setInterval(() => {
    const now = new Date();

    activeSessions.forEach(session => {
      const inactiveMinutes = (now - session.lastActivity) / (1000 * 60);

      if (inactiveMinutes > SESSION_TTL_MINUTES) {
        logger.info(`自动清理不活跃会话: ${session.id}`);
        terminateSession(session);
      }
    });
  }, SESSION_CLEANUP_INTERVAL_MS);

  return {
    createSession,
    executeCommand,
    terminateSession,
  };
};

module.exports = createShellService;
