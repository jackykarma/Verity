package com.jacky.verity.library.domain.usecase

import com.jacky.verity.library.data.repository.LibraryRepository
import com.jacky.verity.library.domain.model.Result
import com.jacky.verity.library.domain.model.WordLibrary

/**
 * 获取词库列表用例
 */
class GetLibrariesUseCase(
    private val repository: LibraryRepository
) {
    suspend operator fun invoke(): Result<List<WordLibrary>> {
        return repository.getAllLibraries()
    }
}