/**
 * 表示の好み（文字の大きさ・ふりがな・組み方・配色）。端末に保存される。
 */
import { createPersistentStore, useStore } from '@/lib/persistentStore';

export type TextSize = 'small' | 'medium' | 'large' | 'xlarge';
export type WritingMode = 'horizontal' | 'vertical';
/** auto = 端末の設定（ダークモード）に合わせる */
export type Theme = 'light' | 'dark' | 'auto';

export interface DisplayPrefs {
  textSize: TextSize;
  showRuby: boolean;
  writingMode: WritingMode;
  theme: Theme;
}

const DEFAULTS: DisplayPrefs = {
  textSize: 'medium',
  showRuby: true,
  writingMode: 'horizontal',
  theme: 'light',
};

/** 保存キー（display.v1）は index.html の冒頭のスクリプトも読んでいる。変えるときは両方直す */
export const displayPrefsStore = createPersistentStore<DisplayPrefs>(
  'display.v1',
  DEFAULTS,
  (saved) => ({ ...DEFAULTS, ...saved }),
);

export function useDisplayPrefs(): DisplayPrefs {
  return useStore(displayPrefsStore);
}

export function setDisplayPref<Key extends keyof DisplayPrefs>(
  key: Key,
  value: DisplayPrefs[Key],
): void {
  displayPrefsStore.update((prefs) => (prefs[key] === value ? prefs : { ...prefs, [key]: value }));
}
