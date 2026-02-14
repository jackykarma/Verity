package com.jacky.verity.gallery.viewer

import com.jacky.verity.gallery.domain.MediaViewerContext

/**
 * 大图页用户意图（plan A3.2.2 / ST-002）。
 */
sealed class PhotoViewerIntent {
    data class Init(val context: MediaViewerContext) : PhotoViewerIntent()
    data class OnPageChanged(val index: Int) : PhotoViewerIntent()
    data class OnThumbClick(val index: Int) : PhotoViewerIntent()
}
