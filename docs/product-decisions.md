# Product Decisions

> Chronological record of product and UX decisions made from project start to ship, with rationale and any alternatives that were considered and rejected.

---

## Planning Phase

### Game concept and setting

**Decision:** "Escape from Detention Block AA-23" — player wakes up in an Imperial detention cell aboard the Death Star, partial power failure, 4 puzzles to escape before the station is destroyed.

**Why:** The Death Star detention block is an iconic Star Wars location that naturally maps to an escape room genre. A power failure provides an in-world justification for why doors are locked and systems need resetting, making all four puzzles feel coherent rather than arbitrary.

**Alternatives considered:** Other Star Wars settings (Mos Eisley cantina, Jedi Temple, rebel base) were discarded because the detention cell is the most self-contained, single-player scenario with clear stakes and a well-understood goal.

---

### Puzzle archetypes

**Decision:** One puzzle per archetype — Observation (loose panel), Logic (Aurebesh sequence), Interaction (power conduit), Combination (launch clearance) — each gating progress to the next room.

**Why:** The challenge spec defines exactly four archetypes. Assigning one per room keeps each puzzle distinct and ensures the combination puzzle in the final room can pull meaningful artifacts from the three earlier puzzles (keycard, override code, frequency), creating a satisfying payoff.

---

### Tech stack: React + TypeScript + React Three Fiber

**Decision:** React + TypeScript as the primary UI layer, React Three Fiber (R3F) + `@react-three/drei` for 3D.

**Why:** The developer's primary stack is React. R3F has no performance overhead versus raw Three.js and has the largest React+3D community and best documentation. TypeScript prevents runtime regressions without meaningful build cost.

**Alternatives rejected:**
- `react-babylonjs` — smaller community, weaker docs.
- `A-Frame + React` — unmaintained React bindings, WebXR-focused (overkill for a flat desktop game).

---

### State management: Zustand over Context + useReducer

**Decision:** Zustand with selector-based subscriptions for all cross-scene state (progression, inventory, hints).

**Why:** `useReducer` + Context is a natural fit for state-machine transitions but re-renders the full provider subtree on every dispatch. In a 3D scene that means frame drops. Zustand state lives outside the React tree; the game loop can call `getState()`/`setState()` without triggering renders, and consumers subscribe only to the slice they need.

**Rule established:** data that crosses scenes → Zustand store; data that lives and dies within a single scene (animation state, drag position, terminal input) → local `useState`.

---

### No backend, no persistence

**Decision:** Fully client-side. No server, no `localStorage`, no session persistence.

**Why:**
- Time budget and deployment simplicity — a static Vite build deployed to Vercel with zero backend infrastructure.
- Target session length is ~10 minutes; restart-on-close is acceptable. Adding `localStorage` sync introduces stale-state handling, schema migration, and partial-save edge cases that don't justify themselves for a short game.

**Out of scope with documented rationale:** multiplayer, leaderboards, user accounts, cross-session save state.

---

### Desktop-only (no mobile)

**Decision:** Target desktop browser only; mobile/touch explicitly out of scope.

**Why:** The challenge spec scopes to desktop. Puzzle 3 (drag-and-drop power cells with orientation) is a fundamentally different interaction model on touch — supporting it would require a parallel input system that doubles implementation scope.

---

### CSS Modules for HTML overlays

**Decision:** CSS Modules for HUD, Dialogue, Loading, and Victory components.

**Why:** Zero-config with Vite, scoped styles, and zero additional dependencies. Keeps styling for the HTML overlay layer simple while the 3D layer uses inline R3F materials.

---

### Internationalization: EN + ES

**Decision:** `react-i18next` with English default and Spanish as a second locale, auto-detected from the browser.

**Why:** The project context includes offices in both regions. The game's text surface is small (hints, dialogue, HUD labels, victory screen), so adding Spanish costs very little and is a clear differentiator. `react-i18next` is the standard React i18n library with browser detection built in.

---

### Accessibility: pragmatic scope

**Decision:** In-scope — keyboard navigation (Tab/Enter/Escape), color-blind-safe puzzles (color + shape redundancy, never color alone), WCAG contrast on all HTML text, `aria-live` region for key events.

**Why WebGL limits full WCAG AA:** The 3D canvas is opaque to screen readers — it's a bitmap, not a DOM tree. Full screen reader support or audio descriptions of each scene are not realistic for a 3D WebGL game within scope and time constraints.

