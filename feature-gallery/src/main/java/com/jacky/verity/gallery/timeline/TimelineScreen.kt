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
import kotlinx.coroutines.launch
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.layout.onGloballyPositioned
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.dp
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

/**
 * 时间轴列表界面（plan A3.2.1 / ST-003）。
 * LazyVerticalGrid + 日/月/年 SegmentedBar + 快滑条 + 筛选入口。
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun TimelineScreen(
    viewModel: TimelineViewModel,
    onNavigateToViewer: ((MediaViewerContext) -> Unit)? = null
) {
    val state by viewModel.state.collectAsState()
    val pagingItems = viewModel.mediaPagerFlow.collectAsLazyPagingItems()
    val listState = rememberLazyGridState()
    val scope = rememberCoroutineScope()

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
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 16.dp, vertical = 8.dp),
            horizontalArrangement = Arrangement.spacedBy(8.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            SingleChoiceSegmentedButtonRow(
                modifier = Modifier.weight(1f)
            ) {
                listOf(
                    TimelineViewMode.Day to "日",
                    TimelineViewMode.Month to "月",
                    TimelineViewMode.Year to "年"
                ).forEach { (mode, label) ->
                    SegmentedButton(
                        shape = SegmentedButtonDefaults.itemShape(index = 0, count = 3),
                        onClick = {
                            val snapshot = pagingItems.itemSnapshotList.toList().filterNotNull()
                            val focused = state.lastVisibleItemIndex?.let { i ->
                                snapshot.getOrNull(i)
                            }
                            viewModel.onIntent(
                                TimelineIntent.ChangeViewMode(mode, focused, snapshot)
                            )
                        },
                        selected = state.viewMode == mode
                    ) {
                        Text(label)
                    }
                }
            }
        }

        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 8.dp),
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
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
        }

        if (state.showPermissionPrompt) {
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(24.dp),
                contentAlignment = Alignment.Center
            ) {
                Text(
                    "需要存储权限以查看照片",
                    style = MaterialTheme.typography.bodyLarge,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
        } else {
            val itemCount = pagingItems.itemCount
            val isLoading = pagingItems.loadState.refresh is androidx.paging.LoadState.Loading
            if (!isLoading && itemCount == 0) {
                Box(
                    modifier = Modifier
                        .fillMaxSize()
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
            Row(modifier = Modifier.fillMaxSize()) {
                LazyVerticalGrid(
                    columns = GridCells.Fixed(columnsFor(state.viewMode)),
                    contentPadding = PaddingValues(8.dp),
                    horizontalArrangement = Arrangement.spacedBy(4.dp),
                    verticalArrangement = Arrangement.spacedBy(4.dp),
                    modifier = Modifier
                        .weight(1f)
                        .fillMaxSize(),
                    state = listState
                ) {
                    items(
                        count = pagingItems.itemCount,
                        key = { index -> pagingItems.peek(index)?.id ?: index.toLong() }
                    ) { index ->
                        val item = pagingItems[index]
                        if (item != null) {
                            val snapshot = pagingItems.itemSnapshotList.toList().filterNotNull()
                            TimelinePhotoItem(
                                item = item,
                                index = index,
                                itemList = snapshot,
                                onPhotoClick = {
                                    viewModel.onIntent(
                                        TimelineIntent.OnPhotoClick(item, index, snapshot)
                                    )
                                },
                                onVisible = {
                                    viewModel.onIntent(TimelineIntent.ReportVisibleIndex(index))
                                }
                            )
                        }
                    }
                }
                FastScrollBar(
                    listState = listState,
                    totalItemCount = pagingItems.itemCount,
                    dateLabel = state.dateLabelForThumb,
                    onThumbDrag = { targetIndex ->
                        val idx = targetIndex.coerceIn(0, (pagingItems.itemCount - 1).coerceAtLeast(0))
                        scope.launch { listState.animateScrollToItem(idx) }
                    }
                )
            }
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
        shape = CardDefaults.shape,
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant)
    ) {
        AsyncImage(
            model = ImageRequest.Builder(LocalContext.current)
                .data(item.contentUri)
                .crossfade(true)
                .build(),
            contentDescription = null,
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
        Box(
            modifier = Modifier
                .width(trackWidth)
                .fillMaxHeight()
                .background(MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f))
        ) {
            val firstVisible = listState.firstVisibleItemIndex
            val max = (totalItemCount - 1).coerceAtLeast(0)
            val thumbOffset = if (max > 0) firstVisible.toFloat() / max else 0f
            Box(
                modifier = Modifier
                    .size(trackWidth, 40.dp)
                    .align(Alignment.TopCenter)
                    .padding(top = (thumbOffset * 100).dp.coerceIn(0.dp, 100.dp))
                    .background(MaterialTheme.colorScheme.primary.copy(alpha = 0.7f))
            )
        }
    }
}
