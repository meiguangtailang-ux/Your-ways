/**
 * 挿絵（場面）を、SVG の文字列として描く。
 * 背景と小物は1枚の絵にまとめ、人物は動かせるように別々の絵にする（renderVideo.ts で重ねる）。
 * 色はクリーム・金・黒の3色だけ。濃淡は透明度で出す。
 */
import type { ActionId, PropId, Scene, SettingId } from '@shared/scene/vocabulary';
import {
  chibiSvg,
  type ChibiColors,
  type ChibiLook,
  type ChibiPose,
} from '@/features/people/chibi';
import { PEOPLE } from '@/features/people/people';

export interface SceneColors extends ChibiColors {
  /** 紙より少し濃い地 */
  sunk: string;
}

/** 挿絵の大きさ（この座標で描く） */
export const SCENE_SIZE = { width: 600, height: 420 } as const;

/** 人物の足もとの高さ */
const FLOOR = 408;
/** 奥に置く大きな物の足もとの高さ */
const BACK = 336;

// ---------------------------------------------------------------- 背景

function ground(c: SceneColors, top = 330, opacity = 0.22): string {
  return `<path d="M0 ${top + 6}C150 ${top - 6} 300 ${top + 12} 600 ${top}V420H0z" fill="${c.gold}" opacity="${opacity}"/>`;
}

function sun(c: SceneColors, x = 505, y = 78, r = 30): string {
  return `<circle cx="${x}" cy="${y}" r="${r}" fill="${c.gold}" opacity="0.85"/>`;
}

function tuft(c: SceneColors, x: number, y: number): string {
  return `<path d="M${x - 6} ${y}l3-9M${x} ${y}V${y - 11}M${x + 6} ${y}l-3-9" stroke="${c.ink}" stroke-width="2" stroke-linecap="round" opacity="0.55"/>`;
}

