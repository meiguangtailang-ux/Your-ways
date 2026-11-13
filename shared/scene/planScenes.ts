/**
 * AI（Claude）に、動画の各ページの場面を考えてもらう。
 * 背景・小物・人物は vocabulary.ts の一覧から選ばせ、答えの形は構造化出力で決めておく。
 * 失敗したり断られたりしたときは undefined を返す（呼び出し側は言葉からの推測に戻る）。
 */
import type Anthropic from '@anthropic-ai/sdk';
import { zodOutputFormat } from '@anthropic-ai/sdk/helpers/zod';
import { z } from 'zod';
import {
  ACTION_IDS,
  ACTIONS,
  FIGURE_IDS,
  FIGURES,
  MAX_CAST,
  MAX_PROPS,
  PROP_IDS,
  PROPS,
  SETTING_IDS,
  SETTINGS,
  type NamedPerson,
  type Scene,
} from './vocabulary';

export interface SceneRequest {
  /** 箇所（例：サムエル記上 17:45） */
  reference: string;
  /** 動画の各ページの本文 */
  pages: string[];
  /** 本文に出てくる、名前のある人物 */
  people: NamedPerson[];
}

export const SCENES_API_PATH = '/api/scenes';

export const SCENE_LIMITS = { maxPages: 40, maxPageLength: 400, maxPeople: 12 } as const;

/** POST /api/scenes の返事。場面を考えられなかったときは scenes が無い */
export interface SceneResponse {
  scenes?: Scene[];
}

const SYSTEM = `あなたは、日本語の聖書アプリで、聖書の箇所を短い動画にするときの挿絵を考える係です。
挿絵は、小人のようなかわいい人物と、決まった背景・小物を組み合わせて描きます。見る人が「どんな場面か」がひと目でわかることが目的です。

動画の各ページの本文を読み、そのページの場面が伝わるように、背景（setting）をひとつ、小物（props）を0〜${MAX_PROPS}個、登場人物（cast）を0〜${MAX_CAST}人、一覧から選んでください。
登場人物には、そのページの本文で、その人がしていること（action）も一覧から選びます。動画では、人物がその動きをします。

- 本文に出てくる人物・物・場所を優先します。名前のある人物が出てくるときは、その人物の id を使います。
- 前のページから場面が続いているときは、同じ背景や人物を選んで、つながりがわかるようにします。
- 動き（action）は、本文の動詞に合わせます。話している人は speak、それを聞いている人は stand にするなど、人物ごとに選びます。
- 本文の主語になっている人物を、cast の最初に置きます。
- 「主はわたしの牧者」のようなたとえは、たとえの情景（羊飼いと羊、牧場）で描いてかまいません。
- 父なる神を人の姿で描かないでください。神を表すときは、背景 heaven や小物 light を使います。イエスは、人物 jesus がいれば描いてかまいません。
- 争いの場面は、武器を持つ人物や小物で静かに示し、傷ついた姿や死は描きません。
- ページの数と同じ数の場面を、ページの順に返してください。`;

function list(entries: Record<string, string>): string {
  return Object.entries(entries)
    .map(([id, label]) => `- ${id}: ${label}`)
    .join('\n');
}

export async function planScenes(
  client: Anthropic,
  model: string,
  { reference, pages, people }: SceneRequest,
  signal?: AbortSignal,
): Promise<Scene[] | undefined> {
  const castIds = [...people.map((person) => person.id), ...FIGURE_IDS];
  const schema = z.object({
    pages: z.array(
      z.object({
        setting: z.enum(SETTING_IDS as [string, ...string[]]),
        props: z.array(z.enum(PROP_IDS as [string, ...string[]])),
        cast: z.array(
          z.object({
            who: z.enum(castIds as [string, ...string[]]),
            action: z.enum(ACTION_IDS as [string, ...string[]]),
          }),
        ),
      }),
    ),
  });

  const peopleList = people.length
    ? list(Object.fromEntries(people.map((person) => [person.id, person.name])))
    : '（なし）';
  const prompt = `箇所：${reference}

## 背景（setting）
${list(SETTINGS)}

## 小物（props）
${list(PROPS)}

## 名前のある人物（cast）
${peopleList}

## 名前の決まっていない人物（cast）
${list(FIGURES)}

## 人物の動き（action）
${list(ACTIONS)}

## 動画のページ
${pages.map((page, index) => `<page number="${index + 1}">${page}</page>`).join('\n')}`;

  const response = await client.messages.parse(
    {
      model,
      max_tokens: 8000,
      output_config: { effort: 'low', format: zodOutputFormat(schema) },
      system: SYSTEM,
      messages: [{ role: 'user', content: prompt }],
    },
    { signal },
  );
  if (response.stop_reason !== 'end_turn' || !response.parsed_output) return undefined;

  const planned = response.parsed_output.pages;
  if (planned.length === 0) return undefined;
  // 数が合わないときは、足りない分を直前の場面でうめ、多い分は捨てる
  return pages.map((_, index) => {
    const page = planned[Math.min(index, planned.length - 1)]!;
    return {
      setting: page.setting as Scene['setting'],
      props: [...new Set(page.props)].slice(0, MAX_PROPS) as Scene['props'],
      // 同じ人物が2回出てきたら、最初の1回だけ残す
      cast: page.cast
        .filter((member, at) => page.cast.findIndex((other) => other.who === member.who) === at)
        .slice(0, MAX_CAST) as Scene['cast'],
    };
  });
}
