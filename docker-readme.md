# ReLum Docker部署说明

## 环境要求

- Docker
- Docker Compose

## 快速开始

### 1. 构建并启动容器

```bash
# 在项目根目录下运行
docker-compose up -d
```

启动后可通过以下地址访问:
- 前端界面: http://localhost:3000
- 后端API: http://localhost:8080

### 2. 查看日志

```bash
# 查看容器日志
docker logs relum-app

# 实时查看日志
docker logs -f relum-app
```

### 3. 停止服务

```bash
docker-compose down
```

## 自定义配置

如需修改配置，可以编辑以下文件:

1. `server/.env` - 后端服务配置
2. `docker-compose.yml` - Docker服务配置

## 开发模式

如果需要在开发模式下使用Docker:

1. 修改`docker-compose.yml`文件中的环境变量:
```yaml
environment:
  - NODE_ENV=development
```

2. 重新构建并启动容器:
```bash
docker-compose up -d --build
```

## 常见问题

### 端口冲突

如果3000或8080端口已被占用，可以在`docker-compose.yml`中修改映射:

```yaml
ports:
  - "3001:3000"  # 将本地3001端口映射到容器的3000端口
  - "8081:8080"  # 将本地8081端口映射到容器的8080端口
```

### 容器无法启动

检查日志:
```bash
docker logs relum-app
```

如遇到权限问题，请确保`docker-start.sh`具有执行权限:
```bash
chmod +x docker-start.sh
```

### 文件权限问题

如果遇到日志目录权限问题，可以尝试:
```bash
mkdir -p server/logs
chmod -R 777 server/logs
``` 