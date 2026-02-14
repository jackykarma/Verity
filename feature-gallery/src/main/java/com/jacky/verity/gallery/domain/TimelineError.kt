package com.jacky.verity.gallery.domain

/**
 * 领域错误类型（plan A3.2.2 / T020）。
 * 权限拒绝、MediaStore 不可用或未知异常时使用；不依赖 Android/data。
 */
sealed class TimelineError {
    object PermissionDenied : TimelineError()
    object MediaStoreUnavailable : TimelineError()
    data class Unknown(val cause: Throwable? = null) : TimelineError()
}
