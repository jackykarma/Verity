/**
 * 统一点击/触摸反馈组件（plan B4.1 / L2 ST-003）
 * attach(element)；点击时 getConfig，level !== 'off' 则 enqueue 播放反馈，单次 ≤300ms
 */
import { getConfig } from './FeedbackConfigService.js';
import { FEEDBACK_LEVELS } from './FeedbackConfigService.js';
import { enqueue } from './AnimationQueue.js';

const CLICK_FEEDBACK_CLASS = 'anim-click-active';
const CLICK_DURATION_MS = 280;

/**
 * @param {HTMLElement} element
 */
export function attach(element) {
  if (!element || typeof element.addEventListener !== 'function') return;
  element.addEventListener('click', onClick);
}

function onClick(e) {
  const config = getConfig();
  if (!config.enabled || config.level === FEEDBACK_LEVELS.off) return;
  const el = e.currentTarget;
  if (!el || !(el instanceof HTMLElement)) return;
  enqueue(() => playClickFeedback(el));
}

/**
 * @param {HTMLElement} element
 * @returns {Promise<void>}
 */
function playClickFeedback(element) {
  return new Promise((resolve) => {
    try {
      element.classList.add(CLICK_FEEDBACK_CLASS);
      setTimeout(() => {
        element.classList.remove(CLICK_FEEDBACK_CLASS);
        resolve();
      }, CLICK_DURATION_MS);
    } catch {
      resolve();
    }
  });
}
