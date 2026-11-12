import { useCallback, useEffect, useReducer, useRef } from 'react';
import type { PassageRef } from '@shared/bible';
import type { TeacherErrorCode, TeacherMessage } from '@shared/teacher/contract';
import { streamTeacherReply } from './teacherApi';

export interface ChatTurn {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  /** 先生の返事がふつうに終わらなかったとき：長すぎて切れた／答えられなかった */
  outcome?: 'truncated' | 'declined';
}

interface ChatState {
  turns: ChatTurn[];
  /** waiting = 返事の書き出しを待っている / streaming = 返事が届いている最中 */
  status: 'idle' | 'waiting' | 'streaming';
  error?: TeacherErrorCode;
}

type ChatAction =
  | { type: 'asked'; turn: ChatTurn }
  | { type: 'retried' }
  | { type: 'delta'; id: string; text: string }
  | { type: 'reset'; id: string }
  | { type: 'finished'; id: string; outcome: 'complete' | 'truncated' | 'declined' }
  | { type: 'failed'; id: string; code: TeacherErrorCode }
  | { type: 'stopped' };

function reduce(state: ChatState, action: ChatAction): ChatState {
  const withoutReply = (id: string) => state.turns.filter((turn) => turn.id !== id);
  const reply = (id: string) => state.turns.find((turn) => turn.id === id);

  switch (action.type) {
    case 'asked':
      return { turns: [...state.turns, action.turn], status: 'waiting' };
    case 'retried':
      return { turns: state.turns, status: 'waiting' };
    case 'delta': {
      const current = reply(action.id);
      const next: ChatTurn = {
        id: action.id,
        role: 'assistant',
        content: (current?.content ?? '') + action.text,
      };
      return { turns: [...withoutReply(action.id), next], status: 'streaming' };
    }
    case 'reset':
      return { turns: withoutReply(action.id), status: 'waiting' };
    case 'finished': {
      if (action.outcome === 'complete') return { turns: state.turns, status: 'idle' };
      // 答えられなかったときは、途中まで届いた文を残さない
      const content = action.outcome === 'declined' ? '' : (reply(action.id)?.content ?? '');
      const next: ChatTurn = { id: action.id, role: 'assistant', content, outcome: action.outcome };
      return { turns: [...withoutReply(action.id), next], status: 'idle' };
    }
    case 'failed':
      return { turns: withoutReply(action.id), status: 'idle', error: action.code };
    case 'stopped':
      return { turns: state.turns, status: 'idle' };
  }
}

/** 同じ箇所のシートを開き直したときに会話が続くよう、アプリを開いている間だけ覚えておく */
const sessions = new Map<string, ChatTurn[]>();

function sessionKey(passage: PassageRef): string {
  return `${passage.book}.${passage.chapter}:${passage.verses.join(',')}`;
}

function toMessages(turns: ChatTurn[]): TeacherMessage[] {
  return turns
    .filter((turn) => turn.content !== '')
    .map(({ role, content }) => ({ role, content }));
}

/** ある聖書箇所についての、パウロ先生との会話 */
export function useTeacherChat(passage: PassageRef) {
  const key = sessionKey(passage);
  const [state, dispatch] = useReducer(reduce, key, (initialKey): ChatState => ({
    turns: sessions.get(initialKey) ?? [],
    status: 'idle',
  }));
  const abortRef = useRef<AbortController>(undefined);

  useEffect(() => {
    sessions.set(key, state.turns);
  }, [key, state.turns]);

  // シートを閉じたら、届いている途中の返事を止める
  useEffect(() => () => abortRef.current?.abort(), []);

  const request = useCallback(
    async (turns: ChatTurn[]) => {
      const controller = new AbortController();
      abortRef.current = controller;
      const id = crypto.randomUUID();
      try {
        const events = streamTeacherReply(
          { passage, messages: toMessages(turns) },
          controller.signal,
        );
        for await (const event of events) {
          switch (event.type) {
            case 'delta':
              dispatch({ type: 'delta', id, text: event.text });
              break;
            case 'reset':
              dispatch({ type: 'reset', id });
              break;
            case 'done':
              dispatch({ type: 'finished', id, outcome: event.outcome });
              return;
            case 'error':
              dispatch({ type: 'failed', id, code: event.code });
              return;
          }
        }
        // 終わりの合図が無いまま途切れた
        dispatch({ type: 'failed', id, code: 'unavailable' });
      } catch {
        if (controller.signal.aborted) dispatch({ type: 'stopped' });
        else dispatch({ type: 'failed', id, code: 'unavailable' });
      }
    },
    [passage],
  );

  const send = (text: string) => {
    const content = text.trim();
    if (content === '' || state.status !== 'idle') return;
    const turn: ChatTurn = { id: crypto.randomUUID(), role: 'user', content };
    dispatch({ type: 'asked', turn });
    void request([...state.turns, turn]);
  };

  /** 失敗したとき、最後の質問をもう一度送る */
  const retry = () => {
    if (state.status !== 'idle') return;
    dispatch({ type: 'retried' });
    void request(state.turns);
  };

  const stop = () => abortRef.current?.abort();

  return { ...state, send, retry, stop };
}
