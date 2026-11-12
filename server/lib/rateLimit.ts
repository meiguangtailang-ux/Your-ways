/**
 * 回数制限（一定時間あたりの上限）。
 * サーバー1台のメモリ上で数えるだけの簡単なもの。複数台に増やすときは共有の保存先に替える。
 */
export interface RateLimiter {
  /** 1回分を数える。上限を超えていたら false */
  take(key: string): boolean;
}

export function createRateLimiter(options: { windowMs: number; max: number }): RateLimiter {
  const windows = new Map<string, { startedAt: number; count: number }>();

  return {
    take(key) {
      const now = Date.now();
      const current = windows.get(key);
      if (!current || now - current.startedAt >= options.windowMs) {
        // 期限の切れた記録がたまり続けないよう、ついでに掃除する
        for (const [otherKey, window] of windows) {
          if (now - window.startedAt >= options.windowMs) windows.delete(otherKey);
        }
        windows.set(key, { startedAt: now, count: 1 });
        return true;
      }
      current.count += 1;
      return current.count <= options.max;
    },
  };
}
