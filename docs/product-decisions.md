# Product Decisions

> Record of product and UX tradeoffs made from project start to ship, organized by decision domain. Each entry describes what was chosen, why, and what alternatives were rejected.

---

## Core Architecture

### React + TypeScript + React Three Fiber

**Decision:** React + TypeScript as the UI layer; React Three Fiber (R3F) + `@react-three/drei` for 3D rendering.

**Tradeoff:** R3F introduces no performance overhead over raw Three.js and offers the strongest React 3D community/docs. Alternatives like `react-babylonjs` and `A-Frame + React` have weaker communities and are less maintained.

---

### State Management: Zustand

**Decision:** Zustand with selector-based subscriptions for all cross-scene state (progression, inventory, hints). Local `useState` for scene-specific data.

**Tradeoff:** `useReducer` + Context would rerender the full provider subtree on dispatch, causing frame drops. Zustand state lives outside React; the game loop can call `getState()`/`setState()` without triggering renders, and consumers subscribe only to their slice.

---

### No Backend, No Persistence

**Decision:** Fully client-side. No server, no `localStorage`, no session save state.

**Tradeoff:** Static Vite deployment to Vercel with zero infrastructure cost. Session length ~10 minutes; restart-on-close is acceptable. Adding `localStorage` introduces stale-state handling, schema migration, and partial-save edge cases not worth the complexity.

**Out of scope:** Multiplayer, leaderboards, user accounts, cross-session saves.

---

## Gameplay Design

### Game Concept: Detention Block AA-23 Escape

**Decision:** Player wakes in an Imperial detention cell aboard the Death Star during a power failure. Four puzzles to escape before station destruction.

**Rationale:** The detention block is an iconic Star Wars location that naturally maps to escape room mechanics. Power failure provides in-world justification for locked doors and system resets, making all puzzles feel coherent rather than arbitrary. Other settings (cantina, Jedi Temple, rebel base) lack this single-room, single-player, high-stakes clarity.

---

### Puzzle Structure: One Archetype per Room

**Decision:** Four distinct puzzle types (Observation, Logic, Interaction, Combination), one per room, each gating progress and feeding artifacts into the final puzzle.

**Rationale:** The challenge spec defines exactly four archetypes. Assigning one per room keeps each puzzle distinct and ensures the combination puzzle (launch clearance) can pull meaningful artifacts (keycard, override code, frequency) from the three earlier puzzles, creating a satisfying payoff.

---

### Optional Player Name

**Decision:** Optional player name at game start, defaults to "Rebel". Used only on victory screen.

**Rationale:** Adds personalization with minimal complexity — one string in `useGameStore`. Naming the player "Rebel" by default is narratively coherent.

---

## UX & Interaction

### Intro Screen Added Post-Scaffolding

**Decision:** Dedicated intro phase with story context, player name input, and "Begin Mission" button added after core gameplay.

**Rationale:** Without context, players landing directly in a dark 3D room have no idea what they're doing. The intro provides narrative framing (captured operative, power failure, escape objective). Implementing as a discrete `GamePhase` required no changes to other game logic.

---

### Star Wars Opening Crawl + Music

**Decision:** Star Wars-style intro sequence (starfield, opening card, perspective crawl). Imperial March loops during gameplay via `public/audio/imperial-march.mp3`.

**Tradeoff:** The crawl immediately establishes tone and gives players time to orient before 3D scene loads. Music respects browser autoplay restrictions (starts only on explicit gesture).

---

### Aurebesh Guidance in Hints

**Decision:** Puzzle 2 hints introduce Aurebesh as "the Star Wars writing system" and guide players to look it up; later hints explain symbol-to-letter mapping.

**Rationale:** Playtesting showed players unfamiliar with lore had no in-world way to decode holographic symbols. Hint escalation now explains _what_ the symbols are without handing over the answer, satisfying the "never require reading source code" requirement.

---

### Centralized Hint Triggers

**Decision:** Single `RoomHintTriggers` component rendered at `App.tsx` level (outside Canvas), replacing scattered `HintTrigger` instances inside scenes.

**Tradeoff:** Hint timers inside R3F scenes share Canvas lifecycle — when scenes unmount or rerender, timers reset. Moving hint management to DOM-based component above Canvas gives reliable, frame-independent timing.

---

### Terminal UI as DOM Overlay, Not R3F Html

**Decision:** Control room terminal input renders as fixed CSS overlay (`ControlRoomTerminal`) from `App.tsx`, not as a `drei Html` component inside Canvas.

**Tradeoff:** `Html` fullscreen in R3F caused z-index competition with 3D scene and occasional black-screen flashes. Plain DOM overlay sits cleanly above Canvas, simplifies keyboard event handling, and removes Three.js raycasting from the input path entirely.

---

### Puzzle 3: Click-Select-Place Instead of 3D Drag-and-Drop

**Decision:** Click a cell to select, click again to rotate, click conduit slot to place. Full 3D drag-and-drop with orientation was dropped.

