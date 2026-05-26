---
name: testing
description: Testing philosophy and practices
---

# Testing

## Philosophy

- **TDD first** — Write tests before code whenever possible; tests serve as guardrails before touching implementation.
- **Tests guide design** — Red-green-refactor loop drives architecture and prevents over-engineering.

## Testing Strategy

### Unit Tests
- Used for domain logic and business rules.
- Verify behavior in isolation without side effects.

### Integration Tests
- Used for components with **React Testing Library (RTL)** and **Mock Service Worker (MSW)**.
- Test user interactions and component behavior with real-like conditions.
- Low-level unit tests added sparingly when testing specific edge cases or internal component logic.

## Test Discipline

- Tests before implementation prevents rework.
- Tests catch regressions early, especially with git hooks.
- No tests = no confidence to refactor or deploy incrementally.

