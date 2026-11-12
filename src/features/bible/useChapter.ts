import { useEffect, useState } from 'react';
import type { ChapterData, ChapterLocation } from '@shared/bible';
import { loadBook } from './loadBook';

export type ChapterState =
  { status: 'loading' } | { status: 'ready'; chapter: ChapterData } | { status: 'error' };

interface Loaded {
  /** どの箇所・何回目の読み込みの結果か */
  token: string;
  state: ChapterState;
}

/** 指定した章の本文。retry() で読み込みをやり直せる */
export function useChapter({ book, chapter }: ChapterLocation): {
  state: ChapterState;
  retry: () => void;
} {
  const [attempt, setAttempt] = useState(0);
  const [loaded, setLoaded] = useState<Loaded>();
  const token = `${book}.${chapter}.${attempt}`;

  useEffect(() => {
    let cancelled = false;
    loadBook(book).then(
      (data) => {
        if (cancelled) return;
        const found = data.chapters[chapter - 1];
        setLoaded({
          token,
          state: found ? { status: 'ready', chapter: found } : { status: 'error' },
        });
      },
      () => {
        if (!cancelled) setLoaded({ token, state: { status: 'error' } });
      },
    );
    return () => {
      cancelled = true;
    };
  }, [book, chapter, token]);

  return {
    // 箇所が変わった直後は、前の章の結果を見せずに読み込み中として扱う
    state: loaded?.token === token ? loaded.state : { status: 'loading' },
    retry: () => setAttempt((count) => count + 1),
  };
}
