/**
 * FEAT-004 房间墙纸与宠物命名 UI（plan ST-004）
 */
import * as CostumeController from './CostumeController.js';
import { attachClickFeedback } from '../animations/index.js';

const WALLPAPERS = [
  { id: 'default', label: '默认' },
  { id: 'mint', label: '薄荷绿' },
  { id: 'lavender', label: '薰衣草' },
  { id: 'starry', label: '星空' },
  { id: 'flower', label: '小碎花' }
];

/**
 * @param {HTMLElement} container
 * @param {{ onBack?: () => void, title?: string }} options
 */
export async function render(container, options = {}) {
  const [roomStyle, pet] = await Promise.all([
    CostumeController.getRoomStyle(),
    CostumeController.getPet()
  ]);
  const title = options.title || '房间与宠物';

  container.innerHTML = `
    <div class="costume-page room-pet-view">
      <div class="costume-header">
        <h2 class="costume-title">${title}</h2>
        ${options.onBack ? '<button type="button" class="btn btn-ghost costume-back" data-back>返回</button>' : ''}
      </div>
      <section class="room-pet-section">
        <h3>房间墙纸</h3>
        <div class="wallpaper-options" data-wallpapers></div>
      </section>
      <section class="room-pet-section">
        <h3>宠物名字</h3>
        <p class="pet-hint">给宠物起个名字吧（最多 10 个字）</p>
        <div class="pet-name-row">
          <input type="text" class="pet-name-input" data-pet-name maxlength="10" placeholder="${pet.name || '小星'}" value="${escapeHtml(pet.name || '')}" />
          <button type="button" class="btn btn-primary" data-save-pet>保存</button>
        </div>
        <p class="pet-validation-msg" data-pet-msg role="alert" aria-live="polite"></p>
      </section>
    </div>
  `;

  const wallpapersEl = container.querySelector('[data-wallpapers]');
  WALLPAPERS.forEach((w) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'wallpaper-btn' + (roomStyle.wallpaperId === w.id ? ' active' : '');
    btn.textContent = w.label;
    btn.dataset.wallpaper = w.id;
    btn.addEventListener('click', async () => {
      await CostumeController.setRoomStyle(w.id);
      wallpapersEl.querySelectorAll('.wallpaper-btn').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
    });
    wallpapersEl.appendChild(btn);
  });

  const input = container.querySelector('[data-pet-name]');
  const msgEl = container.querySelector('[data-pet-msg]');

  container.querySelector('[data-save-pet]').addEventListener('click', async () => {
    const name = (input.value || '').trim();
    const result = await CostumeController.setPetName(name);
    if (!result.valid) {
      msgEl.textContent = result.message;
      msgEl.classList.add('error');
      return;
    }
    await CostumeController.savePet();
    msgEl.textContent = '保存成功';
    msgEl.classList.remove('error');
  });

  container.querySelector('[data-back]')?.addEventListener('click', () => options.onBack?.());
  container.querySelectorAll('.btn, .wallpaper-btn').forEach(attachClickFeedback);
}

function escapeHtml(s) {
  const div = document.createElement('div');
  div.textContent = s;
  return div.innerHTML;
}
