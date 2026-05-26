# Challenge Spec — Crossmint Engineering Challenge

Source of truth for requirements. Consult before every design decision.

## Hard Requirements

- Runs in **desktop browser**, no installation
- Exactly **4 distinct puzzles**, each gating progress to next
- Player can **win** (reach end state)
- **In-world hints** — player should never need to read source code
- **Public GitHub repo** + **live deployed link** (both required)

## Puzzle Archetypes (use/mix/ignore freely)

1. **Observation** — notice something in environment, act on it
2. **Logic** — discover sequence/pattern/rule, apply it
3. **Interaction** — manipulate objects to trigger change
4. **Combination** — clues from earlier puzzles unlock final door

Puzzles don't need to be hard. Need to be: clear, intentional, solvable.

## Evaluation Criteria

- **Product**: playable, coherent, works
- **Code**: properly architected, not AI slop, another dev can pick it up
- **Approach**: smart trade-offs under constraints, creative

## README Must Include

- How to run locally
- Relevant design decisions
- How AI was used: what was delegated, what was kept, where it helped/fell short

## Non-Requirements

- Mobile support not required
- Photorealism not required — simple geometry OK
- No strict tech stack — language/framework agnostic
