package com.jacky.verity.data.error

/**
 * 数据验证错误类型
 */
sealed class ValidationError(
    val message: String,
    val userMessage: String,
    val suggestion: String? = null
) {
    // 数据为空
    data object EmptyData : ValidationError(
        message = "Data is empty",
        userMessage = "数据为空",
        suggestion = null
    )
    
    // 数据格式错误
    data class InvalidFormat(val field: String) : ValidationError(
        message = "Invalid data format for field: $field",
        userMessage = "数据格式错误：$field",
        suggestion = "请检查输入数据格式"
    )
    
    // 数据范围错误
    data class OutOfRange(val field: String, val min: Any?, val max: Any?) : ValidationError(
        message = "Data out of range for field: $field (min: $min, max: $max)",
        userMessage = "数据超出范围：$field",
        suggestion = "请输入 $min 到 $max 之间的值"
    )
    
    // 必填字段缺失
    data class RequiredFieldMissing(val field: String) : ValidationError(
        message = "Required field is missing: $field",
        userMessage = "必填字段缺失：$field",
        suggestion = "请填写所有必填字段"
    )
}