package com.jacky.verity.gallery.search

import com.jacky.verity.gallery.domain.Album
import com.jacky.verity.gallery.domain.MediaViewerContext

/** 搜索 UI 状态（plan A3.2.2 / story_detail_design ST-002）。结果列表由 ViewModel 的 searchPagingFlow 在 UI 层 collectAsLazyPagingItems。 */
data class SearchUiState(
    val queryText: String = "",
    val condition: SearchCondition = SearchCondition(),
    val albums: List<Album> = emptyList(),
    val showRefinePrompt: Boolean = false,
    val isLoading: Boolean = false,
    val navigateToViewer: MediaViewerContext? = null,
    val toastMessage: String? = null
)
