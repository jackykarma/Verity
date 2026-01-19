package com.jacky.verity.library.domain.model

/**
 * Result 类型封装类（词库管理专用）
 */
sealed class Result<out T> {
    data class Success<out T>(val data: T) : Result<T>()
    data class Error(val error: LibraryError) : Result<Nothing>()
    
    inline fun <R> map(transform: (T) -> R): Result<R> {
        return when (this) {
            is Success -> Success(transform(data))
            is Error -> this
        }
    }
    
    inline fun <R> flatMap(transform: (T) -> Result<R>): Result<R> {
        return when (this) {
            is Success -> transform(data)
            is Error -> this
        }
    }
    
    inline fun fold(onSuccess: (T) -> Unit, onError: (LibraryError) -> Unit) {
        when (this) {
            is Success -> onSuccess(data)
            is Error -> onError(error)
        }
    }
    
    fun isSuccess(): Boolean = this is Success
    fun isError(): Boolean = this is Error
    
    fun getOrNull(): T? = when (this) {
        is Success -> data
        is Error -> null
    }
}