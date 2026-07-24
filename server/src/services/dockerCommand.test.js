const test = require('node:test');
const assert = require('node:assert/strict');
const {
  buildImageArgs,
  buildRunArgs,
  splitDockerParams,
} = require('./dockerCommand');

test('builds a local image command with an explicit Dockerfile', () => {
  assert.deepEqual(
    buildImageArgs(
      'relum/local-lab:latest',
      '/workspace/relum',
      '/workspace/relum/labs/relum-lab/Dockerfile'
    ),
    [
      'build',
      '--file',
      '/workspace/relum/labs/relum-lab/Dockerfile',
      '--tag',
      'relum/local-lab:latest',
      '/workspace/relum',
    ]
  );
});

test('passes environment and isolation options as separate Docker arguments', () => {
  const args = buildRunArgs(
    'linux/arm64',
    'relum/local-lab:latest',
    'relum-lab-sql-1',
    12000,
    8080,
    {
      env: ['RELUM_FLAG=flag{test}', 'RELUM_SECTION_TITLE=字符型SQL注入'],
      dockerParams: '--read-only --cap-drop=ALL',
    }
  );

  assert.deepEqual(args.slice(0, 10), [
    'run',
    '-d',
    '--platform',
    'linux/arm64',
    '--name',
    'relum-lab-sql-1',
    '-p',
    '12000:8080',
    '-e',
    'RELUM_FLAG=flag{test}',
  ]);
  assert.equal(args.includes('RELUM_SECTION_TITLE=字符型SQL注入'), true);
  assert.deepEqual(splitDockerParams('--read-only --cap-drop=ALL'), ['--read-only', '--cap-drop=ALL']);
});
