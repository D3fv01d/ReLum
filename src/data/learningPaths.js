const pathDefinitions = [
  {
    id: 'foundation',
    title: '安全基础入门',
    shortTitle: '基础入门',
    level: '零基础',
    audience: '第一次接触命令行、网络安全或 CTF 的学习者',
    description: '先建立系统、命令行、编码和证据意识，再进入漏洞利用，避免只会复制命令。',
    outcome: '能够独立使用终端处理文件与数据，识别常见编码，并保留基本分析证据。',
    prerequisites: ['无需安全基础', '能够安装并运行本地 Docker 环境'],
    stages: [
      {
        id: 'terminal-basics',
        title: '终端与系统基础',
        description: '理解文件、权限、进程、管道和网络命令，建立后续实验所需的操作能力。',
        objective: '能够在不依赖图形工具的情况下定位文件、组合命令并解释输出。',
        categories: ['linux-wargame'],
      },
      {
        id: 'data-basics',
        title: '编码与密码基础',
        description: '区分编码、哈希、加密和签名，理解它们解决的问题以及常见误用。',
        objective: '能够判断数据变换类型并选择正确的验证或还原方法。',
        categories: ['cryptography'],
      },
      {
        id: 'evidence-basics',
        title: '证据与分析基础',
        description: '从文件、流量和日志中提取事实，形成可复查的时间线与判断依据。',
        objective: '能够保存原始证据、提取关键指标并写出最小分析结论。',
        categories: ['forensics'],
      },
    ],
  },
  {
    id: 'web-pentest',
    title: 'Web 安全测试',
    shortTitle: 'Web 安全',
    level: '入门到进阶',
    audience: '希望系统掌握 Web 漏洞发现、验证和修复闭环的学习者',
    description: '按照数据流、身份边界、服务端边界和现代 API 的顺序建立 Web 安全测试方法。',
    outcome: '能够从请求与响应出发定位攻击面，完成漏洞验证、证据记录、影响判断和修复复测。',
    prerequisites: ['安全基础入门', 'HTTP 请求与浏览器开发者工具基础'],
    stages: [
      {
        id: 'input-output',
        title: '输入、解释与输出',
        description: '先理解用户输入如何进入解释器或页面，再学习建立可控、可复现的验证条件。',
        objective: '能够识别输入点、判断执行上下文，并用最小测试证明漏洞是否存在。',
        categories: ['sql-injection', 'xss', 'csrf'],
      },
      {
        id: 'identity-boundaries',
        title: '身份、会话与授权',
        description: '从“你是谁”和“你能做什么”两个问题拆解登录、会话、对象和业务权限。',
        objective: '能够区分认证与授权问题，并以不同角色和对象构造权限矩阵。',
        categories: ['authentication', 'access-control', 'logic-vulnerabilities', 'jwt-oauth'],
      },
      {
        id: 'server-boundaries',
        title: '服务端资源边界',
        description: '围绕文件、命令、解析器、内部网络和对象恢复过程检查服务端信任边界。',
        objective: '能够追踪不可信输入到文件系统、命令解释器、XML 解析器和内部服务的路径。',
        categories: ['file-upload', 'file-download', 'file-inclusion', 'command-execution', 'xxe', 'ssrf', 'deserialization'],
      },
      {
        id: 'modern-interfaces',
        title: '现代接口与数据访问',
        description: '把前面的方法迁移到 REST、GraphQL、批量接口和令牌驱动的系统。',
        objective: '能够系统检查对象级授权、批量赋值、速率限制和敏感数据暴露。',
        categories: ['api-security'],
      },
    ],
  },
  {
    id: 'platform-research',
    title: '组件与漏洞复现',
    shortTitle: '漏洞复现',
    level: '进阶',
    audience: '希望研究真实组件、框架、数据库和云环境漏洞的学习者',
    description: '从版本识别和部署结构开始，逐步进入组件利用、补丁对比和复现报告。',
    outcome: '能够搭建受控环境，确认受影响版本，复现漏洞并产出包含证据和修复建议的报告。',
    prerequisites: ['Web 安全测试基础', 'Linux、Docker 与基础网络能力'],
    stages: [
      {
        id: 'application-stack',
        title: '应用运行栈',
        description: '认识中间件、开发组件和框架在请求处理链中的位置及暴露面。',
        objective: '能够建立技术栈清单，并将版本、配置和公开漏洞对应起来。',
        categories: ['middleware', 'components', 'frameworks'],
      },
      {
        id: 'products-data',
        title: '产品与数据服务',
        description: '分析 CMS 与数据库的默认配置、权限边界、插件生态和服务暴露风险。',
        objective: '能够区分产品漏洞、配置缺陷和权限设计问题。',
        categories: ['cms', 'database'],
      },
      {
        id: 'reproduction',
        title: '云环境与 CVE 复现',
        description: '把环境、版本、补丁、利用证据和缓解方案组织成可复查的研究过程。',
        objective: '能够完成一次隔离、可重复、包含边界说明的漏洞复现。',
        categories: ['cloud-container', 'cve-reproduction'],
      },
    ],
  },
  {
    id: 'ctf-skills',
    title: 'CTF 专项能力',
    shortTitle: 'CTF 专项',
    level: '入门到进阶',
    audience: '希望以短题和关卡方式训练问题拆解能力的学习者',
    description: '以关卡推进和小题快练强化终端、编码、逆向、二进制与取证能力。',
    outcome: '能够识别题目类型、拆分线索、选择工具，并保留可复用的解题笔记。',
    prerequisites: ['建议先完成安全基础入门', '具备基本命令行操作能力'],
    stages: [
      {
        id: 'wargame',
        title: '关卡式基本功',
        description: '通过连续关卡训练命令行、权限、编码和线索追踪。',
        objective: '能够独立查阅资料并将上一关得到的信息用于下一关。',
        categories: ['linux-wargame', 'cryptography'],
      },
      {
        id: 'program-analysis',
        title: '程序分析',
        description: '从文件格式和静态分析进入调试、内存保护与输入边界。',
        objective: '能够建立程序行为假设并通过静态或动态证据验证。',
        categories: ['binary-reversing'],
      },
      {
        id: 'artifact-analysis',
        title: '附件与流量分析',
        description: '处理比赛中的文件、日志、流量和隐藏信息，形成证据链。',
        objective: '能够从未知附件中判断分析方向并提取关键线索。',
        categories: ['forensics'],
      },
    ],
  },
  {
    id: 'blue-team',
    title: '蓝队调查与检测',
    shortTitle: '蓝队检测',
    level: '进阶',
    audience: '希望学习 SOC 调查、事件响应和检测工程的学习者',
    description: '从证据采集开始，沿告警分诊、事件调查、检测规则和持续调优推进。',
    outcome: '能够围绕告警建立时间线、形成调查结论，并把攻击行为转化为可维护的检测。',
    prerequisites: ['安全基础入门', '了解常见 Web 与主机攻击行为'],
    stages: [
      {
        id: 'collect-evidence',
        title: '证据采集与解释',
        description: '明确数据来源、时间范围和证据完整性，避免先入为主。',
        objective: '能够从日志、流量和主机工件中提取可验证事实。',
        categories: ['forensics'],
      },
      {
        id: 'incident-investigation',
        title: '事件调查与处置',
        description: '围绕场景、证据、时间线、影响范围和处置建议完成调查。',
        objective: '能够完成告警分诊、范围确认、遏制建议和复盘记录。',
        categories: ['blue-team-dfir'],
      },
      {
        id: 'detection-engineering',
        title: '威胁狩猎与检测',
        description: '从狩猎假设出发编写规则，并通过数据验证、误报分析和 ATT&CK 映射迭代。',
        objective: '能够将调查发现转化为可测试、可解释、可维护的检测规则。',
        categories: ['threat-hunting', 'cloud-container'],
      },
    ],
  },
];

const withFlattenedCategories = (path) => ({
  ...path,
  categories: [...new Set(path.stages.flatMap((stage) => stage.categories))],
});

const learningPaths = pathDefinitions.map(withFlattenedCategories);

const getLearningPath = (pathId) => (
  learningPaths.find((path) => path.id === pathId) || null
);

const getCategoryPathContexts = (categoryId) => (
  learningPaths.flatMap((path) => path.stages
    .filter((stage) => stage.categories.includes(categoryId))
    .map((stage) => ({ path, stage })))
);

const getOrderedPathCategories = (path) => (
  path ? path.stages.flatMap((stage) => stage.categories) : []
);

const learningPathBlueprints = learningPaths;

export {
  getCategoryPathContexts,
  getLearningPath,
  getOrderedPathCategories,
  learningPathBlueprints,
  learningPaths,
};
