/**
 * 読者の API キーで、ブラウザから直接パウロ先生（Claude）と話す。
 * Anthropic の SDK は大きいので、このファイルは先生を使うときにだけ読み込む（teacherApi.ts）。
 */
import Anthropic from '@anthropic-ai/sdk';
import { TEACHER_MODEL, type TeacherEvent, type TeacherRequest } from '@shared/teacher/contract';
import { streamTeacher, toErrorCode } from '@shared/teacher/stream';
import { loadBook } from '@/features/bible/loadBook';

function createClient(apiKey: string): Anthropic {
  // ブラウザから直接使うことを、SDK に明示する。キーは読者自身のもので、この端末から出ていくのは
  // Anthropic への通信だけ
  return new Anthropic({ apiKey, dangerouslyAllowBrowser: true });
}

export async function* streamWithOwnKey(
  apiKey: string,
  { passage, messages }: TeacherRequest,
  signal: AbortSignal,
): AsyncGenerator<TeacherEvent> {
  try {
    const chapter = (await loadBook(passage.book)).chapters[passage.chapter - 1];
    if (!chapter) {
      yield { type: 'error', code: 'invalid_request' };
      return;
    }
    yield* streamTeacher(
      createClient(apiKey),
      TEACHER_MODEL,
      { passage, chapter, messages },
      signal,
    );
  } catch (error) {
    // やめたときは、そのことを呼び出し側（useTeacherChat）に例外のまま伝える
    if (signal.aborted) throw error;
    yield { type: 'error', code: toErrorCode(error, 'reader') };
  }
}

export type KeyCheck = 'ok' | 'invalid' | 'unreachable';

/** キーが使えるかを確かめる（モデルの情報を読むだけなので、料金はかからない） */
export async function checkKey(apiKey: string): Promise<KeyCheck> {
  try {
    await createClient(apiKey).models.retrieve(TEACHER_MODEL);
    return 'ok';
  } catch (error) {
    return toErrorCode(error, 'reader') === 'invalid_key' ? 'invalid' : 'unreachable';
  }
}
