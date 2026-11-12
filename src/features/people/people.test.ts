import { describe, expect, it } from 'vitest';
import { isValidLocation, translation } from '@shared/bible';
import { findPeople, PEOPLE } from './people';

const names = (book: Parameters<typeof findPeople>[0], text: string) =>
  findPeople(book, text).map((person) => person.id);

describe('findPeople', () => {
  it('本文に出てくる人物を、出てくる順に見つける', () => {
    expect(names('exo', '主はモーセとアロンに言われた、')).toEqual(['moses', 'aaron']);
  });

  it('同じ名前でも、旧約と新約で別の人として案内する', () => {
    expect(names('gen', 'ヨセフは夢を見て、')).toEqual(['joseph']);
    expect(names('mat', '夫ヨセフは正しい人であったので、')).toEqual(['joseph-nt']);
  });

  it('バプテスマのヨハネと、弟子のヨハネを区別する', () => {
    expect(names('mat', 'そのころ、バプテスマのヨハネが現れ、')).toEqual(['john-baptist']);
    expect(names('mrk', 'ヤコブとその兄弟ヨハネとが、')).toEqual(['james', 'john']);
  });

  it('サウロはパウロとして案内する', () => {
    expect(names('act', 'サウロは、ステパノを殺すことに賛成していた。')).toEqual([
      'paul',
      'stephen',
    ]);
  });

  it('名前の一部が同じだけの別人は拾わない', () => {
    expect(names('1sa', 'ヨナタンはダビデを愛した。')).toEqual(['david']);
    expect(names('2ki', 'ヒルキヤの子エリヤキム')).toEqual([]);
    expect(names('mat', 'ユダの地ベツレヘムよ、')).toEqual([]);
  });
});

describe('人物の一覧', () => {
  it('「読んでみる」の箇所は、すべて実在する章を指す', () => {
    for (const person of PEOPLE) expect(isValidLocation(translation, person.read)).toBe(true);
  });

  it('id は重複しない', () => {
    expect(new Set(PEOPLE.map((person) => person.id)).size).toBe(PEOPLE.length);
  });
});
