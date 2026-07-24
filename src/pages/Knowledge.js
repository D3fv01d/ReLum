import React, { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowRight,
  faBookOpen,
  faCheck,
  faFlagCheckered,
  faRoute,
  faSearch,
} from '@fortawesome/free-solid-svg-icons';
import knowledgeCategories from '../data/knowledgeCategories';
import knowledgeData from '../data/knowledgeDetails';
import {
  getLearningPath,
  learningPaths,
} from '../data/learningPaths';
import useLearningProgress from '../hooks/useLearningProgress';
import { isSectionCompleted } from '../services/learningProgressStore';

const DEFAULT_PATH_ID = 'foundation';
const categoryById = new Map(
  knowledgeCategories.map((category) => [category.id, category])
);

const getCategoryProgress = (progress, categoryId) => {
  const sections = knowledgeData[categoryId]?.sections || [];
  const completed = sections.filter((section) => (
    isSectionCompleted(progress, categoryId, section.title)
  )).length;

  return { completed, total: sections.length };
};

const getCategoriesProgress = (progress, categoryIds) => (
  categoryIds.reduce((summary, categoryId) => {
    const categoryProgress = getCategoryProgress(progress, categoryId);
    return {
      completed: summary.completed + categoryProgress.completed,
      total: summary.total + categoryProgress.total,
    };
  }, { completed: 0, total: 0 })
);

function KnowledgeCard({ category, pathId, progress }) {
  const categoryProgress = getCategoryProgress(progress, category.id);
  const hasProgress = categoryProgress.completed > 0;
  const pathQuery = pathId && pathId !== 'catalog' ? `?path=${pathId}` : '';

  return (
    <Link to={`/knowledge/${category.id}${pathQuery}`} className="knowledge-card">
      <div className="knowledge-card-top">
        <span className="knowledge-icon"><FontAwesomeIcon icon={category.icon} /></span>
        <span className={`knowledge-progress ${hasProgress ? 'has-progress' : ''}`}>
          {hasProgress && <FontAwesomeIcon icon={faCheck} />}
          {categoryProgress.completed}/{categoryProgress.total}
        </span>
      </div>
      <h3>{category.title}</h3>
      <p>{category.description}</p>
      <div className="knowledge-card-footer">
        <span><FontAwesomeIcon icon={faBookOpen} /> {category.items.length} 个主题</span>
        <FontAwesomeIcon icon={faArrowRight} />
      </div>
    </Link>
  );
}

