import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowLeft,
  faInfoCircle,
  faExclamationTriangle,
} from '@fortawesome/free-solid-svg-icons';
import TerminalFeature from '../components/TerminalFeature';
import KnowledgeSectionCard from '../components/KnowledgeSectionCard';
import KnowledgeOutlineNav from '../components/knowledge/KnowledgeOutlineNav';
import {
  startTargetEnvironment,
  stopTargetEnvironment,
  getRunningTargetInfo
} from '../services/targetService';
import knowledgeData from '../data/knowledgeDetails';
import { verifySectionFlag } from '../utils/flagValidation';

function KnowledgeDetail() {
  const { categoryId } = useParams(); // 路由参数名是categoryId，而不是id
  const [loading, setLoading] = useState(false);
  const [category, setCategory] = useState(null);
  const [activeSectionId, setActiveSectionId] = useState(null);
  const [targetEnvStatuses, setTargetEnvStatuses] = useState({});
  const [copyStatus, setCopyStatus] = useState('');
  // 添加flag状态
  const [flagValues, setFlagValues] = useState({});
  const [flagStatus, setFlagStatus] = useState({});
  const sectionIds = useMemo(() => {
    if (!category?.sections) {
      return [];
    }

    return category.sections.map((_, index) => `knowledge-${categoryId}-section-${index + 1}`);
  }, [category, categoryId]);

  // 处理复制URL到剪贴板
  const handleCopyUrl = (url) => {
    if (url) {
      navigator.clipboard.writeText(url).then(() => {
        setCopyStatus('✓');
        setTimeout(() => setCopyStatus(''), 2000);
      });
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
    // 更新特定章节的状态为加载中
    setTargetEnvStatuses(prev => ({
      ...prev,
      [section.title]: { loading: true, error: null, url: null, status: '正在准备启动靶场环境...' },
    }));

    try {
      // 添加调试信息
      console.log('实验按钮点击 - 知识点ID:', categoryId);
      console.log('实验按钮点击 - 章节标题:', section.title);

      // 启动对应的靶场环境
      const result = await startTargetEnvironment(categoryId, section.title);

      console.log('靶场环境启动结果:', result);

      if (result.error) {
        setTargetEnvStatuses(prev => ({
          ...prev,
          [section.title]: { loading: false, error: result.message, url: null },
        }));
      } else {
        // 成功启动环境
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

        // 可以选择自动在新窗口打开环境
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

  // 检查每个章节是否有运行中的靶场环境
  const checkRunningEnvironments = useCallback(() => {
    if (!category || !category.sections) return;

    const updatedStatuses = {};

    // 遍历所有章节，查找运行中的环境
    for (const section of category.sections) {
      const runningInfo = getRunningTargetInfo(categoryId, section.title);
      if (runningInfo) {
        // 找到运行中的环境，设置状态
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
    setLoading(true);

    // 模拟API请求
    setTimeout(() => {
      // 检查知识库中是否有对应categoryId的数据
      setCategory(knowledgeData[categoryId] || null);
      setLoading(false);
    }, 300);
  }, [categoryId]);

  useEffect(() => {
    if (sectionIds.length === 0) {
      return;
    }

    const hashId = window.location.hash.replace('#', '');
    setActiveSectionId(sectionIds.includes(hashId) ? hashId : sectionIds[0]);
  }, [sectionIds]);

  useEffect(() => {
    if (
      sectionIds.length === 0 ||
      typeof window === 'undefined' ||
      !('IntersectionObserver' in window)
    ) {
      return undefined;
    }

    const observer = new IntersectionObserver((entries) => {
      const visibleEntry = entries
        .filter(entry => entry.isIntersecting)
        .sort((first, second) => second.intersectionRatio - first.intersectionRatio)[0];

      if (visibleEntry) {
        setActiveSectionId(visibleEntry.target.id);
      }
    }, {
      rootMargin: '-120px 0px -55% 0px',
      threshold: [0.1, 0.25, 0.5],
    });

    sectionIds.forEach((sectionId) => {
      const element = document.getElementById(sectionId);
      if (element) {
        observer.observe(element);
      }
    });

    return () => observer.disconnect();
  }, [sectionIds]);

  // 页面加载后检查运行中的环境
  useEffect(() => {
    if (!loading && category) {
      checkRunningEnvironments();
    }
  }, [loading, category, checkRunningEnvironments]);

  // 处理flag验证
  const handleFlagVerify = (section) => {
    const sectionTitle = section.title;
    const submittedFlag = flagValues[sectionTitle] || '';
    const result = verifySectionFlag(categoryId, sectionTitle, submittedFlag);

    setFlagStatus({
      ...flagStatus,
      [sectionTitle]: result,
    });
  };

  // 处理flag输入变化
  const handleFlagChange = (sectionTitle, value) => {
    setFlagValues({
      ...flagValues,
      [sectionTitle]: value
    });
  };

  const handleSectionSelect = useCallback((sectionId) => {
    const element = document.getElementById(sectionId);

    if (!element) {
      return;
    }

    setActiveSectionId(sectionId);
    element.scrollIntoView({ behavior: 'smooth', block: 'start' });

    if (window.history?.replaceState) {
      window.history.replaceState(null, '', `${window.location.pathname}#${sectionId}`);
    }
  }, []);

  // 如果正在加载
  if (loading) {
    return (
      <main className="max-w-7xl mx-auto px-4 py-8 relative">
        <div className="bg-[#222222] rounded-lg p-6">
          <div className="flex items-center justify-center py-10">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
          </div>
        </div>
      </main>
    );
  }

  // 如果未找到分类
  if (!category) {
    return (
      <main className="max-w-7xl mx-auto px-4 py-8 relative">
        <div className="bg-[#222222] rounded-lg p-6">
          <Link to="/knowledge" className="text-primary hover:text-primary/90 mb-6 inline-flex items-center">
            <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
            返回知识库
          </Link>
          <div className="text-center py-12">
            <FontAwesomeIcon icon={faExclamationTriangle} className="text-yellow-500 text-5xl mb-4" />
            <h1 className="text-2xl font-bold mb-2">未找到该知识分类</h1>
            <p className="text-gray-400">您请求的知识分类不存在或已被移除</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-7xl mx-auto px-4 py-8 relative">
      <TerminalFeature />
      <Link to="/knowledge" className="text-primary hover:text-primary/90 mb-6 inline-flex items-center">
        <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
        返回知识库
      </Link>

      <header className="mb-6">
        <div className="flex items-center mb-4">
          <div className="bg-primary/20 p-3 rounded-lg mr-4">
            <FontAwesomeIcon icon={category.icon} className="text-primary text-2xl" />
          </div>
          <h1 className="text-3xl font-bold">{category.title}</h1>
        </div>

        <p className="text-gray-300">{category.description}</p>
      </header>

      <section className="mb-6 rounded-lg bg-[#222222] p-5">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <FontAwesomeIcon icon={faInfoCircle} className="text-primary mr-2" />
          防护措施
        </h2>
        <ul className="space-y-2 ml-6 list-disc text-gray-300">
          {category.protection.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      </section>

      <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)] lg:items-start">
        <KnowledgeOutlineNav
          activeSectionId={activeSectionId}
          onSectionSelect={handleSectionSelect}
          sectionIds={sectionIds}
          sections={category.sections}
          targetEnvStatuses={targetEnvStatuses}
        />

        <div className="space-y-6">
          {category.sections.map((section, index) => (
            <KnowledgeSectionCard
              key={section.title}
              category={category}
              categoryId={categoryId}
              copyStatus={copyStatus}
              flagStatus={flagStatus[section.title]}
              flagValue={flagValues[section.title] || ''}
              index={index}
              onCopyUrl={handleCopyUrl}
              onExperiment={handleExperimentClick}
              onFlagChange={handleFlagChange}
              onFlagVerify={handleFlagVerify}
              onStopEnvironment={handleStopEnvironment}
              section={section}
              sectionId={sectionIds[index]}
              targetEnvStatus={targetEnvStatuses[section.title]}
            />
          ))}
        </div>
      </div>
    </main>
  );
}

export default KnowledgeDetail;
