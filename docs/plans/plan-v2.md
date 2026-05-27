# Plan v2: Star Wars 3D Escape Room — Full Implementation

> Living document — evolving from v1 through iterative challenges.

## Context

Crossmint engineering challenge: build a browser-based 3D escape room with 4 puzzles, playable to completion, with in-world hints. Star Wars themed. No code exists yet — greenfield project. Must be deployed with a live link.

**No backend.** Time budget and deployment simplicity dictate a fully client-side app. All game state lives in-memory in the browser for the duration of a session.

**Out of scope (with rationale):**
- Multiplayer, online play, server-persisted state, leaderboards, user accounts — no backend
- localStorage / session persistence — target session is ~10 minutes; restart-on-close is acceptable. localStorage sync-on-startup adds non-trivial complexity (stale state, schema migration, partial saves) that doesn't justify itself for a short game
- Mobile / touch devices — challenge spec scopes to desktop browser. Touch drag-and-drop in 3D (Puzzle 3) is a fundamentally different interaction model; supporting it would require a parallel input system

---

## Tech Stack

- **React + TypeScript** — developer's primary stack, type safety to prevent runtime regressions
- **React Three Fiber (R3F)** — declarative Three.js for React, no performance loss, largest React+3D ecosystem
- **@react-three/drei** — R3F helpers (controls, loaders, abstractions) — avoids reinventing common 3D patterns
- **Zustand** — state management (same team as R3F — pmndrs). Selector-based subscriptions: each component reads only the slice it needs, so puzzle state changes don't re-render the entire 3D scene
- **CSS Modules** — scoped styling for HTML overlays (HUD, dialogue, victory, loading screen). Zero config with Vite
- **react-i18next** — i18n for EN/ES with browser locale auto-detection
- **Vite** — build tooling (fast dev server, trivial to deploy)
- **ESLint + Prettier** — unified linting (TS + React config) and formatting
- **Vitest + RTL + Playwright** — unit/integration/e2e testing
- **Husky + lint-staged** — git hooks for fast feedback
- **Deployment** — Vercel (free tier, auto-deploy on push to main, preview deploys on PRs)

**Alternatives considered:**
- *3D:* react-babylonjs (smaller community, worse docs), A-Frame+React (unmaintained bindings, WebXR-focused). R3F is the clear winner for this scope.
- *State:* `useReducer` + Context is a natural fit for state-machine-like transitions (room progression, puzzle states) but re-renders the full provider subtree on every dispatch — in 3D that means frame drops. Zustand gives the same dispatch/action patterns without the re-render cost: state lives outside the React tree, so the game loop can read/write via `getState()`/`setState()` without triggering renders.

---

## Game Concept: "Escape from Detention Block AA-23"

**Player identity:** Optional name input at game start (default: "Rebel"). Used on the victory screen for personalization. Minimal state cost (one string in useGameStore).

