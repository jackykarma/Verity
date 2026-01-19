package com.jacky.verity.library.data.repository

import android.content.Context
import android.net.Uri
import com.jacky.verity.library.data.datasource.LibraryLocalDataSource
import com.jacky.verity.library.data.parser.LibraryParserFactory
import com.jacky.verity.library.domain.model.LibraryFormat
import com.jacky.verity.library.domain.model.Result
import com.jacky.verity.library.domain.model.WordLibrary
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.flow
import kotlinx.coroutines.flow.flowOn
import kotlinx.coroutines.withContext
import java.io.File
import java.util.UUID

/**
 * 词库仓库实现
 */
class LibraryRepository(
    private val dataSource: LibraryLocalDataSource,
    private val context: Context
) {
    
    /**
     * 获取所有词库
     */
    suspend fun getAllLibraries(): Result<List<WordLibrary>> = withContext(Dispatchers.IO) {
        try {
            val metadataList = dataSource.getAllLibraries()
            val selectedId = dataSource.getSelectedLibraryId()
            val libraries = metadataList.map { metadata ->
                val library = metadata.toWordLibrary()
                library.copy(isSelected = library.id == selectedId)
            }
            Result.Success(libraries)
        } catch (e: Exception) {
            Result.Error(com.jacky.verity.library.domain.model.LibraryError.Unknown(e))
        }
    }
    
    /**
     * 导入词库文件
     */
    suspend fun importLibrary(uri: Uri, fileName: String): Result<WordLibrary> = withContext(Dispatchers.IO) {
        try {
            // 1. 检测文件格式
            val format = detectFormat(fileName) ?: return@withContext Result.Error(
                com.jacky.verity.library.domain.model.LibraryError.UnsupportedFormat(
                    fileName.substringAfterLast(".")
                )
            )
            
            // 2. 解析文件
            val parser = LibraryParserFactory.createParser(format)
            context.contentResolver.openInputStream(uri)?.use { inputStream ->
                val parseResult = parser.parse(inputStream, fileName)
                when (parseResult) {
                    is Result.Success -> {
                        // 3. 保存文件到应用私有目录
                        val saveResult = dataSource.saveLibraryFile(uri, fileName)
                        saveResult.fold(
                            onSuccess = { file ->
                                // 4. 创建词库实体
                                val library = WordLibrary(
                                    id = UUID.randomUUID().toString(),
                                    name = parseResult.data.libraryName,
                                    wordCount = parseResult.data.wordCount,
                                    createdAt = System.currentTimeMillis(),
                                    filePath = file.absolutePath,
                                    fileSize = file.length(),
                                    format = format,
                                    isSelected = false
                                )
                                
                                // 5. 检查是否重复导入
                                val existingLibraries = dataSource.getAllLibraries()
                                val fingerprint = library.generateFingerprint()
                                val isDuplicate = existingLibraries.any { 
                                    it.generateFingerprint() == fingerprint 
                                }
                                
                                if (isDuplicate) {
                                    file.delete()
                                    Result.Error(
                                        com.jacky.verity.library.domain.model.LibraryError.FileAlreadyExists(fileName)
                                    )
                                } else {
                                    // 6. 保存元数据
                                    val metadata = com.jacky.verity.library.domain.model.LibraryMetadata.fromWordLibrary(library)
                                    dataSource.addLibrary(metadata)
                                    Result.Success(library)
                                }
                            },
                            onFailure = { e ->
                                Result.Error(
                                    com.jacky.verity.library.domain.model.LibraryError.FileReadFailed(e.message ?: "Unknown error")
                                )
                            }
                        )
                    }
                    is Result.Error -> parseResult
                }
            } ?: Result.Error(
                com.jacky.verity.library.domain.model.LibraryError.FileReadFailed("Failed to open file")
            )
        } catch (e: Exception) {
            Result.Error(com.jacky.verity.library.domain.model.LibraryError.Unknown(e))
        }
    }
    
    /**
     * 选择词库
     */
    suspend fun selectLibrary(libraryId: String): Result<Unit> = withContext(Dispatchers.IO) {
        try {
            dataSource.setSelectedLibraryId(libraryId)
            Result.Success(Unit)
        } catch (e: Exception) {
            Result.Error(com.jacky.verity.library.domain.model.LibraryError.Unknown(e))
        }
    }
    
    /**
     * 删除词库
     */
    suspend fun deleteLibrary(libraryId: String): Result<Unit> = withContext(Dispatchers.IO) {
        try {
            val libraries = dataSource.getAllLibraries()
            val library = libraries.find { it.id == libraryId }
            if (library != null) {
                // 删除文件
                dataSource.deleteLibraryFile(library.filePath)
                // 删除元数据
                dataSource.deleteLibrary(libraryId)
                // 如果删除的是选中的词库，清除选中状态
                val selectedId = dataSource.getSelectedLibraryId()
                if (selectedId == libraryId) {
                    dataSource.setSelectedLibraryId(null)
                }
                Result.Success(Unit)
            } else {
                Result.Error(
                    com.jacky.verity.library.domain.model.LibraryError.Unknown(
                        Exception("Library not found")
                    )
                )
            }
        } catch (e: Exception) {
            Result.Error(com.jacky.verity.library.domain.model.LibraryError.Unknown(e))
        }
    }
    
    /**
     * 搜索词库
     */
    suspend fun searchLibraries(query: String): Result<List<WordLibrary>> = withContext(Dispatchers.IO) {
        try {
            val allLibraries = getAllLibraries()
            when (allLibraries) {
                is Result.Success -> {
                    val filtered = allLibraries.data.filter { 
                        it.name.contains(query, ignoreCase = true) 
                    }
                    Result.Success(filtered)
                }
                is Result.Error -> allLibraries
            }
        } catch (e: Exception) {
            Result.Error(com.jacky.verity.library.domain.model.LibraryError.Unknown(e))
        }
    }
    
    /**
     * 检测文件格式
     */
    private fun detectFormat(fileName: String): LibraryFormat? {
        val extension = fileName.substringAfterLast(".", "")
        return LibraryFormat.fromExtension(extension)
    }
}