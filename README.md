# ReLum - 网络安全漏洞实验场

这是一个使用React开发的网络安全学习平台前端项目。

## 项目描述

ReLum是一个专业的网络安全学习和实践平台，提供全面的漏洞实验环境和学习资源。

## 👥 项目协作

本项目为协作开发，主要参与者：

- **[@NullAura](https://github.com/NullAura)** — 主要开发者（[相关工作 NullAura/ReLum](https://github.com/NullAura/ReLum)）
- **[@lsdogXG (AsuTroyes)](https://github.com/lsdogXG)** — 共创者

## 功能特点

- 直观的用户界面，为用户提供良好的学习体验
- 漏洞实验环境，可以进行真实的安全测试
- 专业课程体系，从基础到高级的系统化学习
- 学习进度跟踪，帮助用户了解自己的学习情况
- 实时WebSocket Shell连接，提供真实命令执行环境
- 完整的网络安全知识库，涵盖28类主要安全漏洞、CTF基础和蓝队调查内容
- 可配置 AI 助手，支持 DeepSeek、OpenAI、Anthropic、Gemini、OpenAI 兼容接口和 Ollama、LM Studio、vLLM、LocalAI 等本地模型

## 知识库内容

平台包含以下28类网络安全知识和实验内容：

1. **SQL注入漏洞**：字符型SQL注入、数值型SQL注入、联合注入、报错注入、布尔盲注、时间盲注、二阶注入等
2. **跨站脚本漏洞**：反射型XSS、存储型XSS、DOM型XSS、XSS平台Cookie获取等
3. **跨站请求伪造漏洞**：GET型CSRF、POST型CSRF、CSRF漏洞POC改造、绕过Referer检测等
4. **任意文件上传漏洞**：JavaScript校验绕过、MIME类型检测绕过、扩展名校验绕过、文件内容检测绕过等
5. **任意文件下载漏洞**：路径遍历、未授权文件任意下载、敏感文件获取等
6. **命令/代码执行漏洞**：绕过字符串过滤限制、无回显命令执行、执行漏洞写木马、反弹shell等
7. **文件包含漏洞**：基础文件包含、敏感文件读取、日志文件包含、SESSION文件包含等
8. **XML外部实体注入漏洞**：有回显的XXE、无回显的XXE等
9. **业务逻辑漏洞**：用户名遍历、重放攻击、验证码复用、支付逻辑、越权等
10. **中间件漏洞**：Weblogic、Tomcat、Jboss等典型漏洞利用
11. **组件漏洞**：Shiro、Fastjson、Log4j等典型漏洞利用
12. **第三方框架漏洞**：Thinkphp、Struts2、Spring、若依框架等漏洞利用
13. **CMS漏洞利用实战**：Wordpress等常见CMS漏洞利用
14. **数据库漏洞利用实战**：MySQL、Redis、PostgreSQL典型漏洞利用
15. **认证与会话安全**：弱口令、多因素认证、会话固定、Cookie安全、密码重置等
16. **访问控制与越权**：IDOR、水平越权、垂直越权、功能级授权、多租户隔离等
17. **服务端请求伪造**：基础SSRF、内网访问、云元数据保护、协议与重定向绕过等
18. **API安全测试**：BOLA、批量赋值、GraphQL滥用、速率限制、错误信息泄露等
19. **反序列化与对象注入**：Java、PHP、Python对象反序列化风险和签名校验
20. **JWT与OAuth安全**：JWT签名、弱密钥、OAuth重定向、Scope和Token生命周期
21. **云原生与容器安全**：Docker、Kubernetes、云元数据、镜像密钥、CI/CD供应链
22. **CVE复现与漏洞研究**：环境复现、补丁对比、影响面评估、检测规则验证
23. **Linux与CTF基础**：Shell、文件权限、管道重定向、编码转换和关卡式笔记法
24. **密码学与编码**：编码、哈希、对称/非对称加密、签名、证书和随机数
25. **逆向与二进制基础**：ELF/PE、静态分析、动态调试、内存保护和安全编译
26. **取证与流量分析**：文件元数据、PCAP、日志时间线、内存取证和IOC提取
27. **蓝队调查与DFIR**：告警分诊、证据收集、遏制恢复、复盘改进
28. **威胁狩猎与检测工程**：狩猎假设、KQL/Sigma/YARA、ATT&CK映射、误报调优

开发调研记录见 [学习型靶场调研与知识库扩展记录](docs/learning-lab-research.md)。

## Shell实验环境

平台内置了一个基于WebSocket的实时Shell环境，可以：

- 通过安全的WebSocket连接执行命令
- 支持常见的Linux/Unix命令
- 提供沙箱环境进行安全实验
- 自动重连和错误处理机制

## AI助手配置

AI 助手支持云端 API、OpenAI 兼容网关和本地模型服务。打开 `设置 -> AI 模型配置` 后选择服务商，填写 API 地址、模型名称和密钥即可使用。本地模型如 Ollama、LM Studio、vLLM、LocalAI 通常无需密钥。

详细配置教程、示例和开发者扩展说明见 [AI 供应商与本地模型接入指南](docs/ai-providers.md)。

## 技术栈

- React 18
- React Router v6
- Tailwind CSS
- Font Awesome
- WebSocket实时通信

## 安装和运行

### 本地开发

1. 安装前端依赖：

```bash
npm install
```

2. 安装后端依赖：

```bash
cd server
npm install
cd ..
```

3. 准备环境变量：

```bash
cp .env.example .env
cp server/.env.example server/.env
```

4. 启动后端服务：

```bash
cd server
npm start
```

5. 在另一个终端启动前端：

```bash
npm start
```

### 提交前验证

```bash
npm run verify
```

该命令会执行前端生产构建、生产依赖审计、后端语法检查、后端健康检查、请求追踪响应头检查和目标 API 限流响应头检查。

### 构建 Docker 镜像

```bash
docker-compose build
```

## Docker环境使用与更新

### 启动Docker环境

```bash
docker-compose up -d
```

### 更新Docker环境（代码修改后）

1. 停止现有容器：

```bash
docker-compose down
```

2. 使用最新代码重新构建镜像：

```bash
docker-compose build
```

3. 启动新容器：

```bash
docker-compose up -d
```

## 项目结构

```
relum/
├── public/             # 静态资源
├── docs/               # 使用和开发文档
│   ├── ai-providers.md # AI供应商与本地模型接入指南
│   └── learning-lab-research.md # 学习型靶场调研与知识库扩展记录
├── src/                # 前端源代码
│   ├── components/     # 可复用组件
│   │   ├── Navbar.js         # 导航栏组件
│   │   ├── TargetSettings.js # 靶场环境设置组件
│   │   └── TerminalPanel.js  # Shell终端组件
│   ├── config/         # 配置文件
│   │   ├── ai.js             # AI助手配置
│   │   ├── aiProviders.js    # AI供应商预设
│   │   └── targetEnvironments.js # 靶场环境配置
│   ├── pages/          # 页面组件
│   │   ├── Dashboard.js      # 仪表盘页面
│   │   ├── Knowledge.js      # 知识库列表页面  
│   │   ├── KnowledgeDetail.js # 知识库详情页面
│   │   ├── Practice.js       # 实践页面
│   │   └── Settings.js       # 设置页面
│   ├── services/       # 服务层
│   │   ├── aiService.js      # AI请求适配服务
│   │   ├── aiConfigService.js # AI配置合并服务
│   │   ├── aiConfigStorage.js # AI配置安全存储
│   │   └── targetService.js  # 靶场环境服务
│   ├── App.js          # 主应用组件
│   ├── index.js        # 应用入口点
│   └── index.css       # 全局样式
├── server/             # 后端服务
│   ├── src/            # 后端源代码
│   │   ├── services/         # 后端服务层
│   │   ├── utils/            # 工具函数
│   │   └── index.js          # 服务入口点
│   ├── logs/           # 服务日志
│   ├── package.json    # 后端依赖
│   └── .env            # 环境变量
├── build/              # 构建输出目录
├── docker-compose.yml  # Docker Compose配置
├── dockerfile          # Docker构建文件
├── docker-start.sh     # Docker启动脚本
├── start.sh            # 本地启动脚本
├── package.json        # 前端依赖
├── tailwind.config.js  # Tailwind CSS配置
└── README.md           # 项目文档
```

## 未来计划

- 添加更多交互式漏洞实验环境
- 实现用户认证和进度保存
- 添加在线评测系统
- 集成AI辅助学习功能

# 最后更新时间: 2025年 4月 15日 星期二 16时38分49秒 CST