function Knowledge() {
  const [query, setQuery] = useState('');
  const [searchParams, setSearchParams] = useSearchParams();
  const progress = useLearningProgress();
  const selectedPathId = searchParams.get('path') || DEFAULT_PATH_ID;
  const activePath = getLearningPath(selectedPathId);
  const isCatalog = selectedPathId === 'catalog' || !activePath;
  const normalizedQuery = query.trim().toLowerCase();

  const searchResults = useMemo(() => {
    if (!normalizedQuery) {
      return [];
    }

    return knowledgeCategories.filter((category) => (
      [category.title, category.description, ...category.items]
        .join(' ')
        .toLowerCase()
        .includes(normalizedQuery)
    ));
  }, [normalizedQuery]);

  const pathProgress = activePath
    ? getCategoriesProgress(progress, activePath.categories)
    : null;

  const selectPath = (pathId) => {
    setSearchParams({ path: pathId });
    setQuery('');
  };

  return (
    <main className="app-page">
      <header className="page-heading">
        <div>
          <p className="page-eyebrow">学习中心</p>
          <h1>先明确目标，再按阶段完成训练</h1>
          <p>每条路径都有前置要求、阶段目标和完成标准；也可以搜索后直接进入单个专题。</p>
        </div>
        <label className="search-field">
          <span className="sr-only">搜索知识库</span>
          <FontAwesomeIcon icon={faSearch} aria-hidden="true" />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="搜索漏洞、技能或章节"
          />
        </label>
      </header>

      <nav className="path-filter" aria-label="学习路径">
        {learningPaths.map((path) => (
          <button
            key={path.id}
            type="button"
            className={activePath?.id === path.id && !normalizedQuery ? 'active' : ''}
            onClick={() => selectPath(path.id)}
          >
            {path.shortTitle}
          </button>
        ))}
        <button
          type="button"
          className={isCatalog && !normalizedQuery ? 'active' : ''}
          onClick={() => selectPath('catalog')}
        >
          全部专题
        </button>
      </nav>

      {normalizedQuery ? (
        <section className="knowledge-search-results">
          <div className="results-bar">
            <span>在全部专题中找到 {searchResults.length} 个结果</span>
            <button type="button" onClick={() => setQuery('')}>退出搜索</button>
          </div>
          {searchResults.length > 0 ? (
            <div className="knowledge-grid">
              {searchResults.map((category) => (
                <KnowledgeCard
                  key={category.id}
                  category={category}
                  pathId={activePath?.id}
                  progress={progress}
                />
              ))}
            </div>
          ) : (
            <div className="empty-state content-panel">
              <FontAwesomeIcon icon={faSearch} />
              <h2>没有匹配内容</h2>
              <p>尝试使用漏洞名称、技术术语或更短的关键词。</p>
              <button type="button" className="button button-secondary" onClick={() => setQuery('')}>
                清除搜索
              </button>
            </div>
          )}
        </section>
      ) : activePath ? (
        <>
          <section className="learning-path-overview content-panel">
            <div className="path-overview-main">
              <div className="path-overview-meta">
                <span><FontAwesomeIcon icon={faRoute} /> {activePath.level}</span>
                <span>{activePath.stages.length} 个阶段</span>
                <span>{activePath.categories.length} 个模块</span>
              </div>
              <h2>{activePath.title}</h2>
              <p>{activePath.description}</p>
              <div className="path-outcome">
                <FontAwesomeIcon icon={faFlagCheckered} />
                <span><strong>完成后：</strong>{activePath.outcome}</span>
              </div>
            </div>
            <div className="path-overview-progress">
              <span>路径进度</span>
              <strong>{pathProgress.completed} / {pathProgress.total}</strong>
              <div className="progress-track" role="progressbar" aria-valuemin="0" aria-valuemax={pathProgress.total} aria-valuenow={pathProgress.completed}>
                <span style={{ width: `${pathProgress.total ? (pathProgress.completed / pathProgress.total) * 100 : 0}%` }} />
              </div>
              <small>{activePath.audience}</small>
            </div>
          </section>

          <div className="learning-stages">
            {activePath.stages.map((stage, stageIndex) => {
              const stageProgress = getCategoriesProgress(progress, stage.categories);

              return (
                <section key={stage.id} className="learning-stage">
                  <header className="learning-stage-heading">
                    <span>{String(stageIndex + 1).padStart(2, '0')}</span>
                    <div>
                      <p>阶段 {stageIndex + 1}</p>
                      <h2>{stage.title}</h2>
                      <small>{stage.description}</small>
                    </div>
                    <div className="stage-progress">
                      <strong>{stageProgress.completed}/{stageProgress.total}</strong>
                      <span>章节完成</span>
                    </div>
                  </header>
                  <div className="stage-objective">
                    <strong>阶段目标</strong>
                    <span>{stage.objective}</span>
                  </div>
                  <div className="knowledge-grid">
                    {stage.categories.map((categoryId) => {
                      const category = categoryById.get(categoryId);
                      return category ? (
                        <KnowledgeCard
                          key={category.id}
                          category={category}
                          pathId={activePath.id}
                          progress={progress}
                        />
                      ) : null;
                    })}
                  </div>
                </section>
              );
            })}
          </div>
        </>
      ) : (
        <section>
          <div className="results-bar">
            <span>共 {knowledgeCategories.length} 个知识专题</span>
          </div>
          <div className="knowledge-grid">
            {knowledgeCategories.map((category) => (
              <KnowledgeCard
                key={category.id}
                category={category}
                pathId="catalog"
                progress={progress}
              />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}

export default Knowledge;
