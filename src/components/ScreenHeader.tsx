import type { ReactNode } from 'react';
import styles from './ScreenHeader.module.css';

/** 「ノート」「しおり」など、一覧画面の見出し */
export function ScreenHeader({ title, action }: { title: string; action?: ReactNode }) {
  return (
    <header className={styles.header}>
      <h1 className={styles.title}>{title}</h1>
      {action}
    </header>
  );
}
