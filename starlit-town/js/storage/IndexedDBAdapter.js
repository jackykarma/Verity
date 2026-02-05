/**
 * IndexedDB 实现 StorageService 契约（plan A3.2.1 / L2 ST-001）
 * 单库单对象库，key 字符串，value 可序列化对象
 */
import { StorageError } from './StorageError.js';

const DB_NAME = 'starlit-town';
const STORE_NAME = 'kv';

export class IndexedDBAdapter {
  constructor() {
    this.dbName = DB_NAME;
    this._db = null;
  }

  /**
   * @returns {boolean}
   */
  isAvailable() {
    if (typeof indexedDB === 'undefined') return false;
    try {
      return true;
    } catch {
      return false;
    }
  }

  /**
   * @returns {Promise<IDBDatabase>}
   */
  _open() {
    if (this._db) return Promise.resolve(this._db);
    return new Promise((resolve, reject) => {
      try {
        const req = indexedDB.open(this.dbName, 1);
        req.onerror = () => reject(new Error(StorageError.Unavailable));
        req.onsuccess = () => {
          this._db = req.result;
          resolve(this._db);
        };
        req.onupgradeneeded = (e) => {
          const db = e.target.result;
          if (!db.objectStoreNames.contains(STORE_NAME)) {
            db.createObjectStore(STORE_NAME);
          }
        };
      } catch (e) {
        reject(new Error(StorageError.Unavailable));
      }
    });
  }

  /**
   * @param {string} key
   * @returns {Promise<Object|null>}
   */
  get(key) {
    return this._open()
      .then((db) => {
        return new Promise((resolve, reject) => {
          const tx = db.transaction(STORE_NAME, 'readonly');
          const store = tx.objectStore(STORE_NAME);
          const req = store.get(key);
          req.onsuccess = () => resolve(req.result ?? null);
          req.onerror = () => reject(new Error(StorageError.Unknown));
        });
      })
      .catch((e) => {
        if (e.message === StorageError.Unavailable) throw e;
        throw new Error(StorageError.Unknown);
      });
  }

  /**
   * @param {string} key
   * @param {Object} value
   * @returns {Promise<void>}
   */
  set(key, value) {
    return this._open()
      .then((db) => {
        return new Promise((resolve, reject) => {
          const tx = db.transaction(STORE_NAME, 'readwrite');
          const store = tx.objectStore(STORE_NAME);
          const req = store.put(value, key);
          req.onsuccess = () => resolve();
          req.onerror = () => {
            const err = req.error;
            if (err && err.name === 'QuotaExceededError') {
              reject(new Error(StorageError.QuotaExceeded));
            } else {
              reject(new Error(StorageError.Unknown));
            }
          };
        });
      })
      .catch((e) => {
        if (e.message === StorageError.Unavailable || e.message === StorageError.QuotaExceeded) throw e;
        throw new Error(StorageError.Unknown);
      });
  }
}
