import { X } from 'lucide-react';
import { useEffect, useId, useRef, type ReactNode } from 'react';
import { cx } from '@/lib/cx';
import { IconButton } from './IconButton';
import styles from './Sheet.module.css';

interface SheetProps {
  title: string;
  /** 題名の下に添える短い説明 */
  caption?: string;
  /** 画面いっぱいの高さで開く（会話など、中身が伸びるもの向け） */
  tall?: boolean;
  onClose: () => void;
  children: ReactNode;
}

/**
 * 画面の下から出るシート。表示したいときだけマウントする（マウント＝開く）。
 * <dialog> を使うので、フォーカスの閉じ込めと Esc で閉じる動きはブラウザに任せている。
 */
export function Sheet({ title, caption, tall, onClose, children }: SheetProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    dialog.showModal();
    // 開いたら、入力欄（data-autofocus を付けたもの）があればそこへ、無ければシート自体へ
    // フォーカスを移す。ブラウザに任せると「閉じる」ボタンに移り、開いただけで枠が付いて目立つ
    (dialog.querySelector<HTMLElement>('[data-autofocus]') ?? panelRef.current)?.focus();
    return () => dialog.close();
  }, []);

  return (
    <dialog
      ref={dialogRef}
      className={styles.dialog}
      aria-labelledby={titleId}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        // シートの外側（暗い部分）を押したら閉じる
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div ref={panelRef} tabIndex={-1} className={cx(styles.panel, tall && styles.tall)}>
        <header className={styles.header}>
          <div className={styles.heading}>
            <h2 id={titleId} className={styles.title}>
              {title}
            </h2>
            {caption && <p className={styles.caption}>{caption}</p>}
          </div>
          <IconButton label="閉じる" onClick={onClose}>
            <X size={20} aria-hidden />
          </IconButton>
        </header>
        {children}
      </div>
    </dialog>
  );
}

/** シートの本文。中身が長いときはここがスクロールする */
export function SheetBody({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cx(styles.body, className)}>{children}</div>;
}

/** シートの下端に固定される操作欄 */
export function SheetFooter({ children }: { children: ReactNode }) {
  return <footer className={styles.footer}>{children}</footer>;
}
