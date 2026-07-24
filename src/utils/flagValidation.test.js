import { requestJson } from '../services/apiClient';
import { verifySectionFlag } from './flagValidation';

jest.mock('../services/apiClient', () => ({
  requestJson: jest.fn(),
}));

describe('flagValidation', () => {
  beforeEach(() => {
    requestJson.mockReset();
  });

  test('submits a normalized flag to the server', async () => {
    requestJson.mockResolvedValue({
      verified: true,
      type: 'success',
      message: 'flag 验证成功，章节已完成',
    });

    await expect(verifySectionFlag('web', 'SQL 注入', '  flag{ok}  ')).resolves.toMatchObject({
      verified: true,
      type: 'success',
    });
    expect(requestJson).toHaveBeenCalledWith('/flag/verify', {
      method: 'POST',
      body: {
        knowledgeId: 'web',
        sectionTitle: 'SQL 注入',
        flag: 'flag{ok}',
      },
    });
  });

  test('rejects empty flags without a request', async () => {
    await expect(verifySectionFlag('web', 'SQL 注入', ' ')).resolves.toMatchObject({
      verified: false,
      type: 'error',
    });
    expect(requestJson).not.toHaveBeenCalled();
  });

  test('maps an incorrect server response to a safe message', async () => {
    requestJson.mockRejectedValue(Object.assign(new Error('请求失败'), { status: 422 }));

    await expect(verifySectionFlag('web', 'SQL 注入', 'wrong')).resolves.toMatchObject({
      verified: false,
      message: 'flag 不正确，请检查后重试',
    });
  });
});
