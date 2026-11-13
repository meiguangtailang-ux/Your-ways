/**
 * 挿絵（動画の場面）を組み立てるための言葉の一覧。
 * 背景・小物・登場人物を、決まった中から選んで組み合わせる。
 * AI に場面を考えてもらうときも、この一覧から選んでもらう（説明は AI への手がかりにもなる）。
 */

export const SETTINGS = {
  plain: 'とくに場所のない、広い地面',
  field: '野原・牧場・畑',
  sea: '海・湖のほとり',
  mountain: '山',
  wilderness: '荒野・砂漠',
  river: '川のほとり',
  city: '町・城壁・門',
  temple: '神殿・会堂',
  house: '家の中',
  garden: '園・木々のあるところ',
  night: '夜空の下',
  heaven: '天・光の満ちるところ（神を表すときにも使う）',
} as const;

export const PROPS = {
  sheep: '羊',
  boat: '小舟',
  ark: '箱舟',
  fish: '魚',
  tree: '木',
  fruit: '木の実',
  star: '星',
  cloud: '雲',
  fire: '火・炎',
  jar: '水がめ・つぼ',
  well: '井戸',
  bread: 'パン',
  tablets: '石の板（十戒）',
  crown: '冠',
  sword: 'つるぎ',
  stone: '石',
  dove: 'はと',
  rainbow: '虹',
  tent: '天幕',
  lamp: 'ともしび',
  scroll: '巻物',
  cross: '十字架',
  heart: '愛（ハート）',
  wheat: '麦の穂',
  grapes: 'ぶどう',
  lion: 'しし（ライオン）',
  donkey: 'ろば',
  camel: 'らくだ',
  snake: 'へび',
  manger: '飼葉おけ（赤ちゃんの寝床）',
  light: '天からの光',
  table: '食卓',
} as const;

/** 名前の決まっていない登場人物 */
export const FIGURES = {
  man: '男の人',
  woman: '女の人',
  child: '子ども',
  baby: '赤ちゃん',
  elder: '老人',
  king: '王',
  soldier: '兵士',
  shepherd: '羊飼い',
  angel: '天使',
  priest: '祭司・律法学者',
  fisherman: '漁師',
  crowd: '群衆（大ぜいの人）',
} as const;

/** 人物の動き。動画の中で、本文に合わせて動かす */
export const ACTIONS = {
  stand: '立っている・聞いている',
  walk: '歩いてくる・行く',
  run: '走ってくる・逃げる',
  speak: '話す・言う・呼ぶ・歌う',
  pray: '祈る',
  raise: '両手を上げる・喜ぶ・ほめたたえる',
  point: '指さす・示す',
  give: '差し出す・与える・ささげる',
  kneel: 'ひざまずく・ひれ伏す・拝む',
  sleep: '眠る・横たわる',
} as const;

export type SettingId = keyof typeof SETTINGS;
export type ActionId = keyof typeof ACTIONS;
export type PropId = keyof typeof PROPS;
export type FigureId = keyof typeof FIGURES;

export const SETTING_IDS = Object.keys(SETTINGS) as SettingId[];
export const PROP_IDS = Object.keys(PROPS) as PropId[];
export const FIGURE_IDS = Object.keys(FIGURES) as FigureId[];
export const ACTION_IDS = Object.keys(ACTIONS) as ActionId[];

/** 一場面に置く数の上限 */
export const MAX_PROPS = 3;
export const MAX_CAST = 3;

/**
 * 場面に出てくる人物ひとり。
 * who には、名前のある人物の id（例：david）か、FIGURES の id（例：soldier）を入れる。
 */
export interface CastMember {
  who: string;
  action: ActionId;
}

/** 一場面の挿絵 */
export interface Scene {
  setting: SettingId;
  props: PropId[];
  cast: CastMember[];
}

/** 名前のある人物（AI に、選べる人物として伝える） */
export interface NamedPerson {
  id: string;
  name: string;
}

export function isSettingId(value: unknown): value is SettingId {
  return typeof value === 'string' && value in SETTINGS;
}

export function isPropId(value: unknown): value is PropId {
  return typeof value === 'string' && value in PROPS;
}

export function isActionId(value: unknown): value is ActionId {
  return typeof value === 'string' && value in ACTIONS;
}

export function isFigureId(value: unknown): value is FigureId {
  return typeof value === 'string' && value in FIGURES;
}
