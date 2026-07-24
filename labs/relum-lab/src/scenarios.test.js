const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { challengeCatalog, listCatalogChallenges } = require('../../../src/shared/challengeCatalog');
const { createLabServer } = require('./server');
const { createScenario, toPublicScenario } = require('./scenarios');

const TEST_FLAG = 'flag{relum_runtime_test}';

const withRuntime = async (knowledgeId, sectionTitle, callback) => {
  const challengeDir = fs.mkdtempSync(path.join(os.tmpdir(), 'relum-lab-test-'));
  const runtime = createLabServer({
    knowledgeId,
    sectionTitle,
    flag: TEST_FLAG,
    port: 0,
    challengeDir,
  });

  const address = await runtime.start();
  try {
    await callback(runtime, `http://127.0.0.1:${address.port}`);
  } finally {
    await runtime.stop();
    fs.rmSync(challengeDir, { recursive: true, force: true });
  }
};

test('catalog defines a runnable scenario for every knowledge section', () => {
  const challenges = listCatalogChallenges();
  const engines = new Set();

  assert.equal(Object.keys(challengeCatalog).length, 28);
  assert.equal(challenges.length, 137);

  for (const challenge of challenges) {
    const scenario = createScenario(challenge.knowledgeId, challenge.sectionTitle);
    const publicScenario = toPublicScenario(scenario);

    assert.ok(scenario);
    assert.ok(scenario.mission.includes(challenge.sectionTitle));
    assert.ok(scenario.hint.length > 10);
    assert.ok(scenario.artifact.length > 10);
    assert.equal('answer' in publicScenario, false);
    assert.equal(JSON.stringify(publicScenario).includes(TEST_FLAG), false);
    engines.add(scenario.engine);
  }

  assert.ok(engines.size >= 15);
});

test('SQL string injection executes against SQLite and returns the injected flag', async () => {
  await withRuntime('sql-injection', '字符型SQL注入', async (_runtime, baseUrl) => {
    const response = await fetch(`${baseUrl}/api/action`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ input: "' OR 1=1 --" }),
    });
    const result = await response.json();

    assert.equal(result.solved, true);
    assert.equal(result.flag, TEST_FLAG);
    assert.match(result.output, /vault/);
  });
});

test('file traversal reads the isolated challenge file', async () => {
  await withRuntime('file-download', '路径遍历', async (_runtime, baseUrl) => {
    const response = await fetch(`${baseUrl}/api/action`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ input: '../flag.txt' }),
    });
    const result = await response.json();

    assert.equal(result.solved, true);
    assert.equal(result.flag, TEST_FLAG);
  });
});

test('XSS challenge only completes after the browser proof reaches the collector', async () => {
  await withRuntime('xss', '反射型跨站脚本', async (runtime, baseUrl) => {
    const before = await fetch(`${baseUrl}/api/status`).then((response) => response.json());
    assert.equal(before.solved, false);

    const response = await fetch(
      `${baseUrl}/api/xss/collect?proof=${encodeURIComponent(`admin_token=${runtime.scenario.proof}`)}`
    );
    const result = await response.json();

    assert.equal(result.solved, true);
    assert.equal(result.flag, TEST_FLAG);
  });
});

test('artifact challenge reveals the flag only for the derived answer', async () => {
  await withRuntime('cryptography', '编码与表示', async (runtime, baseUrl) => {
    const wrong = await fetch(`${baseUrl}/api/action`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ input: 'wrong' }),
    }).then((response) => response.json());
    assert.equal(wrong.solved, false);
    assert.equal(wrong.flag, undefined);

    const correct = await fetch(`${baseUrl}/api/action`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ input: runtime.scenario.answer }),
    }).then((response) => response.json());
    assert.equal(correct.solved, true);
    assert.equal(correct.flag, TEST_FLAG);
  });
});
