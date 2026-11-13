/**
 * 小人ふうの人物イラストを、SVG の文字列として描く。
 * 色はクリーム・金・黒の3色だけ。画面（CSS の色）と動画（決まった色）の両方から使うので、
 * 色は呼び出す側から受け取る。
 */

export interface ChibiLook {
  hair: 'short' | 'long' | 'curly' | 'bald';
  beard?: 'short' | 'long';
  /** かぶりもの（halo = 天使の光の輪） */
  head?: 'veil' | 'crown' | 'cloth' | 'helmet' | 'halo';
  /** 背中の羽（天使） */
  wings?: boolean;
  /** 持ちもの（その人を思い出す手がかり） */
  item?:
    | 'staff'
    | 'harp'
    | 'scroll'
    | 'net'
    | 'tablets'
    | 'boat'
    | 'lamb'
    | 'pen'
    | 'wheat'
    | 'fish'
    | 'key'
    | 'star'
    | 'spear'
    | 'sling'
    | 'lamp'
    | 'jar';
  /** 衣の色。gold = 金 / ink = 黒 / paper = クリーム */
  robe: 'gold' | 'ink' | 'paper';
}

export interface ChibiColors {
  ink: string;
  gold: string;
  paper: string;
}

const HAIR: Record<ChibiLook['hair'], string> = {
  short: '<path d="M26 40c-2-16 8-26 24-26s26 10 24 26c-4-9-12-13-24-13s-20 4-24 13z"/>',
  long: '<path d="M25 62c-5-28 5-48 25-48s30 20 25 48c-2-14-3-22-6-27-5-6-12-8-19-8s-14 2-19 8c-3 5-4 13-6 27z"/>',
  curly:
    '<path d="M24 42c-4-8 0-16 6-17 0-7 8-11 13-8 4-5 12-5 15 0 6-3 13 1 13 8 6 1 9 9 5 17-3-8-12-14-26-14s-23 6-26 14z"/>',
  bald: '<path d="M27 36c1-5 4-9 8-10-3 3-5 6-6 10zM73 36c-1-5-4-9-8-10 3 3 5 6 6 10z"/>',
};

const BEARD: Record<NonNullable<ChibiLook['beard']>, string> = {
  short: '<path d="M33 50c3 12 10 16 17 16s14-4 17-16c-4 5-10 7-17 7s-13-2-17-7z"/>',
  long: '<path d="M32 49c1 20 9 30 18 30s17-10 18-30c-4 6-10 8-18 8s-14-2-18-8z"/>',
};

function headwear(kind: ChibiLook['head'], c: ChibiColors): string {
  switch (kind) {
    case 'veil':
      return `<path d="M22 70c-6-34 6-58 28-58s34 24 28 58c-1-22-5-36-28-36S23 48 22 70z" fill="${c.gold}"/>`;
    case 'crown':
      return `<path d="M32 22l4-12 7 8 7-10 7 10 7-8 4 12z" fill="${c.gold}" stroke="${c.ink}" stroke-width="1.5" stroke-linejoin="round"/>`;
    case 'helmet':
      return `<path d="M23 40c0-17 11-27 27-27s27 10 27 27z" fill="${c.gold}" stroke="${c.ink}" stroke-width="2" stroke-linejoin="round"/><path d="M50 13V4M44 5h12" stroke="${c.ink}" stroke-width="2.5" stroke-linecap="round"/>`;
    case 'halo':
      return `<ellipse cx="50" cy="10" rx="17" ry="5" fill="none" stroke="${c.gold}" stroke-width="3"/>`;
    case 'cloth':
      return `<path d="M24 38c0-16 10-25 26-25s26 9 26 25c-8-6-16-9-26-9s-18 3-26 9z" fill="${c.paper}" stroke="${c.ink}" stroke-width="1.5"/><path d="M24 36h52" stroke="${c.gold}" stroke-width="3"/>`;
    default:
      return '';
  }
}

