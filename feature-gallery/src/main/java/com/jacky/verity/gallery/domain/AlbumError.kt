package com.jacky.verity.gallery.domain

/**
 * 图集操作失败类型（FEAT-002 plan 异常矩阵 EX-002、EX-003）。
 * 继承 Throwable 以便 Result.failure(error) 使用。
 */
sealed class AlbumError(message: String) : Throwable(message) {
    object CreateFailed : AlbumError("CreateFailed")
    object AddFailed : AlbumError("AddFailed")
    object DeleteFailed : AlbumError("DeleteFailed")
}