---

### Performance: automatic quality degradation

**Decision:** `<PerformanceMonitor>` from drei — automatically switches between High (bloom, contact shadows, full dpr) and Low (no post-processing, no shadows, `dpr=0.75`) tiers below ~30 fps. No manual settings UI.

**Why:** Eliminates the need for a settings menu while still protecting players on lower-spec hardware. The degradation is invisible to the player unless they're watching the dev tools.

---

### Testing strategy: three layers

**Decision:**
- **Vitest** for pure logic (Zustand stores, puzzle validation functions) — no 3D dependency.
- **RTL** for HTML overlay components (HUD, Dialogue, Victory, Loading) — standard React testing.
- **Playwright** for E2E happy-path — clicks canvas coordinates since WebGL has no DOM.

**Why:** WebGL does not render in jsdom, so RTL cannot test 3D scenes. `@react-three/test-renderer` was evaluated and rejected as too immature. Extracting pure puzzle logic into plain TypeScript functions (e.g., `validateSequence`, `canExitDetentionCell`) makes the business rules fully testable without any 3D dependency.

---

### CI/CD: GitHub Actions + Vercel

**Decision:** GitHub Actions as the single CI orchestrator (lint → format check → test → build on every PR). Vercel for deployment only (preview on PRs, production on `main`). Post-deploy Playwright E2E runs against the Vercel preview URL.

**Why:** Free tier covers the project's needs. Preview deploys per PR enable the QA agent and manual testing against the live build. Keeping deployment separate from CI keeps each tool doing one job.

---

### Agent automation: GitHub-native workflow

**Decision:** Dev agent triggers from GitHub issues labeled `approved` (no Claude Routines). Human reviews and merges all PRs. QA findings require human `approved` label before the dev agent picks them up.

**Why:** Full automation without human-in-the-loop risks spurious issue creation and unreviewed merges. The `approved` gate means the agent does real work only on validated, scoped issues.

---

### Player identity: optional name input

**Decision:** Optional player name at game start, defaults to "Rebel". Used only on the victory screen.

**Why:** Adds personalization with zero complexity — one string in `useGameStore`. Naming the player "Rebel" by default is narratively coherent and requires no prompt.

---

## Implementation Phase

### Puzzle 3 fallback: click-to-select instead of 3D drag-and-drop

**Decision:** Click a cell to select it, click the same cell again to rotate orientation, click a conduit slot to place it. Full 3D drag-and-drop with orientation was dropped as the primary mechanic.

**Why:** The tech design noted this risk upfront: 3D drag-and-drop with orientation requires tracking pointer deltas in world space, testing across mouse and trackpad, and handling gimbal lock — a non-trivial implementation surface. The click-select-rotate-place pattern gives players the same expressive control with far simpler code and no pointer-capture edge cases.

---

### Intro screen added post-scaffolding

**Decision:** Added a dedicated intro screen (`'intro'` game phase) after the core gameplay was in place.

**Why:** Without context, a player landing directly in a dark 3D room has no idea what they're doing. The intro provides three sentences of story context (Rebel operative captured, power failure, 4 puzzles to escape), a player name field, and a "Begin Mission" button. Adding it as a distinct `GamePhase` state meant no other game logic needed to change.

---

### Star Wars opening crawl + ambient music

**Decision:** Added a Star Wars–style intro sequence (starfield, "A long time ago…" card, perspective text crawl) and looped Imperial March during gameplay.

**Constraint:** `public/audio/imperial-march.mp3` is gitignored due to copyright. The deploy is silent without it; the file must be added locally.

**Why:** The crawl immediately establishes the Star Wars tone and gives the player a moment to orient before the 3D scene loads. Music starts only on explicit user gesture (the "Play Intro" button) to comply with browser autoplay restrictions.

---

### Aurebesh guidance added to hints

**Decision:** Puzzle 2 hint 1 now introduces Aurebesh as "the Star Wars writing system" and suggests looking it up. Hint 2 explains that each symbol has a name and the code uses the first letter, read left to right.

**Why:** Playtesting surfaced that players unfamiliar with Star Wars lore had no in-world way to decode the holographic symbols. The existing hint escalation gave partial answers but never explained _what_ the symbols were. Adding Aurebesh context satisfies the "player should never need to read source code" hard requirement without handing over the full answer.

---

### Centralized hint triggers

