import React from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const difficultyClasses = {
  '入门': 'bg-green-500/20 text-green-400',
  '基础': 'bg-blue-500/20 text-blue-400',
  '中级': 'bg-yellow-500/20 text-yellow-400',
  '高级': 'bg-orange-500/20 text-orange-400',
  '专家': 'bg-red-500/20 text-red-400',
};

const statusClasses = {
  '已完成': 'bg-green-500/20 text-green-400',
  '进行中': 'bg-blue-500/20 text-blue-400',
  '推荐': 'bg-yellow-500/20 text-yellow-400',
  '热门': 'bg-red-500/20 text-red-400',
  '新课': 'bg-purple-500/20 text-purple-400',
};

function PracticeCard({ title, description, difficulty, time, icon, tags, status, to, example }) {
  return (
    <div className="bg-[#2A2A2A] rounded-lg p-5 hover:bg-[#333333] transition-colors duration-200">
      <div className="flex justify-between items-start mb-3">
        <FontAwesomeIcon icon={icon} className="text-primary text-xl" />
        {status && (
          <span className={`px-2 py-1 rounded-full text-xs ${statusClasses[status] || ''}`}>
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
          <span className={`px-2 py-1 rounded-full text-xs ${difficultyClasses[difficulty] || 'bg-gray-500/20 text-gray-400'}`}>
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

export default PracticeCard;