**Tradeoff:** 3D pointer-drag with orientation requires tracking pointer deltas in world space, handling trackpad vs mouse, gimbal lock — high implementation surface. Click-select-rotate-place gives same expressive control with simpler code and no pointer-capture edge cases.

---

### Dialogue Clears on Room Transition

**Decision:** Dialogue state stores `{ text, room }`. If `dialogueEntry.room !== currentRoom`, dialogue is treated as `null`.

**Rationale:** Original implementation stored dialogue as plain string, so messages persisted when player walked into next room. Deriving visibility from room tag avoids race conditions and requires no cleanup code.

---

### Power Cells Can Be Extracted from Slots

**Decision:** Clicking an occupied conduit slot with no cell selected returns the cell to the world.

**Rationale:** Without extraction, placing a cell incorrectly permanently locked it, leaving players no recovery path. Extraction makes the puzzle forgiving without giving away the solution.

---

### Enter Key Submits Player Name; Escape/Click Closes Dialogue

**Decision:** Enter submits name input (like any form field). Escape or clicking outside the dialogue box dismisses it.

**Rationale:** Both follow standard web UX conventions. Players expected these affordances; their absence felt like bugs.

---

### HUD Shows Current Room Location

**Decision:** Added "Location" panel alongside inventory in HUD, pulling room name from i18n.

**Rationale:** In a four-room linear sequence, knowing which room you're in reduces disorientation, especially when transitions don't include a scene title card.

---

### Inventory Panel Min-Height Fixed

**Decision:** `.inventoryList` received `min-height` matching location panel's line height.

**Rationale:** At game start the inventory is empty, making the inventory panel shorter than location panel, creating a lopsided layout. CSS fix ensures visual consistency from frame one.

---

## Visual Design & Performance

### Lighting Refinement: Multiple Passes

**Decision:** Ambient light levels raised, point light intensities increased, each room given distinct accent palette through multiple iterations.

**Evolution:**
1. **First pass:** Ambient 0.15–0.25 — all rooms indistinguishable dark-blue/black.
2. **Second pass:** Ambient raised to 0.35–0.5, distinct colors (detention: cold blue, control room: screen-lit, corridor: industrial, hangar: red emergency).
3. **Third pass:** Shared `ImperialLighting` component, ACES tone mapping, `ContactShadows`, brighter screens, reduced droid emissive.

**Rationale:** 3D scenes that look correct in dev often appear flat/dark in a browser. Iterating on screenshots rather than abstract values is the reliable method.

---

### Damaged Astromech Droid Rebuilt

**Decision:** Corridor droid rebuilt from box-stack into a `DamagedAstromechDroid` component — cylinder body, hemisphere dome, neck ring, vent slats, three-leg stance, damaged arm, holoprojector.

**Rationale:** Original box-stack was illegible and sat atop Power Cell 1, making both hard to interact with. Rebuilt component positions dome geometrically centered using body/neck height, with local point light for visibility.

---

### Distinct Aurebesh Symbol Renderings

**Decision:** Each Control Room screen (A/U/R/E) renders a unique bar-composition geometry instead of identical placeholders.

**Rationale:** Original implementation drew the same bars on all screens, making the puzzle unsolvable — players had no visual differentiation. Each symbol now uses a unique box-bar composition (e.g., top horizontal + crossbar for A) to approximate Aurebesh letterforms with simple Three.js geometry.

---

### Launch Frequency Unified to 1138

**Decision:** Frequency visible in Corridor (droid schematic) and required at Hangar Bay console is `1138` — a George Lucas _THX 1138_ reference.

**Rationale:** Initial implementation had two different values (47 and 1138) in separate modules. Players noting corridor frequency (47) would fail at console (1138). Shared `LAUNCH_FREQUENCY` constant and chose 1138 as a narrative Easter egg.

---

### Performance: Automatic Quality Degradation

**Decision:** `<PerformanceMonitor>` from drei automatically switches between High (bloom, contact shadows, full dpr) and Low (no post-processing, no shadows, dpr=0.75) tiers below ~30 fps. No manual settings UI.

**Rationale:** Eliminates need for settings menu while protecting lower-spec hardware. Degradation is invisible unless watching dev tools.

---

## Localization & Accessibility

### Internationalization: EN + ES with Auto-Detection

**Decision:** `react-i18next` with English default and Spanish as second locale, auto-detected from browser.

**Rationale:** Project context includes offices in both regions. Game's text surface is small (hints, dialogue, HUD, victory screen), so adding Spanish costs little and is a clear differentiator. `react-i18next` is the standard React i18n library with built-in browser detection.

---

### CSS Modules for HTML Overlays

**Decision:** CSS Modules for HUD, Dialogue, Loading, Victory components.

**Rationale:** Zero-config with Vite, scoped styles, zero dependencies. Keeps HTML overlay styling simple while 3D layer uses inline R3F materials.