**Decision:** Extracted a single `RoomHintTriggers` component rendered at the top level of `App.tsx` (outside the R3F Canvas), replacing scattered `HintTrigger` instances inside individual scene components.

**Why:** Hint timers inside R3F scenes share the Canvas lifecycle — when a scene unmounts or re-renders, timers reset. Moving hint management to a DOM-based component that lives above the Canvas gives reliable, frame-independent timing.

---

### Distinct Aurebesh symbol renderings

**Decision:** Each of the four Control Room screens (A/U/R/E) renders a unique bar-composition geometry rather than identical placeholder bars.

**Why:** The original implementation drew the same two bars on all four screens, making the puzzle literally unsolvable — players had no visual differentiation to read. Each symbol now uses a unique box-bar composition (top horizontal + crossbar for A; double vertical + bottom for U; etc.) to approximate the actual Aurebesh letterforms with simple Three.js geometry.

---

### Control room terminal as a DOM overlay, not R3F Html

**Decision:** The terminal input UI renders as a fixed CSS overlay (`ControlRoomTerminal`) from `App.tsx`, not as a `drei Html` component inside the Canvas.

**Why:** `Html` fullscreen in R3F caused the overlay to appear in z-index competition with the 3D scene and occasionally triggered black-screen flashes when the panel geometry overlapped the door. A plain DOM overlay sits cleanly above the Canvas, simplifies event handling (keyboard `keydown` listeners on `window`), and removes the Three.js raycasting layer from the input path entirely.

---

### Launch frequency unified to 1138

**Decision:** The frequency number visible in the Corridor (droid schematic) and required on the Hangar Bay launch console is `1138`.

**Why:** During initial implementation two different values (47 and 1138) existed in separate modules with no shared constant. A player who noted the corridor frequency (47) would fail to match it at the console (1138). The fix introduced a shared `LAUNCH_FREQUENCY` constant and chose 1138 — a reference to the 1971 George Lucas film _THX 1138_, a Star Wars universe Easter egg.

---

### Visual polish: multiple passes on lighting and scene colors

**Decision:** Ambient light levels were raised, point light intensities increased, and each room was given a distinct accent palette after an initial pass left all rooms nearly indistinguishable dark-blue/black.

