import { SaxesParser } from 'saxes';
import { describe, expect, it } from 'vitest';
import { ACTION_IDS, FIGURE_IDS, PROP_IDS, SETTING_IDS } from '@shared/scene/vocabulary';
import { chibiSvg } from '@/features/people/chibi';
import { PEOPLE } from '@/features/people/people';
import { castPlacements, castSvg, sceneBackgroundSvg } from './sceneArt';

const colors = { ink: '#1d1a16', gold: '#b0892f', paper: '#f7f1e1', sunk: '#efe7d2' };

/**
 * 動画では、絵を「画像」として読み込むので、HTML より厳しい XML の決まりを守る必要がある
 * （同じ属性を2回書く、などがあると、何も描かれない）。
 */
function parseStrictly(svg: string): void {
  const parser = new SaxesParser({ xmlns: true });
  parser.on('error', (error) => {
    throw error;
  });
  parser.write(svg).close();
}

describe('挿絵の SVG', () => {
  it('すべての背景が、正しい XML になっている', () => {
    for (const setting of SETTING_IDS) {
      expect(
        () => parseStrictly(sceneBackgroundSvg({ setting, props: [], cast: [] }, colors)),
        setting,
      ).not.toThrow();
    }
  });

  it('すべての小物が、正しい XML になっている', () => {
    for (const prop of PROP_IDS) {
      for (const setting of ['plain', 'sea'] as const) {
        const svg = sceneBackgroundSvg({ setting, props: [prop], cast: [] }, colors);
        expect(() => parseStrictly(svg), `${prop} / ${setting}`).not.toThrow();
      }
    }
  });

  it('すべての人物が、正しい XML になっている', () => {
    for (const id of [...FIGURE_IDS, ...PEOPLE.map((person) => person.id)]) {
      for (const placement of castPlacements({
        setting: 'plain',
        props: [],
        cast: [{ who: id, action: 'stand' }],
      })) {
        expect(() => parseStrictly(castSvg(placement, colors)), id).not.toThrow();
      }
    }
    for (const person of PEOPLE) {
      expect(() => parseStrictly(chibiSvg(person.look, colors)), person.id).not.toThrow();
    }
  });
});

describe('人物の動き', () => {
  it('動きごとの絵が、すべて正しい XML になっている', () => {
    for (const action of ACTION_IDS) {
      for (const who of ['man', 'david']) {
        const [placement] = castPlacements({
          setting: 'plain',
          props: [],
          cast: [{ who, action }],
        });
        expect(() => parseStrictly(castSvg(placement!, colors)), `${who} ${action}`).not.toThrow();
        expect(
          () => parseStrictly(castSvg(placement!, colors, { mouthOpen: true })),
          `${who} ${action} 口`,
        ).not.toThrow();
      }
    }
  });

  it('群衆の3人は、みんな同じ動きをする', () => {
    const placements = castPlacements({
      setting: 'plain',
      props: [],
      cast: [{ who: 'crowd', action: 'raise' }],
    });
    expect(placements.map((placement) => placement.action)).toEqual(['raise', 'raise', 'raise']);
  });
});

describe('castPlacements', () => {
  it('人物の数に応じて、左右に並べる', () => {
    const xs = castPlacements({
      setting: 'plain',
      props: [],
      cast: ['man', 'woman', 'king'].map((who) => ({ who, action: 'stand' as const })),
    }).map((placement) => placement.x);
    expect(xs).toEqual([150, 300, 450]);
  });

  it('群衆は、ひと枠に3人を描く', () => {
    expect(
      castPlacements({ setting: 'plain', props: [], cast: [{ who: 'crowd', action: 'raise' }] }),
    ).toHaveLength(3);
  });
});
