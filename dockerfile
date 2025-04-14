FROM node:18-alpine

# 设置工作目录
WORKDIR /app

# 安装docker客户端
RUN apk add --no-cache docker curl wget net-tools procps

# 设置环境变量
ENV NODE_ENV=production

# 复制项目文件
COPY package*.json ./
COPY server/package*.json ./server/

# 安装依赖
RUN npm install --production=false && \
    cd server && npm install --production=false && cd ..

# 复制整个项目
COPY . .

# 构建前端应用
RUN npm run build

# 暴露端口
EXPOSE 3000 8080

# 启动命令
CMD ["sh", "docker-start.sh"]
