/**
 * 存储层错误类型（plan B4.1 / L2 ST-001）
 * 失败时 reject(StorageError) 或 reject(new Error(StorageError.xxx))
 */
export const StorageError = Object.freeze({
  Unavailable: 'Unavailable',
  QuotaExceeded: 'QuotaExceeded',
  Unknown: 'Unknown'
});
