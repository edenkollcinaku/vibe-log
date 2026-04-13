# 🌊 Vibe-Log

**The Universal Reasoning Ledger for Agentic Development.**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

Vibe-Log is a professional-grade CLI tool that autonomously captures architectural "intent" and "reasoning" from your AI-assisted coding sessions. **Say goodbye to "Vibe Amnesia."**

![Reasoning Loop Diagram](https://raw.githubusercontent.com/vibe-log/repo/main/docs/reasoning-loop.png)

## 🤯 The Problem: Vibe Amnesia
When pair-programming with AI (like Cursor, Claude Code, or Antigravity), we iterate quickly. Decisions are made, trade-offs are accepted, and specific coding styles are adopted in the heat of the "vibe." 

However, start a new AI session a few hours or days later, and the "vibe" is entirely gone. The AI has amnesia. It doesn't remember *why* an architectural choice was made, causing cyclical issues and hallucinated refactors.

## ✨ The Solution: The Universal Adapter
Vibe-Log solves this by acting as a universal adapter. It hooks into your workflow, intercepts the raw session logs and git diffs, filters out syntax noise using Gemini 3.1 Pro (The Distiller), and saves the **Architectural Intent** as a "Context Capsule" directly into your project's `VIBE.md`.

You can then cleanly hand off the repository to a fresh AI agent, fully loaded with the reasoning timeline.

## 🚀 Getting Started

### 1. Installation
You can run `vibe-log` directly using `npx`:

```bash
npx vibe-log
```

### 2. Configuration
Before using the tool, set up your Gemini API Key. Since we prefer the "Open Source" way, keys are saved gracefully and securely in your global home directory (`~/.vibe-log/config`):

```bash
npx vibe-log configure --key "AIzaSyYourGeminiApiKeyHere"
```
*(You can also securely set `GEMINI_API_KEY` in your CI/CD process.)*

### 3. Initialize the Project
Initialize `vibe-log` in your project to create the `VIBE.md` long-term memory ledger and install a git pre-commit hook.

```bash
npx vibe-log init
```

### 4. Handoff & Commit
When you're ready to stop working and hand off the context, just commit as usual. The Git pre-commit hook automatically triggers the Distiller to condense your work into a 2k-token Context Capsule. Or manually invoke it:

```bash
npx vibe-log handoff
```

## 🧩 Architecture

Vibe-Log is architected using the Adapter Pattern, making it completely platform-agnostic:
- **Core Engine:** Analyzes changes, manages configuration, controls CLI flow.
- **The Distiller (Gemini 3.1 Pro):** Condenses logs down to specific architectural intent, assigning a `confidenceScore` so you know when the AI was "hacking" vs. being certain.
- **Providers:** Extract "dirty" logs from anywhere. Includes adapters for Git Diffs, Antigravity (`.antigravity/`), and community hooks for upcoming tools (Cursor, Claude etc.).

## 📜 License
Distributed under the MIT License. See `LICENSE` for more information.
