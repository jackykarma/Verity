/**
 * 反馈配置服务（plan B4.1 / L2 ST-002）
 * getConfig() 返回 FeedbackConfig（enabled, level: full|reduced|off）
 */
export const FEEDBACK_LEVELS = Object.freeze({
  full: 'full',
  reduced: 'reduced',
  off: 'off'
});

/** @typedef {{ enabled: boolean, level: 'full'|'reduced'|'off' }} FeedbackConfig */

/** @type {FeedbackConfig} */
let _config = {
  enabled: true,
  level: FEEDBACK_LEVELS.full
};

/**
 * 设置配置（供测试或未来注入）
 * @param {Partial<FeedbackConfig>} config
 */
export function setConfig(config) {
  if (config.enabled !== undefined) _config.enabled = config.enabled;
  if (config.level !== undefined && Object.values(FEEDBACK_LEVELS).includes(config.level)) {
    _config.level = config.level;
  }
}

/**
 * @returns {FeedbackConfig}
 */
export function getConfig() {
  return { ..._config };
}
