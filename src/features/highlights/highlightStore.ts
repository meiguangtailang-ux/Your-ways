/**
 * 金色のマーカー（線）。章ごとに、線を引いた節番号を持つ。
 */
import { useMemo } from 'react';
import { chapterKey, type ChapterLocation } from '@shared/bible';
import { createPersistentStore, useStore } from '@/lib/persistentStore';

/** 章キー（例："jhn.3"）→ 線を引いた節番号 */
type HighlightState = Record<string, number[]>;

const store = createPersistentStore<HighlightState>('highlights.v1', {});

const NONE: readonly number[] = [];

/** その章で線が引かれている節 */
export function useChapterHighlights(location: ChapterLocation): ReadonlySet<number> {
  const verses = useStore(store)[chapterKey(location)] ?? NONE;
  return useMemo(() => new Set(verses), [verses]);
}

/** 指定した節に線を引く（on = true）／外す（on = false） */
export function setHighlight(
  location: ChapterLocation,
  verses: readonly number[],
  on: boolean,
): void {
  store.update((state) => {
    const key = chapterKey(location);
    const next = { ...state, [key]: applyHighlight(state[key] ?? [], verses, on) };
    // 線が1本も無くなった章は、記録ごと消す
    if (next[key]?.length === 0) delete next[key];
    return next;
  });
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
