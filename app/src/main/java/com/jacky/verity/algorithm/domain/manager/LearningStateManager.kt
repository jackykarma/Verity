package com.jacky.verity.algorithm.domain.manager

import com.jacky.verity.algorithm.core.AlgorithmError
import com.jacky.verity.algorithm.core.sm2.SM2Algorithm
import com.jacky.verity.algorithm.data.repository.AlgorithmResult
import com.jacky.verity.algorithm.data.repository.LearningStateRepository
import com.jacky.verity.algorithm.domain.model.LearningState
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

/**
 * 学习状态管理器
 * 负责管理单词学习状态的创建、更新和查询
 */
class LearningStateManager(
    private val repository: LearningStateRepository
) {
    
    /**
     * 获取或创建学习状态
     */
    suspend fun getOrCreateLearningState(wordId: String): AlgorithmResult<LearningState> = withContext(Dispatchers.IO) {
        val existingState = repository.getLearningState(wordId)
        when {
            existingState.isSuccess && existingState.getOrNull() != null -> {
                AlgorithmResult.success(existingState.getOrNull()!!)
            }
            else -> {
                // 创建新的学习状态
                val newState = SM2Algorithm.createInitialState(wordId)
                repository.saveLearningState(newState).fold(
                    onSuccess = { AlgorithmResult.success(newState) },
                    onFailure = { AlgorithmResult.failure(it) }
                )
            }
        }
    }
    
    /**
     * 更新学习状态（基于复习结果）
     */
    suspend fun updateLearningState(
        wordId: String,
        quality: Int
    ): AlgorithmResult<LearningState> = withContext(Dispatchers.IO) {
        require(quality in 0..5) { "Quality must be between 0 and 5" }
        
        // 获取当前状态
        val currentStateResult = getOrCreateLearningState(wordId)
        val currentState = currentStateResult.getOrNull() 
            ?: return@withContext AlgorithmResult.failure(
                AlgorithmError.DataError("Failed to get learning state")
            )
        
        // 使用SM-2算法计算新状态
        val newState = SM2Algorithm.calculateNextReview(currentState, quality)
        
        // 保存新状态
        repository.updateLearningState(newState).fold(
            onSuccess = { AlgorithmResult.success(newState) },
            onFailure = { AlgorithmResult.failure(it) }
        )
    }
    
    /**
     * 获取学习状态
     */
    suspend fun getLearningState(wordId: String): AlgorithmResult<LearningState?> {
        return repository.getLearningState(wordId)
    }
}