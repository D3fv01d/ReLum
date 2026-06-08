import React from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGraduationCap } from '@fortawesome/free-solid-svg-icons';
import TerminalFeature from '../components/TerminalPanel';
import PracticeCard from '../components/PracticeCard';
import comprehensivePractices from '../data/practiceCatalog';

function Practice() {
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
