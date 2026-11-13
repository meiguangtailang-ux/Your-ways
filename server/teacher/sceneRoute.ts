/**
 * POST /api/scenes — 動画の各ページの挿絵の場面を、AI（Claude）に考えてもらう。
 * 考えられなかったときも 200 で { } を返す（画面は言葉からの推測で描く）。
 */
import { Hono } from 'hono';
import { z } from 'zod';
import {
  planScenes,
  SCENE_LIMITS,
  type SceneRequest,
  type SceneResponse,
} from '../../shared/scene/planScenes';
import type { TeacherErrorBody } from '../../shared/teacher/contract';
import { config } from '../config';
import { clientKey } from '../lib/clientKey';
import { aiLimiter, anthropic } from './anthropic';

const requestSchema = z.object({
  reference: z.string().min(1).max(80),
  pages: z
    .array(z.string().min(1).max(SCENE_LIMITS.maxPageLength))
    .min(1)
    .max(SCENE_LIMITS.maxPages),
  people: z
    .array(z.object({ id: z.string().regex(/^[a-z0-9-]{1,24}$/), name: z.string().min(1).max(24) }))
    .max(SCENE_LIMITS.maxPeople),
}) satisfies z.ZodType<SceneRequest>;

export const sceneRoute = new Hono().post('/', async (c) => {
  if (!aiLimiter.take(clientKey(c))) {
    return c.json({ code: 'rate_limited' } satisfies TeacherErrorBody, 429);
  }
  const parsed = requestSchema.safeParse(await c.req.json().catch(() => undefined));
  if (!parsed.success) return c.json({ code: 'invalid_request' } satisfies TeacherErrorBody, 400);

  try {
    const scenes = await planScenes(
      anthropic(),
      config.teacherModel,
      parsed.data,
      c.req.raw.signal,
    );
    return c.json((scenes ? { scenes } : {}) satisfies SceneResponse);
  } catch (error) {
    console.error('[scenes]', error);
    return c.json({} satisfies SceneResponse);
  }
});
