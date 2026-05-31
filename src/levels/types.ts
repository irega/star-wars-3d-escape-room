import type { Room } from '../stores/useGameStore';
import type { InventoryItem } from '../stores/useInventoryStore';

/** Snapshot of game state needed to evaluate puzzle exit / win conditions. */
export interface LevelContext {
  solvedPuzzles: number[];
  hasItem: (item: InventoryItem) => boolean;
}

export type ExitCondition = (ctx: LevelContext) => boolean;

export interface LevelDefinition {
  puzzleId: number;
  hintDelays: number[];
  /** i18n key shown when the exit door is locked. */
  lockedDialogueKey: string;
  /** Room to move to when exit condition passes. Omit for final/win rooms. */
  nextRoom?: Room;
  canExit: ExitCondition;
}

export function evaluateExitCondition(condition: ExitCondition, ctx: LevelContext): boolean {
  return condition(ctx);
}

export function isPuzzleSolved(ctx: LevelContext, puzzleId: number): boolean {
  return ctx.solvedPuzzles.includes(puzzleId);
}
