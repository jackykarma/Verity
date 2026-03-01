package com.jacky.verity.gallery.timeline

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.aspectRatio
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.BoxWithConstraints
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.lazy.grid.rememberLazyGridState
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.SegmentedButton
import androidx.compose.material3.SegmentedButtonDefaults
import androidx.compose.material3.SingleChoiceSegmentedButtonRow
import androidx.compose.material3.SuggestionChip
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.mutableFloatStateOf
import androidx.compose.runtime.setValue
import androidx.compose.runtime.getValue
import kotlinx.coroutines.launch
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.layout.onGloballyPositioned
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.dp
import java.text.SimpleDateFormat
import java.util.Calendar
import java.util.Locale
import androidx.paging.compose.LazyPagingItems
import androidx.paging.compose.collectAsLazyPagingItems
import coil.compose.AsyncImage
import coil.request.ImageRequest
import com.jacky.verity.gallery.domain.FilterCondition
import com.jacky.verity.gallery.domain.MediaItem
import com.jacky.verity.gallery.domain.MediaTypeFilter
import com.jacky.verity.gallery.domain.MediaViewerContext
import com.jacky.verity.gallery.domain.TimelineViewMode

private fun columnsFor(viewMode: TimelineViewMode): Int = when (viewMode) {
    TimelineViewMode.Day -> 6
    TimelineViewMode.Month -> 15
    TimelineViewMode.Year -> 32
}

/** 格式化为分组标题或快滑条气泡：今天/昨天 · yyyy年M月d日（与 design/README 一致） */
private fun formatDateLabel(dateTakenMs: Long?, viewMode: TimelineViewMode): String {
    if (dateTakenMs == null) return ""
    val cal = Calendar.getInstance()
    cal.timeInMillis = dateTakenMs
    val today = Calendar.getInstance()
    today.set(Calendar.HOUR_OF_DAY, 0)
    today.set(Calendar.MINUTE, 0)
    today.set(Calendar.SECOND, 0)
    today.set(Calendar.MILLISECOND, 0)
    val calDay = cal.clone() as Calendar
    calDay.set(Calendar.HOUR_OF_DAY, 0)
    calDay.set(Calendar.MINUTE, 0)
    calDay.set(Calendar.SECOND, 0)
    calDay.set(Calendar.MILLISECOND, 0)
    val fullDate = SimpleDateFormat("yyyy年M月d日", Locale.getDefault()).format(cal.time)
    val diffDays = ((today.timeInMillis - calDay.timeInMillis) / (24 * 60 * 60 * 1000)).toInt()
    val prefix = when {
        diffDays == 0 -> "今天"
        diffDays == 1 -> "昨天"
        else -> ""
    }
    return if (prefix.isEmpty()) fullDate else "$prefix · $fullDate"
}

/** 时间轴行：分组标题或照片项（用于带分组头的网格） */
private sealed class TimelineRow {
    data class Header(val label: String) : TimelineRow()
    data class Photo(val item: MediaItem, val originalIndex: Int) : TimelineRow()
}

