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

function PracticeCard({ title, description, difficulty, time, category, icon, tags, status }) {
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

      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <span className={`px-2 py-1 rounded-full text-xs ${getDifficultyColor()}`}>
            {difficulty}
          </span>
          <span className="text-xs text-gray-400">{time}</span>
        </div>
        <button className="bg-primary hover:bg-primary/90 text-white px-3 py-1 rounded text-sm transition-colors duration-200">
          开始训练
        </button>
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
      status: "热门"
    },
    {
      title: "企业管理系统安全评估",
      description: "针对典型管理系统的安全评估实战",
      difficulty: "中级",
      time: "4小时",
      category: "comprehensive",
      icon: faShieldAlt,
      tags: ["应用攻防", "权限提升", "会话劫持"],
      status: ""
    },
    {
      title: "内网安全评估实战",
      description: "内网环境中的信息收集与安全评估",
      difficulty: "高级",
      time: "8小时",
      category: "comprehensive",
      icon: faCrosshairs,
      tags: ["内网安全", "信息收集", "权限提升"],
      status: ""
    },
    {
      title: "Web安全漏洞组合利用",
      description: "学习多种漏洞组合利用技巧",
      difficulty: "高级",
      time: "5小时",
      category: "comprehensive",
      icon: faFlagCheckered,
      tags: ["组合利用", "权限提升", "会话接管"],
      status: "推荐"
    },
    {
      title: "API安全测试实战",
      description: "REST和GraphQL API的安全测试实践",
      difficulty: "中级",
      time: "3小时",
      category: "comprehensive",
      icon: faExchangeAlt,
      tags: ["API安全", "认证绕过", "权限控制"],
      status: "新课"
    },
    {
      title: "安全防御绕过技术",
      description: "学习绕过常见安全防御机制的技术",
      difficulty: "高级",
      time: "4小时",
      category: "comprehensive",
      icon: faUnlock,
      tags: ["防御绕过", "编码技术", "安全过滤"],
      status: ""
    },
    {
      title: "环境安全评估实战",
      description: "全面的安全漏洞评估与利用训练",
      difficulty: "高级",
      time: "10小时",
      category: "comprehensive",
      icon: faUserSecret,
      tags: ["漏洞评估", "安全基线", "持久化技术"],
      status: ""
    },
    {
      title: "安全开发与代码审计",
      description: "从开发者角度学习安全编码和代码审计",
      difficulty: "高级",
      time: "5小时",
      category: "comprehensive",
      icon: faCode,
      tags: ["代码审计", "安全开发", "漏洞修复"],
      status: ""
    },
    {
      title: "靶场环境综合挑战",
      description: "通过综合靶场环境锻炼真实渗透测试技能",
      difficulty: "专家",
      time: "12小时",
      category: "comprehensive",
      icon: faTerminal,
      tags: ["靶场实战", "CTF挑战", "渗透测试"],
      status: "热门"
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
