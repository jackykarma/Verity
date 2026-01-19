package com.jacky.verity.data.error

/**
 * Result 类型封装类，用于表示操作的成功或失败
 */
sealed class Result<out T, out E> {
    data class Success<out T>(val data: T) : Result<T, Nothing>()
    data class Error<out E>(val error: E) : Result<Nothing, E>()
    
    inline fun <R> map(transform: (T) -> R): Result<R, E> {
        return when (this) {
            is Success -> Success(transform(data))
            is Error -> this
        }
    }
    
    inline fun <R> mapError(transform: (E) -> R): Result<T, R> {
        return when (this) {
            is Success -> this
            is Error -> Error(transform(error))
        }
    }
    
    inline fun <R> flatMap(transform: (T) -> Result<R, E>): Result<R, E> {
        return when (this) {
            is Success -> transform(data)
            is Error -> this
        }
    }
    
    inline fun fold(onSuccess: (T) -> Unit, onError: (E) -> Unit) {
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
    
    fun getErrorOrNull(): E? = when (this) {
        is Success -> null
        is Error -> error
    }
}