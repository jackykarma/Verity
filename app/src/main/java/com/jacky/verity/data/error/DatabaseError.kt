package com.jacky.verity.data.error

/**
 * 数据库错误类型
 */
sealed class DatabaseError(
    val message: String,
    val userMessage: String,
    val suggestion: String? = null
) {
    // 存储空间不足
    data object InsufficientStorage : DatabaseError(
        message = "Storage space insufficient",
        userMessage = "存储空间不足",
        suggestion = "请清理设备存储空间后重试"
    )
    
    // 数据库损坏
    data class DatabaseCorrupted(val cause: Throwable?) : DatabaseError(
        message = "Database file is corrupted",
        userMessage = "数据库文件已损坏",
        suggestion = "尝试从备份恢复数据，或联系技术支持"
    )
    
    // 查询超时
    data object QueryTimeout : DatabaseError(
        message = "Database query timeout",
        userMessage = "查询超时",
        suggestion = "请稍后重试，或减少查询数据量"
    )
    
    // 写入失败
    data class WriteFailed(val cause: Throwable?) : DatabaseError(
        message = "Database write operation failed",
        userMessage = "保存失败",
        suggestion = "请检查存储空间后重试"
    )
    
    // 数据不存在
    data object DataNotFound : DatabaseError(
        message = "Requested data not found",
        userMessage = "数据不存在",
        suggestion = null
    )
    
    // 数据库连接失败
    data class ConnectionFailed(val cause: Throwable?) : DatabaseError(
        message = "Failed to connect to database",
        userMessage = "数据库连接失败",
        suggestion = "请重启应用后重试"
    )
    
    // 权限被拒绝
    data object PermissionDenied : DatabaseError(
        message = "Database permission denied",
        userMessage = "权限不足",
        suggestion = "请授予应用存储权限"
    )
    
    // 未知错误
    data class Unknown(val cause: Throwable?) : DatabaseError(
        message = "Unknown database error",
        userMessage = "发生未知错误",
        suggestion = "请重启应用或联系技术支持"
    )
}