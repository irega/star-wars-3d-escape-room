# Agent instructions (GitHub Actions)

Automation for this repo runs via [claude-code-action](https://github.com/anthropics/claude-code-action) and **Claude Pro** (`CLAUDE_CODE_OAUTH_TOKEN` secret). Tech design and architecture decisions live in `docs/tech-design.md`.

## Repository secrets (agent workflows)

| Secret | Purpose |
|--------|---------|
| `CLAUDE_CODE_OAUTH_TOKEN` | Claude Pro/Max billing for the action (`claude setup-token`) |

**Git identity:** Agent workflows use the **Claude GitHub App** (default `claude-code-action` auth). PRs and commits appear as **`claude[bot]`**, not your personal account.

**CI:** **Dev agent on approved** opens a PR as `claude[bot]` → normal `pull_request` **opened** runs **CI**. **PR feedback** (`@claude`) may not re-trigger CI on later pushes; that workflow dispatches **CI** via `workflow_dispatch` when the job finishes (see `.github/workflows/dev-agent-pr-feedback.yml` and `workflow_dispatch` on `ci.yml`).

## Dev agent — start work

| Kind | Issue labels | How to start |
|------|----------------|--------------|
| **Plan task / feature** | `enhancement` (default from task template) + **`approved`** | Create issue from **Plan task** template, then add `approved` |
| **Bug fix** | `bug` + **`approved`** | Create issue from **Bug report** template; human validates, then `approved` |
| **Manual** | any open issue | Actions → **Dev agent on approved** → Run workflow → issue number |

Opt out of automatic pickup: label `no-agent`.

**Do not** add `approved` until the issue description is complete (scope, acceptance criteria, plan branch if applicable). The issue **Body** defines scope — the branch dropdown is only a branch name hint, not the full phase (see task template).

## Dev agent — iterate on a PR

Comment or review on the PR with **`@claude`** (see `.github/workflows/dev-agent-pr-feedback.yml`).

## Branch naming

- Bugs: `fix/issue-<n>-…`
- Plan tasks: use the branch hint from the issue (e.g. `feat/stores`); else `feat/issue-<n>-…`

## Rules for all agent work

1. Read `docs/tech-design.md` and `docs/challenge-spec.md` before coding.
2. TDD: `.claude/skills/tdd/` — red-green-refactor, vertical slices.
3. Conventional commits: `type(scope): description` (see `CLAUDE.md` / irega skill).
4. **Never merge** — human PR review + green CI required.
5. Keep PRs small; max ~2 agent branches in parallel (Pro limits).

## QA agent (later)

Exploratory QA opens **`bug`** issues only — no fixes. Human adds `approved` before the dev agent runs.
