import { useState, type FormEvent } from 'react';
import { Button } from '@/components/Button';
import { TEACHER_NAME, TEACHER_SERVER_AVAILABLE } from '@/config/app';
import type { KeyCheck } from './ownKeyTeacher';
import {
  looksLikeApiKey,
  maskKey,
  removeTeacherKey,
  saveTeacherKey,
  useTeacherKey,
} from './teacherKey';
import styles from './TeacherKeySection.module.css';

type Status =
  | { type: 'idle' }
  | { type: 'checking' }
  | { type: 'result'; check: KeyCheck | 'malformed' | 'removed' };

const MESSAGE: Record<KeyCheck | 'malformed' | 'removed', string> = {
  ok: `使えることを確かめました。${TEACHER_NAME}と話せます。`,
  invalid: 'このキーは使えないようです。コピーしたキーが正しいか、確かめてください。',
  unreachable:
    'いまは確かめられませんでした（通信の状態を確かめてください）。キーは保存してあります。',
  malformed: 'API キーは「sk-ant-」で始まる文字です。もう一度、確かめてください。',
  removed: 'キーを削除しました。',
};

async function check(apiKey: string): Promise<KeyCheck> {
  const { checkKey } = await import('./ownKeyTeacher');
  return checkKey(apiKey);
}

/** 設定画面の「パウロ先生」：読者が自分の Anthropic API キーを入れる */
export function TeacherKeySection() {
  const savedKey = useTeacherKey();
  const [draft, setDraft] = useState('');
  const [status, setStatus] = useState<Status>({ type: 'idle' });

  const save = async (event: FormEvent) => {
    event.preventDefault();
    const apiKey = draft.trim();
    if (!looksLikeApiKey(apiKey)) {
      setStatus({ type: 'result', check: 'malformed' });
      return;
    }
    setStatus({ type: 'checking' });
    const result = await check(apiKey);
    // 使えないとはっきりしたキーは保存しない。確かめられなかっただけなら保存しておく
    if (result !== 'invalid') {
      saveTeacherKey(apiKey);
      setDraft('');
    }
    setStatus({ type: 'result', check: result });
  };

  const recheck = async () => {
    if (!savedKey) return;
    setStatus({ type: 'checking' });
    setStatus({ type: 'result', check: await check(savedKey) });
  };

  const remove = () => {
    removeTeacherKey();
    setStatus({ type: 'result', check: 'removed' });
  };

  return (
    <>
      <p className={styles.text}>
        {TEACHER_NAME}は、Anthropic の AI（Claude）で動いています。
        {TEACHER_SERVER_AVAILABLE
          ? '自分の API キーを入れると、そのキーで先生と話します。'
          : '先生と話すには、自分の API キーをここに入れてください。'}
        キーは{' '}
        <a href="https://platform.claude.com/settings/keys" target="_blank" rel="noreferrer">
          platform.claude.com
        </a>{' '}
        で作れます。料金は、質問した分だけ、そのキーの持ち主にかかります。
      </p>

      {savedKey ? (
        <div className={styles.saved}>
          <p>
            設定されています <code className={styles.key}>{maskKey(savedKey)}</code>
          </p>
          <div className={styles.actions}>
            <Button disabled={status.type === 'checking'} onClick={recheck}>
              使えるか確かめる
            </Button>
            <Button variant="quiet" onClick={remove}>
              削除する
            </Button>
          </div>
        </div>
      ) : (
        <form className={styles.form} onSubmit={save}>
          <input
            className={styles.input}
            type="password"
            autoComplete="off"
            spellCheck={false}
            aria-label="Anthropic の API キー"
            placeholder="sk-ant-…"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
          />
          <Button
            type="submit"
            variant="solid"
            disabled={draft.trim() === '' || status.type === 'checking'}
          >
            {status.type === 'checking' ? '確かめています…' : '保存する'}
          </Button>
        </form>
      )}

      {status.type === 'result' && (
        <p className={styles.result} role="status">
          {MESSAGE[status.check]}
        </p>
      )}

      <p className={styles.note}>
        キーはこの端末のブラウザにだけ保存され、{TEACHER_NAME}
        に質問するときだけ Anthropic に送られます。ほかの人も使う端末には、入れないでください。
      </p>
    </>
  );
}
