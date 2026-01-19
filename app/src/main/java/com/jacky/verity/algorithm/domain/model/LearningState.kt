package com.jacky.verity.algorithm.domain.model

/**
 * 学习状态领域模型
 */
data class LearningState(
    val wordId: String,
    val easeFactor: Double = 2.5, // 简易因子（SM-2算法参数）
    val interval: Int = 0, // 当前复习间隔（天）
    val repetitions: Int = 0, // 连续正确次数
    val nextReviewTime: Long = 0, // 下次复习时间戳（毫秒）
    val lastReviewTime: Long = 0, // 上次复习时间戳（毫秒）
    val createdAt: Long = System.currentTimeMillis() // 创建时间戳
) {
    /**
     * 是否为首次学习
     */
    fun isNewWord(): Boolean = repetitions == 0 && interval == 0
    
    /**
     * 是否到了复习时间
     */
    fun isDueForReview(currentTime: Long = System.currentTimeMillis()): Boolean {
        return nextReviewTime <= currentTime
    }
    
    /**
     * 计算记忆强度（0.0-1.0）
     */
    fun calculateMemoryStrength(): Double {
        if (isNewWord()) return 0.0
        // 基于复习间隔和连续正确次数计算记忆强度
        val baseStrength = 1.0 - (1.0 / (1.0 + interval))
        val repetitionBonus = repetitions * 0.1
        return (baseStrength + repetitionBonus).coerceIn(0.0, 1.0)
    }
}