private fun buildTimelineRows(snapshot: List<MediaItem>, viewMode: TimelineViewMode): List<TimelineRow> {
    if (snapshot.isEmpty()) return emptyList()
    val cal = Calendar.getInstance()
    val groupKey: (Long) -> String = when (viewMode) {
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
    val indexed = snapshot.mapIndexed { index, item -> item to index }
    val groups = indexed.groupBy { groupKey(it.first.dateTaken) }.toList()
        .sortedByDescending { (_, list) -> list.maxOf { it.first.dateTaken } }
    val rows = mutableListOf<TimelineRow>()
    for ((_, groupItems) in groups) {
        val firstDate = groupItems.first().first.dateTaken
        rows.add(TimelineRow.Header(formatDateLabel(firstDate, viewMode)))
        groupItems.forEach { (item, idx) -> rows.add(TimelineRow.Photo(item, idx)) }
    }
    return rows
}

/**
 * 时间轴列表界面（plan A3.2.1 / ST-003）。
 * LazyVerticalGrid + 日/月/年 SegmentedBar + 快滑条 + 筛选入口。
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun TimelineScreen(
    viewModel: TimelineViewModel,
    hasMediaPermission: Boolean = true,
    onRequestPermission: (() -> Unit)? = null,
    onNavigateToViewer: ((MediaViewerContext) -> Unit)? = null
) {
    val state by viewModel.state.collectAsState()
    val listState = rememberLazyGridState()
    val scope = rememberCoroutineScope()
    val showPermissionPrompt = !hasMediaPermission

    LaunchedEffect(state.navigateToViewer) {
        state.navigateToViewer?.let { ctx ->
            onNavigateToViewer?.invoke(ctx)
            viewModel.onIntent(TimelineIntent.ClearScrollTarget)
        }
    }

    LaunchedEffect(state.pendingScrollToItem) {
        state.pendingScrollToItem?.let { index ->
            listState.animateScrollToItem(index.coerceAtLeast(0))
            viewModel.onIntent(TimelineIntent.ClearScrollTarget)
        }
    }

    Column(modifier = Modifier.fillMaxSize()) {
        if (showPermissionPrompt) {
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(24.dp),
                contentAlignment = Alignment.Center
            ) {
                Column(
                    horizontalAlignment = Alignment.CenterHorizontally,
                    verticalArrangement = Arrangement.spacedBy(16.dp)
                ) {
                    Text(
                        "需要存储权限以查看照片和视频",
                        style = MaterialTheme.typography.bodyLarge,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                    onRequestPermission?.let { request ->
                        androidx.compose.material3.Button(onClick = request) {
                            Text("授权")
                        }
                    }
                }
            }
        } else {
            // 仅在已授权时订阅 Paging，避免无权限时首次加载失败导致列表一直为空
            TimelineGridContent(
                viewModel = viewModel,
                state = state,
                listState = listState,
                scope = scope,
                onNavigateToViewer = onNavigateToViewer
            )
        }
    }
}

@Composable
private fun TimelineGridContent(
    viewModel: TimelineViewModel,
    state: TimelineUiState,
    listState: androidx.compose.foundation.lazy.grid.LazyGridState,
    scope: kotlinx.coroutines.CoroutineScope,
    onNavigateToViewer: ((MediaViewerContext) -> Unit)?
) {
    val pagingItems = viewModel.mediaPagerFlow.collectAsLazyPagingItems()

    Column(modifier = Modifier.fillMaxSize()) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 24.dp, vertical = 8.dp),
        horizontalArrangement = Arrangement.spacedBy(8.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        SingleChoiceSegmentedButtonRow(modifier = Modifier.weight(1f)) {
            val modes = listOf(
                TimelineViewMode.Day to "日",
                TimelineViewMode.Month to "月",
                TimelineViewMode.Year to "年"
            )
            for (idx in modes.indices) {
                val (mode, label) = modes[idx]
                SegmentedButton(
                    shape = SegmentedButtonDefaults.itemShape(index = idx, count = modes.size),
                    onClick = {
                        val snapshot = pagingItems.itemSnapshotList.toList().filterNotNull()
                        val focused = state.lastVisibleItemIndex?.let { i -> snapshot.getOrNull(i) }
                        viewModel.onIntent(TimelineIntent.ChangeViewMode(mode, focused, snapshot))
                    },
                    selected = state.viewMode == mode,
                    colors = SegmentedButtonDefaults.colors(
                        activeContainerColor = MaterialTheme.colorScheme.primary,
                        activeContentColor = MaterialTheme.colorScheme.onPrimary,
                        inactiveContainerColor = MaterialTheme.colorScheme.surfaceVariant,
                        inactiveContentColor = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                ) {
                    Text(label)
                }
            }
        }
    }

    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 24.dp, vertical = 4.dp),
        horizontalArrangement = Arrangement.spacedBy(8.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Text(
            "筛选:",
            style = MaterialTheme.typography.labelMedium,
            color = MaterialTheme.colorScheme.onSurfaceVariant
        )
        SuggestionChip(
            onClick = { viewModel.onIntent(TimelineIntent.ChangeFilter(FilterCondition())) },
            label = { Text("全部") }
        )
        SuggestionChip(
            onClick = {
                viewModel.onIntent(
                    TimelineIntent.ChangeFilter(FilterCondition(mediaTypeFilter = MediaTypeFilter.Image))
                )
            },
            label = { Text("仅照片") }
        )
        SuggestionChip(
            onClick = {
                viewModel.onIntent(
                    TimelineIntent.ChangeFilter(FilterCondition(mediaTypeFilter = MediaTypeFilter.Video))
                )
            },
            label = { Text("仅视频") }
        )
    }

    val itemCount = pagingItems.itemCount
    val isLoading = pagingItems.loadState.refresh is androidx.paging.LoadState.Loading
    if (!isLoading && itemCount == 0) {
        Box(
            modifier = Modifier
                .weight(1f)
                .fillMaxWidth()
                .padding(24.dp),
            contentAlignment = Alignment.Center
        ) {
            Text(
                "暂无照片",
                style = MaterialTheme.typography.bodyLarge,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
        }
    } else {
        val cols = columnsFor(state.viewMode)
        val snapshot = pagingItems.itemSnapshotList.toList().filterNotNull()
        val firstVisibleIndex = listState.firstVisibleItemIndex
        val dateLabel = formatDateLabel(
            snapshot.getOrNull(firstVisibleIndex)?.dateTaken,
            state.viewMode
        )

        LaunchedEffect(firstVisibleIndex) {
            viewModel.onIntent(TimelineIntent.ReportVisibleIndex(firstVisibleIndex))
        }

        Row(
            modifier = Modifier
                .weight(1f)
                .fillMaxWidth()
                .fillMaxHeight()
        ) {
            LazyVerticalGrid(
                columns = GridCells.Fixed(cols),
                contentPadding = PaddingValues(24.dp),
                horizontalArrangement = Arrangement.spacedBy(4.dp),
                verticalArrangement = Arrangement.spacedBy(4.dp),
                modifier = Modifier.weight(1f).fillMaxHeight(),
                state = listState
            ) {
                items(
                    count = itemCount,
                    key = { i -> pagingItems.peek(i)?.id ?: i.toLong() }
                ) { index ->
                    val item = pagingItems[index]
                    if (item != null) {
                        val snapshot = pagingItems.itemSnapshotList.toList().filterNotNull()
                        TimelinePhotoItem(
                            item = item,
                            index = index,
                            itemList = snapshot,
                            onPhotoClick = {
                                viewModel.onIntent(TimelineIntent.OnPhotoClick(item, index, snapshot))
                            },
                            onVisible = {}
                        )
                    }
                }
            }
            FastScrollBar(
                listState = listState,
                totalItemCount = itemCount,
                dateLabel = dateLabel,
                onThumbDrag = { targetIndex ->
                    val idx = targetIndex.coerceIn(0, (itemCount - 1).coerceAtLeast(0))
                    scope.launch { listState.animateScrollToItem(idx) }
                }
            )
        }
    }
    }
}

@Composable
private fun TimelinePhotoItem(
    item: MediaItem,
    index: Int,
    itemList: List<MediaItem>,
    onPhotoClick: () -> Unit,
    onVisible: () -> Unit
) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .aspectRatio(1f)
            .clickable(onClick = onPhotoClick)
            .onGloballyPositioned { onVisible() },
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant)
    ) {
        AsyncImage(
            model = ImageRequest.Builder(LocalContext.current)
                .data(item.contentUri)
                .crossfade(true)
                .build(),
            contentDescription = null,
            contentScale = ContentScale.Crop,
            modifier = Modifier.fillMaxSize()
        )
    }
}

@Composable
private fun FastScrollBar(
    listState: androidx.compose.foundation.lazy.grid.LazyGridState,
    totalItemCount: Int,
    dateLabel: String,
    onThumbDrag: (Int) -> Unit
) {
    val trackWidth = 24.dp
    val bubbleWidth = 56.dp
    val thumbHeight = 40.dp
    Row(
        modifier = Modifier
            .width(bubbleWidth + trackWidth)
            .fillMaxHeight(),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Box(
            modifier = Modifier
                .width(bubbleWidth)
                .padding(4.dp),
            contentAlignment = Alignment.Center
        ) {
            Text(
                text = dateLabel.ifEmpty { "—" },
                style = MaterialTheme.typography.labelSmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
        }
        BoxWithConstraints(
            modifier = Modifier
                .width(trackWidth)
                .fillMaxHeight()
                .background(MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f))
        ) {
            val firstVisible = listState.firstVisibleItemIndex
            val max = (totalItemCount - 1).coerceAtLeast(0)
            val thumbOffsetFraction = if (max > 0) firstVisible.toFloat() / max else 0f
            val trackHeightDp = maxHeight
            val thumbTopDp = (thumbOffsetFraction * (trackHeightDp - thumbHeight).value).coerceIn(0f, (trackHeightDp - thumbHeight).value.coerceAtLeast(0f)).dp
            Box(
                modifier = Modifier
                    .size(trackWidth, thumbHeight)
                    .align(Alignment.TopCenter)
                    .padding(top = thumbTopDp)
                    .background(MaterialTheme.colorScheme.primary.copy(alpha = 0.7f))
            )
        }
    }
}
