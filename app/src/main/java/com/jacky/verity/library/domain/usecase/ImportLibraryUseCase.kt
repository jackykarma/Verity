package com.jacky.verity.library.domain.usecase

import android.net.Uri
import com.jacky.verity.library.data.repository.LibraryRepository
import com.jacky.verity.library.domain.model.Result
import com.jacky.verity.library.domain.model.WordLibrary

/**
 * 导入词库用例
 */
class ImportLibraryUseCase(
    private val repository: LibraryRepository
) {
    suspend operator fun invoke(uri: Uri, fileName: String): Result<WordLibrary> {
        return repository.importLibrary(uri, fileName)
    }
}