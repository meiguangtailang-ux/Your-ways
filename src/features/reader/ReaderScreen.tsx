import { useEffect, useMemo, useState } from 'react';
import { Navigate, useNavigate, useParams, useSearchParams } from 'react-router';
import {
  chapterKey,
  findBook,
  formatChapterTitle,
  formatRef,
  getVerseText,
  isBookId,
  isValidLocation,
  listVerses,
  quotePassage,
  translation,
  truncate,
  type ChapterData,
  type ChapterLocation,
  type PassageRef,
} from '@shared/bible';
import { Button } from '@/components/Button';
import { useChapter } from '@/features/bible/useChapter';
import {
  addBookmark,
  findBookmark,
  removeBookmark,
  useBookmarks,
  versesWithBookmarks,
} from '@/features/bookmarks/bookmarkStore';
import { setHighlight, useChapterHighlights } from '@/features/highlights/highlightStore';
import { EntryEditor, type EditorTarget } from '@/features/journal/EntryEditor';
import {
  entriesForVerses,
  useJournal,
  versesWithEntries,
  type EntryKind,
} from '@/features/journal/journalStore';
import { VerseEntriesSheet } from '@/features/journal/VerseEntriesSheet';
import { TeacherSheet } from '@/features/teacher/TeacherSheet';
import { cx } from '@/lib/cx';
import { readerPath } from '@/lib/routes';
import { ChapterNav } from './ChapterNav';
import { ChapterView } from './ChapterView';
import { PassagePicker } from './PassagePicker';
import { ReaderHeader } from './ReaderHeader';
import { rememberLocation, setShowRuby, useReaderPrefs } from './readerPrefs';
import { SelectionBar } from './SelectionBar';
import styles from './ReaderScreen.module.css';

/** しおりの一覧に出す、書き出しの文字数 */
const PREVIEW_LENGTH = 36;

/** 「聖書」画面の入口。URL（/read/書/章?v=節）から開く箇所を決める */
export function ReaderScreen() {
  const { bookId = '', chapter = '' } = useParams();
  const [searchParams] = useSearchParams();
  const chapterNumber = Number(chapter);
  const location = useMemo<ChapterLocation | undefined>(() => {
    if (!isBookId(bookId)) return undefined;
    const candidate = { book: bookId, chapter: chapterNumber };
    return isValidLocation(translation, candidate) ? candidate : undefined;
  }, [bookId, chapterNumber]);

  if (!location) return <Navigate to="/" replace />;

  const focusVerse = Number(searchParams.get('v')) || undefined;
  // key を付けて、章が変わるたびに選択や開いているシートをまっさらにする
  return <Reader key={chapterKey(location)} location={location} focusVerse={focusVerse} />;
}

type OpenSheet =
  | { type: 'picker' }
  | { type: 'editor'; target: EditorTarget }
  | { type: 'entries' }
  | { type: 'teacher' };

interface ReaderProps {
  location: ChapterLocation;
  focusVerse?: number;
}

