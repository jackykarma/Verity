/**
 * FEAT-004 换装与风格标签 UI（plan ST-003）
 */
import * as CostumeController from './CostumeController.js';
import { STYLE_TAGS, STYLE_LABELS } from './storage-keys.js';
import { attachClickFeedback } from '../animations/index.js';

const SLOTS = [
  { key: 'hairId', label: '发型', options: [{ id: 'default', label: '默认' }, { id: 'long', label: '长发' }, { id: 'short', label: '短发' }, { id: 'twin', label: '双马尾' }] },
  { key: 'dressId', label: '裙子', options: [{ id: 'default', label: '默认' }, { id: 'pink', label: '粉色' }, { id: 'blue', label: '蓝色' }, { id: 'custom', label: '我的设计' }] },
  { key: 'shoesId', label: '鞋子', options: [{ id: 'default', label: '默认' }, { id: 'sneakers', label: '运动鞋' }, { id: 'mary', label: '玛丽珍' }] },
  { key: 'bagId', label: '背包', options: [{ id: 'default', label: '默认' }, { id: 'star', label: '星星包' }, { id: 'basket', label: '小篮子' }] }
];

/**
 * @param {HTMLElement} container
 * @param {{ onBack?: () => void, title?: string }} options
 */
export async function render(container, options = {}) {
  if (!container) return;
  let outfit;
  try {
    outfit = await CostumeController.getOutfit();
  } catch (_) {
    outfit = { hairId: 'default', dressId: 'default', shoesId: 'default', bagId: 'default', styleTag: 'sweet' };
  }
  const title = options.title || '换装';

  container.innerHTML = `
    <div class="costume-page outfit-view">
      <div class="costume-header">
        <h2 class="costume-title">${title}</h2>
        ${options.onBack ? '<button type="button" class="btn btn-ghost costume-back" data-back>完成</button>' : ''}
      </div>
      <div class="outfit-preview-area" aria-hidden="true">
        <span class="outfit-avatar" data-avatar>👗</span>
      </div>
      <div class="costume-slots" data-slots></div>
      <div class="costume-style-section">
        <h3>风格标签</h3>
        <div class="style-tags" data-style-tags></div>
      </div>
    </div>
  `;

  const slotsEl = container.querySelector('[data-slots]');
  SLOTS.forEach(({ key, label, options: opts }) => {
    const current = outfit[key] || 'default';
    const div = document.createElement('div');
    div.className = 'costume-slot';
    div.innerHTML = `
      <span class="slot-label">${label}</span>
      <div class="slot-options" data-slot="${key}"></div>
    `;
    const optionsEl = div.querySelector('.slot-options');
    opts.forEach((opt) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'slot-option-btn' + (opt.id === current ? ' active' : '');
      btn.textContent = opt.label;
      btn.dataset.slot = key;
      btn.dataset.value = opt.id;
      btn.addEventListener('click', async () => {
        await CostumeController.setOutfit(key, opt.id);
        div.querySelectorAll('.slot-option-btn').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
      });
      optionsEl.appendChild(btn);
    });
    slotsEl.appendChild(div);
  });

  const styleTagsEl = container.querySelector('[data-style-tags]');
  STYLE_TAGS.forEach((tagId) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'style-tag-btn' + (outfit.styleTag === tagId ? ' active' : '');
    btn.textContent = STYLE_LABELS[tagId] || tagId;
    btn.dataset.style = tagId;
    btn.addEventListener('click', async () => {
      await CostumeController.setOutfit('styleTag', tagId);
      styleTagsEl.querySelectorAll('.style-tag-btn').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
    });
    styleTagsEl.appendChild(btn);
  });

  container.querySelector('[data-back]')?.addEventListener('click', () => options.onBack?.());
  container.querySelectorAll('.btn, .slot-option-btn, .style-tag-btn').forEach(attachClickFeedback);
}
