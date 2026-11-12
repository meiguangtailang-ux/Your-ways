import { ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router';
import { formatRef, translation } from '@shared/bible';
import { Sheet, SheetBody } from '@/components/Sheet';
import { readerPath } from '@/lib/routes';
import { Chibi } from './Chibi';
import type { Person } from './people';
import styles from './PersonSheet.module.css';

/** 人物の紹介：イラストと、どんな人か、よくわかる箇所への案内 */
export function PersonSheet({ person, onClose }: { person: Person; onClose: () => void }) {
  const navigate = useNavigate();

  return (
    <Sheet title={person.name} caption={person.summary} onClose={onClose}>
      <SheetBody>
        <div className={styles.portrait}>
          <Chibi look={person.look} size={132} />
        </div>
        <p className={styles.story}>{person.story}</p>
        <button
          type="button"
          className={styles.read}
          onClick={() => {
            onClose();
            navigate(readerPath(person.read));
          }}
        >
          <span>
            <span className={styles.hint}>この人が出てくる箇所を読む</span>
            {formatRef(translation, { ...person.read, verses: [] })}
          </span>
          <ChevronRight size={18} aria-hidden />
        </button>
        <p className={styles.note}>イラストは、親しみやすくするための想像図です。</p>
      </SheetBody>
    </Sheet>
  );
}
