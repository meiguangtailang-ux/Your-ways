/**
 * 聖書に出てくる主な人物の紹介。節の本文に名前（口語訳の表記）が出てきたら、その人を案内する。
 *
 * 説明は、聖書に書かれている広く知られた事がらにとどめ、特定の教派の読み方に寄らないようにする。
 * 同じ名前の人が何人もいる場合（マリヤ、ヨハネ、ヤコブなど）は、決めつけずにそのことを伝える。
 */
import { translation, type BookId, type ChapterLocation, type Testament } from '@shared/bible';
import type { ChibiLook } from './chibi';

export interface Person {
  id: string;
  name: string;
  /** 本文から名前を見つけるための書き方（正規表現）。省くと name そのまま */
  match?: string;
  /** その名前がこの人を指す範囲。旧約と新約で別の人を指す名前がある */
  testament: Testament;
  /** ひとことで言うと */
  summary: string;
  /** どんな人か */
  story: string;
  /** この人のことがよくわかる箇所 */
  read: ChapterLocation;
  look: ChibiLook;
}

export const PEOPLE: readonly Person[] = [
  // ---------- 旧約 ----------
  {
    id: 'adam',
    name: 'アダム',
    testament: 'ot',
    summary: '最初の人',
    story:
      '神が土のちりから造った、最初の人です。エデンの園に住み、妻エバとともに、食べてはならないと言われた木の実を食べて、園を出ることになりました。',
    read: { book: 'gen', chapter: 2 },
    look: { hair: 'short', robe: 'paper', item: 'wheat' },
  },
  {
    id: 'eve',
    name: 'エバ',
    match: 'エバ(?!ル|ン)',
    testament: 'ot',
    summary: '最初の女の人',
    story:
      'アダムの妻で、「すべて生きた者の母」と呼ばれます。へびにさそわれて木の実を食べ、アダムにも与えました。',
    read: { book: 'gen', chapter: 3 },
    look: { hair: 'long', robe: 'paper' },
  },
  {
    id: 'noah',
    name: 'ノア',
    testament: 'ot',
    summary: '箱舟を造った人',
    story:
      '神の言葉に従って大きな箱舟を造り、家族と動物たちとともに洪水をのがれました。洪水のあと、神は虹を約束のしるしとされました。',
    read: { book: 'gen', chapter: 6 },
    look: { hair: 'bald', beard: 'long', robe: 'gold', item: 'boat' },
  },
  {
    id: 'abraham',
    name: 'アブラハム',
    match: 'アブラハム|アブラム',
    testament: 'ot',
    summary: '信仰の父と呼ばれる人',
    story:
      '神に呼ばれて、行き先を知らないまま故郷を旅立ちました。年老いてから子イサクを与えられ、イスラエルの民の先祖となりました。もとの名はアブラムです。',
    read: { book: 'gen', chapter: 12 },
    look: { hair: 'bald', beard: 'long', head: 'cloth', robe: 'gold', item: 'star' },
  },
  {
    id: 'sarah',
    name: 'サラ',
    match: 'サラ(?!ヤ)|サライ',
    testament: 'ot',
    summary: 'アブラハムの妻',
    story:
      'アブラハムとともに旅をし、年老いてから約束の子イサクを産みました。もとの名はサライです。',
    read: { book: 'gen', chapter: 21 },
    look: { hair: 'long', head: 'veil', robe: 'paper' },
  },
  {
    id: 'isaac',
    name: 'イサク',
    testament: 'ot',
    summary: 'アブラハムとサラの子',
    story:
      'アブラハムとサラが年老いてから与えられた、約束の子です。リベカと結婚し、エサウとヤコブの父となりました。',
    read: { book: 'gen', chapter: 22 },
    look: { hair: 'short', beard: 'short', robe: 'paper', item: 'lamb' },
  },
  {
    id: 'jacob',
    name: 'ヤコブ',
    testament: 'ot',
    summary: 'イスラエルと名づけられた人',
    story:
      'イサクの子で、エサウのふたごの弟です。のちに神から「イスラエル」という名を与えられ、その十二人の子がイスラエルの十二部族の先祖となりました。',
    read: { book: 'gen', chapter: 28 },
    look: { hair: 'curly', beard: 'short', robe: 'gold', item: 'staff' },
  },
  {
    id: 'joseph',
    name: 'ヨセフ',
    testament: 'ot',
    summary: 'エジプトで人々を救ったヤコブの子',
    story:
      '兄たちにねたまれてエジプトに売られましたが、夢を解き明かして王に用いられ、ききんから多くの人を救いました。のちに兄たちをゆるします。',
    read: { book: 'gen', chapter: 37 },
    look: { hair: 'short', robe: 'gold', item: 'wheat' },
  },
  {
    id: 'moses',
    name: 'モーセ',
    testament: 'ot',
    summary: '民をエジプトから導き出した人',
    story:
      '神に呼ばれ、奴隷となっていたイスラエルの民をエジプトから導き出しました。シナイ山で、十戒をはじめとする神の律法を受けました。',
    read: { book: 'exo', chapter: 3 },
    look: { hair: 'long', beard: 'long', robe: 'ink', item: 'tablets' },
  },
  {
    id: 'aaron',
    name: 'アロン',
    testament: 'ot',
    summary: 'モーセの兄、最初の大祭司',
    story:
      'モーセの兄で、口の重いモーセに代わって語りました。イスラエルの最初の大祭司となりました。',
    read: { book: 'exo', chapter: 4 },
    look: { hair: 'short', beard: 'long', head: 'cloth', robe: 'gold', item: 'staff' },
  },
  {
    id: 'joshua',
    name: 'ヨシュア',
    testament: 'ot',
    summary: 'モーセのあとを継いだ指導者',
    story: 'モーセの従者で、モーセの死後、民を率いてヨルダン川を渡り、約束の地にはいりました。',
    read: { book: 'jos', chapter: 1 },
    look: { hair: 'short', beard: 'short', robe: 'ink', item: 'staff' },
  },
  {
    id: 'ruth',
    name: 'ルツ',
    testament: 'ot',
    summary: 'しゅうとめに尽くした外国の女性',
    story:
      'モアブの女性です。夫に先立たれたあとも、しゅうとめナオミを離れずベツレヘムへ来て、落ち穂を拾って支えました。ダビデ王の曾祖母にあたります。',
    read: { book: 'rut', chapter: 1 },
    look: { hair: 'long', head: 'veil', robe: 'paper', item: 'wheat' },
  },
  {
    id: 'samuel',
    name: 'サムエル',
    testament: 'ot',
    summary: '王に油を注いだ預言者',
    story:
      '母ハンナの祈りによって生まれ、幼いころから神に仕えました。サウルとダビデに油を注いで王としました。',
    read: { book: '1sa', chapter: 3 },
    look: { hair: 'long', beard: 'long', robe: 'paper', item: 'scroll' },
  },
  {
    id: 'saul',
    name: 'サウル',
    testament: 'ot',
    summary: 'イスラエルの最初の王',
    story:
      'イスラエルの最初の王に選ばれましたが、しだいに神の言葉に従わなくなり、ダビデをねたんで追い回しました。',
    read: { book: '1sa', chapter: 9 },
    look: { hair: 'short', beard: 'short', head: 'crown', robe: 'ink' },
  },
  {
    id: 'david',
    name: 'ダビデ',
    testament: 'ot',
    summary: '羊飼いから王になった人',
    story:
      '羊飼いの少年のとき、石投げで巨人ゴリアテを倒しました。のちにイスラエルの王となり、多くの詩（詩篇）を残しました。あやまちも犯しましたが、悔い改めて神に立ち帰りました。',
    read: { book: '1sa', chapter: 17 },
    look: { hair: 'curly', head: 'crown', robe: 'gold', item: 'harp' },
  },
  {
    id: 'solomon',
    name: 'ソロモン',
    testament: 'ot',
    summary: '知恵を求めた王',
    story:
      'ダビデの子で、あとを継いで王となりました。神に知恵を願い求め、エルサレムに神殿を建てました。',
    read: { book: '1ki', chapter: 3 },
    look: { hair: 'short', beard: 'short', head: 'crown', robe: 'gold', item: 'scroll' },
  },
  {
    id: 'elijah',
    name: 'エリヤ',
    match: 'エリヤ(?!キム|シブ|ダ|タ|サフ|フ)',
    testament: 'ot',
    summary: '火のような預言者',
    story:
      '王アハブの時代に、ただひとり神の言葉を語り続けた預言者です。最後は、つむじ風に乗って天に上げられました。',
    read: { book: '1ki', chapter: 18 },
    look: { hair: 'long', beard: 'long', robe: 'ink', item: 'staff' },
  },
  {
    id: 'isaiah',
    name: 'イザヤ',
    testament: 'ot',
    summary: '救いを告げた預言者',
    story:
      'ユダの王たちの時代に語った預言者です。さばきとともに、やがて来る救いと平和を告げました。',
    read: { book: 'isa', chapter: 6 },
    look: { hair: 'short', beard: 'long', robe: 'paper', item: 'scroll' },
  },
  {
    id: 'jeremiah',
    name: 'エレミヤ',
    testament: 'ot',
    summary: '涙の預言者',
    story: '若くして神に呼ばれ、国が滅びに向かう苦しい時代に、人々に立ち帰るよう語り続けました。',
    read: { book: 'jer', chapter: 1 },
    look: { hair: 'short', beard: 'short', robe: 'ink', item: 'scroll' },
  },
  {
    id: 'daniel',
    name: 'ダニエル',
    testament: 'ot',
    summary: 'ししの穴から救われた人',
    story:
      'バビロンに連れて行かれても神への祈りをやめず、ししの穴に投げこまれましたが、守られました。',
    read: { book: 'dan', chapter: 6 },
    look: { hair: 'short', robe: 'gold', item: 'star' },
  },
  {
    id: 'jonah',
    name: 'ヨナ',
    match: 'ヨナ(?!タン|ダブ)',
    testament: 'ot',
    summary: '大きな魚にのまれた預言者',
    story:
      '神の命令から逃げて船に乗り、海に投げこまれて大きな魚にのまれました。三日三晩ののち、ニネベの町へ行って語りました。',
    read: { book: 'jon', chapter: 1 },
    look: { hair: 'short', beard: 'short', robe: 'paper', item: 'fish' },
  },
  {
    id: 'job',
    name: 'ヨブ',
    testament: 'ot',
    summary: '苦しみの中で問い続けた人',
    story:
      '正しい人でしたが、財産も子どもも健康も失いました。なぜ苦しむのかを神に問い続け、最後に神ご自身の語りかけを聞きます。',
    read: { book: 'job', chapter: 1 },
    look: { hair: 'bald', beard: 'long', robe: 'ink' },
  },
  {
    id: 'esther',
    name: 'エステル',
    testament: 'ot',
    summary: '民を救った王妃',
    story:
      'ペルシャの王妃となったユダヤ人の女性です。命がけで王に願い出て、滅ぼされそうになった同胞を救いました。',
    read: { book: 'est', chapter: 4 },
    look: { hair: 'long', head: 'crown', robe: 'gold' },
  },

  // ---------- 新約 ----------
  {
    id: 'jesus',
    name: 'イエス',
    testament: 'nt',
    summary: '新約聖書の中心となる方',
    story:
      'ベツレヘムで生まれ、ナザレで育ちました。神の国を教え、病人をいやし、十字架につけられて死に、三日目によみがえったと福音書は伝えます。キリスト（救い主）と呼ばれます。',
    read: { book: 'mrk', chapter: 1 },
    look: { hair: 'long', beard: 'short', robe: 'paper', item: 'lamb' },
  },
  {
    id: 'mary',
    name: 'マリヤ',
    testament: 'nt',
    summary: 'イエスの母の名。同じ名の女性が何人かいます',
    story:
      'いちばん知られているのは、イエスの母マリヤです。ほかに、復活の朝に墓へ行ったマグダラのマリヤ、マルタの姉妹のマリヤなどがいます。どのマリヤかは、前後を読むとわかります。',
    read: { book: 'luk', chapter: 1 },
    look: { hair: 'long', head: 'veil', robe: 'paper' },
  },
  {
    id: 'joseph-nt',
    name: 'ヨセフ',
    testament: 'nt',
    summary: 'マリヤの夫の名。同じ名の人がほかにもいます',
    story:
      '福音書のはじめに出てくるのは、マリヤの夫で、幼いイエスを守り育てた大工のヨセフです。ほかに、イエスを墓に葬ったアリマタヤのヨセフなどがいます。',
    read: { book: 'mat', chapter: 1 },
    look: { hair: 'short', beard: 'short', robe: 'ink', item: 'staff' },
  },
  {
    id: 'john-baptist',
    name: 'バプテスマのヨハネ',
    testament: 'nt',
    summary: 'イエスの前に道を備えた人',
    story:
      '荒野で悔い改めを説き、ヨルダン川で人々にバプテスマ（洗礼）を授けました。イエスにもバプテスマを授けました。',
    read: { book: 'mat', chapter: 3 },
    look: { hair: 'long', beard: 'long', robe: 'ink', item: 'staff' },
  },
  {
    id: 'john',
    name: 'ヨハネ',
    match: '(?<!バプテスマの)ヨハネ',
    testament: 'nt',
    summary: 'イエスの弟子の名。バプテスマのヨハネも同じ名です',
    story:
      'イエスの十二弟子のひとりで、ヤコブの兄弟、もとは漁師でした。福音書では、バプテスマ（洗礼）を授けたヨハネも、ただ「ヨハネ」と書かれることがあります。どちらかは前後を読むとわかります。',
    read: { book: 'mrk', chapter: 1 },
    look: { hair: 'short', robe: 'paper', item: 'net' },
  },
  {
    id: 'peter',
    name: 'ペテロ',
    match: 'ペテロ|ケパ',
    testament: 'nt',
    summary: '漁師だった、弟子たちの代表',
    story:
      'ガリラヤ湖の漁師でしたが、イエスに呼ばれて弟子になりました。もとの名はシモンです。イエスを三度知らないと言ってしまいますが、のちに教会の中心となって働きました。',
    read: { book: 'luk', chapter: 5 },
    look: { hair: 'curly', beard: 'short', robe: 'gold', item: 'key' },
  },
  {
    id: 'andrew',
    name: 'アンデレ',
    testament: 'nt',
    summary: 'ペテロの兄弟',
    story: 'ペテロの兄弟で、同じく漁師でした。兄弟ペテロをイエスのもとに連れてきました。',
    read: { book: 'jhn', chapter: 1 },
    look: { hair: 'short', beard: 'short', robe: 'paper', item: 'net' },
  },
  {
    id: 'james',
    name: 'ヤコブ',
    testament: 'nt',
    summary: 'イエスの弟子の名。同じ名の人が何人かいます',
    story:
      '十二弟子のひとりで、ヨハネの兄弟のヤコブがよく知られています。ほかに、イエスの兄弟で教会の指導者となったヤコブや、旧約聖書のヤコブ（イスラエルの先祖）を指すこともあります。',
    read: { book: 'mrk', chapter: 1 },
    look: { hair: 'short', beard: 'short', robe: 'ink', item: 'net' },
  },
  {
    id: 'matthew',
    name: 'マタイ',
    testament: 'nt',
    summary: '取税人だった弟子',
    story:
      '税を集める仕事をしていて人々に嫌われていましたが、イエスに「わたしに従ってきなさい」と呼ばれ、すぐに立って従いました。',
    read: { book: 'mat', chapter: 9 },
    look: { hair: 'short', beard: 'short', robe: 'gold', item: 'pen' },
  },
  {
    id: 'thomas',
    name: 'トマス',
    testament: 'nt',
    summary: '見るまで信じないと言った弟子',
    story:
      'イエスがよみがえったと聞いても、自分の目で見るまでは信じないと言いました。のちにイエスに会い、「わが主よ、わが神よ」と言いました。',
    read: { book: 'jhn', chapter: 20 },
    look: { hair: 'curly', robe: 'paper' },
  },
  {
    id: 'judas',
    name: 'イスカリオテのユダ',
    match: 'イスカリオテ(?:の)?(?:シモンの子)?ユダ|ユダ・イスカリオテ',
    testament: 'nt',
    summary: 'イエスを引き渡した弟子',
    story: '十二弟子のひとりでしたが、銀貨三十枚でイエスを祭司長たちに引き渡しました。',
    read: { book: 'mat', chapter: 26 },
    look: { hair: 'short', beard: 'short', robe: 'ink' },
  },
  {
    id: 'martha',
    name: 'マルタ',
    testament: 'nt',
    summary: 'もてなしに忙しく働いた女性',
    story:
      'マリヤとラザロのきょうだいです。イエスを家に迎え、もてなしのために忙しく立ち働きました。',
    read: { book: 'luk', chapter: 10 },
    look: { hair: 'long', head: 'veil', robe: 'gold' },
  },
  {
    id: 'nicodemus',
    name: 'ニコデモ',
    testament: 'nt',
    summary: '夜、イエスをたずねた指導者',
    story:
      'パリサイ人で、ユダヤ人の指導者です。夜イエスをたずね、「新しく生れる」ことについて教えを聞きました。',
    read: { book: 'jhn', chapter: 3 },
    look: { hair: 'bald', beard: 'long', head: 'cloth', robe: 'ink', item: 'scroll' },
  },
  {
    id: 'pilate',
    name: 'ピラト',
    testament: 'nt',
    summary: 'ローマの総督',
    story:
      'ユダヤを治めていたローマの総督です。イエスに罪を見いだせないと言いながら、群衆の声におされて十字架につけることを許しました。',
    read: { book: 'jhn', chapter: 18 },
    look: { hair: 'short', robe: 'gold' },
  },
  {
    id: 'paul',
    name: 'パウロ',
    match: 'パウロ|サウロ',
    testament: 'nt',
    summary: '迫害する者から、伝える者になった人',
    story:
      'はじめはサウロという名で、イエスを信じる人々を迫害していました。ダマスコへ向かう道でよみがえったイエスに出会い、各地に教えを伝えて、多くの手紙を書きました。',
    read: { book: 'act', chapter: 9 },
    look: { hair: 'bald', beard: 'long', robe: 'paper', item: 'pen' },
  },
  {
    id: 'stephen',
    name: 'ステパノ',
    testament: 'nt',
    summary: '最初の殉教者',
    story:
      '教会で人々の世話をするために選ばれたひとりです。大胆に語ったために石で打たれ、自分を打つ人々のために祈りながら死にました。',
    read: { book: 'act', chapter: 7 },
    look: { hair: 'short', robe: 'paper' },
  },
  {
    id: 'barnabas',
    name: 'バルナバ',
    testament: 'nt',
    summary: '「慰めの子」と呼ばれた人',
    story: '人々に恐れられていたパウロを仲間に引き合わせ、ともに旅をして教えを伝えました。',
    read: { book: 'act', chapter: 11 },
    look: { hair: 'curly', beard: 'short', robe: 'gold', item: 'staff' },
  },
  {
    id: 'timothy',
    name: 'テモテ',
    testament: 'nt',
    summary: 'パウロの若い同労者',
    story:
      'パウロが「愛する子」と呼んだ若い弟子です。パウロとともに働き、パウロから二通の手紙を受け取りました。',
    read: { book: 'act', chapter: 16 },
    look: { hair: 'short', robe: 'paper', item: 'scroll' },
  },
];

const TESTAMENT_OF = new Map<BookId, Testament>(
  translation.books.map((book) => [book.id, book.testament]),
);

/** 本文に名前が出てくる人物を、出てくる順に返す */
export function findPeople(book: BookId, text: string): Person[] {
  const testament = TESTAMENT_OF.get(book);
  return PEOPLE.filter((person) => person.testament === testament)
    .map((person) => ({ person, index: text.search(new RegExp(person.match ?? person.name, 'u')) }))
    .filter(({ index }) => index >= 0)
    .sort((a, b) => a.index - b.index)
    .map(({ person }) => person);
}
