/**
 * アプリ全体の設定。
 * アプリ名はまだ仮。決まったら APP_NAME を書き換える（画面とタブの題名に反映される）。
 */
import type { ChapterLocation } from '@shared/bible';

export const APP_NAME = 'Your Ways';

/** AI の先生の呼び名 */
export const TEACHER_NAME = 'パウロ先生';

/** 端末に保存するデータのキーの接頭辞。変えると既存の保存データが読めなくなる */
export const STORAGE_PREFIX = 'your-ways';

/** はじめて開いたときに表示する箇所 */
export const DEFAULT_LOCATION: ChapterLocation = { book: 'gen', chapter: 1 };

/** パウロ先生の API の置き場所。画面と別のサーバーに置くときだけ VITE_API_BASE_URL を設定する */
export const API_BASE_URL: string = import.meta.env.VITE_API_BASE_URL ?? '';
