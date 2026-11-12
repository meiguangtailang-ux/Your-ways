import { describe, expect, it } from 'vitest';
import type { SearchIndex } from '@shared/bible';
import { parseQuery, searchBible, splitByTerms } from './searchBible';

const index: SearchIndex = [
  {
    book: 'gen',
    chapters: [
      [
        [1, 'はじめに神は天と地とを創造された。'],
        [2, '地は形なく、むなしく、'],
      ],
    ],
  },
  {
    book: 'jhn',
    chapters: [[], [], [[16, '神はそのひとり子を賜わったほどに、この世を愛して下さった。']]],
  },
];

describe('parseQuery', () => {
  it('空白（全角もふくむ）で語に分ける', () => {
    expect(parseQuery(' 神　愛  ')).toEqual(['神', '愛']);
    expect(parseQuery('   ')).toEqual([]);
  });
});

describe('searchBible', () => {
  it('語をふくむ節を、聖書の順に返す', () => {
    const { hits, total } = searchBible(index, ['神'], 'all', 10);
    expect(total).toBe(2);
    expect(hits.map((hit) => `${hit.book} ${hit.chapter}:${hit.verse}`)).toEqual([
      'gen 1:1',
      'jhn 3:16',
    ]);
  });

  it('複数の語は、すべてをふくむ節だけにしぼる', () => {
    expect(searchBible(index, ['神', '愛'], 'all', 10).total).toBe(1);
  });

  it('旧約・新約にしぼれる', () => {
    expect(searchBible(index, ['神'], 'ot', 10).hits[0]?.book).toBe('gen');
    expect(searchBible(index, ['神'], 'nt', 10).hits[0]?.book).toBe('jhn');
  });

  it('件数が多いときは limit 件だけ返すが、総数は数える', () => {
    const { hits, total } = searchBible(index, ['神'], 'all', 1);
    expect(hits).toHaveLength(1);
    expect(total).toBe(2);
  });

  it('語が無ければ何も返さない', () => {
    expect(searchBible(index, [], 'all', 10)).toEqual({ hits: [], total: 0 });
  });
});

describe('splitByTerms', () => {
  it('さがした語の部分と、それ以外に分ける', () => {
    expect(splitByTerms('神は愛である', ['神', '愛'])).toEqual([
      { text: '神', hit: true },
      { text: 'は', hit: false },
      { text: '愛', hit: true },
      { text: 'である', hit: false },
    ]);
  });

  it('記号をふくむ語も、文字どおりに扱う', () => {
    expect(splitByTerms('「光あれ」。（a.b）', ['.'])).toEqual([
      { text: '「光あれ」。（a', hit: false },
      { text: '.', hit: true },
      { text: 'b）', hit: false },
    ]);
  });
});
