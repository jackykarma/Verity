package com.jacky.verity.gallery.data.loader

import android.graphics.Bitmap
import android.net.Uri

/**
 * 大图加载契约（plan A3.1.2.1 / ST-001）。
 * 采样、解码、缓存、回收由实现类负责。
 */
interface BigImageLoader {
    suspend fun load(uri: Uri, width: Int, height: Int): Bitmap?
    fun recycle(bitmap: Bitmap)
}
