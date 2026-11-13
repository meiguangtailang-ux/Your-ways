import { useState, type ReactNode } from 'react';
import { translation } from '@shared/bible';
import { Button } from '@/components/Button';
import { ScreenHeader } from '@/components/ScreenHeader';
import { APP_NAME, TEACHER_NAME } from '@/config/app';
import { BackupSection } from '@/features/backup/BackupSection';
import { GuideSheet } from '@/features/guide/GuideSheet';
import { OfflineSection } from '@/features/offline/OfflineSection';
import { TeacherKeySection } from '@/features/teacher/TeacherKeySection';
import { DisplaySettings } from './DisplaySettings';
import styles from './SettingsScreen.module.css';

/** 「設定」画面：表示・オフライン・バックアップ・案内・このアプリについて */
export function SettingsScreen() {
  const [guideOpen, setGuideOpen] = useState(false);

  return (
    <main className={styles.screen}>
      <ScreenHeader title="設定" />

      <Section title="表示">
        <DisplaySettings />
      </Section>

      <Section title={TEACHER_NAME}>
        <TeacherKeySection />
      </Section>

      <Section title="オフライン">
        <OfflineSection />
      </Section>

      <Section title="バックアップ">
        <BackupSection />
      </Section>

      <Section title="はじめての方へ">
        <p className={styles.text}>使い方と、どこから読みはじめるかの案内です。</p>
        <Button className={styles.action} onClick={() => setGuideOpen(true)}>
          読みはじめの案内を開く
        </Button>
      </Section>

      <Section title={`${APP_NAME} について`}>
        <dl className={styles.facts}>
          <dt>聖書</dt>
          <dd>{translation.credit}</dd>
          <dt>{TEACHER_NAME}</dt>
          <dd>
            AI（人工知能）の先生です。使徒パウロ本人ではありません。まちがえることもあるので、大切なことは聖書の本文や信頼できる人にも確かめてください。
          </dd>
          <dt>記録</dt>
          <dd>
            線・メモ・祈り・しおりは、この端末の中だけに保存されます。{TEACHER_NAME}
            に質問したときだけ、その箇所の本文と質問の内容が AI（Anthropic）に送られます。
          </dd>
        </dl>
      </Section>

      {guideOpen && <GuideSheet onClose={() => setGuideOpen(false)} />}
    </main>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className={styles.section}>
      <h2 className={styles.title}>{title}</h2>
      {children}
    </section>
  );
}
