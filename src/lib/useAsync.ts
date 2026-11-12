import { useEffect, useEffectEvent, useState } from 'react';

export type AsyncState<T> =
  { status: 'loading' } | { status: 'ready'; value: T } | { status: 'error' };

/**
 * 時間のかかる読み込みの結果を持つ。
 * key が変わると読み込み直し、retry() で同じものをやり直せる。
 */
export function useAsync<T>(
  key: string,
  load: () => Promise<T>,
): { state: AsyncState<T>; retry: () => void } {
  const [attempt, setAttempt] = useState(0);
  const [settled, setSettled] = useState<{ token: string; state: AsyncState<T> }>();
  const token = `${key}#${attempt}`;
  const run = useEffectEvent(load);

  useEffect(() => {
    let cancelled = false;
    run().then(
      (value) => {
        if (!cancelled) setSettled({ token, state: { status: 'ready', value } });
      },
      () => {
        if (!cancelled) setSettled({ token, state: { status: 'error' } });
      },
    );
    return () => {
      cancelled = true;
    };
  }, [token]);

  return {
    // key が変わった直後は、前の結果を見せずに読み込み中として扱う
    state: settled?.token === token ? settled.state : { status: 'loading' },
    retry: () => setAttempt((count) => count + 1),
  };
}
