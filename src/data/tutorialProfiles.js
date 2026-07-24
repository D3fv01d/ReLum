const formatTutorialText = (text, values) => (
  text
    .replace(/\{section\}/g, values.sectionTitle)
    .replace(/\{category\}/g, values.categoryTitle)
);

const tutorialProfiles = {
  'sql-injection': {
    prerequisites: ['HTTP 参数传递方式', 'SELECT/WHERE/UNION 基础语法', '数据库错误与权限模型'],
    workflow: [
      { title: '确认输入点', detail: '在授权靶场中记录 URL 参数、表单字段和请求体，先判断 {section} 是否会影响页面响应。' },
      { title: '判断注入上下文', detail: '观察输入被拼接到字符串、数字、排序还是搜索条件中，再选择对应的闭合方式。' },
      { title: '最小化验证', detail: '先用真假条件或语法错误验证漏洞存在，不直接执行破坏性语句。' },
      { title: '提取证据', detail: '记录请求、响应差异、数据库报错或延迟时间，形成可复现的实验笔记。' },
      { title: '修复复测', detail: '切换到参数化查询后复测同一 payload，确认攻击条件失效。' },
    ],
    example: {
      title: '安全对照示例：从拼接 SQL 到参数化查询',
      code: "不安全示例:\nSELECT * FROM users WHERE name = '输入值';\n\n安全示例:\nSELECT * FROM users WHERE name = ?;\n参数: [输入值]",
    },
    labTasks: ['判断当前章节属于字符、数值、联合、盲注还是绕过场景', '保存 2 组有效/无效请求作为对照', '写出参数化修复方案并说明最小权限要求'],
    pitfalls: ['只过滤关键词而不改变拼接 SQL 的根因', '把前端校验当作安全边界', '复测时只看页面是否报错而不看响应差异'],
  },
  xss: {
    prerequisites: ['HTML 解析上下文', 'DOM API 与事件属性', 'Cookie 与浏览器同源策略'],
    workflow: [
      { title: '定位输出位置', detail: '确认 {section} 的输入最终出现在 HTML 文本、属性、脚本、URL 还是 DOM API 中。' },
      { title: '识别上下文编码', detail: '根据输出上下文选择 HTML escape、属性 escape、URL encode 或 JS 字符串转义。' },
      { title: '使用无害探针', detail: '优先使用可见标记或 alert 类靶场探针验证，不采集真实用户数据。' },
      { title: '验证持久性', detail: '区分反射、存储和 DOM 触发路径，记录触发 URL 或页面操作。' },
      { title: '加固复测', detail: '启用输出编码、CSP、HttpOnly Cookie 后复测原触发路径。' },
    ],
    example: {
      title: '安全对照示例：避免 innerHTML 直接写入用户输入',
      code: "不安全示例:\npreview.innerHTML = userInput;\n\n安全示例:\npreview.textContent = userInput;\n// 富文本场景需要使用可信的 HTML sanitizer 白名单",
    },
    labTasks: ['标注 payload 落入的 HTML 上下文', '说明该场景是否能读取 Cookie 或仅能执行页面内动作', '写出 CSP 与输出编码的组合修复'],
    pitfalls: ['只过滤 script 标签但忽略事件属性和 SVG', '把 React/Vue 自动转义误用于 dangerouslySetInnerHTML', '忽略 DOM 型 XSS 的客户端触发链'],
  },
  csrf: {
    prerequisites: ['Cookie 自动携带机制', '浏览器表单提交', 'SameSite 与 CSRF Token'],
    workflow: [
      { title: '确认敏感操作', detail: '找到 {section} 对应的状态变更接口，例如改密码、转账、删除、绑定账户。' },
      { title: '检查认证方式', detail: '确认请求是否只依赖 Cookie 会话，是否缺少一次性 Token 或二次确认。' },
      { title: '构造授权靶场 PoC', detail: '在本地页面中复现跨站请求，观察用户不主动操作目标站点时是否成功。' },
      { title: '补齐防护', detail: '加入 Token、SameSite、Origin/Referer 辅助校验和敏感操作再认证。' },
    ],
    example: {
      title: '安全对照示例：状态变更请求带一次性 Token',
      code: "POST /account/email\nCookie: sid=...\nX-CSRF-Token: 服务端签发的一次性随机值\n\n服务端校验: token 属于当前会话、未过期、未重复使用",
    },
    labTasks: ['判断接口是否为状态变更', '比较有无 Token 的请求结果', '说明 SameSite=Lax/Strict 对该场景的影响'],
    pitfalls: ['只在表单页面放 Token 但接口不校验', '把 Referer 当作唯一防线', '忽略 JSON API 也可能被跨站触发'],
  },
  'file-upload': {
    prerequisites: ['multipart/form-data 请求结构', 'MIME、扩展名和魔术字节', 'Web 服务器解析规则'],
    workflow: [
      { title: '梳理上传链路', detail: '记录 {section} 的前端限制、后端校验、存储路径、访问 URL 和解析方式。' },
      { title: '逐层验证', detail: '分别验证扩展名、MIME、内容、尺寸、二次处理和访问权限，不混在一个请求里判断。' },
      { title: '观察落盘行为', detail: '确认文件是否改名、是否进入隔离目录、是否可被 Web 服务器直接执行。' },
      { title: '加固复测', detail: '使用白名单、随机文件名、对象存储隔离和内容扫描后复测原样本。' },
    ],
    example: {
      title: '安全对照示例：上传后隔离存储',
      code: "校验流程:\n1. 只允许业务需要的扩展名白名单\n2. 校验魔术字节和真实内容\n3. 重命名为随机 ID\n4. 存储到不可执行目录\n5. 下载时通过鉴权接口读取",
    },
    labTasks: ['指出当前限制发生在前端还是后端', '记录文件保存路径和访问方式', '给出不可执行存储的部署方案'],
    pitfalls: ['只检查 Content-Type 请求头', '允许用户控制最终文件路径', '上传后直接暴露原始文件 URL'],
  },
  'file-download': {
    prerequisites: ['路径规范化', '访问控制', '静态文件服务边界'],
    workflow: [
      { title: '识别文件参数', detail: '找到 {section} 中控制文件名、路径、ID 或模板名称的参数。' },
      { title: '确认边界目录', detail: '明确应用允许读取的根目录，并测试路径穿越是否能逃逸该目录。' },
      { title: '核对权限', detail: '即使文件路径合法，也要确认当前用户是否有权下载该文件。' },
      { title: '修复复测', detail: '使用文件 ID 映射、路径规范化和鉴权后复测原请求。' },
    ],
    example: {
      title: '安全对照示例：路径规范化后校验根目录',
      code: "const root = '/app/files';\nconst resolved = path.resolve(root, userFileName);\nif (!resolved.startsWith(root + path.sep)) {\n  throw new Error('非法文件路径');\n}",
    },
    labTasks: ['记录允许下载的文件范围', '验证越权文件和路径穿越两类风险', '设计文件 ID 到真实路径的映射表'],
    pitfalls: ['只替换 ../ 字符串', '忽略 URL 编码和双重编码', '文件存在即允许下载'],
  },
  'command-execution': {
    prerequisites: ['系统命令参数', 'Shell 元字符', '进程权限与环境变量'],
    workflow: [
      { title: '确认命令边界', detail: '识别 {section} 中哪些输入会进入命令、脚本、模板或解释器。' },
      { title: '区分执行方式', detail: '判断代码使用 shell 拼接、exec、eval、模板渲染还是安全的参数数组。' },
      { title: '最小探测', detail: '在授权环境中使用无害命令或时间差确认执行，不读取真实敏感文件。' },
      { title: '改为白名单', detail: '把自由文本命令改成固定动作和参数白名单，降低解释器能力。' },
    ],
    example: {
      title: '安全对照示例：使用参数数组而不是 Shell 拼接',
      code: "不安全示例:\nexec('ping ' + host);\n\n安全示例:\nexecFile('ping', ['-c', '4', validatedHost]);\n// validatedHost 必须通过 IP/域名白名单校验",
    },
    labTasks: ['指出输入进入解释器的位置', '列出需要拒绝的元字符或改造点', '说明服务进程最小权限配置'],
    pitfalls: ['只黑名单过滤 ; 但忽略 &&、|、换行', '把 Docker 容器误认为绝对安全边界', '错误日志泄露命令细节'],
  },
  'file-inclusion': {
    prerequisites: ['服务端模板/文件加载机制', '相对路径与伪协议', '日志与会话文件位置'],
    workflow: [
      { title: '定位包含点', detail: '确认 {section} 中用户输入是否控制模板名、语言包、页面片段或文件路径。' },
      { title: '确认可读范围', detail: '测试是否能读取应用目录、配置文件、日志文件或伪协议内容。' },
      { title: '避免任意路径', detail: '把用户输入映射为固定 key，再由服务端选择真实文件。' },
      { title: '复测绕过', detail: '覆盖目录遍历、编码、截断、伪协议等常见绕过。' },
    ],
    example: {
      title: '安全对照示例：路由 key 到模板白名单',
      code: "const templates = {\n  home: 'templates/home.html',\n  profile: 'templates/profile.html',\n};\nconst file = templates[userPage] || templates.home;",
    },
    labTasks: ['列出允许包含的页面白名单', '记录一次失败和一次成功的边界测试', '写出禁用伪协议的配置建议'],
    pitfalls: ['只检查文件后缀', '忽略编码后的 ../', '允许用户选择任意模板文件'],
  },
};

