/**
 * 存储抽象契约（plan B4.1）
 * 接口：get(key) -> Promise<Object|null>, set(key, value) -> Promise<void>, isAvailable() -> boolean
 * 失败时 reject(StorageError.xxx)
 */

export const GAME_STATE_KEY = 'starlit.gameState';
