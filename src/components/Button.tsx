import type { ButtonHTMLAttributes } from 'react';
import { cx } from '@/lib/cx';
import styles from './Button.module.css';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** solid = 主な操作 / outline = 補助の操作 / quiet = 目立たせない操作 */
  variant?: 'solid' | 'outline' | 'quiet';
}

export function Button({ variant = 'outline', className, type = 'button', ...rest }: ButtonProps) {
  return <button type={type} className={cx(styles.button, styles[variant], className)} {...rest} />;
}
