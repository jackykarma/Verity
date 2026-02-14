package com.jacky.verity.gallery.search

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import androidx.paging.PagingData
import androidx.paging.cachedIn
import com.jacky.verity.gallery.domain.AlbumRepository
import com.jacky.verity.gallery.domain.MediaItem
import com.jacky.verity.gallery.domain.MediaRepository
import com.jacky.verity.gallery.domain.MediaViewerContext
import kotlinx.coroutines.Job
import kotlinx.coroutines.flow.MutableSharedFlow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.catch
import kotlinx.coroutines.flow.distinctUntilChanged
import kotlinx.coroutines.flow.flatMapLatest
import kotlinx.coroutines.flow.flowOn
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.flow.onStart
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.delay

class SearchViewModel(
    private val mediaRepository: MediaRepository,
    private val searchQueryParser: SearchQueryParser,
    private val albumRepository: AlbumRepository
) : ViewModel() {

    private val _state = MutableStateFlow(SearchUiState())
    val state: StateFlow<SearchUiState> = _state.asStateFlow()

    private var searchJob: Job? = null
    private val queryDebounceMs = 400L

    /** 条件变化时触发搜索；UI 层 collect 并 collectAsLazyPagingItems。 */
    val searchPagingFlow: kotlinx.coroutines.flow.Flow<PagingData<MediaItem>> = _state
        .map { it.condition }
        .distinctUntilChanged()
        .flatMapLatest { condition ->
            if (condition.hasAnyCondition()) {
                mediaRepository.search(condition)
                    .catch { e -> emit(PagingData.empty()); _state.update { it.copy(toastMessage = "媒体库不可用") } }
            } else {
                kotlinx.coroutines.flow.flowOf(PagingData.empty())
            }
        }
        .cachedIn(viewModelScope)
        .flowOn(Dispatchers.Default)

    init {
        viewModelScope.launch {
            albumRepository.getAllAlbums().collect { albums ->
                _state.update { it.copy(albums = albums) }
            }
        }
    }

    fun onIntent(intent: SearchIntent) {
        when (intent) {
            is SearchIntent.SearchQuery -> {
                _state.update { it.copy(queryText = intent.queryText) }
                searchJob?.cancel()
                searchJob = viewModelScope.launch {
                    delay(queryDebounceMs)
                    performSearchFromQuery(intent.queryText)
                }
            }
            is SearchIntent.SelectDateRange -> {
                _state.update { s ->
                    s.copy(
                        condition = s.condition.copy(dateFrom = intent.dateFrom, dateTo = intent.dateTo),
                        showRefinePrompt = false
                    )
                }
            }
            is SearchIntent.SelectAlbum -> {
                _state.update { s ->
                    s.copy(
                        condition = s.condition.copy(albumId = intent.albumId),
                        showRefinePrompt = false
                    )
                }
            }
            is SearchIntent.ClearCondition -> {
                _state.update {
                    it.copy(
                        queryText = "",
                        condition = SearchCondition(),
                        showRefinePrompt = false
                    )
                }
            }
            is SearchIntent.OnPhotoClick -> {
                val list = intent.itemList
                val ctx = MediaViewerContext(
                    itemList = list.ifEmpty { listOf(intent.item) },
                    currentIndex = intent.index.coerceIn(0, (list.size - 1).coerceAtLeast(0)),
                    source = "search"
                )
                _state.update { it.copy(navigateToViewer = ctx) }
            }
        }
    }

    /** 导航消费后清除，避免重复导航。 */
    fun clearNavigateToViewer() {
        _state.update { it.copy(navigateToViewer = null) }
    }

    fun clearToast() {
        _state.update { it.copy(toastMessage = null) }
    }

    private suspend fun performSearchFromQuery(queryText: String) {
        val trimmed = queryText.trim()
        if (trimmed.isBlank()) {
            _state.update { it.copy(showRefinePrompt = false, condition = SearchCondition()) }
            return
        }
        _state.update { it.copy(isLoading = true) }
        val albums = _state.value.albums
        searchQueryParser.parse(trimmed, albums).fold(
            onSuccess = { condition ->
                _state.update {
                    it.copy(
                        condition = condition,
                        showRefinePrompt = false,
                        isLoading = false
                    )
                }
            },
            onFailure = {
                _state.update {
                    it.copy(showRefinePrompt = true, isLoading = false)
                }
            }
        )
    }
}
