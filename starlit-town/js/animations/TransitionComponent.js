/**
 * 场景/面板切换过渡组件（plan B4.1 / L2 ST-003）
 * enter(element, spec?)、leave(element, spec?)；缺省 ≤500ms；经 AnimationQueue 执行
 */
import { getConfig } from './FeedbackConfigService.js';
import { FEEDBACK_LEVELS } from './FeedbackConfigService.js';
import { enqueue } from './AnimationQueue.js';

/** @typedef {{ durationMs?: number, easing?: string }} AnimationSpec */

const DEFAULT_DURATION_MS = 400;
const ENTER_CLASS = 'anim-enter';
const LEAVE_CLASS = 'anim-leave';

/**
 * @param {HTMLElement} element
 * @param {AnimationSpec} [spec]
 * @returns {Promise<void>}
 */
export function enter(element, spec) {
  const config = getConfig();
  if (!config.enabled || config.level === FEEDBACK_LEVELS.off) {
    return Promise.resolve();
  }
  return new Promise((resolve) => {
    enqueue(() => runEnter(element, spec || {}).then(resolve).catch(() => resolve()));
  });
}

/**
 * @param {HTMLElement} element
 * @param {AnimationSpec} [spec]
 * @returns {Promise<void>}
 */
export function leave(element, spec) {
  const config = getConfig();
  if (!config.enabled || config.level === FEEDBACK_LEVELS.off) {
    return Promise.resolve();
  }
  return new Promise((resolve) => {
    enqueue(() => runLeave(element, spec || {}).then(resolve).catch(() => resolve()));
  });
}

/**
 * @param {HTMLElement} element
 * @param {AnimationSpec} spec
 * @returns {Promise<void>}
 */
function runEnter(element, spec) {
  return new Promise((resolve) => {
    try {
      const duration = Math.min(spec.durationMs ?? DEFAULT_DURATION_MS, 500);
      element.classList.remove(LEAVE_CLASS);
      element.classList.add(ENTER_CLASS);
      element.style.transitionDuration = `${duration}ms`;
      setTimeout(() => {
        element.classList.remove(ENTER_CLASS);
        element.style.transitionDuration = '';
        resolve();
      }, duration);
    } catch {
      resolve();
    }
  });
}

/**
 * @param {HTMLElement} element
 * @param {AnimationSpec} spec
 * @returns {Promise<void>}
 */
function runLeave(element, spec) {
  return new Promise((resolve) => {
    try {
      const duration = Math.min(spec.durationMs ?? DEFAULT_DURATION_MS, 500);
      element.classList.remove(ENTER_CLASS);
      element.classList.add(LEAVE_CLASS);
      element.style.transitionDuration = `${duration}ms`;
      setTimeout(() => {
        element.classList.remove(LEAVE_CLASS);
        element.style.transitionDuration = '';
        resolve();
      }, duration);
    } catch {
      resolve();
    }
  });
}
