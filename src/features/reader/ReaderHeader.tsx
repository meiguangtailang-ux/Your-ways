import { Bookmark, ChevronDown } from 'lucide-react';
import { chapterUnit, findBook, translation, type ChapterLocation } from '@shared/bible';
import { IconButton } from '@/components/IconButton';
import styles from './ReaderHeader.module.css';

interface ReaderHeaderProps {
  location: ChapterLocation;
  /** この章にしおりがはさまれているか */
  bookmarked: boolean;
  onOpenPicker: () => void;
  onOpenDisplay: () => void;
  onToggleBookmark: () => void;
}

/** 読む画面の上端。いまの箇所（押すと書・章を選べる）、表示の設定、章のしおり */
export function ReaderHeader({
  location,
  bookmarked,
  onOpenPicker,
  onOpenDisplay,
  onToggleBookmark,
}: ReaderHeaderProps) {
  const book = findBook(translation, location.book);

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <button
          type="button"
          className={styles.location}
          aria-haspopup="dialog"
          aria-label={`${book.name} ${location.chapter}${chapterUnit(location.book)}。書と章を選ぶ`}
          onClick={onOpenPicker}
        >
          {/* 幅が足りないときは書名だけを省略し、章の数字は必ず見せる */}
          <span className={styles.bookName}>{book.shortName}</span>
          <span className={styles.chapter}>
            {location.chapter}
            {chapterUnit(location.book)}
          </span>
          <ChevronDown className={styles.chevron} size={16} aria-hidden />
        </button>
        <button
          type="button"
          className={styles.display}
          aria-haspopup="dialog"
          aria-label="表示の設定（文字の大きさ・ふりがな・縦書き・配色）"
          onClick={onOpenDisplay}
        >
          表示
        </button>
        <IconButton
          label={bookmarked ? 'この章のしおりを外す' : 'この章にしおりをはさむ'}
          active={bookmarked}
          aria-pressed={bookmarked}
          onClick={onToggleBookmark}
        >
          <Bookmark size={20} fill={bookmarked ? 'currentColor' : 'none'} aria-hidden />
        </IconButton>
      </div>
    </header>
  );
}
