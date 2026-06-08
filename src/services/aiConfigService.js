import defaultAiConfig from '../config/ai';
import {
  buildSafeAiConfig,
  loadSavedAiConfig,
  persistAiConfig,
} from './aiConfigStorage';

const mergeAiConfig = (baseConfig, overrideConfig = null) => {
  if (!overrideConfig) {
    return baseConfig;
  }

  return buildSafeAiConfig({
    ...baseConfig,
    ...overrideConfig,
    parameters: {
      ...baseConfig.parameters,
      ...overrideConfig.parameters,
    },
  }, baseConfig);
};

export const getActiveAiConfig = (configOverride = null) => {
  const savedConfig = loadSavedAiConfig(defaultAiConfig);
  const baseConfig = mergeAiConfig(defaultAiConfig, savedConfig);

  return mergeAiConfig(baseConfig, configOverride);
};

export const saveAiConfig = (config) => (
  persistAiConfig(config, getActiveAiConfig())
);

export const buildCandidateAiConfig = (config) => (
  buildSafeAiConfig(config, getActiveAiConfig())
);
