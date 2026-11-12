/**
 * バックアップファイルの形と、読み込んだファイルの確かめ方。
 * 線・メモ・祈り・しおりを、1つの JSON ファイルにまとめる。
 */
import { STORAGE_PREFIX } from '@shared/appInfo';
import { isBookmark, type Bookmark } from '@/features/bookmarks/bookmarkModel';
import { sanitizeHighlights, type HighlightState } from '@/features/highlights/highlightModel';
import { isJournalEntry, type JournalEntry } from '@/features/journal/journalModel';

/** ファイルの形を変えたら上げる */
const BACKUP_VERSION = 1;

export interface Backup {
  /** このアプリのバックアップであることの目印 */
  app: string;
  version: number;
  exportedAt: string;
  highlights: HighlightState;
  journal: JournalEntry[];
  bookmarks: Bookmark[];
}

export function buildBackup(data: Pick<Backup, 'highlights' | 'journal' | 'bookmarks'>): Backup {
  return {
    app: STORAGE_PREFIX,
    version: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    ...data,
  };
}

/** 読み込めないファイルだったときの例外 */
export class BackupFormatError extends Error {}

/**
 * ファイルの中身を読み取る。このアプリのバックアップでなければ BackupFormatError。
 * 中の記録は1件ずつ確かめ、形のおかしいものは取り除く。
 */
export function parseBackup(text: string): Backup {
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    throw new BackupFormatError('JSON として読めません');
  }
  if (typeof data !== 'object' || data === null) throw new BackupFormatError('形が違います');

  const { app, version, exportedAt, highlights, journal, bookmarks } = data as Record<
    string,
    unknown
  >;
  if (app !== STORAGE_PREFIX || version !== BACKUP_VERSION) {
    throw new BackupFormatError('このアプリのバックアップではありません');
  }
  return {
    app,
    version,
    exportedAt: typeof exportedAt === 'string' ? exportedAt : '',
    highlights: sanitizeHighlights(highlights),
    journal: Array.isArray(journal) ? journal.filter(isJournalEntry) : [],
    bookmarks: Array.isArray(bookmarks) ? bookmarks.filter(isBookmark) : [],
  };
}
