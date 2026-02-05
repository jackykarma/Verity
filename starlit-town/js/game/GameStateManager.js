/**
 * 游戏状态单例（plan A3.3 / L2 ST-002）
 * 协调 loadOrNew、setScene、advancePhase、save；存储失败时提示且不回滚内存
 */
import { createStorage, GAME_STATE_KEY, StorageError } from '../storage/index.js';
import { createDefaultGameState } from './GameState.js';
import { canAdvance, nextPhase } from './DayCycleController.js';

/** @type {import('../storage/index.js').createStorage extends () => Promise<infer T> ? T : never} */
let _storage = null;

/**
 * @returns {Promise<{ get: (k: string) => Promise<Object|null>, set: (k: string, v: Object) => Promise<void>, isAvailable: () => boolean }>}
 */
async function getStorage() {
  if (_storage) return _storage;
  _storage = await createStorage();
  return _storage;
}

/**
 * 显示「进度无法保存」提示（NFR-REL-001）
 * @param {string} [detail]
 */
function showSaveFailed(detail) {
  const msg = detail || '进度无法保存';
  if (typeof document !== 'undefined') {
    const el = document.getElementById('toast') || (() => {
      const t = document.createElement('div');
      t.id = 'toast';
      t.setAttribute('role', 'alert');
      t.style.cssText = 'position:fixed;bottom:24px;left:50%;transform:translateX(-50%);background:rgba(45,38,64,0.9);color:#fff;padding:12px 20px;border-radius:14px;font-size:14px;z-index:9999;max-width:90%;';
      document.body.appendChild(t);
      return t;
    })();
    el.textContent = msg;
    el.style.display = 'block';
    setTimeout(() => { el.style.display = 'none'; }, 3000);
  }
}

/** @type {{ currentDay: number, currentSceneId: string, dayPhase: string } | null} */
let _state = null;

/** @type {((state: import('./GameState.js').ReturnType<typeof createDefaultGameState>) => void) | null} */
let _onStateChange = null;

/**
 * @param {(state: import('./GameState.js').ReturnType<typeof createDefaultGameState>) => void} fn
 */
export function setOnStateChange(fn) {
  _onStateChange = fn;
}

function notifyChange() {
  if (_state && _onStateChange) _onStateChange(_state);
}

/**
 * @returns {{ currentDay: number, currentSceneId: string, dayPhase: string }}
 */
export function getState() {
  if (!_state) _state = createDefaultGameState();
  return _state;
}

/**
 * 加载或新建进度（plan SEQ-001）
 * @returns {Promise<{ state: { currentDay: number, currentSceneId: string, dayPhase: string }, hasProgress: boolean }>}
 */
export async function loadOrNew() {
  const storage = await getStorage();
  if (!storage.isAvailable()) {
    showSaveFailed('进度无法保存');
    _state = createDefaultGameState();
    notifyChange();
    return { state: getState(), hasProgress: false };
  }
  let hasProgress = false;
  try {
    const raw = await storage.get(GAME_STATE_KEY);
    hasProgress = raw != null && typeof raw === 'object';
    _state = createDefaultGameState(raw);
  } catch (e) {
    if (typeof console !== 'undefined' && console.warn) console.warn('loadOrNew get failed', e);
    _state = createDefaultGameState();
  }
  notifyChange();
  return { state: getState(), hasProgress };
}

/**
 * 进入地图（由 EntryView 调用后切换为 MapView）
 */
export function enterMap() {
  // No persistence; view layer will switch to MapView
}

/**
 * 切换场景并持久化（plan SEQ-002）；串行化防抖避免 RISK-003
 * @param {string} sceneId
 * @returns {Promise<void>}
 */
export async function setScene(sceneId) {
  const state = getState();
  state.currentSceneId = sceneId;
  notifyChange();
  try {
    const storage = await getStorage();
    await storage.set(GAME_STATE_KEY, state);
  } catch (e) {
    const msg = e && e.message;
    if (msg === StorageError.Unavailable || msg === StorageError.QuotaExceeded || msg === StorageError.Unknown) {
      showSaveFailed('进度无法保存');
    }
  }
}

/**
 * 推进日阶段并持久化（plan SEQ-003）
 * @returns {Promise<boolean>}
 */
export async function advancePhase() {
  const state = getState();
  if (!canAdvance(state.dayPhase)) return false;
  state.dayPhase = nextPhase(state.dayPhase);
  notifyChange();
  try {
    const storage = await getStorage();
    await storage.set(GAME_STATE_KEY, state);
    return true;
  } catch (e) {
    showSaveFailed('进度无法保存');
    return true;
  }
}

/**
 * 主动保存当前状态
 * @returns {Promise<void>}
 */
export function save() {
  const state = getState();
  return getStorage()
    .then((s) => s.set(GAME_STATE_KEY, state))
    .catch(() => showSaveFailed('进度无法保存'));
}
