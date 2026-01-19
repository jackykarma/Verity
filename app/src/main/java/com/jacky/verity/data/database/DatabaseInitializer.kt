package com.jacky.verity.data.database

import android.content.Context
import com.jacky.verity.data.util.Logger
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

/**
 * 数据库初始化器
 * 负责在应用启动时初始化数据库
 */
object DatabaseInitializer {
    
    /**
     * 初始化数据库
     * @return 初始化耗时（毫秒）
     */
    suspend fun initialize(context: Context): Long = withContext(Dispatchers.IO) {
        val startTime = System.currentTimeMillis()
        try {
            // 获取数据库实例（会自动创建数据库文件）
            val database = AppDatabase.getInstance(context)
            
            // 验证数据库连接
            database.openHelper.readableDatabase.use { db ->
                // 执行简单查询以验证数据库连接
                db.query("SELECT 1").use { cursor ->
                    cursor.moveToFirst()
                }
            }
            
            val duration = System.currentTimeMillis() - startTime
            Logger.logDatabaseOperation("initialize", duration, success = true)
            Logger.logPerformance("database_initialization", duration)
            
            duration
        } catch (e: Exception) {
            val duration = System.currentTimeMillis() - startTime
            Logger.logDatabaseError("initialize", "Failed to initialize database: ${e.message}", e)
            throw e
        }
    }
    
    /**
     * 检查数据库是否存在
     */
    fun isDatabaseExists(context: Context): Boolean {
        val dbFile = context.getDatabasePath("verity_database")
        return dbFile.exists()
    }
}