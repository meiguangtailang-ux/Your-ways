/**
 * 聖書の中から、ことばをふくむ節をさがす。
 * 日本語は単語の区切りがはっきりしないので、文字の並びがそのままふくまれるかで判断する。
 */
import { translation, type BookId, type SearchIndex, type Testament } from '@shared/bible';

export type SearchScope = 'all' | Testament;

export interface SearchHit {
  book: BookId;
  chapter: number;
  verse: number;
  text: string;
}

export interface SearchResult {
  /** 見つかった節（聖書の順）。多いときは先頭の limit 件だけ */
  hits: SearchHit[];
  /** 見つかった節の総数 */
  total: number;
}

/** 入力を、空白（全角もふくむ）で区切った語に分ける */
export function parseQuery(query: string): string[] {
  return query.split(/\s+/u).filter((term) => term !== '');
}

const TESTAMENT_OF = new Map(translation.books.map((book) => [book.id, book.testament]));

/** すべての語をふくむ節をさがす */
export function searchBible(
  index: SearchIndex,
  terms: readonly string[],
  scope: SearchScope,
  limit: number,
): SearchResult {
  const hits: SearchHit[] = [];
  let total = 0;
  if (terms.length === 0) return { hits, total };

  for (const { book, chapters } of index) {
    if (scope !== 'all' && TESTAMENT_OF.get(book) !== scope) continue;
    chapters.forEach((verses, chapterIndex) => {
      for (const [verse, text] of verses) {
        if (!terms.every((term) => text.includes(term))) continue;
        total += 1;
        if (hits.length < limit) hits.push({ book, chapter: chapterIndex + 1, verse, text });
      }
    });
  }
  return { hits, total };
}

/** 語にふくまれる記号（「.」「?」など）が、照合の命令として働かないようにする */
function escapeForPattern(term: string): string {
  return term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** 本文を、さがした語の部分（hit: true）とそれ以外に分ける。見つけた語を目立たせるために使う */
export function splitByTerms(
  text: string,
  terms: readonly string[],
): { text: string; hit: boolean }[] {
  if (terms.length === 0) return [{ text, hit: false }];
  const pattern = new RegExp(`(${terms.map(escapeForPattern).join('|')})`, 'gu');
  return text
    .split(pattern)
    .filter((part) => part !== '')
    .map((part) => ({ text: part, hit: terms.includes(part) }));
}
