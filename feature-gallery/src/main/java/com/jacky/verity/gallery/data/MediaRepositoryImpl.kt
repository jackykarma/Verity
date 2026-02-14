package com.jacky.verity.gallery.data

import androidx.paging.PagingConfig
import androidx.paging.PagingData
import androidx.paging.cachedIn
import com.jacky.verity.gallery.domain.FilterCondition
import com.jacky.verity.gallery.domain.MediaItem
import com.jacky.verity.gallery.data.album.AlbumDao
import com.jacky.verity.gallery.domain.MediaRepository
import com.jacky.verity.gallery.domain.MediaTypeFilter
import com.jacky.verity.gallery.domain.TimelineViewMode
import com.jacky.verity.gallery.search.SearchCondition
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.flow
import kotlinx.coroutines.withContext

/**
 * MediaRepository 实现（plan A3.3 / story_detail_design ST-001）。
 * 组合 MediaStoreDataSource，使用 Paging 3 返回 Flow<PagingData<MediaItem>>。
 * search() 支持用户图集：通过 albumDao.getMediaIdsByAlbumId 解析 _ID IN。
 */
class MediaRepositoryImpl(
    private val contentResolver: android.content.ContentResolver,
    private val scope: CoroutineScope,
    private val albumDao: AlbumDao? = null
) : MediaRepository {

    override fun getMediaPager(
        viewMode: TimelineViewMode,
        filter: FilterCondition?
    ): Flow<PagingData<MediaItem>> {
        val effectiveFilter = filter ?: FilterCondition()
        val factory = {
            MediaStoreDataSource(contentResolver, viewMode, effectiveFilter)
        }
        return androidx.paging.Pager(
            config = PagingConfig(
                pageSize = 60,
                prefetchDistance = 30,
                enablePlaceholders = true,
                initialLoadSize = 60,
                maxSize = (60 + 30) * 5,
                jumpThreshold = 120
            ),
            pagingSourceFactory = factory
        ).flow.cachedIn(scope)
    }

    override fun search(condition: SearchCondition): Flow<PagingData<MediaItem>> = flow {
        val userAlbumMediaIds = withContext(Dispatchers.IO) {
            condition.albumId?.let { id -> albumDao?.getMediaIdsByAlbumId(id) }?.takeIf { it.isNotEmpty() }
        }
        androidx.paging.Pager(
            config = PagingConfig(pageSize = 60, enablePlaceholders = true),
            pagingSourceFactory = {
                SearchMediaPagingSource(contentResolver, condition, userAlbumMediaIds)
            }
        ).flow.cachedIn(scope).collect { emit(it) }
    }

    override fun getMediaPagerByAlbum(
        albumId: Long,
        mediaTypeFilter: MediaTypeFilter
    ): Flow<PagingData<MediaItem>> {
        return androidx.paging.Pager(
            config = PagingConfig(
                pageSize = 60,
                prefetchDistance = 30,
                enablePlaceholders = true,
                initialLoadSize = 60
            ),
            pagingSourceFactory = {
                AlbumMediaPagingSource(
                    albumId,
                    albumDao ?: throw IllegalStateException("AlbumDao required for getMediaPagerByAlbum"),
                    contentResolver,
                    mediaTypeFilter
                )
            }
        ).flow.cachedIn(scope)
    }
}
