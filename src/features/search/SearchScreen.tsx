import { Search } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router';
import { formatRef, translation, type SearchIndex } from '@shared/bible';
import { Button } from '@/components/Button';
import { EmptyState } from '@/components/EmptyState';
import { ScreenHeader } from '@/components/ScreenHeader';
import { Segmented } from '@/components/Segmented';
import { readerPath } from '@/lib/routes';
import { useAsync } from '@/lib/useAsync';
import { parseQuery, searchBible, splitByTerms, type SearchScope } from './searchBible';
import { loadSearchIndex } from './searchIndex';
import styles from './SearchScreen.module.css';

const SCOPES = [
  { value: 'all', label: '聖書全体' },
  { value: 'ot', label: '旧約' },
  { value: 'nt', label: '新約' },
] as const satisfies readonly { value: SearchScope; label: string }[];

/** 一度に並べる件数。「さらに表示」でこの数ずつ増やす */
const PAGE_SIZE = 50;

/** 入力が止まってから、さがし始めるまでの待ち時間（ミリ秒） */
const TYPING_PAUSE = 250;

/** URL の ?名前=値 を入れかえる（値が空なら取り除く） */
function withParam(current: URLSearchParams, name: string, value: string): URLSearchParams {
  const next = new URLSearchParams(current);
  if (value) next.set(name, value);
  else next.delete(name);
  return next;
}

/**
 * 「さがす」画面：ことばをふくむ節を、聖書全体からさがす。
 * さがしていることばは URL（?q=）に持つので、節を開いてから戻っても結果が残る。
 */
export function SearchScreen() {
  const [params, setParams] = useSearchParams();
  const query = params.get('q') ?? '';
  const scope = SCOPES.find((option) => option.value === params.get('in'))?.value ?? 'all';
  const [draft, setDraft] = useState(query);
  // かな漢字変換の途中（まだ確定していない文字）では、さがし始めない
  const [composing, setComposing] = useState(false);
  const { state, retry } = useAsync('search-index', loadSearchIndex);

  // 入力が止まったら、さがすことばを URL に反映する
  useEffect(() => {
    const next = draft.trim();
    if (composing || next === query) return;
    const timer = window.setTimeout(
      () => setParams((current) => withParam(current, 'q', next), { replace: true }),
      TYPING_PAUSE,
    );
    return () => window.clearTimeout(timer);
  }, [draft, composing, query, setParams]);

  return (
    <main className={styles.screen}>
      <ScreenHeader title="さがす" />
      <div className={styles.field}>
        <Search size={18} aria-hidden />
        <input
          className={styles.input}
          type="search"
          enterKeyHint="search"
          aria-label="さがすことば"
          placeholder="ことばを入力（例：愛　恐れるな）"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onCompositionStart={() => setComposing(true)}
          onCompositionEnd={() => setComposing(false)}
        />
      </div>
      <Segmented
        label="さがす範囲"
        options={SCOPES}
        value={scope}
        onChange={(value) =>
          setParams((current) => withParam(current, 'in', value === 'all' ? '' : value), {
            replace: true,
          })
        }
      />

      {query === '' ? (
        <p className={styles.hint}>
          ことばを入力すると、その言葉をふくむ節を口語訳聖書の全体からさがします。
          空白で区切って2つ以上入れると、すべてをふくむ節にしぼれます。
        </p>
      ) : state.status === 'loading' ? (
        <p className={styles.hint} role="status">
          さがす準備をしています…
        </p>
      ) : state.status === 'error' ? (
        <div className={styles.hint} role="alert">
          <p>検索用のデータを読み込めませんでした。</p>
          <Button onClick={retry}>もう一度ためす</Button>
        </div>
      ) : (
        // key を付けて、ことばや範囲が変わるたびに表示件数を最初に戻す
        <Results key={`${scope}:${query}`} index={state.value} query={query} scope={scope} />
      )}
    </main>
  );
}

interface ResultsProps {
  index: SearchIndex;
  query: string;
  scope: SearchScope;
}

function Results({ index, query, scope }: ResultsProps) {
  const [limit, setLimit] = useState(PAGE_SIZE);
  const terms = useMemo(() => parseQuery(query), [query]);
  const { hits, total } = useMemo(
    () => searchBible(index, terms, scope, limit),
    [index, terms, scope, limit],
  );

  if (total === 0) {
    return (
      <EmptyState title="見つかりませんでした">
        口語訳聖書の言葉づかいのままさがします。
        <br />
        漢字とひらがなを入れかえたり、短いことばにしたりして、ためしてください。
      </EmptyState>
    );
  }

  return (
    <>
      <p className={styles.count} role="status">
        {total.toLocaleString('ja-JP')}節が見つかりました
      </p>
      <ul className={styles.list}>
        {hits.map((hit) => (
          <li key={`${hit.book}.${hit.chapter}.${hit.verse}`}>
            <Link className={styles.hit} to={readerPath(hit, hit.verse)}>
              <span className={styles.reference}>
                {formatRef(translation, { ...hit, verses: [hit.verse] })}
              </span>
              <span className={styles.text}>
                {splitByTerms(hit.text, terms).map((part, position) =>
                  part.hit ? <mark key={position}>{part.text}</mark> : part.text,
                )}
              </span>
            </Link>
          </li>
        ))}
      </ul>
      {hits.length < total && (
        <Button className={styles.more} onClick={() => setLimit(limit + PAGE_SIZE)}>
          さらに表示（残り {(total - hits.length).toLocaleString('ja-JP')}節）
        </Button>
      )}
    </>
  );
}
