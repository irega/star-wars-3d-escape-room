# Star Wars-Themed 3D Escape Room

Browser-based 3D escape room with a Star Wars aesthetic. A fan project inspired by the Star Wars universe — not affiliated with or endorsed by Lucasfilm Ltd.

## Live demo

**Production:** [https://star-wars-3d-escape-room.vercel.app](https://star-wars-3d-escape-room.vercel.app)

Desktop browser recommended (see [challenge spec](docs/challenge-spec.md) — mobile is out of scope).

## Run locally

**Requirements:** Node.js **24+**, npm.

```bash
git clone https://github.com/irega/star-wars-3d-escape-room.git
cd star-wars-3d-escape-room
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

| Command | Purpose |
|---------|---------|
| `npm run build` | Typecheck + production build |
| `npm run preview` | Serve production build locally |
| `npm run test` | Vitest (watch) |
| `npm run test:ci` | Vitest once (CI-style) |
| `npm run lint` / `npm run format:check` | ESLint / Prettier |
| `npm run test:e2e` | Playwright smoke tests (starts dev server) |

First time running E2E (or after upgrading `@playwright/test`):

```bash
npx playwright install chromium
npm run test:e2e
```

## Design decisions (summary)

Architecture and stack are frozen in [`docs/tech-design.md`](docs/tech-design.md). Product and UX tradeoffs (no backend, Zustand, hints, puzzles, i18n, performance, security headers) are recorded in [`docs/product-decisions.md`](docs/product-decisions.md). Hard requirements and evaluation criteria live in [`docs/challenge-spec.md`](docs/challenge-spec.md).

## How I used AI

**Tools:** Claude Code (local + GitHub App on approved issues/PRs), Cursor, and bundled skills (`irega`, `tdd`, `security-audit`).

- **Delegated:** planning/docs drafts, CI and boilerplate, vertical slices via agent PRs when the spec was clear, repetitive tests and wiring.
- **Kept:** puzzle design, scope/architecture ([`tech-design.md`](docs/tech-design.md)), every PR review, and 3D/UX polish by playtesting.
- **Helped:** guardrails and docs fast; TDD and spec references reduced drift.
- **Fell short:** creative 3D feel, full puzzle E2E on WebGL, and scope control without tight issues + human review.

## Audit trail (for reviewers)

You can reconstruct the workflow and steps I followed without relying on this README alone:

| Source | What to look for |
|--------|------------------|
| [`docs/WORKLOG.md`](docs/WORKLOG.md) | Planning phase: representative prompts, decisions, and how the repo/agents were set up **before** the first feature PR. |
| **GitHub Issues** | Scoped tasks, acceptance criteria, labels (`approved`, `bug`, etc.), and what triggered agent work. |
| **Pull requests** | Vertical slices, review threads, CI/E2E runs, and course corrections (`@claude` feedback). |
| **Commit history** | Conventional commits on `main` and feature branches; timeline of delivery. |
| [`AGENTS.md`](AGENTS.md) | Dev/QA agent rules, branch naming, and human-in-the-loop gates. |

**Evolution:** plan v1 → plan v2 → frozen [`tech-design.md`](docs/tech-design.md) → implementation via **Issues/PRs** (and agents where labeled `approved`).

Take-home pace was **focused sessions over several days**, not one continuous sprint — gaps in timestamps are expected.

> **Disclaimer:** Some of this setup — Claude on GitHub (App + Actions), issue-driven dev agents, post-deploy E2E on Vercel previews — could have been much simpler for a minimal submission. The challenge stated there is **no strict deadline**, so I used the slack to learn that workflow; the game itself did not require that level of automation.

## Documentation (`/docs`)

| Document | What it is |
|----------|------------|
| [`docs/challenge-spec.md`](docs/challenge-spec.md) | Company challenge requirements: 4 puzzles, hints, README expectations, evaluation criteria. **Guardrails** — consult before changing scope. |
| [`docs/tech-design.md`](docs/tech-design.md) | **Source of truth** for architecture, stack, scenes, state, testing strategy, deployment, and out-of-scope items. |
| [`docs/product-decisions.md`](docs/product-decisions.md) | Record of product/UX/engineering tradeoffs (Zustand, no persistence, hints, audio, i18n, CI/CD, security headers, etc.) with rejected alternatives. |
| [`docs/security-audit.md`](docs/security-audit.md) | Phase 6 OWASP-style audit summary; Medium finding (missing headers) and fix in `vercel.json`. |
| [`docs/WORKLOG.md`](docs/WORKLOG.md) | **Planning phase only** (pre-code): prompts and decisions that led to plan v2 and tech design. Not the implementation log. |
| [`docs/plans/plan-v1.md`](docs/plans/plan-v1.md) | First architecture exploration (historical). |
| [`docs/plans/plan-v2.md`](docs/plans/plan-v2.md) | Consolidated implementation plan (phases, CI, agents, puzzle order). **Historical context** — delivery order followed Issues/PRs, not phases literally. |
| [`docs/plans/staff-review.md`](docs/plans/staff-review.md) | Staff-style review of plan v2 before coding (verdict, risks, growth areas). |

Repo root companions:

| File | What it is |
|------|------------|
| [`CLAUDE.md`](CLAUDE.md) | Instructions for Claude Code agents: skills, commands, philosophy. |
| [`AGENTS.md`](AGENTS.md) | How dev/QA agents are triggered on GitHub (`approved`, `@claude` on PRs, branch naming). |

## Agent skills (bundled)

Copied from [github.com/irega/skills](https://github.com/irega/skills) into `.claude/skills/` for portability:

| Skill | Purpose |
|-------|---------|
| `irega` | Coding philosophy, commits, style — always on |
| `tdd` | Red-green-refactor for implementation |
| `security-audit` | Pre-ship security review |
