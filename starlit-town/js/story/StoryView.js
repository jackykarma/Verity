/**
 * FEAT-006 今天的故事视图（plan ST-004）
 */
import * as StoryController from './StoryController.js';
import { attachClickFeedback } from '../animations/index.js';

/**
 * @param {HTMLElement} container
 * @param {{ onBack?: () => void }} options
 */
export async function render(container, options = {}) {
  container.innerHTML = `
    <div class="story-page">
      <div class="story-header">
        <h2 class="story-title">今天的故事</h2>
        ${options.onBack ? '<button type="button" class="btn btn-ghost" data-back>返回</button>' : ''}
      </div>
      <div class="story-loading" data-loading>正在写下今天的故事…</div>
      <div class="story-content" data-content style="display:none;"></div>
    </div>
  `;

  const loadingEl = container.querySelector('[data-loading]');
  const contentEl = container.querySelector('[data-content]');

  try {
    const output = await StoryController.getStory();
    loadingEl.style.display = 'none';
    contentEl.style.display = 'block';
    contentEl.innerHTML = `<div class="story-body">${escapeHtml(output.content)}</div><p class="story-meta">${output.source === 'template' ? '✨ 来自今日回忆' : '✨ 今日故事'}</p>`;
  } catch (_) {
    loadingEl.textContent = '今天的故事暂时写不出来，明天再来看吧～';
    loadingEl.style.display = 'block';
    contentEl.style.display = 'none';
  }

  container.querySelector('[data-back]')?.addEventListener('click', () => options.onBack?.());
  container.querySelectorAll('.btn').forEach(attachClickFeedback);
}

function escapeHtml(s) {
  const div = document.createElement('div');
  div.textContent = s;
  return div.innerHTML;
}
