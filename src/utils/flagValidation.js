import { targetEnvironments } from '../config/targetEnvironments';

export const verifySectionFlag = (
  categoryId,
  sectionTitle,
  submittedFlag,
  environments = targetEnvironments
) => {
  const correctFlag = environments[categoryId]?.sections?.[sectionTitle]?.flag;

  if (!correctFlag) {
    return {
      verified: false,
      message: '该靶场未设置flag，无需提交',
      type: 'warning',
    };
  }

  if (submittedFlag.trim() === '') {
    return {
      verified: false,
      message: 'flag不能为空',
      type: 'error',
    };
  }

  if (submittedFlag === correctFlag) {
    return {
      verified: true,
      message: '恭喜！flag验证成功',
      type: 'success',
    };
  }

  return {
    verified: false,
    message: 'flag验证失败，请检查后重试',
    type: 'error',
  };
};
