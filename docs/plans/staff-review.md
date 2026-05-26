# Staff Review — Plan v2

**Verdict:** YES

**Overview:** Solid design for a time-boxed take-home challenge. The iterative challenge process has produced well-reasoned trade-offs across the board — tech stack, state management, performance, testing, and CI/CD are all justified with clear rationale. The plan is ready to build, with a few areas worth tightening before writing code.

## Strengths

- **Trade-offs are explicit and honest throughout.** Zustand vs useReducer+Context is argued on re-render cost, not preference. Accessibility acknowledges what's realistic for WebGL vs what's aspirational. Testing strategy correctly identifies the 3D/HTML boundary as the dividing line for tooling.
- **Scope is well-controlled.** No backend, no persistence, no multiplayer — each exclusion is justified with rationale.
- **CI/CD as Phase 1 guardrails** is the right call. The project has parallel agents and trunk-based flow, so guardrails from day 1 prevent drift.
- **QA agent workflow with human gate** (`bug` → `approved` → agent pickup) is a pragmatic token-budget control. The separation between deterministic CI tests and exploratory QA is clean.
- **Trunk-based development** is the right model for a solo developer with agents — long-lived branches would create merge hell with no one to resolve conflicts.

## Growth Areas

- **Player name / identity:** The victory screen says... what? "You escaped"? Consider whether a name input (even optional, with default "Rebel") improves the win moment for minimal cost.
- **Game state persistence:** Plan says in-memory only but without explicit rationale. Worth stating: if a player accidentally closes the tab mid-puzzle, they restart from scratch. For a ~10min game, probably acceptable — but say so.
- **Responsive UI / mobile:** Not mentioned. A 3D canvas resizing to mobile is non-trivial — does the game work on mobile at all? Touch events for drag-and-drop (Puzzle 3) are different from mouse. Either scope it in or explicitly scope it out with rationale.
- **Error/loading states are absent.** What does the user see while assets load? What if a texture fails to fetch? R3F's `<Suspense>` + drei's `<Loader>` are trivial to add, but they need to be in the plan — otherwise Phase 4 agents will each solve it differently.
- **Audio is mentioned once** (Puzzle 1 hint beep) but there's no audio section. Ambient sounds, SFX, music — in scope or out? If in, it needs a plan (howler.js? Web Audio API? drei's `useAudioListener`?). If out, say so — a Star Wars escape room with zero audio will feel flat.

## Risks

- **Playwright e2e on canvas coordinates is brittle.** The plan acknowledges this ("fragile and slow by nature") but the happy-path test depends on clicking precise canvas positions for 4 puzzles. Any geometry change breaks the test. Consider adding `data-testid` or named objects that Playwright can target via accessibility tree, or accept that e2e will need frequent coordinate updates and budget time for it.
- **Puzzle 3 drag-and-drop in 3D is the hardest interaction.** Dragging objects in 3D space with correct orientation + snapping is significantly more complex than click-to-interact. This is the most likely Phase 4 branch to blow its time budget. Consider a fallback: click-to-place instead of drag if drag proves too complex.
- **Post-deploy e2e via `deployment_status` event** requires Vercel's GitHub integration to emit the event correctly and the preview URL to be extractable. This integration can be finicky — validate it works in Phase 1 before depending on it.

## Questions to Probe Deeper

- **What's the target session length?** If it's ~10 minutes, no persistence is fine. If puzzles are hard enough to take 30+, accidental tab close becomes painful. This drives the localStorage decision.
- **Mobile: in or out?** Touch drag in 3D is a different problem than mouse drag. If mobile is in scope, Puzzle 3 needs a touch-friendly interaction model. If out, add it to the out-of-scope list.
- **What happens when a player is stuck on Puzzle 2 (Aurebesh sequence)?** The hint says "read screens left to right" — but if the player doesn't understand Aurebesh at all, do they get a stronger hint or are they stuck? The hint escalation cadence (30s, 60s, etc.) needs a terminal hint that practically gives the answer, or the "winnable" requirement is at risk.
- **Victory screen content:** What does the player see? "You escaped" + time? A Star Wars crawl? This is the emotional payoff of the whole game — worth a sentence in the plan.
