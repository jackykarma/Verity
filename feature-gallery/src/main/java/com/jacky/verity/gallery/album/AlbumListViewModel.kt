package com.jacky.verity.gallery.album

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.jacky.verity.gallery.domain.AlbumRepository
import com.jacky.verity.gallery.domain.AlbumType
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch

/**
 * 图集列表 MVI ViewModel（FEAT-002 ST-002）。
 */
class AlbumListViewModel(
    private val albumRepository: AlbumRepository
) : ViewModel() {

    private val _state = MutableStateFlow(AlbumListUiState())
    val state = _state.asStateFlow()

    init {
        viewModelScope.launch {
            albumRepository.getAllAlbums().collect { albums ->
                _state.update { it.copy(albums = albums) }
            }
        }
    }

    fun onIntent(intent: AlbumListIntent) {
        when (intent) {
            is AlbumListIntent.LoadAlbums -> { /* 已在 init 中 collect */ }
            is AlbumListIntent.CreateAlbum -> {
                viewModelScope.launch {
                    albumRepository.createAlbum(intent.name)
                        .onSuccess {
                            _state.update {
                                it.copy(showCreateDialog = false, toastMessage = null)
                            }
                        }
                        .onFailure {
                            _state.update {
                                it.copy(toastMessage = "创建失败")
                            }
                        }
                }
            }
            is AlbumListIntent.DeleteAlbum -> {
                if (intent.album.type != AlbumType.User) return
                viewModelScope.launch {
                    albumRepository.deleteAlbum(intent.album)
                        .onSuccess {
                            _state.update { it.copy(toastMessage = null) }
                        }
                        .onFailure {
                            _state.update { it.copy(toastMessage = "删除失败") }
                        }
                }
            }
            is AlbumListIntent.ShowCreateDialog ->
                _state.update { it.copy(showCreateDialog = true) }
            is AlbumListIntent.DismissCreateDialog ->
                _state.update { it.copy(showCreateDialog = false, toastMessage = null) }
        }
    }

    fun clearToast() {
        _state.update { it.copy(toastMessage = null) }
    }
}
