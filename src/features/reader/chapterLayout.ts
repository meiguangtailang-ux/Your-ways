/**
 * 章のデータ（段落・詩の行・表題の並び）を、画面に並べやすい形へ整える。
 */
import type { ChapterData, Segment } from '@shared/bible';

export interface PlacedSegment {
  key: string;
  seg: Segment;
  /** 節番号を表示するか（その節・そのラベルが章の中で最初に現れる箇所だけ） */
  showNumber: boolean;
  /** 節の最後のかたまりか（メモ・しおりの印を置く場所） */
  endsVerse: boolean;
}

export type ChapterGroup =
  | { type: 'paragraph'; key: string; segs: PlacedSegment[] }
  | { type: 'title'; key: string; segs: PlacedSegment[] }
  /** 詩のひとまとまり（連）。lines の1要素が1行 */
  | { type: 'stanza'; key: string; lines: { key: string; segs: PlacedSegment[] }[] };

export function layoutChapter(chapter: ChapterData): ChapterGroup[] {
  const lastIndexOfVerse = new Map<number, string>();
  chapter.blocks.forEach((block, blockIndex) => {
    block.segs.forEach((seg, segIndex) => {
      if (seg.v > 0) lastIndexOfVerse.set(seg.v, `${blockIndex}.${segIndex}`);
    });
  });

  const numbered = new Set<string>();
  const groups: ChapterGroup[] = [];

  chapter.blocks.forEach((block, blockIndex) => {
    const segs = block.segs.map((seg, segIndex): PlacedSegment => {
      const key = `${blockIndex}.${segIndex}`;
      const label = seg.label ?? String(seg.v);
      const showNumber = seg.v > 0 && !numbered.has(label);
      if (showNumber) numbered.add(label);
      return { key, seg, showNumber, endsVerse: lastIndexOfVerse.get(seg.v) === key };
    });
    const key = String(blockIndex);

    if (block.kind === 'l') {
      const previous = groups.at(-1);
      if (previous?.type === 'stanza' && !block.stanza) previous.lines.push({ key, segs });
      else groups.push({ type: 'stanza', key, lines: [{ key, segs }] });
    } else {
      groups.push({ type: block.kind === 't' ? 'title' : 'paragraph', key, segs });
    }
  });

  return groups;
}
