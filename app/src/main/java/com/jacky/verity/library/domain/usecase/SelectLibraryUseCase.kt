package com.jacky.verity.library.domain.usecase

import com.jacky.verity.library.data.repository.LibraryRepository
import com.jacky.verity.library.domain.model.Result

/**
 * 选择词库用例
 */
class SelectLibraryUseCase(
    private val repository: LibraryRepository
) {
    suspend operator fun invoke(libraryId: String): Result<Unit> {
        return repository.selectLibrary(libraryId)
    }
}