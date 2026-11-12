import type { ButtonHTMLAttributes } from 'react';
import { cx } from '@/lib/cx';
import styles from './IconButton.module.css';

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** 読み上げ用の名前（アイコンだけのボタンなので必須） */
  label: string;
  active?: boolean;
}

export function IconButton({ label, active, className, children, ...rest }: IconButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={cx(styles.button, active && styles.active, className)}
      {...rest}
    >
      {children}
    </button>
  );
}