const SETTING_ART: Record<SettingId, (c: SceneColors) => string> = {
  plain: (c) => ground(c) + tuft(c, 90, 380) + tuft(c, 520, 372),
  field: (c) =>
    sun(c) +
    `<path d="M0 300Q150 236 300 286T600 262V420H0z" fill="${c.gold}" opacity="0.3"/>` +
    ground(c, 336, 0.2) +
    [70, 190, 420, 540].map((x, i) => tuft(c, x, 372 + (i % 2) * 14)).join(''),
  sea: (c) =>
    sun(c, 470, 70, 26) +
    `<rect y="228" width="600" height="118" fill="${c.ink}" opacity="0.12"/>` +
    `<path d="M0 228H600" stroke="${c.ink}" stroke-width="2" opacity="0.4"/>` +
    [250, 280, 310]
      .map(
        (y, i) =>
          `<path d="M${30 + i * 40} ${y}q15-8 30 0t30 0M${330 + i * 30} ${y + 8}q15-8 30 0t30 0" fill="none" stroke="${c.ink}" stroke-width="2" stroke-linecap="round" opacity="0.45"/>`,
      )
      .join('') +
    `<path d="M0 352C200 338 400 358 600 342V420H0z" fill="${c.gold}" opacity="0.3"/>`,
  mountain: (c) =>
    `<path d="M-40 336L110 176L260 336z" fill="${c.gold}" opacity="0.22"/>` +
    `<path d="M90 336L300 70L510 336z" fill="${c.gold}" opacity="0.38" stroke="${c.ink}" stroke-width="2" stroke-linejoin="round"/>` +
    `<path d="M262 118L300 70L338 118L318 110L300 124L282 110z" fill="${c.paper}" stroke="${c.ink}" stroke-width="2" stroke-linejoin="round"/>` +
    ground(c, 336, 0.2),
  wilderness: (c) =>
    sun(c, 470, 86, 40) +
    `<path d="M0 280Q120 230 240 276T600 250V420H0z" fill="${c.gold}" opacity="0.32"/>` +
    `<path d="M0 340Q200 310 360 336T600 326V420H0z" fill="${c.gold}" opacity="0.28"/>` +
    `<path d="M70 372q14-18 30 0zM500 380q12-14 24 0z" fill="${c.ink}" opacity="0.35"/>`,
  river: (c) =>
    `<path d="M0 290Q150 250 300 280T600 262V420H0z" fill="${c.gold}" opacity="0.26"/>` +
    `<path d="M0 316C200 304 400 340 600 322V356C400 376 200 342 0 358z" fill="${c.ink}" opacity="0.13"/>` +
    `<path d="M60 334q14-6 28 0t28 0M300 346q14-6 28 0t28 0M470 340q14-6 28 0t28 0" fill="none" stroke="${c.ink}" stroke-width="2" stroke-linecap="round" opacity="0.45"/>`,
  city: (c) => {
    const merlons = Array.from(
      { length: 13 },
      (_, i) => `<rect x="${44 + i * 40}" y="188" width="20" height="14"/>`,
    ).join('');
    return (
      `<g fill="${c.gold}" opacity="0.35">${merlons}</g>` +
      `<rect x="40" y="200" width="520" height="136" fill="${c.gold}" opacity="0.32" stroke="${c.ink}" stroke-width="2"/>` +
      `<rect x="20" y="160" width="70" height="176" fill="${c.gold}" opacity="0.4" stroke="${c.ink}" stroke-width="2"/>` +
      `<rect x="510" y="160" width="70" height="176" fill="${c.gold}" opacity="0.4" stroke="${c.ink}" stroke-width="2"/>` +
      `<path d="M262 336V270a38 38 0 0176 0v66z" fill="${c.ink}" opacity="0.75"/>` +
      ground(c, 336, 0.2)
    );
  },
  temple: (c) => {
    const columns = [150, 210, 270, 330, 390, 450]
      .map(
        (x) =>
          `<rect x="${x - 9}" y="168" width="18" height="138" fill="${c.paper}" stroke="${c.ink}" stroke-width="2"/>`,
      )
      .join('');
    return (
      `<path d="M110 168L300 92L490 168z" fill="${c.gold}" stroke="${c.ink}" stroke-width="2" stroke-linejoin="round"/>` +
      `<rect x="110" y="160" width="380" height="12" fill="${c.gold}" stroke="${c.ink}" stroke-width="2"/>` +
      columns +
      `<rect x="96" y="304" width="408" height="14" fill="${c.paper}" stroke="${c.ink}" stroke-width="2"/>` +
      `<rect x="80" y="318" width="440" height="14" fill="${c.paper}" stroke="${c.ink}" stroke-width="2"/>` +
      ground(c, 336, 0.2)
    );
  },
  house: (c) =>
    `<rect width="600" height="336" fill="${c.gold}" opacity="0.12"/>` +
    `<rect x="400" y="70" width="120" height="110" rx="6" fill="${c.paper}" stroke="${c.ink}" stroke-width="3"/>` +
    `<path d="M460 70V180M400 125H520" stroke="${c.ink}" stroke-width="3"/>` +
    `<rect y="336" width="600" height="84" fill="${c.gold}" opacity="0.3"/>` +
    `<path d="M0 336H600M0 372H600M150 336v36M420 336v36M290 372v48" stroke="${c.ink}" stroke-width="2" opacity="0.35"/>`,
  garden: (c) =>
    [
      [80, 230],
      [520, 220],
    ]
      .map(
        ([x, y]) =>
          `<rect x="${x! - 9}" y="${y! + 20}" width="18" height="${336 - y! - 20}" fill="${c.ink}" opacity="0.7"/>` +
          `<circle cx="${x}" cy="${y}" r="62" fill="${c.gold}" opacity="0.5" stroke="${c.ink}" stroke-width="2"/>`,
      )
      .join('') +
    ground(c, 336, 0.22) +
    [120, 230, 380, 470]
      .map(
        (x, i) =>
          `<circle cx="${x}" cy="${370 + (i % 2) * 18}" r="6" fill="${c.gold}" stroke="${c.ink}" stroke-width="1.5"/>`,
      )
      .join(''),
  night: (c) =>
    `<rect width="600" height="340" fill="${c.ink}"/>` +
    `<path d="M496 52a34 34 0 1 0 22 58 28 28 0 1 1-22-58z" fill="${c.gold}"/>` +
    [
      [80, 70],
      [170, 130],
      [260, 50],
      [360, 110],
      [420, 40],
      [560, 170],
      [130, 220],
    ]
      .map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3" fill="${c.gold}"/>`)
      .join('') +
    `<path d="M0 340Q150 300 300 330T600 318V420H0z" fill="${c.gold}" opacity="0.35"/>`,
  heaven: (c) =>
    [-60, -30, 0, 30, 60]
      .map(
        (angle) =>
          `<path d="M300 -10L${300 + angle * 7 - 34} 420H${300 + angle * 7 + 34}z" fill="${c.gold}" opacity="0.16"/>`,
      )
      .join('') +
    `<circle cx="300" cy="20" r="54" fill="${c.gold}" opacity="0.5"/>` +
    `<path d="M-20 420V350q40-40 90-14 30-38 80-14 40-30 90 0 46-34 96 0 40-30 90 0 50-26 100 10 40-20 80 0V420z" fill="${c.paper}" stroke="${c.ink}" stroke-width="2.5" stroke-linejoin="round"/>`,
};

