const STORAGE_KEY = 'relum_learning_progress_v1';
const CHANGE_EVENT = 'relum:learning-progress-change';
const MAX_RECENT_SECTIONS = 8;

const createEmptyProgress = () => ({
  completedSections: {},
  recentSections: [],
});

const isNonEmptyString = (value) => (
  typeof value === 'string' && value.trim().length > 0
);

const sanitizeProgress = (value) => {
  if (!value || typeof value !== 'object') {
    return createEmptyProgress();
  }

  const completedSections = Object.entries(value.completedSections || {})
    .reduce((result, [sectionKey, completion]) => {
      if (!isNonEmptyString(sectionKey) || !completion || typeof completion !== 'object') {
        return result;
      }

      const completedAt = Number(completion.completedAt);
      if (!Number.isFinite(completedAt)) {
        return result;
      }

      result[sectionKey] = { completedAt };
      return result;
    }, {});

  const recentSections = Array.isArray(value.recentSections)
    ? value.recentSections
      .filter((item) => (
        item &&
        isNonEmptyString(item.categoryId) &&
        isNonEmptyString(item.sectionTitle) &&
        Number.isFinite(Number(item.visitedAt))
      ))
      .slice(0, MAX_RECENT_SECTIONS)
      .map((item) => ({
        categoryId: item.categoryId,
        sectionTitle: item.sectionTitle,
        visitedAt: Number(item.visitedAt),
      }))
    : [];

  return { completedSections, recentSections };
};

const getSectionKey = (categoryId, sectionTitle) => (
  `${encodeURIComponent(categoryId)}::${encodeURIComponent(sectionTitle)}`
);

const readLearningProgress = () => {
  try {
    const storedValue = window.localStorage.getItem(STORAGE_KEY);
    return storedValue
      ? sanitizeProgress(JSON.parse(storedValue))
      : createEmptyProgress();
  } catch (error) {
    console.error('读取学习进度失败:', error);
    return createEmptyProgress();
  }
};

const persistLearningProgress = (progress) => {
  const safeProgress = sanitizeProgress(progress);
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(safeProgress));
  window.dispatchEvent(new CustomEvent(CHANGE_EVENT, { detail: safeProgress }));
  return safeProgress;
};

const recordSectionVisit = (categoryId, sectionTitle, visitedAt = Date.now()) => {
  if (!isNonEmptyString(categoryId) || !isNonEmptyString(sectionTitle)) {
    return readLearningProgress();
  }

  const progress = readLearningProgress();
  const recentSections = progress.recentSections.filter((item) => !(
    item.categoryId === categoryId && item.sectionTitle === sectionTitle
  ));

  return persistLearningProgress({
    ...progress,
    recentSections: [
      { categoryId, sectionTitle, visitedAt },
      ...recentSections,
    ].slice(0, MAX_RECENT_SECTIONS),
  });
};

const recordSectionCompletion = (categoryId, sectionTitle, completedAt = Date.now()) => {
  const progress = recordSectionVisit(categoryId, sectionTitle, completedAt);
  const sectionKey = getSectionKey(categoryId, sectionTitle);

  return persistLearningProgress({
    ...progress,
    completedSections: {
      ...progress.completedSections,
      [sectionKey]: progress.completedSections[sectionKey] || { completedAt },
    },
  });
};

const isSectionCompleted = (progress, categoryId, sectionTitle) => (
  Boolean(progress?.completedSections?.[getSectionKey(categoryId, sectionTitle)])
);

const subscribeToLearningProgress = (listener) => {
  const handleChange = (event) => {
    listener(event.detail || readLearningProgress());
  };
  const handleStorage = (event) => {
    if (event.key === STORAGE_KEY) {
      listener(readLearningProgress());
    }
  };

  window.addEventListener(CHANGE_EVENT, handleChange);
  window.addEventListener('storage', handleStorage);

  return () => {
    window.removeEventListener(CHANGE_EVENT, handleChange);
    window.removeEventListener('storage', handleStorage);
  };
};

export {
  createEmptyProgress,
  getSectionKey,
  isSectionCompleted,
  readLearningProgress,
  recordSectionCompletion,
  recordSectionVisit,
  sanitizeProgress,
  subscribeToLearningProgress,
};
