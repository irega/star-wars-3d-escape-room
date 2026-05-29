# Tech Design: Star Wars 3D Escape Room

> Source of truth for architecture, technology choices, and design decisions.  
> Consult before any design decision. Update here when a decision changes.

## Context

Browser-based 3D escape room — 4 puzzles, playable to completion, in-world hints. Star Wars themed. No backend. All game state lives in memory for the session duration.

**Guardrails:** See `docs/challenge-spec.md` for hard requirements and evaluation criteria.

---

## Out of Scope (with rationale)

- **Multiplayer / server-persisted state / leaderboards / user accounts** — no backend
- **localStorage / session persistence** — target session is ~10 minutes; restart-on-close is acceptable. localStorage sync-on-startup adds non-trivial complexity (stale state, schema migration, partial saves) that doesn't justify itself for a short game
- **Mobile / touch devices** — challenge spec scopes to desktop browser. Touch drag-and-drop in 3D (Puzzle 3) is a fundamentally different interaction model; supporting it would require a parallel input system

---

## Tech Stack

| Tool | Purpose | Why chosen |
|------|---------|------------|
| **React + TypeScript** | UI, type safety | Developer's primary stack; types prevent runtime regressions |
| **React Three Fiber (R3F)** | Declarative Three.js for React | No performance loss over raw Three.js; largest React+3D ecosystem |
| **@react-three/drei** | R3F helpers (controls, loaders, abstractions) | Avoids reinventing common 3D patterns |
| **Zustand** | Cross-scene state management | Same team as R3F (pmndrs); selector-based subscriptions avoid full scene re-renders on state changes |
| **CSS Modules** | Scoped styling for HTML overlays | Zero config with Vite; no extra dependencies |
| **react-i18next** | EN/ES i18n, browser locale auto-detection | Standard React i18n; trivial to maintain with minimal text surface |
| **Vite** | Build tooling and dev server | Fast dev server; trivial Vercel deployment |
| **ESLint + Prettier** | Linting and formatting | Unified config for TS + React |
| **Vitest + RTL + Playwright** | Unit / integration / E2E testing | RTL for HTML overlays; Playwright for happy-path E2E |
| **Husky + lint-staged** | Git hooks for fast feedback | Pre-commit: staged files only; pre-push: full suite |
| **Vercel** | Deployment | Free tier; auto-deploy on push to main; preview deploys on PRs |

**Alternatives considered:**
- *3D:* `react-babylonjs` (smaller community, worse docs), `A-Frame+React` (unmaintained bindings, WebXR-focused). R3F is the clear winner.
- *State:* `useReducer` + Context is natural for state-machine transitions but re-renders the full provider subtree on every dispatch — in 3D that means frame drops. Zustand gives the same patterns without the re-render cost: state lives outside the React tree, so the game loop can read/write via `getState()`/`setState()` without triggering renders.

---

## Game Concept: "Escape from Detention Block AA-23"

The player wakes up in an Imperial detention cell aboard the Death Star. A partial power failure forces them to solve 4 puzzles to escape before the station is destroyed.

**Intro experience** — a Star Wars opening crawl plays before the game. The player enters an optional name (default: "Rebel") during the intro, and ambient music (Imperial March) starts on first interaction. A mute toggle is always visible.

**Optional player name** — entered at game start (default: "Rebel"). Used only on the victory screen. One string in `useGameStore`.

**Setting progression:**
1. Detention Cell — small room, cot, wall panel, flickering lights
2. Control Room — terminals, holographic displays, door controls
3. Corridor — blast doors, power conduits, droid wreckage
4. Hangar Bay — final escape, ship behind force field

---

## Puzzles

### Puzzle 1 — "The Loose Panel" (Observation)
- **Where:** Detention Cell
- **What:** A wall panel is visually displaced. Clicking it reveals a hidden maintenance keycard.
- **Hint escalation:** Flickering light draws attention. After 30 s, light flickers more aggressively. After 60 s, a text hint appears in the HUD.
- **Gate:** Keycard opens cell door → Control Room.

