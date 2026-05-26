# Plan v2: Star Wars 3D Escape Room — Full Implementation

> Living document — evolving from v1 through iterative challenges.

## Context

Crossmint engineering challenge: build a browser-based 3D escape room with 4 puzzles, playable to completion, with in-world hints. Star Wars themed. No code exists yet — greenfield project. Must be deployed with a live link.

**No backend.** Time budget and deployment simplicity dictate a fully client-side app. Out of scope: multiplayer, online play, server-persisted state, leaderboards, user accounts. All game state lives in-memory in the browser for the duration of a session.

---

## Tech Stack

- **React + TypeScript** — developer's primary stack, type safety to prevent runtime regressions
- **React Three Fiber (R3F)** — declarative Three.js for React, no performance loss, largest React+3D ecosystem
- **@react-three/drei** — R3F helpers (controls, loaders, abstractions) — avoids reinventing common 3D patterns
- **Zustand** — state management (same team as R3F — pmndrs). Selector-based subscriptions: each component reads only the slice it needs, so puzzle state changes don't re-render the entire 3D scene
- **Vite** — build tooling (fast dev server, trivial to deploy)
- **Deployment** — Vercel or Netlify (zero-config for Vite static sites)

**Alternatives considered:**
- *3D:* react-babylonjs (smaller community, worse docs), A-Frame+React (unmaintained bindings, WebXR-focused). R3F is the clear winner for this scope.
- *State:* `useReducer` + Context is a natural fit for state-machine-like transitions (room progression, puzzle states) but re-renders the full provider subtree on every dispatch — in 3D that means frame drops. Zustand gives the same dispatch/action patterns without the re-render cost: state lives outside the React tree, so the game loop can read/write via `getState()`/`setState()` without triggering renders.

---

## Game Concept: "Escape from Detention Block AA-23"

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
- **Hint:** Flickering light near the panel draws attention. After 30s, the light flickers more aggressively. After 60s, a subtle audio cue (beep) plays.
- **Gates:** Keycard opens the cell door → Control Room.

### Puzzle 2 — "Imperial Override" (Logic)
- **Where:** Control Room
- **What:** A terminal displays an Aurebesh sequence puzzle. The player must decode a 4-symbol pattern from clues scattered on screens around the room (each screen shows one relationship). Input the correct sequence to unlock corridor access.
- **Hint:** One screen highlights the first symbol. After delay, terminal displays "HINT: read screens left to right."
- **Gates:** Correct sequence opens blast door → Corridor.

### Puzzle 3 — "Power the Conduit" (Interaction)
- **Where:** Corridor
- **What:** The path is blocked by a deactivated blast door. Three power cells (draggable objects) are scattered in the corridor near a destroyed droid. The player must drag them into three conduit slots in the correct orientation (rotate + place). Conduits glow when a cell is correctly placed.
- **Hint:** A damaged droid nearby has a holographic schematic showing cell orientations. After delay, cells glow faintly near their correct slot.
- **Gates:** All three cells placed → blast door opens → Hangar Bay.

### Puzzle 4 — "Launch Clearance" (Combination)
- **Where:** Hangar Bay
- **What:** A shuttle is behind a force field. The launch console requires three inputs gathered from previous rooms:
  - The keycard (from Puzzle 1) — insert into console
  - The override code (from Puzzle 2) — enter on a keypad
  - A frequency number (from Puzzle 3) — visible on the droid's schematic, easy to miss
- **Hint:** Console shows 3 slots, two are obvious callbacks. Third slot says "FREQ: ???" — if stuck, a repeating announcement in the hangar mentions the frequency.
- **Gates:** All three inputs → force field drops → player clicks shuttle → victory cutscene (jump to hyperspace).

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

---

## Implementation Order

1. **Scaffolding** — Vite + React + TS + R3F setup, Canvas, camera + controls, empty room
2. **Core systems** — Scene manager, interaction (raycasting + click), inventory, HUD
3. **Room 1 + Puzzle 1** — Detention cell geometry, loose panel puzzle, cell door transition
4. **Room 2 + Puzzle 2** — Control room, terminal UI, sequence puzzle logic
5. **Room 3 + Puzzle 3** — Corridor, drag-and-drop power cells, conduit mechanic
6. **Room 4 + Puzzle 4** — Hangar bay, combination console, victory sequence
7. **Hints system** — Timed hints for all 4 puzzles
8. **Polish** — Lighting, ambient audio, Star Wars atmosphere (glow effects, particles)
9. **Deploy** — Vercel/Netlify, live link in README
10. **README** — Run instructions, design decisions summary, AI usage summary (both derived from `docs/WORKLOG.md` — README is the digest, worklog is the raw trail)

---

## Verification

- Run `npm run dev`, play through all 4 rooms in browser
- Verify each puzzle is solvable with in-world hints only (no source code reading)
- Verify win state is reachable
- Test edge cases: clicking wrong things, re-entering codes, dragging to wrong slots
- `npm run build` succeeds, preview works
- Deployed link loads and is fully playable
