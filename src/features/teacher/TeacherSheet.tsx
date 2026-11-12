import { ArrowUp, Square } from 'lucide-react';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import { formatRef, translation, type PassageRef } from '@shared/bible';
import { TEACHER_LIMITS, type TeacherErrorCode } from '@shared/teacher/contract';
import { Button } from '@/components/Button';
import { Sheet } from '@/components/Sheet';
import { TEACHER_NAME } from '@/config/app';
import { PassageQuote } from '@/features/journal/PassageQuote';
import { cx } from '@/lib/cx';
import { useTeacherChat, type ChatTurn } from './useTeacherChat';
import styles from './TeacherSheet.module.css';

/** 最初の一歩になる質問の例 */
const STARTERS = [
  'この箇所は、どういう意味ですか？',
  'むずかしい言葉を、やさしく説明してください。',
  '前後の流れを教えてください。',
  'いまの生活と、どうつながりますか？',
];

const ERROR_MESSAGE: Record<TeacherErrorCode, string> = {
  invalid_request: '質問をうまく送れませんでした。短くして、もう一度ためしてください。',
  not_configured: `${TEACHER_NAME}は、まだ準備中です。（サーバーに API キーが設定されていません）`,
  rate_limited: '質問が続いたので、少し時間をおいてから、もう一度たずねてください。',
  busy: '先生がいま混みあっています。少し待ってから、もう一度ためしてください。',
  unavailable: '先生につながりませんでした。通信の状態をたしかめて、もう一度ためしてください。',
};

const OUTCOME_NOTE: Record<NonNullable<ChatTurn['outcome']>, string> = {
  truncated: '（話が長くなったので、ここで区切りました。続きが知りたいときは、たずねてください。）',
  declined:
    'この質問には、うまく答えられませんでした。聞き方を変えて、もう一度たずねてみてください。',
};

interface TeacherSheetProps {
  passage: PassageRef;
  /** その箇所の本文 */
  quote: string;
  onClose: () => void;
}

/** 選んだ箇所について、パウロ先生（AI）と対話するシート */
export function TeacherSheet({ passage, quote, onClose }: TeacherSheetProps) {
  const chat = useTeacherChat(passage);
  const [draft, setDraft] = useState('');
  const endRef = useRef<HTMLDivElement>(null);
  const busy = chat.status !== 'idle';

  // 会話が進むたびに、いちばん新しい発言が見えるようにする
  useEffect(() => {
    if (chat.turns.length > 0 || chat.error) endRef.current?.scrollIntoView({ block: 'end' });
  }, [chat.turns, chat.status, chat.error]);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (busy || draft.trim() === '') return;
    chat.send(draft);
    setDraft('');
  };

  return (
    <Sheet
      title={TEACHER_NAME}
      caption="AIの先生に、この箇所について質問できます"
      tall
      onClose={onClose}
    >
      <div className={styles.conversation}>
        <PassageQuote reference={formatRef(translation, passage)} quote={quote} />

        {chat.turns.length === 0 && !busy && (
          <ul className={styles.starters} aria-label="質問の例">
            {STARTERS.map((question) => (
              <li key={question}>
                <button
                  type="button"
                  className={styles.starter}
                  onClick={() => chat.send(question)}
                >
                  {question}
                </button>
              </li>
            ))}
          </ul>
        )}

        {chat.turns.map((turn) => (
          <Turn key={turn.id} turn={turn} />
        ))}

        {chat.status === 'waiting' && (
          <p className={styles.waiting} role="status">
            先生が考えています
            <span className={styles.dots} aria-hidden />
          </p>
        )}

        {chat.error && (
          <div className={styles.error} role="alert">
            <p>{ERROR_MESSAGE[chat.error]}</p>
            <Button onClick={chat.retry}>もう一度ためす</Button>
          </div>
        )}
        <div ref={endRef} />
      </div>

      <form className={styles.composer} onSubmit={submit}>
        <textarea
          className={styles.input}
          aria-label={`${TEACHER_NAME}への質問`}
          placeholder="先生に質問する"
          rows={1}
          maxLength={TEACHER_LIMITS.maxMessageLength}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
        />
        {busy ? (
          <button
            type="button"
            className={styles.send}
            aria-label="返事を止める"
            onClick={chat.stop}
          >
            <Square size={16} fill="currentColor" aria-hidden />
          </button>
        ) : (
          <button
            type="submit"
            className={styles.send}
            aria-label="質問を送る"
            disabled={draft.trim() === ''}
          >
            <ArrowUp size={20} aria-hidden />
          </button>
        )}
      </form>
      <p className={styles.disclaimer}>
        {TEACHER_NAME}
        はAIです。まちがえることもあります。大切なことは、聖書の本文や信頼できる人にも確かめてください。
      </p>
    </Sheet>
  );
}

function Turn({ turn }: { turn: ChatTurn }) {
  if (turn.role === 'user')
    return <p className={cx(styles.turn, styles.question)}>{turn.content}</p>;
  return (
    <div className={cx(styles.turn, styles.answer)}>
      <p className={styles.speaker}>{TEACHER_NAME}</p>
      {turn.content && <p className={styles.answerText}>{turn.content}</p>}
      {turn.outcome && <p className={styles.note}>{OUTCOME_NOTE[turn.outcome]}</p>}
    </div>
  );
}
