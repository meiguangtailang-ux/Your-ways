import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router';
import { formatRef, getAdjacentChapter, translation, type ChapterLocation } from '@shared/bible';
import { cx } from '@/lib/cx';
import { readerPath } from '@/lib/routes';
import styles from './ChapterNav.module.css';

interface ChapterNavProps {
  location: ChapterLocation;
  /** 縦書きの本文の左端に置くとき */
  vertical?: boolean;
}

/** 章の終わりに置く、前の章・次の章への移動 */
export function ChapterNav({ location, vertical }: ChapterNavProps) {
  const previous = getAdjacentChapter(translation, location, 'prev');
  const next = getAdjacentChapter(translation, location, 'next');
  const label = (target: ChapterLocation) =>
    formatRef(translation, { ...target, verses: [] }, { short: true });

  return (
    <nav className={cx(styles.nav, vertical && styles.vertical)} aria-label="前後の章">
      {previous ? (
        <Link className={styles.link} to={readerPath(previous)} rel="prev">
          <ChevronLeft size={18} aria-hidden />
          <span>
            <span className={styles.hint}>前の章</span>
            {label(previous)}
          </span>
        </Link>
      ) : (
        <span />
      )}
      {next && (
        <Link className={cx(styles.link, styles.next)} to={readerPath(next)} rel="next">
          <span>
            <span className={styles.hint}>次の章</span>
            {label(next)}
          </span>
          <ChevronRight size={18} aria-hidden />
        </Link>
      )}
    </nav>
  );
}
