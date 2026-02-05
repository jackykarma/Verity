/**
 * 游戏状态数据模型（plan B3.2）
 * currentDay >= 1；currentSceneId 枚举；dayPhase 枚举
 */
export const SCENE_IDS = Object.freeze(['home', 'school', 'park', 'shop', 'forest']);
export const DAY_PHASES = Object.freeze(['morning', 'daytime', 'evening']);

/**
 * @param {Object} [raw]
 * @returns {{ currentDay: number, currentSceneId: string, dayPhase: string }}
 */
export function createDefaultGameState(raw) {
  const state = {
    currentDay: 1,
    currentSceneId: 'home',
    dayPhase: 'morning'
  };
  if (raw && typeof raw === 'object') {
    if (typeof raw.currentDay === 'number' && raw.currentDay >= 1) state.currentDay = raw.currentDay;
    if (SCENE_IDS.includes(raw.currentSceneId)) state.currentSceneId = raw.currentSceneId;
    if (DAY_PHASES.includes(raw.dayPhase)) state.dayPhase = raw.dayPhase;
  }
  return state;
}
