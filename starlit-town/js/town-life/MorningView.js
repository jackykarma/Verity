/**
 * FEAT-003 早上选衣与小心情（plan ST-003）
 * 选衣占位 + 小心情 3–5 种，completeMorning 后推进至白天并进入地图
 */
import * as TownLifeController from './TownLifeController.js';
import { MOOD_IDS, MOOD_LABELS } from './storage-keys.js';
import { attachClickFeedback } from '../animations/index.js';

const MOOD_EMOJI = { happy: '😊', calm: '🌿', excited: '✨', peaceful: '🌙', curious: '🔮' };

/**
 * @param {HTMLElement} container
 * @param {{ onComplete: () => void }} options
 */
export function render(container, options = {}) {
  let selectedMoodId = MOOD_IDS[0];
  container.innerHTML = `
    <div class="morning-page">
      <div class="morning-header">
        <h1 class="morning-title">☀️ 早上好</h1>
        <p class="page-subtitle">选好心情，开始新的一天</p>
      </div>
      <div class="morning-card">
        <h3>今天的小心情</h3>
        <div class="mood-row" data-mood-row></div>
      </div>
      <div class="morning-card">
        <h3>今天的打扮</h3>
        <div class="outfit-preview" aria-hidden="true">👗</div>
        <button type="button" class="btn btn-secondary" style="width:100%" data-outfit-placeholder>去衣柜换装</button>
      </div>
      <div class="morning-actions">
        <button type="button" class="btn btn-primary" data-go>出发去小镇</button>
      </div>
    </div>
  `;

  const moodRow = container.querySelector('[data-mood-row]');
  MOOD_IDS.forEach((id) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'mood-btn' + (id === selectedMoodId ? ' active' : '');
    btn.title = MOOD_LABELS[id] || id;
    btn.textContent = MOOD_EMOJI[id] || '✨';
    btn.dataset.mood = id;
    btn.addEventListener('click', () => {
      container.querySelectorAll('.mood-btn').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      selectedMoodId = id;
    });
    moodRow.appendChild(btn);
  });

  const outfitBtn = container.querySelector('[data-outfit-placeholder]');
  if (outfitBtn) {
    outfitBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const fn = options.onOpenOutfit;
      if (typeof fn === 'function') fn();
    });
  }

  const goBtn = container.querySelector('[data-go]');
  if (goBtn) {
    goBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      goBtn.disabled = true;
      try {
        await TownLifeController.completeMorning(selectedMoodId);
        if (options.onComplete) options.onComplete();
      } finally {
        goBtn.disabled = false;
      }
    });
  }

  container.querySelectorAll('.btn, .mood-btn').forEach(attachClickFeedback);
}
