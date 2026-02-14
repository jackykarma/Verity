package com.jacky.verity.gallery.album

import com.jacky.verity.gallery.domain.MediaItem
import com.jacky.verity.gallery.domain.MediaTypeFilter

/**
 * 图集详情 MVI Intent（FEAT-002 ST-003、ST-004）。
 */
sealed class AlbumDetailIntent {
    data object LoadAlbumContent : AlbumDetailIntent()
    data class ChangeMediaTypeFilter(val filter: MediaTypeFilter) : AlbumDetailIntent()
    data object ShowPicker : AlbumDetailIntent()
    data object DismissPicker : AlbumDetailIntent()
    data class OnPhotoClick(val item: MediaItem, val index: Int, val itemList: List<MediaItem>) : AlbumDetailIntent()
    data class AddMediaToAlbum(val mediaIds: List<Long>) : AlbumDetailIntent()
    data class RemoveMedia(val mediaId: Long) : AlbumDetailIntent()
}