const defaultTutorialProfile = {
  prerequisites: ['HTTP 请求与响应基础', '身份认证与授权模型', '安全测试记录方法'],
  workflow: [
    { title: '建立授权范围', detail: '在开始 {section} 前确认测试目标、账号、数据和操作都属于授权靶场。' },
    { title: '拆解攻击面', detail: '记录输入点、输出点、权限边界、状态变化和后端依赖。' },
    { title: '最小化复现', detail: '先用无害样本证明风险存在，再逐步扩大验证范围。' },
    { title: '记录证据', detail: '保存请求、响应、截图、日志和环境版本，保证复现路径清晰。' },
    { title: '修复与复测', detail: '把修复点落实到代码、配置和权限，再用原步骤验证风险已关闭。' },
  ],
  example: {
    title: '通用教程示例：安全测试记录模板',
    code: "目标: {section}\n输入点: URL / 表单 / Header / API Body\n观察: 响应差异、日志、权限变化\n风险: 影响范围和前置条件\n修复: 校验、鉴权、编码、隔离、最小权限\n复测: 使用同一请求确认风险消失",
  },
  labTasks: ['完成一次最小化复现记录', '写出影响范围和前置条件', '给出至少 3 条可执行修复建议'],
  pitfalls: ['只记录 payload 不记录上下文', '把漏洞现象等同于根因', '修复后没有做回归验证'],
};

const getTutorialProfile = (categoryId) => tutorialProfiles[categoryId] || defaultTutorialProfile;

export const getDetailedTutorial = (categoryId, category, section) => {
  const profile = getTutorialProfile(categoryId);
  const values = {
    sectionTitle: section.title,
    categoryTitle: category.title,
  };

  return {
    learningGoals: [
      `理解“${section.title}”的触发条件、影响范围和典型利用链`,
      `能够在 ReLum 授权靶场中完成可复现验证并记录证据`,
      `掌握“${category.title}”对应的修复方案和复测方法`,
    ],
    prerequisites: profile.prerequisites,
    workflow: profile.workflow.map(item => ({
      title: item.title,
      detail: formatTutorialText(item.detail, values),
    })),
    example: {
      title: formatTutorialText(profile.example.title, values),
      code: formatTutorialText(profile.example.code, values),
    },
    labTasks: profile.labTasks.map(item => formatTutorialText(item, values)),
    pitfalls: profile.pitfalls.map(item => formatTutorialText(item, values)),
  };
};
