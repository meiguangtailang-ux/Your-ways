/**
 * 線（金色のマーカー）の保存と、画面からの読み書き。
 */
import { useMemo } from 'react';
import { chapterKey, type ChapterLocation, type PassageRef } from '@shared/bible';
import { createPersistentStore, useStore } from '@/lib/persistentStore';
import {
  applyHighlight,
  listHighlightedPassages,
  mergeHighlights,
  type HighlightState,
} from './highlightModel';

const store = createPersistentStore<HighlightState>('highlights.v1', {});

const NONE: readonly number[] = [];

/** その章で線が引かれている節 */
export function useChapterHighlights(location: ChapterLocation): ReadonlySet<number> {
  const verses = useStore(store)[chapterKey(location)] ?? NONE;
  return useMemo(() => new Set(verses), [verses]);
}

/** 線を引いた箇所の一覧（聖書の順） */
export function useHighlightedPassages(): PassageRef[] {
  const state = useStore(store);
  return useMemo(() => listHighlightedPassages(state), [state]);
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

/** バックアップ用：すべての線 */
export function exportHighlights(): HighlightState {
  return store.get();
}

/** バックアップから線を足す。戻り値は、新しく線が付いた節の数 */
export function importHighlights(incoming: HighlightState): number {
  const { merged, added } = mergeHighlights(store.get(), incoming);
  if (added > 0) store.update(() => merged);
  return added;
}
