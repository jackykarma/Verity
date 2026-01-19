package com.jacky.verity.library.domain.model

/**
 * 词库文件格式枚举
 */
enum class LibraryFormat {
    JSON,
    CSV,
    TXT;
    
    companion object {
        /**
         * 根据文件扩展名获取格式
         */
        fun fromExtension(extension: String): LibraryFormat? {
            return when (extension.lowercase()) {
                "json" -> JSON
                "csv" -> CSV
                "txt" -> TXT
                else -> null
            }
        }
        
        /**
         * 根据MIME类型获取格式
         */
        fun fromMimeType(mimeType: String): LibraryFormat? {
            return when (mimeType.lowercase()) {
                "application/json", "text/json" -> JSON
                "text/csv", "application/csv" -> CSV
                "text/plain" -> TXT
                else -> null
            }
        }
    }
}