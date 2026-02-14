package com.jacky.verity.gallery.album

import androidx.compose.foundation.ExperimentalFoundationApi
import androidx.compose.foundation.combinedClickable
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.aspectRatio
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.FloatingActionButton
import androidx.compose.material3.Scaffold
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
import androidx.compose.material3.Tab
import androidx.compose.material3.TabRow
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.dp
import androidx.paging.compose.LazyPagingItems
import androidx.paging.compose.collectAsLazyPagingItems
import coil.compose.AsyncImage
import coil.request.ImageRequest
import com.jacky.verity.gallery.domain.Album
import com.jacky.verity.gallery.domain.MediaItem
import com.jacky.verity.gallery.domain.MediaTypeFilter
import com.jacky.verity.gallery.domain.MediaViewerContext
import kotlinx.coroutines.flow.Flow

/**
 * 图集详情界面（FEAT-002 ST-003）。
 * 网格展示图集内照片，MediaTypeFilter Tab，点击进入大图。
 */
@OptIn(ExperimentalMaterial3Api::class, ExperimentalFoundationApi::class)
@Composable
fun AlbumDetailScreen(
    album: Album,
    viewModel: AlbumDetailViewModel,
    pagingFlow: Flow<androidx.paging.PagingData<MediaItem>>,
    pickerPagingFlow: Flow<androidx.paging.PagingData<MediaItem>>,
    onNavigateToViewer: (MediaViewerContext) -> Unit
) {
    val state by viewModel.state.collectAsState()
    val snackbarHostState = remember { SnackbarHostState() }
    val pagingItems = pagingFlow.collectAsLazyPagingItems()

    state.toastMessage?.let { msg ->
        LaunchedEffect(msg) {
            snackbarHostState.showSnackbar(msg)
            viewModel.clearToast()
        }
    }
    state.navigateToViewer?.let { ctx ->
        LaunchedEffect(ctx) {
            onNavigateToViewer(ctx)
            viewModel.clearNavigateToViewer()
        }
    }

    if (state.showPicker) {
        MediaPickerSheet(
            pagingFlow = pickerPagingFlow,
            onConfirm = { ids -> viewModel.onIntent(AlbumDetailIntent.AddMediaToAlbum(ids)) },
            onDismiss = { viewModel.onIntent(AlbumDetailIntent.DismissPicker) }
        )
    }
    Scaffold(
        snackbarHost = { SnackbarHost(hostState = snackbarHostState) },
        floatingActionButton = {
            FloatingActionButton(onClick = { viewModel.onIntent(AlbumDetailIntent.ShowPicker) }) {
                Text("添加照片")
            }
        },
        topBar = {
            TabRow(selectedTabIndex = MediaTypeFilter.entries.indexOf(state.mediaTypeFilter)) {
                MediaTypeFilter.entries.forEachIndexed { index, filter ->
                    Tab(
                        selected = state.mediaTypeFilter == filter,
                        onClick = { viewModel.onIntent(AlbumDetailIntent.ChangeMediaTypeFilter(filter)) },
                        text = { Text(filter.name) }
                    )
                }
            }
        }
    ) { padding ->
        val itemCount = pagingItems.itemCount
        if (itemCount == 0) {
            Box(
                modifier = Modifier.fillMaxSize().padding(padding),
                contentAlignment = Alignment.Center
            ) {
                Text(
                    "暂无照片",
                    style = MaterialTheme.typography.bodyLarge,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
        } else {
            LazyVerticalGrid(
                columns = GridCells.Adaptive(minSize = 120.dp),
                contentPadding = PaddingValues(8.dp),
                horizontalArrangement = Arrangement.spacedBy(4.dp),
                verticalArrangement = Arrangement.spacedBy(4.dp),
                modifier = Modifier.fillMaxSize().padding(padding)
            ) {
                items(
                    count = itemCount,
                    key = { index: Int -> pagingItems.peek(index)?.id ?: index }
                ) { index: Int ->
                    val item = pagingItems[index]
                    if (item != null) {
                        Box(
                            modifier = Modifier
                                .fillMaxWidth()
                                .aspectRatio(1f)
                                .combinedClickable(
                                    onClick = {
                                        val list = (0 until itemCount).mapNotNull { pagingItems[it] }
                                        viewModel.onIntent(AlbumDetailIntent.OnPhotoClick(item, index, list))
                                    },
                                    onLongClick = {
                                        if (album.type == com.jacky.verity.gallery.domain.AlbumType.User) {
                                            viewModel.onIntent(AlbumDetailIntent.RemoveMedia(item.id))
                                        }
                                    }
                                )
                        ) {
                            AsyncImage(
                                model = ImageRequest.Builder(LocalContext.current)
                                    .data(item.contentUri)
                                    .crossfade(true)
                                    .build(),
                                contentDescription = null,
                                modifier = Modifier.fillMaxSize(),
                                contentScale = ContentScale.Crop
                            )
                        }
                    }
                }
            }
        }
    }
}
