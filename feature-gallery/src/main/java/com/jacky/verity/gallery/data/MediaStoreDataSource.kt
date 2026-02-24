package com.jacky.verity.gallery.data

import android.content.ContentResolver
import android.content.ContentUris
import android.net.Uri
import android.provider.MediaStore
import androidx.paging.PagingSource
import androidx.paging.PagingState
import com.jacky.verity.gallery.domain.FilterCondition
import com.jacky.verity.gallery.domain.MediaItem
import com.jacky.verity.gallery.domain.TimelineViewMode

/**
 * 时间轴用 MediaStore 分页数据源（plan A3.3 / story_detail_design ST-001）。
 * 按 DATE_TAKEN DESC 分页加载；支持 viewMode 与 filter。
 */
class MediaStoreDataSource(
    private val contentResolver: ContentResolver,
    private val viewMode: TimelineViewMode,
    private val filter: FilterCondition
) : PagingSource<Int, MediaItem>() {

    override val jumpingSupported: Boolean = true

    private val pageSize = 60

    override suspend fun load(params: LoadParams<Int>): LoadResult<Int, MediaItem> {
        return try {
            val offset = params.key ?: 0
            val limit = params.loadSize
            val useVideo = filter.mediaTypeFilter == com.jacky.verity.gallery.domain.MediaTypeFilter.Video
            val uri = if (useVideo) {
                MediaStore.Video.Media.EXTERNAL_CONTENT_URI
            } else {
                MediaStore.Images.Media.EXTERNAL_CONTENT_URI
            }
            val projection = if (useVideo) {
                arrayOf(
                    MediaStore.Video.Media._ID,
                    MediaStore.Video.Media.DATE_TAKEN,
                    MediaStore.Video.Media.MIME_TYPE,
                    MediaStore.Video.Media.DISPLAY_NAME
                )
            } else {
                arrayOf(
                    MediaStore.Images.Media._ID,
                    MediaStore.Images.Media.DATE_TAKEN,
                    MediaStore.Images.Media.MIME_TYPE,
                    MediaStore.Images.Media.DISPLAY_NAME
                )
            }
            val dateColumn = if (useVideo) MediaStore.Video.Media.DATE_TAKEN else MediaStore.Images.Media.DATE_TAKEN
            // ContentResolver.query() 的 sortOrder 不支持 LIMIT/OFFSET，仅用排序
            val sortOrder = "$dateColumn DESC"
            val selection = buildSelection(useVideo)
            val selectionArgs = buildSelectionArgs()
            val cursor = contentResolver.query(uri, projection, selection, selectionArgs, sortOrder)
                ?: return LoadResult.Error(IllegalStateException("ContentResolver.query returned null"))
            try {
                val list = mutableListOf<MediaItem>()
                val idIdx = cursor.getColumnIndexOrThrow(if (useVideo) MediaStore.Video.Media._ID else MediaStore.Images.Media._ID)
                val dateIdx = cursor.getColumnIndexOrThrow(dateColumn)
                val mimeIdx = cursor.getColumnIndexOrThrow(if (useVideo) MediaStore.Video.Media.MIME_TYPE else MediaStore.Images.Media.MIME_TYPE)
                val contentUriBase = if (useVideo) MediaStore.Video.Media.EXTERNAL_CONTENT_URI else MediaStore.Images.Media.EXTERNAL_CONTENT_URI
                // 跳过前 offset 行，再读取最多 limit 行（sortOrder 不含 LIMIT/OFFSET，在内存中分页）
                var skipped = 0
                while (skipped < offset && cursor.moveToNext()) skipped++
                var collected = 0
                while (collected < limit && cursor.moveToNext()) {
                    val id = cursor.getLong(idIdx)
                    val dateTaken = cursor.getLong(dateIdx)
                    val mimeType = cursor.getString(mimeIdx) ?: if (useVideo) "video/*" else "image/*"
                    val contentUri: Uri = ContentUris.withAppendedId(contentUriBase, id)
                    list.add(MediaItem(id = id, contentUri = contentUri, dateTaken = dateTaken, mimeType = mimeType))
                    collected++
                }
                val nextKey = if (list.size < limit) null else offset + limit
                LoadResult.Page(data = list, prevKey = (offset - limit).takeIf { it >= 0 }, nextKey = nextKey)
            } finally {
                cursor.close()
            }
        } catch (e: SecurityException) {
            LoadResult.Error(e)
        } catch (e: Exception) {
            LoadResult.Error(e)
        }
    }

    override fun getRefreshKey(state: PagingState<Int, MediaItem>): Int? =
        state.anchorPosition?.let { (it / pageSize) * pageSize }

    private fun buildSelection(useVideo: Boolean): String? = when (filter.mediaTypeFilter) {
        com.jacky.verity.gallery.domain.MediaTypeFilter.Image ->
            "${MediaStore.MediaColumns.MIME_TYPE} LIKE ?"
        com.jacky.verity.gallery.domain.MediaTypeFilter.Video ->
            if (useVideo) null else "${MediaStore.MediaColumns.MIME_TYPE} LIKE ?"
        else -> null
    }

    private fun buildSelectionArgs(): Array<String>? = when (filter.mediaTypeFilter) {
        com.jacky.verity.gallery.domain.MediaTypeFilter.Image -> arrayOf("image/%")
        com.jacky.verity.gallery.domain.MediaTypeFilter.Video -> arrayOf("video/%")
        else -> null
    }
}
