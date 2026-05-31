export const IMPERIAL_MARCH_SRC = '/audio/imperial-march.mp3';

const DEFAULT_VOLUME = 0.35;

let audio: HTMLAudioElement | null = null;
let muted = false;

export function startAmbientMusic(): void {
  if (typeof window === 'undefined') return;

  if (!audio) {
    audio = new Audio(IMPERIAL_MARCH_SRC);
    audio.loop = true;
    audio.volume = muted ? 0 : DEFAULT_VOLUME;
    audio.preload = 'auto';
  }

  if (audio.paused) {
    void audio.play().catch(() => {
      // Missing file, autoplay blocked, or unsupported format
    });
  }
}

export function stopAmbientMusic(): void {
  if (!audio) return;
  audio.pause();
  audio.currentTime = 0;
}

export function toggleAmbientMute(): boolean {
  muted = !muted;
  if (audio) {
    audio.volume = muted ? 0 : DEFAULT_VOLUME;
  }
  return muted;
}

export function isAmbientMuted(): boolean {
  return muted;
}

/** Clears player state (e.g. replay, tests). */
export function resetAmbientMusic(): void {
  if (audio) {
    audio.pause();
    audio.src = '';
    audio = null;
  }
  muted = false;
}
