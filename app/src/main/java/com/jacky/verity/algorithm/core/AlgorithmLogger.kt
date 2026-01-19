package com.jacky.verity.algorithm.core

import android.util.Log

/**
 * 算法引擎日志工具
 */
object AlgorithmLogger {
    private const val TAG = "Verity.Algorithm"
    
    fun d(message: String) {
        Log.d(TAG, message)
    }
    
    fun i(message: String) {
        Log.i(TAG, message)
    }
    
    fun w(message: String, throwable: Throwable? = null) {
        if (throwable != null) {
            Log.w(TAG, message, throwable)
        } else {
            Log.w(TAG, message)
        }
    }
    
    fun e(message: String, throwable: Throwable? = null) {
        if (throwable != null) {
            Log.e(TAG, message, throwable)
        } else {
            Log.e(TAG, message)
        }
    }
    
    /**
     * 记录算法计算日志
     */
    fun logCalculation(operation: String, duration: Long, success: Boolean = true) {
        val status = if (success) "SUCCESS" else "FAILED"
        i("CALC[$operation] $status (${duration}ms)")
    }
    
    /**
     * 记录算法错误
     */
    fun logError(operation: String, error: String, throwable: Throwable? = null) {
        e("ERROR[$operation] $error", throwable)
    }
}