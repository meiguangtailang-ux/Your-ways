import { describe, expect, it } from 'vitest';
import {
  buildScript,
  pageTexts,
  sceneAt,
  totalSeconds,
  withIllustrations,
  wrapText,
} from './videoScript';

describe('wrapText', () => {
  it('決めた文字数で折り返す', () => {
    expect(wrapText('はじめに神は天と地とを', 5)).toEqual(['はじめに神', 'は天と地と', 'を']);
  });

  it('句読点は行の頭に置かず、前の行にぶら下げる', () => {
    expect(wrapText('創造された。地は', 5)).toEqual(['創造された。', '地は']);
  });
});

describe('buildScript', () => {
  const scenes = buildScript('創世記 1:1', 'あ'.repeat(25), '口語訳', {
    charactersPerLine: 5,
    linesPerPage: 2,
  });

  it('題・本文のページ・出典の順に並べる', () => {
    expect(scenes.map((scene) => scene.kind)).toEqual(['title', 'text', 'text', 'text', 'credit']);
    expect(scenes[1]?.lines).toEqual(['あああああ', 'あああああ']);
  });

  it('短いページでも、読める長さだけ見せる', () => {
    expect(scenes.at(-2)?.seconds).toBeGreaterThanOrEqual(3);
  });

  it('時刻から、見せる場面を決められる', () => {
    expect(sceneAt(scenes, 0)?.scene.kind).toBe('title');
    expect(sceneAt(scenes, 2.6)?.scene.kind).toBe('text');
    expect(sceneAt(scenes, totalSeconds(scenes) - 0.1)?.scene.kind).toBe('credit');
    expect(sceneAt(scenes, totalSeconds(scenes) + 1)).toBeUndefined();
  });
});

describe('withIllustrations', () => {
  const field = {
    setting: 'field',
    props: ['sheep'],
    cast: [{ who: 'shepherd', action: 'walk' }],
  } as const;
  const sea = {
    setting: 'sea',
    props: ['boat'],
    cast: [{ who: 'fisherman', action: 'stand' }],
  } as const;
  const scenes = buildScript('箇所', 'あ'.repeat(25), '口語訳', {
    charactersPerLine: 5,
    linesPerPage: 2,
  });

  it('本文のページの文を取り出す', () => {
    expect(pageTexts(scenes)).toEqual([
      'ああああああああああ',
      'ああああああああああ',
      'あああああ',
    ]);
  });

  it('題には全体の絵、各ページにはそのページの絵、出典には絵を付けない', () => {
    const illustrated = withIllustrations(
      scenes,
      { ...field, props: [...field.props], cast: [...field.cast] },
      [{ ...sea, props: [...sea.props], cast: [...sea.cast] }],
    );
    expect(illustrated.map((scene) => scene.illustration?.setting)).toEqual([
      'field',
      'sea',
      'field',
      'field',
      undefined,
    ]);
  });
});
