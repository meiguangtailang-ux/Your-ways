/**
 * サーバーの設定。値は環境変数（.env）から読む。
 */
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

export const config = {
  port: Number(process.env.PORT ?? 8787),

  /** パウロ先生に使う Claude のモデル */
  teacherModel: process.env.TEACHER_MODEL ?? 'claude-opus-5-5',

  /** 画面を別のオリジンに置くときに、そのオリジンを許可する（同じサーバーから配信するなら不要） */
  corsOrigin: process.env.CORS_ORIGIN,

  /** 同じ相手から受け付ける質問の数（使いすぎ・いたずらで API 料金がふくらむのを防ぐ） */
  rateLimit: { windowMs: 10 * 60 * 1000, max: 30 },

  /** ビルド済みの画面（npm run build の出力） */
  distDir: path.join(ROOT_DIR, 'dist'),

  /** 聖書本文の置き場所。ビルド後は dist 側、開発中は public 側を読む */
  bibleDirs: [path.join(ROOT_DIR, 'dist/bible'), path.join(ROOT_DIR, 'public/bible')],
} as const;