function item(kind: ChibiLook['item'], c: ChibiColors): string {
  /** 線の書き方。同じ属性を2回書くと、動画用の絵として読めなくなるので、太さは引数で変える */
  const stroke = (width = 2) =>
    `fill="none" stroke="${c.ink}" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round"`;
  const line = stroke();
  switch (kind) {
    case 'staff':
      return `<path d="M82 112V62c0-7 9-7 9 0" ${line}/>`;
    case 'harp':
      return `<path d="M76 104V74c8-2 14 4 14 14v16z" fill="${c.gold}" stroke="${c.ink}" stroke-width="2" stroke-linejoin="round"/><path d="M80 78v24M84 80v22" ${stroke(1)}/>`;
    case 'scroll':
      return `<rect x="74" y="80" width="18" height="22" rx="3" fill="${c.paper}" stroke="${c.ink}" stroke-width="2"/><path d="M78 87h10M78 92h10M78 97h6" ${stroke(1)}/>`;
    case 'net':
      return `<path d="M74 84c4 14 14 14 18 0z" fill="${c.paper}" stroke="${c.ink}" stroke-width="2"/><path d="M78 85l3 9M83 85v10M88 85l-3 9" ${stroke(1)}/>`;
    case 'tablets':
      return `<path d="M73 102V84a5 5 0 0110 0 5 5 0 0110 0v18z" fill="${c.paper}" stroke="${c.ink}" stroke-width="2" stroke-linejoin="round"/><path d="M83 84v18" ${stroke(1)}/>`;
    case 'boat':
      return `<path d="M72 96h22c-2 7-6 9-11 9s-9-2-11-9z" fill="${c.gold}" stroke="${c.ink}" stroke-width="2" stroke-linejoin="round"/><path d="M83 96V82l8 10" ${line}/>`;
    case 'lamb':
      return `<ellipse cx="83" cy="98" rx="9" ry="7" fill="${c.paper}" stroke="${c.ink}" stroke-width="2"/><circle cx="75" cy="93" r="4" fill="${c.ink}"/>`;
    case 'pen':
      return `<path d="M76 104l14-22 4 3-14 22-5 2z" fill="${c.gold}" stroke="${c.ink}" stroke-width="2" stroke-linejoin="round"/>`;
    case 'wheat':
      return `<path d="M83 108V80" ${line}/><path d="M83 82c-5-2-5-7 0-9 5 2 5 7 0 9zM83 91c-6-1-7-6-3-9M83 91c6-1 7-6 3-9" fill="${c.gold}" stroke="${c.ink}" stroke-width="1.5"/>`;
    case 'fish':
      return `<path d="M72 94c6-8 14-8 18 0-4 8-12 8-18 0zM90 94l6-5v10z" fill="${c.gold}" stroke="${c.ink}" stroke-width="2" stroke-linejoin="round"/>`;
    case 'key':
      return `<circle cx="83" cy="84" r="5" fill="none" stroke="${c.ink}" stroke-width="2"/><path d="M83 89v15M83 99h5M83 104h4" ${line}/>`;
    case 'spear':
      return `<path d="M84 112V58" ${line}/><path d="M84 46l5 13h-10z" fill="${c.gold}" stroke="${c.ink}" stroke-width="1.5" stroke-linejoin="round"/>`;
    case 'sling':
      return `<path d="M72 80c4 10 10 14 16 14M88 94c2-6 2-12-2-16" ${line}/><circle cx="90" cy="98" r="4" fill="${c.ink}"/>`;
    case 'lamp':
      return `<path d="M72 98c4 6 16 6 20 0l-4-4H76z" fill="${c.gold}" stroke="${c.ink}" stroke-width="2" stroke-linejoin="round"/><path d="M92 95c3-3 3-7 0-11-2 4-3 7 0 11z" fill="${c.gold}" stroke="${c.ink}" stroke-width="1.2"/>`;
    case 'jar':
      return `<path d="M76 82h14l-2 4c5 3 6 12 2 18H76c-4-6-3-15 2-18z" fill="${c.gold}" stroke="${c.ink}" stroke-width="2" stroke-linejoin="round"/>`;
    case 'star':
      return `<path d="M83 78l3 7 7 1-5 5 1 7-6-4-6 4 1-7-5-5 7-1z" fill="${c.gold}" stroke="${c.ink}" stroke-width="1.5" stroke-linejoin="round"/>`;
    default:
      return '';
  }
}

/**
 * 手の形。
 * side = 体の横 / pray = 胸の前で合わせる / raise = 両手を上げる / point = 指さす / give = 前に差し出す
 */
export type ChibiHands = 'side' | 'pray' | 'raise' | 'point' | 'give';

/** 動きに合わせて変える部分（動画で使う） */
export interface ChibiPose {
  hands?: ChibiHands;
  eyes?: 'open' | 'closed';
  /** 話している途中の、開いた口 */
  mouthOpen?: boolean;
}

function hand(x: number, y: number, c: ChibiColors): string {
  return `<circle cx="${x}" cy="${y}" r="5" fill="${c.paper}" stroke="${c.ink}" stroke-width="2"/>`;
}

/** 袖（肩から手まで）。黒い線の上に衣の色を重ねて、ふちどりのある袖にする */
function sleeve(
  from: [number, number],
  to: [number, number],
  robe: string,
  c: ChibiColors,
): string {
  const d = `M${from[0]} ${from[1]}L${to[0]} ${to[1]}`;
  return `<path d="${d}" stroke="${c.ink}" stroke-width="10" stroke-linecap="round"/><path d="${d}" stroke="${robe}" stroke-width="6" stroke-linecap="round"/>`;
}

