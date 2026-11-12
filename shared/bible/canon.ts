/**
 * 聖書66巻の「正典の並び」。翻訳に依存しない情報だけを持つ。
 * 書名や章数は翻訳ごとに違うので translations/ 側で定義する。
 */
import type { Testament } from './types';

export const CANON = [
  { id: 'gen', osis: 'Gen', testament: 'ot' },
  { id: 'exo', osis: 'Exod', testament: 'ot' },
  { id: 'lev', osis: 'Lev', testament: 'ot' },
  { id: 'num', osis: 'Num', testament: 'ot' },
  { id: 'deu', osis: 'Deut', testament: 'ot' },
  { id: 'jos', osis: 'Josh', testament: 'ot' },
  { id: 'jdg', osis: 'Judg', testament: 'ot' },
  { id: 'rut', osis: 'Ruth', testament: 'ot' },
  { id: '1sa', osis: '1Sam', testament: 'ot' },
  { id: '2sa', osis: '2Sam', testament: 'ot' },
  { id: '1ki', osis: '1Kgs', testament: 'ot' },
  { id: '2ki', osis: '2Kgs', testament: 'ot' },
  { id: '1ch', osis: '1Chr', testament: 'ot' },
  { id: '2ch', osis: '2Chr', testament: 'ot' },
  { id: 'ezr', osis: 'Ezra', testament: 'ot' },
  { id: 'neh', osis: 'Neh', testament: 'ot' },
  { id: 'est', osis: 'Esth', testament: 'ot' },
  { id: 'job', osis: 'Job', testament: 'ot' },
  { id: 'psa', osis: 'Ps', testament: 'ot' },
  { id: 'pro', osis: 'Prov', testament: 'ot' },
  { id: 'ecc', osis: 'Eccl', testament: 'ot' },
  { id: 'sng', osis: 'Song', testament: 'ot' },
  { id: 'isa', osis: 'Isa', testament: 'ot' },
  { id: 'jer', osis: 'Jer', testament: 'ot' },
  { id: 'lam', osis: 'Lam', testament: 'ot' },
  { id: 'ezk', osis: 'Ezek', testament: 'ot' },
  { id: 'dan', osis: 'Dan', testament: 'ot' },
  { id: 'hos', osis: 'Hos', testament: 'ot' },
  { id: 'jol', osis: 'Joel', testament: 'ot' },
  { id: 'amo', osis: 'Amos', testament: 'ot' },
  { id: 'oba', osis: 'Obad', testament: 'ot' },
  { id: 'jon', osis: 'Jonah', testament: 'ot' },
  { id: 'mic', osis: 'Mic', testament: 'ot' },
  { id: 'nam', osis: 'Nah', testament: 'ot' },
  { id: 'hab', osis: 'Hab', testament: 'ot' },
  { id: 'zep', osis: 'Zeph', testament: 'ot' },
  { id: 'hag', osis: 'Hag', testament: 'ot' },
  { id: 'zec', osis: 'Zech', testament: 'ot' },
  { id: 'mal', osis: 'Mal', testament: 'ot' },
  { id: 'mat', osis: 'Matt', testament: 'nt' },
  { id: 'mrk', osis: 'Mark', testament: 'nt' },
  { id: 'luk', osis: 'Luke', testament: 'nt' },
  { id: 'jhn', osis: 'John', testament: 'nt' },
  { id: 'act', osis: 'Acts', testament: 'nt' },
  { id: 'rom', osis: 'Rom', testament: 'nt' },
  { id: '1co', osis: '1Cor', testament: 'nt' },
  { id: '2co', osis: '2Cor', testament: 'nt' },
  { id: 'gal', osis: 'Gal', testament: 'nt' },
  { id: 'eph', osis: 'Eph', testament: 'nt' },
  { id: 'php', osis: 'Phil', testament: 'nt' },
  { id: 'col', osis: 'Col', testament: 'nt' },
  { id: '1th', osis: '1Thess', testament: 'nt' },
  { id: '2th', osis: '2Thess', testament: 'nt' },
  { id: '1ti', osis: '1Tim', testament: 'nt' },
  { id: '2ti', osis: '2Tim', testament: 'nt' },
  { id: 'tit', osis: 'Titus', testament: 'nt' },
  { id: 'phm', osis: 'Phlm', testament: 'nt' },
  { id: 'heb', osis: 'Heb', testament: 'nt' },
  { id: 'jas', osis: 'Jas', testament: 'nt' },
  { id: '1pe', osis: '1Pet', testament: 'nt' },
  { id: '2pe', osis: '2Pet', testament: 'nt' },
  { id: '1jn', osis: '1John', testament: 'nt' },
  { id: '2jn', osis: '2John', testament: 'nt' },
  { id: '3jn', osis: '3John', testament: 'nt' },
  { id: 'jud', osis: 'Jude', testament: 'nt' },
  { id: 'rev', osis: 'Rev', testament: 'nt' },
] as const satisfies readonly { id: string; osis: string; testament: Testament }[];

export type BookId = (typeof CANON)[number]['id'];

export const BOOK_IDS: readonly BookId[] = CANON.map((book) => book.id);

export function isBookId(value: string): value is BookId {
  return (BOOK_IDS as readonly string[]).includes(value);
}
