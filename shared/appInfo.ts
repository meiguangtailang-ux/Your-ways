/**
 * アプリの基本情報。画面・ビルド（HTML とホーム画面用の設定）のどちらからも使う。
 * アプリ名はまだ仮。決まったら APP_NAME を書き換えれば、題名やホーム画面の名前に反映される。
 */
export const APP_NAME = 'Your Ways';

export const APP_DESCRIPTION = '紙の聖書のように読み、線を引き、気づきや祈りを残せる聖書アプリ';

/** 端末に保存するデータのキーの接頭辞。変えると既存の保存データが読めなくなる */
export const STORAGE_PREFIX = 'your-ways';

/**
 * 画面の地の色。ブラウザの枠やホーム画面から開いたときの背景に使われる。
 * src/styles/tokens.css の --paper（昼・夜）と同じ値にしておく。
 */
export const PAPER_COLOR = { light: '#f7f1e1', dark: '#1a1815' } as const;
