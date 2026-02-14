package com.jacky.verity.gallery.domain

/**
 * 筛选条件（plan A0.1）：用户选择的过滤条件，如仅照片、按类型等。
 */
data class FilterCondition(
    val mediaTypeFilter: MediaTypeFilter? = null
)
