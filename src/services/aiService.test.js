import aiService from './aiService';

describe('aiService provider adapters', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('sends OpenAI-compatible chat completion requests', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({
        choices: [
          {
            message: {
              role: 'assistant',
              content: 'ok',
            },
          },
        ],
      }),
    });

    const result = await aiService.sendMessage([
      { role: 'user', content: 'hello' },
    ], {
      provider: 'openai-compatible',
      apiKey: 'sk-test',
      apiUrl: 'https://api.example.com/v1/chat/completions',
      model: 'custom-model',
    });

    expect(result).toEqual({ role: 'assistant', content: 'ok' });
    expect(global.fetch).toHaveBeenCalledWith(
      'https://api.example.com/v1/chat/completions',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          Authorization: 'Bearer sk-test',
        }),
      })
    );
  });

  test('sends Ollama native local chat requests without requiring an API key', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({
        message: {
          content: 'local ok',
        },
      }),
    });

    const result = await aiService.sendMessage([
      { role: 'user', content: 'hello' },
    ], {
      provider: 'ollama',
      apiUrl: 'http://localhost:11434/api/chat',
      model: 'llama3.1',
    });

    expect(result).toEqual({ role: 'assistant', content: 'local ok' });
    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:11434/api/chat',
      expect.objectContaining({
        method: 'POST',
        body: expect.stringContaining('"stream":false'),
      })
    );
  });
});
