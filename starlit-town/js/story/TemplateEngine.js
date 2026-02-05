/**
 * FEAT-006 模板引擎（plan ST-002）：按 DailySummary 选择并填充模板
 */
import { TEMPLATES, DEFAULT_TEMPLATE } from './templates/index.js';

const MOOD_LABELS = { happy: '很开心', calm: '很平静', excited: '很期待', peaceful: '很安心', curious: '很好奇' };

/**
 * @param {import('./input-aggregator.js').DailySummary} summary
 * @returns {string} 50–150 字日记式文本
 */
export function selectAndFill(summary) {
  const hasEvents = summary.events && summary.events.length > 0;
  const hasRelations =
    summary.relationSummary &&
    summary.relationSummary.summaryByNpc &&
    Object.keys(summary.relationSummary.summaryByNpc).length > 0;

  let condition = 'none';
  if (hasEvents && hasRelations) condition = 'both';
  else if (hasEvents) condition = 'events';
  else if (hasRelations) condition = 'relations';

  const t = TEMPLATES.find((x) => x.condition === condition) || { text: DEFAULT_TEMPLATE };
  const mood = MOOD_LABELS[summary.moodId] || '很好';
  const eventsSummary = hasEvents
    ? `发生了${summary.events.length}件小事情`
    : '平静地度过';
  const relationSummary = hasRelations
    ? '和朋友们说了说话'
    : '自己待了一会儿';

  let out = t.text
    .replace(/\{\{mood\}\}/g, mood)
    .replace(/\{\{eventsSummary\}\}/g, eventsSummary)
    .replace(/\{\{relationSummary\}\}/g, relationSummary);

  if (out.length > 150) out = out.slice(0, 147) + '…';
  return out;
}
