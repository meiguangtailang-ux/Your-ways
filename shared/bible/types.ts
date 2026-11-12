import type { BookId } from './canon';

export type Testament = 'ot' | 'nt';

/** 翻訳ごとの書の情報（書名・章数は翻訳によって異なる） */
export interface BookInfo {
  id: BookId;
  /** 正式な書名（例：ヨハネによる福音書） */
  name: string;
  /** 短い書名（例：ヨハネ）。一覧や参照表記に使う */
  shortName: string;
  testament: Testament;
  chapters: number;
}

export interface Translation {
  id: string;
  /** 表示名（例：口語訳） */
  name: string;
  /** 出典・権利表記 */
  credit: string;
  books: readonly BookInfo[];
}

/**
 * 節のひとかたまり。
 * 1つの節が段落や詩の行をまたぐと、複数の Segment に分かれる。
 * text はふりがな付きテキスト（「｜漢字《かんじ》」形式。text.ts を参照）。
 */
export interface Segment {
  /** 節番号。詩篇の表題など節に属さない文は 0 */
  v: number;
  /** 表示用の節番号が v と違うとき（例：「4-5」「3a」）だけ持つ */
  label?: string;
  text: string;
}

/** p = 段落 / l = 詩の1行 / t = 表題（詩篇の題など） */
export type BlockKind = 'p' | 'l' | 't';

export interface Block {
  kind: BlockKind;
  segs: Segment[];
  /** 詩の連（まとまり）の最初の行に付く */
  stanza?: true;
}

export interface ChapterData {
  blocks: Block[];
}

export interface BookData {
  id: BookId;
  chapters: ChapterData[];
}

/** 聖書箇所。verses が空なら章全体を指す */
export interface PassageRef {
  book: BookId;
  chapter: number;
  /** 昇順・重複なし */
  verses: number[];
}

/**
 * 検索用のデータ（search.json）。全巻の本文を、ふりがなを外した文で持つ。
 * 正典の順に、書ごと・章ごとに [節番号, 本文] を並べる。
 */
export type SearchIndex = {
  book: BookId;
  chapters: [verse: number, text: string][][];
}[];
