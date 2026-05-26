---
name: git-workflow
description: Commit, PR, and branching conventions
---

# Git Workflow

## Commits

- **Conventional Commits** — Format: `type(TICKET): description`
  - `type` = `feat` | `fix` | `refactor` | `docs` | `chore` | `test`
  - `TICKET` = Jira ticket inferred from branch name (e.g. branch `EB-323484` → scope `EB-323484`)
  - Example: `feat(EB-323484): add venue scope prompt`
  - Omit scope only when branch name has no recognizable ticket pattern (e.g. `main`, `hotfix-login`, `ivan/experiment`)
- **Small commits** — Each commit represents a logical, deployable unit of work.
- **Incremental deployment** — Commits small enough to deploy independently; feedback informs next steps.

## Branching

- **Feature branches** — One feature per branch; branch from main.
- **Git worktree** — Used to review integration points and switch contexts without stashing.

## Pull Requests

- **Small PRs** — Easier to review, faster feedback, lower merge conflict risk.
- **Feature flags** — Changes protected behind flags to prevent user impact until fully validated.

## Git Hooks (Husky)

- **Pre-commit** — Fast feedback (linting, format checks, quick tests).
- **Pre-push** — Comprehensive checks (full test suite) to prevent breaking main.

## Workflow Pattern

1. Clarify requirements and acceptance criteria.
2. Write tests as guardrails.
3. Implement in small incremental steps.
4. Deploy and monitor with feature flags and metrics.
5. Iterate based on feedback.

