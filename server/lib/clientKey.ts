import { getConnInfo } from '@hono/node-server/conninfo';
import type { Context } from 'hono';

/** 回数制限で相手を見分けるための値 */
export function clientKey(c: Context): string {
  // プロキシ（ホスティングの入口）を通ると接続元がプロキシになるので、転送元の記録を優先する
  const forwarded = c.req.header('x-forwarded-for')?.split(',')[0]?.trim();
  return forwarded || getConnInfo(c).remote.address || 'unknown';
}
