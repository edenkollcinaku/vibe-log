import fs from 'fs';
import path from 'path';

const LEDGER_FILE = path.join(process.cwd(), 'VIBE.md');

export function initLedger(): void {
  if (!fs.existsSync(LEDGER_FILE)) {
    const template = `# VIBE.md (Universal Reasoning Ledger)

This is the project's Long-term Memory. It records architectural intent, reasoning, and context captured from AI-assisted coding sessions.

### Reasoning Timeline

`;
    fs.writeFileSync(LEDGER_FILE, template, 'utf-8');
    console.log('✅ Initialized VIBE.md in the current directory.');
  } else {
    console.log('ℹ️ VIBE.md already exists.');
  }
}

export function appendToLedger(capsule: any): void {
  if (!fs.existsSync(LEDGER_FILE)) {
    initLedger();
  }

  const timestamp = new Date(capsule.timestamp || Date.now()).toLocaleString();
  const title = `## Session | ${timestamp}`;

  let markdown = `\n${title}\n`;
  markdown += `**Confidence Score:** ${capsule.confidenceScore || 'Unknown'}\n\n`;
  
  if (capsule.projectContext) {
    markdown += `### Context\n${capsule.projectContext}\n\n`;
  }

  if (capsule.architecturalIntent && capsule.architecturalIntent.length > 0) {
    markdown += `### Architectural Intent\n`;
    capsule.architecturalIntent.forEach((intent: any) => {
      markdown += `- **Topic:** ${intent.topic}\n`;
      markdown += `  - **Decision:** ${intent.decision}\n`;
      markdown += `  - **Rationale:** ${intent.rationale}\n`;
      if (intent.tradeoffs && intent.tradeoffs.length > 0) {
        markdown += `  - **Trade-offs:** ${intent.tradeoffs.join(', ')}\n`;
      }
    });
    markdown += '\n';
  }

  if (capsule.stylePreferences && capsule.stylePreferences.length > 0) {
    markdown += `### Style Preferences\n`;
    capsule.stylePreferences.forEach((style: string) => {
      markdown += `- ${style}\n`;
    });
    markdown += '\n';
  }

  if (capsule.openIssues && capsule.openIssues.length > 0) {
    markdown += `### Open Issues (Tech Debt)\n`;
    capsule.openIssues.forEach((issue: string) => {
      markdown += `- [ ] ${issue}\n`;
    });
    markdown += '\n';
  }

  markdown += `---\n`;

  fs.appendFileSync(LEDGER_FILE, markdown, 'utf-8');
  console.log(`✅ Appended reasoning capture to VIBE.md`);
}
