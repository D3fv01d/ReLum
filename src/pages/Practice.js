import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowRight,
  faCheck,
  faCloudArrowDown,
  faCube,
  faSearch,
} from '@fortawesome/free-solid-svg-icons';
import knowledgeCategories from '../data/knowledgeCategories';
import knowledgeData from '../data/knowledgeDetails';
import { getInstalledImages } from '../services/targetService';
import useLearningProgress from '../hooks/useLearningProgress';
import { isSectionCompleted } from '../services/learningProgressStore';
import {
  getFilteredEnvironmentGroups,
  isImageInstalled,
  listTargetSections,
} from '../utils/targetEnvironmentUtils';

const categoryById = new Map(
  knowledgeCategories.map((category) => [category.id, category])
);

const getSectionHref = (categoryId, sectionTitle) => {
  const index = knowledgeData[categoryId]?.sections
    ?.findIndex((section) => section.title === sectionTitle);
  return `/knowledge/${categoryId}${index >= 0 ? `#knowledge-${categoryId}-section-${index + 1}` : ''}`;
};

function Practice() {
  const [query, setQuery] = useState('');
  const [installedImages, setInstalledImages] = useState([]);
  const [loadingImages, setLoadingImages] = useState(true);
  const progress = useLearningProgress();
  const groups = useMemo(() => getFilteredEnvironmentGroups(query), [query]);
  const totalTargets = useMemo(() => listTargetSections().length, []);
  const visibleTargets = groups.reduce((total, group) => total + group.sections.length, 0);

  useEffect(() => {
    let active = true;

    getInstalledImages().then((result) => {
      if (active) {
        setInstalledImages(result.images || []);
        setLoadingImages(false);
      }
    });

    return () => {
      active = false;
    };
  }, []);

  return (
    <main className="app-page">
      <header className="page-heading">
        <div>
          <p className="page-eyebrow">本地靶场</p>
          <h1>选择真实环境，完成后提交 flag</h1>
          <p>环境列表来自项目配置，镜像安装状态直接读取本机 Docker。</p>
        </div>
        <label className="search-field">
          <span className="sr-only">搜索靶场</span>
          <FontAwesomeIcon icon={faSearch} aria-hidden="true" />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="搜索题目或镜像"
          />
        </label>
      </header>

      <div className="results-bar">
        <span>显示 {visibleTargets} / {totalTargets} 个已配置靶场</span>
        {query && <button type="button" onClick={() => setQuery('')}>清除搜索</button>}
      </div>

      {groups.length > 0 ? (
        <div className="lab-groups">
          {groups.map(({ category, sections }, index) => {
            const categoryMeta = categoryById.get(category);

            return (
              <details
                key={`${category}-${query ? 'search' : 'browse'}`}
                className="content-panel lab-group"
                open={Boolean(query) || index === 0}
              >
                <summary className="lab-group-heading">
                  <div className="knowledge-icon">
                    <FontAwesomeIcon icon={categoryMeta?.icon || faCube} />
                  </div>
                  <div>
                    <h2>{categoryMeta?.title || category}</h2>
                    <p>{categoryMeta?.description || `${sections.length} 个本地实验环境`}</p>
                  </div>
                  <span>{sections.length} 题</span>
                  <FontAwesomeIcon icon={faArrowRight} className="lab-group-arrow" />
                </summary>

                <div className="lab-list">
                  {sections.map(({ sectionName, target }) => {
                    const installed = isImageInstalled(installedImages, target.dockerImage);
                    const completed = isSectionCompleted(progress, category, sectionName);

                    return (
                      <Link
                        key={sectionName}
                        to={getSectionHref(category, sectionName)}
                        className="lab-row"
                      >
                        <span className={`lab-state ${completed ? 'completed' : ''}`}>
                          <FontAwesomeIcon icon={completed ? faCheck : faCube} />
                        </span>
                        <span className="lab-copy">
                          <strong>{sectionName}</strong>
                          <small>{target.description}</small>
                        </span>
                        <span className={`install-state ${installed ? 'installed' : ''}`}>
                          <FontAwesomeIcon icon={installed ? faCheck : faCloudArrowDown} />
                          {loadingImages ? '检测中' : installed ? '已安装' : '启动时下载'}
                        </span>
                        <FontAwesomeIcon icon={faArrowRight} className="lab-arrow" />
                      </Link>
                    );
                  })}
                </div>
              </details>
            );
          })}
        </div>
      ) : (
        <div className="empty-state content-panel">
          <FontAwesomeIcon icon={faSearch} />
          <h2>没有匹配的靶场</h2>
          <p>可按题目名称、分类、说明或 Docker 镜像搜索。</p>
          <button type="button" className="button button-secondary" onClick={() => setQuery('')}>清除搜索</button>
        </div>
      )}
    </main>
  );
}

export default Practice;
