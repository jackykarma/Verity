package com.jacky.verity.gallery.viewer

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.jacky.verity.gallery.data.loader.BigImageLoader
import com.jacky.verity.gallery.domain.MediaViewerContext
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
/**
 * 大图页 MVI ViewModel（plan A3.2.1 / ST-002）。
 * 预加载 [current-1, current+1]，离屏 recycle。
 */
class PhotoViewerViewModel(
    private val loader: BigImageLoader,
    private val viewportW: Int = 1080,
    private val viewportH: Int = 1920
) : ViewModel() {

    private val _state = MutableStateFlow(PhotoViewerUiState())
    val state: StateFlow<PhotoViewerUiState> = _state.asStateFlow()

    fun onIntent(intent: PhotoViewerIntent) {
        when (intent) {
            is PhotoViewerIntent.Init -> handleInit(intent.context)
            is PhotoViewerIntent.OnPageChanged -> handlePageChanged(intent.index)
            is PhotoViewerIntent.OnThumbClick -> handleThumbClick(intent.index)
        }
    }

    private fun handleInit(context: MediaViewerContext) {
        val items = context.itemList
        val currentIndex = context.currentIndex.coerceIn(0, (items.size - 1).coerceAtLeast(0))
        _state.update {
            it.copy(
                items = items,
                currentIndex = currentIndex,
                loadedBitmaps = emptyMap(),
                errorIndices = emptySet()
            )
        }
        loadInWindow(preloadWindow(currentIndex, items.size))
    }

    private fun preloadWindow(center: Int, size: Int): List<Int> =
        listOf(center - 1, center, center + 1).filter { it in 0 until size }

    private fun loadInWindow(indices: List<Int>) {
        val items = _state.value.items
        if (items.isEmpty()) return
        viewModelScope.launch(Dispatchers.IO) {
            indices.forEach { idx ->
                if (idx !in items.indices) return@forEach
                val uri = items[idx].contentUri
                val bitmap = loader.load(uri, viewportW, viewportH)
                withContext(Dispatchers.Main) {
                    _state.update { s ->
                        if (bitmap != null) {
                            s.copy(loadedBitmaps = s.loadedBitmaps + (idx to bitmap))
                        } else {
                            s.copy(errorIndices = s.errorIndices + idx)
                        }
                    }
                }
            }
        }
    }

    private fun handlePageChanged(index: Int) {
        val items = _state.value.items
        if (items.isEmpty()) return
        val newIndex = index.coerceIn(0, items.size - 1)
        val oldWindow = preloadWindow(_state.value.currentIndex, items.size)
        val newWindow = preloadWindow(newIndex, items.size)
        val offscreen = oldWindow.filter { it !in newWindow }
        val toLoad = newWindow.filter { it !in _state.value.loadedBitmaps }

        offscreen.forEach { idx ->
            _state.value.loadedBitmaps[idx]?.let { bitmap ->
                loader.recycle(bitmap)
            }
        }
        _state.update { s ->
            s.copy(
                currentIndex = newIndex,
                loadedBitmaps = s.loadedBitmaps - offscreen,
                errorIndices = s.errorIndices - offscreen
            )
        }
        loadInWindow(toLoad)
    }

    private fun handleThumbClick(index: Int) {
        val items = _state.value.items
        if (index !in items.indices) return
        _state.update { it.copy(currentIndex = index) }
        if (index !in _state.value.loadedBitmaps && items[index].mimeType.startsWith("image/")) {
            loadInWindow(listOf(index))
        }
    }

    override fun onCleared() {
        _state.value.loadedBitmaps.values.forEach { loader.recycle(it) }
        super.onCleared()
    }
}
