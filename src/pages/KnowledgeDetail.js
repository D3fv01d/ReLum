import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowLeft,
  faCheck,
  faExclamationTriangle,
} from '@fortawesome/free-solid-svg-icons';
import KnowledgeSectionCard from '../components/KnowledgeSectionCard';
import KnowledgeOutlineNav from '../components/knowledge/KnowledgeOutlineNav';
import ModuleLearningGuide from '../components/knowledge/ModuleLearningGuide';
import {
  startTargetEnvironment,
  stopTargetEnvironment,
  getRunningTargetInfo,
  getTargetForSection,
} from '../services/targetService';
import knowledgeData from '../data/knowledgeDetails';
import { verifySectionFlag } from '../utils/flagValidation';
import useLearningProgress from '../hooks/useLearningProgress';
import {
  getCategoryPathContexts,
} from '../data/learningPaths';
import {
  isSectionCompleted,
  recordSectionCompletion,
  recordSectionVisit,
} from '../services/learningProgressStore';

function KnowledgeDetail() {
  const { categoryId } = useParams();
  const [searchParams] = useSearchParams();
  const category = knowledgeData[categoryId] || null;
  const pathContexts = useMemo(() => getCategoryPathContexts(categoryId), [categoryId]);
  const requestedPathId = searchParams.get('path');
  const learningContext = pathContexts.find(({ path }) => path.id === requestedPathId) || pathContexts[0] || null;
  const progress = useLearningProgress();
  const [activeSectionId, setActiveSectionId] = useState(null);
  const [targetEnvStatuses, setTargetEnvStatuses] = useState({});
  const [copyStatus, setCopyStatus] = useState('');
  const [flagValues, setFlagValues] = useState({});
  const [flagStatus, setFlagStatus] = useState({});
  const sectionIds = useMemo(() => {
    if (!category?.sections) {
      return [];
    }

    return category.sections.map((_, index) => `knowledge-${categoryId}-section-${index + 1}`);
  }, [category, categoryId]);
  const activeSectionIndex = Math.max(0, sectionIds.indexOf(activeSectionId));
  const activeSection = category?.sections?.[activeSectionIndex];
  const completedSectionTitles = useMemo(() => (
    new Set((category?.sections || [])
      .filter((section) => isSectionCompleted(progress, categoryId, section.title))
      .map((section) => section.title))
  ), [category, categoryId, progress]);

  // 处理复制URL到剪贴板
  const handleCopyUrl = (url) => {
    if (url) {
      navigator.clipboard.writeText(url)
        .then(() => {
          setCopyStatus('已复制');
          setTimeout(() => setCopyStatus(''), 2000);
        })
        .catch(() => setCopyStatus('复制失败'));
    }
  };

  // 处理关闭环境
  const handleStopEnvironment = async (section) => {
    try {
      const result = await stopTargetEnvironment(categoryId, section.title);

      if (result.error) {
        setTargetEnvStatuses(prev => ({
          ...prev,
          [section.title]: {
            error: result.message,
            loading: false,
            url: null,
            status: '关闭环境失败'
          },
        }));
      } else {
        setTargetEnvStatuses((prev) => {
          const updatedStatuses = { ...prev };
          delete updatedStatuses[section.title];
          return updatedStatuses;
        });
      }
    } catch (error) {
      console.error('关闭环境失败:', error);
      setTargetEnvStatuses(prev => ({
        ...prev,
        [section.title]: {
          error: error.message,
          loading: false,
          url: null,
          status: '关闭环境失败'
        },
      }));
    }
  };

  // 处理实验按钮点击
  const handleExperimentClick = async (section) => {
    setTargetEnvStatuses(prev => ({
      ...prev,
      [section.title]: { loading: true, error: null, url: null, status: '正在准备启动靶场环境...' },
    }));

    try {
      const result = await startTargetEnvironment(categoryId, section.title);

      if (result.error) {
        setTargetEnvStatuses(prev => ({
          ...prev,
          [section.title]: { loading: false, error: result.message, url: null },
        }));
      } else {
        const envStatus = {
          loading: false,
          error: null,
          url: result.url,
          localUrl: result.localUrl,
          ipAddress: result.ipAddress,
          containerName: result.containerName,
          port: result.port,
          status: result.status || '靶场环境已成功启动'
        };

        setTargetEnvStatuses(prev => ({
          ...prev,
          [section.title]: envStatus,
        }));

        if (result.url && result.status !== '使用已运行的靶场环境') {
          window.open(result.url, '_blank');
        }
      }
    } catch (error) {
      console.error('启动环境失败:', error);

      setTargetEnvStatuses(prev => ({
        ...prev,
        [section.title]: { loading: false, error: error.message, url: null },
      }));
    }
  };

  const checkRunningEnvironments = useCallback(() => {
    if (!category || !category.sections) return;

    const updatedStatuses = {};

    for (const section of category.sections) {
      const runningInfo = getRunningTargetInfo(categoryId, section.title);
      if (runningInfo) {
        const envStatus = {
          loading: false,
          error: null,
          url: runningInfo.url,
          localUrl: runningInfo.localUrl,
          ipAddress: runningInfo.ipAddress,
          containerName: runningInfo.containerName,
          port: runningInfo.port,
          status: '靶场环境已启动'
        };

        updatedStatuses[section.title] = envStatus;
      }
    }

    setTargetEnvStatuses(prev => ({
      ...prev,
      ...updatedStatuses,
    }));
  }, [category, categoryId]);

  useEffect(() => {
    if (sectionIds.length === 0) {
      return;
    }

    const hashId = window.location.hash.replace('#', '');
    setActiveSectionId(sectionIds.includes(hashId) ? hashId : sectionIds[0]);
  }, [sectionIds]);

  useEffect(() => {
    if (category) {
      checkRunningEnvironments();
    }
  }, [category, checkRunningEnvironments]);

  useEffect(() => {
    if (activeSection) {
      recordSectionVisit(categoryId, activeSection.title);
    }
  }, [activeSection, categoryId]);

  const handleFlagVerify = async (section) => {
    const sectionTitle = section.title;
    const submittedFlag = flagValues[sectionTitle] || '';

    setFlagStatus((currentStatus) => ({
      ...currentStatus,
      [sectionTitle]: {
        verified: false,
        type: 'loading',
        message: '正在验证 flag...',
      },
    }));

    const result = await verifySectionFlag(categoryId, sectionTitle, submittedFlag);

    setFlagStatus((currentStatus) => ({
      ...currentStatus,
      [sectionTitle]: result,
    }));

    if (result.verified) {
      recordSectionCompletion(categoryId, sectionTitle);
    }
  };

  const handleFlagChange = (sectionTitle, value) => {
    setFlagValues((currentValues) => ({
      ...currentValues,
      [sectionTitle]: value
    }));
  };

  const handleSectionSelect = useCallback((sectionId) => {
    setActiveSectionId(sectionId);

    if (window.history?.replaceState) {
      window.history.replaceState(null, '', `${window.location.pathname}#${sectionId}`);
    }

    window.requestAnimationFrame(() => {
      document.getElementById('knowledge-study-panel')?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    });
  }, []);

  if (!category) {
    return (
      <main className="app-page">
        <div className="empty-state content-panel">
          <FontAwesomeIcon icon={faExclamationTriangle} />
          <h1>未找到该知识分类</h1>
          <p>当前地址没有对应的知识内容。</p>
          <Link to="/knowledge" className="button button-secondary">
            <FontAwesomeIcon icon={faArrowLeft} /> 返回知识库
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="app-page knowledge-detail-page">
      <Link to={`/knowledge${learningContext ? `?path=${learningContext.path.id}` : ''}`} className="back-link">
        <FontAwesomeIcon icon={faArrowLeft} />
        返回知识库
      </Link>

      <header className="knowledge-detail-header">
        <div className="knowledge-detail-title">
          <div className="knowledge-icon large">
            <FontAwesomeIcon icon={category.icon} />
          </div>
          <div>
            <p className="page-eyebrow">
              {learningContext
                ? `${learningContext.path.shortTitle} · ${learningContext.stage.title}`
                : '知识专题'}
            </p>
            <h1>{category.title}</h1>
          </div>
        </div>
        <p>{category.description}</p>
        <div className="detail-progress">
          <FontAwesomeIcon icon={faCheck} />
          {completedSectionTitles.size} / {category.sections.length} 个章节已通过
        </div>
      </header>

      <ModuleLearningGuide category={{ ...category, id: categoryId }} context={learningContext} />

      <div className="knowledge-study-layout">
        <aside className="knowledge-sidebar">
          <KnowledgeOutlineNav
            activeSectionId={activeSectionId}
            completedSectionTitles={completedSectionTitles}
            onSectionSelect={handleSectionSelect}
            sectionIds={sectionIds}
            sections={category.sections}
            targetEnvStatuses={targetEnvStatuses}
          />
        </aside>

        <div id="knowledge-study-panel" className="knowledge-study-panel">
          {activeSection && (
            <KnowledgeSectionCard
              key={activeSection.title}
              category={category}
              categoryId={categoryId}
              completed={completedSectionTitles.has(activeSection.title)}
              copyStatus={copyStatus}
              flagStatus={flagStatus[activeSection.title]}
              flagValue={flagValues[activeSection.title] || ''}
              index={activeSectionIndex}
              onCopyUrl={handleCopyUrl}
              onExperiment={handleExperimentClick}
              onFlagChange={handleFlagChange}
              onFlagVerify={handleFlagVerify}
              onStopEnvironment={handleStopEnvironment}
              section={activeSection}
              sectionId={sectionIds[activeSectionIndex]}
              targetAvailable={Boolean(getTargetForSection(categoryId, activeSection.title))}
              targetEnvStatus={targetEnvStatuses[activeSection.title]}
            />
          )}
        </div>
      </div>
    </main>
  );
}

export default KnowledgeDetail;
