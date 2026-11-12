/**
 * 聖書箇所の表記と、章をまたぐ移動の計算。
 */
import { BOOK_IDS, isBookId, type BookId } from './canon';
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

/** [16, 17, 19] → "16-17, 19" */
export function formatVerseList(verses: readonly number[]): string {
  return groupConsecutive(verses)
    .map((group) => (group.length === 1 ? `${group[0]}` : `${group[0]}-${group.at(-1)}`))
    .join(', ');
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

/** 正典の並び順で比べる（一覧を聖書の順に並べるとき用） */
export function compareLocations(a: ChapterLocation, b: ChapterLocation): number {
  return BOOK_IDS.indexOf(a.book) - BOOK_IDS.indexOf(b.book) || a.chapter - b.chapter;
}

/** 連続する節をひとまとまりにする。[16, 17, 19] → [[16, 17], [19]] */
export function groupConsecutive(verses: readonly number[]): number[][] {
  const groups: number[][] = [];
  for (const verse of [...new Set(verses)].sort((a, b) => a - b)) {
    const current = groups.at(-1);
    if (current && verse === current.at(-1)! + 1) current.push(verse);
    else groups.push([verse]);
  }
  return groups;
}

function isVerseList(value: unknown): value is number[] {
  return Array.isArray(value) && value.every((verse) => Number.isInteger(verse) && verse > 0);
}

/** 外から来たデータ（バックアップの読み込みなど）が、実在する章を指しているかを確かめる */
export function isChapterLocation(
  translation: Translation,
  value: unknown,
): value is ChapterLocation {
  if (typeof value !== 'object' || value === null) return false;
  const { book, chapter } = value as Record<string, unknown>;
  return (
    typeof book === 'string' &&
    isBookId(book) &&
    typeof chapter === 'number' &&
    isValidLocation(translation, { book, chapter })
  );
}

export function isPassageRef(translation: Translation, value: unknown): value is PassageRef {
  return (
    isChapterLocation(translation, value) && isVerseList((value as { verses?: unknown }).verses)
  );
}
