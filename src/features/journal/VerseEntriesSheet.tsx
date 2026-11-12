import { Sheet, SheetBody } from '@/components/Sheet';
import { EntryCard } from './EntryCard';
import type { JournalEntry } from './journalModel';

interface VerseEntriesSheetProps {
  /** 箇所（例：ヨハネ 3:16） */
  reference: string;
  entries: JournalEntry[];
  onEdit: (entry: JournalEntry) => void;
  onClose: () => void;
}

/** 選んだ節に付いているメモ・祈りの一覧 */
export function VerseEntriesSheet({ reference, entries, onEdit, onClose }: VerseEntriesSheetProps) {
  return (
    <Sheet title="メモと祈り" caption={reference} onClose={onClose}>
      <SheetBody>
        {entries.map((entry) => (
          <EntryCard key={entry.id} entry={entry} onEdit={onEdit} />
        ))}
      </SheetBody>
    </Sheet>
  );
}