### Puzzle 2 — "Imperial Override" (Logic)
- **Where:** Control Room
- **What:** A terminal shows an Aurebesh sequence puzzle. Clues on surrounding holographic screens define the 4-symbol pattern (A-U-R-E). Click the terminal to open an on-screen input UI and type the correct sequence.
- **Hint escalation:** One screen highlights the first symbol. After a delay, HUD shows "read screens left to right." After ~90 s, HUD reveals the full answer.
- **Gate:** Correct sequence opens blast door → Corridor.

### Puzzle 3 — "Power the Conduit" (Interaction)
- **Where:** Corridor
- **What:** Three power cells (click-to-select, click-to-rotate, click-slot-to-place) are scattered near a destroyed droid. Place them into three conduit slots in the correct orientation. Conduits glow when a cell is correctly placed.
- **Implementation note:** The 3D drag-and-drop approach was assessed as too costly in UX complexity; the click-to-select + click-to-place fallback was chosen instead.
- **Hint escalation:** A damaged astromech droid nearby shows a holographic schematic of cell orientations (click to open). After a delay, glowing lights near the correct slots appear.
- **Gate:** All three cells placed correctly → blast door opens → Hangar Bay.

### Puzzle 4 — "Launch Clearance" (Combination)
- **Where:** Hangar Bay
- **What:** A launch console requires three inputs gathered from previous rooms:
  - Keycard from Puzzle 1 — insert into console
  - Override code from Puzzle 2 — enter on a keypad
  - Frequency number from Puzzle 3 — visible on the droid schematic
- **Hint:** Console shows 3 slots with status indicators. After a delay, HUD text prompts the player to check the droid schematic for the frequency.
- **Gate:** All three inputs → force field drops → player clicks shuttle → victory.

**Victory screen:** Overlay with player name, total time, and replay button.

---

## Architecture

```
src/
  main.tsx                        — entry point, React root
  App.tsx                         — Canvas + scene routing, phase management (intro/playing/won)
  i18n.ts                         — i18next configuration
  stores/
    useGameStore.ts               — progression state machine: phase, currentRoom, solvedPuzzles, playerName
    useInventoryStore.ts          — collected items (keycard, override-code, frequency)
    useHintStore.ts               — hint level per puzzle (0–3); timers managed in components
    useControlRoomTerminalStore.ts — terminal UI state: active, inputBuffer, inputFeedback, sequenceRevealed
  scenes/
    DetentionCell.tsx             — room 1 geometry + puzzle 1
    ControlRoom.tsx               — room 2 geometry + puzzle 2
    Corridor.tsx                  — room 3 geometry + puzzle 3
    HangarBay.tsx                 — room 4 geometry + puzzle 4
    DamagedAstromechDroid.tsx     — puzzle 3 droid with clickable holographic schematic
    detentionCellPuzzle.ts        — puzzle 1 constants + validation logic
    controlRoomPuzzle.ts          — puzzle 2 constants + sequence validation
    corridorPuzzle.ts             — puzzle 3 constants + cell placement validation
    hangarBayPuzzle.ts            — puzzle 4 constants + launch clearance validation
    launchFrequency.ts            — shared frequency constant (imported by puzzle 3 and 4)
  components/
    InteractiveObject.tsx         — clickable/hoverable 3D object wrapper
    DraggableObject.tsx           — drag-and-drop 3D object (scaffolded; unused — fallback chosen for puzzle 3)
    HintTrigger.tsx               — timed hint display component (advances hint level after delay)
    RoomHintTriggers.tsx          — orchestrates all hint timers for the current room
  three/
    index.ts                      — barrel export
    palette.ts                    — imperialPalette color tokens (shared across scenes)
    ImperialRoomShell.tsx         — procedural parametric room geometry (walls, floor, ceiling)
    ImperialLighting.tsx          — shared lighting: point lights + optional contact shadows
    BlastDoor.tsx                 — animated blast door (used in Corridor and HangarBay)
    BarredCellDoor.tsx            — detention cell barred door with unlock animation
    TerminalConsole.tsx           — interactive terminal object (triggers on-screen UI)
    HologramScreen.tsx            — glowing hologram display panel
  ui/
    HUD.tsx                       — inventory list, current room name, hint text overlay (HTML)
    Dialogue.tsx                  — modal dialogue for in-world text (room-scoped; closes on room change)
    ControlRoomTerminal.tsx       — puzzle 2 on-screen terminal input UI
    Intro.tsx                     — intro screen: Star Wars crawl + player name entry + audio unlock
    IntroStarfield.tsx            — animated starfield background for intro
    Victory.tsx                   — win screen with player name, time, and replay button
    AmbientMusicToggle.tsx        — persistent mute/unmute button (always visible during play)
    Loading.tsx                   — loading screen (Suspense fallback)
    *.module.css                  — CSS Modules for all UI overlays
  audio/
    ambientMusic.ts               — ambient music (Imperial March) via HTMLAudioElement; starts on first interaction
index.html
public/
  audio/                          — audio files (not committed; see public/audio/README.md for copyright)
```

