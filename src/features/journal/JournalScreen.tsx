import { Plus } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/Button';
import { EmptyState } from '@/components/EmptyState';
import { ScreenHeader } from '@/components/ScreenHeader';
import { Segmented } from '@/components/Segmented';
import { EntryCard } from './EntryCard';
import { EntryEditor, type EditorTarget } from './EntryEditor';
import { useJournal, type EntryKind } from './journalStore';
import styles from './JournalScreen.module.css';

type Filter = 'all' | EntryKind;

const FILTERS = [
  { value: 'all', label: 'すべて' },
  { value: 'note', label: 'メモ' },
  { value: 'prayer', label: '祈り' },
] as const satisfies readonly { value: Filter; label: string }[];

/** 「ノート」画面：書きためたメモと祈りを読み返す。節に結びつかない祈りもここから書ける */
export function JournalScreen() {
  const entries = useJournal();
  const [filter, setFilter] = useState<Filter>('all');
  const [editing, setEditing] = useState<EditorTarget>();
  const shown = filter === 'all' ? entries : entries.filter((entry) => entry.kind === filter);

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

      {shown.length === 0 ? (
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
