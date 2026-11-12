/**
 * 「ホーム画面に追加」の案内。
 * 対応しているブラウザ（Android の Chrome など）は、追加できる状態になると合図を出す。
 * その合図を取っておき、設定画面のボタンから呼び出せるようにする。
 */
import { useSyncExternalStore } from 'react';

/** ブラウザの合図（標準の型定義にまだ無いので、使う部分だけ書く） */
interface InstallPromptEvent extends Event {
  prompt(): Promise<void>;
}

let pending: InstallPromptEvent | undefined;
const listeners = new Set<() => void>();

function set(next: InstallPromptEvent | undefined): void {
  pending = next;
  for (const listener of listeners) listener();
}

export function watchInstallPrompt(): void {
  window.addEventListener('beforeinstallprompt', (event) => {
    // ブラウザが自分で出す案内は止めて、設定画面のボタンから出す
    event.preventDefault();
    set(event as InstallPromptEvent);
  });
  window.addEventListener('appinstalled', () => set(undefined));
}

/** いま追加できるなら、追加の確認を出す関数。できなければ undefined */
export function useInstallPrompt(): (() => void) | undefined {
  const event = useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    () => pending,
  );
  if (!event) return undefined;
  return () => {
    void event.prompt();
    set(undefined);
  };
}
