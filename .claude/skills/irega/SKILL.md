---
name: irega
description: irega's coding philosophy, conventions, and preferred approaches. Always active — apply these rules for any commit, code, or PR in this session.
---

# irega — Development Philosophy

## Commits (always apply)

Format: `type(TICKET): description`
- `type` = `feat` | `fix` | `refactor` | `docs` | `chore` | `test`
- `TICKET` = Jira ticket from branch name (e.g. branch `EB-323484` → scope `EB-323484`)
- Example: `feat(EB-323484): add venue scope prompt`
- Omit scope only when branch has no recognizable ticket (e.g. `main`, `hotfix-login`)
- Small commits — each represents one logical unit of work

## Code (always apply)

- **Simple first** — straightforward over clever or abstract
- **No premature abstraction** — only when duplication is proven, not hypothetical
- **Readability over performance** — optimize only when measurable problem exists
- **Small functions & files** — one responsibility each
- **TDD** — write tests before code; red-green-refactor

## PRs (always apply)

- Small PRs — easier review, lower merge conflict risk
- Feature flags — protect changes until fully validated

## Reference

Consult these when the task requires deeper detail:

- [git-workflow.md](git-workflow.md) — branching, hooks, workflow pattern
- [testing.md](testing.md) — unit vs integration strategy, RTL/MSW
- [patterns.md](patterns.md) — architecture, AI-assisted dev, domain isolation
- [code-style.md](code-style.md) — naming, organization details
- [stack.md](stack.md) — languages, runtimes, tools
- [red-flags.md](red-flags.md) — patterns and practices to avoid
