# ReLum 靶场 Flag 接入规范

## 目标

每次 ReLum 安装拥有独立密钥。服务端使用该密钥和题目标识派生 flag，因此所有题目的 flag 唯一，不会出现在前端构建产物中。

## 镜像要求

启动题目时，ReLum 会向容器注入两个值相同的环境变量：

```text
RELUM_FLAG=flag{relum_<category>_<digest>}
FLAG=flag{relum_<category>_<digest>}
```

统一本地靶场镜像优先读取 `RELUM_FLAG`。`FLAG` 仅用于兼容常见 CTF 镜像约定。

```js
const challengeFlag = process.env.RELUM_FLAG || process.env.FLAG;
```

禁止在镜像源码、静态文件、Dockerfile 或前端 JavaScript 中写死 flag。题目完成后再由服务端模板或后端接口展示环境变量中的值。

## 验证流程

1. 前端提交 `knowledgeId`、`sectionTitle` 和用户输入。
2. `POST /api/flag/verify` 根据本机安装密钥重新派生正确值。
3. 服务端使用定时安全比较判断结果。
4. 只有服务端返回 `verified: true`，前端才记录章节完成。

## 密钥

- 本机运行：密钥默认存储在 ReLum 数据目录的 `.flag-secret` 文件中，权限为 `0600`。
- Docker Compose：`relum-data` 数据卷挂载到 `/opt/relum/targets`，重建容器不会改变已有 flag。
- 自动化部署：可以提供不少于 32 个字符的 `RELUM_FLAG_SECRET`。
- 不得把 `.flag-secret` 提交到 Git 或复制到公开日志。

## 旧镜像迁移

旧镜像如果仍显示写死 flag，必须修改为读取 `RELUM_FLAG` 后重新构建。迁移完成前，该镜像输出的旧 flag 不会通过新的服务端校验。

当前项目的 137 个章节默认使用仓库内 `labs/relum-lab/Dockerfile` 构建的 `relum/local-lab:latest`，不再依赖旧的外部占位镜像。运行时还会收到：

```text
RELUM_KNOWLEDGE_ID=<知识专题 ID>
RELUM_SECTION_TITLE=<章节标题>
RELUM_CHALLENGE_ID=<稳定场景 ID>
```

运行时根据这些标识选择实验逻辑，flag 仍只由后端注入。

## 发布前检查

```bash
cd server
npm test
```

测试会确认：

- 所有配置题目都能生成 flag。
- 所有 flag 互不重复。
- 注入容器的 flag 与服务端接受的 flag 完全一致。
- 未登记题目不能参与验证。
