package com.jacky.verity.domain.usecase

import com.jacky.verity.data.entity.UserAccountEntity
import com.jacky.verity.data.error.DatabaseError
import com.jacky.verity.data.error.Result
import com.jacky.verity.data.repository.UserAccountRepository
import kotlinx.coroutines.flow.first

/**
 * 获取或创建用户账户用例
 * 业务逻辑：如果用户账户不存在，则创建新账户；否则返回现有账户
 */
class GetOrCreateUserAccountUseCase(
    private val userAccountRepository: UserAccountRepository
) {
    
    /**
     * 执行：获取或创建用户账户
     */
    suspend operator fun invoke(): Result<UserAccountEntity, DatabaseError> {
        // 先尝试获取现有账户
        val existingAccountResult = userAccountRepository.getCurrentUserAccount().first()
        
        return when (existingAccountResult) {
            is Result.Success -> {
                // 账户已存在，返回现有账户
                existingAccountResult
            }
            is Result.Error -> {
                // 账户不存在，创建新账户
                when (existingAccountResult.error) {
                    is DatabaseError.DataNotFound -> {
                        userAccountRepository.createUserAccount()
                    }
                    else -> {
                        // 其他错误，返回错误
                        existingAccountResult
                    }
                }
            }
        }
    }
}