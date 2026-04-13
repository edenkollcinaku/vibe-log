# CLAUDE.md — Vibe-Log Guidelines

## Build & Development Commands
- Build: `npm run build`
- Install: `npm install`
- Init Vibe-Log: `npx @edenkollcinaku/vibe-log init`
- Manual Handoff: `npx @edenkollcinaku/vibe-log handoff`
- Configure Key: `npx @edenkollcinaku/vibe-log configure -k <key>`

## Vibe-Log Protocol (CRITICAL)
- **Persistence:** After completing a feature, refactor, or bug fix, you MUST run `npx @edenkollcinaku/vibe-log handoff` to distill your reasoning into `VIBE.md`.
- **Context:** Before starting a complex task, read the latest entries in `VIBE.md` to understand the architectural intent and previous trade-offs.
- **Model Choice:** Use `gemini-3-flash-preview` for routine logs. For deep architectural shifts, you may suggest running handoff with `-m gemini-3.1-pro-preview`.

## Coding Style
- TypeScript: Strict typing, no `any`.
- Patterns: Adapter pattern for providers; functional programming where possible.
- Error Handling: Use try/catch blocks for all external CLI/Git calls.