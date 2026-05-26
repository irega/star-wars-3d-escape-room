# Plan v1: Star Wars 3D Escape Room — Full Implementation

## Context

Crossmint engineering challenge: build a browser-based 3D escape room with 4 puzzles, playable to completion, with in-world hints. Star Wars themed. No code exists yet — greenfield project. Must be deployed with a live link.

---

## Tech Stack

- **Three.js** — 3D rendering (lighter than Babylon.js, well-documented, sufficient for simple geometry)
- **Vite** — build tooling (fast dev server, trivial to deploy)
- **Vanilla JS** — no framework needed for this scope
- **Deployment** — Vercel or Netlify (zero-config for Vite static sites)

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
  main.js              — entry point, scene bootstrap, game loop
  scenes/
    detention-cell.js  — room 1 geometry, puzzle 1 logic
    control-room.js    — room 2 geometry, puzzle 2 logic
    corridor.js        — room 3 geometry, puzzle 3 logic
    hangar-bay.js      — room 4 geometry, puzzle 4 logic
  core/
    renderer.js        — Three.js renderer, camera, controls setup
    scene-manager.js   — transitions between rooms, state management
    interaction.js     — raycasting, click/drag handlers
    inventory.js       — items the player has collected
    hints.js           — timed hint system
    audio.js           — ambient sounds, SFX
  ui/
    hud.js             — inventory display, hint text overlay
    dialogue.js        — in-world text popups (droid messages, terminal text)
    victory.js         — end screen
  assets/              — textures, models (minimal), audio files
index.html
```

**Key patterns:**
- Each scene exports `create()`, `update()`, `dispose()` — scene-manager orchestrates lifecycle
- Puzzle state lives in each scene module, not global
- Interaction system uses Three.js raycasting with a registry of clickable/draggable objects
- Hint system: each puzzle registers hints with delays — hints.js handles timers

---

## Implementation Order

1. **Scaffolding** — Vite + Three.js setup, basic renderer, camera + orbit controls, empty room
2. **Core systems** — Scene manager, interaction (raycasting + click), inventory, HUD
3. **Room 1 + Puzzle 1** — Detention cell geometry, loose panel puzzle, cell door transition
4. **Room 2 + Puzzle 2** — Control room, terminal UI, sequence puzzle logic
5. **Room 3 + Puzzle 3** — Corridor, drag-and-drop power cells, conduit mechanic
6. **Room 4 + Puzzle 4** — Hangar bay, combination console, victory sequence
7. **Hints system** — Timed hints for all 4 puzzles
8. **Polish** — Lighting, ambient audio, Star Wars atmosphere (glow effects, particles)
9. **Deploy** — Vercel/Netlify, live link in README
10. **README** — Run instructions, design decisions, AI usage section

---

## Verification

- Run `npm run dev`, play through all 4 rooms in browser
- Verify each puzzle is solvable with in-world hints only (no source code reading)
- Verify win state is reachable
- Test edge cases: clicking wrong things, re-entering codes, dragging to wrong slots
- `npm run build` succeeds, preview works
- Deployed link loads and is fully playable