function Reader({ location, focusVerse }: ReaderProps) {
  const navigate = useNavigate();
  const { state, retry } = useChapter(location);
  const { showRuby } = useReaderPrefs();
  const highlighted = useChapterHighlights(location);
  const journal = useJournal();
  const bookmarks = useBookmarks();
  const [selection, setSelection] = useState<number[]>([]);
  const [sheet, setSheet] = useState<OpenSheet>();

  const chapter = state.status === 'ready' ? state.chapter : undefined;
  const book = findBook(translation, location.book);
  const passage = useMemo<PassageRef>(
    () => ({ ...location, verses: selection }),
    [location, selection],
  );
  const selected = useMemo(() => new Set(selection), [selection]);
  const noted = useMemo(() => versesWithEntries(journal, location), [journal, location]);
  const bookmarkedVerses = useMemo(
    () => versesWithBookmarks(bookmarks, location),
    [bookmarks, location],
  );
  const selectionEntries = useMemo(
    () => entriesForVerses(journal, location, selection),
    [journal, location, selection],
  );
  const chapterBookmark = findBookmark(bookmarks, location);
  const firstSelected = selection[0];
  const verseBookmark =
    firstSelected === undefined ? undefined : findBookmark(bookmarks, location, firstSelected);
  const allHighlighted = selection.length > 0 && selection.every((verse) => highlighted.has(verse));

  useEffect(() => {
    rememberLocation(location);
  }, [location]);

  // 章を開いたら先頭へ。しおりやメモから来たときは、その節が見える位置へ
  useEffect(() => {
    if (!chapter) {
      window.scrollTo(0, 0);
      return;
    }
    if (focusVerse) {
      document.querySelector(`[data-verse="${focusVerse}"]`)?.scrollIntoView({ block: 'center' });
    }
  }, [chapter, focusVerse]);

  const closeSheet = () => setSheet(undefined);
  const clearSelection = () => setSelection([]);

  const toggleVerse = (verse: number) =>
    setSelection((current) =>
      current.includes(verse)
        ? current.filter((selectedVerse) => selectedVerse !== verse)
        : [...current, verse].sort((a, b) => a - b),
    );

  const toggleHighlight = () => {
    setHighlight(location, selection, !allHighlighted);
    clearSelection();
  };

  const write = (kind: EntryKind, source: ChapterData) =>
    setSheet({
      type: 'editor',
      target: { mode: 'new', kind, passage, quote: quotePassage(source, selection) },
    });

  const toggleChapterBookmark = (source: ChapterData) => {
    if (chapterBookmark) {
      removeBookmark(chapterBookmark.id);
      return;
    }
    const firstVerse = listVerses(source)[0] ?? 1;
    addBookmark({
      ...location,
      preview: truncate(getVerseText(source, firstVerse), PREVIEW_LENGTH),
    });
  };

  const toggleVerseBookmark = (source: ChapterData) => {
    if (firstSelected === undefined) return;
    if (verseBookmark) {
      removeBookmark(verseBookmark.id);
    } else {
      addBookmark({
        ...location,
        verse: firstSelected,
        preview: truncate(getVerseText(source, firstSelected), PREVIEW_LENGTH),
      });
    }
    clearSelection();
  };

  return (
    <>
      <ReaderHeader
        location={location}
        showRuby={showRuby}
        bookmarked={chapterBookmark !== undefined}
        onOpenPicker={() => setSheet({ type: 'picker' })}
        onToggleRuby={() => setShowRuby(!showRuby)}
        onToggleBookmark={() => chapter && toggleChapterBookmark(chapter)}
      />

      <main className={cx(styles.page, selection.length > 0 && styles.selecting)}>
        {chapterBookmark && <span className={styles.ribbon} aria-hidden />}
        <header className={styles.heading}>
          <p className={styles.bookName}>{book.name}</p>
          <h1 className={styles.chapterTitle}>
            {formatChapterTitle(location.book, location.chapter)}
          </h1>
        </header>

        {state.status === 'loading' && <p className={styles.status}>本文を開いています…</p>}
        {state.status === 'error' && (
          <div className={styles.status} role="alert">
            <p>本文を読み込めませんでした。</p>
            <Button onClick={retry}>もう一度ためす</Button>
          </div>
        )}
        {chapter && (
          <>
            <ChapterView
              chapter={chapter}
              showRuby={showRuby}
              selected={selected}
              highlighted={highlighted}
              noted={noted}
              bookmarked={bookmarkedVerses}
              focusVerse={focusVerse}
              onToggleVerse={toggleVerse}
            />
            <ChapterNav location={location} />
            <p className={styles.credit}>{translation.credit}</p>
          </>
        )}
      </main>

      {chapter && selection.length > 0 && (
        <SelectionBar
          reference={formatRef(translation, passage, { short: true })}
          allHighlighted={allHighlighted}
          bookmarked={verseBookmark !== undefined}
          entryCount={selectionEntries.length}
          onToggleHighlight={toggleHighlight}
          onWrite={(kind) => write(kind, chapter)}
          onAskTeacher={() => setSheet({ type: 'teacher' })}
          onToggleBookmark={() => toggleVerseBookmark(chapter)}
          onShowEntries={() => setSheet({ type: 'entries' })}
          onClear={clearSelection}
        />
      )}

      {sheet?.type === 'picker' && (
        <PassagePicker
          current={location}
          onSelect={(target) => {
            closeSheet();
            navigate(readerPath(target));
          }}
          onClose={closeSheet}
        />
      )}
      {sheet?.type === 'editor' && (
        <EntryEditor target={sheet.target} onDone={clearSelection} onClose={closeSheet} />
      )}
      {sheet?.type === 'entries' && (
        <VerseEntriesSheet
          reference={formatRef(translation, passage, { short: true })}
          entries={selectionEntries}
          onEdit={(entry) => setSheet({ type: 'editor', target: { mode: 'edit', entry } })}
          onClose={closeSheet}
        />
      )}
      {sheet?.type === 'teacher' && chapter && (
        <TeacherSheet
          passage={passage}
          quote={quotePassage(chapter, selection)}
          onClose={closeSheet}
        />
      )}
    </>
  );
}
