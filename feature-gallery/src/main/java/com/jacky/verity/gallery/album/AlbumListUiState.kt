package com.jacky.verity.gallery.album

import com.jacky.verity.gallery.domain.Album

/**
 * 图集列表 UI 状态（FEAT-002 ST-002）。
 */
data class AlbumListUiState(
    val albums: List<Album> = emptyList(),
    val showCreateDialog: Boolean = false,
    val toastMessage: String? = null
)
