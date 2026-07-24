const test = require('node:test');
const assert = require('node:assert/strict');
const { createStopContainer } = require('./dockerService');

test('stopContainer treats an exited container as stopped when docker stop fails', async () => {
  const calls = [];
  const commandRunner = async (args, options = {}) => {
    calls.push({ args, options });

    if (args[0] === 'stop') {
      throw new Error('Command failed: docker stop relum-test');
    }

    if (args[0] === 'inspect') {
      return { stdout: JSON.stringify({ Running: false }) };
    }

    throw new Error(`unexpected command: ${args.join(' ')}`);
  };

  await createStopContainer(commandRunner)('relum-test');

  assert.deepEqual(calls[0].args, ['stop', '--time', '3', 'relum-test']);
  assert.equal(calls[0].options.timeout, 30000);
  assert.deepEqual(calls[1].args, ['inspect', '--format', '{{json .State}}', 'relum-test']);
});

test('stopContainer ignores containers that no longer exist', async () => {
  const calls = [];
  const commandRunner = async (args) => {
    calls.push(args);
    const error = new Error('Command failed: docker stop relum-missing');
    error.stderr = 'Error response from daemon: No such container: relum-missing';
    throw error;
  };

  await createStopContainer(commandRunner)('relum-missing');

  assert.deepEqual(calls, [['stop', '--time', '3', 'relum-missing']]);
});

test('stopContainer rethrows when a container is still running after stop fails', async () => {
  const commandRunner = async (args) => {
    if (args[0] === 'stop') {
      throw new Error('Command failed: docker stop relum-running');
    }

    if (args[0] === 'inspect') {
      return { stdout: JSON.stringify({ Running: true }) };
    }

    throw new Error(`unexpected command: ${args.join(' ')}`);
  };

  await assert.rejects(
    createStopContainer(commandRunner)('relum-running'),
    /docker stop relum-running/
  );
});
