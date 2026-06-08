import { requestJson } from './apiClient';

describe('apiClient', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('attaches request metadata to failed responses', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValue({
      ok: false,
      status: 429,
      headers: new Headers({
        'X-Request-Id': 'req-123',
        'X-RateLimit-Limit': '120',
        'X-RateLimit-Remaining': '0',
        'X-RateLimit-Reset': '1780899427',
      }),
      text: async () => JSON.stringify({ message: '请求过于频繁' }),
    });

    await expect(requestJson('/target/images')).rejects.toMatchObject({
      message: '请求过于频繁',
      status: 429,
      requestId: 'req-123',
      rateLimit: {
        limit: '120',
        remaining: '0',
        reset: '1780899427',
      },
    });
  });
});
