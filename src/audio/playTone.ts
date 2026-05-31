/** Play a short tone via Web Audio API. No-op if audio is unavailable. */
export function playTone(
  frequency: number,
  durationMs: number,
  type: OscillatorType = 'sine',
): void {
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = type;
    osc.frequency.value = frequency;
    const durationSec = durationMs / 1000;
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + durationSec);
    osc.start();
    osc.stop(ctx.currentTime + durationSec);
  } catch {
    // audio unavailable
  }
}
