package com.jacky.verity.gallery.timeline

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import androidx.paging.PagingData
import com.jacky.verity.gallery.domain.FilterCondition
import com.jacky.verity.gallery.domain.MediaItem
import com.jacky.verity.gallery.domain.MediaRepository
import com.jacky.verity.gallery.domain.MediaViewerContext
import com.jacky.verity.gallery.domain.TimelineViewMode
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.flatMapLatest
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch
import java.util.Calendar

/**
 * 时间轴 MVI ViewModel（plan A3.2.2 / story_detail_design ST-002）。
 * 处理 LoadTimeline、ChangeViewMode、ChangeFilter、OnPhotoClick、OnThumbDrag；
 * 视图切换时通过 focusedItem + itemListSnapshot 计算 pendingScrollToItem 保持焦点。
 */
class TimelineViewModel(
    private val repository: MediaRepository
) : ViewModel() {

    private val _state = MutableStateFlow(TimelineUiState())
    val state: StateFlow<TimelineUiState> = _state.asStateFlow()

    /** 随 viewMode/filter 变化的 Paging Flow，供 UI collectAsLazyPagingItems */
    val mediaPagerFlow = _state.map { s ->
        repository.getMediaPager(s.viewMode, s.filter)
    }.flatMapLatest { it }.stateIn(
        scope = viewModelScope,
        started = SharingStarted.WhileSubscribed(5000),
        initialValue = PagingData.empty()
    )

    fun onIntent(intent: TimelineIntent) {
        _state.value = reduce(_state.value, intent)
        when (intent) {
            is TimelineIntent.ChangeViewMode -> {
                val targetIndex = scrollToFocusedItemInNewViewMode(
                    intent.focusedItem,
                    intent.newMode,
                    intent.itemListSnapshot
                )
                _state.value = _state.value.copy(pendingScrollToItem = targetIndex ?: 0)
            }
            else -> {}
        }
    }

    private fun reduce(current: TimelineUiState, intent: TimelineIntent): TimelineUiState = when (intent) {
        is TimelineIntent.LoadTimeline -> current
        is TimelineIntent.ChangeViewMode -> current.copy(viewMode = intent.newMode)
        is TimelineIntent.ChangeFilter -> current.copy(filter = intent.filter)
        is TimelineIntent.OnPhotoClick -> {
            val list = if (intent.itemListSnapshot.isNotEmpty()) intent.itemListSnapshot else listOf(intent.item)
            val idx = intent.index.coerceIn(0, list.size - 1).coerceAtLeast(0)
            current.copy(
                navigateToViewer = MediaViewerContext(itemList = list, currentIndex = idx, source = "timeline")
            )
        }
        is TimelineIntent.OnThumbDrag -> current
        is TimelineIntent.ClearScrollTarget -> current.copy(pendingScrollToItem = null, navigateToViewer = null)
        is TimelineIntent.ReportVisibleIndex -> current.copy(lastVisibleItemIndex = intent.firstVisibleItemIndex)
    }

    /**
     * 根据新 viewMode 对 itemList 分组，返回 focus 项在扁平列表（含分组头）中的显示索引。
     */
    private fun scrollToFocusedItemInNewViewMode(
        focusedItem: MediaItem?,
        newMode: TimelineViewMode,
        itemList: List<MediaItem>
    ): Int? {
        if (focusedItem == null || itemList.isEmpty()) return null
        val groups = groupByViewMode(itemList, newMode)
        var displayIndex = 0
        for ((_, items) in groups) {
            val idx = items.indexOfFirst { it.id == focusedItem.id }
            if (idx >= 0) return displayIndex + idx
            displayIndex += 1 + items.size
        }
        return null
    }

    private fun groupByViewMode(items: List<MediaItem>, mode: TimelineViewMode): List<Pair<String, List<MediaItem>>> {
        val cal = Calendar.getInstance()
        val groupKey: (Long) -> String = when (mode) {
            TimelineViewMode.Day -> { ts ->
                cal.timeInMillis = ts
                "${cal.get(Calendar.YEAR)}-${cal.get(Calendar.MONTH)}-${cal.get(Calendar.DAY_OF_MONTH)}"
            }
            TimelineViewMode.Month -> { ts ->
                cal.timeInMillis = ts
                "${cal.get(Calendar.YEAR)}-${cal.get(Calendar.MONTH)}"
            }
            TimelineViewMode.Year -> { ts ->
                cal.timeInMillis = ts
                "${cal.get(Calendar.YEAR)}"
            }
        }
        return items.groupBy { groupKey(it.dateTaken) }.toList().sortedByDescending { (_, list) -> list.maxOf { it.dateTaken } }
    }
}
