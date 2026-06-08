import React from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faGraduationCap,
  faCode,
  faExchangeAlt,
  faTerminal,
  faLock,
  faUnlock,
  faCrosshairs,
  faFlagCheckered,
  faUserSecret,
  faShieldAlt
} from '@fortawesome/free-solid-svg-icons';
import TerminalFeature from '../components/TerminalPanel';

function PracticeCard({ title, description, difficulty, time, icon, tags, status, to, example }) {
  const getDifficultyColor = () => {
    switch (difficulty) {
      case '入门': return 'bg-green-500/20 text-green-400';
      case '基础': return 'bg-blue-500/20 text-blue-400';
      case '中级': return 'bg-yellow-500/20 text-yellow-400';
      case '高级': return 'bg-orange-500/20 text-orange-400';
      case '专家': return 'bg-red-500/20 text-red-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case '已完成': return 'bg-green-500/20 text-green-400';
      case '进行中': return 'bg-blue-500/20 text-blue-400';
      case '推荐': return 'bg-yellow-500/20 text-yellow-400';
      case '热门': return 'bg-red-500/20 text-red-400';
      case '新课': return 'bg-purple-500/20 text-purple-400';
      default: return '';
    }
  };

  return (
    <div className="bg-[#2A2A2A] rounded-lg p-5 hover:bg-[#333333] transition-colors duration-200">
      <div className="flex justify-between items-start mb-3">
        <FontAwesomeIcon icon={icon} className="text-primary text-xl" />
        {status && (
          <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor()}`}>
            {status}
          </span>
        )}
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-gray-400 text-sm mb-4">{description}</p>

      <div className="flex flex-wrap gap-2 mb-4">
        {tags.map((tag, index) => (
          <span key={index} className="bg-[#3A3A3A] text-gray-300 px-2 py-1 rounded text-xs">
            {tag}
          </span>
        ))}
      </div>

      <div className="mb-4 rounded-md bg-[#1E1E1E] p-3">
        <div className="mb-2 text-xs font-semibold text-blue-300">训练流程</div>
        <ol className="ml-4 list-decimal space-y-1 text-xs text-gray-300">
          <li>阅读对应知识库的详细教程和示例</li>
          <li>在授权靶场中完成最小化复现</li>
          <li>记录证据、影响范围和修复建议</li>
        </ol>
      </div>

      {example && (
        <div className="mb-4 text-xs leading-5 text-gray-400">
          <span className="font-medium text-gray-300">示例场景：</span>
          {example}
        </div>
      )}

      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <span className={`px-2 py-1 rounded-full text-xs ${getDifficultyColor()}`}>
            {difficulty}
          </span>
          <span className="text-xs text-gray-400">{time}</span>
        </div>
        <Link to={to || '/knowledge'} className="bg-primary hover:bg-primary/90 text-white px-3 py-1 rounded text-sm transition-colors duration-200">
          查看教程
        </Link>
      </div>
    </div>
  );
}

function Practice() {
  const comprehensivePractices = [
    {
      title: "Web安全综合渗透测试",
      description: "模拟真实环境的综合渗透测试训练",
      difficulty: "高级",
      time: "6小时",
      category: "comprehensive",
      icon: faLock,
      tags: ["渗透测试", "漏洞利用", "报告编写"],
      status: "热门",
      to: "/knowledge/sql-injection",
      example: "从登录框注入、XSS 验证到报告整理，按真实项目流程串联多个知识点。"
    },
    {
      title: "企业管理系统安全评估",
      description: "针对典型管理系统的安全评估实战",
      difficulty: "中级",
      time: "4小时",
      category: "comprehensive",
      icon: faShieldAlt,
      tags: ["应用攻防", "权限提升", "会话劫持"],
      status: "",
      to: "/knowledge/logic-vulnerabilities",
      example: "围绕账号体系、角色权限和关键业务操作，验证水平越权与垂直越权。"
    },
    {
      title: "内网安全评估实战",
      description: "内网环境中的信息收集与安全评估",
      difficulty: "高级",
      time: "8小时",
      category: "comprehensive",
      icon: faCrosshairs,
      tags: ["内网安全", "信息收集", "权限提升"],
      status: "",
      to: "/knowledge/middleware",
      example: "从中间件版本识别开始，整理暴露服务、弱配置和补丁状态。"
    },
    {
      title: "Web安全漏洞组合利用",
      description: "学习多种漏洞组合利用技巧",
      difficulty: "高级",
      time: "5小时",
      category: "comprehensive",
      icon: faFlagCheckered,
      tags: ["组合利用", "权限提升", "会话接管"],
      status: "推荐",
      to: "/knowledge/xss",
      example: "利用 XSS 与业务逻辑缺陷组合验证会话风险，并给出防护闭环。"
    },
    {
      title: "API安全测试实战",
      description: "REST和GraphQL API的安全测试实践",
      difficulty: "中级",
      time: "3小时",
      category: "comprehensive",
      icon: faExchangeAlt,
      tags: ["API安全", "认证绕过", "权限控制"],
      status: "新课",
      to: "/knowledge/logic-vulnerabilities",
      example: "检查 REST 参数篡改、对象级授权和敏感接口的状态变更保护。"
    },
    {
      title: "安全防御绕过技术",
      description: "学习绕过常见安全防御机制的技术",
      difficulty: "高级",
      time: "4小时",
      category: "comprehensive",
      icon: faUnlock,
      tags: ["防御绕过", "编码技术", "安全过滤"],
      status: "",
      to: "/knowledge/sql-injection",
      example: "围绕 SQL 注入绕过、上传绕过和编码差异，验证过滤策略是否可靠。"
    },
    {
      title: "环境安全评估实战",
      description: "全面的安全漏洞评估与利用训练",
      difficulty: "高级",
      time: "10小时",
      category: "comprehensive",
      icon: faUserSecret,
      tags: ["漏洞评估", "安全基线", "持久化技术"],
      status: "",
      to: "/knowledge/database",
      example: "从数据库权限、默认配置和服务暴露面评估环境整体安全基线。"
    },
    {
      title: "安全开发与代码审计",
      description: "从开发者角度学习安全编码和代码审计",
      difficulty: "高级",
      time: "5小时",
      category: "comprehensive",
      icon: faCode,
      tags: ["代码审计", "安全开发", "漏洞修复"],
      status: "",
      to: "/knowledge/command-execution",
      example: "审计命令执行、文件包含和输入输出编码，输出可落地修复清单。"
    },
    {
      title: "靶场环境综合挑战",
      description: "通过综合靶场环境锻炼真实渗透测试技能",
      difficulty: "专家",
      time: "12小时",
      category: "comprehensive",
      icon: faTerminal,
      tags: ["靶场实战", "CTF挑战", "渗透测试"],
      status: "热门",
      to: "/knowledge/file-upload",
      example: "启动靶场后按教程完成上传、下载、命令执行等章节任务并提交 flag。"
    }
  ];

  return (
    <main className="max-w-7xl mx-auto px-4 py-8 relative">
      <TerminalFeature />

      <div className="bg-[#222222] rounded-lg p-6">
        <h1 className="text-3xl font-bold mb-4">安全综合训练</h1>
        <p className="text-gray-400 mb-6">这些综合训练模拟企业真实安全场景，整合多种漏洞利用技术，帮助您提升实际渗透测试和安全评估能力。</p>

        <div>
          <div className="flex justify-between items-center mb-4">
            <Link to="/knowledge" className="text-primary text-sm hover:text-primary/90">
              <FontAwesomeIcon icon={faGraduationCap} className="mr-1" />
              查看学习资料
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {comprehensivePractices.map((practice, index) => (
              <PracticeCard key={index} {...practice} />
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}

export default Practice;
