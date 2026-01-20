package com.jacky.verity.library.domain.model

import kotlinx.serialization.Serializable

/**
 * 词库元数据（用于SharedPreferences序列化）
 */
@Serializable
data class LibraryMetadata(
    val id: String,
    val name: String,
    val wordCount: Int,
    val createdAt: Long,
    val filePath: String,
    val fileSize: Long,
    val format: String, // LibraryFormat.name
    val isSelected: Boolean = false
) {
    /**
     * 生成唯一标识（用于去重）
     */
    fun generateFingerprint(): String {
        return "${filePath}_${fileSize}_${createdAt}"
    }
    
    /**
     * 转换为领域模型
     */
    fun toWordLibrary(): WordLibrary {
        return WordLibrary(
            id = id,
            name = name,
            wordCount = wordCount,
            createdAt = createdAt,
            filePath = filePath,
            fileSize = fileSize,
            format = LibraryFormat.valueOf(format),
            isSelected = isSelected
        )
    }
    
    companion object {
        /**
         * 从领域模型创建
         */
        fun fromWordLibrary(library: WordLibrary): LibraryMetadata {
            return LibraryMetadata(
                id = library.id,
                name = library.name,
                wordCount = library.wordCount,
                createdAt = library.createdAt,
                filePath = library.filePath,
                fileSize = library.fileSize,
                format = library.format.name,
                isSelected = library.isSelected
            )
        }
    }
}