import { Download, Upload } from 'lucide-react';
import { useRef, useState, type ChangeEvent } from 'react';
import { Button } from '@/components/Button';
import { downloadBackup, restoreBackup, type RestoreSummary } from './backup';
import styles from './BackupSection.module.css';

type Result = { type: 'restored'; summary: RestoreSummary } | { type: 'failed' };

function describe(summary: RestoreSummary): string {
  const parts = [
    summary.entries > 0 && `メモ・祈り ${summary.entries}件`,
    summary.bookmarks > 0 && `しおり ${summary.bookmarks}件`,
    summary.highlightedVerses > 0 && `線 ${summary.highlightedVerses}節`,
  ].filter(Boolean);
  return parts.length > 0
    ? `${parts.join('、')}を読み込みました。`
    : '新しく足す記録はありませんでした（すでにこの端末にあります）。';
}

/** 設定画面の「バックアップ」：記録をファイルに書き出す・ファイルから読み込む */
export function BackupSection() {
  const fileInput = useRef<HTMLInputElement>(null);
  const [result, setResult] = useState<Result>();

  const restore = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    // 同じファイルをもう一度選べるように、選択を空に戻しておく
    event.target.value = '';
    if (!file) return;
    try {
      setResult({ type: 'restored', summary: await restoreBackup(file) });
    } catch {
      setResult({ type: 'failed' });
    }
  };

  return (
    <>
      <p className={styles.text}>
        線・メモ・祈り・しおりを、1つのファイルに書き出せます。機種を変えるときや、万一にそなえて保存しておけます。
        読み込むと、ファイルの記録がこの端末の記録に足されます（いまある記録は消えません）。
      </p>
      <div className={styles.actions}>
        <Button onClick={downloadBackup}>
          <Download size={16} aria-hidden />
          書き出す
        </Button>
        <Button onClick={() => fileInput.current?.click()}>
          <Upload size={16} aria-hidden />
          読み込む
        </Button>
        <input
          ref={fileInput}
          type="file"
          accept="application/json,.json"
          aria-label="読み込むバックアップファイル"
          hidden
          onChange={restore}
        />
      </div>
      {result && (
        <p className={styles.result} role="status">
          {result.type === 'restored'
            ? describe(result.summary)
            : 'このファイルは読み込めませんでした。このアプリで書き出したファイルを選んでください。'}
        </p>
      )}
    </>
  );
}
