package com.jacky.verity.library.domain.model

/**
 * 词库管理错误类型
 */
sealed class LibraryError(
    val message: String,
    val userMessage: String,
    val suggestion: String? = null
) {
    // 文件格式不支持
    data class UnsupportedFormat(val format: String) : LibraryError(
        message = "Unsupported file format: $format",
        userMessage = "不支持的文件格式：$format",
        suggestion = "请选择 JSON、CSV 或 TXT 格式的文件"
    )
    
    // 文件解析失败
    data class ParseFailed(val cause: String) : LibraryError(
        message = "Failed to parse file: $cause",
        userMessage = "文件解析失败",
        suggestion = "请确保文件格式正确且未被损坏"
    )
    
    // 文件读取失败
    data class FileReadFailed(val cause: String) : LibraryError(
        message = "Failed to read file: $cause",
        userMessage = "文件读取失败",
        suggestion = "请检查文件权限和存储空间"
    )
    
    // 存储空间不足
    data object InsufficientStorage : LibraryError(
        message = "Storage space insufficient",
        userMessage = "存储空间不足",
        suggestion = "请清理设备存储空间后重试"
    )
    
    // 文件已存在（重复导入）
    data class FileAlreadyExists(val fileName: String) : LibraryError(
        message = "File already exists: $fileName",
        userMessage = "文件已存在：$fileName",
        suggestion = "该词库已导入，无需重复导入"
    )
    
    // 文件选择被取消
    data object FileSelectionCancelled : LibraryError(
        message = "File selection cancelled by user",
        userMessage = "文件选择已取消",
        suggestion = null
    )
    
    // 权限被拒绝
    data object PermissionDenied : LibraryError(
        message = "Permission denied",
        userMessage = "权限不足",
        suggestion = "请授予应用文件访问权限"
    )
    
    // 未知错误
    data class Unknown(val cause: Throwable?) : LibraryError(
        message = "Unknown error: ${cause?.message}",
        userMessage = "发生未知错误",
        suggestion = "请重试或联系技术支持"
    )
}