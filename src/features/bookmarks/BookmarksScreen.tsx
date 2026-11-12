import { BookOpen, ChevronRight, X } from 'lucide-react';
import { Link } from 'react-router';
import { formatRef, translation } from '@shared/bible';
import { EmptyState } from '@/components/EmptyState';
import { IconButton } from '@/components/IconButton';
import { ScreenHeader } from '@/components/ScreenHeader';
import { useReaderPrefs } from '@/features/reader/readerPrefs';
import { formatDate } from '@/lib/date';
import { readerPath } from '@/lib/routes';
import { removeBookmark, useBookmarks, type Bookmark } from './bookmarkStore';
import styles from './BookmarksScreen.module.css';

function bookmarkTitle(bookmark: Bookmark): string {
  return formatRef(translation, {
    book: bookmark.book,
    chapter: bookmark.chapter,
    verses: bookmark.verse ? [bookmark.verse] : [],
  });
}

/** 「しおり」画面：続きから読む・しおりをはさんだ箇所へ戻る */
export function BookmarksScreen() {
  const bookmarks = useBookmarks();
  const { lastRead } = useReaderPrefs();

  return (
    <main className={styles.screen}>
      <ScreenHeader title="しおり" />

      <Link className={styles.resume} to={readerPath(lastRead)}>
        <BookOpen size={22} strokeWidth={1.6} aria-hidden />
        <span className={styles.resumeText}>
          <span className={styles.hint}>続きから読む</span>
          {formatRef(translation, { ...lastRead, verses: [] })}
        </span>
        <ChevronRight size={18} aria-hidden />
      </Link>

      {bookmarks.length === 0 ? (
        <EmptyState title="しおりはまだありません">
          読んでいる章の右上のしおりを押すか、
          <br />
          節を選んで「しおり」を押すと、ここに並びます。
        </EmptyState>
      ) : (
        <ul className={styles.list}>
          {bookmarks.map((bookmark) => (
            <li key={bookmark.id} className={styles.item}>
              <Link className={styles.link} to={readerPath(bookmark, bookmark.verse)}>
                <span className={styles.title}>{bookmarkTitle(bookmark)}</span>
                <span className={styles.preview}>{bookmark.preview}</span>
                <time className={styles.date} dateTime={bookmark.createdAt}>
                  {formatDate(bookmark.createdAt)}
                </time>
              </Link>
              <IconButton
                label={`${bookmarkTitle(bookmark)} のしおりを外す`}
                onClick={() => removeBookmark(bookmark.id)}
              >
                <X size={18} aria-hidden />
              </IconButton>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
