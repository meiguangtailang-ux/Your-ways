import {
  Bookmark,
  ChevronRight,
  HandHeart,
  Highlighter,
  MessageCircleQuestion,
  PenLine,
  X,
  type LucideIcon,
} from 'lucide-react';
import { IconButton } from '@/components/IconButton';
import type { EntryKind } from '@/features/journal/journalStore';
import { TEACHER_NAME } from '@/config/app';
import styles from './SelectionBar.module.css';

interface SelectionBarProps {
  /** 選択中の箇所（例：ヨハネ 3:16-17） */
  reference: string;
  /** 選択中の節すべてに線が引かれているか */
  allHighlighted: boolean;
  /** 選択中の先頭の節にしおりがあるか */
  bookmarked: boolean;
  /** 選択中の節に付いているメモ・祈りの数 */
  entryCount: number;
  onToggleHighlight: () => void;
  onWrite: (kind: EntryKind) => void;
  onAskTeacher: () => void;
  onToggleBookmark: () => void;
  onShowEntries: () => void;
  onClear: () => void;
}

/** 節を選んでいるあいだ、画面の下に出る操作バー */
export function SelectionBar({
  reference,
  allHighlighted,
  bookmarked,
  entryCount,
  onToggleHighlight,
  onWrite,
  onAskTeacher,
  onToggleBookmark,
  onShowEntries,
  onClear,
}: SelectionBarProps) {
  return (
    <section className={styles.bar} aria-label="選んだ節の操作">
      <div className={styles.panel}>
        <div className={styles.head}>
          <p className={styles.reference}>{reference}</p>
          {entryCount > 0 && (
            <button type="button" className={styles.entries} onClick={onShowEntries}>
              メモ・祈り {entryCount}件
              <ChevronRight size={14} aria-hidden />
            </button>
          )}
          <IconButton label="選択をやめる" onClick={onClear}>
            <X size={20} aria-hidden />
          </IconButton>
        </div>
        <div className={styles.actions}>
          <Action
            icon={Highlighter}
            label={allHighlighted ? '線を消す' : '線を引く'}
            onClick={onToggleHighlight}
          />
          <Action icon={PenLine} label="メモ" onClick={() => onWrite('note')} />
          <Action icon={HandHeart} label="祈り" onClick={() => onWrite('prayer')} />
          <Action icon={MessageCircleQuestion} label={TEACHER_NAME} onClick={onAskTeacher} />
          <Action
            icon={Bookmark}
            label={bookmarked ? 'しおりを外す' : 'しおり'}
            filled={bookmarked}
            onClick={onToggleBookmark}
          />
        </div>
      </div>
    </section>
  );
}

interface ActionProps {
  icon: LucideIcon;
  label: string;
  filled?: boolean;
  onClick: () => void;
}

function Action({ icon: Icon, label, filled, onClick }: ActionProps) {
  return (
    <button type="button" className={styles.action} onClick={onClick}>
      <Icon size={22} strokeWidth={1.6} fill={filled ? 'currentColor' : 'none'} aria-hidden />
      <span>{label}</span>
    </button>
  );
}
