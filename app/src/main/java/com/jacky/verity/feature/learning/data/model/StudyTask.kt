package com.jacky.verity.feature.learning.data.model

/**
 * 学习任务
 */
data class StudyTask(
    val taskId: String,
    val wordId: String,
    val sessionType: SessionType
)