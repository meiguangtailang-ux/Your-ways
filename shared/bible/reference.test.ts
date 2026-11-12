import { describe, expect, it } from 'vitest';
import { formatRef, formatVerseList, getAdjacentChapter, isValidLocation } from './reference';
import { kougo } from './translations/kougo';

describe('formatVerseList', () => {
  it('連続する節は範囲にまとめる', () => {
    expect(formatVerseList([16, 17, 18])).toBe('16-18');
  });

  it('離れた節はカンマで区切る', () => {
    expect(formatVerseList([19, 16, 17])).toBe('16-17, 19');
  });

  it('1節だけならそのまま', () => {
    expect(formatVerseList([3])).toBe('3');
  });
});

describe('formatRef', () => {
  it('節があれば「書名 章:節」', () => {
    expect(formatRef(kougo, { book: 'jhn', chapter: 3, verses: [16, 17] })).toBe(
      'ヨハネによる福音書 3:16-17',
    );
  });

  it('short なら短い書名を使う', () => {
    expect(formatRef(kougo, { book: 'jhn', chapter: 3, verses: [16] }, { short: true })).toBe(
      'ヨハネ 3:16',
    );
  });

  it('節が無ければ章全体。詩篇は「篇」で数える', () => {
    expect(formatRef(kougo, { book: 'gen', chapter: 1, verses: [] })).toBe('創世記 1章');
    expect(formatRef(kougo, { book: 'psa', chapter: 23, verses: [] })).toBe('詩篇 23篇');
  });
});

describe('getAdjacentChapter', () => {
  it('同じ書の中では章を1つ動く', () => {
    expect(getAdjacentChapter(kougo, { book: 'jhn', chapter: 3 }, 'next')).toEqual({
      book: 'jhn',
      chapter: 4,
    });
    expect(getAdjacentChapter(kougo, { book: 'jhn', chapter: 3 }, 'prev')).toEqual({
      book: 'jhn',
      chapter: 2,
    });
  });

  it('書の境目では隣の書へ渡る（旧約と新約の境目も）', () => {
    expect(getAdjacentChapter(kougo, { book: 'mal', chapter: 4 }, 'next')).toEqual({
      book: 'mat',
      chapter: 1,
    });
    expect(getAdjacentChapter(kougo, { book: 'mat', chapter: 1 }, 'prev')).toEqual({
      book: 'mal',
      chapter: 4,
    });
  });

  it('聖書の端では undefined', () => {
    expect(getAdjacentChapter(kougo, { book: 'gen', chapter: 1 }, 'prev')).toBeUndefined();
    expect(getAdjacentChapter(kougo, { book: 'rev', chapter: 22 }, 'next')).toBeUndefined();
  });
});

describe('isValidLocation', () => {
  it('章が範囲の外なら無効', () => {
    expect(isValidLocation(kougo, { book: 'jhn', chapter: 21 })).toBe(true);
    expect(isValidLocation(kougo, { book: 'jhn', chapter: 22 })).toBe(false);
    expect(isValidLocation(kougo, { book: 'jhn', chapter: 0 })).toBe(false);
    expect(isValidLocation(kougo, { book: 'jhn', chapter: Number.NaN })).toBe(false);
  });
});
