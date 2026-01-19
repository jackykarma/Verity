package com.jacky.verity.library.data.datasource

import android.content.Context
import android.content.SharedPreferences
import com.jacky.verity.library.domain.model.LibraryMetadata
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import kotlinx.serialization.Serializable
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json
import kotlinx.serialization.decodeFromString
import java.io.File

/**
 * 词库本地数据源
 * 负责SharedPreferences和文件系统的读写操作
 */
class LibraryLocalDataSource(
    private val context: Context
) {
    companion object {
        private const val PREFS_NAME = "word_library_prefs"
        private const val KEY_LIBRARIES = "libraries"
        private const val KEY_SELECTED_LIBRARY_ID = "selected_library_id"
        private const val LIBRARY_DIR = "libraries"
    }
    
    private val prefs: SharedPreferences by lazy {
        context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
    }
    
    private val json = Json {
        ignoreUnknownKeys = true
        encodeDefaults = true
    }
    
    /**
     * 获取所有词库元数据
     */
    suspend fun getAllLibraries(): List<LibraryMetadata> = withContext(Dispatchers.IO) {
        val librariesJson = prefs.getString(KEY_LIBRARIES, null) ?: return@withContext emptyList()
        try {
            json.decodeFromString<List<LibraryMetadata>>(librariesJson)
        } catch (e: Exception) {
            emptyList()
        }
    }
    
    /**
     * 保存词库列表
     */
    suspend fun saveLibraries(libraries: List<LibraryMetadata>) = withContext(Dispatchers.IO) {
        val librariesJson = json.encodeToString(libraries)
        prefs.edit().putString(KEY_LIBRARIES, librariesJson).apply()
    }
    
    /**
     * 添加词库
     */
    suspend fun addLibrary(library: LibraryMetadata) = withContext(Dispatchers.IO) {
        val libraries = getAllLibraries().toMutableList()
        libraries.add(library)
        saveLibraries(libraries)
    }
    
    /**
     * 更新词库
     */
    suspend fun updateLibrary(library: LibraryMetadata) = withContext(Dispatchers.IO) {
        val libraries = getAllLibraries().toMutableList()
        val index = libraries.indexOfFirst { it.id == library.id }
        if (index >= 0) {
            libraries[index] = library
            saveLibraries(libraries)
        }
    }
    
    /**
     * 删除词库
     */
    suspend fun deleteLibrary(libraryId: String) = withContext(Dispatchers.IO) {
        val libraries = getAllLibraries().toMutableList()
        libraries.removeAll { it.id == libraryId }
        saveLibraries(libraries)
    }
    
    /**
     * 获取选中的词库ID
     */
    suspend fun getSelectedLibraryId(): String? = withContext(Dispatchers.IO) {
        prefs.getString(KEY_SELECTED_LIBRARY_ID, null)
    }
    
    /**
     * 设置选中的词库ID
     */
    suspend fun setSelectedLibraryId(libraryId: String?) = withContext(Dispatchers.IO) {
        prefs.edit().putString(KEY_SELECTED_LIBRARY_ID, libraryId).apply()
    }
    
    /**
     * 获取词库文件存储目录
     */
    fun getLibraryDirectory(): File {
        val dir = File(context.filesDir, LIBRARY_DIR)
        if (!dir.exists()) {
            dir.mkdirs()
        }
        return dir
    }
    
    /**
     * 保存词库文件到应用私有目录
     */
    suspend fun saveLibraryFile(sourceUri: android.net.Uri, fileName: String): Result<File> = withContext(Dispatchers.IO) {
        try {
            val libraryDir = getLibraryDirectory()
            val targetFile = File(libraryDir, fileName)
            
            context.contentResolver.openInputStream(sourceUri)?.use { input ->
                targetFile.outputStream().use { output ->
                    input.copyTo(output)
                }
            } ?: return@withContext Result.failure(Exception("Failed to open input stream"))
            
            Result.success(targetFile)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    /**
     * 删除词库文件
     */
    suspend fun deleteLibraryFile(filePath: String) = withContext(Dispatchers.IO) {
        try {
            val file = File(filePath)
            if (file.exists()) {
                file.delete()
            }
        } catch (e: Exception) {
            // 忽略删除错误
        }
    }
    
    /**
     * 检查文件是否存在
     */
    suspend fun fileExists(filePath: String): Boolean = withContext(Dispatchers.IO) {
        File(filePath).exists()
    }
}