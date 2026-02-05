/**
 * FEAT-002 动效与交互体验能力 - 对外接口（plan B4.1）
 */
export { attach as attachClickFeedback } from './ClickFeedbackComponent.js';
export { enter as transitionEnter, leave as transitionLeave } from './TransitionComponent.js';
export { getConfig, setConfig, FEEDBACK_LEVELS } from './FeedbackConfigService.js';
export { enqueue as animationEnqueue } from './AnimationQueue.js';
