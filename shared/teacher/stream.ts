/**
 * パウロ先生（Claude）に質問し、返事を少しずつ受け取る。
 * サーバー（server/teacher/route.ts）と、読者が自分の API キーを使うときのブラウザの両方が使う。
 */
import Anthropic from '@anthropic-ai/sdk';
import type { ChapterData, PassageRef } from '../bible/types';
import type { TeacherErrorCode, TeacherEvent, TeacherMessage } from './contract';
import { buildChapterContext, buildSelectionNote, TEACHER_PERSONA } from './prompt';

export interface TeacherQuestion {
  passage: PassageRef;
  /** 質問の対象の章の本文 */
  chapter: ChapterData;
  messages: TeacherMessage[];
}

/**
 * 返事を、届いた順に TeacherEvent として返す。
 * 失敗は例外になる（toErrorCode で画面に伝える理由に言いかえる）。signal で途中でやめられる。
 */
export async function* streamTeacher(
  client: Anthropic,
  model: string,
  { passage, chapter, messages }: TeacherQuestion,
  signal?: AbortSignal,
): AsyncGenerator<TeacherEvent> {
  // 読者が選んだ節は、最初の発言の前に添える。
  // 章の本文より後ろに置くことで、同じ章の別の節についての質問でもキャッシュが使える
  const selectionNote = buildSelectionNote(passage);
  const conversation: Anthropic.Beta.BetaMessageParam[] = messages.map((message, index) => ({
    role: message.role,
    content:
      index === 0 && selectionNote ? `${selectionNote}\n\n${message.content}` : message.content,
  }));

  const reply = client.beta.messages.stream(
    {
      model,
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
    },
    { signal },
  );

  for await (const event of reply) {
    if (event.type === 'content_block_start' && event.content_block.type === 'fallback') {
      // 代わりのモデルが最初から答え直すので、途中まで届いた文は捨てる
      yield { type: 'reset' };
    } else if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
      yield { type: 'delta', text: event.delta.text };
    }
  }

  const { stop_reason: stopReason } = await reply.finalMessage();
  yield {
    type: 'done',
    outcome:
      stopReason === 'refusal'
        ? 'declined'
        : stopReason === 'max_tokens'
          ? 'truncated'
          : 'complete',
  };
}

/**
 * Claude 側の失敗を、画面に伝える理由に言いかえる。
 * keyOwner は API キーの持ち主：server = サーバーの設定 / reader = 読者が自分で入れたキー
 */
export function toErrorCode(error: unknown, keyOwner: 'server' | 'reader'): TeacherErrorCode {
  const keyProblem = keyOwner === 'server' ? 'not_configured' : 'invalid_key';
  if (error instanceof Anthropic.AuthenticationError) return keyProblem;
  if (error instanceof Anthropic.PermissionDeniedError) return keyProblem;
  if (error instanceof Anthropic.RateLimitError) return 'busy';
  if (error instanceof Anthropic.InternalServerError) return 'busy';
  if (error instanceof Anthropic.APIConnectionError) return 'unavailable';
  if (error instanceof Anthropic.APIError) return 'unavailable';
  // API に届く前の失敗。キーが設定されていないとここに来る
  if (error instanceof Anthropic.AnthropicError) return keyProblem;
  return 'unavailable';
}

/** 途中でやめたことによる失敗か */
export function isAbort(error: unknown): boolean {
  return error instanceof Anthropic.APIUserAbortError;
}
