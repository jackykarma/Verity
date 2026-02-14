package com.jacky.verity.gallery.viewer

import android.net.Uri
import androidx.compose.runtime.Composable
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.viewinterop.AndroidView
import androidx.media3.common.MediaItem
import androidx.media3.exoplayer.ExoPlayer
import androidx.media3.ui.PlayerView

/**
 * 视频播放组件（plan A3.1.2.1 / ST-004）。
 * ExoPlayer/Media3，DisposableEffect 内 release。
 */
@Composable
fun VideoPlayerComponent(
    uri: Uri,
    modifier: Modifier = Modifier
) {
    val context = LocalContext.current
    var player by remember { mutableStateOf<ExoPlayer?>(null) }
    DisposableEffect(uri) {
        val p = ExoPlayer.Builder(context).build().apply {
            setMediaItem(MediaItem.fromUri(uri))
            prepare()
            playWhenReady = true
        }
        player = p
        onDispose {
            p.release()
            player = null
        }
    }
    AndroidView(
        factory = { ctx -> PlayerView(ctx) },
        modifier = modifier,
        update = { view -> view.player = player }
    )
}