**Key patterns:**
- Each scene is a React component rendered inside R3F `<Canvas>`
- Interaction via R3F's built-in event system (`onClick`, `onPointerOver`) and drei helpers
- Puzzle logic is extracted into pure `.ts` files (e.g. `controlRoomPuzzle.ts`) — scene components are rendering + event wiring only
- Shared 3D primitives live in `src/three/` — scenes import from there, not directly from R3F/drei

---

## State Management

**Rule:** data that crosses scenes → Zustand store. Data that lives and dies within a scene → local state + props drilling.

**Zustand stores (centralized, cross-scene):**

| Store | Responsibility |
|-------|---------------|
| `useGameStore` | Progression state machine: current room, which puzzles are solved, game phase (intro / playing / won), player name |
| `useInventoryStore` | Collected items (keycard, override code, frequency). Puzzle 4 reads items from rooms 1–3 |
| `useHintStore` | Hint level per puzzle (0–3). Centralized so hints don't reset if the player revisits a scene |
| `useControlRoomTerminalStore` | Terminal UI state for puzzle 2: active, input buffer, input feedback, sequence revealed flag |

**Local state (scene-internal):**
- Animation state (panel opening, conduit powering up)
- Power cell selection and rotation state (puzzle 3)
- Hover / highlight effects
- Dialogue text (stored in App state, scoped to current room)

No server state → no react-query or similar.

---

## Performance

R3F adds no overhead over raw Three.js — the bottleneck is what we put in the scene.

**Baseline rules:**
- Simple procedural geometry (boxes, cylinders, planes via `ImperialRoomShell`) — no external models
- 1–2 real-time point lights + ambient. Shadow maps via contact shadows (high tier only)
- Delta-time animations via `useFrame` — frame-rate independent
- ACESFilmicToneMapping with 1.5× exposure for cinematic look

**Automatic quality degradation** via drei's `<PerformanceMonitor>` (implemented in `App.tsx`):

| Tier | Features |
|------|---------|
| High | Contact shadows, full device pixel ratio (`min(dpr, 2)`) |
| Low | No contact shadows, reduced dpr (`0.75`) |

Degrades automatically below ~30 fps. No manual settings menu needed. Current tier exposed as `data-quality-tier` attribute on the root element (used in tests).

---

## Audio

**Ambient music** — Imperial March (looped `HTMLAudioElement`) starts on first user interaction to comply with browser autoplay policy. A persistent mute toggle (`AmbientMusicToggle`) lets the player silence it at any time.

**SFX** — not implemented. Interaction feedback is visual only (glow, color change, animation). Kept out of scope to avoid managing audio asset licensing and volume mixing complexity.

**Implementation details:**
- Audio triggered only on first user interaction (compliance with browser autoplay policy)
- Audio file lives in `public/audio/` and is not committed (see `public/audio/README.md` for copyright)

---

## Security

Security headers are configured in `vercel.json` (applied by Vercel at the CDN edge):

