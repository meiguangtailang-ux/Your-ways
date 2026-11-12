import { describe, expect, it } from 'vitest';
import {
  applyHighlight,
  listHighlightedPassages,
  mergeHighlights,
  sanitizeHighlights,
} from './highlightModel';

describe('applyHighlight', () => {
  it('線を引く・外す。結果は昇順で重複しない', () => {
    expect(applyHighlight([3], [1, 3, 2], true)).toEqual([1, 2, 3]);
    expect(applyHighlight([1, 2, 3], [2], false)).toEqual([1, 3]);
  });
});

describe('listHighlightedPassages', () => {
  it('聖書の順に並べ、連続する節はひとまとまりにする', () => {
    const passages = listHighlightedPassages({
      'jhn.3': [16, 17, 19],
      'gen.1': [1],
      'psa.23': [1, 2],
    });
    expect(passages).toEqual([
      { book: 'gen', chapter: 1, verses: [1] },
      { book: 'psa', chapter: 23, verses: [1, 2] },
      { book: 'jhn', chapter: 3, verses: [16, 17] },
      { book: 'jhn', chapter: 3, verses: [19] },
    ]);
  });
});

describe('sanitizeHighlights', () => {
  it('実在しない章や、数でない節を取り除く', () => {
    expect(
      sanitizeHighlights({
        'gen.1': [3, 1, 'x', -2, 1],
        'gen.99': [1],
        'xyz.1': [1],
        'jhn.3': 'not a list',
      }),
    ).toEqual({ 'gen.1': [1, 3] });
  });

  it('形の違うデータは、空として扱う', () => {
    expect(sanitizeHighlights(null)).toEqual({});
    expect(sanitizeHighlights('text')).toEqual({});
  });
});

describe('mergeHighlights', () => {
  it('いまの線に足し、新しく付いた節の数を返す', () => {
    const { merged, added } = mergeHighlights(
      { 'gen.1': [1, 2] },
      { 'gen.1': [2, 3], 'jhn.3': [16] },
    );
    expect(merged).toEqual({ 'gen.1': [1, 2, 3], 'jhn.3': [16] });
    expect(added).toBe(2);
  });
});
