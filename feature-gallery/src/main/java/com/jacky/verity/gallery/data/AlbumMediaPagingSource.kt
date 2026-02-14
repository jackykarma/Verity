package com.jacky.verity.gallery.data

import android.content.ContentResolver
import android.content.ContentUris
import android.net.Uri
import android.provider.MediaStore
import androidx.paging.PagingSource
import androidx.paging.PagingState
import com.jacky.verity.gallery.data.album.AlbumDao
import com.jacky.verity.gallery.domain.MediaItem
import com.jacky.verity.gallery.domain.MediaTypeFilter
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

/**
 * 图集内媒体分页数据源（FEAT-002 T040）。
 * 系统图集：BUCKET_ID；用户图集：_ID IN (album_media)。
 */
class AlbumMediaPagingSource(
    private val albumId: Long,
    private val albumDao: AlbumDao,
    private val contentResolver: ContentResolver,
    private val mediaTypeFilter: MediaTypeFilter
) : PagingSource<Int, MediaItem>() {

    private val pageSize = 60

    override suspend fun load(params: LoadParams<Int>): LoadResult<Int, MediaItem> =
        withContext(Dispatchers.IO) {
            try {
                val offset = params.key ?: 0
                val limit = params.loadSize.coerceAtLeast(1)
                val uri = MediaStore.Images.Media.EXTERNAL_CONTENT_URI
                val projection = arrayOf(
                    MediaStore.Images.Media._ID,
                    MediaStore.Images.Media.DATE_TAKEN,
                    MediaStore.Images.Media.MIME_TYPE
                )
                val sortOrder = "${MediaStore.Images.Media.DATE_TAKEN} DESC LIMIT $limit OFFSET $offset"
                val (selection, selectionArgs) = buildSelection(offset, limit)
                    ?: return@withContext LoadResult.Page(emptyList(), null, null)
                val cursor = contentResolver.query(uri, projection, selection, selectionArgs, sortOrder)
                    ?: return@withContext LoadResult.Error(IllegalStateException("query returned null"))
                cursor.use {
                    val idIdx = it.getColumnIndexOrThrow(MediaStore.Images.Media._ID)
                    val dateIdx = it.getColumnIndexOrThrow(MediaStore.Images.Media.DATE_TAKEN)
                    val mimeIdx = it.getColumnIndexOrThrow(MediaStore.Images.Media.MIME_TYPE)
                    val list = mutableListOf<MediaItem>()
                    while (it.moveToNext()) {
                        val id = it.getLong(idIdx)
                        val dateTaken = it.getLong(dateIdx)
                        val mimeType = it.getString(mimeIdx) ?: "image/*"
                        val contentUri = ContentUris.withAppendedId(MediaStore.Images.Media.EXTERNAL_CONTENT_URI, id)
                        list.add(MediaItem(id = id, contentUri = contentUri, dateTaken = dateTaken, mimeType = mimeType))
                    }
                    val nextKey = if (list.size < limit) null else offset + limit
                    LoadResult.Page(data = list, prevKey = (offset - limit).takeIf { it >= 0 }, nextKey = nextKey)
                }
            } catch (e: SecurityException) {
                LoadResult.Error(e)
            } catch (e: Exception) {
                LoadResult.Error(e)
            }
        }

    override fun getRefreshKey(state: PagingState<Int, MediaItem>): Int? =
        state.anchorPosition?.let { (it / pageSize) * pageSize }

    private var cachedMediaIds: List<Long>? = null

    private suspend fun buildSelection(offset: Int, limit: Int): Pair<String, Array<String>>? {
        return if (albumId < 0) {
            val bucketId = -albumId
            val sel = "${MediaStore.Images.Media.BUCKET_ID}=?"
            val args = arrayOf(bucketId.toString())
            Pair(sel, args)
        } else {
            val ids = cachedMediaIds ?: albumDao.getMediaIdsByAlbumId(albumId).also { cachedMediaIds = it }
            if (ids.isEmpty()) return null
            val pageIds = ids.drop(offset).take(limit)
            if (pageIds.isEmpty()) return null
            val placeholders = pageIds.joinToString(",") { "?" }
            Pair("${MediaStore.Images.Media._ID} IN ($placeholders)", pageIds.map { it.toString() }.toTypedArray())
        }
    }
}
