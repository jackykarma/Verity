/**
 * 每日循环阶段规则（plan A3.2.1 / L2 ST-002）
 * morning → daytime → evening，不可回退
 */
import { DAY_PHASES } from './GameState.js';

/**
 * @param {string} phase
 * @returns {boolean}
 */
export function canAdvance(phase) {
  const idx = DAY_PHASES.indexOf(phase);
  return idx >= 0 && idx < DAY_PHASES.length - 1;
}

/**
 * @param {string} phase
 * @returns {string}
 */
export function nextPhase(phase) {
  const idx = DAY_PHASES.indexOf(phase);
  if (idx < 0 || idx >= DAY_PHASES.length - 1) return phase;
  return DAY_PHASES[idx + 1];
}