The player wakes up in an Imperial detention cell aboard the Death Star. A distant explosion (the Rebels' attack) has caused a partial power failure — systems are glitching, doors are malfunctioning. The player must solve 4 puzzles to escape before the station is destroyed.

**Setting progression:**
1. **Detention Cell** — small room, cot, wall panel, flickering lights
2. **Control Room** — terminals, holographic displays, door controls
3. **Corridor** — blast doors, power conduits, droid wreckage
4. **Hangar Bay** — final escape, ship visible through force field

---

## 4 Puzzles

### Puzzle 1 — "The Loose Panel" (Observation)
- **Where:** Detention cell
- **What:** A wall panel is slightly displaced — subtle visual cue (offset, different shade). Clicking it reveals a hidden maintenance keycard.
- **Hint escalation:** Flickering light near the panel draws attention. After 30s, the light flickers more aggressively. After 60s, a subtle audio cue (beep) plays.
- **Gates:** Keycard opens the cell door → Control Room.

### Puzzle 2 — "Imperial Override" (Logic)
- **Where:** Control Room
- **What:** A terminal displays an Aurebesh sequence puzzle. The player must decode a 4-symbol pattern from clues scattered on screens around the room (each screen shows one relationship). Input the correct sequence to unlock corridor access.
- **Hint escalation:** One screen highlights the first symbol. After delay, terminal displays "HINT: read screens left to right." After ~90s, terminal reveals 3 of 4 symbols — guarantees the puzzle is completable even if the player doesn't understand Aurebesh.
- **Gates:** Correct sequence opens blast door → Corridor.

### Puzzle 3 — "Power the Conduit" (Interaction)
- **Where:** Corridor
- **What:** The path is blocked by a deactivated blast door. Three power cells (draggable objects) are scattered in the corridor near a destroyed droid. The player must drag them into three conduit slots in the correct orientation (rotate + place). Conduits glow when a cell is correctly placed.
- **Complexity note:** 3D drag-and-drop with orientation is the hardest interaction in the game. Fallback if implementation proves too complex within budget: click-to-select + click-to-place instead of continuous drag.
- **Hint escalation:** A damaged droid nearby has a holographic schematic showing cell orientations. After delay, cells glow faintly near their correct slot.
- **Gates:** All three cells placed → blast door opens → Hangar Bay.

### Puzzle 4 — "Launch Clearance" (Combination)
- **Where:** Hangar Bay
- **What:** A shuttle is behind a force field. The launch console requires three inputs gathered from previous rooms:
  - The keycard (from Puzzle 1) — insert into console
  - The override code (from Puzzle 2) — enter on a keypad
  - A frequency number (from Puzzle 3) — visible on the droid's schematic, easy to miss
- **Hint:** Console shows 3 slots, two are obvious callbacks. Third slot says "FREQ: ???" — if stuck, a repeating announcement in the hangar mentions the frequency.
- **Gates:** All three inputs → force field drops → player clicks shuttle → victory sequence.

**Victory screen:** Hyperspace jump animation (star field stretch + ship departure) → overlay with player name ("{name} escaped Detention Block AA-23"), total time, and replay button. This is the emotional payoff — worth the animation investment.

---

## Architecture

```
src/
  main.tsx                — entry point, React root
  App.tsx                 — Canvas + scene routing
  stores/
    useGameStore.ts       — progression state machine, current room, puzzle completion
    useInventoryStore.ts  — collected items across scenes
    useHintStore.ts       — hint state per puzzle (shown, timers)
  scenes/
    DetentionCell.tsx     — room 1 geometry + puzzle 1
    ControlRoom.tsx       — room 2 geometry + puzzle 2
    Corridor.tsx          — room 3 geometry + puzzle 3
    HangarBay.tsx         — room 4 geometry + puzzle 4
  components/
    InteractiveObject.tsx — clickable/hoverable 3D object wrapper
    DraggableObject.tsx   — drag-and-drop 3D object
    HintTrigger.tsx       — timed hint display component
  ui/
    HUD.tsx               — inventory display, hint text overlay (HTML overlay)
    Dialogue.tsx          — in-world text popups
    Victory.tsx           — end screen
  assets/                 — textures, models (minimal), audio files
index.html
```

**Key patterns:**
- Each scene is a React component rendered inside R3F `<Canvas>`
- Interaction via R3F's built-in event system (onClick, onPointerOver) + drei helpers

### State Management

**Rule:** data that crosses scenes → zustand store. Data that lives and dies within a scene → local state + props drilling.

**Zustand stores (centralized, cross-scene):**
- **`useGameStore`** — progression state machine: current room, which puzzles are solved, game phase (playing / won)
- **`useInventoryStore`** — collected items (keycard, override code, frequency). Puzzle 4 needs items from rooms 1–3, so this must be global
- **`useHintStore`** — hint state per puzzle (which hints already shown, timer progress). In zustand to avoid repeating delays if player revisits a scene. May move to local if we confirm hints don't need persistence — keeping centralized until there's less uncertainty

**Local state (scene-internal):**
- Animation state (panel opening, conduit powering up)
- Drag state (power cell position while dragging)
- Hover/highlight effects
- Terminal input (what the player has typed)

No server state → no react-query or similar. All game state is in-memory for the session duration.

### Performance

R3F adds no overhead over raw Three.js — the bottleneck is what we put in the scene.

**Baseline rules:**
- Simple geometry (boxes, cylinders, planes) — no heavy models
- 1–2 real-time point lights + ambient. Shadow maps limited or off
- Minimize draw calls; instancing for repeated objects (wall panels, lights)
- Delta-time animations via `useFrame` — frame-rate independent, plays the same at 30fps and 60fps

**Automatic quality degradation** via drei's `<PerformanceMonitor>`:
- Detects FPS drops in real-time, no manual settings menu
- **High tier** — bloom/glow post-processing, shadows, full device pixel ratio
- **Low tier** — no post-processing, no shadows, reduced dpr
- Threshold: degrades automatically below ~30fps

### Audio

**SFX only** — no ambient music. Keeps scope minimal while adding essential feedback:
- Interaction sounds: click, door open/close, panel slide, keycard pickup
- Puzzle feedback: correct placement glow, wrong input buzz, conduit power-up hum
- Victory: hyperspace jump whoosh
- Implementation: drei's `useAudioListener` + `PositionalAudio` for 3D-positioned sounds, or plain `HTMLAudioElement` for UI-layer SFX. Prefer the simpler option that works.
- All audio triggered by game events, not ambient loops — avoids autoplay browser restrictions

### Loading & Error States

- **Loading:** R3F `<Suspense>` wrapping scene content + drei `<Loader>` for a visible progress bar while assets (textures, audio) load. Consistent across all scenes — defined once in App.tsx
- **Asset failure:** If a texture or audio file fails to fetch, degrade gracefully (fallback color/material, silent SFX) rather than crashing. No retry logic — assets are static and bundled, so failures are rare (CDN issue or corrupted build)

### Accessibility

WebGL canvas is opaque to screen readers — full WCAG AA for the 3D experience is not realistic. Focus on what's practical:

**In scope:**
- **Keyboard navigation** — Tab to cycle interactive objects (highlight/focus ring), Enter/Space to interact, Escape to cancel. Managed via keyboard listener + focus state on 3D objects
- **Color-blind safe** — Puzzles never rely on color alone. Redundancy: color + shape + icon/pattern (e.g. correct conduit = green + checkmark, not just green)
- **WCAG contrast** — HUD, dialogue, and overlay text (HTML outside canvas) meet contrast ratios. Legible fonts, minimum sizes
- **`aria-live` region** — Hidden div outside canvas narrates key events ("Keycard collected", "Door unlocked") for screen readers

**Out of scope (with rationale):**
- Full screen reader navigation inside 3D canvas — it's a bitmap, no DOM to parse
- Complete audio descriptions of each scene
- Full WCAG AA compliance for the entire 3D experience

### Internationalization

- **react-i18next** — standard React i18n lib
- **Locales:** `en` (default/fallback) + `es`
- **Auto-detection** of browser locale, fallback to `en`
- **Scope:** hints, dialogue text, HUD labels, victory screen — minimal text surface, trivial to maintain
- **Structure:** `i18n.ts` config + JSON translation files per locale (`locales/en.json`, `locales/es.json`), `useTranslation()` in components

### Testing Strategy

Separate pure logic from UI — the 3D/HTML boundary defines which layer applies.

**Unit tests (vitest)** — carry the weight:
- Zustand stores: game state machine transitions, inventory add/remove/has, hint progression
- Extracted puzzle logic: sequence validation (puzzle 2), combination check (puzzle 4), power cell orientation (puzzle 3)
- Pure functions, zero 3D dependency

**Integration tests (RTL)** — HTML overlays only:
- HUD, Dialogue, Victory screen — standard React components, RTL handles them fine
- No RTL for 3D scenes — WebGL doesn't render in jsdom
- No `@react-three/test-renderer` — too immature to justify the cost

**E2E (Playwright)** — happy path:
- One test: "the game is winnable from start to finish" — click through all 4 rooms
- Playwright clicks on canvas coordinates for 3D interactions — brittle by nature (geometry changes break coordinates). Mitigate by using named 3D objects via accessibility tree where possible
- A few edge cases: wrong clicks, invalid inputs
- Fragile and slow — keep the set minimal, budget time for coordinate updates when scenes change

### DX Tooling

**npm scripts:**
```
dev             — vite dev server
build           — tsc && vite build
preview         — vite preview
test            — vitest
test:watch      — vitest --watch
test:ci         — vitest run --reporter=verbose
test:coverage   — vitest run --coverage
test:e2e        — playwright test
lint            — eslint src/
lint:fix        — eslint src/ --fix
format          — prettier --write src/
format:check    — prettier --check src/
```

**Git hooks (husky + lint-staged):**
- **pre-commit:** `lint-staged` (eslint + prettier on staged files) + `vitest related` (only tests for modified files — fast feedback)
- **pre-push:** full suite (`test:ci` + `lint` + `format:check` — don't break upstream)

---

## Implementation Order

**Trunk-based development.** Short-lived feature branches (hours, not days), frequent merges to main. PRs are small and reviewable. Agents work sequentially (Pro plan limits parallelism). Human confirms before every merge. QA agent validates main continuously.

**TDD by default.** All implementation tasks use the `/tdd` skill (red-green-refactor loop). Vertical slices: one test → one implementation → repeat. Tests verify behavior through public interfaces, not implementation details. See `.claude/skills/tdd/` for full methodology.

**CI/CD split:**
- **GitHub Actions** — single orchestrator for all checks, agent triggers, and optional exploratory QA jobs. No Claude Routines (`claude.ai/code/routines`); automation stays in-repo via workflows.
- **Vercel** — deployment only (preview deploys on PRs, production on main). No test logic in Vercel

**GitHub Actions pipeline:**
- **On PR (pre-deploy):** `lint` → `format:check` → `test:ci` → `build`
- **On deploy (post-deploy):** triggered by Vercel `deployment_status` event → Playwright e2e against preview URL

### Phase 1: Scaffolding + Guardrails (sequential — everything depends on this)
- `feat/scaffolding` — Vite + React + TS + R3F + ESLint + Prettier + Husky + Canvas base + empty room
- `feat/ci-cd` — GitHub guardrails + CI/CD per [GitHub automation checklist](#github-automation-checklist) below: branch protection, CODEOWNERS, Claude GitHub App + `CLAUDE_CODE_OAUTH_TOKEN`, CI workflows (lint, format, test, build, post-deploy e2e), dev-agent workflow (`approved` → PR), optional QA workflow (`workflow_dispatch` / schedule), Vercel (preview + production). **Validate** that `deployment_status` fires correctly and preview URL is extractable before depending on post-deploy e2e

### Phase 2: Core (up to 2 branches at a time)
- `feat/stores` — zustand stores (game, inventory, hints) + unit tests
- `feat/i18n` — react-i18next config + EN/ES locale files
- `feat/ui-overlays` — HUD, Dialogue, Loading, Victory (HTML + CSS Modules)

### Phase 3: Components (after stores merge)
- `feat/interactive-components` — InteractiveObject, DraggableObject, HintTrigger

### Phase 4: Scenes (up to 2 branches at a time, after components merge)
- `feat/scene-detention-cell` — room 1 geometry + puzzle 1 (observation)
- `feat/scene-control-room` — room 2 geometry + puzzle 2 (logic)
- `feat/scene-corridor` — room 3 geometry + puzzle 3 (interaction)
- `feat/scene-hangar-bay` — room 4 geometry + puzzle 4 (combination)

### Phase 5: Integration (after all scenes merged)
- `feat/game-flow` — scene transitions, end-to-end flow, victory sequence
- `feat/performance` — PerformanceMonitor, quality tiers (high/low)
- `feat/e2e-tests` — Playwright happy path + edge cases

### Phase 6: Ship
- **Security audit** — run `/security-audit` skill against the full codebase. Focus: CSP headers, dependency CVEs, input sanitization on any user-facing inputs (player name, terminal input), asset loading. See `.claude/skills/security-audit/` for methodology
- `feat/readme` — README (run instructions, design decisions summary, AI/process transparency). Planning-era notes from `docs/WORKLOG.md`; implementation and agent usage from GitHub Issues, PRs, and commit history (WORKLOG is planning-only after Phase 1)

### Automated Tests vs QA Agent

Two complementary layers:

**1. Automated tests (CI — deterministic, run always):**
- Lint + format + vitest (unit/integration) on every PR
- Playwright e2e against Vercel preview URL post-deploy
- Green/red status on the PR — pass or fail, no ambiguity

**2. QA agent (exploratory, non-deterministic):**
- Triggered from **GitHub Actions** (`workflow_dispatch` or schedule on `main`) or manually by the developer — not Claude Routines
- Runs in a GitHub Actions job (or locally when debugging) against a Vercel preview/production URL or `localhost:5173` in local runs
- Uses **claude-code-action** (or equivalent) with a prompt to explore the app; prefer **Playwright MCP** when running locally for full browser control. In Actions, use Playwright for scripted checks and Claude for triage/reporting unless MCP is wired in the runner
- Looks for bugs that automated tests don't cover: broken interactions, visual regressions, unreachable states, edge cases
- **Performance pass:** activates Chrome DevTools CPU throttling (4x–6x via CDP) to simulate low-spec hardware, monitors FPS, and verifies `<PerformanceMonitor>` degrades to Low tier correctly
- **Setup:** documented in Phase 1 (guardrails), first execution from Phase 3 onwards when there's visual content to validate
- Most valuable from Phase 3 onwards — trunk-based means main always has fresh code to validate

**Plan tasks (features) → agent workflow:**
1. Human opens a **Plan task** issue (template `.github/ISSUE_TEMPLATE/task.yml`) — scope, acceptance criteria, plan-v2 branch hint (e.g. `feat/stores`)
2. When ready, add label **`approved`** (or run **Dev agent on approved** manually with the issue number)
3. Dev agent implements the vertical slice on a `feat/*` branch → opens PR (`Closes #N`)
4. **PR iteration:** `@claude` on the PR → `dev-agent-pr-feedback.yml`
5. Human PR review → auto-merge when green

**QA agent → bug → fix workflow:**
1. QA agent finds a bug → opens a **GitHub issue** with label `bug` (repro steps, screenshot if applicable)
2. **Human reviews** the issue — if valid, adds `approved` label; if not, closes with comment
3. Same dev agent workflow as plan tasks (`dev-agent-on-approved.yml`) — branch prefix `fix/issue-*`, regression tests required
4. **PR iteration:** `@claude` on the PR
5. Human approves PR review → **auto-merge** when required checks pass

**Shared gate:** dev agent runs only after **`approved`** (or explicit `workflow_dispatch`). No `approved`, no automatic work. Opt out with label `no-agent`.

**Billing / limits:** Dev and QA jobs use **Claude Pro** via `CLAUDE_CODE_OAUTH_TOKEN` in Actions (`claude setup-token`). Usage counts against the subscription; GitHub Actions also consumes runner minutes. No separate “agent pool” — cap parallelism at ~2 branches per plan.

---

## GitHub automation checklist

All orchestration lives in **GitHub** (settings + `.github/`). Agents are **not** launched from Claude Routines or `claude.ai/code/routines`. Optional ad-hoc cloud sessions from the browser are out of band and not part of this pipeline.

### Architecture

```
Issue (task template / bug) → human adds approved  (or workflow_dispatch)
       ↓
dev-agent-on-approved → feat/* or fix/* branch + PR
       ↓
CI on PR (lint, test, build) + Vercel preview + post-deploy e2e
       ↓
PR comment/review with @claude → dev-agent-pr-feedback → push to same PR
       ↓
Human PR review (CODEOWNERS) → auto-merge if approved + green
       ↓
main updated → optional scheduled QA Action → new bug issues only
```

### Checklist (Phase 1 — `feat/ci-cd`)

| # | Task | Where | Notes |
|---|------|--------|--------|
| 1 | **Protect `main`** — no direct push; PR required | GitHub → Settings → Branches (ruleset or classic) | Require status checks once CI workflows exist (`lint`, `test`, `build`, etc.) |
| 2 | **Auto-request your review** on every PR | `.github/CODEOWNERS` (`* @your-username`) + branch protection “Require review from Code Owners” (optional) | Or a small Action on `pull_request: opened` to request reviewers |
| 3 | **Enable auto-merge** | Repo Settings → General → Allow auto-merge; per-PR “Enable auto-merge” | Requires 1 approval + green checks per branch protection |
| 4 | **Install Claude GitHub App** on the repo | [github.com/apps/claude](https://github.com/apps/claude) | Clone/push/webhooks for Claude Code Action; not the same as pasting an API key into the App |
| 5 | **OAuth token for Pro (Actions)** | One-time locally: `claude setup-token` or `/install-github-app` → store as repo secret `CLAUDE_CODE_OAUTH_TOKEN` | Uses Pro/Max subscription; avoid `ANTHROPIC_API_KEY` unless billing API separately. **Never** commit tokens |
| 6 | **Labels** | GitHub → Labels | `bug` (defects), `enhancement` (plan tasks, default on task template), `approved` (human — dev agent gate), optional `no-agent` (opt out) |
| 7 | **Dev agent workflow** | `.github/workflows/dev-agent-on-approved.yml` | `approved` on any issue (not only `bug`) + `workflow_dispatch` with issue # → plan task (`feat/*`) or bug (`fix/*`) per labels. See `AGENTS.md` |
| 7b | **Dev agent PR feedback** | `.github/workflows/dev-agent-pr-feedback.yml` | `issue_comment` / `pull_request_review_comment` / `pull_request_review` when body contains `@claude` (PR only for issue comments). Interactive mode (no `prompt`); pushes to current PR branch. Same OAuth secret as #7 |
| 8 | **CI workflow** | `.github/workflows/ci.yml` | On PR: `lint` → `format:check` → `test:ci` → `build` |
| 9 | **Post-deploy e2e** | `.github/workflows/e2e-preview.yml` | `on: deployment_status` (Vercel success) → Playwright against preview URL |
| 10 | **Vercel** | vercel.com → import GitHub repo | Preview on PRs, production on `main`; emits `deployment_status` for step 9 |
| 11 | **QA workflow (optional Phase 3+)** | `.github/workflows/qa-exploratory.yml` | `workflow_dispatch` + `schedule` (e.g. weekly) → claude-code-action prompt: explore preview/prod URL, **only** open issues with `bug` (no fixes). Human still adds `approved` before dev agent runs |
| 12 | **Agent instructions in repo** | `AGENTS.md` | Plan tasks vs bugs, `approved` gate, `@claude` on PRs, branch naming, TDD |
| 13 | **Issue / PR templates** | `.github/ISSUE_TEMPLATE/task.yml`, `bug.yml`, `pull_request_template.md` | Task: plan branch + acceptance criteria; bug: repro steps |

### Authentication (clarification)

| Piece | Purpose |
|-------|---------|
| **Claude GitHub App** | Repo access for the action (clone, push branch, open PR) |
| **`CLAUDE_CODE_OAUTH_TOKEN`** | Bills against Claude Pro/Max when the action runs Claude |
| **`ANTHROPIC_API_KEY`** | Optional; separate Console billing — not required if using OAuth token |
| **Claude Routines** | **Out of scope** for this project |

### Dev agent vs QA agent (GitHub)

| | Dev agent | QA agent |
|---|-----------|----------|
| **Trigger** | Issue labeled `approved` or `workflow_dispatch`; PR feedback via `@claude` | `workflow_dispatch` and/or `schedule` |
| **Action** | Plan tasks (`feat/*`) or bug fixes (`fix/*`) + tests + PR | Explore + open `bug` issues only |
| **Human gate** | `approved` on issue + PR review | Validates bug before `approved`; PR review before merge |
| **Deterministic tests** | Extends vitest/Playwright in PR | Separate CI e2e job — not a substitute |

### What is not in this checklist

- Claude Routines / scheduled cloud sessions at `claude.ai/code/routines`
- Relying on manual Cursor/CLI sessions for the main dev loop (optional for debugging only)
- Auto-fix without human PR approval on `main`

---

## Verification

- Run `npm run dev`, play through all 4 rooms in browser
- Verify each puzzle is solvable with in-world hints only (no source code reading)
- Verify win state is reachable
- Test edge cases: clicking wrong things, re-entering codes, dragging to wrong slots
- `npm run build` succeeds, preview works
- Deployed link loads and is fully playable
