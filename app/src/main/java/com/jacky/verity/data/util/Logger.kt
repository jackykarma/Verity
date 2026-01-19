package com.jacky.verity.data.util

import android.util.Log

/**
 * 日志工具类，用于结构化日志记录
 */
object Logger {
    private const val TAG = "Verity"
    private const val TAG_DATA = "Verity.Data"
    private const val TAG_BACKUP = "Verity.Backup"
    
    fun d(message: String, tag: String = TAG) {
        Log.d(tag, message)
    }
    
    fun i(message: String, tag: String = TAG) {
        Log.i(tag, message)
    }
    
    fun w(message: String, throwable: Throwable? = null, tag: String = TAG) {
        if (throwable != null) {
            Log.w(tag, message, throwable)
        } else {
            Log.w(tag, message)
        }
    }
    
    fun e(message: String, throwable: Throwable? = null, tag: String = TAG) {
        if (throwable != null) {
            Log.e(tag, message, throwable)
        } else {
            Log.e(tag, message)
        }
    }
    
    /**
     * 记录数据库操作日志
     */
    fun logDatabaseOperation(operation: String, duration: Long? = null, success: Boolean = true) {
        val durationStr = duration?.let { "${it}ms" } ?: "N/A"
        val status = if (success) "SUCCESS" else "FAILED"
        i("DB[$operation] $status (${durationStr})", TAG_DATA)
    }
    
    /**
     * 记录数据库错误
     */
    fun logDatabaseError(operation: String, error: String, throwable: Throwable? = null) {
        e("DB[$operation] ERROR: $error", throwable, TAG_DATA)
    }
    
    /**
     * 记录备份操作日志
     */
    fun logBackupOperation(
        operation: String,
        fileSize: Long? = null,
        recordCount: Int? = null,
        duration: Long? = null,
        success: Boolean = true
    ) {
        val fileSizeStr = fileSize?.let { "${it / 1024}KB" } ?: "N/A"
        val recordCountStr = recordCount?.toString() ?: "N/A"
        val durationStr = duration?.let { "${it}ms" } ?: "N/A"
        val status = if (success) "SUCCESS" else "FAILED"
        i("BACKUP[$operation] $status (size: $fileSizeStr, records: $recordCountStr, duration: $durationStr)", TAG_BACKUP)
    }
    
    /**
     * 记录备份错误
     */
    fun logBackupError(operation: String, error: String, throwable: Throwable? = null) {
        e("BACKUP[$operation] ERROR: $error", throwable, TAG_BACKUP)
    }
    
    /**
     * 记录性能指标
     */
    fun logPerformance(metric: String, value: Long, unit: String = "ms") {
        i("PERF[$metric] $value$unit", TAG)
    }
}