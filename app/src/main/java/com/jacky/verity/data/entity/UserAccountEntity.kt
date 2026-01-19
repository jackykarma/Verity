package com.jacky.verity.data.entity

import androidx.room.Entity
import androidx.room.PrimaryKey

/**
 * 用户账户实体
 */
@Entity(tableName = "user_account")
data class UserAccountEntity(
    @PrimaryKey
    val userId: String,
    val createdAt: Long,
    val lastActiveAt: Long
)