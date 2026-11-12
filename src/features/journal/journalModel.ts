/**
 * メモと祈りのデータの形と、その計算。
 * 保存や画面とのつなぎは journalStore.ts にある。
 */
import { isPassageRef, translation, type ChapterLocation, type PassageRef } from '@shared/bible';

export type EntryKind = 'note' | 'prayer';

export interface JournalEntry {
  id: string;
  kind: EntryKind;
  /** 結びついている聖書箇所。無ければ、どの節にも結びつかない記録 */
  ref?: PassageRef;
  /** 書いた時点の本文の写し（一覧で本文を読み込まずに見せるため） */
  quote?: string;
  body: string;
  /** 自分で書いたものでなく、パウロ先生（AI）の答えを保存したものに付く */
  source?: 'teacher';
  createdAt: string;
  updatedAt: string;
}

export const ENTRY_KIND_LABEL: Record<EntryKind, string> = {
  note: 'メモ',
  prayer: '祈り',
};

function isInChapter(entry: JournalEntry, location: ChapterLocation): boolean {
  return entry.ref?.book === location.book && entry.ref.chapter === location.chapter;
}

/** その章で、メモや祈りが付いている節 */
export function versesWithEntries(
  entries: readonly JournalEntry[],
  location: ChapterLocation,
): Set<number> {
  const verses = new Set<number>();
  for (const entry of entries) {
    if (isInChapter(entry, location)) entry.ref?.verses.forEach((verse) => verses.add(verse));
  }
  return verses;
}

/** 指定した節のどれかに結びついている記録 */
export function entriesForVerses(
  entries: readonly JournalEntry[],
  location: ChapterLocation,
  verses: readonly number[],
): JournalEntry[] {
  return entries.filter(
    (entry) =>
      isInChapter(entry, location) && entry.ref!.verses.some((verse) => verses.includes(verse)),
  );
}

/** 外から来たデータ（バックアップ）が、メモ・祈りとして正しい形かを確かめる */
export function isJournalEntry(value: unknown): value is JournalEntry {
  if (typeof value !== 'object' || value === null) return false;
  const entry = value as Record<string, unknown>;
  return (
    typeof entry.id === 'string' &&
    (entry.kind === 'note' || entry.kind === 'prayer') &&
    typeof entry.body === 'string' &&
    typeof entry.createdAt === 'string' &&
    typeof entry.updatedAt === 'string' &&
    (entry.ref === undefined || isPassageRef(translation, entry.ref)) &&
    (entry.quote === undefined || typeof entry.quote === 'string') &&
    (entry.source === undefined || entry.source === 'teacher')
  );
}
