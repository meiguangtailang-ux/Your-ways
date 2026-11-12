import { Bookmark, PenLine } from 'lucide-react';
import { memo, useMemo, type KeyboardEvent, type MouseEvent } from 'react';
import type { ChapterData } from '@shared/bible';
import { RubyText } from '@/features/bible/RubyText';
import { cx } from '@/lib/cx';
import { layoutChapter, type PlacedSegment } from './chapterLayout';
import styles from './ChapterView.module.css';

interface ChapterViewProps {
  chapter: ChapterData;
  showRuby: boolean;
  /** 選択中の節 */
  selected: ReadonlySet<number>;
  /** 線が引かれている節 */
  highlighted: ReadonlySet<number>;
  /** メモ・祈りがある節 */
  noted: ReadonlySet<number>;
  /** しおりがはさまれている節 */
  bookmarked: ReadonlySet<number>;
  /** 開いた直後に知らせる節（しおりやメモから来たとき） */
  focusVerse?: number;
  onToggleVerse: (verse: number) => void;
}

/** 章の本文。節を押すと選択が切り替わる */
export function ChapterView({
  chapter,
  showRuby,
  selected,
  highlighted,
  noted,
  bookmarked,
  focusVerse,
  onToggleVerse,
}: ChapterViewProps) {
  const groups = useMemo(() => layoutChapter(chapter), [chapter]);

  const handleClick = (event: MouseEvent) => {
    // 文字をなぞって選択している最中のクリックは、節の選択として扱わない
    if (!window.getSelection()?.isCollapsed) return;
    const verse = verseOf(event.target);
    if (verse) onToggleVerse(verse);
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    const verse = verseOf(event.target);
    if (!verse) return;
    event.preventDefault();
    onToggleVerse(verse);
  };

  const renderSegs = (segs: PlacedSegment[]) =>
    segs.map((placed) => (
      <VerseSegment
        key={placed.key}
        placed={placed}
        showRuby={showRuby}
        selected={selected.has(placed.seg.v)}
        highlighted={highlighted.has(placed.seg.v)}
        noted={placed.endsVerse && noted.has(placed.seg.v)}
        bookmarked={placed.endsVerse && bookmarked.has(placed.seg.v)}
        focused={placed.seg.v === focusVerse}
      />
    ));

  return (
    <div
      className={cx(styles.chapter, showRuby && styles.withRuby)}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
    >
      {groups.map((group) => {
        switch (group.type) {
          case 'paragraph':
            return (
              <p key={group.key} className={styles.paragraph}>
                {renderSegs(group.segs)}
              </p>
            );
          case 'title':
            return (
              <p key={group.key} className={styles.title}>
                {renderSegs(group.segs)}
              </p>
            );
          case 'stanza':
            return (
              <div key={group.key} className={styles.stanza}>
                {group.lines.map((line) => (
                  <p key={line.key} className={styles.line}>
                    {renderSegs(line.segs)}
                  </p>
                ))}
              </div>
            );
        }
      })}
    </div>
  );
}

function verseOf(target: EventTarget): number | undefined {
  const element = (target as HTMLElement).closest<HTMLElement>('[data-verse]');
  return element ? Number(element.dataset.verse) : undefined;
}

/**
 * 改行を禁じる見えない文字（WORD JOINER）。
 * 節番号だけが行末に残ったり、印だけが次の行に送られたりしないようにする。
 */
const NO_BREAK = '\u2060';

interface VerseSegmentProps {
  placed: PlacedSegment;
  showRuby: boolean;
  selected: boolean;
  highlighted: boolean;
  noted: boolean;
  bookmarked: boolean;
  focused: boolean;
}

const VerseSegment = memo(function VerseSegment({
  placed: { seg, showNumber },
  showRuby,
  selected,
  highlighted,
  noted,
  bookmarked,
  focused,
}: VerseSegmentProps) {
  // 表題など、節に属さない文は選択できない
  if (seg.v === 0) return <RubyText text={seg.text} showRuby={showRuby} />;

  return (
    <span
      data-verse={seg.v}
      className={cx(
        styles.verse,
        selected && styles.selected,
        highlighted && styles.highlighted,
        focused && styles.focused,
      )}
      // キーボードでは、節番号のある先頭のかたまりから選択できる
      {...(showNumber && { role: 'button', tabIndex: 0, 'aria-pressed': selected })}
    >
      {showNumber && <span className={styles.number}>{seg.label ?? seg.v}</span>}
      {showNumber && NO_BREAK}
      <span className={styles.text}>
        <RubyText text={seg.text} showRuby={showRuby} />
      </span>
      {(noted || bookmarked) && NO_BREAK}
      {noted && <PenLine className={styles.mark} aria-label="メモ・祈りあり" />}
      {bookmarked && <Bookmark className={styles.mark} aria-label="しおりあり" />}
    </span>
  );
});
