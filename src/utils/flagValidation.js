import { requestJson } from '../services/apiClient';

export const verifySectionFlag = async (
  categoryId,
  sectionTitle,
  submittedFlag
) => {
  const normalizedFlag = String(submittedFlag || '').trim();

  if (!normalizedFlag) {
    return {
      verified: false,
      message: 'flag 不能为空',
      type: 'error',
    };
  }

  try {
    return await requestJson('/flag/verify', {
      method: 'POST',
      body: {
        knowledgeId: categoryId,
        sectionTitle,
        flag: normalizedFlag,
      },
    });
  } catch (error) {
    return {
      verified: false,
      message: error.status === 422 ? 'flag 不正确，请检查后重试' : error.message,
      type: 'error',
    };
  }
};
