/**
 * FEAT-003 小镇生活 - 对外接口
 */
export {
  completeMorning,
  reportActivity,
  getDailyEvents,
  getDailySummarySnapshot,
  navigateToStory,
  setNavigateToStory
} from './TownLifeController.js';
export { render as renderMorningView } from './MorningView.js';
export { render as renderSummaryEntryView } from './SummaryEntryView.js';
export { render as renderDailyEventView, showEventToast } from './DailyEventView.js';
export { renderHomeScene, renderSchoolScene, renderParkScene, renderShopScene, renderForestScene } from './scenes/index.js';
export { render as renderStoryPlaceholderView } from './StoryPlaceholderView.js';
export { MOOD_IDS, MOOD_LABELS } from './storage-keys.js';
