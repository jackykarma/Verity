/**
 * FEAT-003 商店场景（服装·文具·装饰）
 */
import * as TownLifeController from '../TownLifeController.js';
import { attachClickFeedback } from '../../animations/index.js';

/**
 * @param {HTMLElement} container
 * @param {{ onOpenOutfit?: () => void }} options
 */
export function render(container, options = {}) {
  container.innerHTML = `
    <div class="scene-content scene-shop">
      <h2 class="scene-title">🛍️ 商店</h2>
      <p class="page-subtitle">服装·文具·装饰</p>
      <div class="scene-actions">
        <button type="button" class="btn btn-primary" data-activity="browse">逛逛商店</button>
        <button type="button" class="btn btn-secondary" data-dress>去换装</button>
      </div>
    </div>
  `;
  container.querySelector('[data-activity="browse"]').addEventListener('click', async () => {
    const ev = await TownLifeController.reportActivity('shop', 'browse');
    if (ev) container.dispatchEvent(new CustomEvent('daily-event', { detail: ev }));
  });
  container.querySelector('[data-dress]').addEventListener('click', () => options.onOpenOutfit?.());
  container.querySelectorAll('.btn').forEach(attachClickFeedback);
}
