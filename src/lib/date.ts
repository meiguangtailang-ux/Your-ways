const DATE_FORMAT = new Intl.DateTimeFormat('ja-JP', { dateStyle: 'long' });

/** ISO 形式の日時 → 「2026年11月12日」 */
export function formatDate(iso: string): string {
  return DATE_FORMAT.format(new Date(iso));
}

export function nowIso(): string {
  return new Date().toISOString();
}
