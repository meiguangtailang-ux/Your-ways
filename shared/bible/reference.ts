/**
 * 聖書箇所の表記と、章をまたぐ移動の計算。
 */
import type { BookId } from './canon';
import type { BookInfo, PassageRef, Translation } from './types';

export function findBook(translation: Translation, bookId: BookId): BookInfo {
  const book = translation.books.find((candidate) => candidate.id === bookId);
  if (!book) throw new Error(`Unknown book: ${bookId}`);
  return book;
}

/** 章の単位。詩篇だけ「篇」と数える */
export function chapterUnit(bookId: BookId): '章' | '篇' {
  return bookId === 'psa' ? '篇' : '章';
}

/** 「第3章」「第23篇」 */
export function formatChapterTitle(bookId: BookId, chapter: number): string {
  return `第${chapter}${chapterUnit(bookId)}`;
}

/** [16, 17, 19] → "16-17, 19" */
export function formatVerseList(verses: readonly number[]): string {
  const sorted = [...new Set(verses)].sort((a, b) => a - b);
  const ranges: string[] = [];
  let start: number | undefined;
  let previous: number | undefined;
  for (const verse of sorted) {
    if (start === undefined || previous === undefined) {
      start = previous = verse;
    } else if (verse === previous + 1) {
      previous = verse;
    } else {
      ranges.push(start === previous ? `${start}` : `${start}-${previous}`);
      start = previous = verse;
    }
  }
  if (start !== undefined && previous !== undefined) {
    ranges.push(start === previous ? `${start}` : `${start}-${previous}`);
  }
  return ranges.join(', ');
}

/**
 * 「ヨハネによる福音書 3:16-17」。short なら「ヨハネ 3:16-17」。
 * 節の指定が無いときは「ヨハネによる福音書 3章」。
 */
export function formatRef(
  translation: Translation,
  ref: PassageRef,
  options: { short?: boolean } = {},
): string {
  const book = findBook(translation, ref.book);
  const name = options.short ? book.shortName : book.name;
  if (ref.verses.length === 0) return `${name} ${ref.chapter}${chapterUnit(ref.book)}`;
  return `${name} ${ref.chapter}:${formatVerseList(ref.verses)}`;
}

export interface ChapterLocation {
  book: BookId;
  chapter: number;
}

/** 前後の章。書の境目は隣の書へ渡る。聖書の端では undefined */
export function getAdjacentChapter(
  translation: Translation,
  location: ChapterLocation,
  direction: 'prev' | 'next',
): ChapterLocation | undefined {
  const index = translation.books.findIndex((book) => book.id === location.book);
  const book = translation.books[index];
  if (!book) return undefined;

  if (direction === 'next') {
    if (location.chapter < book.chapters) return { book: book.id, chapter: location.chapter + 1 };
    const next = translation.books[index + 1];
    return next && { book: next.id, chapter: 1 };
  }
  if (location.chapter > 1) return { book: book.id, chapter: location.chapter - 1 };
  const previous = translation.books[index - 1];
  return previous && { book: previous.id, chapter: previous.chapters };
}

export function isValidLocation(translation: Translation, location: ChapterLocation): boolean {
  const book = translation.books.find((candidate) => candidate.id === location.book);
  return (
    book !== undefined &&
    Number.isInteger(location.chapter) &&
    location.chapter >= 1 &&
    location.chapter <= book.chapters
  );
}

/** ハイライトなどを章単位で持つためのキー（例："jhn.3"） */
export function chapterKey(location: ChapterLocation): string {
  return `${location.book}.${location.chapter}`;
}
