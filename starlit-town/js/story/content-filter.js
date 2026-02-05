/**
 * FEAT-006 敏感词过滤与模板兜底（plan ST-002 / NFR-SEC-001）
 */

const SENSITIVE = ['敏感词', '违规'];

/**
 * @param {string} text
 * @param {string} fallback
 * @returns {string}
 */
export function filter(text, fallback = '今天在星光小镇度过了美好的一天～') {
  if (!text || typeof text !== 'string') return fallback;
  const lower = text.toLowerCase();
  for (const w of SENSITIVE) {
    if (lower.includes(w.toLowerCase())) return fallback;
  }
  return text;
}
