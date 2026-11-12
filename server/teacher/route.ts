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
import { loadChapter } from './passage';
import { buildChapterContext, buildSelectionNote, TEACHER_PERSONA } from './prompt';

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

/** Claude 側の失敗を、画面に伝える理由に言いかえる */
function toErrorCode(error: unknown): TeacherErrorCode {
  if (error instanceof Anthropic.AuthenticationError) return 'not_configured';
  if (error instanceof Anthropic.PermissionDeniedError) return 'not_configured';
  if (error instanceof Anthropic.RateLimitError) return 'busy';
  if (error instanceof Anthropic.InternalServerError) return 'busy';
  if (error instanceof Anthropic.APIConnectionError) return 'unavailable';
  if (error instanceof Anthropic.APIError) return 'unavailable';
  // API に届く前の失敗。キーが設定されていないとここに来る
  if (error instanceof Anthropic.AnthropicError) return 'not_configured';
  return 'unavailable';
}

export const teacherRoute = new Hono().post('/', async (c) => {
  if (!limiter.take(clientKey(c))) return fail(c, 429, 'rate_limited');

  const parsed = requestSchema.safeParse(await c.req.json().catch(() => undefined));
  if (!parsed.success) return fail(c, 400, 'invalid_request');
  const { passage, messages } = parsed.data;

  const chapter = await loadChapter(passage.book, passage.chapter);
  if (!chapter) return fail(c, 400, 'invalid_request');

  // 読者が選んだ節は、最初の発言の前に添える。
  // 章の本文より後ろに置くことで、同じ章の別の節についての質問でもキャッシュが使える
  const selectionNote = buildSelectionNote(passage);
  const conversation: Anthropic.Beta.BetaMessageParam[] = messages.map((message, index) => ({
    role: message.role,
    content:
      index === 0 && selectionNote ? `${selectionNote}\n\n${message.content}` : message.content,
  }));

  c.header('Content-Type', 'application/x-ndjson; charset=utf-8');
  c.header('Cache-Control', 'no-store');
  c.header('X-Accel-Buffering', 'no');

  return stream(c, async (output) => {
    const send = (event: TeacherEvent) => output.write(`${JSON.stringify(event)}\n`);

    try {
      client ??= new Anthropic();
      const reply = client.beta.messages.stream({
        model: config.teacherModel,
        max_tokens: 16000,
        output_config: { effort: 'medium' },
        // 安全上の理由でモデルが答えを断ったとき、代わりのモデルで答え直す
        betas: ['server-side-fallback-2026-07-01'],
        fallbacks: 'default',
        // 会話が進むたびに、前回までの分をキャッシュから読む
        cache_control: { type: 'ephemeral' },
        system: [
          { type: 'text', text: TEACHER_PERSONA },
          {
            type: 'text',
            text: buildChapterContext(passage, chapter),
            cache_control: { type: 'ephemeral' },
          },
        ],
        messages: conversation,
      });
      // 読者がシートを閉じたら、Claude への問い合わせも止める
      output.onAbort(() => reply.abort());

      for await (const event of reply) {
        if (event.type === 'content_block_start' && event.content_block.type === 'fallback') {
          // 代わりのモデルが最初から答え直すので、途中まで届いた文は捨てる
          await send({ type: 'reset' });
        } else if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
          await send({ type: 'delta', text: event.delta.text });
        }
      }

      const { stop_reason: stopReason } = await reply.finalMessage();
      await send({
        type: 'done',
        outcome:
          stopReason === 'refusal'
            ? 'declined'
            : stopReason === 'max_tokens'
              ? 'truncated'
              : 'complete',
      });
    } catch (error) {
      if (error instanceof Anthropic.APIUserAbortError) return;
      console.error('[teacher]', error);
      await send({ type: 'error', code: toErrorCode(error) });
    }
  });
});
