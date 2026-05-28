import { useMemo } from 'react';
import styles from './IntroStarfield.module.css';

const STAR_COUNT = 140;

function mulberry32(seed: number) {
  return () => {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function IntroStarfield() {
  const stars = useMemo(() => {
    const random = mulberry32(42);
    return Array.from({ length: STAR_COUNT }, (_, id) => ({
      id,
      left: random() * 100,
      top: random() * 100,
      size: random() > 0.88 ? 2 : 1,
      opacity: 0.25 + random() * 0.75,
      twinkleDelay: random() * 4,
    }));
  }, []);

  return (
    <div className={styles.starfield} aria-hidden="true">
      <div className={styles.nebula} />
      {stars.map((star) => (
        <span
          key={star.id}
          className={styles.star}
          style={{
            left: `${star.left}%`,
            top: `${star.top}%`,
            width: star.size,
            height: star.size,
            opacity: star.opacity,
            animationDelay: `${star.twinkleDelay}s`,
          }}
        />
      ))}
    </div>
  );
}
