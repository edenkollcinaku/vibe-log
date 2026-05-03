#!/usr/bin/env node

import { Command } from 'commander';
import fs from 'fs';
import path from 'path';
import { saveConfig, VibeConfig } from '../core/config';
import { distillLogs } from '../core/distiller';
import { installPreCommitHook } from '../core/hooks';
import { appendToLedger, initLedger } from '../core/ledger';
import { isRecord } from '../core/types';

interface ConfigureOptions {
  key?: string;
  model?: string;
}

interface HandoffOptions {
  silent?: boolean;
  model?: string;
}

const program = new Command();

program
  .name('vibe-log')
  .description('The Universal Reasoning Ledger for Agentic Development')
  .version(getPackageVersion());

program
  .command('configure')
  .description('Set up the global configuration for vibe-log')
  .option('-k, --key <key>', 'Gemini API Key')
  .option('-m, --model <model>', 'Default Gemini model to use')
  .action((options: ConfigureOptions) => {
    const configUpdate: Partial<VibeConfig> = {};
    if (options.key) configUpdate.geminiApiKey = options.key;
    if (options.model) configUpdate.model = options.model;

    saveConfig(configUpdate);
    console.log('Configuration saved successfully to ~/.vibe-log/config');
  });

program
  .command('init')
  .description('Set up the VIBE.md ledger and Git hooks in the current project')
  .action(() => {
    console.log('Initializing vibe-log in the current project...');
    initLedger();

    const result = installPreCommitHook();
    if (result.installed) {
      console.log('Installed git pre-commit hook.');
    } else {
      console.log('No .git directory found. Skipping git hook installation.');
    }
  });

program
  .command('handoff')
  .description('Generates a condensed Context Capsule from recent logs and updates the Ledger')
  .option('--silent', 'Run silently without printing output to stdout')
  .option('-m, --model <model>', 'Override the default model for this session')
  .action(async (options: HandoffOptions) => {
    try {
      if (!options.silent) {
        console.log(`Analyzing recent session logs${options.model ? ` using ${options.model}` : ''}...`);
      }
      const capsule = await distillLogs(options.model);
      if (capsule) {
        if (!options.silent) {
          console.log('\n================ Context Capsule ================');
          console.log(JSON.stringify(capsule, null, 2));
          console.log('=================================================\n');
        }
        appendToLedger(capsule);
      } else if (!options.silent) {
        console.log('No significant recent intent captured.');
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      console.error('Error during handoff:', message);
      process.exit(1);
    }
  });

program.parse(process.argv);

function getPackageVersion(): string {
  const packageJsonPath = path.resolve(__dirname, '../../package.json');
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8')) as unknown;

  if (!isRecord(packageJson) || typeof packageJson.version !== 'string') {
    throw new Error('Unable to read package version from package.json');
  }

  return packageJson.version;
}
