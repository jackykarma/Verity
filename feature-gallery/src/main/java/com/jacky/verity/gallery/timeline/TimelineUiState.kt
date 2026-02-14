package com.jacky.verity.gallery.timeline

import com.jacky.verity.gallery.domain.FilterCondition
import com.jacky.verity.gallery.domain.MediaViewerContext
import com.jacky.verity.gallery.domain.TimelineViewMode

/**
 * 时间轴 UI 状态（plan A3.2.2 / story_detail_design ST-002）。
 * 视图切换焦点保持：lastVisibleItemIndex、pendingScrollToItem。
 */
data class TimelineUiState(
    val viewMode: TimelineViewMode = TimelineViewMode.Day,
    val filter: FilterCondition = FilterCondition(),
    val showPermissionPrompt: Boolean = false,
    val dateLabelForThumb: String = "",
    val navigateToViewer: MediaViewerContext? = null,
    val pendingScrollToItem: Int? = null,
    val lastVisibleItemIndex: Int? = null,
    val error: Throwable? = null
)
