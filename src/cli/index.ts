#!/usr/bin/env node

import { Command } from 'commander';
import { saveConfig, getConfig } from '../core/config';
import { initLedger, appendToLedger } from '../core/ledger';
import { distillLogs } from '../core/distiller';
import fs from 'fs';
import path from 'path';

const program = new Command();

program
  .name('vibe-log')
  .description('The Universal Reasoning Ledger for Agentic Development')
  .version('1.0.0');

program
  .command('configure')
  .description('Set up the global configuration for vibe-log')
  .requiredOption('-k, --key <key>', 'Gemini API Key')
  .action((options) => {
    saveConfig({ geminiApiKey: options.key });
    console.log('✅ Configuration saved successfully to ~/.vibe-log/config');
  });

program
  .command('init')
  .description('Set up the VIBE.md ledger and Git hooks in the current project')
  .action(() => {
    console.log('Initializing vibe-log in the current project...');
    initLedger();

    const gitDir = path.join(process.cwd(), '.git');
    if (fs.existsSync(gitDir)) {
      const hooksDir = path.join(gitDir, 'hooks');
      const hookPath = path.join(hooksDir, 'pre-commit');
      
      // We append a call silently or with output. 
      // This runs the handoff silently and appends to the commit (or just prints for now).
      const hookContent = `#!/bin/sh
echo "🌊 capturing session vibe..."
npx vibe-log handoff --silent || true
`;
      if (!fs.existsSync(hooksDir)) fs.mkdirSync(hooksDir, { recursive: true });
      fs.writeFileSync(hookPath, hookContent, { mode: 0o755 });
      console.log('✅ Installed git pre-commit hook.');
    } else {
      console.log('ℹ️ No .git directory found. Skipping git hook installation.');
    }
  });

program
  .command('handoff')
  .description('Generates a condensed Context Capsule from recent logs and updates the Ledger')
  .option('--silent', 'Run silently without printing output to stdout')
  .action(async (options) => {
    try {
      if (!options.silent) console.log('🔍 Analyzing recent session logs...');
      const capsule = await distillLogs();
      if (capsule) {
        if (!options.silent) {
          console.log('\n================ Context Capsule ================');
          console.log(JSON.stringify(capsule, null, 2));
          console.log('=================================================\n');
        }
        appendToLedger(capsule);
      } else {
        if (!options.silent) console.log('ℹ️ No significant recent intent captured.');
      }
    } catch (error: any) {
      console.error('❌ Error during handoff:', error.message);
      process.exit(1);
    }
  });

program.parse(process.argv);
