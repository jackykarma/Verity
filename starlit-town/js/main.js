/**
 * 星光小镇 - 游戏入口脚本（plan T052）
 * 加载后挂载 EntryView；loadOrNew 完成后根据是否有进度显示按钮；enterMap 后切换为 MapView
 */
import { render as renderEntryView } from './entry/EntryView.js';
import * as GameStateManager from './game/GameStateManager.js';

const app = document.getElementById('app');
if (!app) throw new Error('#app not found');

function showLoading() {
  app.innerHTML = '<div class="loading-page">加载中…</div>';
}

function showEntry(hasProgress) {
  renderEntryView(app, { hasProgress });
}

async function boot() {
  showLoading();
  const { state, hasProgress } = await GameStateManager.loadOrNew();
  showEntry(hasProgress);
}

boot();