// ---------------------------------------------------------------- 小物（100×100 の枠、足もとが下端）

/** 線の書き方（線の太さは width で変えられる。同じ属性を2回書くと、絵として読めなくなる） */
const line = (c: SceneColors, width = 3) =>
  `stroke="${c.ink}" stroke-width="${width}" stroke-linejoin="round" stroke-linecap="round"`;

const PROP_ART: Record<PropId, (c: SceneColors) => string> = {
  sheep: (c) =>
    `<path d="M24 82V96M64 82V96" ${line(c)}/>` +
    `<path d="M20 64c-6-12 6-22 14-16 4-10 18-10 22 0 8-6 20 2 16 14 8 6 2 22-8 20-4 8-18 8-22 0-10 6-24-2-22-18z" fill="${c.paper}" ${line(c)}/>` +
    `<ellipse cx="80" cy="58" rx="11" ry="13" fill="${c.ink}"/><circle cx="84" cy="56" r="2.5" fill="${c.paper}"/>`,
  boat: (c) =>
    `<path d="M50 70V14" ${line(c)}/><path d="M54 18L84 64H54z" fill="${c.paper}" ${line(c)}/>` +
    `<path d="M6 70H94L80 96H20z" fill="${c.gold}" ${line(c)}/>`,
  ark: (c) =>
    `<path d="M2 66H98L86 96H14z" fill="${c.gold}" ${line(c)}/>` +
    `<rect x="24" y="42" width="52" height="24" fill="${c.paper}" ${line(c)}/>` +
    `<path d="M18 44L50 24L82 44z" fill="${c.gold}" ${line(c)}/><rect x="44" y="50" width="12" height="16" fill="${c.ink}"/>`,
  fish: (c) =>
    `<path d="M10 70c16-22 46-22 62 0-16 22-46 22-62 0zM72 70l20-14v28z" fill="${c.gold}" ${line(c)}/>` +
    `<circle cx="26" cy="66" r="3.5" fill="${c.ink}"/>`,
  tree: (c) =>
    `<path d="M44 100V58h12v42z" fill="${c.ink}"/>` +
    `<circle cx="50" cy="40" r="32" fill="${c.gold}" ${line(c)}/>` +
    `<path d="M36 34a14 14 0 0114-12" fill="none" stroke="${c.paper}" stroke-width="4" stroke-linecap="round"/>`,
  fruit: (c) =>
    [
      [32, 76],
      [66, 76],
      [49, 52],
    ]
      .map(
        ([x, y]) =>
          `<circle cx="${x}" cy="${y}" r="17" fill="${c.gold}" ${line(c)}/><path d="M${x} ${y! - 16}q6-8 12-6" fill="none" ${line(c)}/>`,
      )
      .join(''),
  star: (c) =>
    `<path d="M50 6l12 28 30 3-23 20 7 30-26-16-26 16 7-30L8 37l30-3z" fill="${c.gold}" ${line(c)}/>`,
  cloud: (c) =>
    `<path d="M18 78c-14 0-16-20-2-22 0-16 20-20 28-8 6-14 30-12 30 6 14 0 16 22 2 24z" fill="${c.paper}" ${line(c)}/>`,
  fire: (c) =>
    `<path d="M20 96L80 84M20 84L80 96" ${line(c, 6)}/>` +
    `<path d="M50 84c-26 0-28-26-14-44 0 12 8 14 10 8-4-14 6-30 18-36-4 14 14 22 14 42 0 18-12 30-28 30z" fill="${c.gold}" ${line(c)}/>` +
    `<path d="M50 82c-10 0-12-12-4-20 4 8 8 2 10-4 6 8 6 24-6 24z" fill="${c.paper}"/>`,
  jar: (c) =>
    `<path d="M36 22h28l-4 8c14 8 18 32 6 66H34c-12-34-8-58 6-66z" fill="${c.gold}" ${line(c)}/>` +
    `<path d="M36 52h28" ${line(c, 2)}/>`,
  well: (c) =>
    `<path d="M24 34V96M76 34V96M16 34H84" ${line(c)}/><path d="M50 34v18" ${line(c, 2)}/>` +
    `<rect x="42" y="52" width="16" height="12" fill="${c.gold}" ${line(c, 2)}/>` +
    `<rect x="14" y="66" width="72" height="32" rx="4" fill="${c.paper}" ${line(c)}/>` +
    `<path d="M14 82H86M38 66v16M62 66v16M50 82v16" ${line(c, 2)}/>`,
  bread: (c) =>
    `<ellipse cx="34" cy="80" rx="26" ry="16" fill="${c.gold}" ${line(c)}/>` +
    `<ellipse cx="66" cy="72" rx="26" ry="16" fill="${c.gold}" ${line(c)}/>` +
    `<path d="M54 68l8 8M64 64l8 8M74 62l6 6" ${line(c, 2)}/>`,
  tablets: (c) =>
    `<path d="M10 98V30a20 20 0 0140 0v68zM50 98V30a20 20 0 0140 0v68z" fill="${c.paper}" ${line(c)}/>` +
    `<path d="M20 44h20M20 56h20M20 68h20M60 44h20M60 56h20M60 68h20" ${line(c, 2)}/>`,
  crown: (c) =>
    `<ellipse cx="50" cy="90" rx="38" ry="9" fill="${c.ink}" opacity="0.8"/>` +
    `<path d="M18 84L12 40l22 20 16-30 16 30 22-20-6 44z" fill="${c.gold}" ${line(c)}/>` +
    `<circle cx="50" cy="66" r="5" fill="${c.paper}" ${line(c, 2)}/>`,
  sword: (c) =>
    `<path d="M47 8h6l3 62h-12z" fill="${c.paper}" ${line(c)}/>` +
    `<path d="M30 72H70" ${line(c, 6)}/><path d="M50 74v20" ${line(c, 7)}/>` +
    `<path d="M30 72H70M50 74v20" stroke="${c.gold}" stroke-width="3" stroke-linecap="round"/>`,
  stone: (c) =>
    `<ellipse cx="30" cy="86" rx="18" ry="12" fill="${c.paper}" ${line(c)}/>` +
    `<ellipse cx="68" cy="88" rx="16" ry="10" fill="${c.paper}" ${line(c)}/>` +
    `<ellipse cx="50" cy="70" rx="14" ry="10" fill="${c.paper}" ${line(c)}/>`,
  dove: (c) =>
    `<path d="M14 60c10-14 30-16 44-8l20-14c4 10-2 22-12 26 6 8 2 20-14 20-20 0-34-12-38-24z" fill="${c.paper}" ${line(c)}/>` +
    `<path d="M14 60l-10 4 10 4" fill="${c.gold}" ${line(c, 2)}/><circle cx="24" cy="58" r="2.5" fill="${c.ink}"/>` +
    `<path d="M4 66q-6 8 0 14M0 72l-6-2M0 78l-6 2" fill="none" stroke="${c.gold}" stroke-width="3" stroke-linecap="round"/>`,
  rainbow: (c) =>
    `<path d="M2 100a48 48 0 0196 0" fill="none" stroke="${c.gold}" stroke-width="12"/>` +
    `<path d="M14 100a36 36 0 0172 0" fill="none" stroke="${c.paper}" stroke-width="10"/>` +
    `<path d="M24 100a26 26 0 0152 0" fill="none" stroke="${c.gold}" stroke-width="8" opacity="0.55"/>`,
  tent: (c) =>
    `<path d="M4 96L50 18L96 96z" fill="${c.paper}" ${line(c)}/>` +
    `<path d="M27 57L73 57M16 77L84 77" stroke="${c.gold}" stroke-width="6"/>` +
    `<path d="M40 96L50 62L60 96z" fill="${c.ink}"/><path d="M50 18L50 6" ${line(c)}/>`,
  lamp: (c) =>
    `<path d="M14 80c10 16 56 16 64 0l-8-8H24z" fill="${c.gold}" ${line(c)}/>` +
    `<path d="M78 80l14-10" ${line(c)}/>` +
    `<path d="M90 68c8-8 8-20 0-30-6 12-10 20 0 30z" fill="${c.gold}" ${line(c, 2)}/>`,
  scroll: (c) =>
    `<rect x="18" y="38" width="64" height="52" fill="${c.paper}" ${line(c)}/>` +
    `<path d="M28 52h44M28 64h44M28 76h30" ${line(c, 2)}/>` +
    `<rect x="10" y="30" width="10" height="68" rx="4" fill="${c.gold}" ${line(c)}/>` +
    `<rect x="80" y="30" width="10" height="68" rx="4" fill="${c.gold}" ${line(c)}/>`,
  cross: (c) =>
    `<path d="M10 100q40-26 80 0z" fill="${c.gold}" opacity="0.5"/>` +
    `<path d="M44 92V8h12v84zM24 28h52v12H24z" fill="${c.gold}" ${line(c)}/>`,
  heart: (c) =>
    `<path d="M50 94C14 66 6 46 16 30c10-16 30-12 34 4 4-16 24-20 34-4 10 16 2 36-34 64z" fill="${c.gold}" ${line(c)}/>` +
    `<path d="M28 38a10 10 0 018-6" fill="none" stroke="${c.paper}" stroke-width="4" stroke-linecap="round"/>`,
  wheat: (c) =>
    [30, 50, 70]
      .map(
        (x, i) =>
          `<path d="M${x} 100V${34 + i * 4}" ${line(c, 2)}/>` +
          [0, 1, 2]
            .map(
              (k) =>
                `<ellipse cx="${x - 5}" cy="${42 + i * 4 + k * 12}" rx="4" ry="7" transform="rotate(-25 ${x - 5} ${42 + i * 4 + k * 12})" fill="${c.gold}" ${line(c, 1.5)}/>` +
                `<ellipse cx="${x + 5}" cy="${42 + i * 4 + k * 12}" rx="4" ry="7" transform="rotate(25 ${x + 5} ${42 + i * 4 + k * 12})" fill="${c.gold}" ${line(c, 1.5)}/>`,
            )
            .join(''),
      )
      .join(''),
  grapes: (c) =>
    `<path d="M50 22V8M50 16q14-14 30-4-12 12-30 4z" fill="${c.paper}" ${line(c, 2)}/>` +
    [
      [36, 34],
      [52, 34],
      [68, 34],
      [44, 50],
      [60, 50],
      [36, 66],
      [52, 66],
      [44, 82],
    ]
      .map(([x, y]) => `<circle cx="${x}" cy="${y}" r="9" fill="${c.gold}" ${line(c, 2)}/>`)
      .join(''),
  lion: (c) =>
    `<path d="M40 78h46c6 0 8 16-2 18H36z" fill="${c.gold}" ${line(c)}/>` +
    `<path d="M86 80q10-6 8-18" fill="none" ${line(c)}/>` +
    `<circle cx="34" cy="54" r="28" fill="${c.gold}" ${line(c)}/>` +
    `<circle cx="34" cy="56" r="17" fill="${c.paper}" ${line(c)}/>` +
    `<circle cx="28" cy="52" r="2.5" fill="${c.ink}"/><circle cx="40" cy="52" r="2.5" fill="${c.ink}"/>` +
    `<path d="M30 62q4 4 8 0" fill="none" ${line(c, 2)}/>`,
  donkey: (c) =>
    `<path d="M30 80V98M70 80V98" ${line(c)}/>` +
    `<path d="M22 58h52c10 0 12 26 0 26H26c-12 0-14-26-4-26z" fill="${c.paper}" ${line(c)}/>` +
    `<path d="M70 60l8-30h14l-4 30z" fill="${c.paper}" ${line(c)}/>` +
    `<path d="M80 32L76 8l8 22M88 32L92 8l-6 22" fill="${c.paper}" ${line(c, 2)}/>` +
    `<circle cx="86" cy="40" r="2.5" fill="${c.ink}"/>`,
  camel: (c) =>
    `<path d="M24 76V98M44 76V98M64 76V98" ${line(c)}/>` +
    `<path d="M14 78c0-20 10-22 18-34 8 14 14 14 20 0 8 12 18 16 20 34z" fill="${c.gold}" ${line(c)}/>` +
    `<path d="M70 68c8-6 10-24 10-40h12v10h-6c0 18-2 28-12 32z" fill="${c.gold}" ${line(c)}/>` +
    `<circle cx="88" cy="32" r="2.5" fill="${c.ink}"/>`,
  snake: (c) =>
    `<path d="M10 92c20 0 24-16 40-16s20 16 34 10c10-4 8-22-6-22-16 0-10-22 6-22" fill="none" stroke="${c.ink}" stroke-width="14" stroke-linecap="round"/>` +
    `<path d="M10 92c20 0 24-16 40-16s20 16 34 10c10-4 8-22-6-22-16 0-10-22 6-22" fill="none" stroke="${c.gold}" stroke-width="8" stroke-linecap="round"/>` +
    `<circle cx="88" cy="40" r="2.5" fill="${c.ink}"/>`,
  manger: (c) =>
    `<path d="M14 98L24 60M86 98L76 60" ${line(c)}/>` +
    `<path d="M10 56h80l-8 22H18z" fill="${c.gold}" ${line(c)}/>` +
    `<path d="M16 58l6-10M30 58l4-12M70 58l-4-12M84 58l-6-10" ${line(c, 2)}/>` +
    `<ellipse cx="50" cy="52" rx="20" ry="11" fill="${c.paper}" ${line(c)}/>` +
    `<circle cx="34" cy="46" r="10" fill="${c.paper}" ${line(c)}/>` +
    `<ellipse cx="34" cy="33" rx="10" ry="3" fill="none" stroke="${c.gold}" stroke-width="2.5"/>`,
  light: (c) =>
    [-3, -1.5, 0, 1.5, 3]
      .map(
        (k) =>
          `<path d="M50 -10L${50 + k * 14 - 6} 100H${50 + k * 14 + 6}z" fill="${c.gold}" opacity="0.35"/>`,
      )
      .join(''),
  table: (c) =>
    `<path d="M18 68V98M82 68V98" ${line(c)}/>` +
    `<rect x="6" y="60" width="88" height="10" rx="3" fill="${c.gold}" ${line(c)}/>` +
    `<ellipse cx="34" cy="54" rx="14" ry="7" fill="${c.paper}" ${line(c, 2)}/>` +
    `<path d="M62 36h16l-3 20h-10z" fill="${c.gold}" ${line(c, 2)}/>`,
};

