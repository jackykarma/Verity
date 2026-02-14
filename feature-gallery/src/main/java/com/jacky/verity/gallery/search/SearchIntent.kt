package com.jacky.verity.gallery.search

import com.jacky.verity.gallery.domain.MediaItem

/** 搜索 MVI 用户意图（plan A3.2.2 / story_detail_design ST-002）。 */
sealed class SearchIntent {
    data class SearchQuery(val queryText: String) : SearchIntent()
    data class SelectDateRange(val dateFrom: Long?, val dateTo: Long?) : SearchIntent()
    data class SelectAlbum(val albumId: Long?) : SearchIntent()
    object ClearCondition : SearchIntent()
    /** itemList 为当前结果列表快照（供构建 MediaViewerContext）。 */
    data class OnPhotoClick(val item: MediaItem, val index: Int, val itemList: List<MediaItem>) : SearchIntent()
}
