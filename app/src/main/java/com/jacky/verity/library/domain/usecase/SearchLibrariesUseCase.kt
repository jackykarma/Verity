package com.jacky.verity.library.domain.usecase

import com.jacky.verity.library.data.repository.LibraryRepository
import com.jacky.verity.library.domain.model.Result
import com.jacky.verity.library.domain.model.WordLibrary

/**
 * 搜索词库用例
 */
class SearchLibrariesUseCase(
    private val repository: LibraryRepository
) {
    suspend operator fun invoke(query: String): Result<List<WordLibrary>> {
        return repository.searchLibraries(query)
    }
}