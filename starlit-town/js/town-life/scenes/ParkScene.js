/**
 * FEAT-003 公园场景（交朋友·喂动物）
 */
import * as TownLifeController from '../TownLifeController.js';
import { attachClickFeedback } from '../../animations/index.js';

/**
 * @param {HTMLElement} container
 * @param {{ onTalkNpc?: (npcId: string) => void }} options
 */
export function render(container, options = {}) {
  container.innerHTML = `
    <div class="scene-content scene-park">
      <h2 class="scene-title">🌳 公园</h2>
      <p class="page-subtitle">交朋友·喂动物</p>
      <div class="scene-actions">
        <button type="button" class="btn btn-primary" data-activity="friend">交朋友</button>
        <button type="button" class="btn btn-secondary" data-activity="feed">喂动物</button>
        <button type="button" class="btn btn-ghost" data-npc="bestfriend">和好朋友说话</button>
      </div>
    </div>
  `;
  container.querySelectorAll('[data-activity]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const type = btn.getAttribute('data-activity');
      const ev = await TownLifeController.reportActivity('park', type);
      if (ev) container.dispatchEvent(new CustomEvent('daily-event', { detail: ev }));
    });
  });
  container.querySelector('[data-npc]')?.addEventListener('click', () => options.onTalkNpc?.('bestfriend'));
  container.querySelectorAll('.btn').forEach(attachClickFeedback);
}
