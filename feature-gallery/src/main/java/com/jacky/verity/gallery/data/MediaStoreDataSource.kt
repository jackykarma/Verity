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

    private val pageSize = 60

    override suspend fun load(params: LoadParams<Int>): LoadResult<Int, MediaItem> {
        return try {
            val offset = params.key ?: 0
            val limit = params.loadSize
            val uri = MediaStore.Images.Media.EXTERNAL_CONTENT_URI
            val projection = arrayOf(
                MediaStore.Images.Media._ID,
                MediaStore.Images.Media.DATE_TAKEN,
                MediaStore.Images.Media.MIME_TYPE,
                MediaStore.Images.Media.DISPLAY_NAME
            )
            val sortOrder = "${MediaStore.Images.Media.DATE_TAKEN} DESC LIMIT $limit OFFSET $offset"
            val selection = buildSelection()
            val selectionArgs = buildSelectionArgs()
            val cursor = contentResolver.query(uri, projection, selection, selectionArgs, sortOrder)
                ?: return LoadResult.Error(IllegalStateException("ContentResolver.query returned null"))
            try {
                val list = mutableListOf<MediaItem>()
                val idIdx = cursor.getColumnIndexOrThrow(MediaStore.Images.Media._ID)
                val dateIdx = cursor.getColumnIndexOrThrow(MediaStore.Images.Media.DATE_TAKEN)
                val mimeIdx = cursor.getColumnIndexOrThrow(MediaStore.Images.Media.MIME_TYPE)
                while (cursor.moveToNext()) {
                    val id = cursor.getLong(idIdx)
                    val dateTaken = cursor.getLong(dateIdx)
                    val mimeType = cursor.getString(mimeIdx) ?: "image/*"
                    val contentUri: Uri = ContentUris.withAppendedId(MediaStore.Images.Media.EXTERNAL_CONTENT_URI, id)
                    list.add(MediaItem(id = id, contentUri = contentUri, dateTaken = dateTaken, mimeType = mimeType))
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

    private fun buildSelection(): String? = when (filter.mediaTypeFilter) {
        com.jacky.verity.gallery.domain.MediaTypeFilter.Image ->
            "${MediaStore.MediaColumns.MIME_TYPE} LIKE ?"
        com.jacky.verity.gallery.domain.MediaTypeFilter.Video ->
            "${MediaStore.MediaColumns.MIME_TYPE} LIKE ?"
        else -> null
    }

    private fun buildSelectionArgs(): Array<String>? = when (filter.mediaTypeFilter) {
        com.jacky.verity.gallery.domain.MediaTypeFilter.Image -> arrayOf("image/%")
        com.jacky.verity.gallery.domain.MediaTypeFilter.Video -> arrayOf("video/%")
        else -> null
    }
}