/** 空に浮かべる小物 */
const SKY_PROPS: ReadonlySet<PropId> = new Set(['star', 'cloud', 'dove', 'rainbow', 'light']);
/** 奥に大きく置く小物 */
const BIG_PROPS: ReadonlySet<PropId> = new Set(['ark', 'tent', 'well', 'tree', 'table', 'boat']);
/** 海の場面で、水の上に置く小物 */
const ON_WATER: ReadonlySet<PropId> = new Set(['boat', 'ark', 'fish']);

function place(art: string, x: number, baseline: number, size: number): string {
  const scale = size / 100;
  return `<g transform="translate(${x - 50 * scale} ${baseline - 100 * scale}) scale(${scale})">${art}</g>`;
}

/** 人物の数に応じた、手前の小物の置き場所 */
const FRONT_SLOTS: Record<number, number[]> = {
  0: [180, 300, 420],
  1: [130, 470],
  2: [80, 300, 520],
  3: [60, 540],
};

function propsArt(scene: Scene, castCount: number, c: SceneColors): string {
  const sky = [
    [470, 120, 70],
    [130, 110, 80],
    [300, 90, 60],
  ];
  const back = [110, 490];
  const front = [...(FRONT_SLOTS[castCount] ?? FRONT_SLOTS[3]!)];
  const behind: string[] = [];
  const inFront: string[] = [];

  for (const prop of scene.props) {
    const art = PROP_ART[prop](c);
    if (prop === 'rainbow') behind.unshift(place(art, 300, 300, 520));
    else if (prop === 'light') behind.unshift(place(art, 300, 340, 340));
    else if (SKY_PROPS.has(prop)) {
      const [x, y, size] = sky.shift() ?? [];
      if (x !== undefined) behind.push(place(art, x, y!, size!));
    } else if (scene.setting === 'sea' && ON_WATER.has(prop)) {
      behind.push(
        place(
          art,
          prop === 'fish' ? 150 : 460,
          prop === 'fish' ? 300 : 318,
          prop === 'fish' ? 70 : 140,
        ),
      );
    } else if (BIG_PROPS.has(prop)) {
      const x = back.shift();
      if (x !== undefined) behind.push(place(art, x, BACK, 140));
    } else {
      const x = front.shift();
      if (x !== undefined) inFront.push(place(art, x, FLOOR, 100));
    }
  }
  return behind.join('') + inFront.join('');
}

