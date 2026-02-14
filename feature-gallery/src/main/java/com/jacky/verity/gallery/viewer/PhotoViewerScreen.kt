package com.jacky.verity.gallery.viewer

import androidx.compose.foundation.ExperimentalFoundationApi
import androidx.compose.foundation.gestures.transformable
import androidx.compose.foundation.gestures.rememberTransformableState
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.pager.HorizontalPager
import androidx.compose.foundation.pager.rememberPagerState
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableFloatStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.unit.dp
import androidx.compose.ui.graphics.asImageBitmap
import androidx.activity.compose.BackHandler
import com.jacky.verity.gallery.domain.MediaViewerContext
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.material3.MaterialTheme
import coil.compose.AsyncImage

/**
 * 大图预览页（plan A3.1.2.1 / ST-002）。
 * HorizontalPager + 缩放，接收 MediaViewerContext。
 */
@OptIn(ExperimentalFoundationApi::class)
@Composable
fun PhotoViewerScreen(
    context: MediaViewerContext,
    viewModel: PhotoViewerViewModel,
    onNavigateBack: () -> Unit
) {
    val state by viewModel.state.collectAsState()
    val items = state.items
    if (items.isEmpty()) {
        Box(Modifier.fillMaxSize()) {
            Text("无内容", modifier = Modifier.align(Alignment.Center))
        }
        return
    }

    LaunchedEffect(Unit) {
        viewModel.onIntent(PhotoViewerIntent.Init(context))
    }

    val pagerState = rememberPagerState(
        pageCount = { items.size },
        initialPage = context.currentIndex.coerceIn(0, items.size - 1)
    )

    LaunchedEffect(pagerState.settledPage) {
        viewModel.onIntent(PhotoViewerIntent.OnPageChanged(pagerState.settledPage))
    }

    LaunchedEffect(state.currentIndex) {
        if (pagerState.currentPage != state.currentIndex) {
            pagerState.scrollToPage(state.currentIndex)
        }
    }

    BackHandler { onNavigateBack() }

    Column(modifier = Modifier.fillMaxSize()) {
        Box(modifier = Modifier.weight(1f)) {
            HorizontalPager(
            state = pagerState,
            modifier = Modifier.fillMaxSize(),
            beyondViewportPageCount = 1,
            userScrollEnabled = true
        ) { page ->
            val item = items.getOrNull(page) ?: return@HorizontalPager
            val mimeType = item.mimeType
            val bitmap = state.loadedBitmaps[page]
            val isError = page in state.errorIndices
            when {
                mimeType.startsWith("video/") -> VideoPlayerComponent(
                    uri = item.contentUri,
                    modifier = Modifier.fillMaxSize()
                )
                mimeType == "image/gif" -> AsyncImage(
                    model = item.contentUri,
                    contentDescription = null,
                    contentScale = ContentScale.Fit,
                    modifier = Modifier.fillMaxSize()
                )
                bitmap != null && !isError -> ZoomableImage(
                    bitmap = bitmap,
                    modifier = Modifier.fillMaxSize()
                )
                else -> Box(
                    Modifier
                        .fillMaxSize()
                        .background(MaterialTheme.colorScheme.surfaceVariant),
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        if (isError) "格式不支持或加载失败" else "加载中…",
                        style = MaterialTheme.typography.bodyMedium
                    )
                }
            }
        }

            IconButton(
                onClick = onNavigateBack,
                modifier = Modifier
                    .align(Alignment.TopStart)
                    .padding(8.dp)
            ) {
                Icon(
                    painter = painterResource(android.R.drawable.ic_menu_revert),
                    contentDescription = "返回"
                )
            }
        }

        ThumbnailStrip(
            items = items,
            focusIndex = state.currentIndex,
            onItemClick = { viewModel.onIntent(PhotoViewerIntent.OnThumbClick(it)) }
        )
    }
}

@Composable
private fun ZoomableImage(
    bitmap: android.graphics.Bitmap,
    modifier: Modifier = Modifier
) {
    var scale by remember { mutableFloatStateOf(1f) }
    var offsetX by remember { mutableFloatStateOf(0f) }
    var offsetY by remember { mutableFloatStateOf(0f) }
    val state = rememberTransformableState { zoomChange, panChange, _ ->
        scale = (scale * zoomChange).coerceIn(1f, 5f)
        offsetX += panChange.x
        offsetY += panChange.y
    }
    Image(
        bitmap = bitmap.asImageBitmap(),
        contentDescription = null,
        modifier = modifier
            .graphicsLayer(
                scaleX = scale,
                scaleY = scale,
                translationX = offsetX,
                translationY = offsetY
            )
            .transformable(state),
        contentScale = ContentScale.Fit
    )
}
