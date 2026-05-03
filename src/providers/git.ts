import { LogProvider } from './index';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';

const execAsync = promisify(exec);
const EMPTY_TREE_HASH = '4b825dc642cb6eb9a060e54bf8d69288fbee4904';
const MAX_UNTRACKED_FILE_BYTES = 64 * 1024;

export class GitProvider implements LogProvider {
  name = 'git';

  async isApplicable(): Promise<boolean> {
    try {
      await execAsync('git rev-parse --is-inside-work-tree');
      return true;
    } catch {
      return false;
    }
  }

  async getRecentLogs(): Promise<string | null> {
    try {
      const hasHead = await this.hasHead();
      const diff = await this.getDiff(hasHead);
      const commits = await this.getCommits(hasHead);
      const untrackedFiles = await this.getUntrackedFiles();
      const untrackedSummary = this.formatUntrackedFiles(untrackedFiles);

      if (!diff.trim() && !commits.trim() && !untrackedSummary.trim()) {
        return null;
      }

      return [
        `Recent Commits:\n${commits}`,
        `Current Changes (Diff against HEAD):\n${diff}`,
        `Untracked Files:\n${untrackedSummary || 'None'}`,
      ].join('\n\n');
    } catch (error) {
      console.error('GitProvider Error:', error);
      return null;
    }
  }

  private async hasHead(): Promise<boolean> {
    try {
      await execAsync('git rev-parse HEAD');
      return true;
    } catch {
      return false;
    }
  }

  private async getDiff(hasHead: boolean): Promise<string> {
    const diffTarget = hasHead ? 'HEAD' : EMPTY_TREE_HASH;
    const diffResult = await execAsync(`git diff ${diffTarget}`, { maxBuffer: 10 * 1024 * 1024 });
    return diffResult.stdout;
  }

  private async getCommits(hasHead: boolean): Promise<string> {
    if (!hasHead) {
      return 'No previous commits (Initial Commit).';
    }

    const commitsResult = await execAsync('git log -n 3 --pretty=format:"%h - %s"');
    return commitsResult.stdout;
  }

  private async getUntrackedFiles(): Promise<string[]> {
    const result = await execAsync('git ls-files --others --exclude-standard -z', {
      encoding: 'buffer',
      maxBuffer: 10 * 1024 * 1024,
    });
    return result.stdout
      .toString('utf-8')
      .split('\0')
      .filter((filePath) => filePath.length > 0);
  }

  private formatUntrackedFiles(filePaths: string[]): string {
    if (filePaths.length === 0) {
      return '';
    }

    return filePaths.map((filePath) => this.formatUntrackedFile(filePath)).join('\n\n');
  }

  private formatUntrackedFile(filePath: string): string {
    const absolutePath = path.resolve(process.cwd(), filePath);
    const relativePath = path.relative(process.cwd(), absolutePath);

    if (relativePath.startsWith('..') || path.isAbsolute(relativePath)) {
      return `- ${filePath} (skipped: outside repository)`;
    }

    try {
      const stats = fs.statSync(absolutePath);
      if (!stats.isFile()) {
        return `- ${filePath} (skipped: not a file)`;
      }
      if (stats.size > MAX_UNTRACKED_FILE_BYTES) {
        return `- ${filePath} (skipped: ${stats.size} bytes exceeds ${MAX_UNTRACKED_FILE_BYTES} byte limit)`;
      }

      const content = fs.readFileSync(absolutePath);
      if (isLikelyBinary(content)) {
        return `- ${filePath} (skipped: binary file)`;
      }

      return `--- ${filePath} (untracked) ---\n${content.toString('utf-8')}`;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return `- ${filePath} (skipped: ${message})`;
    }
  }
}

function isLikelyBinary(content: Buffer): boolean {
  const sampleLength = Math.min(content.length, 8000);
  for (let index = 0; index < sampleLength; index += 1) {
    if (content[index] === 0) {
      return true;
    }
  }

  return false;
}