---

### Accessibility: Pragmatic Scope

**Decision:** In-scope — keyboard navigation (Tab/Enter/Escape), color-blind-safe puzzles (color + shape redundancy), WCAG contrast on HTML text, `aria-live` regions for key events.

**Out of scope:** Full WCAG AA. WebGL canvas is opaque to screen readers (bitmap, not DOM tree). Full screen reader support or audio descriptions of each scene are not realistic for 3D WebGL games within scope and time constraints.

---

## Platform Scope

### Desktop-Only (No Mobile)

**Decision:** Target desktop browser only; mobile/touch explicitly out of scope.

**Rationale:** Challenge spec scopes to desktop. Puzzle 3 (drag-and-drop power cells with orientation) is fundamentally different on touch — supporting it would require a parallel input system, doubling implementation scope.

---

## Quality Assurance & Testing

### Testing Strategy: Three Layers

**Decision:**
- **Vitest** for pure logic (Zustand stores, puzzle validation) — no 3D dependency.
- **React Testing Library** for HTML overlays (HUD, Dialogue, Victory, Loading).
- **Playwright** for E2E happy-path — clicks canvas coordinates since WebGL has no DOM.

**Rationale:** WebGL does not render in jsdom, so RTL cannot test 3D scenes. `@react-three/test-renderer` evaluated and rejected as too immature. Extracting pure puzzle logic into plain TypeScript functions (e.g., `validateSequence`, `canExitDetentionCell`) makes business rules fully testable without 3D dependency.

---

### CI/CD: GitHub Actions + Vercel

**Decision:** GitHub Actions as single CI orchestrator (lint → format → test → build on every PR). Vercel for deployment only (preview on PRs, production on `main`). Post-deploy Playwright E2E against Vercel preview URL.

**Rationale:** Free tier covers project needs. Preview deploys per PR enable QA and manual testing against live build. Keeping deployment separate from CI keeps each tool focused.

---

### E2E Canvas Coordinates via Perspective Projection Math

**Decision:** Playwright tests derive canvas click coordinates by projecting 3D world positions through camera's perspective transform rather than pixel offsets.

**Rationale:** WebGL objects have no DOM nodes — only pixel coordinates can be clicked. Reverse-projecting world positions through known camera parameters (position, FOV, viewport, tilt) produces stable coordinates that remain valid as long as camera and object positions don't change. The math is auditable rather than guessed.

---

## Security & Compliance

### HTTP Security Headers

**Decision:** Added `Content-Security-Policy`, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy` to `vercel.json`.

**Tradeoff accepted:** `style-src` includes `'unsafe-inline'` because the inline `<style>` reset in `index.html` requires it. Removing the inline style was out of scope; the risk is low (inline styles cannot exfiltrate data).

**Rationale:** Security audit found no code-level vulnerabilities (no `dangerouslySetInnerHTML`, `eval()`, secrets in source, or `npm audit` findings). Missing headers were the only Medium finding. Adding them at the CDN/edge layer (Vercel) costs nothing at runtime and closes clickjacking and MIME-sniffing surfaces.

---

### `i18next escapeValue: false` Accepted

**Decision:** No code change for `escapeValue: false` in i18next config.

**Rationale:** Audit flagged this as Low finding. React renders all interpolated values as text nodes, not HTML — React itself is the escaping layer. This is the documented standard pattern for `react-i18next`. Player name is capped at 30 chars and rendered only as text node on victory screen with no HTML injection path.

---

### Imperial March Audio File (Copyrighted)

**Decision:** `public/audio/imperial-march.mp3` is committed to the repo despite copyright concerns (Lucasfilm owns Imperial March composition).

**Tradeoff Accepted:** Audio enhances immersion and establishes tone immediately. The audio system gracefully handles file absence (try/catch guard in `startAmbientMusic()`), but with the file included, music plays during intro and gameplay. Inclusion acknowledges copyright but prioritizes player experience.

---

## Automation & Tooling

### Agent Automation: GitHub-Native with Approval Gate

**Decision:** Dev agent triggers from GitHub issues labeled `approved` (no Claude Routines). Human reviews and merges all PRs. QA findings require human `approved` label before agent picks them up.

**Rationale:** Full automation without human-in-the-loop risks spurious issue creation and unreviewed merges. The `approved` gate means the agent does real work only on validated, scoped issues.

---

### Bot Push Identity: Claude App Commit Signing Over PAT

**Decision:** Agent workflows use `use_commit_signing: true` on `anthropics/claude-code-action`. Pushes appear as `claude[bot]`, not a human PAT owner.

**Evolution:** Initial approach used `BOT_PAT` (personal access token) to trigger CI on agent pushes — worked but committed as the PAT owner (human), muddying git history. Intermediate state used `workflow_dispatch` CI trigger, but checks attached to branch run rather than PR, so PR required checks never showed green. OIDC-signed commits via Claude App resolved cleanly.

---
