package com.jacky.verity.gallery.data.album

import androidx.room.Entity
import androidx.room.PrimaryKey

/**
 * 用户图集 Room 实体（FEAT-002 plan B3.2）。
 */
@Entity(tableName = "album")
data class AlbumEntity(
    @PrimaryKey(autoGenerate = true)
    val id: Long = 0,
    val name: String,
    val type: String = "User",
    val createdAt: Long = System.currentTimeMillis()
)
