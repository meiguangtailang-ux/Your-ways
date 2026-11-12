/**
 * 画面側の設定。アプリ名など、ビルドとも共有する基本情報は shared/appInfo.ts にある。
 */
import type { ChapterLocation } from '@shared/bible';

export { APP_NAME, PAPER_COLOR, STORAGE_PREFIX } from '@shared/appInfo';

/** AI の先生の呼び名 */
export const TEACHER_NAME = 'パウロ先生';

/** はじめて開いたときに表示する箇所 */
export const DEFAULT_LOCATION: ChapterLocation = { book: 'gen', chapter: 1 };

/**
 * パウロ先生（API サーバー）が使えるか。
 * 画面だけを公開する場所（GitHub Pages など）では VITE_TEACHER_AVAILABLE=false でビルドする。
 */
export const TEACHER_AVAILABLE = import.meta.env.VITE_TEACHER_AVAILABLE !== 'false';

/** パウロ先生の API の置き場所。画面と別のサーバーに置くときだけ VITE_API_BASE_URL を設定する */
export const API_BASE_URL: string = import.meta.env.VITE_API_BASE_URL ?? '';
