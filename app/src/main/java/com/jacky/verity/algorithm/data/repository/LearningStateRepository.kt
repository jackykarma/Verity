package com.jacky.verity.algorithm.data.repository

import com.jacky.verity.algorithm.core.AlgorithmError
import com.jacky.verity.algorithm.core.AlgorithmLogger
import com.jacky.verity.algorithm.data.database.dao.WordLearningStateDao
import com.jacky.verity.algorithm.data.database.entity.WordLearningStateEntity
import com.jacky.verity.algorithm.domain.model.LearningState
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

// 使用Kotlin标准库的Result类型
typealias AlgorithmResult<T> = Result<T>

/**
 * 学习状态仓库实现
 */
class LearningStateRepository(
    private val dao: WordLearningStateDao
) {
    
    /**
     * 获取学习状态
     */
    suspend fun getLearningState(wordId: String): AlgorithmResult<LearningState?> = withContext(Dispatchers.IO) {
        try {
            val entity = dao.getLearningStateByWordId(wordId)
            AlgorithmResult.success(entity?.toDomainModel())
        } catch (e: Exception) {
            AlgorithmLogger.logError("getLearningState", "Failed to get learning state: ${e.message}", e)
            AlgorithmResult.failure(AlgorithmError.Unknown(e))
        }
    }
    
    /**
     * 保存学习状态
     */
    suspend fun saveLearningState(state: LearningState): AlgorithmResult<Unit> = withContext(Dispatchers.IO) {
        try {
            val entity = state.toEntity()
            dao.insertLearningState(entity)
            AlgorithmLogger.logCalculation("saveLearningState", 0, success = true)
            AlgorithmResult.success(Unit)
        } catch (e: Exception) {
            AlgorithmLogger.logError("saveLearningState", "Failed to save learning state: ${e.message}", e)
            AlgorithmResult.failure(AlgorithmError.Unknown(e))
        }
    }
    
    /**
     * 更新学习状态
     */
    suspend fun updateLearningState(state: LearningState): AlgorithmResult<Unit> = withContext(Dispatchers.IO) {
        try {
            val entity = state.toEntity()
            dao.updateLearningState(entity)
            AlgorithmLogger.logCalculation("updateLearningState", 0, success = true)
            AlgorithmResult.success(Unit)
        } catch (e: Exception) {
            AlgorithmLogger.logError("updateLearningState", "Failed to update learning state: ${e.message}", e)
            AlgorithmResult.failure(AlgorithmError.Unknown(e))
        }
    }
    
    /**
     * 获取待复习的单词列表
     */
    suspend fun getDueWords(limit: Int): AlgorithmResult<List<LearningState>> = withContext(Dispatchers.IO) {
        try {
            val currentTime = System.currentTimeMillis()
            val entities = dao.getDueWords(currentTime, limit)
            val states = entities.map { it.toDomainModel() }
            AlgorithmResult.success(states)
        } catch (e: Exception) {
            AlgorithmLogger.logError("getDueWords", "Failed to get due words: ${e.message}", e)
            AlgorithmResult.failure(AlgorithmError.Unknown(e))
        }
    }
    
    /**
     * 获取新单词列表
     */
    suspend fun getNewWords(limit: Int): AlgorithmResult<List<LearningState>> = withContext(Dispatchers.IO) {
        try {
            val entities = dao.getNewWords(limit)
            val states = entities.map { it.toDomainModel() }
            AlgorithmResult.success(states)
        } catch (e: Exception) {
            AlgorithmLogger.logError("getNewWords", "Failed to get new words: ${e.message}", e)
            AlgorithmResult.failure(AlgorithmError.Unknown(e))
        }
    }
    
    // 扩展函数：实体转领域模型
    private fun WordLearningStateEntity.toDomainModel(): LearningState {
        return LearningState(
            wordId = wordId,
            easeFactor = easeFactor,
            interval = interval,
            repetitions = repetitions,
            nextReviewTime = nextReviewTime,
            lastReviewTime = lastReviewTime,
            createdAt = createdAt
        )
    }
    
    // 扩展函数：领域模型转实体
    private fun LearningState.toEntity(): WordLearningStateEntity {
        return WordLearningStateEntity(
            wordId = wordId,
            easeFactor = easeFactor,
            interval = interval,
            repetitions = repetitions,
            nextReviewTime = nextReviewTime,
            lastReviewTime = lastReviewTime,
            createdAt = createdAt
        )
    }
}