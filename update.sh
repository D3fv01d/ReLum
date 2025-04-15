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
if [ ! -d ".git" ] || [ ! -f "./docker-compose.yml" ]; then
  print_error "请在项目根目录运行此脚本"
  exit 1
fi

# 检查Git是否安装
if ! command -v git &> /dev/null; then
  print_error "Git未安装，请先安装Git"
  exit 1
fi

# 检查Docker是否安装
if ! command -v docker &> /dev/null; then
  print_error "Docker未安装，请先安装Docker"
  exit 1
fi

# 检查docker-compose是否安装
if ! command -v docker-compose &> /dev/null; then
  print_error "docker-compose未安装，请先安装docker-compose"
  exit 1
fi

# 检查Docker是否在运行
if ! docker info &> /dev/null; then
  print_error "Docker服务未启动，请先启动Docker服务"
  exit 1
fi

# 显示当前分支和状态
print_message "当前分支和状态:"
git status -s

# 询问是否有未保存的更改需要保存
read -p "$(echo -e ${YELLOW}"是否有未保存的更改需要提交? (y/n): "${NC})" save_changes
if [[ $save_changes == "y" || $save_changes == "Y" ]]; then
  read -p "$(echo -e ${YELLOW}"请输入提交描述: "${NC})" commit_message
  git add .
  git commit -m "$commit_message"
  print_message "本地更改已提交"
fi

# 拉取最新代码
print_message "正在从远程仓库拉取最新代码..."
git pull

# 如果有冲突，退出脚本
if [ $? -ne 0 ]; then
  print_error "拉取代码时出现冲突，请手动解决后再运行更新脚本"
  exit 1
fi

# 询问是否需要重建镜像
read -p "$(echo -e ${YELLOW}"是否需要重建Docker镜像? (y/n): "${NC})" rebuild_image
if [[ $rebuild_image == "y" || $rebuild_image == "Y" ]]; then
  # 停止当前运行的容器
  print_message "正在停止当前运行的容器..."
  docker-compose down
  
  # 重建并启动容器
  print_message "正在重建并启动容器..."
  docker-compose up -d --build
else
  # 仅重启容器
  print_message "正在重启容器，应用最新代码..."
  docker-compose down
  docker-compose up -d
fi

# 清理未使用的镜像
read -p "$(echo -e ${YELLOW}"是否清理未使用的Docker镜像和容器? (y/n): "${NC})" clean_docker
if [[ $clean_docker == "y" || $clean_docker == "Y" ]]; then
  print_message "正在清理未使用的Docker镜像和容器..."
  # 清理未使用的容器
  docker container prune -f
  # 清理未使用的镜像
  docker image prune -f
  print_message "清理完成"
fi

# 等待服务完全启动
print_message "正在等待服务启动完成..."
sleep 5

# 获取容器状态
CONTAINER_STATUS=$(docker-compose ps | grep "relum")
if [ -z "$CONTAINER_STATUS" ]; then
  print_error "容器启动失败，请使用 'docker-compose logs' 查看详细日志"
  exit 1
fi

# 获取宿主机IP地址
HOST_IP=$(hostname -I | awk '{print $1}')

# 显示启动信息
print_message "${GREEN}ReLum 安全实验平台已成功更新并启动！${NC}"
print_message "访问地址："
print_message "本地访问：${BLUE}http://localhost:3000${NC}"
if [ ! -z "$HOST_IP" ]; then
  print_message "网络访问：${BLUE}http://$HOST_IP:3000${NC}"
fi
print_message "API服务：${BLUE}http://localhost:8080${NC}"
print_message ""
print_message "使用以下命令查看日志："
print_message "  前端日志: ${YELLOW}docker-compose logs -f relum-frontend${NC}"
print_message "  后端日志: ${YELLOW}docker-compose logs -f relum-backend${NC}"
print_message ""
print_message "使用以下命令停止服务："
print_message "  ${YELLOW}docker-compose down${NC}"
print_message ""
print_message "祝使用愉快！"
