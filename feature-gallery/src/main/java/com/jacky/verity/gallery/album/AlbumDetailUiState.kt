package com.jacky.verity.gallery.album

import androidx.paging.compose.LazyPagingItems
import com.jacky.verity.gallery.domain.MediaItem
import com.jacky.verity.gallery.domain.MediaTypeFilter
import com.jacky.verity.gallery.domain.MediaViewerContext

/**
 * 图集详情 UI 状态（FEAT-002 ST-003、ST-004）。
 */
data class AlbumDetailUiState(
    val mediaTypeFilter: MediaTypeFilter = MediaTypeFilter.All,
    val showPicker: Boolean = false,
    val toastMessage: String? = null,
    val navigateToViewer: MediaViewerContext? = null,
    val refreshTrigger: Int = 0
)
