# Star Wars-Themed 3D Escape Room

Browser-based 3D escape room game with a Star Wars aesthetic. A fan project inspired by the Star Wars universe — not affiliated with or endorsed by Lucasfilm Ltd.

## Documentation Structure

This project evolved from planning phase → tech design → implementation. Docs serve different audiences:

| Document | Purpose | For whom |
|----------|---------|----------|
| **`docs/tech-design.md`** | **Source of truth** for architecture, tech stack, design decisions, design tradeoffs, and constraints. Consult before any design decision. | Developers, agents, reviewers |
| **`docs/challenge-spec.md`** | Hard requirements and evaluation criteria (guardrails). What must the game do? | Developers, agents, QA |
| **`docs/plans/plan-v2.md`** | Historical planning document from the planning phase. Shows the original phased approach but is no longer the SoT. | Context only; implementation follows issues/PRs, not phases |
| **`CLAUDE.md`** | Repo-specific instructions for Claude Code agents: skills, conventions, development philosophy. Load `/irega` at session start. | Claude Code agents |
| **`AGENTS.md`** | How dev and QA agents are triggered, what they do, and scope rules. | Dev ops, reviewers |
| **`docs/WORKLOG.md`** | Planning phase exploration and decisions. Archived for context; implementation history is in GitHub Issues/PRs. | Context only |

### Evolution: Plan v1 → v2 → Tech Design

1. **Plan v1** — Initial architecture exploration and scope definition
2. **Plan v2** (`docs/plans/plan-v2.md`) — Consolidated planning with phased implementation breakdown
3. **Tech Design** (`docs/tech-design.md`) — Frozen architecture and design decisions; implementation order lives in GitHub Issues/PRs, not phases

## Agent Skills

This project uses Claude Code skills bundled in `.claude/skills/` so any agent working on the repo has direct access without relying on a developer's local setup.

| Skill | Purpose |
|---|---|
| `irega` | Coding philosophy, commit conventions, and code style rules — always active |
| `tdd` | Red-green-refactor loop for all implementation tasks |
| `security-audit` | OWASP-based security review — run before shipping (Phase 6) |

Skills are sourced from [github.com/irega/skills](https://github.com/irega/skills) and copied (not symlinked) for portability.

## Worklog & audit trail

**Development approach:** Take-home exercise in focused sessions across multiple days — not continuous time; commits and PRs reflect that pace.

**For reviewers:**
- **`docs/WORKLOG.md`** — planning phase only (through `plan-v2.md`). Prompts in entries may be representative, not verbatim.
- **Phase 1 onward** — history in **GitHub Issues and Pull Requests** (titles, descriptions, review comments). See `AGENTS.md` for how dev/QA agents are triggered.

## E2E tests

First time (or after upgrading `@playwright/test`):

```bash
npx playwright install chromium
```

```bash
npm run test:e2e      # smoke tests in e2e/ (starts dev server)
npm run test:e2e:ui   # Playwright UI
```

CI against Vercel previews needs repo secret `VERCEL_AUTOMATION_BYPASS_SECRET` (Vercel → Project → Deployment Protection → Protection Bypass for Automation).
