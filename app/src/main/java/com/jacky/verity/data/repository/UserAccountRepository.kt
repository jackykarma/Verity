package com.jacky.verity.data.repository

import com.jacky.verity.data.dao.UserAccountDao
import com.jacky.verity.data.error.DatabaseError
import com.jacky.verity.data.error.Result
import com.jacky.verity.data.entity.UserAccountEntity
import com.jacky.verity.data.util.Logger
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.catch
import kotlinx.coroutines.flow.flowOn
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.withContext
import java.util.UUID

/**
 * 用户账户仓库实现
 */
class UserAccountRepository(
    private val userAccountDao: UserAccountDao
) {
    
    /**
     * 获取当前用户账户（Flow）
     */
    fun getCurrentUserAccount(): Flow<Result<UserAccountEntity, DatabaseError>> {
        return userAccountDao.getUserAccount()
            .map<UserAccountEntity?, Result<UserAccountEntity, DatabaseError>> { account ->
                if (account != null) {
                    Result.Success(account)
                } else {
                    Result.Error(DatabaseError.DataNotFound)
                }
            }
            .catch { e ->
                Logger.logDatabaseError("getCurrentUserAccount", "Failed to get user account: ${e.message}", e)
                emit(Result.Error(DatabaseError.Unknown(e)))
            }
            .flowOn(Dispatchers.IO)
    }
    
    /**
     * 根据用户ID获取用户账户
     */
    suspend fun getUserAccountById(userId: String): Result<UserAccountEntity, DatabaseError> = withContext(Dispatchers.IO) {
        try {
            val account = userAccountDao.getUserAccountById(userId)
            if (account != null) {
                Result.Success(account)
            } else {
                Result.Error(DatabaseError.DataNotFound)
            }
        } catch (e: Exception) {
            Logger.logDatabaseError("getUserAccountById", "Failed to get user account: ${e.message}", e)
            Result.Error(DatabaseError.Unknown(e))
        }
    }
    
    /**
     * 创建用户账户
     */
    suspend fun createUserAccount(): Result<UserAccountEntity, DatabaseError> = withContext(Dispatchers.IO) {
        try {
            val userId = UUID.randomUUID().toString()
            val now = System.currentTimeMillis()
            val account = UserAccountEntity(
                userId = userId,
                createdAt = now,
                lastActiveAt = now
            )
            
            userAccountDao.insertUserAccount(account)
            Logger.logDatabaseOperation("createUserAccount", null, success = true)
            
            Result.Success(account)
        } catch (e: Exception) {
            Logger.logDatabaseError("createUserAccount", "Failed to create user account: ${e.message}", e)
            Result.Error(DatabaseError.WriteFailed(e))
        }
    }
    
    /**
     * 更新用户最后活跃时间
     */
    suspend fun updateLastActiveAt(userId: String): Result<Unit, DatabaseError> = withContext(Dispatchers.IO) {
        try {
            val timestamp = System.currentTimeMillis()
            userAccountDao.updateLastActiveAt(userId, timestamp)
            Logger.logDatabaseOperation("updateLastActiveAt", null, success = true)
            Result.Success(Unit)
        } catch (e: Exception) {
            Logger.logDatabaseError("updateLastActiveAt", "Failed to update last active time: ${e.message}", e)
            Result.Error(DatabaseError.WriteFailed(e))
        }
    }
}