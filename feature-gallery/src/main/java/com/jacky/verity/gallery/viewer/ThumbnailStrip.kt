package com.jacky.verity.gallery.viewer

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.unit.dp
import coil.compose.AsyncImage
import com.jacky.verity.gallery.domain.MediaItem

/**
 * 底部缩图轴（plan A3.1.2.1 / ST-003）。
 * LazyRow + Coil 缩图，focusIndex 居中，点击切换。
 */
@Composable
fun ThumbnailStrip(
    items: List<MediaItem>,
    focusIndex: Int,
    onItemClick: (Int) -> Unit,
    modifier: Modifier = Modifier
) {
    if (items.isEmpty()) return
    val listState = rememberLazyListState()
    LaunchedEffect(focusIndex) {
        listState.animateScrollToItem(focusIndex)
    }
    LazyRow(
        state = listState,
        modifier = modifier,
        horizontalArrangement = Arrangement.spacedBy(4.dp),
        contentPadding = PaddingValues(horizontal = 8.dp, vertical = 8.dp)
    ) {
        items(
            count = items.size,
            key = { it }
        ) { index ->
            val isSelected = index == focusIndex
            AsyncImage(
                model = items[index].contentUri,
                contentDescription = null,
                contentScale = ContentScale.Crop,
                modifier = Modifier
                    .size(48.dp)
                    .clip(RoundedCornerShape(4.dp))
                    .then(
                        if (isSelected) Modifier.background(MaterialTheme.colorScheme.primaryContainer)
                        else Modifier
                    )
                    .clickable { onItemClick(index) }
            )
        }
    }
}
