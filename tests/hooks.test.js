const assert = require('node:assert/strict');
const test = require('node:test');

const { buildPreCommitHook } = require('../dist/core/hooks');

test('buildPreCommitHook appends managed block without removing user hook content', () => {
  const existing = '#!/bin/sh\nnpm test\n';
  const hook = buildPreCommitHook(existing);

  assert.match(hook, /npm test/);
  assert.match(hook, /# vibe-log managed block start/);
  assert.match(hook, /npx @edenkollcinaku\/vibe-log handoff --silent/);
  assert.match(hook, /git add VIBE\.md/);
});

test('buildPreCommitHook replaces older unscoped vibe-log hook content', () => {
  const existing = '#!/bin/sh\necho "capturing session vibe..."\nnpx vibe-log handoff --silent || true\n';
  const hook = buildPreCommitHook(existing);

  assert.doesNotMatch(hook, /npx vibe-log handoff --silent/);
  assert.match(hook, /npx @edenkollcinaku\/vibe-log handoff --silent/);
});

test('buildPreCommitHook replaces an existing managed block instead of duplicating it', () => {
  const existing = buildPreCommitHook('#!/bin/sh\nnpm test\n');
  const hook = buildPreCommitHook(existing);
  const matches = hook.match(/# vibe-log managed block start/g) || [];

  assert.equal(matches.length, 1);
  assert.match(hook, /npm test/);
});
