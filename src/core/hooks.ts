import fs from 'fs';
import path from 'path';

const START_MARKER = '# vibe-log managed block start';
const END_MARKER = '# vibe-log managed block end';

const MANAGED_BLOCK = `${START_MARKER}
echo "capturing session vibe..."
if npx @edenkollcinaku/vibe-log handoff --silent; then
  git add VIBE.md
else
  echo "vibe-log handoff failed; continuing without updating staged VIBE.md." >&2
fi
${END_MARKER}`;

export interface HookInstallResult {
  installed: boolean;
  hookPath: string | null;
}

export function installPreCommitHook(cwd = process.cwd()): HookInstallResult {
  const gitDir = path.join(cwd, '.git');
  if (!fs.existsSync(gitDir)) {
    return { installed: false, hookPath: null };
  }

  const hooksDir = path.join(gitDir, 'hooks');
  const hookPath = path.join(hooksDir, 'pre-commit');
  if (!fs.existsSync(hooksDir)) fs.mkdirSync(hooksDir, { recursive: true });

  const currentContent = fs.existsSync(hookPath)
    ? fs.readFileSync(hookPath, 'utf-8')
    : '#!/bin/sh\n';
  const nextContent = buildPreCommitHook(currentContent);

  fs.writeFileSync(hookPath, nextContent, { encoding: 'utf-8', mode: 0o755 });
  return { installed: true, hookPath };
}

export function buildPreCommitHook(existingContent: string): string {
  const baseContent = ensureShebang(removeExistingVibeLogBlocks(existingContent));
  const trimmedBase = baseContent.trimEnd();

  return `${trimmedBase}\n\n${MANAGED_BLOCK}\n`;
}

function ensureShebang(content: string): string {
  const trimmedStart = content.trimStart();
  if (trimmedStart.startsWith('#!')) {
    return content;
  }

  return `#!/bin/sh\n${content}`;
}

function removeExistingVibeLogBlocks(content: string): string {
  const withoutManagedBlock = content.replace(
    new RegExp(`\\n?${escapeRegExp(START_MARKER)}[\\s\\S]*?${escapeRegExp(END_MARKER)}\\n?`, 'g'),
    '\n'
  );
  const lines = withoutManagedBlock.split(/\r?\n/);
  const filtered: string[] = [];

  for (const line of lines) {
    if (line.includes('npx vibe-log handoff --silent')) continue;
    if (line.includes('capturing session vibe')) continue;
    filtered.push(line);
  }

  return filtered.join('\n').trimEnd();
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
