/**
 * 読者が自分で入れた Anthropic の API キー。
 * この端末のブラウザにだけ保存し、パウロ先生に質問するときだけ Anthropic に送る。
 */
import { createPersistentStore, useStore } from '@/lib/persistentStore';

const store = createPersistentStore<{ apiKey?: string }>('teacher-key.v1', {});

export function getTeacherKey(): string | undefined {
  return store.get().apiKey;
}

export function useTeacherKey(): string | undefined {
  return useStore(store).apiKey;
}

export function saveTeacherKey(apiKey: string): void {
  store.update(() => ({ apiKey }));
}

export function removeTeacherKey(): void {
  store.update(() => ({}));
}

/** Anthropic の API キーらしい形か（入力まちがいを早めに知らせるための、ゆるい確認） */
export function looksLikeApiKey(value: string): boolean {
  return /^sk-ant-[\w-]{20,}$/.test(value);
}

/** 画面に出すときは、先頭と末尾だけを見せる */
export function maskKey(apiKey: string): string {
  return `${apiKey.slice(0, 7)}…${apiKey.slice(-4)}`;
}
