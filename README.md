# Star Wars-Themed 3D Escape Room

Browser-based 3D escape room game with a Star Wars aesthetic. A fan project inspired by the Star Wars universe — not affiliated with or endorsed by Lucasfilm Ltd.

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
