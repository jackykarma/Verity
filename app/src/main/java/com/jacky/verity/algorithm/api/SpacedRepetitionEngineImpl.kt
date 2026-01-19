package com.jacky.verity.algorithm.api

import com.jacky.verity.algorithm.core.AlgorithmError
import com.jacky.verity.algorithm.core.AlgorithmLogger
import com.jacky.verity.algorithm.core.sm2.SM2Algorithm
import com.jacky.verity.algorithm.data.repository.AlgorithmResult
import com.jacky.verity.algorithm.domain.manager.LearningStateManager
import com.jacky.verity.algorithm.domain.model.LearningState
import com.jacky.verity.algorithm.domain.model.ReviewResult
import com.jacky.verity.algorithm.core.scheduler.ReviewScheduler
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

/**
 * 间隔重复算法引擎实现
 */
class SpacedRepetitionEngineImpl(
    private val stateManager: LearningStateManager,
    private val scheduler: ReviewScheduler
) : SpacedRepetitionEngine {
    
    override suspend fun calculateNextReview(
        wordId: String,
        quality: Int
    ): AlgorithmResult<Long> = withContext(Dispatchers.IO) {
        val startTime = System.currentTimeMillis()
        try {
            require(quality in 0..5) {
                return@withContext AlgorithmResult.failure(
                    AlgorithmError.InvalidInputError("quality", "must be between 0 and 5")
                )
            }
            
            // 获取当前状态
            val currentStateResult = stateManager.getOrCreateLearningState(wordId)
            val currentState = currentStateResult.getOrNull()
                ?: return@withContext AlgorithmResult.failure(
                    AlgorithmError.DataError("Failed to get learning state")
                )
            
            // 使用SM-2算法计算新状态
            val newState = SM2Algorithm.calculateNextReview(currentState, quality)
            
            // 更新状态
            val updateResult = stateManager.updateLearningState(wordId, quality)
            updateResult.fold(
                onSuccess = {
                    val duration = System.currentTimeMillis() - startTime
                    AlgorithmLogger.logCalculation("calculateNextReview", duration, success = true)
                    AlgorithmResult.success(newState.nextReviewTime)
                },
                onFailure = { error ->
                    AlgorithmLogger.logError("calculateNextReview", "Failed to update state", null)
                    AlgorithmResult.failure(error)
                }
            )
        } catch (e: Exception) {
            val duration = System.currentTimeMillis() - startTime
            AlgorithmLogger.logCalculation("calculateNextReview", duration, success = false)
            AlgorithmLogger.logError("calculateNextReview", "Exception: ${e.message}", e)
            AlgorithmResult.failure(AlgorithmError.Unknown(e))
        }
    }
    
    override suspend fun getLearningTaskList(limit: Int): AlgorithmResult<List<String>> {
        return scheduler.getLearningTaskList(limit)
    }
    
    override suspend fun updateLearningState(
        wordId: String,
        quality: Int
    ): AlgorithmResult<LearningState> {
        return stateManager.updateLearningState(wordId, quality)
    }
    
    override suspend fun getLearningState(wordId: String): AlgorithmResult<LearningState?> {
        return stateManager.getLearningState(wordId)
    }
    
    override suspend fun getReviewList(limit: Int): AlgorithmResult<List<ReviewResult>> {
        return scheduler.getReviewList(limit)
    }
}