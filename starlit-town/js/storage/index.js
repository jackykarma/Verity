/**
 * 存储工厂与 B3 键约定（plan B3.2 / T033）
 * IndexedDB 可用则返回 IndexedDBAdapter，否则 LocalStorageFallback
 */
import { IndexedDBAdapter } from './IndexedDBAdapter.js';
import { LocalStorageFallback } from './LocalStorageFallback.js';
import { GAME_STATE_KEY } from './StorageService.js';
import { StorageError } from './StorageError.js';

let _instance = null;

/**
 * 检测 IndexedDB 是否可用（open 尝试）
 * @returns {Promise<boolean>}
 */
function isIndexedDBAvailable() {
  if (typeof indexedDB === 'undefined') return Promise.resolve(false);
  return new Promise((resolve) => {
    try {
      const req = indexedDB.open('__starlit_probe__', 1);
      req.onsuccess = () => {
        req.result.close();
        indexedDB.deleteDatabase('__starlit_probe__');
        resolve(true);
      };
      req.onerror = () => resolve(false);
    } catch {
      resolve(false);
    }
  });
}

/**
 * @returns {Promise<import('./IndexedDBAdapter.js').IndexedDBAdapter|import('./LocalStorageFallback.js').LocalStorageFallback>}
 */
export async function createStorage() {
  if (_instance) return _instance;
  const useIdb = await isIndexedDBAvailable();
  _instance = useIdb ? new IndexedDBAdapter() : new LocalStorageFallback();
  if (!_instance.isAvailable()) {
    _instance = new LocalStorageFallback();
  }
  return _instance;
}

export { GAME_STATE_KEY, StorageError };
export { IndexedDBAdapter } from './IndexedDBAdapter.js';
export { LocalStorageFallback } from './LocalStorageFallback.js';
