/**
 * パウロ先生の API（POST /api/teacher）の取り決め。画面とサーバーの両方が使う。
 *
 * 画面は「どの箇所について」「これまでの会話」を送る。
 * サーバーは返事を1行1件の JSON（NDJSON）で少しずつ返す。
 */
import type { PassageRef } from '../bible/types';

export const TEACHER_API_PATH = '/api/teacher';

/** パウロ先生に使う Claude のモデル（サーバーは環境変数 TEACHER_MODEL で変えられる） */
export const TEACHER_MODEL = 'claude-opus-5-5';

export const TEACHER_LIMITS = {
  /** 1回の会話で送れる発言の数 */
  maxMessages: 40,
  /** 1つの発言の最大文字数 */
  maxMessageLength: 2000,
} as const;

export interface TeacherMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface TeacherRequest {
  /** 質問の対象。verses が空なら章全体 */
  passage: PassageRef;
  /** これまでの会話。最後は読者の発言 */
  messages: TeacherMessage[];
}

export const TEACHER_ERROR_CODES = [
  /** 送った内容が受け付けられない（長すぎる・形が違う） */
  'invalid_request',
  /** サーバーに API キーが設定されていない */
  'not_configured',
  /** 先生を使うには、読者が自分の API キーを設定する必要がある（サーバーの無い公開版） */
  'needs_key',
  /** 読者が設定した API キーが受け付けられない */
  'invalid_key',
  /** 短い時間に質問が多すぎる */
  'rate_limited',
  /** AI 側が混みあっている */
  'busy',
  /** つながらない・その他の失敗 */
  'unavailable',
] as const;

export type TeacherErrorCode = (typeof TEACHER_ERROR_CODES)[number];

/** HTTP エラー（4xx/5xx）のときの本文 */
export interface TeacherErrorBody {
  code: TeacherErrorCode;
}

/** 返事のストリームに流れる1件 */
export type TeacherEvent =
  /** 返事の続きの文字 */
  | { type: 'delta'; text: string }
  /** ここまでの返事を捨てて、書き直す */
  | { type: 'reset' }
  /** 返事の終わり。truncated = 長すぎて途中で切れた / declined = 答えられなかった */
  | { type: 'done'; outcome: 'complete' | 'truncated' | 'declined' }
  | { type: 'error'; code: TeacherErrorCode };
