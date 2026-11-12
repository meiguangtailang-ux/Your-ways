/**
 * 小人ふうの人物イラストを、SVG の文字列として描く。
 * 色はクリーム・金・黒の3色だけ。画面（CSS の色）と動画（決まった色）の両方から使うので、
 * 色は呼び出す側から受け取る。
 */

export interface ChibiLook {
  hair: 'short' | 'long' | 'curly' | 'bald';
  beard?: 'short' | 'long';
  /** かぶりもの */
  head?: 'veil' | 'crown' | 'cloth';
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
    | 'star';
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
    case 'cloth':
      return `<path d="M24 38c0-16 10-25 26-25s26 9 26 25c-8-6-16-9-26-9s-18 3-26 9z" fill="${c.paper}" stroke="${c.ink}" stroke-width="1.5"/><path d="M24 36h52" stroke="${c.gold}" stroke-width="3"/>`;
    default:
      return '';
  }
}

function item(kind: ChibiLook['item'], c: ChibiColors): string {
  const line = `fill="none" stroke="${c.ink}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"`;
  switch (kind) {
    case 'staff':
      return `<path d="M82 112V62c0-7 9-7 9 0" ${line}/>`;
    case 'harp':
      return `<path d="M76 104V74c8-2 14 4 14 14v16z" fill="${c.gold}" stroke="${c.ink}" stroke-width="2" stroke-linejoin="round"/><path d="M80 78v24M84 80v22" ${line} stroke-width="1"/>`;
    case 'scroll':
      return `<rect x="74" y="80" width="18" height="22" rx="3" fill="${c.paper}" stroke="${c.ink}" stroke-width="2"/><path d="M78 87h10M78 92h10M78 97h6" ${line} stroke-width="1"/>`;
    case 'net':
      return `<path d="M74 84c4 14 14 14 18 0z" fill="${c.paper}" stroke="${c.ink}" stroke-width="2"/><path d="M78 85l3 9M83 85v10M88 85l-3 9" ${line} stroke-width="1"/>`;
    case 'tablets':
      return `<path d="M73 102V84a5 5 0 0110 0 5 5 0 0110 0v18z" fill="${c.paper}" stroke="${c.ink}" stroke-width="2" stroke-linejoin="round"/><path d="M83 84v18" ${line} stroke-width="1"/>`;
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
    case 'star':
      return `<path d="M83 78l3 7 7 1-5 5 1 7-6-4-6 4 1-7-5-5 7-1z" fill="${c.gold}" stroke="${c.ink}" stroke-width="1.5" stroke-linejoin="round"/>`;
    default:
      return '';
  }
}

/** 100×120 の枠に描いた人物の SVG */
export function chibiSvg(look: ChibiLook, c: ChibiColors): string {
  const robe = c[look.robe];
  const trim = look.robe === 'gold' ? c.ink : c.gold;
  return [
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 120">',
    // からだ（衣）と手足
    `<path d="M30 112c0-26 6-42 20-42s20 16 20 42z" fill="${robe}" stroke="${c.ink}" stroke-width="2" stroke-linejoin="round"/>`,
    `<path d="M50 72v40" stroke="${trim}" stroke-width="2"/>`,
    `<circle cx="29" cy="94" r="5" fill="${c.paper}" stroke="${c.ink}" stroke-width="2"/>`,
    `<circle cx="71" cy="94" r="5" fill="${c.paper}" stroke="${c.ink}" stroke-width="2"/>`,
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
    `<circle cx="40" cy="45" r="2.6" fill="${c.ink}"/><circle cx="60" cy="45" r="2.6" fill="${c.ink}"/>`,
    `<circle cx="34" cy="52" r="3.5" fill="${c.gold}" opacity="0.55"/><circle cx="66" cy="52" r="3.5" fill="${c.gold}" opacity="0.55"/>`,
    look.beard
      ? ''
      : `<path d="M45 54c3 3 7 3 10 0" fill="none" stroke="${c.ink}" stroke-width="2" stroke-linecap="round"/>`,
    item(look.item, c),
    '</svg>',
  ].join('');
}
