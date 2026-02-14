package com.jacky.verity.gallery.domain

import com.jacky.verity.gallery.search.SearchCondition
import androidx.paging.PagingData
import kotlinx.coroutines.flow.Flow

/**
 * 媒体库查询抽象（来自 FEAT-001，FEAT-003 扩展 search）。
 */
interface MediaRepository {
    /** 时间轴分页（FEAT-001）。 */
    fun getMediaPager(
        viewMode: TimelineViewMode,
        filter: FilterCondition?
    ): Flow<PagingData<MediaItem>>

    /** 按条件搜索，返回分页结果（FEAT-003）。 */
    fun search(condition: SearchCondition): Flow<PagingData<MediaItem>>

    /** 图集内分页（FEAT-002）：按 albumId 与媒体类型筛选。 */
    fun getMediaPagerByAlbum(
        albumId: Long,
        mediaTypeFilter: MediaTypeFilter
    ): Flow<PagingData<MediaItem>>
}
