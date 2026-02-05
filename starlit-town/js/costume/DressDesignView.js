/**
 * FEAT-004 贴纸式裙子设计 UI（plan ST-004），单件 ≤10 张贴纸
 */
import * as CostumeController from './CostumeController.js';
import { MAX_STICKERS_PER_DESIGN } from './storage-keys.js';
import { attachClickFeedback } from '../animations/index.js';

const STICKER_PRESETS = [
  { id: 'star', label: '⭐' },
  { id: 'heart', label: '❤️' },
  { id: 'flower', label: '🌸' },
  { id: 'bow', label: '🎀' },
  { id: 'sparkle', label: '✨' }
];

/**
 * @param {HTMLElement} container
 * @param {{ onBack?: () => void, title?: string }} options
 */
export async function render(container, options = {}) {
  const design = await CostumeController.getDressDesign();
  const title = options.title || '裙子设计';

  container.innerHTML = `
    <div class="costume-page dress-design-view">
      <div class="costume-header">
        <h2 class="costume-title">${title}</h2>
        ${options.onBack ? '<button type="button" class="btn btn-ghost costume-back" data-back>返回</button>' : ''}
      </div>
      <p class="dress-design-hint">选择贴纸装饰裙子，最多 ${MAX_STICKERS_PER_DESIGN} 张</p>
      <div class="dress-design-canvas" data-canvas aria-hidden="true">
        <span class="dress-placeholder">👗</span>
        <div class="stickers-on-dress" data-stickers-on-dress></div>
      </div>
      <div class="sticker-presets" data-presets></div>
      <div class="stickers-list" data-stickers-list></div>
      <div class="dress-design-actions">
        <button type="button" class="btn btn-primary" data-apply>应用到装扮</button>
      </div>
    </div>
  `;

  const stickersOnDress = container.querySelector('[data-stickers-on-dress]');
  const stickersListEl = container.querySelector('[data-stickers-list]');

  function renderStickersList(stickers) {
    stickersListEl.innerHTML = '';
    stickers.forEach((st, i) => {
      const pres = STICKER_PRESETS.find((p) => p.id === st.id) || { label: st.id };
      const li = document.createElement('div');
      li.className = 'sticker-list-item';
      li.innerHTML = `<span>${pres.label}</span><button type="button" class="btn btn-ghost btn-sm" data-remove="${i}">移除</button>`;
      li.querySelector('[data-remove]').addEventListener('click', async () => {
        const next = stickers.filter((_, j) => j !== i);
        await CostumeController.updateDressDesign(next);
        currentStickers = next;
        renderStickersList(next);
        updateStickersOnDress(next);
      });
      stickersListEl.appendChild(li);
    });
  }

  function updateStickersOnDress(stickers) {
    stickersOnDress.innerHTML = '';
    stickers.forEach((st) => {
      const pres = STICKER_PRESETS.find((p) => p.id === st.id) || { label: st.id };
      const span = document.createElement('span');
      span.className = 'sticker-on-dress';
      span.textContent = pres.label;
      stickersOnDress.appendChild(span);
    });
  }

  let currentStickers = [...(design.stickers || [])];
  renderStickersList(currentStickers);
  updateStickersOnDress(currentStickers);

  const presetsEl = container.querySelector('[data-presets]');
  STICKER_PRESETS.forEach((pres) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'sticker-preset-btn';
    btn.textContent = pres.label;
    btn.title = pres.id;
    btn.addEventListener('click', async () => {
      if (currentStickers.length >= MAX_STICKERS_PER_DESIGN) return;
      currentStickers = [...currentStickers, { id: pres.id }];
      await CostumeController.updateDressDesign(currentStickers);
      renderStickersList(currentStickers);
      updateStickersOnDress(currentStickers);
    });
    presetsEl.appendChild(btn);
  });

  container.querySelector('[data-apply]').addEventListener('click', async () => {
    await CostumeController.applyDressDesignToOutfit();
    if (options.onBack) options.onBack();
  });

  container.querySelector('[data-back]')?.addEventListener('click', () => options.onBack?.());
  container.querySelectorAll('.btn, .sticker-preset-btn').forEach(attachClickFeedback);
}
