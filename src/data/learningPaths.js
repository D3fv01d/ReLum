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

export {
  learningPathBlueprints,
};
