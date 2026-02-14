package com.jacky.verity.gallery.data.loader

import android.graphics.Bitmap
import android.net.Uri
import android.util.LruCache
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import java.util.Collections

/**
 * BigImageLoader 实现：LruCache 50MB + ImageDecoder，recycle 时从 cache 移除（plan A3.3 / ST-001）。
 */
class BigImageLoaderImpl(
    private val contentResolver: android.content.ContentResolver
) : BigImageLoader {

    private val decoder = ImageDecoder(contentResolver)

    private val maxCacheSizeBytes = 50 * 1024 * 1024

    private val cache = object : LruCache<String, Bitmap>(maxCacheSizeBytes) {
        override fun sizeOf(key: String, value: Bitmap): Int = value.byteCount
    }

    private val bitmapToKey = Collections.synchronizedMap(mutableMapOf<Bitmap, String>())

    override suspend fun load(uri: Uri, width: Int, height: Int): Bitmap? = withContext(Dispatchers.IO) {
        val key = cacheKey(uri, width, height)
        cache.get(key)?.let { return@withContext it }
        val bitmap = decoder.decodeSampled(uri, width, height) ?: return@withContext null
        synchronized(bitmapToKey) {
            cache.put(key, bitmap)
            bitmapToKey[bitmap] = key
        }
        bitmap
    }

    override fun recycle(bitmap: Bitmap) {
        if (bitmap.isRecycled) return
        val key = synchronized(bitmapToKey) {
            bitmapToKey.remove(bitmap)
        }
        key?.let { cache.remove(it) }
        bitmap.recycle()
    }

    private fun cacheKey(uri: Uri, reqW: Int, reqH: Int): String =
        "${uri}_${reqW}x${reqH}"
}
