package com.jacky.verity.library.domain.model

/**
 * 词库领域模型
 */
data class WordLibrary(
    val id: String,
    val name: String,
    val wordCount: Int,
    val createdAt: Long,
    val filePath: String,
    val fileSize: Long,
    val format: LibraryFormat,
    val isSelected: Boolean = false
) {
    /**
     * 生成唯一标识（用于去重）
     * 基于文件路径、大小和修改时间
     */
    fun generateFingerprint(): String {
        return "${filePath}_${fileSize}_${createdAt}"
    }
}