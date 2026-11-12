import { Bookmark, BookOpen, NotebookPen, Search, Settings, type LucideIcon } from 'lucide-react';
import { NavLink, useLocation } from 'react-router';
import { useLastRead } from '@/features/reader/lastRead';
import { cx } from '@/lib/cx';
import { readerPath, ROUTES } from '@/lib/routes';
import styles from './TabBar.module.css';

/** 画面の下端の切り替え：聖書・さがす・ノート・しおり・設定 */
export function TabBar() {
  const lastRead = useLastRead();
  const { pathname } = useLocation();

  return (
    <nav className={styles.bar} aria-label="画面の切り替え">
      <div className={styles.inner}>
        {/* 「聖書」は、最後に読んでいた箇所へ戻る */}
        <Tab
          to={readerPath(lastRead)}
          icon={BookOpen}
          label="聖書"
          active={pathname.startsWith('/read')}
        />
        <Tab to={ROUTES.search} icon={Search} label="さがす" />
        <Tab to={ROUTES.journal} icon={NotebookPen} label="ノート" />
        <Tab to={ROUTES.bookmarks} icon={Bookmark} label="しおり" />
        <Tab to={ROUTES.settings} icon={Settings} label="設定" />
      </div>
    </nav>
  );
}

interface TabProps {
  to: string;
  icon: LucideIcon;
  label: string;
  /** リンク先と現在地の一致以外で「選択中」を決めたいとき */
  active?: boolean;
}

function Tab({ to, icon: Icon, label, active }: TabProps) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) => cx(styles.tab, (active ?? isActive) && styles.active)}
    >
      <Icon size={22} strokeWidth={1.6} aria-hidden />
      {label}
    </NavLink>
  );
}
