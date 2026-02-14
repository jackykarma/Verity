package com.jacky.verity.gallery.data.album

import android.content.ContentResolver
import android.net.Uri
import android.provider.MediaStore
import com.jacky.verity.gallery.domain.Album
import com.jacky.verity.gallery.domain.AlbumError
import com.jacky.verity.gallery.domain.AlbumRepository
import com.jacky.verity.gallery.domain.AlbumType
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.flow
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.withContext

/**
 * 合并系统 bucket（MediaStore）与用户图集（Room），实现 AlbumRepository（FEAT-002 plan A3.3）。
 */
class AlbumRepositoryImpl(
    private val albumDao: AlbumDao,
    private val contentResolver: ContentResolver
) : AlbumRepository {

    override fun getAllAlbums(): Flow<List<Album>> = flow {
        val systemAlbums = querySystemBuckets()
        albumDao.getAllUserAlbums().collect { userEntities ->
            val userAlbums = userEntities.map { entity ->
                val count = albumDao.getMediaCountByAlbumId(entity.id)
                Album(
                    id = entity.id,
                    name = entity.name,
                    type = AlbumType.User,
                    itemCount = count,
                    coverUri = null
                )
            }
            emit(mergeSystemAndUser(systemAlbums, userAlbums))
        }
    }

    override suspend fun getMediaIdsByAlbumId(albumId: Long): List<Long> =
        albumDao.getMediaIdsByAlbumId(albumId)

    override suspend fun createAlbum(name: String): Result<Album> = withContext(Dispatchers.IO) {
        val trimmed = name.trim().takeIf { it.isNotBlank() }
            ?: return@withContext Result.failure(AlbumError.CreateFailed)
        return@withContext try {
            val id = albumDao.insert(
                AlbumEntity(name = trimmed, type = "User", createdAt = System.currentTimeMillis())
            )
            Result.success(
                Album(id = id, name = trimmed, type = AlbumType.User, itemCount = 0)
            )
        } catch (e: Exception) {
            Result.failure(AlbumError.CreateFailed)
        }
    }

    override suspend fun deleteAlbum(album: Album): Result<Unit> = withContext(Dispatchers.IO) {
        if (album.type != AlbumType.User) return@withContext Result.failure(AlbumError.DeleteFailed)
        return@withContext try {
            albumDao.deleteAllMediaFromAlbum(album.id)
            albumDao.delete(album.id)
            Result.success(Unit)
        } catch (e: Exception) {
            Result.failure(AlbumError.DeleteFailed)
        }
    }

    override suspend fun addMediaToAlbum(albumId: Long, mediaIds: List<Long>): Result<Unit> =
        withContext(Dispatchers.IO) {
            if (mediaIds.isEmpty()) return@withContext Result.success(Unit)
            return@withContext try {
                mediaIds.forEach { mediaId ->
                    albumDao.addMediaToAlbum(AlbumMediaEntity(albumId, mediaId))
                }
                Result.success(Unit)
            } catch (e: Exception) {
                Result.failure(AlbumError.AddFailed)
            }
        }

    override suspend fun removeMediaFromAlbum(albumId: Long, mediaId: Long): Result<Unit> =
        withContext(Dispatchers.IO) {
            return@withContext try {
                albumDao.removeMediaFromAlbum(albumId, mediaId)
                Result.success(Unit)
            } catch (e: Exception) {
                Result.failure(AlbumError.AddFailed)
            }
        }

    private fun querySystemBuckets(): List<Album> {
        val result = mutableMapOf<Long, Pair<String, Int>>()
        try {
            val uri = MediaStore.Images.Media.EXTERNAL_CONTENT_URI
            val projection = arrayOf(
                MediaStore.Images.Media.BUCKET_ID,
                MediaStore.Images.Media.BUCKET_DISPLAY_NAME
            )
            contentResolver.query(uri, projection, null, null, null)?.use { cursor ->
                val idIdx = cursor.getColumnIndexOrThrow(MediaStore.Images.Media.BUCKET_ID)
                val nameIdx = cursor.getColumnIndexOrThrow(MediaStore.Images.Media.BUCKET_DISPLAY_NAME)
                while (cursor.moveToNext()) {
                    val bucketId = cursor.getLong(idIdx)
                    val name = cursor.getString(nameIdx) ?: ""
                    result[bucketId] = (result[bucketId]?.let { (n, c) -> n to c + 1 }
                        ?: (name to 1))
                }
            }
        } catch (_: SecurityException) {
            // EX-001: 权限拒绝，返回空
        }
        return result.map { (bucketId, pair) ->
            Album(
                id = -bucketId,
                name = pair.first,
                type = AlbumType.System,
                itemCount = pair.second,
                coverUri = null
            )
        }.sortedBy { it.name }
    }

    private fun mergeSystemAndUser(system: List<Album>, user: List<Album>): List<Album> =
        system + user
}
