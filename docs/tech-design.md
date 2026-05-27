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
- **Hint escalation:** Flickering light draws attention. After 30 s, light flickers more aggressively. After 60 s, a subtle audio cue (beep) plays.
- **Gate:** Keycard opens cell door → Control Room.

### Puzzle 2 — "Imperial Override" (Logic)
- **Where:** Control Room
- **What:** A terminal shows an Aurebesh sequence puzzle. Clues on surrounding screens define the 4-symbol pattern. Input the correct sequence to unlock corridor access.
- **Hint escalation:** One screen highlights the first symbol. After a delay, terminal shows "HINT: read screens left to right." After ~90 s, terminal reveals 3 of 4 symbols.
- **Gate:** Correct sequence opens blast door → Corridor.

### Puzzle 3 — "Power the Conduit" (Interaction)
- **Where:** Corridor
- **What:** Three power cells (draggable) are scattered near a destroyed droid. Drag them into three conduit slots in the correct orientation (rotate + place). Conduits glow when a cell is correctly placed.
- **Complexity fallback:** If 3D drag-and-drop with orientation proves too costly, fall back to click-to-select + click-to-place.
- **Hint escalation:** A damaged droid nearby shows a holographic schematic of cell orientations. After a delay, cells glow faintly near their correct slot.
- **Gate:** All three cells placed → blast door opens → Hangar Bay.

### Puzzle 4 — "Launch Clearance" (Combination)
- **Where:** Hangar Bay
- **What:** A launch console requires three inputs gathered from previous rooms:
  - Keycard from Puzzle 1 — insert into console
  - Override code from Puzzle 2 — enter on a keypad
  - Frequency number from Puzzle 3 — visible on the droid schematic
- **Hint:** Console shows 3 slots, two are obvious. Third says "FREQ: ???". A repeating hangar announcement mentions the frequency if the player is stuck.
- **Gate:** All three inputs → force field drops → player clicks shuttle → victory.

**Victory screen:** Hyperspace jump animation (star field stretch + ship departure) → overlay with player name, total time, and replay button.

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
    HUD.tsx               — inventory display, hint text overlay (HTML)
    Dialogue.tsx          — in-world text popups
    Victory.tsx           — end screen
    Loading.tsx           — loading screen
  assets/                 — textures, models (minimal), audio files
index.html
```

**Key patterns:**
- Each scene is a React component rendered inside R3F `<Canvas>`
- Interaction via R3F's built-in event system (`onClick`, `onPointerOver`) and drei helpers

---

## State Management

**Rule:** data that crosses scenes → Zustand store. Data that lives and dies within a scene → local state + props drilling.

**Zustand stores (centralized, cross-scene):**

| Store | Responsibility |
|-------|---------------|
| `useGameStore` | Progression state machine: current room, which puzzles are solved, game phase (playing / won) |
| `useInventoryStore` | Collected items (keycard, override code, frequency). Puzzle 4 reads items from rooms 1–3 |
| `useHintStore` | Hint state per puzzle (which hints shown, timer progress). Centralized so hints don't reset if the player revisits a scene |

**Local state (scene-internal):**
- Animation state (panel opening, conduit powering up)
- Drag state (power cell position while dragging)
- Hover / highlight effects
- Terminal input (what the player has typed)

No server state → no react-query or similar.

---

## Performance

R3F adds no overhead over raw Three.js — the bottleneck is what we put in the scene.

**Baseline rules:**
- Simple geometry (boxes, cylinders, planes) — no heavy models
- 1–2 real-time point lights + ambient. Shadow maps limited or off
- Minimize draw calls; instancing for repeated objects
- Delta-time animations via `useFrame` — frame-rate independent

**Automatic quality degradation** via drei's `<PerformanceMonitor>`:

| Tier | Features |
|------|---------|
| High | Bloom/glow post-processing, shadows, full device pixel ratio |
| Low | No post-processing, no shadows, reduced dpr |

Degrades automatically below ~30 fps. No manual settings menu needed.

---

## Audio

**SFX only** — no ambient music (keeps scope minimal while adding essential feedback).

- Interaction sounds: click, door open/close, panel slide, keycard pickup
- Puzzle feedback: correct placement glow, wrong input buzz, conduit power-up hum
- Victory: hyperspace jump whoosh
- Implementation: drei's `useAudioListener` + `PositionalAudio` for 3D-positioned sounds, or plain `HTMLAudioElement` for UI-layer SFX — prefer whichever is simpler
- All audio triggered by game events, not ambient loops — avoids autoplay browser restrictions

---

## Loading & Error States

- **Loading:** R3F `<Suspense>` wrapping scene content + drei `<Loader>` for a visible progress bar. Defined once in `App.tsx`.
- **Asset failure:** Degrade gracefully (fallback color/material, silent SFX) rather than crashing. No retry logic — assets are static and bundled.

---

## Accessibility

WebGL canvas is opaque to screen readers — full WCAG AA for the 3D experience is not realistic.

**In scope:**
- **Keyboard navigation** — Tab to cycle interactive objects, Enter/Space to interact, Escape to cancel
- **Color-blind safe** — puzzles never rely on color alone (color + shape + icon/pattern)
- **WCAG contrast** — HUD, dialogue, and overlay text meet contrast ratios
- **`aria-live` region** — hidden div narrates key events for screen readers

**Out of scope (with rationale):**
- Full screen reader navigation inside 3D canvas — it's a bitmap, no DOM to parse
- Complete audio descriptions of each scene
- Full WCAG AA compliance for the entire 3D experience

---

## Internationalization

- **Library:** react-i18next
- **Locales:** `en` (default/fallback) + `es`
- **Auto-detection** of browser locale, fallback to `en`
- **Scope:** hints, dialogue text, HUD labels, victory screen
- **Structure:** `i18n.ts` config + JSON translation files (`locales/en.json`, `locales/es.json`), `useTranslation()` in components

---

## Testing Strategy

**Unit tests (Vitest)** — carry the weight:
- Zustand stores: state machine transitions, inventory add/remove/has, hint progression
- Extracted puzzle logic: sequence validation (puzzle 2), combination check (puzzle 4), power cell orientation (puzzle 3)
- Pure functions, zero 3D dependency

**Integration tests (RTL)** — HTML overlays only:
- HUD, Dialogue, Victory, Loading — standard React components
- No RTL for 3D scenes — WebGL doesn't render in jsdom
- No `@react-three/test-renderer` — too immature to justify the cost

**E2E (Playwright)** — happy path:
- One test: "the game is winnable from start to finish"
- A few edge cases: wrong clicks, invalid inputs
- Playwright clicks canvas coordinates for 3D interactions — brittle by nature; mitigate with named 3D objects via accessibility tree where possible

---

## CI/CD

- **GitHub Actions** — single orchestrator: lint → format:check → test:ci → build on every PR
- **Vercel** — deployment only (preview on PRs, production on `main`). Emits `deployment_status` for post-deploy E2E
- **Post-deploy E2E** — Playwright against Vercel preview URL on `deployment_status` success

See `AGENTS.md` for the full agent workflow (dev agent, QA agent, branch naming, `approved` gate).
