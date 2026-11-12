import { describe, expect, it } from 'vitest';
import { BackupFormatError, buildBackup, parseBackup } from './backupFile';

const entry = {
  id: 'a',
  kind: 'note',
  ref: { book: 'jhn', chapter: 3, verses: [16] },
  quote: '神はそのひとり子を…',
  body: 'メモ',
  createdAt: '2026-11-12T00:00:00.000Z',
  updatedAt: '2026-11-12T00:00:00.000Z',
} as const;

const bookmark = {
  id: 'b',
  book: 'gen',
  chapter: 1,
  preview: 'はじめに…',
  createdAt: '2026-11-12T00:00:00.000Z',
} as const;

describe('バックアップファイル', () => {
  it('書き出したものを、そのまま読み込める', () => {
    const backup = buildBackup({
      highlights: { 'gen.1': [1, 2] },
      journal: [{ ...entry, ref: { ...entry.ref, verses: [16] } }],
      bookmarks: [bookmark],
    });
    expect(parseBackup(JSON.stringify(backup))).toEqual(backup);
  });

  it('このアプリのファイルでなければ、読み込まない', () => {
    expect(() => parseBackup('こんにちは')).toThrow(BackupFormatError);
    expect(() => parseBackup('{"hello":1}')).toThrow(BackupFormatError);
    expect(() => parseBackup(JSON.stringify({ app: 'other', version: 1 }))).toThrow(
      BackupFormatError,
    );
  });

  it('形のおかしい記録だけを取り除き、残りは読み込む', () => {
    const backup = parseBackup(
      JSON.stringify({
        ...buildBackup({ highlights: {}, journal: [], bookmarks: [] }),
        highlights: { 'gen.1': [1], 'nowhere.1': [1] },
        journal: [
          entry,
          { ...entry, id: 'x', kind: 'unknown' },
          { ...entry, id: 'y', ref: { book: 'jhn', chapter: 99, verses: [1] } },
          'text',
        ],
        bookmarks: [bookmark, { ...bookmark, id: 'z', book: 'xyz' }, null],
      }),
    );
    expect(backup.highlights).toEqual({ 'gen.1': [1] });
    expect(backup.journal.map((item) => item.id)).toEqual(['a']);
    expect(backup.bookmarks.map((item) => item.id)).toEqual(['b']);
  });
});
