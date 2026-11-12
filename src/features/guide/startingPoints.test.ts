import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { getVerseText, isValidLocation, translation, type BookData } from '@shared/bible';
import { STARTING_POINTS } from './startingPoints';

function loadBook(bookId: string): BookData {
  const file = new URL(`../../../public/bible/${translation.id}/${bookId}.json`, import.meta.url);
  return JSON.parse(readFileSync(file, 'utf8')) as BookData;
}

describe('読みはじめの候補', () => {
  it('すべて実在する章を指している', () => {
    for (const point of STARTING_POINTS) {
      expect(isValidLocation(translation, point.location)).toBe(true);
    }
  });

  it('引用は、聖書の本文どおりである', () => {
    for (const { location, verse, quote } of STARTING_POINTS) {
      if (!quote) continue;
      const chapter = loadBook(location.book).chapters[location.chapter - 1]!;
      expect(getVerseText(chapter, verse!)).toContain(quote);
    }
  });
});
