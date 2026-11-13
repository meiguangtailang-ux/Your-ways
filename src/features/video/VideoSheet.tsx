import { Download, Share2 } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { formatRef, translation, type PassageRef } from '@shared/bible';
import { Button } from '@/components/Button';
import { Sheet, SheetBody, SheetFooter } from '@/components/Sheet';
import { STORAGE_PREFIX } from '@/config/app';
import type { Person } from '@/features/people/people';
import { guessScenes } from '@/features/scene/guessScene';
import { planScenesWithAi, useSceneAiAvailable } from '@/features/scene/planScenesClient';
import { useAsync } from '@/lib/useAsync';
import {
  drawFrame,
  pickVideoFormat,
  prepareArt,
  recordVideo,
  VIDEO_LAYOUT,
  VIDEO_SIZE,
} from './renderVideo';
import {
  buildScript,
  pageTexts,
  totalSeconds,
  withIllustrations,
  type VideoScene,
} from './videoScript';
import styles from './VideoSheet.module.css';

type Status =
  | { type: 'ready' }
  | { type: 'planning' }
  | { type: 'recording'; ratio: number }
  | { type: 'done'; file: File; url: string; usedAi: boolean }
  | { type: 'failed' };

interface VideoSheetProps {
  passage: PassageRef;
  /** その箇所の本文 */
  quote: string;
  /** その箇所に出てくる人物 */
  people: readonly Person[];
  onClose: () => void;
}

/** 選んだ箇所を、挿絵つきで言葉が順に現れる短い動画にするシート */
export function VideoSheet({ passage, quote, people, onClose }: VideoSheetProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const abortRef = useRef<AbortController>(undefined);
  const [status, setStatus] = useState<Status>({ type: 'ready' });
  const aiAvailable = useSceneAiAvailable();
  const [useAi, setUseAi] = useState(true);
  const format = useMemo(() => pickVideoFormat(), []);
  const reference = formatRef(translation, passage);

  // 台本（文字のページ）と、言葉から推し量った挿絵
  const base = useMemo(
    () => buildScript(reference, quote, translation.name, VIDEO_LAYOUT),
    [reference, quote],
  );
  const guessed = useMemo(() => {
    const { overall, pages } = guessScenes(passage.book, quote, pageTexts(base));
    return { overall, script: withIllustrations(base, overall, pages) };
  }, [base, passage.book, quote]);
  const seconds = Math.round(totalSeconds(base));

  // 見本：書体と挿絵を用意して、題の場面を描いておく
  const { state: preview } = useAsync(`video:${reference}:${quote}`, async () => {
    const family = getComputedStyle(document.documentElement).getPropertyValue('--font-serif');
    await Promise.all(
      [500, 700].map((weight) =>
        document.fonts.load(`${weight} 42px ${family}`, reference + quote),
      ),
    );
    return prepareArt(guessed.script.slice(0, 1));
  });
  useEffect(() => {
    const context = canvasRef.current?.getContext('2d');
    if (context && preview.status === 'ready' && status.type === 'ready') {
      drawFrame(context, guessed.script, preview.value, 1);
    }
  }, [preview, guessed.script, status.type]);

  // シートを閉じたら、作るのをやめ、作った動画の置き場所を片づける
  useEffect(() => () => abortRef.current?.abort(), []);
  const videoUrl = status.type === 'done' ? status.url : undefined;
  useEffect(() => () => void (videoUrl && URL.revokeObjectURL(videoUrl)), [videoUrl]);

  /** AI に場面を考えてもらう。だめなら言葉からの推測のまま */
  const planScript = async (
    signal: AbortSignal,
  ): Promise<{ script: VideoScene[]; usedAi: boolean }> => {
    if (!aiAvailable || !useAi) return { script: guessed.script, usedAi: false };
    setStatus({ type: 'planning' });
    const planned = await planScenesWithAi(
      {
        reference,
        pages: pageTexts(base),
        people: people.map(({ id, name }) => ({ id, name })),
      },
      signal,
    );
    if (!planned) return { script: guessed.script, usedAi: false };
    return {
      script: withIllustrations(base, planned[0] ?? guessed.overall, planned),
      usedAi: true,
    };
  };

  const record = async () => {
    if (!canvasRef.current || !format) return;
    const controller = new AbortController();
    abortRef.current = controller;
    try {
      const { script, usedAi } = await planScript(controller.signal);
      const art = await prepareArt(script);
      setStatus({ type: 'recording', ratio: 0 });
      const blob = await recordVideo(
        canvasRef.current,
        script,
        art,
        format.mimeType,
        (ratio) => setStatus({ type: 'recording', ratio }),
        controller.signal,
      );
      const name = `${STORAGE_PREFIX}-${passage.book}-${passage.chapter}.${format.extension}`;
      const file = new File([blob], name, { type: blob.type });
      setStatus({ type: 'done', file, url: URL.createObjectURL(file), usedAi });
    } catch {
      if (!controller.signal.aborted) setStatus({ type: 'failed' });
    }
  };

  const busy = status.type === 'planning' || status.type === 'recording';
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
        ) : status.type === 'planning' ? (
          <p className={styles.text} role="status">
            AI が、それぞれの場面の絵を考えています…
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
            {useAi &&
              aiAvailable &&
              !status.usedAi &&
              '（AI に場面を考えてもらえなかったので、本文の言葉から絵を選びました）'}
          </p>
        ) : (
          <>
            <p className={styles.text}>
              場面の絵といっしょに、選んだ箇所の言葉が順に現れる、約{seconds}
              秒の動画を作ります（音はありません）。作るのに、動画と同じくらいの時間がかかります。
            </p>
            {aiAvailable && (
              <label className={styles.option}>
                <input
                  type="checkbox"
                  checked={useAi}
                  onChange={(event) => setUseAi(event.target.checked)}
                />
                <span>
                  AI に場面の絵を考えてもらう
                  <span className={styles.hint}>
                    より内容に合った絵になります。パウロ先生と同じしくみを使うので、少し料金がかかります。
                  </span>
                </span>
              </label>
            )}
          </>
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
            disabled={!format || preview.status !== 'ready' || busy}
            onClick={record}
          >
            動画を作る
          </Button>
        )}
      </SheetFooter>
    </Sheet>
  );
}
