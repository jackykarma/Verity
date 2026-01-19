package com.jacky.verity.algorithm.core.sm2

import com.jacky.verity.algorithm.domain.model.LearningState

/**
 * SM-2 算法实现
 * SuperMemo 2 算法：用于计算间隔重复的复习时机
 * 
 * 算法参数：
 * - quality: 复习质量（0-5）
 *   - 0, 1, 2: 错误回答，重置间隔
 *   - 3: 困难，延长间隔
 *   - 4, 5: 正确回答，正常或缩短间隔
 * - easeFactor: 简易因子（默认2.5，范围1.3-2.5）
 * - interval: 复习间隔（天）
 * - repetitions: 连续正确次数
 */
object SM2Algorithm {
    
    /**
     * 计算下次复习时间
     * @param currentState 当前学习状态
     * @param quality 复习质量（0-5）
     * @return 更新后的学习状态
     */
    fun calculateNextReview(
        currentState: LearningState,
        quality: Int
    ): LearningState {
        require(quality in 0..5) { "Quality must be between 0 and 5" }
        
        val now = System.currentTimeMillis()
        var newEaseFactor = currentState.easeFactor
        var newInterval = currentState.interval
        var newRepetitions = currentState.repetitions
        
        when {
            quality < 3 -> {
                // 错误回答：重置间隔和重复次数
                newRepetitions = 0
                newInterval = 1
                // easeFactor保持不变或略微降低
            }
            quality == 3 -> {
                // 困难：延长间隔，但保持重复次数
                if (newRepetitions == 0) {
                    newInterval = 1
                } else {
                    newInterval = (newInterval * 1.2).toInt().coerceAtLeast(1)
                }
                newEaseFactor = (newEaseFactor - 0.15).coerceAtLeast(1.3)
            }
            else -> {
                // 正确回答（4或5）
                if (newRepetitions == 0) {
                    newInterval = 1
                } else if (newRepetitions == 1) {
                    newInterval = 6
                } else {
                    newInterval = (newInterval * newEaseFactor).toInt().coerceAtLeast(1)
                }
                newRepetitions++
                // 根据质量调整easeFactor
                newEaseFactor = newEaseFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
                newEaseFactor = newEaseFactor.coerceIn(1.3, 2.5)
            }
        }
        
        // 计算下次复习时间（毫秒）
        val nextReviewTime = now + (newInterval * 24 * 60 * 60 * 1000L)
        
        return currentState.copy(
            easeFactor = newEaseFactor,
            interval = newInterval,
            repetitions = newRepetitions,
            nextReviewTime = nextReviewTime,
            lastReviewTime = now
        )
    }
    
    /**
     * 创建新单词的初始学习状态
     */
    fun createInitialState(wordId: String): LearningState {
        return LearningState(
            wordId = wordId,
            easeFactor = 2.5,
            interval = 0,
            repetitions = 0,
            nextReviewTime = System.currentTimeMillis(), // 立即可以学习
            lastReviewTime = 0,
            createdAt = System.currentTimeMillis()
        )
    }
}