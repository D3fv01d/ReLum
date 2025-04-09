import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faFlask, 
  faGraduationCap, 
  faChessBoard, 
  faDatabase, 
  faCode, 
  faPaperPlane, 
  faUpload,
  faDownload,
  faTerminal,
  faFile,
  faFileCode,
  faExchangeAlt,
  faServer,
  faPuzzlePiece,
  faLayerGroup,
  faGlobe,
  faHdd,
  faLock,
  faUnlock,
  faCrosshairs,
  faTrophy,
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
          开始练习
        </button>
      </div>
    </div>
  );
}

function Practice() {
  const [activeTab, setActiveTab] = useState('knowledge');
  
  const knowledgePractices = [
    {
      title: "SQL注入漏洞利用与防护",
      description: "学习和练习不同类型的SQL注入攻击技术和防御方法",
      difficulty: "基础",
      time: "2小时",
      category: "web",
      icon: faDatabase,
      tags: ["SQL注入", "数据库安全", "参数化查询"],
      status: "推荐"
    },
    {
      title: "XSS跨站脚本攻击实战",
      description: "动手实践反射型、存储型和DOM型XSS攻击",
      difficulty: "基础",
      time: "1.5小时",
      category: "web",
      icon: faCode,
      tags: ["XSS", "输入验证", "CSP策略"],
      status: "热门"
    },
    {
      title: "CSRF跨站请求伪造实验",
      description: "了解CSRF攻击原理并实践攻防技术",
      difficulty: "中级",
      time: "1.5小时",
      category: "web",
      icon: faPaperPlane,
      tags: ["CSRF", "Referer检测", "Token验证"],
      status: ""
    },
    {
      title: "文件上传漏洞利用",
      description: "学习绕过各种文件上传限制的技术",
      difficulty: "中级",
      time: "2小时",
      category: "web",
      icon: faUpload,
      tags: ["文件上传", "类型验证", "文件内容检测"],
      status: "进行中"
    },
    {
      title: "任意文件下载漏洞实验",
      description: "探索路径遍历和任意文件下载漏洞",
      difficulty: "中级",
      time: "1.5小时",
      category: "web",
      icon: faDownload,
      tags: ["路径遍历", "目录穿越", "权限控制"],
      status: ""
    },
    {
      title: "命令注入与执行实战",
      description: "练习命令注入攻击和防御技术",
      difficulty: "高级",
      time: "2.5小时",
      category: "web",
      icon: faTerminal,
      tags: ["命令注入", "参数过滤", "反弹Shell"],
      status: ""
    },
    {
      title: "文件包含漏洞利用",
      description: "学习本地和远程文件包含漏洞的利用",
      difficulty: "高级",
      time: "2小时",
      category: "web",
      icon: faFile,
      tags: ["LFI", "RFI", "伪协议"],
      status: ""
    },
    {
      title: "XML外部实体注入(XXE)实战",
      description: "掌握XXE漏洞的利用和防护技术",
      difficulty: "专家",
      time: "3小时",
      category: "web",
      icon: faFileCode,
      tags: ["XXE", "XML解析", "带外通道"],
      status: "新课"
    }
  ];
  
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
    }
  ];
  
  return (
    <main className="max-w-7xl mx-auto px-4 py-8 relative">
      <TerminalFeature />
      
      <div className="bg-[#222222] rounded-lg p-6">
        <h1 className="text-3xl font-bold mb-4">网络安全实践平台</h1>
        <p className="text-gray-400 mb-6">在这里，您可以通过动手实践来提升网络安全技能。从基础的知识库配套练习到高级的综合训练，全方位提升您的安全技能。</p>
        
        {/* 选项卡导航 */}
        <div className="flex border-b border-gray-700 mb-6">
          <button 
            className={`pb-2 px-4 text-sm font-medium ${activeTab === 'knowledge' ? 'text-primary border-b-2 border-primary' : 'text-gray-400 hover:text-white'}`}
            onClick={() => setActiveTab('knowledge')}
          >
            <FontAwesomeIcon icon={faGraduationCap} className="mr-2" />
            知识库配套练习
          </button>
          <button 
            className={`pb-2 px-4 text-sm font-medium ${activeTab === 'comprehensive' ? 'text-primary border-b-2 border-primary' : 'text-gray-400 hover:text-white'}`}
            onClick={() => setActiveTab('comprehensive')}
          >
            <FontAwesomeIcon icon={faChessBoard} className="mr-2" />
            安全综合训练
          </button>
        </div>
        
        {/* 知识库配套练习 */}
        {activeTab === 'knowledge' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">知识库配套练习</h2>
              <Link to="/knowledge" className="text-primary text-sm hover:text-primary/90">
                访问知识库
              </Link>
            </div>
            <p className="text-gray-400 mb-6">这些练习与知识库内容相匹配，帮助您巩固所学知识。从基础的SQL注入到高级的XXE漏洞，逐步提升您的安全实战能力。</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {knowledgePractices.map((practice, index) => (
                <PracticeCard key={index} {...practice} />
              ))}
            </div>
          </div>
        )}
        
        {/* 综合训练挑战 */}
        {activeTab === 'comprehensive' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">安全综合训练</h2>
              <Link to="/knowledge" className="text-primary text-sm hover:text-primary/90">
                <FontAwesomeIcon icon={faGraduationCap} className="mr-1" />
                查看学习资料
              </Link>
            </div>
            <p className="text-gray-400 mb-6">这些综合训练模拟企业真实安全场景，整合多种漏洞利用技术，帮助您构建完整的安全技能体系，提升实际应用能力。</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {comprehensivePractices.map((practice, index) => (
                <PracticeCard key={index} {...practice} />
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

export default Practice; 