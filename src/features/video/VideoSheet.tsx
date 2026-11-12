import { Download, Share2 } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { formatRef, translation, type PassageRef } from '@shared/bible';
import { Button } from '@/components/Button';
import { Sheet, SheetBody, SheetFooter } from '@/components/Sheet';
import { STORAGE_PREFIX } from '@/config/app';
import type { Person } from '@/features/people/people';
import { useAsync } from '@/lib/useAsync';
import {
  drawFrame,
  loadChibiImages,
  pickVideoFormat,
  recordVideo,
  VIDEO_LAYOUT,
  VIDEO_SIZE,
} from './renderVideo';
import { buildScript, totalSeconds } from './videoScript';
import styles from './VideoSheet.module.css';

/** 題に並べるイラストの数 */
const MAX_CHIBIS = 3;

type Status =
  | { type: 'ready' }
  | { type: 'recording'; ratio: number }
  | { type: 'done'; file: File; url: string }
  | { type: 'failed' };

interface VideoSheetProps {
  passage: PassageRef;
  /** その箇所の本文 */
  quote: string;
  /** その箇所に出てくる人物（題にイラストを添える） */
  people: readonly Person[];
  onClose: () => void;
}

/** 選んだ箇所を、文字が順に現れる短い動画にするシート */
export function VideoSheet({ passage, quote, people, onClose }: VideoSheetProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const abortRef = useRef<AbortController>(undefined);
  const [status, setStatus] = useState<Status>({ type: 'ready' });
  const format = useMemo(() => pickVideoFormat(), []);
  const reference = formatRef(translation, passage);
  const scenes = useMemo(
    () => buildScript(reference, quote, translation.name, VIDEO_LAYOUT),
    [reference, quote],
  );
  const seconds = Math.round(totalSeconds(scenes));

  // 描く前に、イラストと、本文に使う文字の書体を用意しておく
  const { state: assets } = useAsync(`video:${reference}`, async () => {
    const family = getComputedStyle(document.documentElement).getPropertyValue('--font-serif');
    await Promise.all(
      [500, 700].map((weight) =>
        document.fonts.load(`${weight} 42px ${family}`, reference + quote),
      ),
    );
    return loadChibiImages(people.slice(0, MAX_CHIBIS).map((person) => person.look));
  });
  const chibis = assets.status === 'ready' ? assets.value : undefined;

  // 作る前は、題の場面を見本として見せる
  useEffect(() => {
    const context = canvasRef.current?.getContext('2d');
    if (context && chibis && status.type === 'ready') drawFrame(context, scenes, chibis, 1);
  }, [scenes, chibis, status.type]);

  // シートを閉じたら、録画をやめ、作った動画の置き場所を片づける
  useEffect(() => () => abortRef.current?.abort(), []);
  const videoUrl = status.type === 'done' ? status.url : undefined;
  useEffect(() => () => void (videoUrl && URL.revokeObjectURL(videoUrl)), [videoUrl]);

  const record = async () => {
    if (!canvasRef.current || !chibis || !format) return;
    const controller = new AbortController();
    abortRef.current = controller;
    setStatus({ type: 'recording', ratio: 0 });
    try {
      const blob = await recordVideo(
        canvasRef.current,
        scenes,
        chibis,
        format.mimeType,
        (ratio) => setStatus({ type: 'recording', ratio }),
        controller.signal,
      );
      const name = `${STORAGE_PREFIX}-${passage.book}-${passage.chapter}.${format.extension}`;
      const file = new File([blob], name, { type: blob.type });
      setStatus({ type: 'done', file, url: URL.createObjectURL(file) });
    } catch {
      if (!controller.signal.aborted) setStatus({ type: 'failed' });
    }
  };

  const canShare = status.type === 'done' && navigator.canShare?.({ files: [status.file] });

  return (
    <Sheet title="動画にする" caption={reference} onClose={onClose}>
      <SheetBody className={styles.body}>
        {status.type === 'done' ? (
          <video className={styles.screen} src={status.url} controls playsInline loop />
        ) : (
          <canvas ref={canvasRef} className={styles.screen} {...VIDEO_SIZE} />
        )}

        {!format ? (
          <p className={styles.text} role="alert">
            このブラウザでは、動画を作ることができません。
          </p>
        ) : status.type === 'recording' ? (
          <>
            <progress
              className={styles.progress}
              aria-label="動画づくりの進み具合"
              value={status.ratio}
            />
            <p className={styles.text} role="status">
              動画を作っています。この画面を開いたまま、お待ちください…
            </p>
          </>
        ) : status.type === 'failed' ? (
          <p className={styles.text} role="alert">
            動画を作れませんでした。もう一度ためしてください。
          </p>
        ) : status.type === 'done' ? (
          <p className={styles.text} role="status">
            動画ができました。
          </p>
        ) : (
          <p className={styles.text}>
            選んだ箇所の言葉が順に現れる、約{seconds}秒の動画を作ります（音はありません）。
            作るのに、動画と同じだけの時間がかかります。
          </p>
        )}
      </SheetBody>
      <SheetFooter>
        {status.type === 'done' ? (
          <>
            <Button onClick={() => setStatus({ type: 'ready' })}>作り直す</Button>
            {canShare && (
              <Button
                onClick={() => void navigator.share({ files: [status.file] }).catch(() => {})}
              >
                <Share2 size={16} aria-hidden />
                共有
              </Button>
            )}
            <a className={styles.save} href={status.url} download={status.file.name}>
              <Download size={16} aria-hidden />
              保存する
            </a>
          </>
        ) : (
          <Button
            variant="solid"
            className={styles.start}
            disabled={!format || !chibis || status.type === 'recording'}
            onClick={record}
          >
            動画を作る
          </Button>
        )}
      </SheetFooter>
    </Sheet>
  );
}
