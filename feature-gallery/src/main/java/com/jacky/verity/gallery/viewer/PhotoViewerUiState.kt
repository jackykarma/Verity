package com.jacky.verity.gallery.viewer

import android.graphics.Bitmap
import com.jacky.verity.gallery.domain.MediaItem

/**
 * 大图页 UI 状态（plan A3.2.2 / ST-002）。
 */
data class PhotoViewerUiState(
    val items: List<MediaItem> = emptyList(),
    val currentIndex: Int = 0,
    val loadedBitmaps: Map<Int, Bitmap> = emptyMap(),
    val errorIndices: Set<Int> = emptySet()
)
