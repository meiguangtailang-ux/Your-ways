import { describe, expect, it } from 'vitest';
import type { ChapterData } from '@shared/bible';
import { layoutChapter } from './chapterLayout';

const chapter: ChapterData = {
  blocks: [
    { kind: 't', segs: [{ v: 0, text: '表題' }] },
    { kind: 'l', stanza: true, segs: [{ v: 1, text: '一節の前半、' }] },
    { kind: 'l', segs: [{ v: 1, text: '一節の後半。' }] },
    { kind: 'l', stanza: true, segs: [{ v: 2, text: '二節。' }] },
    {
      kind: 'p',
      segs: [
        { v: 3, label: '3b', text: '三節の後半。' },
        { v: 4, text: '四節。' },
        { v: 3, label: '3a', text: '三節の前半。' },
      ],
    },
  ],
};

describe('layoutChapter', () => {
  const groups = layoutChapter(chapter);

  it('詩の行を連ごとにまとめ、段落と表題はそのまま並べる', () => {
    expect(groups.map((group) => group.type)).toEqual(['title', 'stanza', 'stanza', 'paragraph']);
    const [, first, second] = groups;
    expect(first?.type === 'stanza' && first.lines.length).toBe(2);
    expect(second?.type === 'stanza' && second.lines.length).toBe(1);
  });

  it('節番号は、その節が最初に現れる箇所にだけ出す', () => {
    const stanza = groups[1];
    if (stanza?.type !== 'stanza') throw new Error('連ではない');
    expect(stanza.lines.map((line) => line.segs[0]?.showNumber)).toEqual([true, false]);
  });

  it('同じ節でもラベルが違えば（3b と 3a）それぞれに番号を出す', () => {
    const paragraph = groups[3];
    if (paragraph?.type !== 'paragraph') throw new Error('段落ではない');
    expect(paragraph.segs.map((placed) => placed.showNumber)).toEqual([true, true, true]);
  });

  it('メモやしおりの印は、節の最後のかたまりにだけ置く', () => {
    const stanza = groups[1];
    const paragraph = groups[3];
    if (stanza?.type !== 'stanza' || paragraph?.type !== 'paragraph') throw new Error('形が違う');
    expect(stanza.lines.map((line) => line.segs[0]?.endsVerse)).toEqual([false, true]);
    expect(paragraph.segs.map((placed) => placed.endsVerse)).toEqual([false, true, true]);
  });

  it('表題には節番号を出さない', () => {
    const title = groups[0];
    if (title?.type !== 'title') throw new Error('表題ではない');
    expect(title.segs[0]?.showNumber).toBe(false);
  });
});
