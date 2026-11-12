export { BOOK_IDS, CANON, isBookId, type BookId } from './canon';
export {
  chapterKey,
  chapterUnit,
  compareLocations,
  findBook,
  formatRef,
  formatVerseList,
  getAdjacentChapter,
  groupConsecutive,
  isChapterLocation,
  isPassageRef,
  isValidLocation,
  type ChapterLocation,
} from './reference';
export {
  getVerseLabel,
  getVerseText,
  listVerses,
  parseRuby,
  quotePassage,
  stripRuby,
  truncate,
  type RubyPart,
} from './text';
export type {
  Block,
  BlockKind,
  BookData,
  BookInfo,
  ChapterData,
  PassageRef,
  SearchIndex,
  Segment,
  Testament,
  Translation,
} from './types';

import { kougo } from './translations/kougo';

/**
 * アプリが使う翻訳。
 * 翻訳を差し替える・増やすときは translations/ に定義を足し、ここを切り替える。
 */
export const translation = kougo;
