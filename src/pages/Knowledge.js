import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faSearch,
  faArrowRight
} from '@fortawesome/free-solid-svg-icons';
import TerminalFeature from '../components/TerminalPanel';
import knowledgeCategories from '../data/knowledgeCategories';

function Knowledge() {
  const [query, setQuery] = useState('');

  const filteredCategories = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return knowledgeCategories;
    }

    return knowledgeCategories.filter(category => {
      const searchableText = [
        category.title,
        category.description,
        ...category.items,
      ].join(' ').toLowerCase();

      return searchableText.includes(normalizedQuery);
    });
  }, [query]);

  return (
    <main className="max-w-7xl mx-auto px-4 py-8 relative">
      <TerminalFeature />

      <div className="bg-[#222222] rounded-lg p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-4">网络安全知识库</h1>
            <p className="text-gray-400">这里汇集了丰富的网络安全知识和学习资源。</p>
          </div>

          <label className="relative w-full md:max-w-sm">
            <span className="sr-only">搜索知识库</span>
            <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="搜索漏洞、技术或章节"
              className="w-full bg-[#1E1E1E] border border-[#444] rounded-md pl-10 pr-3 py-2 text-white outline-none focus:border-primary"
            />
          </label>
        </div>

        <div className="flex items-center justify-between text-sm text-gray-400 mb-4">
          <span>共 {knowledgeCategories.length} 类知识，当前显示 {filteredCategories.length} 类</span>
          {query && (
            <button type="button" className="text-primary hover:text-primary/90" onClick={() => setQuery('')}>
              清除搜索
            </button>
          )}
        </div>

        {filteredCategories.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCategories.map((category) => (
            <Link
              to={`/knowledge/${category.id}`}
              key={category.id}
              className="bg-[#2A2A2A] rounded-lg p-5 hover:bg-[#333333] transition-colors duration-200 block"
            >
              <div className="flex justify-between items-start">
                <FontAwesomeIcon icon={category.icon} className="text-primary text-2xl mb-3" />
                <FontAwesomeIcon icon={faArrowRight} className="text-gray-500 text-sm" />
              </div>
              <h2 className="text-xl font-semibold mb-2">{category.title}</h2>
              <p className="text-gray-400 mb-4">{category.description}</p>
              <ul className="text-sm text-gray-400 space-y-1 ml-4 list-disc">
                {category.items.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </Link>
            ))}
          </div>
        ) : (
          <div className="bg-[#2A2A2A] rounded-lg p-8 text-center text-gray-400">
            未找到匹配的知识分类，请尝试更短的关键词。
          </div>
        )}
      </div>
    </main>
  );
}

export default Knowledge;
