/**
 * 動画の挿絵の場面を、AI に考えてもらう（読者のキー、または API サーバーで）。
 * どちらも無いときや失敗したときは undefined（言葉からの推測で描く）。
 */
import { SCENES_API_PATH, type SceneRequest, type SceneResponse } from '@shared/scene/planScenes';
import {
  FIGURE_IDS,
  isPropId,
  isSettingId,
  MAX_CAST,
  MAX_PROPS,
  type Scene,
} from '@shared/scene/vocabulary';
import { API_BASE_URL, TEACHER_SERVER_AVAILABLE } from '@/config/app';
import { PEOPLE } from '@/features/people/people';
import { getTeacherKey, useTeacherKey } from '@/features/teacher/teacherKey';

const KNOWN_CAST = new Set<string>([...PEOPLE.map((person) => person.id), ...FIGURE_IDS]);

/** AI に場面を考えてもらえるか（キーかサーバーがあるか） */
export function useSceneAiAvailable(): boolean {
  return useTeacherKey() !== undefined || TEACHER_SERVER_AVAILABLE;
}

/** 返ってきた場面を、描ける形に整える（知らない値は取り除く） */
function sanitize(scenes: unknown, pageCount: number): Scene[] | undefined {
  if (!Array.isArray(scenes) || scenes.length !== pageCount) return undefined;
  return scenes.map((scene: Partial<Scene>) => ({
    setting: isSettingId(scene.setting) ? scene.setting : 'plain',
    props: (Array.isArray(scene.props) ? scene.props : []).filter(isPropId).slice(0, MAX_PROPS),
    cast: (Array.isArray(scene.cast) ? scene.cast : [])
      .filter((id): id is string => typeof id === 'string' && KNOWN_CAST.has(id))
      .slice(0, MAX_CAST),
  }));
}

export async function planScenesWithAi(
  request: SceneRequest,
  signal: AbortSignal,
): Promise<Scene[] | undefined> {
  try {
    const apiKey = getTeacherKey();
    if (apiKey) {
      const { planScenesWithOwnKey } = await import('@/features/teacher/ownKeyTeacher');
      return sanitize(await planScenesWithOwnKey(apiKey, request, signal), request.pages.length);
    }
    if (TEACHER_SERVER_AVAILABLE) {
      const response = await fetch(API_BASE_URL + SCENES_API_PATH, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
        signal,
      });
      if (!response.ok) return undefined;
      const body = (await response.json()) as SceneResponse;
      return sanitize(body.scenes, request.pages.length);
    }
  } catch (error) {
    if (signal.aborted) throw error;
  }
  return undefined;
}
