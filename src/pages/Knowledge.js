import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faSearch,
  faArrowRight,
  faExternalLinkAlt,
  faLayerGroup,
  faRoute,
} from '@fortawesome/free-solid-svg-icons';
import TerminalFeature from '../components/TerminalFeature';
import knowledgeCategories from '../data/knowledgeCategories';
import {
  learningLabInsights,
  learningPathBlueprints,
  layoutPrinciples,
} from '../data/learningLabInsights';

function Knowledge() {
  const [query, setQuery] = useState('');
  const categoryById = useMemo(() => (
    new Map(knowledgeCategories.map(category => [category.id, category]))
  ), []);

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
    <main className="max-w-7xl mx-auto px-4 py-8 relative lg:pr-28">
      <TerminalFeature />

      <header className="mb-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-4">网络安全知识库</h1>
            <p className="max-w-3xl text-gray-400">
              参考主流学习型靶场的路径、模块、任务和调查式排版方式，按“路线、章节、实验、验收、防护”组织学习材料。
            </p>
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
      </header>

      <section className="mb-8">
        <div className="mb-4 flex items-center justify-between gap-4">
          <h2 className="flex items-center text-xl font-semibold">
            <FontAwesomeIcon icon={faRoute} className="mr-2 text-primary" />
            学习路线
          </h2>
          <span className="text-sm text-gray-500">{learningPathBlueprints.length} 条推荐路径</span>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {learningPathBlueprints.map((path) => (
            <article key={path.title} className="rounded-lg border border-[#333] bg-[#222222] p-5">
              <h3 className="mb-2 text-lg font-semibold">{path.title}</h3>
              <p className="mb-4 text-sm leading-6 text-gray-400">{path.description}</p>
              <div className="flex flex-wrap gap-2">
                {path.categories.map((categoryId) => {
                  const category = categoryById.get(categoryId);
                  if (!category) {
                    return null;
                  }

                  return (
                    <Link
                      key={categoryId}
                      to={`/knowledge/${categoryId}`}
                      className="rounded border border-[#444] px-2.5 py-1 text-xs text-gray-300 transition-colors hover:border-primary hover:text-primary"
                    >
                      {category.title}
                    </Link>
                  );
                })}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div>
          <div className="mb-4 flex items-center justify-between gap-4">
            <h2 className="flex items-center text-xl font-semibold">
              <FontAwesomeIcon icon={faLayerGroup} className="mr-2 text-primary" />
              靶场学习模式参考
            </h2>
            <span className="text-sm text-gray-500">{learningLabInsights.length} 个来源</span>
          </div>

          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            {learningLabInsights.slice(0, 6).map((lab) => (
              <article key={lab.name} className="rounded-lg border border-[#333] bg-[#222222] p-4">
                <div className="mb-2 flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-semibold">{lab.name}</h3>
                    <p className="mt-1 text-xs text-primary">{lab.focus}</p>
                  </div>
                  <a
                    href={lab.url}
                    target="_blank"
                    rel="noreferrer"
                    className="shrink-0 text-gray-500 transition-colors hover:text-primary"
                    aria-label={`打开 ${lab.name}`}
                  >
                    <FontAwesomeIcon icon={faExternalLinkAlt} />
                  </a>
                </div>
                <p className="mb-3 text-sm leading-6 text-gray-400">{lab.pattern}</p>
                <ul className="space-y-1 text-xs text-gray-500">
                  {lab.takeaways.map(item => (
                    <li key={item}>- {item}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>

        <aside className="rounded-lg border border-[#333] bg-[#222222] p-5">
          <h2 className="mb-3 text-lg font-semibold">排版原则</h2>
          <ol className="space-y-3 text-sm leading-6 text-gray-300">
            {layoutPrinciples.map((principle, index) => (
              <li key={principle} className="flex gap-3">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded bg-primary/15 text-xs text-primary">
                  {index + 1}
                </span>
                <span>{principle}</span>
              </li>
            ))}
          </ol>
        </aside>
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between text-sm text-gray-400">
          <span>共 {knowledgeCategories.length} 类知识，当前显示 {filteredCategories.length} 类</span>
          {query && (
            <button type="button" className="text-primary hover:text-primary/90" onClick={() => setQuery('')}>
              清除搜索
            </button>
          )}
        </div>

        {filteredCategories.length > 0 ? (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {filteredCategories.map((category) => (
            <Link
              to={`/knowledge/${category.id}`}
              key={category.id}
              className="block rounded-lg border border-[#333] bg-[#222222] p-5 transition-colors duration-200 hover:border-primary/60 hover:bg-[#282828]"
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
          <div className="rounded-lg border border-[#333] bg-[#222222] p-8 text-center text-gray-400">
            未找到匹配的知识分类，请尝试更短的关键词。
          </div>
        )}
      </section>
    </main>
  );
}

export default Knowledge;
