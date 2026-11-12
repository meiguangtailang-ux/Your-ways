import { Link } from 'react-router';
import { formatRef, translation } from '@shared/bible';
import { formatDate } from '@/lib/date';
import { readerPath } from '@/lib/routes';
import { ENTRY_KIND_LABEL, type JournalEntry } from './journalStore';
import styles from './EntryCard.module.css';

interface EntryCardProps {
  entry: JournalEntry;
  /** 箇所を、その節を開くリンクにするか（読む画面の中で使うときは不要） */
  linkToPassage?: boolean;
  onEdit: (entry: JournalEntry) => void;
}

/** メモ・祈り1件の表示 */
export function EntryCard({ entry, linkToPassage, onEdit }: EntryCardProps) {
  const reference = entry.ref && formatRef(translation, entry.ref);

  return (
    <article className={styles.card}>
      <header className={styles.meta}>
        <span className={styles.kind}>{ENTRY_KIND_LABEL[entry.kind]}</span>
        <time dateTime={entry.createdAt}>{formatDate(entry.createdAt)}</time>
        <button type="button" className={styles.edit} onClick={() => onEdit(entry)}>
          直す
        </button>
      </header>
      {entry.ref &&
        (linkToPassage ? (
          <Link className={styles.reference} to={readerPath(entry.ref, entry.ref.verses[0])}>
            {reference}
          </Link>
        ) : (
          <p className={styles.reference}>{reference}</p>
        ))}
      {entry.quote && <p className={styles.quote}>{entry.quote}</p>}
      <p className={styles.body}>{entry.body}</p>
    </article>
  );
}
