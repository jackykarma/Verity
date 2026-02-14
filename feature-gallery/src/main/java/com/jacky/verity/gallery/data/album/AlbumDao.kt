package com.jacky.verity.gallery.data.album

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import kotlinx.coroutines.flow.Flow

/**
 * 用户图集 Room DAO（FEAT-002 plan B7）。
 */
@Dao
interface AlbumDao {
    @Query("SELECT * FROM album ORDER BY createdAt DESC")
    fun getAllUserAlbums(): Flow<List<AlbumEntity>>

    @Query("SELECT COUNT(*) FROM album_media WHERE albumId = :albumId")
    suspend fun getMediaCountByAlbumId(albumId: Long): Int

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insert(album: AlbumEntity): Long

    @Query("DELETE FROM album WHERE id = :albumId")
    suspend fun delete(albumId: Long)

    @Insert(onConflict = OnConflictStrategy.IGNORE)
    suspend fun addMediaToAlbum(entity: AlbumMediaEntity)

    @Query("DELETE FROM album_media WHERE albumId = :albumId AND mediaId = :mediaId")
    suspend fun removeMediaFromAlbum(albumId: Long, mediaId: Long)

    @Query("DELETE FROM album_media WHERE albumId = :albumId")
    suspend fun deleteAllMediaFromAlbum(albumId: Long)

    @Query("SELECT mediaId FROM album_media WHERE albumId = :albumId")
    suspend fun getMediaIdsByAlbumId(albumId: Long): List<Long>
}
