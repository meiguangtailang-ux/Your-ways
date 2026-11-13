import Anthropic from '@anthropic-ai/sdk';
import { config } from '../config';
import { createRateLimiter } from '../lib/rateLimit';

let client: Anthropic | undefined;

/** 環境変数 ANTHROPIC_API_KEY を読む Claude のクライアント。最初に使うときに1度だけ作る */
export function anthropic(): Anthropic {
  client ??= new Anthropic();
  return client;
}

/** パウロ先生と場面づくりで共有する回数制限（どちらも同じ API キーの料金になるため） */
export const aiLimiter = createRateLimiter(config.rateLimit);
