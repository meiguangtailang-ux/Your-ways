import { X } from 'lucide-react';
import { Link } from 'react-router';
import { formatRef, quotePassage, translation, type PassageRef } from '@shared/bible';
import { EmptyState } from '@/components/EmptyState';
import { IconButton } from '@/components/IconButton';
import { useChapter } from '@/features/bible/useChapter';
import { readerPath } from '@/lib/routes';
import { setHighlight, useHighlightedPassages } from './highlightStore';
import styles from './HighlightList.module.css';

/** 線を引いた箇所の一覧（聖書の順） */
export function HighlightList() {
  const passages = useHighlightedPassages();

  if (passages.length === 0) {
    return (
      <EmptyState title="線を引いた箇所はまだありません">
        聖書を読んで心にとまった節を押し、
        <br />
        「線を引く」を選ぶと、ここに並びます。
      </EmptyState>
    );
  }

  return (
    <ul className={styles.list}>
      {passages.map((passage) => (
        <HighlightItem
          key={`${passage.book}.${passage.chapter}.${passage.verses[0]}`}
          passage={passage}
        />
      ))}
    </ul>
  );
}

function HighlightItem({ passage }: { passage: PassageRef }) {
  // 線は節番号だけを保存しているので、本文は書のデータから取り出して見せる
  const { state } = useChapter(passage);
  const reference = formatRef(translation, passage);

  return (
    <li className={styles.item}>
      <Link className={styles.link} to={readerPath(passage, passage.verses[0])}>
        <span className={styles.reference}>{reference}</span>
        {state.status === 'ready' && (
          <span className={styles.text}>
            <span className={styles.marked}>{quotePassage(state.chapter, passage.verses)}</span>
          </span>
        )}
      </Link>
      <IconButton
        label={`${reference} の線を消す`}
        onClick={() => setHighlight(passage, passage.verses, false)}
      >
        <X size={18} aria-hidden />
      </IconButton>
    </li>
  );
}
