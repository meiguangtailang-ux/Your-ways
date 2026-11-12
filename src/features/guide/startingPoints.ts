/**
 * はじめて聖書を読む人のための「読みはじめ」の候補。
 * 特定の教派の読み方に寄らないよう、広く親しまれている箇所を選び、説明は内容の紹介にとどめる。
 */
import type { ChapterLocation } from '@shared/bible';

export interface StartingPoint {
  location: ChapterLocation;
  /** その章でとくに知られている節。開いたときに、その節へ案内する */
  verse?: number;
  /** その節からの引用。口語訳の本文どおりであることをテストで確かめている */
  quote?: string;
  description: string;
}

export const STARTING_POINTS: readonly StartingPoint[] = [
  {
    location: { book: 'luk', chapter: 1 },
    description:
      'イエスの誕生から十字架、復活までを、順を追って描いた福音書。物語として読みやすく、はじめの一冊によく選ばれます。',
  },
  {
    location: { book: 'mrk', chapter: 1 },
    description: 'いちばん短い福音書。イエスの行いが、たたみかけるように語られます。',
  },
  {
    location: { book: 'jhn', chapter: 3 },
    verse: 16,
    quote: '神はそのひとり子を賜わったほどに、この世を愛して下さった。',
    description: '聖書の中でも、とくによく知られている言葉がある章。',
  },
  {
    location: { book: 'mat', chapter: 5 },
    verse: 3,
    quote: 'こころの貧しい人たちは、さいわいである、',
    description: '「山上の説教」と呼ばれる、イエスの教えのはじまり（5〜7章）。',
  },
  {
    location: { book: 'luk', chapter: 15 },
    description: 'いなくなった羊、なくした銀貨、家を出た息子。3つのたとえ話。',
  },
  {
    location: { book: 'psa', chapter: 23 },
    verse: 1,
    quote: '主はわたしの牧者であって、わたしには乏しいことがない。',
    description: 'もっとも親しまれている詩のひとつ。',
  },
  {
    location: { book: 'gen', chapter: 1 },
    verse: 1,
    quote: 'はじめに神は天と地とを創造された。',
    description: '聖書のはじまり。天地創造の物語。',
  },
  {
    location: { book: '1co', chapter: 13 },
    verse: 4,
    quote: '愛は寛容であり、愛は情深い。',
    description: '愛とは何かを語る、短い章。',
  },
  {
    location: { book: 'ecc', chapter: 3 },
    verse: 1,
    quote: 'すべてのわざには時がある。',
    description: '生きることと、時の移ろいを見つめる言葉。',
  },
];
