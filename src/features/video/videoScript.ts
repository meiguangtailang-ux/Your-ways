/**
 * 動画の台本づくり。選んだ聖書箇所を、画面に収まる行とページに割り、それぞれの表示時間を決める。
 * 絵を描く部分（renderVideo.ts）とは分けてあり、ここは計算だけ。
 */

/** 行の頭に置かない文字（句読点・閉じかっこなど） */
const NO_LINE_START = '、。，．・：；？！）」』〕】ゝゞー';

/** 1秒あたりに読める文字数の目安（ゆっくりめ） */
const CHARACTERS_PER_SECOND = 6;

/** 1ページを見せる最短の時間（秒） */
const MIN_PAGE_SECONDS = 3;

export interface VideoScene {
  kind: 'title' | 'text' | 'credit';
  lines: string[];
  /** この場面を見せる時間（秒） */
  seconds: number;
}

/** 1行の文字数で折り返す。行頭に句読点などが来るときは、前の行にぶら下げる */
export function wrapText(text: string, charactersPerLine: number): string[] {
  const lines: string[] = [];
  let line = '';
  for (const character of text) {
    if (line.length >= charactersPerLine && !NO_LINE_START.includes(character)) {
      lines.push(line);
      line = '';
    }
    line += character;
  }
  if (line) lines.push(line);
  return lines;
}

export interface ScriptOptions {
  charactersPerLine: number;
  linesPerPage: number;
}

/** 題（箇所）→ 本文（何ページか）→ 出典、の順に場面を並べる */
export function buildScript(
  reference: string,
  text: string,
  credit: string,
  { charactersPerLine, linesPerPage }: ScriptOptions,
): VideoScene[] {
  const lines = wrapText(text, charactersPerLine);
  const pages: string[][] = [];
  for (let start = 0; start < lines.length; start += linesPerPage) {
    pages.push(lines.slice(start, start + linesPerPage));
  }
  return [
    { kind: 'title', lines: [reference], seconds: 2.5 },
    ...pages.map((page): VideoScene => ({
      kind: 'text',
      lines: page,
      seconds: Math.max(MIN_PAGE_SECONDS, page.join('').length / CHARACTERS_PER_SECOND + 1),
    })),
    { kind: 'credit', lines: [reference, credit], seconds: 2.5 },
  ];
}

export function totalSeconds(scenes: readonly VideoScene[]): number {
  return scenes.reduce((sum, scene) => sum + scene.seconds, 0);
}

/** 時刻 t（秒）に見せる場面と、その場面が始まってからの経過（秒） */
export function sceneAt(
  scenes: readonly VideoScene[],
  t: number,
): { scene: VideoScene; elapsed: number } | undefined {
  let start = 0;
  for (const scene of scenes) {
    if (t < start + scene.seconds) return { scene, elapsed: t - start };
    start += scene.seconds;
  }
  return undefined;
}
