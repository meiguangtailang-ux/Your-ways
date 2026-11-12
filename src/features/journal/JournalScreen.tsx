import { Plus } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/Button';
import { EmptyState } from '@/components/EmptyState';
import { ScreenHeader } from '@/components/ScreenHeader';
import { Segmented } from '@/components/Segmented';
import { HighlightList } from '@/features/highlights/HighlightList';
import { EntryCard } from './EntryCard';
import { EntryEditor, type EditorTarget } from './EntryEditor';
import type { EntryKind } from './journalModel';
import { useJournal } from './journalStore';
import styles from './JournalScreen.module.css';

/** entries = メモと祈りの両方 / highlights = 線を引いた箇所 */
type Filter = 'entries' | EntryKind | 'highlights';

const FILTERS = [
  { value: 'entries', label: 'メモと祈り' },
  { value: 'note', label: 'メモ' },
  { value: 'prayer', label: '祈り' },
  { value: 'highlights', label: '線' },
] as const satisfies readonly { value: Filter; label: string }[];

/**
 * 「ノート」画面：書きためたメモと祈り、線を引いた箇所を読み返す。
 * 節に結びつかない祈りも、ここから書ける。
 */
export function JournalScreen() {
  const entries = useJournal();
  const [filter, setFilter] = useState<Filter>('entries');
  const [editing, setEditing] = useState<EditorTarget>();
  const shown = filter === 'entries' ? entries : entries.filter((entry) => entry.kind === filter);

  return (
    <main className={styles.screen}>
      <ScreenHeader
        title="ノート"
        action={
          <Button variant="solid" onClick={() => setEditing({ mode: 'new', kind: 'prayer' })}>
            <Plus size={16} aria-hidden />
            祈りを書く
          </Button>
        }
      />
      <Segmented label="表示する種類" options={FILTERS} value={filter} onChange={setFilter} />

      {filter === 'highlights' ? (
        <HighlightList />
      ) : shown.length === 0 ? (
        <EmptyState title="まだ何も書かれていません">
          聖書を読んで気になる節を押すと、
          <br />
          メモや祈りを書きのこせます。
        </EmptyState>
      ) : (
        <div className={styles.list}>
          {shown.map((entry) => (
            <EntryCard
              key={entry.id}
              entry={entry}
              linkToPassage
              onEdit={(target) => setEditing({ mode: 'edit', entry: target })}
            />
          ))}
        </div>
      )}

      {editing && <EntryEditor target={editing} onClose={() => setEditing(undefined)} />}
    </main>
  );
}
