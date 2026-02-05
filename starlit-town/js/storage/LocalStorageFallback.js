/**
 * localStorage 降级实现 StorageService 契约（plan A3.2.1 / L2 ST-001）
 * get/set 使用 JSON 序列化；isAvailable 检测 localStorage 存在且可写
 */
import { StorageError } from './StorageError.js';

export class LocalStorageFallback {
  /**
   * @returns {boolean}
   */
  isAvailable() {
    try {
      if (typeof localStorage === 'undefined') return false;
      const k = '__starlit_avail__';
      localStorage.setItem(k, '1');
      localStorage.removeItem(k);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * @param {string} key
   * @returns {Promise<Object|null>}
   */
  get(key) {
    return new Promise((resolve, reject) => {
      try {
        if (!this.isAvailable()) {
          reject(new Error(StorageError.Unavailable));
          return;
        }
        const raw = localStorage.getItem(key);
        resolve(raw === null ? null : JSON.parse(raw));
      } catch (e) {
        reject(new Error(StorageError.Unknown));
      }
    });
  }

  /**
   * @param {string} key
   * @param {Object} value
   * @returns {Promise<void>}
   */
  set(key, value) {
    return new Promise((resolve, reject) => {
      try {
        if (!this.isAvailable()) {
          reject(new Error(StorageError.Unavailable));
          return;
        }
        localStorage.setItem(key, JSON.stringify(value));
        resolve();
      } catch (e) {
        if (e && (e.name === 'QuotaExceededError' || e.code === 22)) {
          reject(new Error(StorageError.QuotaExceeded));
        } else {
          reject(new Error(StorageError.Unknown));
        }
      }
    });
  }
}
