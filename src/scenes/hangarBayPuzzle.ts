export { LAUNCH_FREQUENCY } from './launchFrequency';

export const PUZZLE_4_ID = 4;

export const PUZZLE_4_HINT_DELAYS: number[] = [25_000, 60_000, 120_000];

export function validateLaunchClearance(
  hasKeycard: boolean,
  hasOverrideCode: boolean,
  hasFrequency: boolean,
): boolean {
  return hasKeycard && hasOverrideCode && hasFrequency;
}
