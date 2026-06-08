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
      provider: 'openai-compatible',
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
      provider: 'ollama',
      apiKey: ' sk-test ',
      apiUrl: 'http://192.168.1.20:11434/api/chat',
      parameters: {
        temperature: 2,
      },
    });

    expect(candidate.provider).toBe('ollama');
    expect(candidate.apiUrl).toBe('http://192.168.1.20:11434/api/chat');
    expect(candidate.apiKey).toBe('sk-test');
    expect(candidate.parameters.temperature).toBe(1);
  });

  test('uses provider defaults when only the provider changes', () => {
    const candidate = buildCandidateAiConfig({
      provider: 'ollama',
    });

    expect(candidate.apiUrl).toBe('http://localhost:11434/api/chat');
    expect(candidate.model).toBe('llama3.1');
  });
});
