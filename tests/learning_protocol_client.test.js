const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs/promises');
const path = require('path');
const os = require('os');
process.env.NODE_PATH = path.join(__dirname, '..', 'node_modules');
require('module').Module._initPaths();
const LearningProtocolClient = require('../memory-bank/lib/learning-protocol-client');

async function setupClient() {
  const tmp = await fs.mkdtemp(path.join(os.tmpdir(), 'learning-client-'));
  await fs.cp(path.join(__dirname, '..', 'memory-bank'), path.join(tmp, 'memory-bank'), {
    recursive: true
  });
  const client = new LearningProtocolClient({ learningSystemPath: path.join(tmp, 'memory-bank') });
  return { client, tmp };
}

test('logOutcome appends success and failure counts', async () => {
  const { client, tmp } = await setupClient();
  const logFile = path.join(tmp, 'decisionLog.md');
  await client.logOutcome('test-mode', 'unit', 'success', 0.9, 'demo');
  const content = await fs.readFile(logFile, 'utf8');
  assert.match(content, /Successful Applications:/);
  assert.match(content, /Failed Applications:/);
});

