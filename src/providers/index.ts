export interface LogProvider {
  /**
   * Returns a short identifier for the provider (e.g. 'antigravity', 'git')
   */
  name: string;

  /**
   * Check if this provider is applicable internally
   * e.g., does the .antigravity folder exist? Does the git repo exist?
   */
  isApplicable(): Promise<boolean>;

  /**
   * Fetch recent logs from this provider.
   * Format should be raw informative text about the recent changes.
   */
  getRecentLogs(): Promise<string | null>;
}
