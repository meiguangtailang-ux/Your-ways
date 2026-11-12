import type { ReactNode } from 'react';
import styles from './EmptyState.module.css';

/** まだ何も無いときの案内 */
export function EmptyState({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className={styles.empty}>
      <p className={styles.title}>{title}</p>
      {children && <p className={styles.text}>{children}</p>}
    </div>
  );
}
