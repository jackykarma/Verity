/**
 * FEAT-003 学校场景（上课·小游戏）
 */
import * as TownLifeController from '../TownLifeController.js';
import { attachClickFeedback } from '../../animations/index.js';

/**
 * @param {HTMLElement} container
 * @param {{ onTalkNpc?: (npcId: string) => void }} options
 */
export function render(container, options = {}) {
  container.innerHTML = `
    <div class="scene-content scene-school">
      <h2 class="scene-title">🏫 学校</h2>
      <p class="page-subtitle">上课·小游戏</p>
      <div class="scene-actions">
        <button type="button" class="btn btn-primary" data-activity="class">上课</button>
        <button type="button" class="btn btn-secondary" data-activity="minigame">小游戏</button>
        <button type="button" class="btn btn-ghost" data-npc="teacher">和老师说话</button>
      </div>
    </div>
  `;
  container.querySelectorAll('[data-activity]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const type = btn.getAttribute('data-activity');
      const ev = await TownLifeController.reportActivity('school', type);
      if (ev) container.dispatchEvent(new CustomEvent('daily-event', { detail: ev }));
    });
  });
  container.querySelector('[data-npc]')?.addEventListener('click', () => options.onTalkNpc?.('teacher'));
  container.querySelectorAll('.btn').forEach(attachClickFeedback);
}
