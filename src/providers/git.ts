import { LogProvider } from './index';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

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
      // Get the diff of currently staged/unstaged files
      const { stdout: diff } = await execAsync('git diff HEAD');
      
      // Get the last 3 commits to understand recent context
      const { stdout: commits } = await execAsync('git log -n 3 --pretty=format:"%h - %s"');

      // If nothing has changed recently, we might not have much
      if (!diff.trim() && !commits.trim()) {
        return null;
      }

      return `Recent Commits:\n${commits}\n\nCurrent Changes (Diff against HEAD):\n${diff}`;
    } catch (e) {
      console.error('GitProvider Error:', e);
      return null;
    }
  }
}
