# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Philosophy

Follow the `irega` skill for all commits, code, and design decisions — full spec at [github.com/irega/skills](https://github.com/irega/skills). Load it with `/irega` at session start or invoke via `Skill("irega")`. Key rules:

- **Commits:** conventional format `type(scope): description` — no ticket on `main` branch, scope is descriptive (e.g., `fix(save-worklog)`, `feat(worklog)`, `docs(readme)`)
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
| `save-worklog` | `/save-worklog` | After each meaningful work block |

## Project

Star Wars-themed 3D escape room running in the browser (fan project, not affiliated with Lucasfilm). No source code exists yet — project is in initialization stage.

**Challenge spec + guardrails:** `docs/challenge.md` — read before any design decision.

## Architecture (planned)

Browser-based 3D game. Likely candidates: Three.js or Babylon.js for 3D rendering, plain HTML/CSS/JS or a bundler (Vite) for tooling. Confirm tech stack before scaffolding.

## Commands

Update this section once tech stack is chosen. Typical pattern for a Vite project:

```bash
npm install       # install deps
npm run dev       # dev server
npm run build     # production build
npm run preview   # preview build
```
