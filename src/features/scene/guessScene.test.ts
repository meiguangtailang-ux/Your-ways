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
    expect(scene.cast.map((member) => member.who)).toContain('shepherd');
    expect(scene.props).toContain('sheep');
  });

  it('ダビデとゴリアテ：名前のある人物・兵士・つるぎ', () => {
    const scene = guessScene(
      '1sa',
      'ダビデはペリシテびとに言った、「おまえはつるぎと、やりと、投げやりを持って、わたしに向かってくるが」',
    );
    expect(scene.cast).toEqual([
      { who: 'david', action: 'speak' },
      // ペリシテびとは、話しかけられている側
      { who: 'soldier', action: 'stand' },
    ]);
    expect(scene.props).toContain('sword');
  });

  it('湖の場面：海の背景と舟と魚', () => {
    const scene = guessScene(
      'luk',
      'シモンの舟に乗り、陸から少しこぎ出すように頼まれた。そして網をおろすと、おびただしい魚の群れがはいって',
    );
    expect(scene.setting).toBe('sea');
    expect(scene.props).toEqual(['boat', 'fish']);
    expect(scene.cast.map((member) => member.who)).toContain('fisherman');
  });

  it('冠をかぶった人物がいれば、「王」を重ねて足さない', () => {
    expect(guessScene('2sa', 'ダビデ王は言った').cast.map((member) => member.who)).toEqual([
      'david',
    ]);
  });

  it('箱舟は、小舟と区別する', () => {
    expect(guessScene('gen', 'ノアは箱舟を造った').props).toEqual(['ark']);
  });
});

describe('人物の動き', () => {
  it('話す人が主語なら、ほかの人は聞き手として立つ', () => {
    expect(guessScene('mrk', 'イエスは弟子たちに言われた').cast).toEqual([
      { who: 'jesus', action: 'speak' },
      { who: 'man', action: 'stand' },
    ]);
  });

  it('みんなで同じことをする場面は、全員が同じ動きをする', () => {
    expect(guessScene('act', 'ペテロと人々は喜んで、神をほめたたえた').cast).toEqual([
      { who: 'peter', action: 'raise' },
      { who: 'crowd', action: 'raise' },
    ]);
  });

  it('祈る・ひざまずく・眠る を読み取る', () => {
    expect(guessScene('mat', 'イエスは祈っておられた').cast[0]?.action).toBe('pray');
    expect(guessScene('mat', '博士たちはひれ伏して幼な子を拝み').cast[0]?.action).toBe('kneel');
    expect(guessScene('jon', 'ヨナは船の奥で横になって熟睡していた').cast[0]?.action).toBe('sleep');
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
    expect(overall.cast).toEqual([{ who: 'man', action: 'stand' }]);
  });
});

describe('人物の id', () => {
  it('名前のある人物と、名前の決まっていない人物の id が重ならない', () => {
    const ids = PEOPLE.map((person) => person.id);
    expect(ids.filter((id) => (FIGURE_IDS as string[]).includes(id))).toEqual([]);
  });
});

describe('主語', () => {
  it('それぞれの主語は、その後ろの動きをする。主語より前の動きは、名前のない人がする', () => {
    // ルカ15:20：出かけたのは（書かれていない）息子、走り寄ったのは父
    expect(
      guessScene(
        'luk',
        'そこで立って、父のところへ出かけた。まだ遠く離れていたのに、父は彼をみとめ、哀れに思って走り寄り、その首をだいて接吻した。',
      ).cast,
    ).toEqual([
      { who: 'man', action: 'walk' },
      { who: 'man', action: 'run' },
    ]);
  });

  it('動くのは主語の人物。話しかけられる人は立っている', () => {
    expect(guessScene('exo', 'モーセはアロンに言った').cast).toEqual([
      { who: 'moses', action: 'speak' },
      { who: 'aaron', action: 'stand' },
    ]);
  });

  it('主語の書かれていない文では、名前のない人が動き、名前の出てくる人は立っている', () => {
    const cast = guessScene(
      'mat',
      'そして、家にはいって、母マリヤのそばにいる幼な子に会い、ひれ伏して拝み、また、宝の箱をあけて、黄金・乳香・没薬などの贈り物をささげた。',
    ).cast;
    expect(cast[0]).toEqual({ who: 'man', action: 'kneel' });
    expect(cast.slice(1).map((member) => member.action)).toEqual(['stand', 'stand']);
    // 「母マリヤ」の「母」を、別の女の人として足さない
    expect(cast.map((member) => member.who)).not.toContain('woman');
  });
});
