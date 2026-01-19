package com.jacky.verity.algorithm.core

/**
 * 算法引擎错误类型
 */
sealed class AlgorithmError(
    val message: String,
    val userMessage: String,
    val suggestion: String? = null
) {
    // 计算错误
    data class CalculationError(val cause: String) : AlgorithmError(
        message = "Algorithm calculation failed: $cause",
        userMessage = "算法计算失败",
        suggestion = "请重试或联系技术支持"
    )
    
    // 数据错误
    data class DataError(val cause: String) : AlgorithmError(
        message = "Data error: $cause",
        userMessage = "数据错误",
        suggestion = "请检查学习数据是否完整"
    )
    
    // 输入无效
    data class InvalidInputError(val field: String, val reason: String) : AlgorithmError(
        message = "Invalid input: $field - $reason",
        userMessage = "输入无效：$field",
        suggestion = "请检查输入参数"
    )
    
    // 未知错误
    data class Unknown(val cause: Throwable?) : AlgorithmError(
        message = "Unknown error: ${cause?.message}",
        userMessage = "发生未知错误",
        suggestion = "请重试或联系技术支持"
    )
}