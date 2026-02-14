package com.jacky.verity.gallery.data.album

import androidx.room.Entity
import androidx.room.ForeignKey
import androidx.room.Index

/**
 * 图集-媒体项关联表（FEAT-002 plan B3.2）。
 */
@Entity(
    tableName = "album_media",
    primaryKeys = ["albumId", "mediaId"],
    foreignKeys = [
        ForeignKey(
            entity = AlbumEntity::class,
            parentColumns = ["id"],
            childColumns = ["albumId"],
            onDelete = ForeignKey.CASCADE
        )
    ],
    indices = [Index("albumId"), Index("mediaId")]
)
data class AlbumMediaEntity(
    val albumId: Long,
    val mediaId: Long
)
