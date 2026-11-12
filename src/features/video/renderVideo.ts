/**
 * 台本（videoScript.ts）を、画面（canvas）に描き、動画ファイルとして録画する。
 * 外のサービスは使わず、端末の中だけで作る。色はクリーム・金・黒の3色。
 */
import { PAPER_COLOR } from '@/config/app';
import { chibiSvg, type ChibiLook } from '@/features/people/chibi';
import { sceneAt, totalSeconds, type VideoScene } from './videoScript';

/** 縦長（スマホで見やすい 9:16） */
export const VIDEO_SIZE = { width: 720, height: 1280 } as const;

/** 本文の組み方。台本を作るときも同じ値を使う */
export const VIDEO_LAYOUT = { charactersPerLine: 13, linesPerPage: 9 } as const;

const COLORS = { paper: PAPER_COLOR.light, ink: '#1d1a16', gold: '#b0892f' };
const FONT_SIZE = 42;
const LINE_HEIGHT = 84;
const FADE_SECONDS = 0.6;
const FRAMES_PER_SECOND = 30;

function serifFont(weight: number, size: number): string {
  const family = getComputedStyle(document.documentElement).getPropertyValue('--font-serif');
  return `${weight} ${size}px ${family}`;
}

/** 人物のイラストを、canvas に描ける画像にする */
export function loadChibiImages(looks: readonly ChibiLook[]): Promise<HTMLImageElement[]> {
  return Promise.all(
    looks.map(
      (look) =>
        new Promise<HTMLImageElement>((resolve, reject) => {
          const image = new Image();
          image.onload = () => resolve(image);
          image.onerror = reject;
          image.src = `data:image/svg+xml,${encodeURIComponent(chibiSvg(look, COLORS))}`;
        }),
    ),
  );
}

/** 場面の出だしと終わりで、ふわりと現れて消えるための濃さ（0〜1） */
function fade(elapsed: number, seconds: number): number {
  return Math.max(0, Math.min(1, elapsed / FADE_SECONDS, (seconds - elapsed) / FADE_SECONDS));
}

function drawLines(context: CanvasRenderingContext2D, lines: string[], centerY: number): void {
  const top = centerY - ((lines.length - 1) * LINE_HEIGHT) / 2;
  lines.forEach((line, index) => {
    context.fillText(line, VIDEO_SIZE.width / 2, top + index * LINE_HEIGHT);
  });
}

/** 時刻 t（秒）の1こまを描く */
export function drawFrame(
  context: CanvasRenderingContext2D,
  scenes: readonly VideoScene[],
  chibis: readonly HTMLImageElement[],
  t: number,
): void {
  const { width, height } = VIDEO_SIZE;
  context.globalAlpha = 1;
  context.fillStyle = COLORS.paper;
  context.fillRect(0, 0, width, height);

  // 紙の上下に引く、金の細い線
  context.fillStyle = COLORS.gold;
  context.fillRect(width / 2 - 60, 120, 120, 2);
  context.fillRect(width / 2 - 60, height - 120, 120, 2);

  const current = sceneAt(scenes, t);
  if (!current) return;
  const { scene, elapsed } = current;
  context.globalAlpha = fade(elapsed, scene.seconds);
  context.textAlign = 'center';
  context.textBaseline = 'middle';

  if (scene.kind === 'text') {
    context.fillStyle = COLORS.ink;
    context.font = serifFont(500, FONT_SIZE);
    drawLines(context, scene.lines, height / 2);
    return;
  }

  // 題と出典：箇所を大きく。題には人物のイラスト、出典には翻訳の名前を添える
  const [reference = '', credit] = scene.lines;
  context.fillStyle = COLORS.ink;
  context.font = serifFont(700, 46);
  context.fillText(reference, width / 2, height / 2);
  if (scene.kind === 'title') {
    const size = 150;
    const gap = 16;
    const left = (width - (chibis.length * size + (chibis.length - 1) * gap)) / 2;
    chibis.forEach((chibi, index) => {
      context.drawImage(
        chibi,
        left + index * (size + gap),
        height / 2 - 130 - size * 1.2,
        size,
        size * 1.2,
      );
    });
  } else if (credit) {
    context.fillStyle = COLORS.gold;
    context.font = serifFont(500, 26);
    context.fillText(credit, width / 2, height / 2 + 80);
  }
}

/** この端末で録画できる形式。できなければ undefined */
export function pickVideoFormat(): { mimeType: string; extension: string } | undefined {
  if (typeof MediaRecorder === 'undefined') return undefined;
  const candidates = [
    { mimeType: 'video/mp4;codecs=avc1', extension: 'mp4' },
    { mimeType: 'video/mp4', extension: 'mp4' },
    { mimeType: 'video/webm;codecs=vp9', extension: 'webm' },
    { mimeType: 'video/webm', extension: 'webm' },
  ];
  return candidates.find((format) => MediaRecorder.isTypeSupported(format.mimeType));
}

/**
 * 台本を最初から最後まで再生しながら録画する（台本の長さと同じだけ時間がかかる）。
 * onProgress には、進み具合（0〜1）が届く。signal で途中でやめられる。
 */
export function recordVideo(
  canvas: HTMLCanvasElement,
  scenes: readonly VideoScene[],
  chibis: readonly HTMLImageElement[],
  mimeType: string,
  onProgress: (ratio: number) => void,
  signal: AbortSignal,
): Promise<Blob> {
  const context = canvas.getContext('2d')!;
  const duration = totalSeconds(scenes);
  const recorder = new MediaRecorder(canvas.captureStream(FRAMES_PER_SECOND), {
    mimeType,
    videoBitsPerSecond: 4_000_000,
  });
  const chunks: Blob[] = [];
  recorder.ondataavailable = (event) => chunks.push(event.data);

  return new Promise((resolve, reject) => {
    recorder.onstop = () =>
      signal.aborted
        ? reject(new DOMException('録画をやめました', 'AbortError'))
        : resolve(new Blob(chunks, { type: mimeType }));
    signal.addEventListener('abort', () => recorder.state !== 'inactive' && recorder.stop());

    const startedAt = performance.now();
    const tick = () => {
      if (recorder.state === 'inactive') return;
      const t = (performance.now() - startedAt) / 1000;
      drawFrame(context, scenes, chibis, Math.min(t, duration));
      onProgress(Math.min(t / duration, 1));
      if (t >= duration) recorder.stop();
      else requestAnimationFrame(tick);
    };
    drawFrame(context, scenes, chibis, 0);
    recorder.start();
    requestAnimationFrame(tick);
  });
}
