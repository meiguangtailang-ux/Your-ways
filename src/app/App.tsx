import { HashRouter, Navigate, Outlet, Route, Routes } from 'react-router';
import { BookmarksScreen } from '@/features/bookmarks/BookmarksScreen';
import { GuideSheet } from '@/features/guide/GuideSheet';
import { markGuideSeen, useGuideSeen } from '@/features/guide/guideStore';
import { JournalScreen } from '@/features/journal/JournalScreen';
import { ReaderScreen } from '@/features/reader/ReaderScreen';
import { useLastRead } from '@/features/reader/lastRead';
import { SearchScreen } from '@/features/search/SearchScreen';
import { SettingsScreen } from '@/features/settings/SettingsScreen';
import { DEFAULT_LOCATION } from '@/config/app';
import { readerPath, ROUTES } from '@/lib/routes';
import { isValidLocation, translation } from '@shared/bible';
import { TabBar } from './TabBar';

/**
 * 画面の構成。
 * URL は「#/read/jhn/3」のようにハッシュで持つ（どこに置いても再読み込みで迷子にならない）。
 */
export function App() {
  return (
    <HashRouter>
      <Routes>
        <Route element={<Shell />}>
          <Route index element={<Resume />} />
          <Route path="read/:bookId/:chapter" element={<ReaderScreen />} />
          <Route path={ROUTES.search} element={<SearchScreen />} />
          <Route path={ROUTES.journal} element={<JournalScreen />} />
          <Route path={ROUTES.bookmarks} element={<BookmarksScreen />} />
          <Route path={ROUTES.settings} element={<SettingsScreen />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}

/** どの画面にも共通する枠（下端のタブバー）。はじめて開いたときは、読みはじめの案内を出す */
function Shell() {
  const guideSeen = useGuideSeen();

  return (
    <>
      <Outlet />
      <TabBar />
      {!guideSeen && <GuideSheet onClose={markGuideSeen} />}
    </>
  );
}

/** アプリを開いたら、最後に読んでいた箇所から始める */
function Resume() {
  const lastRead = useLastRead();
  const location = isValidLocation(translation, lastRead) ? lastRead : DEFAULT_LOCATION;
  return <Navigate to={readerPath(location)} replace />;
}
