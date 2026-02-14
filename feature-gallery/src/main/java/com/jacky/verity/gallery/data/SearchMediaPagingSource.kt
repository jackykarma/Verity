package com.jacky.verity.gallery.data

import android.content.ContentResolver
import android.content.ContentUris
import android.net.Uri
import android.provider.MediaStore
import androidx.paging.PagingSource
import androidx.paging.PagingState
import com.jacky.verity.gallery.domain.MediaItem
import com.jacky.verity.gallery.search.SearchCondition

/**
 * 根据 SearchCondition 查询 MediaStore，返回分页 MediaItem。
 * 用户图集：userAlbumMediaIds 非空时用 _ID IN (...)；系统图集：BUCKET_ID = albumId。
 */
class SearchMediaPagingSource(
    private val contentResolver: ContentResolver,
    private val condition: SearchCondition,
    private val userAlbumMediaIds: List<Long>?
) : PagingSource<Int, MediaItem>() {

    override suspend fun load(params: LoadParams<Int>): LoadResult<Int, MediaItem> {
        return try {
            val (selection, args) = buildSelection()
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
            val cursor = contentResolver.query(uri, projection, selection, args, sortOrder)
                ?: return LoadResult.Error(IllegalStateException("ContentResolver.query returned null"))
            try {
                val list = mutableListOf<MediaItem>()
                val idIdx = cursor.getColumnIndexOrThrow(MediaStore.Images.Media._ID)
                val dateIdx = cursor.getColumnIndexOrThrow(MediaStore.Images.Media.DATE_TAKEN)
                val mimeIdx = cursor.getColumnIndexOrThrow(MediaStore.Images.Media.MIME_TYPE)
                val nameIdx = cursor.getColumnIndexOrThrow(MediaStore.Images.Media.DISPLAY_NAME)
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
        state.anchorPosition?.let { (it / state.config.pageSize) * state.config.pageSize }

    internal fun buildSelection(): Pair<String, Array<String>> {
        val clauses = mutableListOf<String>()
        val args = mutableListOf<String>()
        condition.keyword?.takeIf { it.isNotBlank() }?.let { kw ->
            clauses.add("${MediaStore.Images.Media.DISPLAY_NAME} LIKE ?")
            args.add("%$kw%")
        }
        condition.dateFrom?.let {
            clauses.add("${MediaStore.Images.Media.DATE_TAKEN} >= ?")
            args.add(it.toString())
        }
        condition.dateTo?.let {
            clauses.add("${MediaStore.Images.Media.DATE_TAKEN} <= ?")
            args.add(it.toString())
        }
        when {
            !userAlbumMediaIds.isNullOrEmpty() -> {
                clauses.add("${MediaStore.Images.Media._ID} IN (${userAlbumMediaIds.joinToString(",") { "?" }})")
                args.addAll(userAlbumMediaIds.map { it.toString() })
            }
            condition.albumId != null -> {
                clauses.add("${MediaStore.Images.Media.BUCKET_ID} = ?")
                args.add(condition.albumId.toString())
            }
        }
        val selection = if (clauses.isEmpty()) null else clauses.joinToString(" AND ")
        return (selection ?: "1") to args.toTypedArray()
    }
}
