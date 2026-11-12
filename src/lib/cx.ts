/** 条件付きでクラス名をつなげる */
export function cx(...names: (string | false | null | undefined)[]): string {
  return names.filter(Boolean).join(' ');
}
