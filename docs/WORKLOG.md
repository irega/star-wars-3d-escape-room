# WORKLOG

Full work log. Append entries as you go.

---

## Entries

Timestamps: local `YYYY-MM-DD HH:mm`.

- **2026-05-26 18:19** — Migrated TDD and security-audit skills to .claude/skills/ (8 files copied), updated plan-v2.md with TDD as default practice in Implementation Order and security audit in Phase 6 (Ship), and updated CLAUDE.md to reference both skills in Development Philosophy.
  - Prompt used:
    'To the plan: always use TDD skill for implementation tasks, include security-audit step (even final phase). Skills are at github.com/irega/skills — do agents need local copies or can they access GitHub?'

- **2026-05-26 18:13** — Updated docs/plan-v2.md incorporating all staff-review findings: expanded out-of-scope section (localStorage rationale, mobile/touch per challenge spec), added optional player name input, SFX-only audio section, loading/error states with Suspense, victory screen with hyperspace animation, hint escalation timings, drag-and-drop fallbacks, e2e brittleness notes, and Phase 1 deployment validation.
  - Prompt used:
    'Update plan-v2 from staff-review findings: 10-min gameplay is sufficient; skip localStorage sync logic and mobile support (out of scope per challenge).'

- **2026-05-26 18:06** — Ran staff-review on plan-v2: verdict YES. Identified growth areas (player identity, persistence rationale, responsive/mobile design, loading/error states, audio scope) and risks (brittle e2e on canvas coordinates, Puzzle 3 drag-and-drop complexity, Vercel deployment_status event reliability); saved findings to docs/staff-review.md.
  - Prompt used:
    'Run staff-review skill to review plan-v2 and catch any missed product or tech decisions.'

- **2026-05-26 17:56** — Designed QA agent workflow with human-in-the-loop approval gate: QA creates issues labeled `qa-bug`, human reviewer adds `approved` label for valid findings, dev agent picks up only after approval. Configured in Phase 1 plan with execution starting Phase 3; verified Vercel preview deploys per PR.
  - Prompt used:
    'At what step is QA agent integration configured, how does it create/pick up issues, and should issue selection require human approval (e.g., via labels) to prevent wasteful issue creation?'

- **2026-05-26 17:49** — Established trunk-based development strategy with Phase 1 guardrails (CI/CD, Vercel setup, husky hooks) to enable continuous QA validation; plan-v2.md changes pending implementation.
  - Prompt used:
    'Keep trunk-based development for periodic main commits that QA agent can validate; reconsider implementation order — CI/CD and agent config should be set up from the start as guardrails.'

- **2026-05-26 17:46** — Redesigned implementation workflow: switched from git worktree to PR-based approach with centralized GitHub Actions CI/CD (lint, format, tests pre-deploy; Playwright e2e post-deploy against Vercel preview). Adjusted parallelism to 2 concurrent branches per Claude Pro plan and separated deterministic automated tests from exploratory QA agent.
  - Prompt used:
    'Challenged the git worktree approach — since we have a GitHub repo, each agent should push to a branch and open a PR for review instead. Iterated on CI/CD: centralize everything in GitHub Actions (lint, format, tests, build, post-deploy e2e) and leave Vercel as deployment-only. Adjusted parallelism for Claude Pro (max 2 concurrent agents, not 4). Separated automated tests in CI (deterministic, always run) from an exploratory QA agent (on-demand, runs locally or against preview URL, opens GitHub issues for bugs not covered by tests).'

- **2026-05-26 15:51** — Extended QA agent with Chrome DevTools Protocol CPU throttling (4x-6x) to simulate low-spec hardware, monitoring FPS and verifying PerformanceMonitor quality degradation behavior. Added README disclaimer clarifying worklog prompts are representative examples.
  - Prompt used:
    "QA agent (or another process) could verify we don't have performance loss — unsure if we can emulate old or low-resource hardware."

- **2026-05-26 15:48** — Designed continuous QA agent workflow: Playwright MCP controls Chrome to detect bugs from Phase 3, reports to parallel agents who fix + test, then QA verifies — not yet added to plan-v2.
  - Prompt used:
    "I use Playwright's MCP server (Chrome + bridge extension) for early bug detection, then fix bugs and extend unit/integration/E2E tests. In a parallelizable agent plan, one agent could run tests and report bugs while others fix them."

- **2026-05-26 15:45** — Designed 6-phase implementation roadmap with parallelizable git worktree branches: Phase 1 (scaffolding), Phase 2 (3 parallel — stores/i18n/ui-overlays), Phase 3 (interactive), Phase 4 (4 scene branches), Phase 5 (integration), Phase 6 (deploy/README), with human-in-loop merge gates for code review.
  - Prompt used:
    'Implementation Order should be parallelizable via git worktree + agents — small, reviewable changes per branch, human-in-the-loop for final sign-off.'

- **2026-05-26 15:42** — Selected CSS Modules for out-of-canvas UI styling (HUD, dialogue popups, victory and loading screens) due to zero-config Vite integration, scoped styles, and zero additional dependencies; updated plan-v2 tech stack.
  - Prompt used:
    'for simplicity, css modules'

- **2026-05-26 15:39** — Defined DX tooling strategy: Vercel for deployment (free tier, GitHub CI/CD integration, preview deploys on PRs), npm scripts for dev/build/test/lint/format workflows, husky+lint-staged pre-commit hooks (ESLint/Prettier/vitest on staged files only), pre-push full suite validation (test:ci/lint/format:check), ESLint+Prettier configs for TS/React. Not yet merged into plan-v2.
  - Prompt used:
    'Need free hosting (Vercel/Netlify) with GitHub CI/CD; define npm scripts (tests/coverage), husky hooks (precommit/prepush), prettier, and eslint.'

