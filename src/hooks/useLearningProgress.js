import { useEffect, useState } from 'react';
import {
  readLearningProgress,
  subscribeToLearningProgress,
} from '../services/learningProgressStore';

const useLearningProgress = () => {
  const [progress, setProgress] = useState(readLearningProgress);

  useEffect(() => subscribeToLearningProgress(setProgress), []);

  return progress;
};

export default useLearningProgress;
