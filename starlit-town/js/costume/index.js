/**
 * FEAT-004 装扮与创造 - 对外接口（plan B4.1）
 */
export * from './CostumeController.js';
export { render as renderOutfitView } from './OutfitView.js';
export { render as renderRoomPetView } from './RoomPetView.js';
export { render as renderDressDesignView } from './DressDesignView.js';
export {
  OUTFIT_KEY,
  ROOM_STYLE_KEY,
  PET_KEY,
  DRESS_DESIGN_KEY,
  STYLE_TAGS,
  STYLE_LABELS,
  DEFAULT_OUTFIT,
  DEFAULT_ROOM_STYLE,
  DEFAULT_PET,
  DEFAULT_DRESS_DESIGN,
  MAX_STICKERS_PER_DESIGN
} from './storage-keys.js';

/**
 * B4.1 换装入口：供 FEAT-003 早上选衣调用。在 container 内渲染 OutfitView，选衣完成后调用 onBack 返回。
 * @param {HTMLElement} container
 * @param {() => void} onBack - 选衣完成后回调（如重新渲染早上视图）
 */
export function openOutfitForMorning(container, onBack) {
  if (!container || typeof onBack !== 'function') return;
  container.innerHTML = '<div class="costume-page" style="padding:24px;text-align:center;">加载中…</div>';
  renderOutfitView(container, { onBack, title: '今天的打扮' });
}
