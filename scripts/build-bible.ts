/**
 * OSIS 形式（XML）の聖書を、アプリ用の JSON（書ごとに1ファイル）へ変換する。
 *
 *   npm run build:bible -- <jpn-kougo.osis.xml のパス>
 *
 * 入力：https://github.com/seven1m/open-bibles の jpn-kougo.osis.xml（パブリックドメイン）
 * 出力：public/bible/kougo/<書ID>.json
 *
 * 段落（<p>）・詩の行（<lg>/<l>）・詩篇の表題・ふりがな（<w gloss>）を保ったまま、
 * shared/bible/types.ts の BookData に変換する。
 * 別の翻訳を足すときは、翻訳定義（shared/bible/translations/）を用意して
 * TRANSLATION を差し替えれば同じ手順で生成できる。
 */
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { SaxesParser } from 'saxes';
import { CANON, type BookId } from '../shared/bible/canon';
import { stripRuby } from '../shared/bible/text';
import { kougo } from '../shared/bible/translations/kougo';
import type { Block, BlockKind, BookData, ChapterData } from '../shared/bible/types';

const TRANSLATION = kougo;
const OUT_DIR = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../public/bible',
  TRANSLATION.id,
);

/** 元データの明らかな誤植。（サムエル記下 19:32「八十{歳」） */
const SOURCE_TYPOS = /[{}]/g;

const OSIS_TO_BOOK_ID = new Map<string, BookId>(CANON.map((book) => [book.osis, book.id]));

interface OpenVerse {
  v: number;
  label?: string;
}

class OsisConverter {
  readonly books: BookData[] = [];
  readonly warnings: string[] = [];

  private book: BookData | undefined;
  private chapter: ChapterData | undefined;
  private chapterNumber = 0;
  private block: Block | undefined;
  private blockKind: BlockKind = 'p';
  private stanzaPending = false;
  private verse: OpenVerse | undefined;
  private ruby: { base: string; reading: string } | undefined;
  /** 取り込まない見出し（書名・章題）の中にいるあいだ true */
  private skipping = false;
  /** 本文が始まる前のヘッダー（書誌情報）の中にいるあいだ true */
  private inHeader = false;

  convert(xml: string): void {
    const parser = new SaxesParser();
    parser.on('error', (error) => {
      throw error;
    });
    parser.on('opentag', (tag) => this.open(tag.name, tag.attributes, tag.isSelfClosing));
    parser.on('closetag', (tag) => this.close(tag.name, tag.isSelfClosing));
    parser.on('text', (text) => this.text(text));
    parser.write(xml).close();
  }

  private open(name: string, attrs: Record<string, string>, selfClosing: boolean): void {
    switch (name) {
      case 'header':
        this.inHeader = true;
        break;
      case 'div':
        if (attrs.type === 'book') this.startBook(attrs.osisID ?? '');
        break;
      case 'chapter':
        this.startChapter(attrs.osisID ?? '');
        break;
      case 'title':
        this.endBlock();
        if (attrs.type === 'psalm') this.blockKind = 't';
        else this.skipping = true;
        break;
      case 'p':
        this.endBlock();
        break;
      case 'lg':
        this.endBlock();
        this.stanzaPending = true;
        break;
      case 'l':
        this.endBlock();
        this.blockKind = 'l';
        break;
      case 'verse':
        // 節は <verse osisID>…</verse> と、<verse sID/>…<verse eID/> の2通りで書かれている
        if (attrs.eID !== undefined) this.verse = undefined;
        else this.verse = this.parseVerse(attrs.osisID ?? '');
        if (!selfClosing && attrs.sID !== undefined) this.warn(`sID が自己終了タグではない`);
        break;
      case 'w':
        this.ruby = { base: '', reading: attrs.gloss ?? '' };
        break;
    }
  }

  private close(name: string, selfClosing: boolean): void {
    switch (name) {
      case 'header':
        this.inHeader = false;
        break;
      case 'title':
        this.endBlock();
        this.blockKind = 'p';
        this.skipping = false;
        break;
      case 'p':
        this.endBlock();
        break;
      case 'lg':
        this.endBlock();
        this.stanzaPending = false;
        break;
      case 'l':
        this.endBlock();
        this.blockKind = 'p';
        break;
      case 'verse':
        if (!selfClosing) this.verse = undefined;
        break;
      case 'w':
        if (this.ruby) {
          const { base, reading } = this.ruby;
          this.ruby = undefined;
          this.append(reading ? `｜${base}《${reading}》` : base);
        }
        break;
      case 'chapter':
        this.endBlock();
        this.chapter = undefined;
        break;
    }
  }

  private text(raw: string): void {
    if (this.skipping || this.inHeader) return;
    const text = raw.replace(/[\n\r\t]/g, '').replace(SOURCE_TYPOS, '');
    if (text === '') return;
    if (this.ruby) this.ruby.base += text;
    else this.append(text);
  }

  private append(text: string): void {
    if (!this.chapter) {
      if (text.trim() !== '') this.warn(`章の外に本文がある: ${text.slice(0, 20)}`);
      return;
    }
    const isTitle = this.blockKind === 't';
    if (!isTitle && !this.verse) {
      if (text.trim() !== '') this.warn(`節の外に本文がある: ${text.slice(0, 20)}`);
      return;
    }
    const v = isTitle ? 0 : this.verse!.v;
    const label = isTitle ? undefined : this.verse!.label;

    if (!this.block) {
      this.block = { kind: this.blockKind, segs: [] };
      if (this.blockKind === 'l' && this.stanzaPending) {
        this.block.stanza = true;
        this.stanzaPending = false;
      }
      this.chapter.blocks.push(this.block);
    }
    const last = this.block.segs.at(-1);
    if (last && last.v === v && last.label === label) last.text += text;
    else this.block.segs.push(label === undefined ? { v, text } : { v, label, text });
  }

