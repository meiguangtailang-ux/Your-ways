import { cx } from '@/lib/cx';
import styles from './Segmented.module.css';

interface SegmentedProps<T extends string> {
  /** 読み上げ用の名前（何を切り替えるのか） */
  label: string;
  options: readonly { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
}

/** 横に並んだ選択肢からひとつを選ぶ切り替え */
export function Segmented<T extends string>({
  label,
  options,
  value,
  onChange,
}: SegmentedProps<T>) {
  return (
    <div className={styles.group} role="radiogroup" aria-label={label}>
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          role="radio"
          aria-checked={option.value === value}
          className={cx(styles.option, option.value === value && styles.checked)}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
