package com.jacky.verity.gallery.search

/**
 * 可执行的 MediaStore 查询条件（值对象，不可变）。
 * 对应 plan A3.3 / story_detail_design ST-001。
 */
data class SearchCondition(
    val keyword: String? = null,
    val dateFrom: Long? = null,
    val dateTo: Long? = null,
    val albumId: Long? = null
) {
    fun hasAnyCondition(): Boolean =
        !keyword.isNullOrBlank() || dateFrom != null || dateTo != null || albumId != null
}
