package com.jacky.verity.gallery.album

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.jacky.verity.gallery.domain.AlbumRepository
import com.jacky.verity.gallery.domain.FilterCondition
import com.jacky.verity.gallery.domain.MediaRepository
import com.jacky.verity.gallery.domain.MediaViewerContext
import com.jacky.verity.gallery.domain.TimelineViewMode
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.catch
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch

/**
 * 图集详情 MVI ViewModel（FEAT-002 ST-003、ST-004）。
 */
class AlbumDetailViewModel(
    val albumId: Long,
    private val albumRepository: AlbumRepository,
    private val mediaRepository: MediaRepository
) : ViewModel() {

    private val _state = MutableStateFlow(AlbumDetailUiState())
    val state = _state.asStateFlow()

    fun getMediaPagerByAlbum(filter: com.jacky.verity.gallery.domain.MediaTypeFilter) =
        mediaRepository.getMediaPagerByAlbum(albumId, filter)

    /** 选图面板用：全部媒体列表。 */
    fun getMediaPagerForPicker() =
        mediaRepository.getMediaPager(TimelineViewMode.Day, FilterCondition())

    fun onIntent(intent: AlbumDetailIntent) {
        when (intent) {
            is AlbumDetailIntent.LoadAlbumContent -> { }
            is AlbumDetailIntent.ChangeMediaTypeFilter ->
                _state.update { it.copy(mediaTypeFilter = intent.filter) }
            is AlbumDetailIntent.ShowPicker ->
                _state.update { it.copy(showPicker = true) }
            is AlbumDetailIntent.DismissPicker ->
                _state.update { it.copy(showPicker = false) }
            is AlbumDetailIntent.OnPhotoClick -> {
                val ctx = MediaViewerContext(
                    itemList = intent.itemList,
                    currentIndex = intent.index.coerceIn(0, intent.itemList.size - 1).coerceAtLeast(0),
                    source = "album"
                )
                _state.update { it.copy(navigateToViewer = ctx) }
            }
            is AlbumDetailIntent.AddMediaToAlbum -> {
                viewModelScope.launch {
                    albumRepository.addMediaToAlbum(albumId, intent.mediaIds)
                        .onSuccess {
                            _state.update { it.copy(showPicker = false, refreshTrigger = it.refreshTrigger + 1) }
                        }
                        .onFailure {
                            _state.update { it.copy(toastMessage = "添加失败") }
                        }
                }
            }
            is AlbumDetailIntent.RemoveMedia -> {
                viewModelScope.launch {
                    albumRepository.removeMediaFromAlbum(albumId, intent.mediaId)
                        .onSuccess {
                            _state.update { it.copy(refreshTrigger = it.refreshTrigger + 1) }
                        }
                        .onFailure {
                            _state.update { it.copy(toastMessage = "移出失败") }
                        }
                }
            }
        }
    }

    fun clearNavigateToViewer() {
        _state.update { it.copy(navigateToViewer = null) }
    }

    fun clearToast() {
        _state.update { it.copy(toastMessage = null) }
    }
}
