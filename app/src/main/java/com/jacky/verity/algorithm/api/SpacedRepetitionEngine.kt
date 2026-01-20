package com.jacky.verity.algorithm.api

import com.jacky.verity.algorithm.core.AlgorithmError
import com.jacky.verity.algorithm.data.repository.AlgorithmResult
import com.jacky.verity.algorithm.domain.model.LearningState
import com.jacky.verity.algorithm.domain.model.ReviewResult

/**
 * 间隔重复算法引擎接口
 */
interface SpacedRepetitionEngine {
    
    /**
     * 计算下次复习时间
     * @param wordId 单词ID
     * @param quality 复习质量（0-5，0=完全忘记，5=完全记住）
     * @return 下次复习时间戳（毫秒）
     */
    suspend fun calculateNextReview(
        wordId: String,
        quality: Int
    ): AlgorithmResult<Long>
    
    /**
     * 获取学习任务列表
     * @param limit 返回数量限制
     * @return 待学习单词列表
     */
    suspend fun getLearningTaskList(limit: Int = 20): AlgorithmResult<List<String>>
    
    /**
     * 获取学习任务列表（基于词库提供的单词列表）
     * @param availableWordIds 词库中的所有单词ID
     * @param limit 返回数量限制
     * @return 待学习单词列表
     */
    suspend fun getLearningTaskList(
        availableWordIds: List<String>,
        limit: Int = 20
    ): AlgorithmResult<List<String>>
    
    /**
     * 更新学习状态
     * @param wordId 单词ID
     * @param quality 复习质量（0-5）
     * @return 更新后的学习状态
     */
    suspend fun updateLearningState(
        wordId: String,
        quality: Int
    ): AlgorithmResult<LearningState>
    
    /**
     * 获取学习状态
     * @param wordId 单词ID
     * @return 学习状态
     */
    suspend fun getLearningState(wordId: String): AlgorithmResult<LearningState?>
    
    /**
     * 获取待复习单词列表
     * @param limit 返回数量限制
     * @return 待复习单词列表（按优先级排序）
     */
    suspend fun getReviewList(limit: Int = 20): AlgorithmResult<List<ReviewResult>>
}