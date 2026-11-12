/**
 * 記録の書き出しと読み込み。
 * 読み込みは「足す」だけで、いま端末にある記録は消さない。
 */
import { STORAGE_PREFIX } from '@shared/appInfo';
import { exportBookmarks, importBookmarks } from '@/features/bookmarks/bookmarkStore';
import { exportHighlights, importHighlights } from '@/features/highlights/highlightStore';
import { exportEntries, importEntries } from '@/features/journal/journalStore';
import { downloadTextFile } from '@/lib/download';
import { buildBackup, parseBackup } from './backupFile';

/** 読み込みで新しく足された数 */
export interface RestoreSummary {
  entries: number;
  bookmarks: number;
  highlightedVerses: number;
}

/** いまの記録を、日付入りの名前のファイルとして保存する */
export function downloadBackup(): void {
  const backup = buildBackup({
    highlights: exportHighlights(),
    journal: exportEntries(),
    bookmarks: exportBookmarks(),
  });
  const date = backup.exportedAt.slice(0, 10);
  downloadTextFile(
    `${STORAGE_PREFIX}-backup-${date}.json`,
    JSON.stringify(backup, null, 2),
    'application/json',
  );
}

/** バックアップファイルの記録を、いまの記録に足す。読めないファイルなら BackupFormatError */
export async function restoreBackup(file: File): Promise<RestoreSummary> {
  const backup = parseBackup(await file.text());
  return {
    entries: importEntries(backup.journal),
    bookmarks: importBookmarks(backup.bookmarks),
    highlightedVerses: importHighlights(backup.highlights),
  };
}
