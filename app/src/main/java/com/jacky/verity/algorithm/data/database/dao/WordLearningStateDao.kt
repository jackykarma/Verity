package com.jacky.verity.algorithm.data.database.dao

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import androidx.room.Update
import com.jacky.verity.algorithm.data.database.entity.WordLearningStateEntity
import kotlinx.coroutines.flow.Flow

/**
 * 单词学习状态DAO
 */
@Dao
interface WordLearningStateDao {
    
    /**
     * 根据单词ID获取学习状态
     */
    @Query("SELECT * FROM word_learning_state WHERE wordId = :wordId LIMIT 1")
    suspend fun getLearningStateByWordId(wordId: String): WordLearningStateEntity?
    
    /**
     * 获取所有学习状态（Flow）
     */
    @Query("SELECT * FROM word_learning_state")
    fun getAllLearningStates(): Flow<List<WordLearningStateEntity>>
    
    /**
     * 获取待复习的单词列表（按优先级排序）
     */
    @Query("SELECT * FROM word_learning_state WHERE nextReviewTime <= :currentTime ORDER BY nextReviewTime ASC, easeFactor ASC LIMIT :limit")
    suspend fun getDueWords(currentTime: Long, limit: Int): List<WordLearningStateEntity>
    
    /**
     * 获取新单词列表（未学习的单词）
     */
    @Query("SELECT * FROM word_learning_state WHERE repetitions = 0 AND interval = 0 ORDER BY createdAt ASC LIMIT :limit")
    suspend fun getNewWords(limit: Int): List<WordLearningStateEntity>
    
    /**
     * 插入学习状态
     */
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertLearningState(state: WordLearningStateEntity)
    
    /**
     * 更新学习状态
     */
    @Update
    suspend fun updateLearningState(state: WordLearningStateEntity)
    
    /**
     * 删除学习状态
     */
    @Query("DELETE FROM word_learning_state WHERE wordId = :wordId")
    suspend fun deleteLearningState(wordId: String)
}