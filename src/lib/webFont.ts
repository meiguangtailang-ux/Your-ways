/**
 * 明朝体の Web フォント（しっぽり明朝）の読み込み。
 * iPhone・Mac・Windows には明朝体が入っているのでそれを使い、
 * 入っていない端末（主に Android）でだけ Web フォントを取りにいく。
 */

/** Web フォントの名前（tokens.css の --font-serif にも書いてある） */
export const WEB_FONT_FAMILY = 'Shippori Mincho';

/** 読み込んでいる太さ：本文と、見出し */
export const WEB_FONT_WEIGHTS = { body: 500, heading: 700 } as const;

/** tokens.css の --font-serif で、Web フォントより前に並べている端末フォント */
const LOCAL_SERIF_FONTS = ['Hiragino Mincho ProN', 'Yu Mincho', 'YuMincho', 'Noto Serif JP'];

/** 端末にそのフォントが入っているかを、文字幅の違いで確かめる */
function hasLocalFont(family: string): boolean {
  const context = document.createElement('canvas').getContext('2d');
  if (!context) return false;
  const sample = 'mmmmmmmmmmlli';
  const measure = (font: string) => {
    context.font = `72px ${font}`;
    return context.measureText(sample).width;
  };
  return measure(`"${family}", monospace`) !== measure('monospace');
}

export function loadSerifWebFontIfNeeded(): void {
  if (LOCAL_SERIF_FONTS.some(hasLocalFont)) return;
  void import('@fontsource/shippori-mincho/500.css');
  void import('@fontsource/shippori-mincho/700.css');
}
