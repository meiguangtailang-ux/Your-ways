import { Bookmark, ChevronDown } from 'lucide-react';
import { chapterUnit, findBook, translation, type ChapterLocation } from '@shared/bible';
import { IconButton } from '@/components/IconButton';
import { cx } from '@/lib/cx';
import styles from './ReaderHeader.module.css';

interface ReaderHeaderProps {
  location: ChapterLocation;
  showRuby: boolean;
  /** この章にしおりがはさまれているか */
  bookmarked: boolean;
  onOpenPicker: () => void;
  onToggleRuby: () => void;
  onToggleBookmark: () => void;
}

/** 読む画面の上端。いまの箇所（押すと書・章を選べる）と、表示の切り替え */
export function ReaderHeader({
  location,
  showRuby,
  bookmarked,
  onOpenPicker,
  onToggleRuby,
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
          className={cx(styles.rubyToggle, showRuby && styles.on)}
          aria-pressed={showRuby}
          onClick={onToggleRuby}
        >
          ふりがな
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
