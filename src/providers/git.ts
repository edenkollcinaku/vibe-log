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
      let diff = '';
      let commits = '';

      try {
        // Check if HEAD exists (fails on first commit)
        await execAsync('git rev-parse HEAD');
        
        // Get the diff of currently staged/unstaged files against HEAD
        const diffResult = await execAsync('git diff HEAD');
        diff = diffResult.stdout;
        
        // Get the last 3 commits to understand recent context
        const commitsResult = await execAsync('git log -n 3 --pretty=format:"%h - %s"');
        commits = commitsResult.stdout;
      } catch (headError) {
        // Fallback for initial commit
        const emptyTreeHash = '4b825dc642cb6eb9a060e54bf8d69288fbee4904';
        const diffResult = await execAsync(`git diff ${emptyTreeHash}`);
        diff = diffResult.stdout;
        commits = 'No previous commits (Initial Commit).';
      }

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
