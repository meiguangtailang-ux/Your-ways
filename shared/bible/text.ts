/**
 * 本文テキストの扱い。
 * ふりがなは青空文庫と同じ「｜親文字《よみ》」形式で本文に埋め込んである。
 */
import type { ChapterData } from './types';

const RUBY_PATTERN = /｜([^｜《》]+)《([^《》]+)》/g;

export type RubyPart = string | { base: string; reading: string };

/** ふりがな付きテキストを、地の文とルビの並びに分解する */
export function parseRuby(text: string): RubyPart[] {
  const parts: RubyPart[] = [];
  let cursor = 0;
  for (const match of text.matchAll(RUBY_PATTERN)) {
    if (match.index > cursor) parts.push(text.slice(cursor, match.index));
    parts.push({ base: match[1]!, reading: match[2]! });
    cursor = match.index + match[0].length;
  }
  if (cursor < text.length) parts.push(text.slice(cursor));
  return parts;
}

/** ふりがなを取り除いた、ふつうの文にする */
export function stripRuby(text: string): string {
  return text.replace(RUBY_PATTERN, '$1');
}

/** 章に含まれる節番号（昇順・重複なし） */
export function listVerses(chapter: ChapterData): number[] {
  const verses = new Set<number>();
  for (const block of chapter.blocks) {
    for (const seg of block.segs) {
      if (seg.v > 0) verses.add(seg.v);
    }
  }
  return [...verses].sort((a, b) => a - b);
}

/** 指定した節の本文（ふりがな無し）。複数のかたまりに分かれていればつなげる */
export function getVerseText(chapter: ChapterData, verse: number): string {
  let text = '';
  for (const block of chapter.blocks) {
    for (const seg of block.segs) {
      if (seg.v === verse) text += stripRuby(seg.text);
    }
  }
  return text;
}

/** 節の表示用ラベル（「4-5」のような合併節はそのラベル、ふつうは番号） */
export function getVerseLabel(chapter: ChapterData, verse: number): string {
  for (const block of chapter.blocks) {
    for (const seg of block.segs) {
      if (seg.v === verse) return seg.label ?? String(verse);
    }
  }
  return String(verse);
}

/**
 * 複数の節をつなげた引用文（ふりがな無し）。
 * 連続していない節のあいだには「……」を入れる。
 */
export function quotePassage(chapter: ChapterData, verses: readonly number[]): string {
  const sorted = [...verses].sort((a, b) => a - b);
  return sorted
    .map((verse, index) => {
      const previous = sorted[index - 1];
      const gap = previous !== undefined && verse !== previous + 1 ? '……' : '';
      return gap + getVerseText(chapter, verse);
    })
    .join('');
}

/** 長い文を先頭 max 文字で切り、切ったときは「…」を付ける */
export function truncate(text: string, max: number): string {
  return text.length > max ? `${text.slice(0, max)}…` : text;
}
