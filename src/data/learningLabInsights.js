const learningLabInsights = [
  {
    name: 'PortSwigger Web Security Academy',
    focus: 'Web 漏洞专题 + 交互式实验',
    pattern: '按漏洞主题组织，每个主题包含理论、可完成实验和难度递进。',
    takeaways: ['主题优先', '实验数量可见', '从 Apprentice 到 Practitioner 逐级推进'],
    url: 'https://portswigger.net/web-security/learning-path',
  },
  {
    name: 'OWASP WebGoat / Juice Shop',
    focus: '故意脆弱应用 + 教学任务',
    pattern: '先解释漏洞，再通过任务练习，最后总结缓解方案；Juice Shop 还提供计分板和教程模式。',
    takeaways: ['解释-实践-防护三段式', '挑战完成反馈', '适合本地 Docker 靶场'],
    url: 'https://owasp.org/www-project-webgoat/',
  },
  {
    name: 'TryHackMe',
    focus: '学习路径、模块、房间、任务',
    pattern: '路径由模块和房间组成，房间再拆成任务、资料、问题和虚拟机。',
    takeaways: ['路径化学习', '任务粒度小', '理论与动手混排'],
    url: 'https://help.tryhackme.com/en/articles/6611837-rooms',
  },
  {
    name: 'Hack The Box Academy',
    focus: '技能路径和岗位路径',
    pattern: '用 Skill Paths 和 Job Role Paths 指导学习顺序，模块围绕具体技能或岗位目标。',
    takeaways: ['岗位导向', '模块化课程', '学习目标清晰'],
    url: 'https://academy.hackthebox.com/catalogue/paths',
  },
  {
    name: 'OverTheWire',
    focus: '关卡式 Wargame',
    pattern: '从 Bandit 到 Natas 等游戏逐级推进，每一关完成后进入下一关。',
    takeaways: ['关卡推进', '左侧目录导航', '命令行基础优先'],
    url: 'https://overthewire.org/',
  },
  {
    name: 'picoCTF',
    focus: '入门 CTF 和小挑战',
    pattern: '通过短挑战降低门槛，覆盖逆向、取证、密码、二进制和 Web 等类别。',
    takeaways: ['小题快练', '内置工具环境', '适合入门上坡'],
    url: 'https://picoctf.org/research.html',
  },
  {
    name: 'PentesterLab',
    focus: '真实漏洞、代码审计和徽章',
    pattern: '围绕真实漏洞和代码路径构建练习，通过徽章/证书表达阶段性能力。',
    takeaways: ['真实漏洞约束', '代码审计视角', '徽章式里程碑'],
    url: 'https://pentesterlab.com/',
  },
  {
    name: 'CyberDefenders',
    focus: '蓝队、SOC、DFIR 调查',
    pattern: '以真实调查场景组织实验，强调时间线、证据、IOC、报告和分析思维。',
    takeaways: ['调查故事线', '证据驱动', '防守任务可度量'],
    url: 'https://cyberdefenders.org/blue-team-labs/',
  },
  {
    name: 'pwn.college',
    focus: '浏览器内终端、VS Code、GUI 和挑战',
    pattern: '模块包含 Resources 与 Challenges，可直接在浏览器里打开终端、IDE 或 Linux GUI。',
    takeaways: ['资源和挑战分区', '内置工作区', '可展开任务结构'],
    url: 'https://pwn.college/welcome/welcome/',
  },
  {
    name: 'Vulhub / VulnHub',
    focus: '可复现脆弱环境',
    pattern: '按 CVE、组件或机器发布独立环境，强调 Docker/虚拟机快速启动和清理。',
    takeaways: ['环境即课程', '版本可复现', '适合检测规则验证'],
    url: 'https://vulhub.org/getting-started',
  },
];

const learningPathBlueprints = [
  {
    title: 'Web 安全主线',
    description: '从输入输出、认证授权、服务端漏洞到现代 API 和客户端安全。',
    categories: ['sql-injection', 'xss', 'authentication', 'access-control', 'ssrf', 'api-security'],
  },
  {
    title: 'CTF 与基础能力',
    description: '补齐 Linux、网络、密码学、逆向和二进制基础，适合配合关卡式靶场。',
    categories: ['linux-wargame', 'cryptography', 'binary-reversing', 'forensics'],
  },
  {
    title: '真实漏洞复现',
    description: '围绕组件、框架、云原生和 CVE 环境，训练复现、验证和修复闭环。',
    categories: ['components', 'frameworks', 'cve-reproduction', 'cloud-container'],
  },
  {
    title: '蓝队调查与检测',
    description: '以 SOC 案件方式训练日志、流量、终端、云审计和威胁情报分析。',
    categories: ['blue-team-dfir', 'threat-hunting', 'forensics', 'cloud-container'],
  },
];

const layoutPrinciples = [
  '用“路径 -> 模块 -> 章节 -> 任务”的四级信息架构替代单页长文。',
  '长内容页保留左侧粘性目录，目录展示当前章节和实验状态。',
  '每个知识点固定为“概念、触发条件、实操步骤、示例、验收、防护”结构。',
  '首页先给学习路线和筛选，再展示分类卡片，减少新手选择成本。',
  '实验任务使用短列表和状态标签，避免把所有材料压成一整段。',
  '蓝队内容按“场景、证据、时间线、检测规则、报告”排版，区别于红队 payload 清单。',
];

export {
  learningLabInsights,
  learningPathBlueprints,
  layoutPrinciples,
};
