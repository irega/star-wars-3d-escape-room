---
name: code-style
description: Naming, organization, and design principles
---

# Code Style

## Naming

- **Conventional Commits** — All git commits follow standard format for clarity in history.
- **Descriptive names** — Variables, functions, and components have names that clarify intent.
- **Avoid abbreviations** — Full names unless context is very clear (e.g., `id`, `url`).

## Organization

- **Small functions** — Each function does one thing well.
- **Small files** — Grouped by responsibility; related functions/components can coexist if they share context.
- **Colocation over separation** — Related code lives together; don't split for the sake of separation.

## Design

- **Simple first** — Prefer straightforward solutions over clever or abstract ones.
- **Readability over performance** — Optimize code for understanding unless there's a measurable performance problem.
- **No premature optimization** — Don't abstract or refactor "just in case"; only when it solves an actual problem.

## Testing

- **Tested code is readable code** — Code that's easy to test is often easier to understand.
- **Tests as documentation** — Test cases clarify expected behavior.