- **2026-05-26 15:34** — Designed testing strategy for 3D scenes: vitest for pure logic (zustand stores, puzzle rules), RTL for HTML overlays (HUD, dialogue), Playwright for happy-path E2E. Rationale: WebGL canvas incompatible with RTL; testing layer depends on 3D/HTML boundary.
  - Prompt used:
    'Testing strategy: separate core/pure logic from UI, unit test with vitest/jest, integration test components with RTL/MSW, add basic component unit tests, and e2e for happy path — does this make sense for 3D escape rooms?'

- **2026-05-26 15:28** — Chose react-i18next for internationalization (EN/ES) with browser locale auto-detection and English fallback. Rationale: Crossmint has offices in both regions; minimal text in game (hints, dialogue, HUD) makes scaffolding trivial.
  - Prompt used:
    "Let's add i18n with English and Spanish support (Crossmint offices); use react-i18n or similar — scaffolding and usage should be straightforward."

- **2026-05-26 15:26** — Defined accessibility scope for 3D WebGL game: in-scope are keyboard navigation (Tab/Enter), color-blind safe puzzles with redundancy (color + shape + icon), WCAG contrast on HUD text, and aria-live region narration. Established out-of-scope items with documented rationale: full screen reader canvas support, complete audio descriptions, full WCAG AA for 3D experience.
  - Prompt used:
    "How do you manage accessibility in this type of product? It should be usable with keyboard and have colorblind-friendly colors, for example — can ARIA and similar approaches work with 3D products?"

- **2026-05-26 15:22** — Designed R3F performance optimization with automatic quality degradation via drei's PerformanceMonitor (High tier: bloom/shadows; Low tier: disabled post-processing/shadows, reduced pixel ratio); migrated useHintStore to zustand and created stores/ directory.
  - Prompt used:
    "What performance do we get with R3F? I'm thinking about older computers. How do you ensure minimum performance?"

- **2026-05-26 15:15** — Designed zustand store boundaries for game state: established two centralized stores (useGameStore for progression state machine and puzzle completion, useInventoryStore for cross-scene items like keycard and override code) with clear rule that data crossing scenes uses zustand while scene-scoped animation/input state remains local.
  - Prompt used:
    "Since there's no backend, we don't need react-query. Design zustand for game progression and items; accept props drilling for internal scene state."

- **2026-05-26 15:10** — Updated plan-v2: README strategy refined to digest worklog entries rather than separate sections; backend scoped to fully client-side (no server, multiplayer, persistence, or leaderboards) to meet time budget and deployment constraints.
  - Prompt used:
    'No backend due to time constraints and deployment simplicity. Out of scope: multiplayer, online gameplay, persisted backend state, etc. — note this.'

- **2026-05-26 15:02** — Validated zustand with selectors as state management choice for React Three Fiber, prioritizing selector-based subscriptions over context+useReducer to minimize re-renders in performance-critical 3D rendering.
  - Prompt used:
    "How's state managed? Does r3f integrate zustand, and are rerenders optimized with slices? Performance seems critical for this type of product."

- **2026-05-26 14:53** — Finalized tech stack in plan-v2.md: React + TypeScript + React Three Fiber + drei + Vite (up from vanilla JS + Three.js). Evaluated alternatives (react-babylonjs, A-Frame+React), confirmed R3F as best fit — largest community, best documentation, first-class TypeScript support. Rewrote architecture section to use React components, hooks, and R3F event patterns instead of vanilla Three.js patterns.
  - Prompt used:
    'My primary stack is React, I've seen React Three Fiber which is apparently the most popular lib for React and they say there's no performance loss — are there other alternatives? I also want TypeScript to avoid type errors and runtime regressions.'

- **2026-05-26 14:40** — Created initial game plan v1 (Escape from Detention Block AA-23: 4 rooms, 4 puzzles, Three.js + Vite stack). Saved as docs/plan-v1.md — snapshot of the starting design before iterating on it through challenges.
  - Prompt used:
    'You have the initial requirements in the project, make a plan and then I'll challenge you until we land on something I like.'

- **2026-05-26 13:33** — Converted /save-worklog skill to agent-based implementation for autonomous session capture, script invocation, and save/edit/cancel workflow.
  - Changes: Updated SKILL.md with `agent: true` marker to enable agent-based execution
  - Impact: Worklog feature now fully automated within Claude Code workflow
  - Prompt: "When the save-worklog script is invoked, how should it work and what's the most efficient approach?" (analyzed script invocation mechanism and proposed agent-based solution)

- **2026-05-26 13:29** — Implemented /save-worklog skill for manual, on-demand worklog entries.
  - Features:
    - Session context capture and summary generation (Claude CLI)
    - User prompt extraction: captures last prompt before /save-worklog
    - Automatic translation of prompts to English
    - User review and edit before appending to docs/WORKLOG.md
  - Key decisions:
    - Manual (on-demand) instead of automated hooks for explicit user control
    - Skill in project `.claude/skills/` for visibility and version control
    - Script extracts last user prompt, not first (session start)
  - Updated CLAUDE.md to clarify that scope is descriptive in commits
  - Prompt: "Better to do it on-demand with /save-worklog" (initially explored automated hook approach, iterated to skill-based on-demand solution for better control and pre-commit review capability)

- **2026-05-26 12:21** — Initialized project scaffolding: CLAUDE.md, challenge spec, README, and project settings.
  - Established development philosophy: follow `irega` skill for commits and code
  - Commit format: `type(scope): description` with no ticket on main branch
  - Project scope: Star Wars-themed 3D escape room browser game (placeholder)
  - Prompt: `/init` (scaffolded CLAUDE.md), then manual iteration to add challenge.md specification and irega skill guardrails for initial development constraints and context
