/**
 * FEAT-003 家场景（卧室·衣柜·宠物角）
 */
import * as TownLifeController from '../TownLifeController.js';
import { attachClickFeedback } from '../../animations/index.js';

/**
 * @param {HTMLElement} container
 * @param {{ onOpenOutfit?: () => void, onOpenRoomPet?: () => void, onOpenDressDesign?: () => void }} options
 */
export function render(container, options = {}) {
  container.innerHTML = `
    <div class="scene-content scene-home">
      <h2 class="scene-title">🏠 家</h2>
      <p class="page-subtitle">卧室·衣柜·宠物角</p>
      <div class="scene-actions">
        <button type="button" class="btn btn-primary" data-activity="rest">休息一下</button>
        <button type="button" class="btn btn-secondary" data-dress>去衣柜换装</button>
        <button type="button" class="btn btn-ghost" data-room-pet>宠物角</button>
        <button type="button" class="btn btn-ghost" data-dress-design>裙子设计</button>
      </div>
    </div>
  `;
  const restBtn = container.querySelector('[data-activity="rest"]');
  if (restBtn) restBtn.addEventListener('click', async () => {
    const ev = await TownLifeController.reportActivity('home', 'rest');
    if (ev) container.dispatchEvent(new CustomEvent('daily-event', { detail: ev }));
  });
  const dressBtn = container.querySelector('[data-dress]');
  if (dressBtn) dressBtn.addEventListener('click', (e) => { e.preventDefault(); options.onOpenOutfit?.(); });
  const roomPetBtn = container.querySelector('[data-room-pet]');
  if (roomPetBtn) roomPetBtn.addEventListener('click', (e) => { e.preventDefault(); options.onOpenRoomPet?.(); });
  const dressDesignBtn = container.querySelector('[data-dress-design]');
  if (dressDesignBtn) dressDesignBtn.addEventListener('click', (e) => { e.preventDefault(); options.onOpenDressDesign?.(); });
  container.querySelectorAll('.btn').forEach(attachClickFeedback);
}
