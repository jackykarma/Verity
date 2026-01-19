package com.jacky.verity.data.error

/**
 * 备份错误类型
 */
sealed class BackupError(
    val message: String,
    val userMessage: String,
    val suggestion: String? = null
) {
    // 文件格式错误
    data object InvalidFileFormat : BackupError(
        message = "Backup file format is invalid",
        userMessage = "备份文件格式错误",
        suggestion = "请确保文件是有效的备份文件"
    )
    
    // 文件损坏
    data class FileCorrupted(val cause: Throwable?) : BackupError(
        message = "Backup file is corrupted",
        userMessage = "备份文件已损坏",
        suggestion = "请使用其他备份文件"
    )
    
    // 存储空间不足
    data object InsufficientStorage : BackupError(
        message = "Storage space insufficient for backup operation",
        userMessage = "存储空间不足",
        suggestion = "请清理设备存储空间后重试"
    )
    
    // 版本不兼容
    data class VersionIncompatible(val fileVersion: String, val supportedVersion: String) : BackupError(
        message = "Backup file version is incompatible",
        userMessage = "备份文件版本不兼容",
        suggestion = "备份文件版本 ($fileVersion) 与当前应用版本不兼容。支持版本：$supportedVersion"
    )
    
    // 导出失败
    data class ExportFailed(val cause: Throwable?) : BackupError(
        message = "Backup export failed",
        userMessage = "备份导出失败",
        suggestion = "请检查存储空间和权限后重试"
    )
    
    // 导入失败
    data class ImportFailed(val cause: Throwable?) : BackupError(
        message = "Backup import failed",
        userMessage = "备份导入失败",
        suggestion = "请确保备份文件完整且未被修改"
    )
    
    // 文件读写失败
    data class FileOperationFailed(val cause: Throwable?) : BackupError(
        message = "File operation failed",
        userMessage = "文件操作失败",
        suggestion = "请检查文件权限和存储空间"
    )
    
    // 未知错误
    data class Unknown(val cause: Throwable?) : BackupError(
        message = "Unknown backup error",
        userMessage = "发生未知错误",
        suggestion = "请重试或联系技术支持"
    )
}