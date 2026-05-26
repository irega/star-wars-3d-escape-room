# Agent instructions (GitHub Actions)

Automation for this repo is defined in `docs/plans/plan-v2.md`. Agents run via [claude-code-action](https://github.com/anthropics/claude-code-action) and **Claude Pro** (`CLAUDE_CODE_OAUTH_TOKEN` secret).

## Dev agent — start work

| Kind | Issue labels | How to start |
|------|----------------|--------------|
| **Plan task / feature** | `enhancement` (default from task template) + **`approved`** | Create issue from **Plan task** template, then add `approved` |
| **Bug fix** | `bug` + **`approved`** | Create issue from **Bug report** template; human validates, then `approved` |
| **Manual** | any open issue | Actions → **Dev agent on approved** → Run workflow → issue number |

Opt out of automatic pickup: label `no-agent`.

**Do not** add `approved` until the issue description is complete (scope, acceptance criteria, plan branch if applicable).

## Dev agent — iterate on a PR

Comment or review on the PR with **`@claude`** (see `.github/workflows/dev-agent-pr-feedback.yml`).

## Branch naming

- Bugs: `fix/issue-<n>-…`
- Plan tasks: prefer `feat/<phase>` from plan-v2 (e.g. `feat/stores`) when the issue specifies it; else `feat/issue-<n>-…`

## Rules for all agent work

1. Read `docs/plans/plan-v2.md` and `docs/challenge-spec.md` before coding.
2. TDD: `.claude/skills/tdd/` — red-green-refactor, vertical slices.
3. Conventional commits: `type(scope): description` (see `CLAUDE.md` / irega skill).
4. **Never merge** — human PR review + green CI required.
5. Keep PRs small; max ~2 agent branches in parallel (Pro limits).

## QA agent (later)

Exploratory QA opens **`bug`** issues only — no fixes. Human adds `approved` before the dev agent runs.
