package com.jacky.verity.data.database

import android.content.Context
import androidx.room.Database
import androidx.room.Room
import androidx.room.RoomDatabase
import androidx.room.migration.Migration
import androidx.sqlite.db.SupportSQLiteDatabase
import com.jacky.verity.data.dao.UserAccountDao
import com.jacky.verity.data.entity.UserAccountEntity
import com.jacky.verity.algorithm.data.database.dao.WordLearningStateDao
import com.jacky.verity.algorithm.data.database.entity.WordLearningStateEntity

/**
 * Room 数据库抽象类
 * 使用单例模式确保数据库实例唯一
 */
@Database(
    entities = [
        UserAccountEntity::class,
        WordLearningStateEntity::class
    ],
    version = 1,
    exportSchema = false
)
abstract class AppDatabase : RoomDatabase() {
    
    abstract fun userAccountDao(): UserAccountDao
    abstract fun wordLearningStateDao(): WordLearningStateDao
    
    companion object {
        @Volatile
        private var INSTANCE: AppDatabase? = null
        const val DATABASE_NAME = "verity_database"
        
        /**
         * 获取数据库实例（单例）
         */
        fun getInstance(context: Context): AppDatabase {
            return INSTANCE ?: synchronized(this) {
                val instance = Room.databaseBuilder(
                    context.applicationContext,
                    AppDatabase::class.java,
                    DATABASE_NAME
                )
                    .fallbackToDestructiveMigration() // 开发阶段：数据库版本升级时清空数据
                    .build()
                INSTANCE = instance
                instance
            }
        }
        
        /**
         * 重置数据库实例（用于测试）
         */
        @Synchronized
        fun resetInstance() {
            INSTANCE = null
        }
    }
}