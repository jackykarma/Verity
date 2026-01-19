package com.jacky.verity.data.dao

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import androidx.room.Update
import com.jacky.verity.data.entity.UserAccountEntity
import kotlinx.coroutines.flow.Flow

/**
 * 用户账户数据访问对象（DAO）
 */
@Dao
interface UserAccountDao {
    
    /**
     * 获取所有用户账户（Flow）
     */
    @Query("SELECT * FROM user_account LIMIT 1")
    fun getUserAccount(): Flow<UserAccountEntity?>
    
    /**
     * 根据用户ID获取用户账户
     */
    @Query("SELECT * FROM user_account WHERE userId = :userId LIMIT 1")
    suspend fun getUserAccountById(userId: String): UserAccountEntity?
    
    /**
     * 插入用户账户
     */
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertUserAccount(account: UserAccountEntity)
    
    /**
     * 更新用户最后活跃时间
     */
    @Update
    suspend fun updateUserAccount(account: UserAccountEntity)
    
    /**
     * 更新用户最后活跃时间
     */
    @Query("UPDATE user_account SET lastActiveAt = :timestamp WHERE userId = :userId")
    suspend fun updateLastActiveAt(userId: String, timestamp: Long)
}