**Key iterations:**
1. First pass: ambient 0.15–0.25, very dark — all rooms look identical.
2. Second pass (#53): ambient raised to 0.35–0.5, room-specific accent colors (cold blue for detention, screen-lit for control room, industrial for corridor, red emergency for hangar).
3. Third pass (#61): shared `ImperialLighting` component, ACES tone mapping, `ContactShadows`, brighter hologram screens, reduced droid emissive to stop it overpowering the corridor scene.

**Why:** 3D scenes that look correct in development often read as flat and dark in a browser with a typical monitor. Iterating on lighting in response to actual screenshots (rather than previewing values abstractly) is the reliable method.

---

### Damaged astromech droid rebuilt

**Decision:** The corridor droid was rebuilt from a stack of boxes into a `DamagedAstromechDroid` component — cylinder body, hemisphere dome, neck ring, vent slats, three-leg stance, damaged arm, holoprojector.

**Why:** The original box-stack was illegible as a droid and sat directly on top of Power Cell 1, making both objects hard to interact with. The rebuilt component uses Y-positions derived from body/neck height so the dome stays geometrically centered, and a local point light makes it visible without washing out the corridor scene.

---

### Dialogue clears on room transition

**Decision:** Dialogue state stores `{ text, room }` instead of just `text`. If `dialogueEntry.room !== currentRoom`, the dialogue is treated as `null` with no effect needed — it disappears in the same render cycle as the room change.

**Why:** The initial implementation stored dialogue as a plain string, so messages from one room persisted visibly when the player walked into the next. Deriving visibility from the stored room tag rather than tracking transitions separately avoids race conditions and requires no cleanup code.

---

### Power cells can be extracted from conduit slots

**Decision:** Clicking an occupied conduit slot with no cell currently selected returns the cell to the world, allowing repositioning or re-rotation.

**Why:** Without extraction, placing a cell in the wrong slot permanently locked it there. Players who placed cells in the wrong order or orientation had no recovery path and were stuck until they restarted. Extraction makes the puzzle forgiving without giving anything away.

---

### HUD shows current room name

**Decision:** Added a "Location" panel alongside the inventory in the HUD.

**Why:** In a four-room linear sequence, knowing which room you're in reduces disorientation, especially after transitions that don't include a scene title card. The location label is pulled from i18n (`hud.rooms.*`) so it works in both EN and ES.

---

### Enter key submits player name

**Decision:** Pressing Enter in the player name input starts the mission, equivalent to clicking "Begin Mission".

**Why:** The default affordance for a name field is to submit on Enter. Without it, players who typed a name and pressed Enter were surprised nothing happened and had to reach for the mouse.

---

### Escape key and overlay click close the dialogue

**Decision:** Pressing Escape or clicking outside the dialogue box dismisses it, in addition to the close button.

**Why:** Both are standard web UX conventions for modal dialogs. Players were clicking outside the box expecting it to close and nothing happening, which felt like a bug.

---

### Inventory panel min-height fixed

**Decision:** `.inventoryList` received `min-height` matching the location panel's line height, so both HUD sections are the same height even when inventory is empty.

**Why:** At game start the inventory is empty and the inventory panel was shorter than the location panel, creating a lopsided layout. The CSS fix ensures visual consistency from the first frame.

---

## Security Phase

### HTTP security headers

**Decision:** Added `Content-Security-Policy`, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, and `Referrer-Policy` to `vercel.json`.

**Why:** The security audit (Phase 6) found no code-level vulnerabilities — no `dangerouslySetInnerHTML`, no `eval()`, no secrets in source, zero `npm audit` findings. The missing headers were the only Medium finding. Adding them at the CDN/edge layer (Vercel) costs nothing at runtime and closes the clickjacking and MIME-sniffing attack surfaces.

**Trade-off accepted:** `style-src` includes `'unsafe-inline'` because the existing inline `<style>` reset in `index.html` requires it. Removing the inline style was out of scope; the risk is low (inline styles cannot exfiltrate data).

---

### `i18next escapeValue: false` accepted

**Decision:** No code change for `escapeValue: false` in the i18next config.

**Why:** The audit flagged this as a Low finding. React renders all interpolated values as text nodes, not HTML — React itself is the escaping layer. The `escapeValue: false` setting is the documented standard pattern for `react-i18next`. Player name is capped at 30 characters and rendered only as a text node on the victory screen with no HTML injection path.

---

### Audio file not committed

**Decision:** `public/audio/imperial-march.mp3` is gitignored. The deploy is silent without it; developers add it locally.

**Why:** The Imperial March is copyrighted material. Including it in a public repository would be an IP violation. The audio system functions correctly without the file (looped `HTMLAudioElement` with a try/catch guard); the UX degrades gracefully to silence.

---

## Automation and GitHub

### Bot push identity: Claude App commit signing over PAT

**Decision:** Agent workflows use `use_commit_signing: true` on `anthropics/claude-code-action` so pushes appear as `claude[bot]`, not the PAT owner.

**Why:** The initial approach used a `BOT_PAT` (fine-grained personal access token) to trigger CI on agent pushes. This worked but commits appeared as the PAT owner (a human), muddying the git history and attribution. OIDC-signed commits via the Claude App appear as `claude[bot]`, which is accurate and doesn't require storing a PAT secret.

**Intermediate state:** A `workflow_dispatch` CI trigger was used briefly between the PAT approach and commit signing, but it attached checks to the branch run rather than the PR, so required checks on the PR never showed green. Commit signing resolved this cleanly.

---

### E2E canvas coordinates via perspective projection math

**Decision:** Playwright tests derive canvas click coordinates by projecting 3D world positions through the camera's perspective transform rather than using arbitrary pixel offsets.

**Why:** WebGL objects have no DOM nodes — Playwright can only click pixel coordinates on the canvas element. Reverse-projecting world positions through the known camera parameters (position, FOV, viewport size, tilt) produces stable coordinates that remain valid as long as the camera and object positions don't change, and the math is auditable rather than guessed.

---

### `window.__stores` for E2E state seeding (DEV only)

**Decision:** In development builds, Zustand stores are exposed on `window.__stores`, allowing Playwright tests to call `page.evaluate()` to seed game state without traversing unimplemented scenes.

**Why:** The happy-path E2E test needs to reach the Hangar Bay (scene 4), but writing a test that plays through all three earlier puzzles makes the E2E suite fragile to changes in earlier scenes and slow to run. State seeding lets tests enter any room directly. The exposure is guarded by `import.meta.env.DEV` so it never ships to production.
