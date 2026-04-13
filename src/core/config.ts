import os from 'os';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';

// Load .env from process.cwd() for local overrides
dotenv.config();

const CONFIG_DIR = path.join(os.homedir(), '.vibe-log');
const CONFIG_FILE = path.join(CONFIG_DIR, 'config.json');

export interface VibeConfig {
  geminiApiKey: string | null;
}

export function getConfig(): VibeConfig {
  let geminiApiKey: string | null = process.env.GEMINI_API_KEY || null;

  if (fs.existsSync(CONFIG_FILE)) {
    try {
      const data = fs.readFileSync(CONFIG_FILE, 'utf-8');
      const parsed = JSON.parse(data);
      if (!geminiApiKey && parsed.geminiApiKey) {
        geminiApiKey = parsed.geminiApiKey;
      }
    } catch (e) {
      // Failed to parse config, ignore
    }
  }

  return {
    geminiApiKey,
  };
}

export function saveConfig(config: Partial<VibeConfig>): void {
  if (!fs.existsSync(CONFIG_DIR)) {
    fs.mkdirSync(CONFIG_DIR, { recursive: true });
  }

  let currentConfig: Partial<VibeConfig> = {};
  if (fs.existsSync(CONFIG_FILE)) {
    try {
      currentConfig = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf-8'));
    } catch {
      // Ignored
    }
  }

  const updated = { ...currentConfig, ...config };
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(updated, null, 2), 'utf-8');
}
