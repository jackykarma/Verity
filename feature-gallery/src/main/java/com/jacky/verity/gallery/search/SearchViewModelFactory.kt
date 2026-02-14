package com.jacky.verity.gallery.search

import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import com.jacky.verity.gallery.domain.AlbumRepository
import com.jacky.verity.gallery.domain.MediaRepository

class SearchViewModelFactory(
    private val mediaRepository: MediaRepository,
    private val albumRepository: AlbumRepository
) : ViewModelProvider.Factory {
    @Suppress("UNCHECKED_CAST")
    override fun <T : ViewModel> create(modelClass: Class<T>): T {
        if (modelClass != SearchViewModel::class.java) throw IllegalArgumentException("Unknown ViewModel")
        return SearchViewModel(
            mediaRepository = mediaRepository,
            searchQueryParser = SearchQueryParser(),
            albumRepository = albumRepository
        ) as T
    }
}
