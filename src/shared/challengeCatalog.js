const challengeCatalog = {
  'sql-injection': {
    title: 'SQL注入漏洞',
    sections: [
      '字符型SQL注入',
      '数值型SQL注入',
      '联合注入',
      '报错注入',
      '布尔盲注',
      '时间盲注',
      '二阶注入',
      '绕过技术',
    ],
  },
  xss: {
    title: '跨站脚本漏洞',
    sections: [
      '反射型跨站脚本',
      '存储型跨站脚本',
      'DOM型跨站脚本',
      '利用XSS平台获取Cookie',
    ],
  },
  csrf: {
    title: '跨站请求伪造漏洞',
    sections: ['GET型CSRF', 'POST型CSRF', 'CSRF Token窃取'],
  },
  'file-upload': {
    title: '任意文件上传漏洞',
    sections: [
      'JavaScript校验绕过',
      'MIME类型检测绕过',
      '扩展名校验绕过',
      '文件内容检测绕过',
      '二次渲染绕过',
      '条件竞争绕过',
    ],
  },
  'file-download': {
    title: '任意文件下载漏洞',
    sections: ['路径遍历', '未授权文件任意下载', '敏感文件获取', '绕过路径限制'],
  },
  'command-execution': {
    title: '命令/代码执行漏洞',
    sections: ['PHP命令执行', 'Java命令执行', 'Python模板注入', '反弹shell'],
  },
  'file-inclusion': {
    title: '文件包含漏洞',
    sections: [
      '基础文件包含',
      '敏感文件读取',
      '日志文件包含',
      'SESSION文件包含',
      '伪协议实现文件读取和代码执行',
      '任意目录遍历',
      '00截断绕过',
    ],
  },
  xxe: {
    title: 'XML外部实体注入漏洞',
    sections: ['有回显的XXE', '无回显的XXE'],
  },
  'logic-vulnerabilities': {
    title: '业务逻辑漏洞',
    sections: [
      '用户名遍历',
      '重放攻击',
      '验证码复用',
      '支付逻辑',
      '水平越权',
      '垂直越权',
      '未授权访问',
      '登录认证绕过',
      '密码重置',
      '空口令',
    ],
  },
  middleware: {
    title: '中间件漏洞',
    sections: [
      'Weblogic漏洞概述',
      'Weblogic多种典型漏洞利用',
      'Tomcat典型漏洞利用',
      'Jboss典型漏洞利用',
      '其他中间件漏洞',
      '中间件配置漏洞',
      '中间件漏洞防护',
    ],
  },
  components: {
    title: '组件漏洞',
    sections: [
      'Shiro组件典型漏洞利用',
      'Fastjson典型漏洞利用',
      'Log4j典型漏洞利用',
      'Spring组件漏洞',
      '其他常见组件漏洞',
      '组件漏洞检测与修复',
    ],
  },
  frameworks: {
    title: '第三方框架漏洞',
    sections: [
      'ThinkPHP多种典型漏洞利用',
      'Struts2多种典型漏洞利用',
      'Spring框架典型漏洞利用',
      '若依框架典型漏洞利用',
      '其他流行框架漏洞',
      '框架漏洞防护策略',
    ],
  },
  cms: {
    title: 'CMS漏洞利用实战',
    sections: [
      'WordPress多种典型漏洞利用',
      'WordPress信息泄露与枚举',
      'WordPress提权与后门',
      'Drupal漏洞利用',
      'Joomla漏洞利用',
      '其他CMS漏洞',
      'CMS漏洞防护最佳实践',
    ],
  },
  database: {
    title: '数据库漏洞利用实战',
    sections: [
      'MySQL典型漏洞利用',
      'MySQL配置错误',
      'Redis典型漏洞利用',
      'Redis安全配置',
      'PostgreSQL典型漏洞利用',
      '其他数据库漏洞',
      '数据库安全最佳实践',
    ],
  },
  authentication: {
    title: '认证与会话安全',
    sections: ['弱口令与凭据填充', '多因素认证绕过', '会话固定与Cookie安全', '密码重置流程缺陷'],
  },
  'access-control': {
    title: '访问控制与越权',
    sections: ['IDOR水平越权', '垂直越权', '功能级授权缺失', '多租户隔离失败'],
  },
  ssrf: {
    title: '服务端请求伪造',
    sections: ['基础SSRF识别', '内网资源访问', '云元数据保护', '协议与重定向绕过'],
  },
  'api-security': {
    title: 'API安全测试',
    sections: ['BOLA对象级授权', '批量赋值', 'GraphQL滥用', '速率限制与错误信息'],
  },
  deserialization: {
    title: '反序列化与对象注入',
    sections: ['Java反序列化风险', 'PHP对象注入', 'Python Pickle风险', '签名与版本控制'],
  },
  'jwt-oauth': {
    title: 'JWT与OAuth安全',
    sections: ['JWT算法与签名校验', '弱密钥与密钥轮换', 'OAuth重定向风险', 'Scope与Token生命周期'],
  },
  'cloud-container': {
    title: '云原生与容器安全',
    sections: ['镜像与密钥泄露', '容器运行时隔离', 'Kubernetes RBAC', 'CI/CD供应链'],
  },
  'cve-reproduction': {
    title: 'CVE复现与漏洞研究',
    sections: ['环境复现方法', '补丁对比', '影响面评估', '检测规则验证'],
  },
  'linux-wargame': {
    title: 'Linux与CTF基础',
    sections: ['Shell与文件导航', '权限与用户上下文', '管道、重定向与文本处理', '关卡式笔记法'],
  },
  cryptography: {
    title: '密码学与编码',
    sections: ['编码与表示', '哈希与口令存储', '对称与非对称加密', '签名、证书与随机数'],
  },
  'binary-reversing': {
    title: '逆向与二进制基础',
    sections: ['文件格式与程序入口', '静态分析', '动态调试', '内存保护与安全编译'],
  },
  forensics: {
    title: '取证与流量分析',
    sections: ['文件元数据分析', 'PCAP流量分析', '日志时间线', 'IOC提取与报告'],
  },
  'blue-team-dfir': {
    title: '蓝队调查与DFIR',
    sections: ['告警分诊', '证据收集', '遏制与恢复', '复盘与改进'],
  },
  'threat-hunting': {
    title: '威胁狩猎与检测工程',
    sections: ['狩猎假设', 'KQL/Sigma/YARA基础', 'TTP与ATT&CK映射', '误报调优'],
  },
};

const listCatalogChallenges = () => (
  Object.entries(challengeCatalog).flatMap(([knowledgeId, category]) => (
    category.sections.map((sectionTitle) => ({
      knowledgeId,
      sectionTitle,
    }))
  ))
);

module.exports = {
  challengeCatalog,
  listCatalogChallenges,
};
