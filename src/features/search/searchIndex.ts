import { translation, type SearchIndex } from '@shared/bible';

let pending: Promise<SearchIndex> | undefined;

/** 検索用データ（全巻の本文）の置き場所 */
export function searchIndexUrl(): string {
  return `${import.meta.env.BASE_URL}bible/${translation.id}/search.json`;
}

/** 検索用データを読み込む。大きいので、検索画面を開いたときに1度だけ取りにいく */
export function loadSearchIndex(): Promise<SearchIndex> {
  if (!pending) {
    pending = fetch(searchIndexUrl()).then((response) => {
      if (!response.ok) throw new Error(`検索用データを読み込めませんでした（${response.status}）`);
      return response.json() as Promise<SearchIndex>;
    });
    // 失敗したら覚えず、やり直せるようにする
    pending.catch(() => (pending = undefined));
  }
  return pending;
}