/** 背景と小物を描いた、人物のいない絵 */
export function sceneBackgroundSvg(scene: Scene, c: SceneColors): string {
  const { width, height } = SCENE_SIZE;
  return [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">`,
    `<rect width="${width}" height="${height}" fill="${c.paper}"/>`,
    SETTING_ART[scene.setting](c),
    propsArt(scene, scene.cast.length, c),
    '</svg>',
  ].join('');
}

// ---------------------------------------------------------------- 人物

const FIGURE_LOOKS: Record<string, ChibiLook> = {
  man: { hair: 'short', beard: 'short', robe: 'paper' },
  woman: { hair: 'long', head: 'veil', robe: 'gold' },
  child: { hair: 'short', robe: 'paper' },
  baby: { hair: 'bald', robe: 'paper' },
  elder: { hair: 'bald', beard: 'long', robe: 'ink', item: 'staff' },
  king: { hair: 'short', beard: 'short', head: 'crown', robe: 'gold' },
  soldier: { hair: 'short', head: 'helmet', robe: 'ink', item: 'spear' },
  shepherd: { hair: 'curly', head: 'cloth', robe: 'paper', item: 'staff' },
  angel: { hair: 'long', head: 'halo', wings: true, robe: 'paper' },
  priest: { hair: 'short', beard: 'long', head: 'cloth', robe: 'gold', item: 'scroll' },
  fisherman: { hair: 'curly', beard: 'short', robe: 'paper', item: 'net' },
};

