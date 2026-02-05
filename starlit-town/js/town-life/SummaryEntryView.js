/**
 * FEAT-003 晚上「今天的故事」总结入口（plan ST-004）
 * 仅晚上显示；点击 getDailySummarySnapshot → navigateToStory
 */
import * as TownLifeController from './TownLifeController.js';
import { attachClickFeedback } from '../animations/index.js';

/**
 * @param {HTMLElement} container
 */
export function render(container) {
  container.innerHTML = `
    <div class="summary-entry">
      <button type="button" class="btn btn-primary" data-story>今天的故事</button>
    </div>
  `;
  const storyBtn = container.querySelector('[data-story]');
  if (storyBtn) {
    storyBtn.addEventListener('click', (e) => {
      e.preventDefault();
      TownLifeController.navigateToStory();
    });
  }
  container.querySelectorAll('.btn').forEach(attachClickFeedback);
}
