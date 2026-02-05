/**
 * 入口页视图（plan A3.2.1 / ST-003）
 * loadOrNew() 后根据是否有进度显示「开始游戏」/「继续游戏」；点击后 enterMap() 并切换到 MapView
 */
import * as GameStateManager from '../game/GameStateManager.js';
import { renderMapView } from '../map/MapView.js';
import { attachClickFeedback, transitionEnter } from '../animations/index.js';

/**
 * @param {HTMLElement} container
 * @param {{ hasProgress: boolean }} [options]
 */
export function render(container, options = {}) {
  const hasProgress = options.hasProgress ?? false;
  container.innerHTML = `
    <div class="entry-page">
      <div class="entry-card">
        <div class="entry-logo" aria-hidden="true">✨</div>
        <h1 class="entry-title">星光小镇</h1>
        <p class="entry-tagline">我的故事，每天在发生</p>
        <div class="entry-actions">
          <button type="button" class="btn btn-primary" data-action="start">开始今天的故事</button>
          ${hasProgress ? '<button type="button" class="btn btn-secondary" data-action="continue">继续上次的进度</button>' : ''}
        </div>
        <p class="entry-footer">治愈系生活模拟 · 无失败、无对错</p>
      </div>
    </div>
  `;
  const startBtn = container.querySelector('[data-action="start"]');
  if (startBtn) startBtn.addEventListener('click', (e) => { e.preventDefault(); onStartClick(); });
  if (hasProgress) {
    const continueBtn = container.querySelector('[data-action="continue"]');
    if (continueBtn) continueBtn.addEventListener('click', (e) => { e.preventDefault(); onContinueClick(); });
  }
  container.querySelectorAll('.btn').forEach(attachClickFeedback);
}

function onStartClick() {
  GameStateManager.enterMap();
  showMap();
}

function onContinueClick() {
  GameStateManager.enterMap();
  showMap();
}

function showMap() {
  const app = document.getElementById('app');
  if (app) {
    renderMapView(app);
    const mapEl = app.querySelector('.map-page');
    if (mapEl) transitionEnter(mapEl);
  }
}
