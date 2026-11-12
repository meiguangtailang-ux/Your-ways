import { Segmented } from '@/components/Segmented';
import {
  setDisplayPref,
  useDisplayPrefs,
  type TextSize,
  type Theme,
  type WritingMode,
} from './displayPrefs';
import styles from './DisplaySettings.module.css';

const TEXT_SIZES = [
  { value: 'small', label: '小' },
  { value: 'medium', label: '中' },
  { value: 'large', label: '大' },
  { value: 'xlarge', label: '特大' },
] as const satisfies readonly { value: TextSize; label: string }[];

const RUBY = [
  { value: 'on', label: 'あり' },
  { value: 'off', label: 'なし' },
] as const;

const WRITING_MODES = [
  { value: 'horizontal', label: '横書き' },
  { value: 'vertical', label: '縦書き' },
] as const satisfies readonly { value: WritingMode; label: string }[];

const THEMES = [
  { value: 'light', label: '昼' },
  { value: 'dark', label: '夜' },
  { value: 'auto', label: '自動' },
] as const satisfies readonly { value: Theme; label: string }[];

/** 表示の設定（読む画面のシートと、設定画面の両方で使う） */
export function DisplaySettings() {
  const prefs = useDisplayPrefs();

  return (
    <div className={styles.fields}>
      <Field label="文字の大きさ">
        <Segmented
          label="文字の大きさ"
          options={TEXT_SIZES}
          value={prefs.textSize}
          onChange={(value) => setDisplayPref('textSize', value)}
        />
      </Field>
      <Field label="ふりがな">
        <Segmented
          label="ふりがな"
          options={RUBY}
          value={prefs.showRuby ? 'on' : 'off'}
          onChange={(value) => setDisplayPref('showRuby', value === 'on')}
        />
      </Field>
      <Field label="組み方">
        <Segmented
          label="組み方"
          options={WRITING_MODES}
          value={prefs.writingMode}
          onChange={(value) => setDisplayPref('writingMode', value)}
        />
      </Field>
      <Field label="配色" hint="「自動」は、端末の設定（ダークモード）に合わせます。">
        <Segmented
          label="配色"
          options={THEMES}
          value={prefs.theme}
          onChange={(value) => setDisplayPref('theme', value)}
        />
      </Field>
    </div>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={styles.field}>
      <p className={styles.label}>{label}</p>
      {children}
      {hint && <p className={styles.hint}>{hint}</p>}
    </div>
  );
}
