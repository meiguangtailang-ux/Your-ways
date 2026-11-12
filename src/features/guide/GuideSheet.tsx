import { ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router';
import { formatRef, translation } from '@shared/bible';
import { Sheet, SheetBody } from '@/components/Sheet';
import { TEACHER_NAME } from '@/config/app';
import { readerPath } from '@/lib/routes';
import { STARTING_POINTS, type StartingPoint } from './startingPoints';
import styles from './GuideSheet.module.css';

const TIPS = [
  '気になる節を押すと、線を引く・メモや祈りを書く・しおりをはさむ、ができます。',
  `意味がわからないときは、節を選んで「${TEACHER_NAME}」にたずねてください。`,
  '右上の「表示」で、文字の大きさ・ふりがな・縦書き・夜の配色を選べます。',
];

/** はじめての人のための案内：使い方と、読みはじめの候補 */
export function GuideSheet({ onClose }: { onClose: () => void }) {
  const navigate = useNavigate();

  const open = (point: StartingPoint) => {
    onClose();
    navigate(readerPath(point.location, point.verse));
  };

  return (
    <Sheet title="はじめての方へ" onClose={onClose}>
      <SheetBody>
        <p className={styles.lead}>
          聖書は、66の書を集めた小さな図書館のような本です。最初から順に読まなくてもかまいません。
        </p>

        <h3 className={styles.heading}>つかい方</h3>
        <ul className={styles.tips}>
          {TIPS.map((tip) => (
            <li key={tip}>{tip}</li>
          ))}
        </ul>

        <h3 className={styles.heading}>どこから読みますか</h3>
        <ul className={styles.points}>
          {STARTING_POINTS.map((point) => (
            <li key={`${point.location.book}.${point.location.chapter}`}>
              <button type="button" className={styles.point} onClick={() => open(point)}>
                <span className={styles.body}>
                  <span className={styles.reference}>
                    {formatRef(translation, { ...point.location, verses: [] })}
                  </span>
                  {point.quote && <span className={styles.quote}>「{point.quote}」</span>}
                  <span className={styles.description}>{point.description}</span>
                </span>
                <ChevronRight size={18} aria-hidden />
              </button>
            </li>
          ))}
        </ul>
        <p className={styles.footnote}>この案内は、「設定」からいつでも開けます。</p>
      </SheetBody>
    </Sheet>
  );
}
