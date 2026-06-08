import React, { useCallback, useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowLeft,
  faInfoCircle,
  faExclamationTriangle,
} from '@fortawesome/free-solid-svg-icons';
import TerminalFeature from '../components/TerminalFeature';
import KnowledgeSectionCard from '../components/KnowledgeSectionCard';
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
  const [activeSection, setActiveSection] = useState(null);
  const [targetEnvStatuses, setTargetEnvStatuses] = useState({});
  const [copyStatus, setCopyStatus] = useState('');
  // 添加flag状态
  const [flagValues, setFlagValues] = useState({});
  const [flagStatus, setFlagStatus] = useState({});

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
        // 复制当前状态
        const updatedStatuses = { ...targetEnvStatuses };
        // 更新指定章节的状态
        updatedStatuses[section.title] = {
          error: result.message,
          loading: false,
          url: null,
          status: '关闭环境失败'
        };
        setTargetEnvStatuses(updatedStatuses);
      } else {
        // 删除已关闭环境的状态
        const updatedStatuses = { ...targetEnvStatuses };
        delete updatedStatuses[section.title];
        setTargetEnvStatuses(updatedStatuses);

        // 如果当前活动章节是被关闭的环境，则重置当前状态
        if (activeSection?.title === section.title) {
          setActiveSection(null);
        }
      }
    } catch (error) {
      console.error('关闭环境失败:', error);
      // 更新相应环境的错误状态
      const updatedStatuses = { ...targetEnvStatuses };
      updatedStatuses[section.title] = {
        error: error.message,
        loading: false,
        url: null,
        status: '关闭环境失败'
      };
      setTargetEnvStatuses(updatedStatuses);
    }
  };

  // 处理实验按钮点击
  const handleExperimentClick = async (section) => {
    setActiveSection(section);

    // 更新特定章节的状态为加载中
    const updatedStatuses = { ...targetEnvStatuses };
    updatedStatuses[section.title] = { loading: true, error: null, url: null, status: '正在准备启动靶场环境...' };
    setTargetEnvStatuses(updatedStatuses);

    try {
      // 添加调试信息
      console.log('实验按钮点击 - 知识点ID:', categoryId);
      console.log('实验按钮点击 - 章节标题:', section.title);

      // 启动对应的靶场环境
      const result = await startTargetEnvironment(categoryId, section.title);

      console.log('靶场环境启动结果:', result);

      if (result.error) {
        // 更新特定章节的错误状态
        const updatedStatuses = { ...targetEnvStatuses };
        updatedStatuses[section.title] = { loading: false, error: result.message, url: null };
        setTargetEnvStatuses(updatedStatuses);
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

        // 更新特定章节的成功状态
        const updatedStatuses = { ...targetEnvStatuses };
        updatedStatuses[section.title] = envStatus;
        setTargetEnvStatuses(updatedStatuses);

        // 可以选择自动在新窗口打开环境
        if (result.url && result.status !== '使用已运行的靶场环境') {
          window.open(result.url, '_blank');
        }
      }
    } catch (error) {
      console.error('启动环境失败:', error);

      // 更新特定章节的错误状态
      const updatedStatuses = { ...targetEnvStatuses };
      updatedStatuses[section.title] = { loading: false, error: error.message, url: null };
      setTargetEnvStatuses(updatedStatuses);
    }
  };

  // 检查每个章节是否有运行中的靶场环境
  const checkRunningEnvironments = useCallback(() => {
    if (!category || !category.sections) return;

    const updatedStatuses = {};
    let nextActiveSection = null;

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

        // 设置第一个找到的环境为活动环境
        if (!nextActiveSection) {
          nextActiveSection = section;
        }
      }
    }

    if (nextActiveSection) {
      setActiveSection(nextActiveSection);
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
      if (knowledgeData[categoryId]) {
        setCategory(knowledgeData[categoryId]);
      }
      setLoading(false);
    }, 300);
  }, [categoryId]);

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
      <div className="bg-[#222222] rounded-lg p-6">
        <Link to="/knowledge" className="text-primary hover:text-primary/90 mb-6 inline-flex items-center">
          <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
          返回知识库
        </Link>

        <div className="mb-8">
          <div className="flex items-center mb-4">
            <div className="bg-primary/20 p-3 rounded-lg mr-4">
              <FontAwesomeIcon icon={category.icon} className="text-primary text-2xl" />
            </div>
            <h1 className="text-3xl font-bold">{category.title}</h1>
          </div>

          <p className="text-gray-300 mb-6">{category.description}</p>

          <div className="bg-[#2A2A2A] rounded-lg p-4 mb-8">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <FontAwesomeIcon icon={faInfoCircle} className="text-primary mr-2" />
              防护措施
            </h2>
            <ul className="space-y-2 ml-6 list-disc text-gray-300">
              {category.protection.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="space-y-8">
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
              targetEnvStatus={targetEnvStatuses[section.title]}
            />
          ))}
        </div>
      </div>
    </main>
  );
}

export default KnowledgeDetail;
