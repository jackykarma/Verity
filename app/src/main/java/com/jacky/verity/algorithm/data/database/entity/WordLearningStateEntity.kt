package com.jacky.verity.algorithm.data.database.entity

import androidx.room.Entity
import androidx.room.PrimaryKey

/**
 * 单词学习状态实体（Room数据库）
 */
@Entity(tableName = "word_learning_state")
data class WordLearningStateEntity(
    @PrimaryKey
    val wordId: String,
    val easeFactor: Double,
    val interval: Int,
    val repetitions: Int,
    val nextReviewTime: Long,
    val lastReviewTime: Long,
    val createdAt: Long
)