/**
 * 人物の動き。動きの種類と、その場面が始まってからの時間から、その瞬間の位置や傾きを決める。
 * 描くこと（renderVideo.ts）とは分けてあり、ここは計算だけ。
 */
import type { ActionId } from '@shared/scene/vocabulary';

export interface Motion {
  /** 横のずれ（右が正） */
  dx: number;
  /** 縦のずれ（上が負） */
  dy: number;
  /** 足もとを中心にした傾き（ラジアン。右回りが正） */
  rotate: number;
  /** 縦の縮み（1 = そのまま。ひざまずくと小さくなる） */
  scaleY: number;
  /** 口を開けているか（話している途中） */
  mouthOpen: boolean;
  /** 頭の近くに出す飾り：話す吹き出し・祈りの光・眠りの「z」 */
  effect?: 'bubble' | 'sparkle' | 'zzz';
}

const STILL: Motion = { dx: 0, dy: 0, rotate: 0, scaleY: 1, mouthOpen: false };

/** 0〜1 を、はじめ速く終わりゆっくりに */
function easeOut(x: number): number {
  return 1 - (1 - x) ** 3;
}

/** ぴょこぴょこ跳ねる（0 から height まで） */
function hop(t: number, speed: number, height: number, phase: number): number {
  return -Math.abs(Math.sin(t * speed + phase)) * height;
}

/**
 * @param t       動画の始まりからの秒数（揺れの間合いに使う）
 * @param elapsed この場面が始まってからの秒数
 * @param index   場面の中で何人目か（ひとりずつ間合いをずらす）
 * @param side    その人が立つのは画面の左（-1）か右（1）か。歩いてくるときは、その側の端から来る
 */
export function castMotion(
  action: ActionId,
  t: number,
  elapsed: number,
  index: number,
  side: -1 | 1 = -1,
): Motion {
  const phase = index * 1.3;
  const idle = hop(t, 2.2, 6, phase);

  switch (action) {
    case 'walk':
    case 'run': {
      // 自分の側の端から歩いて（走って）きて、自分の場所で止まる。ほかの人の前を横切らない
      const [distance, duration, step, height] =
        action === 'walk' ? [170, 2.2, 9, 6] : [280, 1.2, 15, 11];
      const progress = Math.min(elapsed / duration, 1);
      const moving = progress < 1;
      return {
        ...STILL,
        dx: side * (1 - easeOut(progress)) * distance,
        dy: moving ? hop(t, step, height, phase) : idle,
        rotate: moving ? -side * 0.06 : 0,
      };
    }
    case 'speak':
      return {
        ...STILL,
        dy: hop(t, 2.2, 4, phase),
        rotate: Math.sin(t * 3 + phase) * 0.03,
        // 口をぱくぱくさせる。ときどき息つぎ
        mouthOpen: Math.sin(t * 16 + phase) > 0 && Math.sin(t * 1.7 + phase) > -0.6,
        effect: 'bubble',
      };
    case 'pray':
      return { ...STILL, dy: hop(t, 1.1, 3, phase), effect: 'sparkle' };
    case 'kneel':
      return { ...STILL, dy: 10, scaleY: 0.82, rotate: 0.05, effect: 'sparkle' };
    case 'raise':
      return { ...STILL, dy: hop(t, 4.5, 16, phase) };
    case 'point':
      return { ...STILL, dy: idle * 0.5, rotate: -0.08 };
    case 'give':
      return { ...STILL, dy: idle * 0.5, rotate: Math.sin(t * 2 + phase) * 0.05 };
    case 'sleep':
      // 横になって、ゆっくり息をする
      return { ...STILL, rotate: -Math.PI / 2, dy: Math.sin(t * 1.6 + phase) * 2, effect: 'zzz' };
    case 'stand':
      return { ...STILL, dy: idle };
  }
}

/**
 * 本文の行を、場面の時間に合わせて1行ずつ出すための濃さ（0〜1）。
 * 場面の前半〜7割までに、行を順に出し終える。
 */
export function lineReveal(
  line: number,
  lineCount: number,
  elapsed: number,
  seconds: number,
): number {
  const window = (seconds * 0.7) / Math.max(lineCount, 1);
  return Math.max(0, Math.min(1, (elapsed - 0.3 - line * window) / 0.45));
}
