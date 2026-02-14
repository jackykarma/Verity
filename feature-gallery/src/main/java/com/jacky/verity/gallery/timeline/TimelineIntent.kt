package com.jacky.verity.gallery.timeline

import com.jacky.verity.gallery.domain.FilterCondition
import com.jacky.verity.gallery.domain.MediaItem
import com.jacky.verity.gallery.domain.TimelineViewMode

/**
 * 时间轴用户意图（plan A3.2.2 / story_detail_design ST-002）。
 */
sealed class TimelineIntent {
    data object LoadTimeline : TimelineIntent()
    data class ChangeViewMode(
        val newMode: TimelineViewMode,
        val focusedItem: MediaItem? = null,
        val itemListSnapshot: List<MediaItem> = emptyList()
    ) : TimelineIntent()
    data class ChangeFilter(val filter: FilterCondition) : TimelineIntent()
    data class OnPhotoClick(
        val item: MediaItem,
        val index: Int,
        val itemListSnapshot: List<MediaItem> = emptyList()
    ) : TimelineIntent()
    data class OnThumbDrag(val targetIndex: Int) : TimelineIntent()
    data object ClearScrollTarget : TimelineIntent()
    /** UI 上报当前可见首项索引，用于视图切换焦点保持 */
    data class ReportVisibleIndex(val firstVisibleItemIndex: Int) : TimelineIntent()
}
