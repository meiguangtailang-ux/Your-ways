import { useState } from 'react';
import { formatRef, translation, type PassageRef } from '@shared/bible';
import { Button } from '@/components/Button';
import { Sheet, SheetBody, SheetFooter } from '@/components/Sheet';
import {
  addEntry,
  deleteEntry,
  ENTRY_KIND_LABEL,
  updateEntry,
  type EntryKind,
  type JournalEntry,
} from './journalStore';
import { PassageQuote } from './PassageQuote';
import styles from './EntryEditor.module.css';

/** 新しく書く（passage が無ければ、節に結びつかない記録）か、既存の記録を直すか */
export type EditorTarget =
  | { mode: 'new'; kind: EntryKind; passage?: PassageRef; quote?: string }
  | { mode: 'edit'; entry: JournalEntry };

const PLACEHOLDER: Record<EntryKind, string> = {
  note: '気づいたこと、心に残ったことを書きましょう',
  prayer: '祈りの言葉を、そのまま書きましょう',
};

interface EntryEditorProps {
  target: EditorTarget;
  /** 保存・削除したとき（閉じる直前）に呼ばれる */
  onDone?: () => void;
  onClose: () => void;
}

/** メモ・祈りを書く／直すシート */
export function EntryEditor({ target, onDone, onClose }: EntryEditorProps) {
  const existing = target.mode === 'edit' ? target.entry : undefined;
  const { kind, passage, quote } =
    target.mode === 'edit'
      ? { kind: target.entry.kind, passage: target.entry.ref, quote: target.entry.quote }
      : target;

  const [body, setBody] = useState(existing?.body ?? '');
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const trimmed = body.trim();
  const canSave = trimmed !== '' && trimmed !== existing?.body;

  const finish = () => {
    onDone?.();
    onClose();
  };

  const save = () => {
    if (!canSave) return;
    if (existing) updateEntry(existing.id, trimmed);
    else addEntry({ kind, ref: passage, quote, body: trimmed });
    finish();
  };

  const remove = () => {
    if (existing) deleteEntry(existing.id);
    finish();
  };

  return (
    <Sheet title={`${ENTRY_KIND_LABEL[kind]}を${existing ? '直す' : '書く'}`} onClose={onClose}>
      <SheetBody className={styles.body}>
        {passage && <PassageQuote reference={formatRef(translation, passage)} quote={quote} />}
        <textarea
          className={styles.textarea}
          aria-label={ENTRY_KIND_LABEL[kind]}
          placeholder={PLACEHOLDER[kind]}
          value={body}
          autoFocus
          rows={7}
          onChange={(event) => setBody(event.target.value)}
        />
      </SheetBody>
      <SheetFooter>
        {confirmingDelete ? (
          <>
            <p className={styles.confirm}>この{ENTRY_KIND_LABEL[kind]}を削除しますか？</p>
            <Button variant="quiet" onClick={() => setConfirmingDelete(false)}>
              やめる
            </Button>
            <Button variant="solid" onClick={remove}>
              削除する
            </Button>
          </>
        ) : (
          <>
            {existing && (
              <Button variant="quiet" onClick={() => setConfirmingDelete(true)}>
                削除
              </Button>
            )}
            <Button variant="solid" className={styles.save} disabled={!canSave} onClick={save}>
              保存する
            </Button>
          </>
        )}
      </SheetFooter>
    </Sheet>
  );
}
