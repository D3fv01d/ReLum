const test = require('node:test');
const assert = require('node:assert/strict');
const {
  buildChallengeTarget,
  deriveChallengeFlag,
  listChallengeDefinitions,
  verifyChallengeFlag,
} = require('./challengeFlagService');

const TEST_SECRET = 'test-secret-that-is-long-enough-for-relum';

test('every configured challenge receives a unique installation flag', () => {
  const challenges = listChallengeDefinitions();
  const flags = challenges.map(({ knowledgeId, sectionTitle }) => (
    deriveChallengeFlag(TEST_SECRET, knowledgeId, sectionTitle)
  ));

  assert.equal(challenges.length, 137);
  assert.equal(new Set(flags).size, challenges.length);
  flags.forEach((flag) => assert.match(flag, /^flag\{relum_[a-z0-9_]+_[a-f0-9]{20}\}$/));
});

test('injects the same flag that the server accepts', () => {
  const target = buildChallengeTarget('sql-injection', '字符型SQL注入', TEST_SECRET);
  const injectedFlag = target.env
    .find((entry) => entry.startsWith('RELUM_FLAG='))
    .slice('RELUM_FLAG='.length);

  assert.equal(
    verifyChallengeFlag('sql-injection', '字符型SQL注入', injectedFlag, TEST_SECRET),
    true
  );
  assert.equal(
    verifyChallengeFlag('sql-injection', '字符型SQL注入', 'flag{wrong}', TEST_SECRET),
    false
  );
  assert.equal(target.dockerImage, 'relum/local-lab:latest');
  assert.equal(target.env.includes('RELUM_KNOWLEDGE_ID=sql-injection'), true);
  assert.equal(target.env.includes('RELUM_SECTION_TITLE=字符型SQL注入'), true);
});

test('rejects unknown challenges', () => {
  assert.equal(buildChallengeTarget('missing', 'missing', TEST_SECRET), null);
  assert.equal(verifyChallengeFlag('missing', 'missing', 'flag{anything}', TEST_SECRET), false);
});
