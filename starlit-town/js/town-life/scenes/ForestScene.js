/**
 * FEAT-003 神秘森林（轻探索）
 */
import * as TownLifeController from '../TownLifeController.js';
import { attachClickFeedback } from '../../animations/index.js';

/**
 * @param {HTMLElement} container
 * @param {{ onTalkNpc?: (npcId: string) => void }} options
 */
export function render(container, options = {}) {
  container.innerHTML = `
    <div class="scene-content scene-forest">
      <h2 class="scene-title">🌲 神秘森林</h2>
      <p class="page-subtitle">轻探索</p>
      <div class="scene-actions">
        <button type="button" class="btn btn-primary" data-activity="explore">探索</button>
        <button type="button" class="btn btn-ghost" data-npc="animal">和小动物玩</button>
      </div>
    </div>
  `;
  container.querySelector('[data-activity="explore"]').addEventListener('click', async () => {
    const ev = await TownLifeController.reportActivity('forest', 'explore');
    if (ev) container.dispatchEvent(new CustomEvent('daily-event', { detail: ev }));
  });
  container.querySelector('[data-npc]')?.addEventListener('click', () => options.onTalkNpc?.('animal'));
  container.querySelectorAll('.btn').forEach(attachClickFeedback);
}
