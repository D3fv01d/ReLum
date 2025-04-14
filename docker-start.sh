#!/bin/sh

# 安装最新的依赖（如果有更新）
cd /app
echo "检查和安装最新依赖..."
npm install --silent 
cd /app/server
npm install --silent
cd /app

# 检查Docker是否可用
echo "检查Docker可用性..."
if ! docker --version > /dev/null 2>&1; then
  echo "警告: Docker客户端未安装或不可用，尝试安装..."
  apk add --no-cache docker
fi

# 检查Docker守护进程是否可访问
if ! docker info > /dev/null 2>&1; then
  echo "警告: 无法连接到Docker守护进程，检查Docker套接字是否正确挂载"
  echo "确保在启动容器时添加了以下卷挂载:"
  echo "  -v /var/run/docker.sock:/var/run/docker.sock"
else
  echo "Docker连接正常，可以管理Docker环境"
  docker info | grep "Server Version"
fi

# 安装调试工具
echo "安装调试工具..."
apk add --no-cache curl wget net-tools procps

# 启动后端服务
echo "启动后端服务..."
cd /app/server
NODE_ENV=production SHELL_ACCESS_ENABLED=true HOST_SYSTEM_PATH=/host-system WS_ENABLED=true DOCKER_HOST=unix:///var/run/docker.sock node src/index.js &
BACKEND_PID=$!

# 等待后端服务启动
echo "正在等待后端服务启动..."
sleep 10  # 增加更长等待时间，确保WebSocket服务准备就绪

# 检查后端服务是否运行 (Alpine Linux兼容方式)
if ! ps | grep -v grep | grep $BACKEND_PID > /dev/null; then
  echo "后端服务启动失败"
  exit 1
fi

# 检查8080端口是否监听
if ! netstat -tulpn | grep ':8080' > /dev/null; then
  echo "8080端口未监听"
  exit 1
fi

echo "后端服务已在端口 8080 启动"
echo "检查监听端口..."
netstat -tulpn | grep LISTEN

# 如果在生产环境，使用serve提供前端构建文件
if [ "$NODE_ENV" = "production" ]; then
  cd /app
  # 安装serve (如果需要)
  npm install -g serve
  serve -s build -l 3000 &
  FRONTEND_PID=$!
else
  # 启动前端开发服务器
  cd /app
  npm start &
  FRONTEND_PID=$!
fi

# 等待前端服务启动
echo "正在等待前端服务启动..."
sleep 5

# 确保所有服务正常运行
echo "检查所有服务..."
ps | grep node

echo "ReLum 平台已成功启动！"
echo "前端访问地址：http://localhost:3000"
echo "后端服务地址：http://localhost:8080"
echo "WebSocket Shell服务：ws://localhost:8080/api/shell"
echo "Docker靶场管理API：http://localhost:8080/api/target"

# 保持容器运行
wait 