/** 子どもや赤ちゃんは小さく描く */
const FIGURE_SCALE: Record<string, number> = { child: 0.74, baby: 0.56 };

function lookOf(id: string): ChibiLook {
  return PEOPLE.find((person) => person.id === id)?.look ?? FIGURE_LOOKS[id] ?? FIGURE_LOOKS.man!;
}

/** 挿絵の中の人物ひとり分の置き方 */
export interface CastPlacement {
  look: ChibiLook;
  action: ActionId;
  /** 足もとの中心 */
  x: number;
  baseline: number;
  /** 絵の幅（高さは幅の 1.2 倍） */
  width: number;
}

const SLOT_X: Record<number, number[]> = { 1: [300], 2: [215, 385], 3: [150, 300, 450] };

export function castPlacements(scene: Scene): CastPlacement[] {
  const xs = SLOT_X[scene.cast.length] ?? [];
  return scene.cast.flatMap(({ who, action }, index): CastPlacement[] => {
    const x = xs[index]!;
    const width = 150 * (FIGURE_SCALE[who] ?? 1);
    if (who !== 'crowd') return [{ look: lookOf(who), action, x, baseline: FLOOR, width }];
    // 群衆：小さめの3人。奥のふたりは少し上に置く
    return [
      { look: FIGURE_LOOKS.woman!, action, x: x - 42, baseline: FLOOR - 16, width: 92 },
      { look: FIGURE_LOOKS.man!, action, x: x + 42, baseline: FLOOR - 16, width: 92 },
      { look: FIGURE_LOOKS.child!, action, x, baseline: FLOOR, width: 92 },
    ];
  });
}

/** 動きごとの、手の形と目 */
const ACTION_POSE: Record<ActionId, ChibiPose> = {
  stand: {},
  walk: {},
  run: {},
  speak: {},
  pray: { hands: 'pray', eyes: 'closed' },
  kneel: { hands: 'pray', eyes: 'closed' },
  raise: { hands: 'raise' },
  point: { hands: 'point' },
  give: { hands: 'give' },
  sleep: { eyes: 'closed' },
};

/** 人物の絵。mouthOpen は、話している途中の口を開いた絵 */
export function castSvg(
  placement: CastPlacement,
  c: SceneColors,
  { mouthOpen = false }: { mouthOpen?: boolean } = {},
): string {
  return chibiSvg(placement.look, c, { ...ACTION_POSE[placement.action], mouthOpen });
}
