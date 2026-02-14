package com.jacky.verity.gallery.album

import com.jacky.verity.gallery.domain.Album

/**
 * 图集列表 MVI Intent（FEAT-002 ST-002）。
 */
sealed class AlbumListIntent {
    data object LoadAlbums : AlbumListIntent()
    data class CreateAlbum(val name: String) : AlbumListIntent()
    data class DeleteAlbum(val album: Album) : AlbumListIntent()
    data object ShowCreateDialog : AlbumListIntent()
    data object DismissCreateDialog : AlbumListIntent()
}