| Header | Value |
|--------|-------|
| `Content-Security-Policy` | `default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; connect-src 'self'; media-src 'self'; worker-src 'self' blob:; frame-ancestors 'none'` |
| `X-Frame-Options` | `DENY` |
| `X-Content-Type-Options` | `nosniff` |
| `Referrer-Policy` | `strict-origin-when-cross-origin` |

No external API calls, no user-generated content, no auth — attack surface is minimal. `unsafe-inline` for styles is required by CSS-in-JS from R3F/drei (no user-controlled style strings).

---

## Loading & Error States

- **Loading:** R3F `<Suspense>` wrapping scene content with `null` fallback. Rooms are small enough that the loading gap is imperceptible.
- **Asset failure:** Audio degrades gracefully (`.play()` errors are caught and swallowed). Geometry is fully procedural — no external asset loading to fail.

---

## Accessibility

WebGL canvas is opaque to screen readers — full WCAG AA for the 3D experience is not realistic.

**In scope:**
- **Keyboard navigation** — Tab to cycle interactive objects, Enter/Space to interact, Escape to cancel/close overlays
- **Color-blind safe** — puzzles never rely on color alone (color + shape + label for power cells; letter sequence for puzzle 2)
- **WCAG contrast** — HUD, dialogue, and overlay text meet contrast ratios
- **`aria-live` region** — hidden div in HUD narrates key events for screen readers
- **Reduced motion** — `prefers-reduced-motion` respected in the intro crawl animation

**Out of scope (with rationale):**
- Full screen reader navigation inside 3D canvas — it's a bitmap, no DOM to parse
- Complete audio descriptions of each scene
- Full WCAG AA compliance for the entire 3D experience

---

## Internationalization

- **Library:** react-i18next
- **Locales:** `en` (default/fallback) + `es`
- **Auto-detection** of browser locale, fallback to `en`
- **Scope:** hints, dialogue text, HUD labels, victory screen, intro crawl
- **Structure:** `i18n.ts` config + JSON translation files (`src/locales/en.json`, `src/locales/es.json`), `useTranslation()` in components

---

## Testing Strategy

**Unit tests (Vitest)** — carry the weight:
- Zustand stores: state machine transitions, inventory add/remove/has, hint progression, terminal store
- Extracted puzzle logic: sequence validation (puzzle 2), cell placement and orientation (puzzle 3), launch clearance (puzzle 4)
- Audio module: start/stop/mute/reset behavior
- Pure functions, zero 3D dependency

**Integration tests (RTL)** — HTML overlays only:
- HUD, Dialogue, Victory, Loading, ControlRoomTerminal — standard React components
- No RTL for 3D scenes — WebGL doesn't render in jsdom
- No `@react-three/test-renderer` — too immature to justify the cost

**Performance tests (Vitest + Playwright):**
- Unit: PerformanceMonitor quality tier switching (high → low tier on FPS decline, recovery on FPS incline)
- E2E: PerformanceMonitor auto-degradation under CPU throttling (verifies `data-quality-tier` attribute changes)

**E2E (Playwright)** — happy path:
- One test: "the game is winnable from start to finish"
- Edge cases: wrong terminal input, invalid sequences
- Playwright clicks canvas coordinates for 3D interactions — brittle by nature; mitigated with `data-testid` on DOM overlays

---

## CI/CD

**Continuous Integration** — GitHub Actions + Vercel:
- **GitHub Actions** — single orchestrator on every PR: lint → format:check → test:ci → build
- **Vercel** — deployment (preview on PRs, production on `main`). Emits `deployment_status` for post-deploy E2E
- **Post-deploy E2E** — Playwright against Vercel preview URL on `deployment_status` success

**Dev agent workflow** — [claude-code-action](https://github.com/anthropics/claude-code-action) with Claude Pro:
1. Create issue from template (enhancement, bug, or manual task)
2. Add `approved` label (gates agent pickup)
3. Dev agent creates a branch and opens PR with inline feedback
4. PR runs full CI (lint, format:check, test:ci, build)
5. Human review + green CI required before merge
6. Never merge — agent creates PRs only; human merges on main branch

See `AGENTS.md` for branch naming conventions, labels, and full agent setup.
