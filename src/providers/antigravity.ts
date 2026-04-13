import { LogProvider } from './index';
import fs from 'fs';
import path from 'path';

export class AntigravityProvider implements LogProvider {
  name = 'antigravity';
  
  private antigravityDir = path.join(process.cwd(), '.antigravity');

  async isApplicable(): Promise<boolean> {
    return fs.existsSync(this.antigravityDir);
  }

  async getRecentLogs(): Promise<string | null> {
    if (!(await this.isApplicable())) {
      return null;
    }

    let logs = '';
    const readIfExists = (filename: string) => {
      const filepath = path.join(this.antigravityDir, filename);
      if (fs.existsSync(filepath)) {
        logs += `\n--- ${filename} ---\n`;
        logs += fs.readFileSync(filepath, 'utf-8');
      }
    };

    // Scrape common artifacts
    readIfExists('task.md');
    readIfExists('implementation_plan.md');
    readIfExists('logs/recent.log'); // example generic log file

    if (!logs.trim()) {
      return null;
    }
    return logs;
  }
}
