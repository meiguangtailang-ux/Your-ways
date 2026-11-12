import {
  TEACHER_API_PATH,
  TEACHER_ERROR_CODES,
  type TeacherErrorCode,
  type TeacherEvent,
  type TeacherRequest,
} from '@shared/teacher/contract';
import { API_BASE_URL } from '@/config/app';

/**
 * パウロ先生に質問を送り、返事を届いた順に受け取る。
 * 通信そのものの失敗は例外になる（中断したときの AbortError を含む）。
 */
export async function* streamTeacherReply(
  request: TeacherRequest,
  signal: AbortSignal,
): AsyncGenerator<TeacherEvent> {
  const response = await fetch(API_BASE_URL + TEACHER_API_PATH, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
    signal,
  });
  if (!response.ok || !response.body) {
    yield { type: 'error', code: await readErrorCode(response) };
    return;
  }

  // 1行に1件の JSON が届く。行の途中で区切れて届くことがあるので、改行までためてから読む
  const reader = response.body.pipeThrough(new TextDecoderStream()).getReader();
  let buffer = '';
  for (;;) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += value;
    const lines = buffer.split('\n');
    buffer = lines.pop() ?? '';
    for (const line of lines) {
      if (line.trim() !== '') yield JSON.parse(line) as TeacherEvent;
    }
  }
}

async function readErrorCode(response: Response): Promise<TeacherErrorCode> {
  try {
    const body: unknown = await response.json();
    const code = (body as { code?: unknown } | null)?.code;
    if (isErrorCode(code)) return code;
  } catch {
    // API の無い場所（静的ホスティングなど）では JSON が返らない
  }
  return 'unavailable';
}

function isErrorCode(value: unknown): value is TeacherErrorCode {
  return (TEACHER_ERROR_CODES as readonly unknown[]).includes(value);
}
