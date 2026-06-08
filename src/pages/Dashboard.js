import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBug,
  faGraduationCap,
  faUsers,
  faShieldAlt,
  faCode,
  faTerminal,
  faLock,
  faEllipsisH,
  faUpload,
  faExchangeAlt,
  faFileCode
} from '@fortawesome/free-solid-svg-icons';
import TerminalFeature from '../components/TerminalFeature';
import { Link } from 'react-router-dom';

const featureCards = [
  {
    icon: faBug,
    title: '漏洞实验',
    description: '提供真实的漏洞环境，让您在实践中学习安全知识。',
  },
  {
    icon: faGraduationCap,
    title: '专业课程',
    description: '系统化的学习路径，从基础到高级的安全知识体系。',
  },
  {
    icon: faUsers,
    title: '智能问答',
    description: '提供智能 AI，辅助您完成网络安全的学习。',
  },
];

const latestLabs = [
  {
    to: '/knowledge/file-upload',
    icon: faUpload,
    title: '任意文件上传漏洞',
    meta: '难度：高级 | 时长：3小时',
    badge: '热门',
    badgeClass: 'bg-red-500/20 text-red-400',
  },
  {
    to: '/knowledge/logic-vulnerabilities',
    icon: faExchangeAlt,
    title: '业务逻辑漏洞利用',
    meta: '难度：中级 | 时长：2.5小时',
    badge: '新课',
    badgeClass: 'bg-primary/20 text-primary',
  },
  {
    to: '/knowledge/xxe',
    icon: faFileCode,
    title: 'XML外部实体注入漏洞',
    meta: '难度：专家 | 时长：4小时',
    badge: '挑战',
    badgeClass: 'bg-yellow-500/20 text-yellow-400',
  },
];

const progressItems = [
  { label: '网络攻击基础', value: 70 },
  { label: '漏洞利用技术', value: 45 },
  { label: '中间件安全', value: 30 },
  { label: '组件与框架安全', value: 25 },
];

const recommendedCourses = [
  {
    to: '/knowledge/sql-injection',
    icon: faShieldAlt,
    title: '网络安全入门指南',
    description: '适合初学者的基础安全知识课程',
    lessons: '12 课时',
  },
  {
    to: '/knowledge/xss',
    icon: faCode,
    title: 'Web 漏洞挖掘技术',
    description: '深入学习常见的 Web 漏洞类型',
    lessons: '16 课时',
  },
  {
    to: '/knowledge/command-execution',
    icon: faTerminal,
    title: '渗透测试实战',
    description: '手把手教你进行渗透测试',
    lessons: '20 课时',
  },
  {
    to: '/knowledge/file-download',
    icon: faLock,
    title: '安全开发实践',
    description: '学习如何开发安全的应用程序',
    lessons: '15 课时',
  },
];

function Dashboard() {
  return (
    <main className="max-w-7xl mx-auto px-4 py-8 relative">
      <TerminalFeature />

      <div className="grid grid-cols-1 gap-8 mb-8">
        <div className="bg-[#222222] rounded-lg p-6">
          <h1 className="text-3xl font-bold mb-4">欢迎来到 ReLum 网络安全实验场</h1>
          <p className="text-gray-400 mb-6">这里是一个专业的网络安全学习和实践平台，我们提供全面的漏洞实验环境和学习资源。</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featureCards.map(feature => (
              <div key={feature.title} className="bg-[#2A2A2A] rounded-lg p-6">
                <FontAwesomeIcon icon={feature.icon} className="text-primary text-3xl mb-4" />
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-[#222222] rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">最新实验</h2>
              <Link to="/knowledge" className="text-primary hover:text-primary/90">查看全部</Link>
            </div>
            <div className="space-y-4">
              {latestLabs.map(lab => (
                <Link key={lab.to} to={lab.to} className="bg-[#2A2A2A] rounded-lg p-4 block hover:bg-[#333333] transition-colors">
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex items-start min-w-0">
                      <FontAwesomeIcon icon={lab.icon} className="text-primary mt-1 mr-3" />
                      <div className="min-w-0">
                        <h3 className="font-medium mb-2">{lab.title}</h3>
                        <p className="text-sm text-gray-400">{lab.meta}</p>
                      </div>
                    </div>
                    <span className={`${lab.badgeClass} px-2 py-1 rounded-full text-sm shrink-0`}>{lab.badge}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          <div className="bg-[#222222] rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">学习进度</h2>
              <Link to="/knowledge" className="text-primary hover:text-primary/90" aria-label="查看知识库">
                <FontAwesomeIcon icon={faEllipsisH} />
              </Link>
            </div>
            <div className="space-y-6">
              {progressItems.map(item => (
                <div key={item.label}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-400">{item.label}</span>
                    <span className="text-sm text-primary">{item.value}%</span>
                  </div>
                  <div className="h-2 bg-[#2A2A2A] rounded-full" role="progressbar" aria-label={item.label} aria-valuenow={item.value} aria-valuemin="0" aria-valuemax="100">
                    <div className="h-2 bg-primary rounded-full" style={{ width: `${item.value}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-[#222222] rounded-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">推荐课程</h2>
            <Link to="/knowledge" className="text-primary hover:text-primary/90 text-sm">查看知识库</Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {recommendedCourses.map(course => (
              <div key={course.to} className="bg-[#2A2A2A] rounded-lg overflow-hidden">
                <div className="aspect-video bg-[#333333] flex items-center justify-center">
                  <FontAwesomeIcon icon={course.icon} className="text-primary text-3xl" />
                </div>
                <div className="p-4">
                  <h3 className="font-medium mb-2">{course.title}</h3>
                  <p className="text-sm text-gray-400 mb-3">{course.description}</p>
                  <div className="flex justify-between items-center gap-3">
                    <span className="text-sm text-primary">{course.lessons}</span>
                    <Link to={course.to} className="!rounded-button bg-primary hover:bg-primary/90 text-white px-3 py-1 text-sm whitespace-nowrap transition-colors duration-200">
                      开始学习
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}

export default Dashboard;
