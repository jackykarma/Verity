/**
 * FEAT-003 小事件触发引擎（plan A3.3）
 * 每日 2–3 个小事件，基于场景活动+规则随机触发
 */
import { createStorage } from '../storage/index.js';
import { TOWN_LIFE_DAILY_EVENTS_KEY } from './storage-keys.js';

const MAX_DAILY_EVENTS = 3;
const TRIGGER_CHANCE = 0.4;

/** @type {import('../storage/index.js').createStorage extends () => Promise<infer T> ? T : never} */
let _storage = null;

async function getStorage() {
  if (!_storage) _storage = await createStorage();
  return _storage;
}

/** @type {import('./storage-keys.js').DailyEvent[]} */
let _todayEvents = [];
let _currentDay = -1;

/**
 * @param {{ currentDay: number }} gameState
 */
async function loadTodayEventsIfNeeded(gameState) {
  if (gameState.currentDay === _currentDay && _todayEvents.length >= 0) return;
  _currentDay = gameState.currentDay;
  try {
    const storage = await getStorage();
    const raw = await storage.get(TOWN_LIFE_DAILY_EVENTS_KEY);
    const list = Array.isArray(raw) ? raw : [];
    _todayEvents = list.filter((e) => e && typeof e.occurredAt === 'number');
  } catch {
    _todayEvents = [];
  }
}

/**
 * @param {{ sceneId: string, activityType: string, state?: string }} activity
 * @param {string} dayPhase
 * @param {{ currentDay: number }} gameState
 * @returns {Promise<import('./storage-keys.js').DailyEvent|null>}
 */
export async function checkEvents(activity, dayPhase, gameState) {
  await loadTodayEventsIfNeeded(gameState);
  if (_todayEvents.length >= MAX_DAILY_EVENTS) return null;
  if (dayPhase !== 'daytime') return null;
  if (Math.random() > TRIGGER_CHANCE) return null;
  const eventType = `activity_${activity.sceneId}_${activity.activityType}`;
  const ev = {
    eventType,
    triggerCondition: `${activity.sceneId}:${activity.activityType}`,
    occurredAt: Date.now()
  };
  _todayEvents.push(ev);
  try {
    const storage = await getStorage();
    await storage.set(TOWN_LIFE_DAILY_EVENTS_KEY, _todayEvents);
  } catch {
    _todayEvents.pop();
    return null;
  }
  return ev;
}

/**
 * @param {{ currentDay: number }} gameState
 * @returns {Promise<import('./storage-keys.js').DailyEvent[]>}
 */
export async function getTriggeredToday(gameState) {
  await loadTodayEventsIfNeeded(gameState);
  return [..._todayEvents];
}

/**
 * 重置当日事件（换日时由调用方或 GameStateManager 日推进时清理）
 * @param {{ currentDay: number }} gameState
 */
export async function clearDailyEventsIfNewDay(gameState) {
  if (gameState.currentDay !== _currentDay) {
    _currentDay = gameState.currentDay;
    _todayEvents = [];
    try {
      const storage = await getStorage();
      await storage.set(TOWN_LIFE_DAILY_EVENTS_KEY, []);
    } catch {}
  }
}
