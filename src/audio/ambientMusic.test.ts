import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  isAmbientMuted,
  resetAmbientMusic,
  startAmbientMusic,
  stopAmbientMusic,
  toggleAmbientMute,
} from './ambientMusic';

describe('ambientMusic', () => {
  let playMock: ReturnType<typeof vi.fn>;
  let pauseMock: ReturnType<typeof vi.fn>;
  let lastAudio: {
    loop: boolean;
    volume: number;
    src: string;
    paused: boolean;
    currentTime: number;
    play: ReturnType<typeof vi.fn>;
    pause: ReturnType<typeof vi.fn>;
  } | null;

  beforeEach(() => {
    playMock = vi.fn().mockResolvedValue(undefined);
    pauseMock = vi.fn();
    lastAudio = null;

    vi.stubGlobal(
      'Audio',
      vi.fn(function MockAudio(this: typeof lastAudio, src: string) {
        const element = {
          loop: false,
          volume: 1,
          src,
          paused: true,
          currentTime: 0,
          play: () => {
            element.paused = false;
            return playMock();
          },
          pause: () => {
            element.paused = true;
            pauseMock();
          },
        };
        lastAudio = element;
        return lastAudio;
      }),
    );

    resetAmbientMusic();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    resetAmbientMusic();
  });

  it('starts looped imperial march after user gesture', () => {
    startAmbientMusic();

    expect(lastAudio?.src).toBe('/audio/imperial-march.mp3');
    expect(lastAudio?.loop).toBe(true);
    expect(playMock).toHaveBeenCalled();
  });

  it('does not create a second Audio element when already playing', () => {
    const AudioCtor = globalThis.Audio as ReturnType<typeof vi.fn>;
    startAmbientMusic();
    startAmbientMusic();

    expect(AudioCtor).toHaveBeenCalledTimes(1);
    expect(playMock).toHaveBeenCalledTimes(1);
  });

  it('stops and resets playback position', () => {
    startAmbientMusic();
    lastAudio!.paused = false;

    stopAmbientMusic();

    expect(pauseMock).toHaveBeenCalled();
    expect(lastAudio?.currentTime).toBe(0);
  });

  it('toggles mute without stopping playback', () => {
    startAmbientMusic();

    expect(isAmbientMuted()).toBe(false);
    expect(toggleAmbientMute()).toBe(true);
    expect(lastAudio?.volume).toBe(0);
    expect(toggleAmbientMute()).toBe(false);
    expect(lastAudio?.volume).toBeGreaterThan(0);
  });
});
