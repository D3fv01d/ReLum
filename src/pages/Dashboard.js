import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowRight,
  faBookOpen,
  faCheck,
  faCircleExclamation,
  faClockRotateLeft,
  faGear,
  faRobot,
  faServer,
} from '@fortawesome/free-solid-svg-icons';
import knowledgeCategories from '../data/knowledgeCategories';
import knowledgeData from '../data/knowledgeDetails';
import { learningPathBlueprints } from '../data/learningPaths';
import { getAiProviderPreset } from '../config/aiProviders';
import { getActiveAiConfig } from '../services/aiConfigService';
import {
  checkDockerInstalled,
  getRunningContainers,
} from '../services/targetService';
import useLearningProgress from '../hooks/useLearningProgress';
import { isSectionCompleted } from '../services/learningProgressStore';
import { listTargetSections } from '../utils/targetEnvironmentUtils';

const categoryById = new Map(
  knowledgeCategories.map((category) => [category.id, category])
);

const getSectionHref = (categoryId, sectionTitle) => {
  const sectionIndex = knowledgeData[categoryId]?.sections
    ?.findIndex((section) => section.title === sectionTitle);
  const hash = sectionIndex >= 0
    ? `#knowledge-${categoryId}-section-${sectionIndex + 1}`
    : '';

  return `/knowledge/${categoryId}${hash}`;
};

