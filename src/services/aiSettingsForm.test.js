import {
  buildConfigFromForm,
  buildFormDataFromConfig,
} from './aiSettingsForm';

describe('aiSettingsForm', () => {
  test('converts settings form data into an AI config payload', () => {
    expect(buildConfigFromForm({
      apiKey: ' sk-test ',
      apiUrl: ' https://api.example.com/chat ',
      model: ' deepseek-chat ',
      systemPrompt: 'system',
      temperature: '0.8',
      max_tokens: '1200',
      top_p: '0.9',
    })).toEqual({
      apiKey: 'sk-test',
      apiUrl: 'https://api.example.com/chat',
      model: 'deepseek-chat',
      systemPrompt: 'system',
      parameters: {
        temperature: 0.8,
        max_tokens: 1200,
        top_p: 0.9,
      },
    });
  });

  test('converts saved AI config into form-friendly strings', () => {
    expect(buildFormDataFromConfig({
      apiKey: 'sk-test',
      apiUrl: 'https://api.example.com/chat',
      model: 'deepseek-chat',
      systemPrompt: 'system',
      parameters: {
        temperature: 0.6,
        max_tokens: 1500,
        top_p: 0.85,
      },
    })).toEqual({
      apiKey: 'sk-test',
      apiUrl: 'https://api.example.com/chat',
      model: 'deepseek-chat',
      systemPrompt: 'system',
      temperature: '0.6',
      max_tokens: '1500',
      top_p: '0.85',
    });
  });
});
