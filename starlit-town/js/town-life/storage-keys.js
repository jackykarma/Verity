/**
 * FEAT-003 存储键与数据结构（plan B3.2）
 */
export const TOWN_LIFE_MORNING_KEY = 'starlit.townLife.morning';
export const TOWN_LIFE_ACTIVITIES_KEY = 'starlit.townLife.activities';
export const TOWN_LIFE_DAILY_EVENTS_KEY = 'starlit.townLife.dailyEvents';

/** @typedef {{ moodId: string }} MorningData */
/** @typedef {{ [sceneId: string]: { activityType: string, state: string } }} ActivitiesData */
/** @typedef {{ eventType: string, triggerCondition: string, occurredAt: number }} DailyEvent */
/** @typedef {{ date: number, events: DailyEvent[], moodId: string }} DailySummarySnapshot */

export const MOOD_IDS = ['happy', 'calm', 'excited', 'peaceful', 'curious'];
export const MOOD_LABELS = {
  happy: '开心',
  calm: '平静',
  excited: '期待',
  peaceful: '安心',
  curious: '好奇'
};

export const ACTIVITY_TYPES = {
  home: ['rest', 'dress', 'pet'],
  school: ['class', 'minigame'],
  park: ['friend', 'feed'],
  shop: ['browse'],
  forest: ['explore']
};

export function createDefaultMorningData() {
  return { moodId: MOOD_IDS[0] };
}

export function createDefaultActivitiesData() {
  return {};
}

export function createDefaultDailyEvents() {
  return [];
}
