import { describe, expect, it } from 'vitest';
import { getVerseText, listVerses, parseRuby, quotePassage, stripRuby, truncate } from './text';
import type { ChapterData } from './types';

/** 詩の行をまたぐ節（1節）と、段落の中の節（2・4節）を持つ見本 */
const chapter: ChapterData = {
  blocks: [
    { kind: 't', segs: [{ v: 0, text: 'ダビデの｜歌《うた》' }] },
    {
      kind: 'l',
      stanza: true,
      segs: [{ v: 1, text: '｜主《しゅ》はわたしの｜牧者《ぼくしゃ》であって、' }],
    },
    { kind: 'l', segs: [{ v: 1, text: 'わたしには｜乏《とぼ》しいことがない。' }] },
    {
      kind: 'p',
      segs: [
        { v: 2, text: '二節。' },
        { v: 4, label: '4-5', text: '四節と五節。' },
      ],
    },
  ],
};

describe('parseRuby / stripRuby', () => {
  it('地の文とふりがなに分ける', () => {
    expect(parseRuby('はじめに｜神《かみ》は')).toEqual([
      'はじめに',
      { base: '神', reading: 'かみ' },
      'は',
    ]);
  });

  it('ふりがなを取り除く', () => {
    expect(stripRuby('｜天《てん》と｜地《ち》とを')).toBe('天と地とを');
  });
});

describe('章から節を取り出す', () => {
  it('節番号の一覧に表題（0）は含めない', () => {
    expect(listVerses(chapter)).toEqual([1, 2, 4]);
  });

  it('行をまたぐ節はつなげる', () => {
    expect(getVerseText(chapter, 1)).toBe('主はわたしの牧者であって、わたしには乏しいことがない。');
  });

  it('離れた節を引用するときは、あいだに「……」を入れる', () => {
    expect(quotePassage(chapter, [4, 2])).toBe('二節。……四節と五節。');
    expect(quotePassage(chapter, [1, 2])).toBe(
      '主はわたしの牧者であって、わたしには乏しいことがない。二節。',
    );
  });
});

describe('truncate', () => {
  it('長いときだけ切って「…」を付ける', () => {
    expect(truncate('はじめに神は', 4)).toBe('はじめに…');
    expect(truncate('はじめに', 4)).toBe('はじめに');
  });
});
