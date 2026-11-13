/**
 * 本文の言葉から、挿絵の場面（背景・小物・人物）を推し量る。
 * AI を使わない（API キーが無い）ときの方法で、AI の答えが得られなかったときの代わりにもなる。
 */
import type { BookId } from '@shared/bible';
import {
  MAX_CAST,
  MAX_PROPS,
  type FigureId,
  type PropId,
  type Scene,
  type SettingId,
} from '@shared/scene/vocabulary';
import { findPeople, type Person } from '@/features/people/people';

/** 背景の手がかり。いちばん多く当てはまったものを選ぶ（同じ数なら上にあるもの） */
const SETTING_RULES: [SettingId, RegExp][] = [
  ['sea', /海|湖|舟|船|波|岸/g],
  ['river', /川|ヨルダン|流れ/g],
  ['mountain', /山(?!羊)/g],
  ['wilderness', /荒野|砂漠|荒れ野/g],
  ['night', /夜|星|月が|やみ/g],
  ['temple', /宮|神殿|会堂|祭壇|聖所/g],
  ['city', /町|都|城|門|エルサレム|ニネベ|バビロン/g],
  ['house', /家|部屋|食卓|戸口|寝床/g],
  ['garden', /園|木|花|実/g],
  ['field', /牧場|野(?!菜)|畑|羊|麦|草/g],
  ['heaven', /天(?!幕)|御使|栄光|光/g],
];

/** 小物の手がかり。本文に出てくる順に選ぶ */
const PROP_RULES: [PropId, RegExp][] = [
  ['ark', /箱舟/],
  ['sheep', /羊(?!飼)|小羊|牧者|牧場|羊飼/],
  ['boat', /(?<!箱)舟|船/],
  ['fish', /魚/],
  ['tree', /木(?!の実)/],
  ['fruit', /実/],
  ['star', /星/],
  ['cloud', /雲/],
  ['fire', /火|炎/],
  ['well', /井戸/],
  ['jar', /水がめ|かめ|つぼ/],
  ['bread', /パン/],
  ['tablets', /石の板|十戒/],
  ['crown', /冠/],
  ['sword', /つるぎ|剣|刀/],
  ['stone', /石(?!の板)/],
  ['dove', /はと/],
  ['rainbow', /にじ|虹/],
  ['tent', /天幕|幕屋/],
  ['lamp', /ともしび|あかり/],
  ['scroll', /巻物|書物/],
  ['cross', /十字架/],
  ['heart', /愛/],
  ['wheat', /麦|穂/],
  ['grapes', /ぶどう/],
  ['lion', /しし|獅子/],
  ['donkey', /ろば/],
  ['camel', /らくだ/],
  ['snake', /へび/],
  ['manger', /飼葉おけ/],
  ['light', /光/],
  ['table', /食卓|席に/],
];

/** 名前の決まっていない人物の手がかり。本文に出てくる順に選ぶ */
const FIGURE_RULES: [FigureId, RegExp][] = [
  ['angel', /御使|天使/],
  ['shepherd', /羊飼|牧者/],
  ['king', /王(?!国)/],
  ['soldier', /兵|ペリシテ|軍勢|百卒長/],
  ['priest', /祭司|パリサイ|律法学者|長老/],
  ['fisherman', /漁師|網/],
  ['baby', /みどりご|赤子|幼な子/],
  ['child', /子ども|子供|幼子|少年|わらべ/],
  ['woman', /女|妻|母|娘|姉妹/],
  ['elder', /老人|年老/],
  ['crowd', /群衆|人々|民|大ぜい/],
  ['man', /弟子|男/],
];

/** 小物ごとに、本文に出てくる位置（出てこなければ undefined） */
function firstIndex(text: string, pattern: RegExp): number | undefined {
  const index = text.search(pattern);
  return index >= 0 ? index : undefined;
}

function pickInOrder<T extends string>(text: string, rules: [T, RegExp][], limit: number): T[] {
  return rules
    .map(([id, pattern]) => ({ id, index: firstIndex(text, pattern) }))
    .filter((match): match is { id: T; index: number } => match.index !== undefined)
    .sort((a, b) => a.index - b.index)
    .slice(0, limit)
    .map((match) => match.id);
}

function pickSetting(text: string): SettingId | undefined {
  let best: { id: SettingId; count: number } | undefined;
  for (const [id, pattern] of SETTING_RULES) {
    const count = text.match(pattern)?.length ?? 0;
    if (count > 0 && (!best || count > best.count)) best = { id, count };
  }
  return best?.id;
}

/** 本文から読み取れた分だけの場面（何も読み取れない項目は空・undefined） */
export interface SceneHints {
  setting?: SettingId;
  props: PropId[];
  cast: string[];
}

export function guessScene(book: BookId, text: string): SceneHints {
  const people: Person[] = findPeople(book, text).slice(0, MAX_CAST);
  const hasCrown = people.some((person) => person.look.head === 'crown');
  const figures = pickInOrder(text, FIGURE_RULES, MAX_CAST)
    // 冠をかぶった人物（ダビデ王など）がいるときは、別に「王」を足さない
    .filter((figure) => !(figure === 'king' && hasCrown));
  return {
    setting: pickSetting(text),
    props: pickInOrder(text, PROP_RULES, MAX_PROPS),
    cast: [...people.map((person) => person.id), ...figures].slice(0, MAX_CAST),
  };
}

/** 何も読み取れないときの場面 */
const DEFAULT_SCENE: Scene = { setting: 'plain', props: [], cast: ['man'] };

/** 足りない項目を、もとの場面から補う */
export function fillScene(hints: SceneHints, base: Scene = DEFAULT_SCENE): Scene {
  return {
    setting: hints.setting ?? base.setting,
    props: hints.props.length > 0 ? hints.props : base.props,
    cast: hints.cast.length > 0 ? hints.cast : base.cast,
  };
}

/**
 * 箇所全体の場面と、ページごとの場面を推し量る。
 * ページに手がかりが少ないときは、箇所全体の場面を引き継いで、話のつながりを保つ。
 */
export function guessScenes(
  book: BookId,
  fullText: string,
  pages: readonly string[],
): { overall: Scene; pages: Scene[] } {
  const overall = fillScene(guessScene(book, fullText));
  return { overall, pages: pages.map((page) => fillScene(guessScene(book, page), overall)) };
}
