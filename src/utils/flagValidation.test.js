import { verifySectionFlag } from './flagValidation';

const environments = {
  web: {
    sections: {
      'SQL 注入': {
        flag: 'flag{ok}',
      },
      '开放题': {},
    },
  },
};

describe('flagValidation', () => {
  test('validates correct and incorrect section flags', () => {
    expect(verifySectionFlag('web', 'SQL 注入', 'flag{ok}', environments)).toMatchObject({
      verified: true,
      type: 'success',
    });

    expect(verifySectionFlag('web', 'SQL 注入', 'wrong', environments)).toMatchObject({
      verified: false,
      type: 'error',
    });
  });

  test('returns warning for sections without a configured flag', () => {
    expect(verifySectionFlag('web', '开放题', '', environments)).toMatchObject({
      verified: false,
      type: 'warning',
    });
  });
});
