/**
 * メモと祈りの保存と、画面からの読み書き。
 * 節に結びついたもの（ref あり）と、節に結びつかない祈り（ref なし）がある。
 */
import { nowIso } from '@/lib/date';
import { mergeById, newestFirst } from '@/lib/mergeById';
import { createPersistentStore, useStore } from '@/lib/persistentStore';
import type { JournalEntry } from './journalModel';

const store = createPersistentStore<JournalEntry[]>('journal.v1', []);

/** すべての記録（新しい順） */
export function useJournal(): JournalEntry[] {
  return useStore(store);
}

export function addEntry(
  draft: Pick<JournalEntry, 'kind' | 'ref' | 'quote' | 'body' | 'source'>,
): void {
  const now = nowIso();
  const entry: JournalEntry = { ...draft, id: crypto.randomUUID(), createdAt: now, updatedAt: now };
  store.update((entries) => [entry, ...entries]);
}

export function updateEntry(id: string, body: string): void {
  store.update((entries) =>
    entries.map((entry) => (entry.id === id ? { ...entry, body, updatedAt: nowIso() } : entry)),
  );
}

export function deleteEntry(id: string): void {
  store.update((entries) => entries.filter((entry) => entry.id !== id));
}

/** バックアップ用：すべての記録 */
export function exportEntries(): JournalEntry[] {
  return store.get();
}

/** バックアップから記録を足す。戻り値は、新しく足された件数 */
export function importEntries(incoming: readonly JournalEntry[]): number {
  const { merged, added } = mergeById(store.get(), incoming);
  if (added > 0) store.update(() => newestFirst(merged));
  return added;
}
