import { chibiSvg, type ChibiLook } from './chibi';

/** 画面では、配色（昼・夜）に合わせて色が変わるよう、CSS の色を使って描く */
const THEME_COLORS = { ink: 'var(--ink)', gold: 'var(--gold)', paper: 'var(--paper-raised)' };

/** 小人ふうの人物イラスト。飾りなので、読み上げの対象にはしない */
export function Chibi({ look, size }: { look: ChibiLook; size: number }) {
  return (
    <span
      aria-hidden
      style={{ display: 'inline-block', width: size, height: size * 1.2, lineHeight: 0 }}
      // 自分で組み立てた SVG だけを入れる（外から来た文字は入らない）
      dangerouslySetInnerHTML={{ __html: chibiSvg(look, THEME_COLORS) }}
    />
  );
}
