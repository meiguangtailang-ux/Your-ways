import styles from './PassageQuote.module.css';

interface PassageQuoteProps {
  /** 箇所（例：ヨハネによる福音書 3:16） */
  reference: string;
  /** その箇所の本文 */
  quote?: string;
}

/** 聖書箇所とその本文の引用 */
export function PassageQuote({ reference, quote }: PassageQuoteProps) {
  return (
    <blockquote className={styles.quote}>
      {quote && <p className={styles.text}>{quote}</p>}
      <footer className={styles.reference}>{reference}</footer>
    </blockquote>
  );
}
