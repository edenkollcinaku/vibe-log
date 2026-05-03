const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const test = require('node:test');

const rootDir = path.resolve(__dirname, '..');
const cliPath = path.join(rootDir, 'dist', 'cli', 'index.js');

test('CLI version matches package.json and has no dotenv noise', () => {
  const packageJson = JSON.parse(fs.readFileSync(path.join(rootDir, 'package.json'), 'utf-8'));
  const result = spawnSync(process.execPath, [cliPath, '--version'], {
    cwd: rootDir,
    encoding: 'utf-8',
  });

  assert.equal(result.status, 0);
  assert.equal(result.stderr, '');
  assert.equal(result.stdout.trim(), packageJson.version);
});

test('CLI help has no dotenv noise', () => {
  const result = spawnSync(process.execPath, [cliPath, '--help'], {
    cwd: rootDir,
    encoding: 'utf-8',
  });

  assert.equal(result.status, 0);
  assert.equal(result.stderr, '');
  assert.match(result.stdout, /Usage: vibe-log/);
  assert.doesNotMatch(result.stdout, /dotenv/i);
});

test('init installs a scoped handoff hook that stages VIBE.md', () => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'vibe-log-cli-'));
  const gitDir = path.join(tempDir, '.git');
  fs.mkdirSync(path.join(gitDir, 'hooks'), { recursive: true });

  const result = spawnSync(process.execPath, [cliPath, 'init'], {
    cwd: tempDir,
    encoding: 'utf-8',
  });

  assert.equal(result.status, 0);
  const hookContent = fs.readFileSync(path.join(gitDir, 'hooks', 'pre-commit'), 'utf-8');
  assert.match(hookContent, /npx @edenkollcinaku\/vibe-log handoff --silent/);
  assert.match(hookContent, /git add VIBE\.md/);
});
