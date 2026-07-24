# ReLum 本地靶场使用与开发指南

## 1. 定位

ReLum 的靶场面向本地安装学习，运行方式接近 Pikachu：用户在知识章节中启动题目，后端在本机 Docker 中创建隔离容器，用户完成实验后提交容器内取得的 flag。

当前知识库包含 28 个专题、137 个章节。每个章节都有独立场景 ID、容器名称和安装级唯一 flag，但共享 `relum/local-lab:latest` 运行时镜像，避免维护 137 份重复基础镜像。

## 2. 架构

```text
知识章节
  -> src/shared/challengeCatalog.js
  -> src/shared/targetEnvironments.js
  -> POST /api/target/start
  -> server/src/services/challengeFlagService.js
  -> RELUM_KNOWLEDGE_ID / RELUM_SECTION_TITLE / RELUM_FLAG
  -> relum/local-lab:latest
  -> 对应实验引擎
```

关键边界：

- `challengeCatalog.js` 只保存题目标识，不保存答案或 flag。
- flag 由 ReLum 后端根据本机安装密钥派生。
- 镜像读取 `RELUM_FLAG`，只有实验成功后才返回它。
- 前端只提交用户输入和最终 flag，不包含正确答案。
- 本地镜像不存在时，后端使用仓库内 Dockerfile 构建，不访问不存在的远程 `relum/*` 仓库。

## 3. 实验引擎

| 引擎 | 适用知识 | 实际行为 |
| --- | --- | --- |
| `sql` | SQL 注入 | 使用容器内 SQLite 执行易受攻击查询，覆盖字符、数字、UNION、报错、盲注、二阶和过滤绕过 |
| `xss` | XSS | 在受害者页面真实写入 DOM，脚本必须回传训练 Cookie 才能完成 |
| `csrf` | CSRF | 使用带会话状态的账户接口执行 GET、POST 和 Token 场景 |
| `upload` | 文件上传 | 写入容器临时文件系统并执行 MIME、扩展名、内容、二次处理和竞争校验 |
| `file-read` | 下载、包含 | 对容器文件系统执行路径解析、编码和伪协议读取 |
| `command` | 命令执行 | 仅在隔离容器内启动受限 Shell 子进程 |
| `xxe` | XML 实体 | 解析训练用外部文件实体，外部网络实体保持禁用 |
| `logic/auth/access/api` | 业务、认证、授权、API | 使用有状态账号、对象、角色、租户和接口字段完成越界验证 |
| `ssrf` | SSRF | 由容器内服务端实际请求本机内部元数据端点 |
| `deserialize/token` | 反序列化、JWT、OAuth | 处理类型标记、签名、算法、重定向和 scope 条件 |
| `linux/crypto/artifact` | Linux、密码、逆向、平台研究 | 对命令输出、编码、哈希、十六进制和最小复现证据进行分析 |
| `forensics/detection` | 取证、DFIR、检测工程 | 分析日志、流量摘要、时间线、IOC、规则和 ATT&CK 映射 |

中间件、组件、框架、CMS、数据库和 CVE 类题目使用隔离的“最小复现”，重现识别信号、配置缺陷或漏洞根因，不打包完整历史厂商产品，避免镜像体积、许可和已知恶意利用面的失控。

## 4. 构建与启动

手动构建统一镜像：

```bash
npm run lab:build
```

正常使用时无需手动构建。在知识章节中点击“启动靶场”，后端发现镜像不存在后会自动执行本地构建。

开发时可以不使用 Docker 启动一个安全场景：

```bash
npm run lab:serve
```

该命令默认启动“字符型 SQL 注入”，访问 `http://127.0.0.1:8080`。命令执行引擎在宿主机模式下强制禁用。

## 5. 解题示例

### 字符型 SQL 注入

1. 启动“SQL 注入漏洞 -> 字符型 SQL 注入”。
2. 用普通用户名建立返回基线。
3. 构造闭合和恒真条件，让查询返回隐藏的 `vault` 记录。
4. 页面只有在 SQLite 查询结果包含容器注入 flag 时才显示成功。
5. 把该 flag 提交回 ReLum 章节页面。

### 反射型 XSS

1. 提交会执行 JavaScript 的 HTML。
2. 让脚本读取受害者页面中的 `admin_token` Cookie。
3. 把 Cookie 发送到 `/api/xss/collect?proof=`。
4. 收集端点验证浏览器实际回传的证明后才释放 flag。

### 取证与检测

1. 打开题目工件。
2. 固定时间范围和数据源。
3. 从日志、流量摘要或规则测试结果中提取唯一证明字符串。
4. 提交分析结果；只有与服务端场景答案一致才返回 flag。

## 6. 安全隔离

统一容器默认使用：

- 只读根文件系统；
- 独立 `/tmp` 和 `/challenge` tmpfs；
- 非 root 用户 `10001`；
- 删除全部 Linux capabilities；
- `no-new-privileges`；
- 内存、CPU 和进程数量限制；
- 命令长度、请求体和执行时间限制；
- SSRF 禁止访问外部网络目标。

靶场仍是故意脆弱应用，只应绑定本机或受信任局域网，不应部署到公网。

## 7. 新增知识章节

1. 在 `src/data/knowledgeDetails.js` 增加章节。
2. 在 `src/shared/challengeCatalog.js` 增加完全一致的章节标题。
3. 如果现有类别引擎不适用，在 `labs/relum-lab/src/scenarios.js` 增加新的引擎或类别配置。
4. 增加成功和失败路径测试。
5. 执行：

```bash
npm run verify
```

一致性测试会检查知识章节、目录和 Docker 目标是否一一对应。
