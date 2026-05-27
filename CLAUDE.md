# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Philosophy

Follow the `irega` skill for all commits, code, and design decisions — full spec at [github.com/irega/skills](https://github.com/irega/skills). Load it with `/irega` at session start or invoke via `Skill("irega")`. Key rules:

- **Commits:** conventional format `type(scope): description` — no ticket on `main` branch, scope is descriptive (e.g., `fix(github)`, `feat(stores)`, `docs(readme)`)
  - **Important:** Only create commits when explicitly requested. Do not commit automatically.
- **Code:** simple first, no premature abstraction, small functions, TDD
- **TDD:** Use `/tdd` skill for all implementation tasks (red-green-refactor, vertical slices). See `.claude/skills/tdd/`
- **Security:** Run `/security-audit` before shipping (Phase 6). See `.claude/skills/security-audit/`

## Skills

All skills are bundled in `.claude/skills/` — no external dependencies required. Source: [github.com/irega/skills](https://github.com/irega/skills).

| Skill | Invoke | When |
|---|---|---|
| `irega` | `/irega` | Always active — apply to all commits and code |
| `tdd` | `/tdd` | Every implementation task |
| `security-audit` | `/security-audit` | Before shipping (Phase 6) |

## Project

Star Wars-themed 3D escape room running in the browser (fan project, not affiliated with Lucasfilm). Planning phase complete — implementation starts from Phase 1 Issues/PRs.

**Challenge spec + guardrails:** `docs/challenge-spec.md` — read before any design decision.
**Implementation plan:** `docs/plans/plan-v2.md` — source of truth for phases, tech stack, and scope.
**Audit trail:** GitHub Issues + Pull Requests (see repo history). `docs/WORKLOG.md` covers planning phase only.

## Architecture

Browser-based 3D escape room. Tech stack (scaffolded):

- **React + TypeScript** — UI and type safety
- **React Three Fiber (R3F) + @react-three/drei** — declarative Three.js for React
- **Zustand** — cross-scene state management (game progression, inventory, hints)
- **react-i18next** — EN/ES i18n with browser locale auto-detection
- **Vite** — build tooling and dev server
- **ESLint + Prettier** — linting and formatting
- **Vitest + React Testing Library** — unit and integration tests
- **Husky + lint-staged** — pre-commit and pre-push git hooks

See `docs/plans/plan-v2.md` for full architecture details, state management patterns, and implementation phases.

## Commands

```bash
npm install           # install deps
npm run dev           # vite dev server (localhost:5173)
npm run build         # tsc + vite build (production)
npm run preview       # preview production build

npm run test          # vitest (watch mode)
npm run test:watch    # vitest --watch
npm run test:ci       # vitest run --reporter=verbose (CI)
npm run test:coverage # vitest run --coverage

npm run lint          # eslint src/
npm run lint:fix      # eslint src/ --fix
npm run format        # prettier --write src/
npm run format:check  # prettier --check src/ (CI)
```
