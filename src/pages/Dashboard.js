import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faBug, 
  faGraduationCap, 
  faUsers, 
  faChevronLeft, 
  faChevronRight,
  faShieldAlt,
  faCode,
  faTerminal,
  faLock,
  faEllipsisH,
  faUpload,
  faExchangeAlt,
  faFileCode
} from '@fortawesome/free-solid-svg-icons';
import TerminalFeature from '../components/TerminalPanel';
import { Link } from 'react-router-dom';

function Dashboard() {
  return (
    <main className="max-w-7xl mx-auto px-4 py-8 relative">
      <TerminalFeature />
      
      <div className="grid grid-cols-1 gap-8 mb-8">
        <div className="bg-[#222222] rounded-lg p-6">
          <h1 className="text-3xl font-bold mb-4">欢迎来到 ReLum 网络安全实验场</h1>
          <p className="text-gray-400 mb-6">这里是一个专业的网络安全学习和实践平台，我们提供全面的漏洞实验环境和学习资源。</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[#2A2A2A] rounded-lg p-6">
              <FontAwesomeIcon icon={faBug} className="text-primary text-3xl mb-4" />
              <h3 className="text-xl font-semibold mb-2">漏洞实验</h3>
              <p className="text-gray-400">提供真实的漏洞环境，让您在实践中学习安全知识。</p>
            </div>
            <div className="bg-[#2A2A2A] rounded-lg p-6">
              <FontAwesomeIcon icon={faGraduationCap} className="text-primary text-3xl mb-4" />
              <h3 className="text-xl font-semibold mb-2">专业课程</h3>
              <p className="text-gray-400">系统化的学习路径，从基础到高级的安全知识体系。</p>
            </div>
            <div className="bg-[#2A2A2A] rounded-lg p-6">
              <FontAwesomeIcon icon={faUsers} className="text-primary text-3xl mb-4" />
              <h3 className="text-xl font-semibold mb-2">智能问答</h3>
              <p className="text-gray-400">提供智能ai，辅助您完成网络安全的学习。</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-[#222222] rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">最新实验</h2>
              <Link to="/knowledge" className="text-primary hover:text-primary/90">查看全部</Link>
            </div>
            <div className="space-y-4">
              <Link to="/knowledge/file-upload" className="bg-[#2A2A2A] rounded-lg p-4 block hover:bg-[#333333] transition-colors">
                <div className="flex justify-between items-start">
                  <div className="flex items-start">
                    <FontAwesomeIcon icon={faUpload} className="text-primary mt-1 mr-3" />
                    <div>
                      <h3 className="font-medium mb-2">任意文件上传漏洞</h3>
                      <p className="text-sm text-gray-400">难度：高级 | 时长：3小时</p>
                    </div>
                  </div>
                  <span className="bg-red-500/20 text-red-400 px-2 py-1 rounded-full text-sm">热门</span>
                </div>
              </Link>
              <Link to="/knowledge/logic-vulnerabilities" className="bg-[#2A2A2A] rounded-lg p-4 block hover:bg-[#333333] transition-colors">
                <div className="flex justify-between items-start">
                  <div className="flex items-start">
                    <FontAwesomeIcon icon={faExchangeAlt} className="text-primary mt-1 mr-3" />
                    <div>
                      <h3 className="font-medium mb-2">业务逻辑漏洞利用</h3>
                      <p className="text-sm text-gray-400">难度：中级 | 时长：2.5小时</p>
                    </div>
                  </div>
                  <span className="bg-primary/20 text-primary px-2 py-1 rounded-full text-sm">新课</span>
                </div>
              </Link>
              <Link to="/knowledge/xxe" className="bg-[#2A2A2A] rounded-lg p-4 block hover:bg-[#333333] transition-colors">
                <div className="flex justify-between items-start">
                  <div className="flex items-start">
                    <FontAwesomeIcon icon={faFileCode} className="text-primary mt-1 mr-3" />
                    <div>
                      <h3 className="font-medium mb-2">XML外部实体注入漏洞</h3>
                      <p className="text-sm text-gray-400">难度：专家 | 时长：4小时</p>
                    </div>
                  </div>
                  <span className="bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded-full text-sm">挑战</span>
                </div>
              </Link>
            </div>
          </div>

          <div className="bg-[#222222] rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">学习进度</h2>
              <button className="text-primary hover:text-primary/90">
                <FontAwesomeIcon icon={faEllipsisH} />
              </button>
            </div>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-400">网络攻击基础</span>
                  <span className="text-sm text-primary">70%</span>
                </div>
                <div className="h-2 bg-[#2A2A2A] rounded-full">
                  <div className="h-2 bg-primary rounded-full" style={{ width: '70%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-400">漏洞利用技术</span>
                  <span className="text-sm text-primary">45%</span>
                </div>
                <div className="h-2 bg-[#2A2A2A] rounded-full">
                  <div className="h-2 bg-primary rounded-full" style={{ width: '45%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-400">中间件安全</span>
                  <span className="text-sm text-primary">30%</span>
                </div>
                <div className="h-2 bg-[#2A2A2A] rounded-full">
                  <div className="h-2 bg-primary rounded-full" style={{ width: '30%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-400">组件与框架安全</span>
                  <span className="text-sm text-primary">25%</span>
                </div>
                <div className="h-2 bg-[#2A2A2A] rounded-full">
                  <div className="h-2 bg-primary rounded-full" style={{ width: '25%' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-[#222222] rounded-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">推荐课程</h2>
            <div className="flex space-x-2">
              <button className="!rounded-button bg-secondary hover:bg-secondary/90 p-2 whitespace-nowrap transition-colors duration-200">
                <FontAwesomeIcon icon={faChevronLeft} />
              </button>
              <button className="!rounded-button bg-secondary hover:bg-secondary/90 p-2 whitespace-nowrap transition-colors duration-200">
                <FontAwesomeIcon icon={faChevronRight} />
              </button>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-[#2A2A2A] rounded-lg overflow-hidden">
              <div className="aspect-video bg-[#333333] flex items-center justify-center">
                <FontAwesomeIcon icon={faShieldAlt} className="text-primary text-3xl" />
              </div>
              <div className="p-4">
                <h3 className="font-medium mb-2">网络安全入门指南</h3>
                <p className="text-sm text-gray-400 mb-3">适合初学者的基础安全知识课程</p>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-primary">12 课时</span>
                  <button className="!rounded-button bg-primary hover:bg-primary/90 text-white px-3 py-1 text-sm whitespace-nowrap transition-colors duration-200">
                    开始学习
                  </button>
                </div>
              </div>
            </div>
            <div className="bg-[#2A2A2A] rounded-lg overflow-hidden">
              <div className="aspect-video bg-[#333333] flex items-center justify-center">
                <FontAwesomeIcon icon={faCode} className="text-primary text-3xl" />
              </div>
              <div className="p-4">
                <h3 className="font-medium mb-2">Web 漏洞挖掘技术</h3>
                <p className="text-sm text-gray-400 mb-3">深入学习常见的 Web 漏洞类型</p>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-primary">16 课时</span>
                  <button className="!rounded-button bg-primary hover:bg-primary/90 text-white px-3 py-1 text-sm whitespace-nowrap transition-colors duration-200">
                    开始学习
                  </button>
                </div>
              </div>
            </div>
            <div className="bg-[#2A2A2A] rounded-lg overflow-hidden">
              <div className="aspect-video bg-[#333333] flex items-center justify-center">
                <FontAwesomeIcon icon={faTerminal} className="text-primary text-3xl" />
              </div>
              <div className="p-4">
                <h3 className="font-medium mb-2">渗透测试实战</h3>
                <p className="text-sm text-gray-400 mb-3">手把手教你进行渗透测试</p>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-primary">20 课时</span>
                  <button className="!rounded-button bg-primary hover:bg-primary/90 text-white px-3 py-1 text-sm whitespace-nowrap transition-colors duration-200">
                    开始学习
                  </button>
                </div>
              </div>
            </div>
            <div className="bg-[#2A2A2A] rounded-lg overflow-hidden">
              <div className="aspect-video bg-[#333333] flex items-center justify-center">
                <FontAwesomeIcon icon={faLock} className="text-primary text-3xl" />
              </div>
              <div className="p-4">
                <h3 className="font-medium mb-2">安全开发实践</h3>
                <p className="text-sm text-gray-400 mb-3">学习如何开发安全的应用程序</p>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-primary">15 课时</span>
                  <button className="!rounded-button bg-primary hover:bg-primary/90 text-white px-3 py-1 text-sm whitespace-nowrap transition-colors duration-200">
                    开始学习
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default Dashboard;