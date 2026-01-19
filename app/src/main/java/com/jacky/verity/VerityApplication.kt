package com.jacky.verity

import android.app.Application
import com.jacky.verity.data.database.AppDatabase
import com.jacky.verity.data.database.DatabaseInitializer
import com.jacky.verity.data.repository.UserAccountRepository
import com.jacky.verity.domain.usecase.GetOrCreateUserAccountUseCase
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.launch

class VerityApplication : Application() {
    
    // 应用级别的协程作用域
    private val applicationScope = CoroutineScope(SupervisorJob() + Dispatchers.Default)
    
    // 依赖注入容器（简化版，实际项目应使用Hilt/Koin等）
    val database by lazy { AppDatabase.getInstance(this) }
    val userAccountDao by lazy { database.userAccountDao() }
    val userAccountRepository by lazy { UserAccountRepository(userAccountDao) }
    val getOrCreateUserAccountUseCase by lazy { GetOrCreateUserAccountUseCase(userAccountRepository) }
    
    override fun onCreate() {
        super.onCreate()
        
        // 在后台初始化数据库和用户账户
        applicationScope.launch {
            try {
                // 初始化数据库
                val duration = DatabaseInitializer.initialize(this@VerityApplication)
                
                // 确保用户账户存在
                getOrCreateUserAccountUseCase().fold(
                    onSuccess = { account ->
                        android.util.Log.d(TAG, "User account initialized: ${account.userId}")
                    },
                    onError = { error ->
                        android.util.Log.e(TAG, "Failed to initialize user account: ${error.message}")
                    }
                )
            } catch (e: Exception) {
                android.util.Log.e(TAG, "Failed to initialize application", e)
            }
        }
    }
    
    companion object {
        private const val TAG = "VerityApplication"
    }
}