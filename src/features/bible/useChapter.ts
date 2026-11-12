import type { ChapterData, ChapterLocation } from '@shared/bible';
import { useAsync } from '@/lib/useAsync';
import { loadBook } from './loadBook';

export type ChapterState =
  { status: 'loading' } | { status: 'ready'; chapter: ChapterData } | { status: 'error' };

/** 指定した章の本文。retry() で読み込みをやり直せる */
export function useChapter({ book, chapter }: ChapterLocation): {
  state: ChapterState;
  retry: () => void;
} {
  const { state, retry } = useAsync(`${book}.${chapter}`, async () => {
    const found = (await loadBook(book)).chapters[chapter - 1];
    if (!found) throw new Error(`章が見つかりません: ${book} ${chapter}`);
    return found;
  });
  return {
    state: state.status === 'ready' ? { status: 'ready', chapter: state.value } : state,
    retry,
  };
}
