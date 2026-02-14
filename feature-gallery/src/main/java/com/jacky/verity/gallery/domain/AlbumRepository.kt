package com.jacky.verity.gallery.domain

import kotlinx.coroutines.flow.Flow

/**
 * 图集 CRUD 抽象（FEAT-002 plan B4.1）。
 * 供 AlbumListViewModel、AlbumDetailViewModel、FEAT-003 图集维度条件使用。
 */
interface AlbumRepository {
    fun getAllAlbums(): Flow<List<Album>>
    suspend fun getMediaIdsByAlbumId(albumId: Long): List<Long>
    suspend fun createAlbum(name: String): Result<Album>
    suspend fun deleteAlbum(album: Album): Result<Unit>
    suspend fun addMediaToAlbum(albumId: Long, mediaIds: List<Long>): Result<Unit>
    suspend fun removeMediaFromAlbum(albumId: Long, mediaId: Long): Result<Unit>
}
