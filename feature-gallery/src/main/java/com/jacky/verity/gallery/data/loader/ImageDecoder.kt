package com.jacky.verity.gallery.data.loader

import android.content.ContentResolver
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.net.Uri
import java.io.IOException

/**
 * 大图采样解码（plan A3.3 / ST-001）。
 * BitmapFactory + inSampleSize，限制解码后最大边长 2048。
 */
class ImageDecoder(
    private val contentResolver: ContentResolver
) {
    /**
     * 根据目标宽高采样解码，返回 Bitmap 或 null（损坏/不支持/OOM）。
     */
    fun decodeSampled(uri: Uri, reqWidth: Int, reqHeight: Int): Bitmap? {
        return try {
            contentResolver.openInputStream(uri)?.use { inputStream ->
                val options = BitmapFactory.Options().apply {
                    inJustDecodeBounds = true
                }
                BitmapFactory.decodeStream(inputStream, null, options)
                options.inJustDecodeBounds = false
                options.inSampleSize = calculateInSampleSize(options, reqWidth, reqHeight)
                contentResolver.openInputStream(uri)?.use { stream ->
                    BitmapFactory.decodeStream(stream, null, options)
                }
            }
        } catch (e: IOException) {
            null
        } catch (e: OutOfMemoryError) {
            null
        } catch (e: SecurityException) {
            null
        }
    }

    /**
     * 计算 inSampleSize（2 的幂），限制解码后最大边长 2048。
     */
    fun calculateInSampleSize(
        options: BitmapFactory.Options,
        reqWidth: Int,
        reqHeight: Int
    ): Int {
        val w = options.outWidth
        val h = options.outHeight
        var inSampleSize = 1
        if (w > reqWidth || h > reqHeight) {
            val halfW = w / 2
            val halfH = h / 2
            while (halfW / inSampleSize >= reqWidth && halfH / inSampleSize >= reqHeight) {
                inSampleSize *= 2
            }
        }
        val decodedMax = maxOf(w, h) / inSampleSize
        if (decodedMax > 2048) {
            inSampleSize = (maxOf(w, h) / 2048).coerceAtLeast(1)
            if (inSampleSize > 1) {
                inSampleSize = 1 shl (31 - Integer.numberOfLeadingZeros(inSampleSize))
            }
        }
        return inSampleSize
    }
}
