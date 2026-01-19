package com.jacky.verity.algorithm.core.evaluator

import com.jacky.verity.algorithm.domain.model.LearningState

/**
 * 记忆强度评估器
 * 用于评估单词的记忆强度，用于优先级排序
 */
object MemoryStrengthEvaluator {
    
    /**
     * 计算记忆强度（0.0-1.0）
     * 值越高表示记忆越牢固
     */
    fun evaluateMemoryStrength(state: LearningState): Double {
        return state.calculateMemoryStrength()
    }
    
    /**
     * 计算复习优先级
     * 优先级 = 记忆强度越低 + 复习时间越早 = 优先级越高
     */
    fun calculatePriority(state: LearningState, currentTime: Long = System.currentTimeMillis()): Double {
        val memoryStrength = evaluateMemoryStrength(state)
        val timeOverdue = (currentTime - state.nextReviewTime).coerceAtLeast(0) / (24.0 * 60 * 60 * 1000) // 超时天数
        
        // 优先级 = (1 - 记忆强度) * (1 + 超时天数)
        // 记忆强度越低、超时时间越长，优先级越高
        return (1.0 - memoryStrength) * (1.0 + timeOverdue)
    }
}