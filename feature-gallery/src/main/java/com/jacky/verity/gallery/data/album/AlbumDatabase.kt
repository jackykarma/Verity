package com.jacky.verity.gallery.data.album

import android.content.Context
import androidx.room.Database
import androidx.room.Room
import androidx.room.RoomDatabase

/**
 * 用户图集 Room 数据库（FEAT-002 plan B7）。
 * v1 初版；后续 schema 变更需 Migration。
 */
@Database(
    entities = [AlbumEntity::class, AlbumMediaEntity::class],
    version = 1,
    exportSchema = false
)
abstract class AlbumDatabase : RoomDatabase() {
    abstract fun albumDao(): AlbumDao

    companion object {
        private const val DB_NAME = "verity_album.db"

        fun create(context: Context): AlbumDatabase =
            Room.databaseBuilder(context, AlbumDatabase::class.java, DB_NAME)
                .fallbackToDestructiveMigration()
                .build()
    }
}
