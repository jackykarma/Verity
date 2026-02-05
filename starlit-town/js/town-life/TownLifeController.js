/**
 * FEAT-003 小镇生活业务层（plan A3.2.1）
 * completeMorning、reportActivity、getDailySummarySnapshot、navigateToStory
 */
import { createStorage } from '../storage/index.js';
import * as GameStateManager from '../game/GameStateManager.js';
import {
  TOWN_LIFE_MORNING_KEY,
  TOWN_LIFE_ACTIVITIES_KEY,
  createDefaultMorningData,
  createDefaultActivitiesData
} from './storage-keys.js';
import { checkEvents, getTriggeredToday, clearDailyEventsIfNewDay } from './EventEngine.js';

/** @type {(() => void) | null} */
let _navigateToStoryCallback = null;

/** @type {Promise<import('../storage/index.js').IndexedDBAdapter|import('../storage/index.js').LocalStorageFallback>} */
let _storagePromise = null;

async function getStorage() {
  if (!_storagePromise) _storagePromise = createStorage();
  return _storagePromise;
}

/**
 * 设置晚上「今天的故事」导航回调（FEAT-006 或占位）
 * @param {() => void} fn
 */
export function setNavigateToStory(fn) {
  _navigateToStoryCallback = fn;
}

/**
 * @param {string} moodId
 * @returns {Promise<void>}
 */
export async function completeMorning(moodId) {
  const state = GameStateManager.getState();
  const data = { moodId: moodId || createDefaultMorningData().moodId };
  try {
    const storage = await getStorage();
    await storage.set(TOWN_LIFE_MORNING_KEY, data);
  } catch (e) {
    if (typeof document !== 'undefined') {
      const t = document.getElementById('toast');
      if (t) { t.textContent = '进度未保存'; t.style.display = 'block'; setTimeout(() => { t.style.display = 'none'; }, 2000); }
    }
  }
  await GameStateManager.advancePhase();
}

/**
 * @param {string} sceneId
 * @param {string} activityType
 * @returns {Promise<import('./storage-keys.js').DailyEvent|null>}
 */
export async function reportActivity(sceneId, activityType) {
  const state = GameStateManager.getState();
  await clearDailyEventsIfNewDay(state);
  const activity = { sceneId, activityType, state: 'done' };
  const ev = await checkEvents(activity, state.dayPhase, state);
  if (ev) {
    try {
      const storage = await getStorage();
      const raw = await storage.get(TOWN_LIFE_ACTIVITIES_KEY);
      const activities = raw && typeof raw === 'object' ? raw : createDefaultActivitiesData();
      activities[sceneId] = { activityType, state: 'done' };
      await storage.set(TOWN_LIFE_ACTIVITIES_KEY, activities);
    } catch {}
  }
  return ev;
}

/**
 * @returns {Promise<import('./storage-keys.js').DailyEvent[]>}
 */
export async function getDailyEvents() {
  const state = GameStateManager.getState();
  return getTriggeredToday(state);
}

/**
 * @returns {Promise<import('./storage-keys.js').DailySummarySnapshot>}
 */
export async function getDailySummarySnapshot() {
  const state = GameStateManager.getState();
  let morningData = createDefaultMorningData();
  let events = [];
  try {
    const storage = await getStorage();
    const rawMorning = await storage.get(TOWN_LIFE_MORNING_KEY);
    if (rawMorning && typeof rawMorning.moodId === 'string') morningData = rawMorning;
    const rawEvents = await storage.get(TOWN_LIFE_DAILY_EVENTS_KEY);
    events = Array.isArray(rawEvents) ? rawEvents : [];
  } catch {}
  return {
    date: state.currentDay,
    events,
    moodId: morningData.moodId
  };
}

/**
 * 导航至「今天的故事」（FEAT-006 或占位）
 */
export function navigateToStory() {
  if (_navigateToStoryCallback) _navigateToStoryCallback();
}
