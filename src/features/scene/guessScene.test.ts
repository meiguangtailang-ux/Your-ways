import { describe, expect, it } from 'vitest';
import { FIGURE_IDS } from '@shared/scene/vocabulary';
import { PEOPLE } from '@/features/people/people';
import { guessScene, guessScenes } from './guessScene';

describe('guessScene', () => {
  it('詩篇23篇：牧場と羊と羊飼い', () => {
    const scene = guessScene(
      'psa',
      '主はわたしの牧者であって、わたしには乏しいことがない。主はわたしを緑の牧場に伏させ、いこいのみぎわに伴われる。',
    );
    expect(scene.setting).toBe('field');
    expect(scene.cast).toContain('shepherd');
    expect(scene.props).toContain('sheep');
  });

  it('ダビデとゴリアテ：名前のある人物・兵士・つるぎ', () => {
    const scene = guessScene(
      '1sa',
      'ダビデはペリシテびとに言った、「おまえはつるぎと、やりと、投げやりを持って、わたしに向かってくるが」',
    );
    expect(scene.cast).toEqual(['david', 'soldier']);
    expect(scene.props).toContain('sword');
  });

  it('湖の場面：海の背景と舟と魚', () => {
    const scene = guessScene(
      'luk',
      'シモンの舟に乗り、陸から少しこぎ出すように頼まれた。そして網をおろすと、おびただしい魚の群れがはいって',
    );
    expect(scene.setting).toBe('sea');
    expect(scene.props).toEqual(['boat', 'fish']);
    expect(scene.cast).toContain('fisherman');
  });

  it('冠をかぶった人物がいれば、「王」を重ねて足さない', () => {
    expect(guessScene('2sa', 'ダビデ王は言った').cast).toEqual(['david']);
  });

  it('箱舟は、小舟と区別する', () => {
    expect(guessScene('gen', 'ノアは箱舟を造った').props).toEqual(['ark']);
  });
});

describe('guessScenes', () => {
  it('手がかりの少ないページは、箇所全体の場面を引き継ぐ', () => {
    const { overall, pages } = guessScenes('psa', '主はわたしの牧者であって、羊のように', [
      '主はわたしの牧者であって、',
      'わたしには乏しいことがない。',
    ]);
    expect(pages[1]).toEqual(overall);
  });

  it('何も読み取れないときも、人物をひとり置く', () => {
    const { overall } = guessScenes('pro', 'さいわいなことよ。', ['さいわいなことよ。']);
    expect(overall.cast).toEqual(['man']);
  });
});

describe('人物の id', () => {
  it('名前のある人物と、名前の決まっていない人物の id が重ならない', () => {
    const ids = PEOPLE.map((person) => person.id);
    expect(ids.filter((id) => (FIGURE_IDS as string[]).includes(id))).toEqual([]);
  });
});
