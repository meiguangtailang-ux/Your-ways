/**
 * 台本（videoScript.ts）を、画面（canvas）に描き、動画ファイルとして録画する。
 * 外のサービスは使わず、端末の中だけで作る。色はクリーム・金・黒の3色。
 *
 * 1ページの組み方（縦長 720×1280）
 *   上：挿絵（その場面の背景・小物・人物。人物は本文に合わせて動く：castMotion.ts）
 *   下：本文（1行ずつ現れる）
 */
import type { Scene } from '@shared/scene/vocabulary';
import { PAPER_COLOR } from '@/config/app';
import {
  castPlacements,
  castSvg,
  SCENE_SIZE,
  sceneBackgroundSvg,
  type CastPlacement,
} from '@/features/scene/sceneArt';
import { castMotion, lineReveal } from './castMotion';
import { sceneAt, totalSeconds, type VideoScene } from './videoScript';

/** 縦長（スマホで見やすい 9:16） */
export const VIDEO_SIZE = { width: 720, height: 1280 } as const;

/** 本文の組み方。台本を作るときも同じ値を使う */
export const VIDEO_LAYOUT = { charactersPerLine: 13, linesPerPage: 5 } as const;

const COLORS = { paper: PAPER_COLOR.light, ink: '#1d1a16', gold: '#b0892f', sunk: '#efe7d2' };
/** 挿絵を置く枠 */
const PANEL = { x: 60, y: 150, width: SCENE_SIZE.width, height: SCENE_SIZE.height, radius: 28 };
const FONT_SIZE = 42;
const LINE_HEIGHT = 84;
/** 本文の行のまん中の高さ */
const TEXT_CENTER = 860;
const FADE_SECONDS = 0.6;
const FRAMES_PER_SECOND = 30;

function serifFont(weight: number, size: number): string {
  const family = getComputedStyle(document.documentElement).getPropertyValue('--font-serif');
  return `${weight} ${size}px ${family}`;
}

function loadSvg(svg: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = `data:image/svg+xml,${encodeURIComponent(svg)}`;
  });
}

/** 描く用意のできた挿絵：背景（小物をふくむ）と、動かす人物（話す人は口を開けた絵も） */
interface PreparedArt {
  background: HTMLImageElement;
  cast: { image: HTMLImageElement; mouthOpen?: HTMLImageElement; placement: CastPlacement }[];
}

export type ArtBook = Map<string, PreparedArt>;

const sceneKey = (scene: Scene) => JSON.stringify(scene);

/** 台本に出てくる挿絵を、すべて絵にしておく（同じ場面は1回だけ） */
export async function prepareArt(scenes: readonly VideoScene[]): Promise<ArtBook> {
  const book: ArtBook = new Map();
  for (const { illustration } of scenes) {
    if (!illustration || book.has(sceneKey(illustration))) continue;
    const placements = castPlacements(illustration);
    const [background, cast] = await Promise.all([
      loadSvg(sceneBackgroundSvg(illustration, COLORS)),
      Promise.all(
        placements.map(async (placement) => ({
          placement,
          image: await loadSvg(castSvg(placement, COLORS)),
          mouthOpen:
            placement.action === 'speak'
              ? await loadSvg(castSvg(placement, COLORS, { mouthOpen: true }))
              : undefined,
        })),
      ),
    ]);
    book.set(sceneKey(illustration), { background, cast });
  }
  return book;
}

/** 場面の出だしと終わりで、ふわりと現れて消えるための濃さ（0〜1） */
function fade(elapsed: number, seconds: number): number {
  return Math.max(0, Math.min(1, elapsed / FADE_SECONDS, (seconds - elapsed) / FADE_SECONDS));
}

function roundedPanel(context: CanvasRenderingContext2D): void {
  context.beginPath();
  context.roundRect(PANEL.x, PANEL.y, PANEL.width, PANEL.height, PANEL.radius);
}

/** 頭の近くの飾り：話す吹き出し・祈りの光・眠りの「z」 */
function drawEffect(
  context: CanvasRenderingContext2D,
  effect: 'bubble' | 'sparkle' | 'zzz',
  x: number,
  y: number,
  t: number,
): void {
  context.save();
  if (effect === 'bubble') {
    // 吹き出しは、少しふくらんだり縮んだりする
    const scale = 1 + Math.sin(t * 5) * 0.06;
    context.translate(x, y);
    context.scale(scale, scale);
    context.beginPath();
    context.roundRect(-30, -22, 60, 38, 16);
    context.moveTo(-14, 14);
    context.lineTo(-22, 28);
    context.lineTo(-2, 15);
    context.fillStyle = COLORS.paper;
    context.fill();
    context.strokeStyle = COLORS.ink;
    context.lineWidth = 2.5;
    context.stroke();
    context.fillStyle = COLORS.ink;
    [-12, 0, 12].forEach((dotX, dot) => {
      const lift = Math.max(0, Math.sin(t * 8 - dot * 0.9)) * 4;
      context.beginPath();
      context.arc(dotX, -3 - lift, 3.5, 0, Math.PI * 2);
      context.fill();
    });
  } else if (effect === 'sparkle') {
    // 小さな金の光が、またたく
    [
      [-8, 0, 0],
      [22, 16, 1.7],
    ].forEach(([sx, sy, delay]) => {
      const glow = (Math.sin(t * 3 + delay!) + 1) / 2;
      const r = 4 + glow * 6;
      context.globalAlpha *= 0.4 + glow * 0.6;
      context.beginPath();
      context.moveTo(x + sx!, y + sy! - r);
      context.quadraticCurveTo(x + sx!, y + sy!, x + sx! + r, y + sy!);
      context.quadraticCurveTo(x + sx!, y + sy!, x + sx!, y + sy! + r);
      context.quadraticCurveTo(x + sx!, y + sy!, x + sx! - r, y + sy!);
      context.quadraticCurveTo(x + sx!, y + sy!, x + sx!, y + sy! - r);
      context.fillStyle = COLORS.gold;
      context.fill();
    });
  } else {
    // 「z」が、ゆっくり上へのぼって消える
    context.fillStyle = COLORS.gold;
    context.textAlign = 'center';
    for (let k = 0; k < 3; k += 1) {
      const rise = (t * 0.6 + k / 3) % 1;
      context.globalAlpha = (1 - rise) * 0.9;
      context.font = serifFont(700, 18 + k * 6);
      context.fillText('z', x + rise * 26 + k * 8, y - rise * 40);
    }
  }
  context.restore();
}

