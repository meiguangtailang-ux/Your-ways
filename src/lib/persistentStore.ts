/**
 * 端末（localStorage）に保存される小さな状態の入れ物。
 * 線・メモ・しおりなどはすべてこの上に載せる。
 * 保存先をクラウド同期などに替えるときは、このファイルの読み書き部分だけを差し替える。
 */
import { useSyncExternalStore } from 'react';
import { STORAGE_PREFIX } from '@/config/app';

type Listener = () => void;

export interface PersistentStore<T> {
  get(): T;
  update(updater: (previous: T) => T): void;
  subscribe(listener: Listener): () => void;
}

/**
 * @param name    保存キー。データの形を変えるときは末尾の版番号（.v1）を上げる
 * @param initial まだ何も保存されていないときの値
 * @param revive  保存されていた値を現在の形に整える（項目が増えたときの既定値の補完など）
 */
export function createPersistentStore<T>(
  name: string,
  initial: T,
  revive: (saved: T) => T = (saved) => saved,
): PersistentStore<T> {
  const key = `${STORAGE_PREFIX}:${name}`;
  const listeners = new Set<Listener>();
  let state = load();

  function load(): T {
    try {
      const raw = localStorage.getItem(key);
      return raw === null ? initial : revive(JSON.parse(raw) as T);
    } catch {
      return initial;
    }
  }

  function notify(): void {
    for (const listener of listeners) listener();
  }

  // 別のタブで変更されたら取り込む
  window.addEventListener('storage', (event) => {
    if (event.key === key) {
      state = load();
      notify();
    }
  });

  return {
    get: () => state,
    update(updater) {
      const next = updater(state);
      if (Object.is(next, state)) return;
      state = next;
      try {
        localStorage.setItem(key, JSON.stringify(state));
      } catch {
        // 保存できない環境（容量超過・プライベートブラウズ）でも、開いている間は使えるようにする
      }
      notify();
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}

export function useStore<T>(store: PersistentStore<T>): T {
  return useSyncExternalStore(store.subscribe, store.get);
}
