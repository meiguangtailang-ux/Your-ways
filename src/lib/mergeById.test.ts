import { describe, expect, it } from 'vitest';
import { mergeById, newestFirst } from './mergeById';

describe('mergeById', () => {
  it('同じ id のものは足さず、いまある方を残す', () => {
    const { merged, added } = mergeById(
      [{ id: 'a', body: 'いまの内容' }],
      [
        { id: 'a', body: '別の内容' },
        { id: 'b', body: '新しい' },
        { id: 'b', body: '重複' },
      ],
    );
    expect(merged).toEqual([
      { id: 'a', body: 'いまの内容' },
      { id: 'b', body: '新しい' },
    ]);
    expect(added).toBe(1);
  });
});

describe('newestFirst', () => {
  it('新しいものを先に並べる', () => {
    const items = [
      { createdAt: '2026-01-01' },
      { createdAt: '2026-03-01' },
      { createdAt: '2026-02-01' },
    ];
    expect(newestFirst(items).map((item) => item.createdAt)).toEqual([
      '2026-03-01',
      '2026-02-01',
      '2026-01-01',
    ]);
  });
});
