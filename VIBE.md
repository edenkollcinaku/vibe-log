# VIBE.md (Universal Reasoning Ledger)

This is the project's Long-term Memory. It records architectural intent, reasoning, and context captured from AI-assisted coding sessions.

### Reasoning Timeline

## Session | 2026-05-03 (1.0.3 release-prep handoff)
**Confidence Score:** High

### Context
Transitioning to a scoped NPM package, hardening the CLI with strict type safety, and enhancing the Git provider to capture untracked file context.

### Architectural Intent
- **Topic:** Package Scoping and Distribution
  - **Decision:** Migrated to @edenkollcinaku/vibe-log and bumped Node engine requirement to >=20.0.0.
  - **Rationale:** Ensures namespace uniqueness on NPM and allows the use of modern Node.js features like the native test runner.
  - **Trade-offs:** Breaking change for users on Node <20, Requires updating all internal references to the package name
- **Topic:** Git Hook Management
  - **Decision:** Implemented an idempotent 'managed block' pattern for the pre-commit hook using start/end markers.
  - **Rationale:** Allows the tool to update its own hook logic (e.g., adding 'git add VIBE.md') without overwriting or corrupting existing user-defined hooks.
  - **Trade-offs:** Slightly more complex string parsing logic in the hooks module
- **Topic:** Context Extraction (Git Provider)
  - **Decision:** Expanded GitProvider to include the content of untracked text files (under 64KB) while skipping binary files.
  - **Rationale:** Architectural intent is often found in newly created files that have not yet been staged; capturing these provides a more complete session 'vibe'.
  - **Trade-offs:** Increased payload size sent to the LLM, Potential for sensitive data leakage if untracked files are not ignored by .gitignore
- **Topic:** Runtime Type Safety
  - **Decision:** Introduced custom type guards (isRecord, isContextCapsule) and strict interface definitions.
  - **Rationale:** Ensures that LLM-generated responses are validated against the expected schema before being committed to the VIBE.md ledger, preventing data corruption.
  - **Trade-offs:** Manual maintenance of type guards alongside interface changes

### Style Preferences
- Strict TypeScript (no 'any')
- Native Node.js test runner (node --test)
- Idempotent file system operations
- Quiet external dependency initialization (e.g., dotenv quiet mode)

### Open Issues (Tech Debt)
- [ ] Monitor LLM token usage with the new untracked file capture logic
- [ ] Evaluate if additional file types (e.g., large JSON) should be excluded from GitProvider

---

## Session | 2026-05-03 20:18 +02:00 (1.0.4 release-prep handoff)
**Confidence Score:** High

### Context
Refining project documentation, agentic guidelines, and safety protocols for Vibe-Log v1.0.4.

### Architectural Intent
- **Topic:** Documentation & Onboarding
  - **Decision:** Complete README overhaul and standardization of agent-specific rule files (AGENTS.md, CLAUDE.md).
  - **Rationale:** To reduce 'Vibe Amnesia' for users and provide clear, consistent instructions for AI agents across different IDEs and environments.
  - **Trade-offs:** Increased documentation maintenance overhead, Potential redundancy between README and agent-specific files
- **Topic:** Security & Privacy
  - **Decision:** Implemented 'Commit Hygiene' rules in .antigravity_rules and .cursorrules.
  - **Rationale:** VIBE.md may ingest context from untracked files; explicit review steps prevent accidental leakage of sensitive data during the handoff process.
  - **Trade-offs:** Relies on manual user review, Adds a friction step to the commit workflow
- **Topic:** Environment Requirements
  - **Decision:** Formalized Node.js >=20.0.0 requirement in documentation.
  - **Rationale:** Ensures compatibility with modern ESM and fetch APIs used in the core logic.
  - **Trade-offs:** Excludes users on older LTS versions of Node.js

### Style Preferences
- Strict TypeScript typing (no any)
- Adapter pattern for providers
- Functional programming where possible
- Try/catch for external CLI/Git calls

### Open Issues (Tech Debt)
- [ ] Monitor CLI handoff reliability after recent fixes in commit 641bda9
- [ ] Verify cross-platform compatibility for the Node.js 20+ requirement

---
