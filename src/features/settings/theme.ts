/**
 * 配色（昼・夜）を画面に反映する。
 * <html data-theme="light | dark"> を切り替えると、tokens.css の色が入れ替わる。
 */
import { PAPER_COLOR } from '@/config/app';
import { displayPrefsStore, type Theme } from './displayPrefs';

const DARK_QUERY = '(prefers-color-scheme: dark)';

/** 「自動」を、端末の設定から昼か夜に決める（index.html の冒頭のスクリプトと同じ決め方） */
export function resolveTheme(theme: Theme, deviceIsDark: boolean): 'light' | 'dark' {
  if (theme === 'auto') return deviceIsDark ? 'dark' : 'light';
  return theme;
}

/** いまの設定を反映し、設定や端末の配色が変わるたびに反映し直す */
export function watchTheme(): void {
  const device = window.matchMedia(DARK_QUERY);
  const apply = () => {
    const resolved = resolveTheme(displayPrefsStore.get().theme, device.matches);
    document.documentElement.dataset.theme = resolved;
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute('content', PAPER_COLOR[resolved]);
  };
  apply();
  displayPrefsStore.subscribe(apply);
  device.addEventListener('change', apply);
}
