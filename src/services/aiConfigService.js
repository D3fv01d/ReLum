import defaultAiConfig from '../config/ai';
import { getAiProviderPreset } from '../config/aiProviders';
import {
  buildSafeAiConfig,
  loadSavedAiConfig,
  persistAiConfig,
} from './aiConfigStorage';

const mergeAiConfig = (baseConfig, overrideConfig = null) => {
  if (!overrideConfig) {
    return baseConfig;
  }

  const providerChanged = overrideConfig.provider && overrideConfig.provider !== baseConfig.provider;
  const providerPreset = getAiProviderPreset(overrideConfig.provider);
  const candidateConfig = {
    ...baseConfig,
    ...overrideConfig,
    parameters: {
      ...baseConfig.parameters,
      ...overrideConfig.parameters,
    },
  };

  if (providerChanged && overrideConfig.apiUrl === undefined) {
    candidateConfig.apiUrl = providerPreset.defaultApiUrl;
  }

  if (providerChanged && overrideConfig.model === undefined) {
    candidateConfig.model = providerPreset.defaultModel;
  }

  return buildSafeAiConfig(candidateConfig, baseConfig);
};

export const getActiveAiConfig = (configOverride = null) => {
  const savedConfig = loadSavedAiConfig(defaultAiConfig);
  const baseConfig = mergeAiConfig(defaultAiConfig, savedConfig);

  return mergeAiConfig(baseConfig, configOverride);
};

export const saveAiConfig = (config) => {
  const activeConfig = getActiveAiConfig();
  return persistAiConfig(mergeAiConfig(activeConfig, config), activeConfig);
};

export const buildCandidateAiConfig = (config) => (
  mergeAiConfig(getActiveAiConfig(), config)
);
