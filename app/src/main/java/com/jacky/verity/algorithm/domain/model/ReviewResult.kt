package com.jacky.verity.algorithm.domain.model

/**
 * 复习结果
 */
data class ReviewResult(
    val wordId: String,
    val priority: Double, // 优先级（越高越需要复习）
    val nextReviewTime: Long, // 下次复习时间
    val memoryStrength: Double // 记忆强度（0.0-1.0）
)