  private endBlock(): void {
    this.block = undefined;
  }

  private startBook(osisId: string): void {
    const id = OSIS_TO_BOOK_ID.get(osisId);
    if (!id) throw new Error(`未知の書: ${osisId}`);
    this.book = { id, chapters: [] };
    this.books.push(this.book);
  }

  private startChapter(osisId: string): void {
    if (!this.book) throw new Error(`書の外に章がある: ${osisId}`);
    this.chapterNumber = Number(osisId.split('.')[1]);
    if (this.chapterNumber !== this.book.chapters.length + 1) {
      throw new Error(`章の順番が飛んでいる: ${osisId}`);
    }
    this.chapter = { blocks: [] };
    this.book.chapters.push(this.chapter);
    this.endBlock();
    this.verse = undefined;
  }

  /** "Num.15.4 Num.15.5" → { v: 4, label: "4-5" } / "Exod.22.3!a" → { v: 3, label: "3a" } */
  private parseVerse(osisId: string): OpenVerse {
    const parts = osisId.split(' ').map((id) => {
      const [, chapter, verse = ''] = id.split('.');
      if (Number(chapter) !== this.chapterNumber) this.warn(`章と合わない節ID: ${id}`);
      const [number, suffix = ''] = verse.split('!');
      return { number: Number(number), suffix };
    });
    const first = parts[0]!;
    const last = parts.at(-1)!;
    if (!Number.isInteger(first.number) || first.number < 1) {
      throw new Error(`節IDを読めない: ${osisId}`);
    }
    if (parts.length > 1) return { v: first.number, label: `${first.number}-${last.number}` };
    if (first.suffix) return { v: first.number, label: `${first.number}${first.suffix}` };
    return { v: first.number };
  }

  private warn(message: string): void {
    const where = this.book ? `${this.book.id} ${this.chapterNumber}` : '(冒頭)';
    this.warnings.push(`${where}: ${message}`);
  }
}

/** 変換結果が翻訳定義と食い違っていないかを確かめる。問題があれば例外にする */
function validate(books: BookData[]): void {
  const problems: string[] = [];
  const byId = new Map(books.map((book) => [book.id, book]));
  for (const info of TRANSLATION.books) {
    const book = byId.get(info.id);
    if (!book) {
      problems.push(`${info.name}: データが無い`);
      continue;
    }
    if (book.chapters.length !== info.chapters) {
      problems.push(`${info.name}: 章数 ${book.chapters.length}（定義は ${info.chapters}）`);
    }
    book.chapters.forEach((chapter, index) => {
      const hasVerse = chapter.blocks.some((block) => block.segs.some((seg) => seg.v > 0));
      if (!hasVerse) problems.push(`${info.name} ${index + 1}: 節が無い`);
      for (const block of chapter.blocks) {
        for (const seg of block.segs) {
          if (stripRuby(seg.text).trim() === '') {
            problems.push(`${info.name} ${index + 1}:${seg.v}: 本文が空`);
          }
          if (/[｜《》<>]/.test(stripRuby(seg.text))) {
            problems.push(`${info.name} ${index + 1}:${seg.v}: 記号が残っている`);
          }
        }
      }
    });
  }
  if (problems.length > 0) {
    throw new Error(`変換結果に問題があります:\n${problems.slice(0, 30).join('\n')}`);
  }
}

function summarize(books: BookData[]): string {
  let verses = 0;
  let segments = 0;
  const kinds: Record<BlockKind, number> = { p: 0, l: 0, t: 0 };
  for (const book of books) {
    for (const chapter of book.chapters) {
      const seen = new Set<number>();
      for (const block of chapter.blocks) {
        kinds[block.kind] += 1;
        for (const seg of block.segs) {
          segments += 1;
          if (seg.v > 0) seen.add(seg.v);
        }
      }
      verses += seen.size;
    }
  }
  return `${books.length} 書 / ${verses} 節 / 段落 ${kinds.p}・詩行 ${kinds.l}・表題 ${kinds.t} / かたまり ${segments}`;
}

async function main(): Promise<void> {
  const source = process.argv[2];
  if (!source) {
    console.error('使い方: npm run build:bible -- <OSIS XML のパス>');
    process.exitCode = 1;
    return;
  }

  const converter = new OsisConverter();
  converter.convert(await readFile(source, 'utf8'));
  validate(converter.books);

  await rm(OUT_DIR, { recursive: true, force: true });
  await mkdir(OUT_DIR, { recursive: true });
  let bytes = 0;
  for (const book of converter.books) {
    const json = JSON.stringify(book);
    bytes += Buffer.byteLength(json);
    await writeFile(path.join(OUT_DIR, `${book.id}.json`), json);
  }

  console.log(`${TRANSLATION.name}: ${summarize(converter.books)}`);
  console.log(`出力: ${OUT_DIR}（${(bytes / 1024 / 1024).toFixed(1)} MB）`);
  if (converter.warnings.length > 0) {
    console.warn(`警告 ${converter.warnings.length} 件:`);
    for (const warning of converter.warnings.slice(0, 40)) console.warn(`  ${warning}`);
  }
}

await main();
