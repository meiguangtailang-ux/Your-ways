import { ChevronLeft } from 'lucide-react';
import { useState } from 'react';
import {
  chapterUnit,
  findBook,
  translation,
  type BookId,
  type ChapterLocation,
  type Testament,
} from '@shared/bible';
import { Button } from '@/components/Button';
import { Segmented } from '@/components/Segmented';
import { Sheet, SheetBody } from '@/components/Sheet';
import { cx } from '@/lib/cx';
import styles from './PassagePicker.module.css';

const TESTAMENTS = [
  { value: 'ot', label: '旧約聖書' },
  { value: 'nt', label: '新約聖書' },
] as const satisfies readonly { value: Testament; label: string }[];

interface PassagePickerProps {
  current: ChapterLocation;
  onSelect: (location: ChapterLocation) => void;
  onClose: () => void;
}

/** 書を選び、つづけて章を選ぶシート */
export function PassagePicker({ current, onSelect, onClose }: PassagePickerProps) {
  const [testament, setTestament] = useState<Testament>(
    () => findBook(translation, current.book).testament,
  );
  const [bookId, setBookId] = useState<BookId>();
  const book = bookId && findBook(translation, bookId);

  const chooseBook = (id: BookId) => {
    // 1章しかない書は、そのまま開く
    if (findBook(translation, id).chapters === 1) onSelect({ book: id, chapter: 1 });
    else setBookId(id);
  };

  if (book) {
    return (
      <Sheet
        title={book.name}
        caption={`${chapterUnit(book.id)}を選んでください`}
        onClose={onClose}
      >
        <SheetBody>
          <Button variant="quiet" className={styles.back} onClick={() => setBookId(undefined)}>
            <ChevronLeft size={16} aria-hidden />
            書の一覧にもどる
          </Button>
          <div className={styles.chapters}>
            {Array.from({ length: book.chapters }, (_, index) => index + 1).map((chapter) => (
              <button
                key={chapter}
                type="button"
                className={cx(
                  styles.cell,
                  book.id === current.book && chapter === current.chapter && styles.current,
                )}
                aria-label={`${chapter}${chapterUnit(book.id)}`}
                onClick={() => onSelect({ book: book.id, chapter })}
              >
                {chapter}
              </button>
            ))}
          </div>
        </SheetBody>
      </Sheet>
    );
  }

  return (
    <Sheet title="書を選ぶ" onClose={onClose}>
      <SheetBody>
        <Segmented
          label="旧約と新約の切り替え"
          options={TESTAMENTS}
          value={testament}
          onChange={setTestament}
        />
        <div className={styles.books}>
          {translation.books
            .filter((candidate) => candidate.testament === testament)
            .map((candidate) => (
              <button
                key={candidate.id}
                type="button"
                className={cx(styles.cell, candidate.id === current.book && styles.current)}
                aria-label={candidate.name}
                onClick={() => chooseBook(candidate.id)}
              >
                {candidate.shortName}
              </button>
            ))}
        </div>
      </SheetBody>
    </Sheet>
  );
}
