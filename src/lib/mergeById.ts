/**
 * id を持つ記録の一覧に、別の一覧を足す。同じ id のものは、いまある方を残す。
 * 戻り値の added は、新しく足された件数。
 */
export function mergeById<T extends { id: string }>(
  current: readonly T[],
  incoming: readonly T[],
): { merged: T[]; added: number } {
  const known = new Set(current.map((item) => item.id));
  const fresh = incoming.filter((item) => !known.has(item.id) && known.add(item.id));
  return { merged: [...current, ...fresh], added: fresh.length };
}

/** 新しいものが先に来るように並べる */
export function newestFirst<T extends { createdAt: string }>(items: readonly T[]): T[] {
  return [...items].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}
