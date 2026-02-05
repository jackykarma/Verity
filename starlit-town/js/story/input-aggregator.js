/**
 * FEAT-006 当日数据聚合（plan ST-001 / B4.2）
 * 调用 FEAT-003 getDailySummarySnapshot、FEAT-005 getRelationSummary，组装 DailySummary
 */

import { getDailySummarySnapshot } from '../town-life/TownLifeController.js';
import { getRelationSummary } from '../relations/RelationController.js';

/**
 * @typedef {{ date: number, events: Array<{ eventType: string, triggerCondition?: string, occurredAt: number }>, moodId: string, relationSummary: { memoriesByNpc: Object, summaryByNpc: Object } }} DailySummary
 */

/**
 * @returns {Promise<DailySummary>}
 */
export async function getDailySummary() {
  let snapshot = { date: 0, events: [], moodId: 'happy' };
  let relationSummary = { memoriesByNpc: {}, summaryByNpc: {} };
  try {
    snapshot = await getDailySummarySnapshot();
  } catch (_) {}
  try {
    relationSummary = await getRelationSummary();
  } catch (_) {}
  return {
    date: snapshot.date ?? 0,
    events: Array.isArray(snapshot.events) ? snapshot.events : [],
    moodId: snapshot.moodId || 'happy',
    relationSummary
  };
}