const formatVisitTime = (timestamp) => (
  new Intl.DateTimeFormat('zh-CN', {
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(timestamp))
);

function Dashboard() {
  const progress = useLearningProgress();
  const [runtime, setRuntime] = useState({
    loading: true,
    dockerInstalled: false,
    containers: [],
  });

  useEffect(() => {
    let active = true;

    Promise.all([checkDockerInstalled(), getRunningContainers()])
      .then(([dockerStatus, containers]) => {
        if (active) {
          setRuntime({
            loading: false,
            dockerInstalled: Boolean(dockerStatus?.installed),
            containers,
          });
        }
      });

    return () => {
      active = false;
    };
  }, []);

  const targetSections = useMemo(() => listTargetSections(), []);
  const completedTargetCount = useMemo(() => (
    targetSections.filter(({ category, sectionName }) => (
      isSectionCompleted(progress, category, sectionName)
    )).length
  ), [progress, targetSections]);
  const totalKnowledgeSections = useMemo(() => (
    Object.values(knowledgeData).reduce(
      (total, category) => total + (category.sections?.length || 0),
      0
    )
  ), []);
  const recentSections = progress.recentSections
    .map((item) => ({
      ...item,
      category: categoryById.get(item.categoryId),
      href: getSectionHref(item.categoryId, item.sectionTitle),
    }))
    .filter((item) => item.category)
    .slice(0, 4);
  const aiConfig = getActiveAiConfig();
  const aiProvider = getAiProviderPreset(aiConfig.provider);
  const aiReady = aiProvider.local || !aiProvider.requiresApiKey || Boolean(aiConfig.apiKey);
  return (
    <main className="app-page">
      <header className="page-heading">
        <div>
          <p className="page-eyebrow">本地训练工作台</p>
          <h1>从知识到靶场，保持一条清晰路径</h1>
          <p>课程进度由 flag 提交记录，环境状态直接读取本机 Docker 服务。</p>
        </div>
        <div className="page-heading-actions">
          <Link to="/knowledge" className="button button-primary">
            <FontAwesomeIcon icon={faBookOpen} aria-hidden="true" />
            开始学习
          </Link>
          <Link to="/settings" className="button button-secondary" aria-label="打开设置">
            <FontAwesomeIcon icon={faGear} aria-hidden="true" />
            环境设置
          </Link>
        </div>
      </header>

      <section className="metric-grid" aria-label="学习与环境概览">
        <article className="metric-item">
          <span className="metric-icon"><FontAwesomeIcon icon={faCheck} /></span>
          <div><strong>{completedTargetCount}</strong><span>已完成题目</span></div>
          <small>共 {targetSections.length} 个可运行靶场</small>
        </article>
        <article className="metric-item">
          <span className="metric-icon"><FontAwesomeIcon icon={faBookOpen} /></span>
          <div><strong>{totalKnowledgeSections}</strong><span>知识章节</span></div>
          <small>{knowledgeCategories.length} 个知识分类</small>
        </article>
        <article className="metric-item">
          <span className="metric-icon"><FontAwesomeIcon icon={faServer} /></span>
          <div>
            <strong>{runtime.loading ? '...' : runtime.containers.length}</strong>
            <span>运行中环境</span>
          </div>
          <small>{runtime.loading ? '正在读取 Docker 状态' : runtime.dockerInstalled ? 'Docker 已连接' : 'Docker 未连接'}</small>
        </article>
        <article className="metric-item">
          <span className="metric-icon"><FontAwesomeIcon icon={faRobot} /></span>
          <div><strong className="metric-text-value">{aiProvider.label}</strong><span>AI 服务</span></div>
          <small>{aiReady ? `模型 ${aiConfig.model}` : '尚未填写 API 密钥'}</small>
        </article>
      </section>

      <div className="dashboard-grid">
        <section className="content-panel dashboard-primary">
          <div className="section-heading">
            <div>
              <p className="section-kicker">最近记录</p>
              <h2>继续学习</h2>
            </div>
            <Link to="/knowledge" className="text-link">查看知识库 <FontAwesomeIcon icon={faArrowRight} /></Link>
          </div>

          {recentSections.length > 0 ? (
            <div className="activity-list">
              {recentSections.map((item) => {
                const completed = isSectionCompleted(progress, item.categoryId, item.sectionTitle);

                return (
                  <Link key={`${item.categoryId}-${item.sectionTitle}`} to={item.href} className="activity-row">
                    <span className="activity-icon">
                      <FontAwesomeIcon icon={completed ? faCheck : faClockRotateLeft} />
                    </span>
                    <span className="activity-copy">
                      <strong>{item.sectionTitle}</strong>
                      <small>{item.category.title} · {formatVisitTime(item.visitedAt)}</small>
                    </span>
                    <span className={`status-label ${completed ? 'status-success' : ''}`}>
                      {completed ? '已通过' : '学习中'}
                    </span>
                    <FontAwesomeIcon icon={faArrowRight} className="activity-arrow" />
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="empty-state">
              <FontAwesomeIcon icon={faClockRotateLeft} />
              <h3>还没有学习记录</h3>
              <p>打开任意知识章节后，这里会显示你最近访问的内容。</p>
              <Link to="/knowledge" className="button button-secondary">浏览知识库</Link>
            </div>
          )}
        </section>

        <aside className="content-panel dashboard-side">
          <div className="section-heading compact">
            <div>
              <p className="section-kicker">本机状态</p>
              <h2>运行环境</h2>
            </div>
          </div>

          <div className={`runtime-status ${runtime.dockerInstalled ? 'runtime-online' : ''}`}>
            <span className="runtime-dot" />
            <div>
              <strong>{runtime.loading ? '正在检测' : runtime.dockerInstalled ? 'Docker 可用' : 'Docker 不可用'}</strong>
              <small>{runtime.loading ? '正在连接本地服务' : runtime.dockerInstalled ? `${runtime.containers.length} 个 ReLum 容器正在运行` : '请在设置中检查本地服务'}</small>
            </div>
          </div>

          {runtime.containers.length > 0 && (
            <ul className="runtime-list">
              {runtime.containers.slice(0, 3).map((container) => (
                <li key={container.id || container.name}>
                  <span>{container.name}</span>
                  <small>{container.image}</small>
                </li>
              ))}
            </ul>
          )}

          <Link to="/settings" className="button button-secondary button-block">
            管理本地环境
            <FontAwesomeIcon icon={faArrowRight} />
          </Link>
        </aside>
      </div>

      <section className="content-panel path-panel">
        <div className="section-heading">
          <div>
            <p className="section-kicker">推荐顺序</p>
            <h2>学习路径</h2>
          </div>
        </div>
        <div className="path-list">
          {learningPathBlueprints.map((path, index) => (
            <article key={path.title} className="path-row">
              <span className="path-index">{String(index + 1).padStart(2, '0')}</span>
              <div>
                <h3>{path.title}</h3>
                <p>{path.description}</p>
              </div>
              <span className="path-count">{path.categories.length} 个模块</span>
              <Link to={`/knowledge?path=${path.id}`} aria-label={`打开${path.title}`}>
                <FontAwesomeIcon icon={faArrowRight} />
              </Link>
            </article>
          ))}
        </div>
      </section>

      {!runtime.loading && !runtime.dockerInstalled && (
        <div className="inline-notice" role="status">
          <FontAwesomeIcon icon={faCircleExclamation} />
          <span>本机 Docker 服务当前不可用，知识内容仍可阅读，但无法启动靶场。</span>
          <Link to="/settings">检查设置</Link>
        </div>
      )}
    </main>
  );
}

export default Dashboard;
