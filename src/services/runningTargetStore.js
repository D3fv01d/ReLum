const RUNNING_TARGETS_STORAGE_KEY = 'relum_running_targets';

const persistRunningTargets = (runningTargets) => {
  localStorage.setItem(RUNNING_TARGETS_STORAGE_KEY, JSON.stringify(runningTargets));
};

const getRunningTargets = () => {
  try {
    const storedTargets = localStorage.getItem(RUNNING_TARGETS_STORAGE_KEY);
    return storedTargets ? JSON.parse(storedTargets) : {};
  } catch (error) {
    console.error('获取已运行靶场环境失败:', error);
    return {};
  }
};

const saveRunningTarget = (knowledgeId, sectionTitle, targetInfo) => {
  try {
    const runningTargets = getRunningTargets();
    const targetsByKnowledge = runningTargets[knowledgeId] || {};

    runningTargets[knowledgeId] = {
      ...targetsByKnowledge,
      [sectionTitle]: {
        ...targetInfo,
        timestamp: Date.now(),
      },
    };

    persistRunningTargets(runningTargets);
  } catch (error) {
    console.error('保存靶场环境状态失败:', error);
  }
};

const removeRunningTarget = (knowledgeId, sectionTitle) => {
  try {
    const runningTargets = getRunningTargets();
    const targetsByKnowledge = runningTargets[knowledgeId];

    if (!targetsByKnowledge?.[sectionTitle]) {
      return;
    }

    delete targetsByKnowledge[sectionTitle];

    if (Object.keys(targetsByKnowledge).length === 0) {
      delete runningTargets[knowledgeId];
    }

    persistRunningTargets(runningTargets);
  } catch (error) {
    console.error('删除靶场环境状态失败:', error);
  }
};

const isTargetRunning = (knowledgeId, sectionTitle) => (
  Boolean(getRunningTargets()[knowledgeId]?.[sectionTitle])
);

const getRunningTargetInfo = (knowledgeId, sectionTitle) => (
  getRunningTargets()[knowledgeId]?.[sectionTitle] || null
);

export {
  getRunningTargets,
  saveRunningTarget,
  removeRunningTarget,
  isTargetRunning,
  getRunningTargetInfo,
};
