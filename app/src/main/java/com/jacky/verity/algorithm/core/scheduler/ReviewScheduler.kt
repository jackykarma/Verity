package com.jacky.verity.algorithm.core.scheduler

import com.jacky.verity.algorithm.core.AlgorithmError
import com.jacky.verity.algorithm.core.evaluator.MemoryStrengthEvaluator
import com.jacky.verity.algorithm.data.repository.AlgorithmResult
import com.jacky.verity.algorithm.data.repository.LearningStateRepository
import com.jacky.verity.algorithm.domain.model.LearningState
import com.jacky.verity.algorithm.domain.model.ReviewResult
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

/**
 * 复习调度器
 * 负责生成待复习单词列表，按优先级排序
 */
class ReviewScheduler(
    private val repository: LearningStateRepository
) {
    
    /**
     * 获取待复习单词列表（按优先级排序）
     */
    suspend fun getReviewList(limit: Int = 20): AlgorithmResult<List<ReviewResult>> = withContext(Dispatchers.IO) {
        try {
            // 获取待复习的单词
            val dueWordsResult = repository.getDueWords(limit * 2) // 获取更多，用于排序
            val dueWords = dueWordsResult.getOrNull() 
                ?: return@withContext AlgorithmResult.failure(
                    AlgorithmError.DataError("Failed to get due words")
                )
            
            val currentTime = System.currentTimeMillis()
            
            // 计算优先级并排序
            val reviewResults = dueWords.map { state ->
                val priority = MemoryStrengthEvaluator.calculatePriority(state, currentTime)
                val memoryStrength = MemoryStrengthEvaluator.evaluateMemoryStrength(state)
                ReviewResult(
                    wordId = state.wordId,
                    priority = priority,
                    nextReviewTime = state.nextReviewTime,
                    memoryStrength = memoryStrength
                )
            }.sortedByDescending { it.priority } // 优先级高的在前
            
            // 返回前limit个
            AlgorithmResult.success(reviewResults.take(limit))
        } catch (e: Exception) {
            AlgorithmResult.failure(AlgorithmError.Unknown(e))
        }
    }
    
    /**
     * 获取学习任务列表（新单词 + 待复习单词）
     */
    suspend fun getLearningTaskList(limit: Int = 20): AlgorithmResult<List<String>> = withContext(Dispatchers.IO) {
        try {
            val newWordsResult = repository.getNewWords(limit / 2)
            val dueWordsResult = repository.getDueWords(limit / 2)
            
            val newWords = newWordsResult.getOrNull() ?: emptyList()
            val dueWords = dueWordsResult.getOrNull() ?: emptyList()
            
            // 合并：新单词优先，然后是待复习单词
            val taskList = (newWords.map { it.wordId } + dueWords.map { it.wordId }).take(limit)
            
            AlgorithmResult.success(taskList)
        } catch (e: Exception) {
            AlgorithmResult.failure(AlgorithmError.Unknown(e))
        }
    }
}