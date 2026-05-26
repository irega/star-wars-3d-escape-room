---
name: patterns
description: Architectural and code patterns
---

# Patterns

## Architectural Approach

- **Incremental small steps** — Build iteratively; each step is testable and deployable.
- **Plan before large features** — Clarify approach with AI, validate with stakeholders, then execute in parallel or sequential tasks as needed.
- **Monitoring & metrics** — Deploy behind feature flags with metrics to validate correctness, performance, and user impact.

## Code Organization

- **Small functions** — Functions should be focused and easy to understand at a glance.
- **Small files** — Files grouped by responsibility; multiple related functions or components in one file if they share responsibility or context.
- **Separation of concerns** — Clear boundaries between domain logic, UI, and side effects.
- **Domain logic isolated from UI** — Frontend work keeps business logic separate from React components; logic is testable independently of rendering.

## Design Principles

- **Simple > Complex > Premature Abstraction** — Start simple; add abstractions only when justified by actual duplication or complexity, not hypothetical future needs.
- **Readability over clever** — Code is read more than written; prioritize clarity and maintainability unless there's a real performance issue.

## AI-Assisted Development

- **Ask mode for onboarding** — Use Claude Code/Cursor in "ask" mode when entering unfamiliar codebases to accelerate understanding.
- **Validate approach first** — Don't implement without understanding requirements and validating the planned approach.