function hands(kind: ChibiHands, robe: string, c: ChibiColors): string {
  switch (kind) {
    case 'pray':
      return `<path d="M44 92c2-10 4-14 6-16 2 2 4 6 6 16z" fill="${c.paper}" stroke="${c.ink}" stroke-width="2" stroke-linejoin="round"/>`;
    case 'raise':
      return (
        sleeve([37, 80], [21, 62], robe, c) +
        sleeve([63, 80], [79, 62], robe, c) +
        hand(20, 60, c) +
        hand(80, 60, c)
      );
    case 'point':
      return hand(29, 94, c) + sleeve([64, 82], [86, 74], robe, c) + hand(88, 73, c);
    case 'give':
      return (
        hand(43, 95, c) +
        hand(57, 95, c) +
        `<ellipse cx="50" cy="88" rx="9" ry="6" fill="${c.gold}" stroke="${c.ink}" stroke-width="2"/>`
      );
    case 'side':
      return hand(29, 94, c) + hand(71, 94, c);
  }
}

function face(look: ChibiLook, pose: ChibiPose, c: ChibiColors): string {
  const eyes =
    pose.eyes === 'closed'
      ? `<path d="M36 45q4 4 8 0M56 45q4 4 8 0" fill="none" stroke="${c.ink}" stroke-width="2.2" stroke-linecap="round"/>`
      : `<circle cx="40" cy="45" r="2.6" fill="${c.ink}"/><circle cx="60" cy="45" r="2.6" fill="${c.ink}"/>`;
  const cheeks = `<circle cx="34" cy="52" r="3.5" fill="${c.gold}" opacity="0.55"/><circle cx="66" cy="52" r="3.5" fill="${c.gold}" opacity="0.55"/>`;
  // ひげのある人は、口がひげに隠れる。話すときだけ、ひげの上に口を開ける
  const mouth = pose.mouthOpen
    ? `<ellipse cx="50" cy="56" rx="4" ry="3.5" fill="${look.beard ? c.paper : c.ink}" stroke="${c.ink}" stroke-width="1.5"/>`
    : look.beard
      ? ''
      : `<path d="M45 54c3 3 7 3 10 0" fill="none" stroke="${c.ink}" stroke-width="2" stroke-linecap="round"/>`;
  return eyes + cheeks + mouth;
}

/** 100×120 の枠に描いた人物の SVG */
export function chibiSvg(look: ChibiLook, c: ChibiColors, pose: ChibiPose = {}): string {
  const robe = c[look.robe];
  const trim = look.robe === 'gold' ? c.ink : c.gold;
  const handKind = pose.hands ?? 'side';
  // 手がふさがる形のときは、持ちものを持たない
  const holdsItem = handKind === 'side' || handKind === 'point';
  return [
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 120">',
    look.wings
      ? `<path d="M30 80c-18-6-26-22-22-34 10 4 20 14 24 28zM70 80c18-6 26-22 22-34-10 4-20 14-24 28z" fill="${c.paper}" stroke="${c.ink}" stroke-width="2" stroke-linejoin="round"/>`
      : '',
    // からだ（衣）と手足
    `<path d="M30 112c0-26 6-42 20-42s20 16 20 42z" fill="${robe}" stroke="${c.ink}" stroke-width="2" stroke-linejoin="round"/>`,
    `<path d="M50 72v40" stroke="${trim}" stroke-width="2"/>`,
    `<ellipse cx="42" cy="114" rx="7" ry="4" fill="${c.ink}"/><ellipse cx="58" cy="114" rx="7" ry="4" fill="${c.ink}"/>`,
    // 大きな頭
    look.head === 'veil' ? headwear('veil', c) : '',
    `<circle cx="50" cy="42" r="26" fill="${c.paper}" stroke="${c.ink}" stroke-width="2"/>`,
    look.beard ? `<g fill="${c.ink}">${BEARD[look.beard]}</g>` : '',
    look.head === 'veil' ? '' : `<g fill="${c.ink}">${HAIR[look.hair]}</g>`,
    look.head === 'veil'
      ? `<path d="M26 40c2-14 10-22 24-22s22 8 24 22c-6-6-14-9-24-9s-18 3-24 9z" fill="${c.gold}"/>`
      : headwear(look.head, c),
    // 顔：目・ほお・口
    face(look, pose, c),
    // 手は顔より手前に描く（両手を上げたとき、頭に隠れないように）
    hands(handKind, robe, c),
    holdsItem ? item(look.item, c) : '',
    '</svg>',
  ].join('');
}
