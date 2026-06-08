import {
  buildCandidateAiConfig,
  getActiveAiConfig,
  saveAiConfig,
} from './aiConfigService';

describe('aiConfigService', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('saves and reads active AI config without mutating callers', () => {
    const savedConfig = saveAiConfig({
      apiKey: 'sk-test',
      apiUrl: 'https://api.deepseek.com/v1/chat/completions',
      model: 'deepseek-chat',
      systemPrompt: 'system',
      parameters: {
        temperature: 0.4,
        max_tokens: 1200,
        top_p: 0.8,
      },
    });

    expect(getActiveAiConfig()).toMatchObject(savedConfig);
  });

  test('builds a safe candidate against current active config', () => {
    const candidate = buildCandidateAiConfig({
      apiKey: ' sk-test ',
      parameters: {
        temperature: 2,
      },
    });

    expect(candidate.apiKey).toBe('sk-test');
    expect(candidate.parameters.temperature).toBe(1);
  });
});
