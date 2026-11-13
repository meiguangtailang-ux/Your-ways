import { describe, expect, it } from 'vitest';
import type { ChapterData } from '../bible/types';
import { buildChapterContext, buildSelectionNote } from './prompt';

const chapter: ChapterData = {
  blocks: [
    { kind: 't', segs: [{ v: 0, text: 'ダビデの｜歌《うた》' }] },
    {
      kind: 'l',
      stanza: true,
      segs: [{ v: 1, text: '｜主《しゅ》はわたしの｜牧者《ぼくしゃ》であって、' }],
    },
    { kind: 'l', segs: [{ v: 1, text: 'わたしには｜乏《とぼ》しいことがない。' }] },
    { kind: 'p', segs: [{ v: 2, label: '2-3', text: '二節と三節。' }] },
  ],
};

describe('buildChapterContext', () => {
  const context = buildChapterContext({ book: 'psa', chapter: 23, verses: [1] }, chapter);

  it('章の名前を伝える', () => {
    expect(context).toContain('「詩篇 23篇」');
  });

  it('節番号つきで、ふりがなを外し、行をまたぐ節をつなげて渡す', () => {
    expect(context).toContain(
      [
        '（表題） ダビデの歌',
        '1 主はわたしの牧者であって、わたしには乏しいことがない。',
        '2-3 二節と三節。',
      ].join('\n'),
    );
  });

  it('選んだ節が違っても、章の本文は同じ文になる（キャッシュが効くように）', () => {
    expect(buildChapterContext({ book: 'psa', chapter: 23, verses: [2] }, chapter)).toBe(context);
  });
});

describe('buildSelectionNote', () => {
  it('選んだ節を知らせる。節を選んでいなければ何も足さない', () => {
    expect(buildSelectionNote({ book: 'jhn', chapter: 3, verses: [16, 17] })).toContain(
      'ヨハネによる福音書 3:16-17',
    );
    expect(buildSelectionNote({ book: 'jhn', chapter: 3, verses: [] })).toBeUndefined();
  });
});
