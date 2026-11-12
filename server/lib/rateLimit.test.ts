import { afterEach, describe, expect, it, vi } from 'vitest';
import { createRateLimiter } from './rateLimit';

describe('createRateLimiter', () => {
  afterEach(() => vi.useRealTimers());

  it('上限までは通し、超えたら止める', () => {
    const limiter = createRateLimiter({ windowMs: 1000, max: 2 });
    expect(limiter.take('a')).toBe(true);
    expect(limiter.take('a')).toBe(true);
    expect(limiter.take('a')).toBe(false);
  });

  it('相手ごとに別々に数える', () => {
    const limiter = createRateLimiter({ windowMs: 1000, max: 1 });
    expect(limiter.take('a')).toBe(true);
    expect(limiter.take('b')).toBe(true);
    expect(limiter.take('a')).toBe(false);
  });

  it('時間が過ぎたら、また通す', () => {
    vi.useFakeTimers();
    const limiter = createRateLimiter({ windowMs: 1000, max: 1 });
    expect(limiter.take('a')).toBe(true);
    expect(limiter.take('a')).toBe(false);
    vi.advanceTimersByTime(1000);
    expect(limiter.take('a')).toBe(true);
  });
});
