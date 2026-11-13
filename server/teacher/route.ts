/**
 * POST /api/teacher — パウロ先生（Claude）への質問を中継し、返事を少しずつ返す。
 * API キーをブラウザに渡さないために、Claude への通信は必ずこのサーバーを通す。
 */
import Anthropic from '@anthropic-ai/sdk';
import { getConnInfo } from '@hono/node-server/conninfo';
import { Hono, type Context } from 'hono';
import { stream } from 'hono/streaming';
import { z } from 'zod';
import { BOOK_IDS, type BookId } from '../../shared/bible/canon';
import {
  TEACHER_LIMITS,
  type TeacherErrorBody,
  type TeacherErrorCode,
  type TeacherEvent,
  type TeacherRequest,
} from '../../shared/teacher/contract';
import { config } from '../config';
import { createRateLimiter } from '../lib/rateLimit';
import { isAbort, streamTeacher, toErrorCode } from '../../shared/teacher/stream';
import { loadChapter } from './passage';

const requestSchema = z.object({
  passage: z.object({
    book: z.enum(BOOK_IDS as [BookId, ...BookId[]]),
    chapter: z.number().int().min(1),
    verses: z.array(z.number().int().min(1)).max(200),
  }),
  messages: z
    .array(
      z.object({
        role: z.enum(['user', 'assistant']),
        content: z.string().trim().min(1).max(TEACHER_LIMITS.maxMessageLength),
      }),
    )
    .min(1)
    .max(TEACHER_LIMITS.maxMessages)
    .refine((messages) => messages.at(-1)?.role === 'user', '最後は読者の発言であること'),
}) satisfies z.ZodType<TeacherRequest>;

const limiter = createRateLimiter(config.rateLimit);

/** 環境変数 ANTHROPIC_API_KEY を読む。最初の質問が来たときに1度だけ作る */
let client: Anthropic | undefined;

function fail(c: Context, status: 400 | 429, code: TeacherErrorCode) {
  return c.json({ code } satisfies TeacherErrorBody, status);
}

function clientKey(c: Context): string {
  // プロキシ（ホスティングの入口）を通ると接続元がプロキシになるので、転送元の記録を優先する
  const forwarded = c.req.header('x-forwarded-for')?.split(',')[0]?.trim();
  return forwarded || getConnInfo(c).remote.address || 'unknown';
}

export const teacherRoute = new Hono().post('/', async (c) => {
  if (!limiter.take(clientKey(c))) return fail(c, 429, 'rate_limited');

  const parsed = requestSchema.safeParse(await c.req.json().catch(() => undefined));
  if (!parsed.success) return fail(c, 400, 'invalid_request');
  const { passage, messages } = parsed.data;

  const chapter = await loadChapter(passage.book, passage.chapter);
  if (!chapter) return fail(c, 400, 'invalid_request');

  c.header('Content-Type', 'application/x-ndjson; charset=utf-8');
  c.header('Cache-Control', 'no-store');
  c.header('X-Accel-Buffering', 'no');

  return stream(c, async (output) => {
    const send = (event: TeacherEvent) => output.write(`${JSON.stringify(event)}\n`);
    // 読者がシートを閉じたら、Claude への問い合わせも止める
    const controller = new AbortController();
    output.onAbort(() => controller.abort());

    try {
      client ??= new Anthropic();
      const question = { passage, chapter, messages };
      for await (const event of streamTeacher(
        client,
        config.teacherModel,
        question,
        controller.signal,
      )) {
        await send(event);
      }
    } catch (error) {
      if (isAbort(error)) return;
      console.error('[teacher]', error);
      await send({ type: 'error', code: toErrorCode(error, 'server') });
    }
  });
});
