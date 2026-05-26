---
name: red-flags
description: Patterns and practices to avoid
---

# Red Flags

## Code & Architecture

- **Premature abstraction** — Creating abstractions or patterns before they're proven necessary; wait until you see the problem repeated.
- **Over-engineered solutions** — Complex code that solves a simple problem; prefer straightforward approaches.

## Git & PRs

- **Large commits** — Hard to review, hard to bisect, hard to revert if needed.
- **Large PRs** — Slow review process, increased merge conflict risk, harder to pinpoint issues.
- **Unclear commit messages** — Commits should follow conventional format and describe intent, not just what changed.

## Testing

- **No tests** — Code without tests is fragile; can't refactor or deploy with confidence.
- **Tests after code** — Tests should guide design; TDD is the default approach.

## Deployment

- **Large deployments without feature flags** — Risk impacting all users if something breaks.
- **Deployments without monitoring** — Can't validate correctness or catch issues in production.

