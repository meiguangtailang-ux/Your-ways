/**
 * 線（金色のマーカー）のデータの形と、その計算。
 * 保存や画面とのつなぎは highlightStore.ts にある。
 */
import {
  chapterKey,
  compareLocations,
  groupConsecutive,
  isChapterLocation,
  translation,
  type ChapterLocation,
  type PassageRef,
} from '@shared/bible';

/** 章キー（例："jhn.3"）→ 線を引いた節番号（昇順） */
export type HighlightState = Record<string, number[]>;

function parseChapterKey(key: string): ChapterLocation | undefined {
  const [book, chapter] = key.split('.');
  const location = { book, chapter: Number(chapter) };
  return isChapterLocation(translation, location) ? location : undefined;
}

/** 線の付け外しをした後の節番号（昇順） */
export function applyHighlight(
  current: readonly number[],
  verses: readonly number[],
  on: boolean,
): number[] {
  const next = new Set(current);
  for (const verse of verses) {
    if (on) next.add(verse);
    else next.delete(verse);
  }
  return [...next].sort((a, b) => a - b);
}

/** 線を引いた箇所を、聖書の順に並べる。連続する節はひとまとまりにする */
export function listHighlightedPassages(state: HighlightState): PassageRef[] {
  return Object.entries(state)
    .flatMap(([key, verses]) => {
      const location = parseChapterKey(key);
      return location ? [{ location, verses }] : [];
    })
    .sort((a, b) => compareLocations(a.location, b.location))
    .flatMap(({ location, verses }) =>
      groupConsecutive(verses).map((group) => ({ ...location, verses: group })),
    );
}

/** 外から来たデータ（バックアップ）から、正しい形のものだけを取り出す */
export function sanitizeHighlights(value: unknown): HighlightState {
  const state: HighlightState = {};
  if (typeof value !== 'object' || value === null) return state;
  for (const [key, verses] of Object.entries(value)) {
    const location = parseChapterKey(key);
    if (!location || !Array.isArray(verses)) continue;
    const valid = verses.filter((verse) => Number.isInteger(verse) && verse > 0);
    if (valid.length > 0) state[chapterKey(location)] = applyHighlight([], valid, true);
  }
  return state;
}

/** いまの線に、別の線を足す。added は新しく線が付いた節の数 */
export function mergeHighlights(
  current: HighlightState,
  incoming: HighlightState,
): { merged: HighlightState; added: number } {
  const merged = { ...current };
  let added = 0;
  for (const [key, verses] of Object.entries(incoming)) {
    const before = merged[key] ?? [];
    merged[key] = applyHighlight(before, verses, true);
    added += merged[key].length - before.length;
  }
  return { merged, added };
}
