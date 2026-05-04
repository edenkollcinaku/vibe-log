# Vibe-Log

[![npm version](https://img.shields.io/npm/v/@edenkollcinaku/vibe-log.svg)](https://www.npmjs.com/package/@edenkollcinaku/vibe-log)

**The Universal Reasoning Ledger for Agentic Development.**

Vibe-Log is a CLI tool that captures architectural intent and reasoning from AI-assisted coding sessions, then writes a condensed context capsule to your project's `VIBE.md`.

## The Problem: Vibe Amnesia

When pair-programming with AI tools like Cursor, Claude Code, Codex, or Antigravity, decisions are made quickly. Trade-offs are accepted, local patterns emerge, and implementation details move fast.

Start a new AI session later, and that reasoning is often gone. The next agent may know what changed, but not why it changed.

## The Solution: A Reasoning Ledger

Vibe-Log acts as a small adapter around your workflow:

- Reads recent context from providers such as Git diffs and Antigravity files.
- Includes safe untracked text files under 64 KB while skipping binary files.
- Uses Gemini to distill noisy logs and diffs into architectural intent.
- Appends the result to `VIBE.md` so future agents can recover the project's reasoning.

## Requirements

- Node.js `>=20.0.0`
- A Gemini API key
- Git, when using the Git provider or hook installation

## Installation

Use with `npx`:

```bash
npx @edenkollcinaku/vibe-log --help
```

Or install globally:

```bash
npm install -g @edenkollcinaku/vibe-log
```

## Configuration

Store your Gemini API key in the global Vibe-Log config outside the project repo:

```bash
npx @edenkollcinaku/vibe-log configure --key "YOUR_GOOGLE_AI_API_KEY"
```

The default model is `gemini-3-flash-preview`. You can set a different default model globally:

```bash
npx @edenkollcinaku/vibe-log configure --model gemini-3-flash-preview
```

You can also override the model for a single handoff:

```bash
npx @edenkollcinaku/vibe-log handoff --model gemini-3.1-pro-preview
```

### Silent Mode

Use the `--silent` flag to run a handoff without printing the context capsule to stdout. This is useful for automated scripts or hooks:

```bash
npx @edenkollcinaku/vibe-log handoff --silent
```

## Initialize a Project

Initialize Vibe-Log in a repository:

```bash
npx @edenkollcinaku/vibe-log init
```

This creates `VIBE.md` if needed and installs a Git pre-commit hook. The hook uses a managed block so Vibe-Log can update its own hook logic without removing existing user hook content.

When the hook captures a handoff successfully, it runs:

```bash
git add VIBE.md
```

That stages the new ledger entry so it can be included in the same commit.

## Manual Handoff

Run a handoff manually at any time to capture the current state of your project:

```bash
npx @edenkollcinaku/vibe-log handoff
```

The command prints the generated context capsule and appends it to `VIBE.md`.

## AI Agent Integration

Vibe-Log is designed to work seamlessly with various AI coding assistants by providing them with long-term memory through `VIBE.md`. To ensure your agent follows the Vibe-Log protocol, the following rule files are provided:

- **`.antigravity_rules`**: For Antigravity users.
- **`.cursorrules`**: For Cursor users.
- **`AGENTS.md` / `CLAUDE.md`**: General purpose and Claude-specific guidelines.

These files instruct the agent to read `VIBE.md` at the start of a session and perform a `handoff` after completing significant tasks.

## Architecture

Vibe-Log follows an adapter-oriented structure:

- **CLI:** Handles `configure`, `init`, and `handoff` commands.
- **Config:** Loads local `.env` values quietly and global config from `~/.vibe-log/config.json`.
- **Distiller:** Calls Gemini and validates the returned context capsule before writing it.
- **Ledger:** Creates and appends to `VIBE.md`.
- **Providers:** Gather raw context. The Git provider captures recent commits, tracked diffs, and safe untracked text files. The Antigravity provider reads known `.antigravity/` artifacts.
- **Hooks:** Installs an idempotent pre-commit managed block and preserves existing hook content.

## Safety Notes

- Do not commit API keys. Prefer `vibe-log configure`, which stores keys outside the repo.
- Review `VIBE.md` before committing if your untracked files may contain sensitive context.
- Large untracked files and binary files are summarized or skipped instead of sent to Gemini.

## Development

```bash
npm install
npm run build
npm test
```

## License

Distributed under the MIT License. See `LICENSE` for more information.
