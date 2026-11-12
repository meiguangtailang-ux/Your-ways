import { Check, Download } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/Button';
import { useInstallPrompt } from './installPrompt';
import { countSaved, saveAll, type SaveProgress } from './offlineBible';
import { isOfflineSupported } from './serviceWorker';
import styles from './OfflineSection.module.css';

type Status = 'idle' | 'saving' | 'failed';

/** 設定画面の「オフライン」：本文を端末に保存する・ホーム画面に追加する */
export function OfflineSection() {
  const supported = isOfflineSupported();
  const [progress, setProgress] = useState<SaveProgress>();
  const [status, setStatus] = useState<Status>('idle');
  const install = useInstallPrompt();

  useEffect(() => {
    if (supported) void countSaved().then(setProgress);
  }, [supported]);

  const save = async () => {
    setStatus('saving');
    try {
      await saveAll(setProgress);
      setStatus('idle');
    } catch {
      setStatus('failed');
    }
  };

  // 本文が出そろっても、文字（フォント）を保存し終えるまでは「保存中」のままにする
  const complete =
    status !== 'saving' && progress !== undefined && progress.saved === progress.total;

  return (
    <>
      <p className={styles.text}>
        聖書の本文をこの端末に保存しておくと、電波のないところでも読んだり、さがしたりできます（約16MB）。
        パウロ先生への質問には、通信が必要です。
      </p>
      {!supported ? (
        <p className={styles.note}>この開き方では、端末への保存は使えません。</p>
      ) : complete ? (
        <p className={styles.done} role="status">
          <Check size={16} aria-hidden />
          本文は、この端末に保存されています
        </p>
      ) : (
        <div className={styles.actions}>
          <Button disabled={status === 'saving'} onClick={save}>
            <Download size={16} aria-hidden />
            {status === 'saving' ? '保存しています…' : '本文を保存する'}
          </Button>
          {status === 'saving' && progress && (
            <progress
              className={styles.progress}
              aria-label="保存の進み具合"
              value={progress.saved}
              max={progress.total}
            />
          )}
          {status === 'failed' && (
            <p className={styles.note} role="alert">
              保存できませんでした。通信の状態をたしかめて、もう一度ためしてください。
            </p>
          )}
        </div>
      )}

      <p className={styles.text}>
        ホーム画面に追加すると、アプリのようにすぐ開けます。
        {!install &&
          'ブラウザのメニュー（共有ボタンなど）から「ホーム画面に追加」を選んでください。'}
      </p>
      {install && (
        <div className={styles.actions}>
          <Button onClick={install}>ホーム画面に追加する</Button>
        </div>
      )}
    </>
  );
}
