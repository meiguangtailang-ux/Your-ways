import { describe, expect, it } from 'vitest';
import { castMotion, lineReveal } from './castMotion';

describe('castMotion', () => {
  it('歩く人は左から来て、自分の場所で止まる', () => {
    expect(castMotion('walk', 0, 0, 0).dx).toBeLessThan(-100);
    expect(castMotion('walk', 5, 5, 0).dx).toBe(-0);
  });

  it('右側に立つ人は、右の端から歩いてくる', () => {
    expect(castMotion('walk', 0, 0, 0, 1).dx).toBeGreaterThan(100);
  });

  it('走る人は、歩く人より速く着く', () => {
    expect(castMotion('run', 1.3, 1.3, 0).dx).toBe(-0);
    expect(castMotion('walk', 1.3, 1.3, 0).dx).toBeLessThan(0);
  });

  it('話す人は口を開け閉めし、吹き出しが出る', () => {
    const mouths = new Set(
      Array.from({ length: 40 }, (_, k) => castMotion('speak', k * 0.05, k * 0.05, 0).mouthOpen),
    );
    expect(mouths).toEqual(new Set([true, false]));
    expect(castMotion('speak', 0, 0, 0).effect).toBe('bubble');
  });

  it('眠る人は横になる', () => {
    expect(castMotion('sleep', 0, 0, 0).rotate).toBeCloseTo(-Math.PI / 2);
  });

  it('ひざまずく人は、低く小さくなる', () => {
    const motion = castMotion('kneel', 0, 0, 0);
    expect(motion.dy).toBeGreaterThan(0);
    expect(motion.scaleY).toBeLessThan(1);
  });
});

describe('lineReveal', () => {
  it('行を上から順に出し、場面の7割までに出し終える', () => {
    expect(lineReveal(0, 3, 0, 10)).toBe(0);
    expect(lineReveal(0, 3, 1, 10)).toBeGreaterThan(0);
    expect(lineReveal(2, 3, 1, 10)).toBe(0);
    expect(lineReveal(2, 3, 7.5, 10)).toBe(1);
  });
});
