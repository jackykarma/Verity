package com.jacky.verity.gallery.album

import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import com.jacky.verity.gallery.domain.AlbumRepository

class AlbumListViewModelFactory(
    private val albumRepository: AlbumRepository
) : ViewModelProvider.Factory {
    @Suppress("UNCHECKED_CAST")
    override fun <T : ViewModel> create(modelClass: Class<T>): T =
        AlbumListViewModel(albumRepository) as T
}
