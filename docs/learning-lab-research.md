# 学习型靶场调研与知识库扩展记录

本次扩展参考的是主流学习型靶场的一手资料和公开说明，目标不是复制题目或答案，而是吸收它们的信息架构、课程粒度和实践反馈方式。

## 参考平台

| 平台 | 主要学习模式 | ReLum 吸收点 |
| --- | --- | --- |
| [PortSwigger Web Security Academy](https://portswigger.net/web-security/learning-path) | Web 漏洞主题、交互式实验、难度分层 | 主题化章节、实验数量感、从基础到进阶的路径 |
| [OWASP WebGoat](https://owasp.org/www-project-webgoat/) | 解释漏洞、动手任务、缓解总结 | 每节固定为概念、实践、修复、复测 |
| [OWASP Juice Shop](https://owasp.org/www-project-juice-shop) | 故意脆弱应用、教程模式、计分板 | 实验状态反馈和挑战完成导向 |
| [TryHackMe Rooms](https://help.tryhackme.com/en/articles/6611837-rooms) | Learning Path、Module、Room、Task | 首页新增学习路线，详情页保留目录和任务粒度 |
| [HTB Academy Paths](https://academy.hackthebox.com/catalogue/paths) | Skill Paths 和 Job Role Paths | 路线按技能和岗位目标组织 |
| [OverTheWire](https://overthewire.org/) | 关卡式 Wargame、左侧目录 | 目录跳转、关卡式笔记法、Linux 基础路径 |
| [picoCTF](https://picoctf.org/research.html) | 面向入门者的小挑战和内置工具 | CTF 基础、短任务、工具环境提示 |
| [PentesterLab](https://pentesterlab.com/) | 真实漏洞、代码审计、徽章进度 | CVE 复现、代码审计、里程碑式学习 |
| [CyberDefenders](https://cyberdefenders.org/blue-team-labs/) | 蓝队调查、真实场景、证据驱动 | DFIR、威胁狩猎、时间线和报告结构 |
| [pwn.college](https://pwn.college/welcome/welcome/) | 资源和挑战分区、浏览器内终端/IDE | Resources/Challenges 分区和内置工作区理念 |
| [Vulhub](https://vulhub.org/getting-started) | Docker 化可复现脆弱环境 | CVE 环境复现、启动/清理、检测规则验证 |

## 扩展后的知识库方向

新增内容重点补齐原知识库缺口：

- 认证与会话安全
- 访问控制与越权
- 服务端请求伪造
- API 安全测试
- 反序列化与对象注入
- JWT 与 OAuth 安全
- 云原生与容器安全
- CVE 复现与漏洞研究
- Linux 与 CTF 基础
- 密码学与编码
- 逆向与二进制基础
- 取证与流量分析
- 蓝队调查与 DFIR
- 威胁狩猎与检测工程

## 排版原则

- 首页先展示学习路线，再展示平台模式参考，最后展示完整分类。
- 详情页使用目录导航，长内容不再只依赖滚动。
- 每个章节固定包含概念、教程、示例、实验任务、验收清单和防护/检测要点。
- 红队内容强调触发条件、边界和修复复测；蓝队内容强调证据、时间线、检测和报告。
- 所有路线引用都由测试校验，避免新增分类后出现断链。
