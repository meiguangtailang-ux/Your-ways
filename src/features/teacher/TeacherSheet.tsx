import { ArrowUp, Check, NotebookPen, Square } from 'lucide-react';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import { formatRef, translation, type PassageRef } from '@shared/bible';
import { TEACHER_LIMITS, type TeacherErrorCode } from '@shared/teacher/contract';
import { Button } from '@/components/Button';
import { Sheet } from '@/components/Sheet';
import { TEACHER_AVAILABLE, TEACHER_NAME } from '@/config/app';
import { addEntry } from '@/features/journal/journalStore';
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
  /** メモに保存した答え */
  const [savedIds, setSavedIds] = useState<ReadonlySet<string>>(new Set());
  const endRef = useRef<HTMLDivElement>(null);
  const busy = chat.status !== 'idle';

  // 会話が進むたびに、いちばん新しい発言が見えるようにする
  useEffect(() => {
    if (chat.turns.length > 0 || chat.error) endRef.current?.scrollIntoView({ block: 'end' });
  }, [chat.turns, chat.status, chat.error]);

  /** 先生の答えを、その前の質問と一緒に、この箇所のメモとして残す */
  const saveAsNote = (answer: ChatTurn, question: ChatTurn | undefined) => {
    addEntry({
      kind: 'note',
      ref: passage,
      quote,
      source: 'teacher',
      body: question ? `Q. ${question.content}\n\n${answer.content}` : answer.content,
    });
    setSavedIds((current) => new Set(current).add(answer.id));
  };

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

        {!TEACHER_AVAILABLE && (
          <p className={styles.unavailable} role="status">
            この公開版では、{TEACHER_NAME}はまだ使えません。先生と話すには、API
            サーバーといっしょに動かす必要があります。
          </p>
        )}

        {TEACHER_AVAILABLE && chat.turns.length === 0 && !busy && (
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

        {chat.turns.map((turn, index) => {
          if (turn.role === 'user') {
            return (
              <p key={turn.id} className={cx(styles.turn, styles.question)}>
                {turn.content}
              </p>
            );
          }
          // 答えが届いている途中は、まだ保存できない
          const streaming = busy && index === chat.turns.length - 1;
          return (
            <Answer
              key={turn.id}
              turn={turn}
              saved={savedIds.has(turn.id)}
              onSave={
                turn.content && !streaming
                  ? () => saveAsNote(turn, chat.turns.slice(0, index).findLast(isQuestion))
                  : undefined
              }
            />
          );
        })}

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
          disabled={!TEACHER_AVAILABLE}
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

function isQuestion(turn: ChatTurn): boolean {
  return turn.role === 'user';
}

interface AnswerProps {
  turn: ChatTurn;
  saved: boolean;
  /** メモに保存する。保存できないとき（答えの途中・答えが無い）は渡さない */
  onSave?: () => void;
}

function Answer({ turn, saved, onSave }: AnswerProps) {
  return (
    <div className={cx(styles.turn, styles.answer)}>
      <p className={styles.speaker}>{TEACHER_NAME}</p>
      {turn.content && <p className={styles.answerText}>{turn.content}</p>}
      {turn.outcome && <p className={styles.note}>{OUTCOME_NOTE[turn.outcome]}</p>}
      {onSave &&
        (saved ? (
          <p className={styles.saved} role="status">
            <Check size={14} aria-hidden />
            メモに保存しました
          </p>
        ) : (
          <button type="button" className={styles.save} onClick={onSave}>
            <NotebookPen size={14} aria-hidden />
            メモに保存
          </button>
        ))}
    </div>
  );
}
