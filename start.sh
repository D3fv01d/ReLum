#!/bin/bash

# 设置颜色变量
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
NC='\033[0m' # 无颜色

# 打印带颜色的消息
print_message() {
  echo -e "${GREEN}[ReLum]${NC} $1"
}

print_error() {
  echo -e "${RED}[错误]${NC} $1"
}

print_warning() {
  echo -e "${YELLOW}[警告]${NC} $1"
}

# 确保脚本在项目根目录运行
if [ ! -d "./server" ] || [ ! -f "./package.json" ]; then
  print_error "请在项目根目录运行此脚本"
  exit 1
fi

# 检查必要的端口是否可用
check_port() {
  local port=$1
  if lsof -i:$port -t >/dev/null 2>&1; then
    local pid=$(lsof -i:$port -t)
    print_warning "端口 $port 已被进程 $pid 占用，正在尝试结束该进程..."
    kill $pid
    sleep 2
    if lsof -i:$port -t >/dev/null 2>&1; then
      print_error "无法释放端口 $port，请手动终止进程后重试"
      return 1
    else
      print_message "端口 $port 已成功释放"
    fi
  fi
  return 0
}

# 检查必要的端口
print_message "检查端口..."
check_port 3000 || exit 1  # 前端默认端口
check_port 8080 || exit 1  # 后端默认端口

# 安装依赖
print_message "正在检查并安装前端依赖..."
if [ ! -d "./node_modules" ]; then
  print_message "安装前端依赖..."
  npm install || { print_error "前端依赖安装失败"; exit 1; }
else
  print_message "前端依赖已安装"
fi

print_message "正在检查并安装后端依赖..."
if [ ! -d "./server/node_modules" ]; then
  cd server
  print_message "安装后端依赖..."
  npm install || { print_error "后端依赖安装失败"; cd ..; exit 1; }
  cd ..
else
  print_message "后端依赖已安装"
fi

# 启动后端服务
print_message "正在启动后端服务..."
cd server
npm run dev &
BACKEND_PID=$!
cd ..

# 等待后端服务完全启动
print_message "等待后端服务启动..."
sleep 3

# 检查后端服务是否运行
if ! ps -p $BACKEND_PID > /dev/null; then
  print_error "后端服务启动失败"
  exit 1
fi

print_message "后端服务已在端口 8080 启动 (PID: $BACKEND_PID)"

# 启动前端服务
print_message "正在启动前端服务..."
npm start &
FRONTEND_PID=$!

# 等待前端服务完全启动
print_message "等待前端服务启动..."
sleep 5

# 检查前端服务是否运行
if ! ps -p $FRONTEND_PID > /dev/null; then
  print_error "前端服务启动失败"
  kill $BACKEND_PID
  exit 1
fi

print_message "前端服务已在端口 3000 启动 (PID: $FRONTEND_PID)"

# 显示启动信息
print_message "${GREEN}ReLum 安全实验平台已成功启动！${NC}"
print_message "前端访问地址：${BLUE}http://localhost:3000${NC}"
print_message "后端服务地址：${BLUE}http://localhost:8080${NC}"
print_message "按 Ctrl+C 可以终止所有服务"

# 等待用户按下Ctrl+C
trap "print_message '正在关闭服务...'; kill $FRONTEND_PID $BACKEND_PID 2>/dev/null; print_message '服务已关闭'; exit 0" INT
wait 