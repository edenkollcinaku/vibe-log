const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const test = require('node:test');

const { GitProvider } = require('../dist/providers/git');

test('GitProvider includes safe untracked text files and skips binary files', async () => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'vibe-log-git-'));
  runGit(tempDir, ['init']);
  fs.writeFileSync(path.join(tempDir, 'notes.md'), '# Intent\nCapture this new file.\n', 'utf-8');
  fs.writeFileSync(path.join(tempDir, 'image.bin'), Buffer.from([0, 1, 2, 3]));

  const originalCwd = process.cwd();
  process.chdir(tempDir);
  try {
    const logs = await new GitProvider().getRecentLogs();

    assert.ok(logs);
    assert.match(logs, /notes\.md \(untracked\)/);
    assert.match(logs, /Capture this new file/);
    assert.match(logs, /image\.bin \(skipped: binary file\)/);
  } finally {
    process.chdir(originalCwd);
  }
});

function runGit(cwd, args) {
  const result = spawnSync('git', args, {
    cwd,
    encoding: 'utf-8',
  });

  assert.equal(result.status, 0, result.stderr);
}