/** 挿絵を描く。人物は、本文に合わせた動きをする（castMotion.ts） */
function drawIllustration(
  context: CanvasRenderingContext2D,
  art: PreparedArt,
  t: number,
  elapsed: number,
): void {
  context.save();
  roundedPanel(context);
  context.clip();
  context.drawImage(art.background, PANEL.x, PANEL.y, PANEL.width, PANEL.height);
  art.cast.forEach(({ image, mouthOpen, placement }, index) => {
    const side = placement.x > SCENE_SIZE.width / 2 ? 1 : -1;
    const motion = castMotion(placement.action, t, elapsed, index, side);
    const width = placement.width;
    const height = width * 1.2;
    // 足もとを中心に、動かしてから描く
    const footX = PANEL.x + placement.x + motion.dx;
    const footY = PANEL.y + placement.baseline + motion.dy;
    context.save();
    if (placement.action === 'sleep') {
      // 横になった人は、体の厚みの分だけ持ち上げて、地面の上に寝かせる
      context.translate(footX + height / 2, footY - width * 0.32);
    } else {
      context.translate(footX, footY);
    }
    context.rotate(motion.rotate);
    context.scale(1, motion.scaleY);
    context.drawImage(
      motion.mouthOpen && mouthOpen ? mouthOpen : image,
      -width / 2,
      -height,
      width,
      height,
    );
    context.restore();

    if (motion.effect) {
      const headTop =
        placement.action === 'sleep' ? footY - width * 0.8 : footY - height * motion.scaleY;
      const effectX = placement.action === 'sleep' ? footX + width * 0.2 : footX + width * 0.42;
      drawEffect(context, motion.effect, effectX, headTop + 6, t + index);
    }
  });
  context.restore();
  roundedPanel(context);
  context.strokeStyle = COLORS.gold;
  context.lineWidth = 3;
  context.stroke();
}

/** 時刻 t（秒）の1こまを描く */
export function drawFrame(
  context: CanvasRenderingContext2D,
  scenes: readonly VideoScene[],
  art: ArtBook,
  t: number,
): void {
  const { width, height } = VIDEO_SIZE;
  context.globalAlpha = 1;
  context.fillStyle = COLORS.paper;
  context.fillRect(0, 0, width, height);

  // 紙の上下に引く、金の細い線
  context.fillStyle = COLORS.gold;
  context.fillRect(width / 2 - 60, 90, 120, 2);
  context.fillRect(width / 2 - 60, height - 110, 120, 2);

  const current = sceneAt(scenes, t);
  if (!current) return;
  const { scene, elapsed } = current;
  context.globalAlpha = fade(elapsed, scene.seconds);
  context.textAlign = 'center';
  context.textBaseline = 'middle';

  const prepared = scene.illustration && art.get(sceneKey(scene.illustration));
  if (prepared) drawIllustration(context, prepared, t, elapsed);

  context.fillStyle = COLORS.ink;
  if (scene.kind === 'text') {
    // 本文は、人物の動きに合わせて、1行ずつ現れる
    context.font = serifFont(500, FONT_SIZE);
    const pageAlpha = context.globalAlpha;
    const top = TEXT_CENTER - ((scene.lines.length - 1) * LINE_HEIGHT) / 2;
    scene.lines.forEach((line, index) => {
      context.globalAlpha =
        pageAlpha * lineReveal(index, scene.lines.length, elapsed, scene.seconds);
      context.fillText(line, width / 2, top + index * LINE_HEIGHT);
    });
    context.globalAlpha = pageAlpha;
  } else if (scene.kind === 'title') {
    context.font = serifFont(700, 48);
    context.fillText(scene.lines[0] ?? '', width / 2, 720);
  } else {
    // 出典：箇所を大きく、翻訳の名前を金で添える
    const [reference = '', credit] = scene.lines;
    context.font = serifFont(700, 46);
    context.fillText(reference, width / 2, height / 2);
    if (credit) {
      context.fillStyle = COLORS.gold;
      context.font = serifFont(500, 26);
      context.fillText(credit, width / 2, height / 2 + 80);
    }
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
  art: ArtBook,
  mimeType: string,
  onProgress: (ratio: number) => void,
  signal: AbortSignal,
): Promise<Blob> {
  const context = canvas.getContext('2d')!;
  const duration = totalSeconds(scenes);
  const recorder = new MediaRecorder(canvas.captureStream(FRAMES_PER_SECOND), {
    mimeType,
    videoBitsPerSecond: 5_000_000,
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
      drawFrame(context, scenes, art, Math.min(t, duration));
      onProgress(Math.min(t / duration, 1));
      if (t >= duration) recorder.stop();
      else requestAnimationFrame(tick);
    };
    drawFrame(context, scenes, art, 0);
    recorder.start();
    requestAnimationFrame(tick);
  });
}
