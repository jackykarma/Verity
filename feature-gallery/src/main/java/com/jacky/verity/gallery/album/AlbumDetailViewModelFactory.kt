package com.jacky.verity.gallery.album

import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import com.jacky.verity.gallery.domain.AlbumRepository
import com.jacky.verity.gallery.domain.MediaRepository

class AlbumDetailViewModelFactory(
    private val albumId: Long,
    private val albumRepository: AlbumRepository,
    private val mediaRepository: MediaRepository
) : ViewModelProvider.Factory {
    @Suppress("UNCHECKED_CAST")
    override fun <T : ViewModel> create(modelClass: Class<T>): T =
        AlbumDetailViewModel(albumId, albumRepository, mediaRepository) as T
}
