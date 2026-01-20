package com.jacky.verity.library.ui

import android.content.Context
import android.net.Uri
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.jacky.verity.library.data.datasource.LibraryLocalDataSource
import com.jacky.verity.library.data.repository.LibraryRepository
import com.jacky.verity.library.domain.model.LibraryError
import com.jacky.verity.library.domain.model.Result
import com.jacky.verity.library.domain.model.WordLibrary
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch

/**
 * 词库管理界面状态
 */
data class LibraryUiState(
    val libraries: List<WordLibrary> = emptyList(),
    val selectedLibraryId: String? = null,
    val isLoading: Boolean = false,
    val isImporting: Boolean = false,
    val error: String? = null,
    val importSuccess: Boolean = false
)

/**
 * 词库管理ViewModel
 */
class LibraryViewModel(
    private val repository: LibraryRepository
) : ViewModel() {
    
    private val _uiState = MutableStateFlow(LibraryUiState())
    val uiState: StateFlow<LibraryUiState> = _uiState.asStateFlow()
    
    init {
        loadLibraries()
    }
    
    /**
     * 加载词库列表
     */
    fun loadLibraries() {
        viewModelScope.launch {
            _uiState.update { it.copy(isLoading = true, error = null) }
            
            when (val result = repository.getAllLibraries()) {
                is Result.Success -> {
                    val selectedId = result.data.find { it.isSelected }?.id
                    _uiState.update { 
                        it.copy(
                            libraries = result.data,
                            selectedLibraryId = selectedId,
                            isLoading = false
                        )
                    }
                }
                is Result.Error -> {
                    _uiState.update { 
                        it.copy(
                            isLoading = false,
                            error = getErrorMessage(result.error)
                        )
                    }
                }
            }
        }
    }
    
    /**
     * 导入词库
     */
    fun importLibrary(uri: Uri, fileName: String) {
        viewModelScope.launch {
            _uiState.update { it.copy(isImporting = true, error = null, importSuccess = false) }
            
            when (val result = repository.importLibrary(uri, fileName)) {
                is Result.Success -> {
                    _uiState.update { it.copy(isImporting = false, importSuccess = true) }
                    loadLibraries() // 刷新列表
                }
                is Result.Error -> {
                    _uiState.update { 
                        it.copy(
                            isImporting = false,
                            error = getErrorMessage(result.error)
                        )
                    }
                }
            }
        }
    }
    
    /**
     * 选择词库
     */
    fun selectLibrary(libraryId: String) {
        viewModelScope.launch {
            when (val result = repository.selectLibrary(libraryId)) {
                is Result.Success -> {
                    _uiState.update { state ->
                        state.copy(
                            selectedLibraryId = libraryId,
                            libraries = state.libraries.map { lib ->
                                lib.copy(isSelected = lib.id == libraryId)
                            }
                        )
                    }
                }
                is Result.Error -> {
                    _uiState.update { 
                        it.copy(error = getErrorMessage(result.error))
                    }
                }
            }
        }
    }
    
    /**
     * 删除词库
     */
    fun deleteLibrary(libraryId: String) {
        viewModelScope.launch {
            when (val result = repository.deleteLibrary(libraryId)) {
                is Result.Success -> {
                    loadLibraries() // 刷新列表
                }
                is Result.Error -> {
                    _uiState.update { 
                        it.copy(error = getErrorMessage(result.error))
                    }
                }
            }
        }
    }
    
    /**
     * 清除错误
     */
    fun clearError() {
        _uiState.update { it.copy(error = null) }
    }
    
    /**
     * 清除导入成功状态
     */
    fun clearImportSuccess() {
        _uiState.update { it.copy(importSuccess = false) }
    }
    
    private fun getErrorMessage(error: LibraryError): String {
        return when (error) {
            is LibraryError.FileReadFailed -> "文件读取失败：${error.cause}"
            is LibraryError.ParseFailed -> "解析失败：${error.cause}"
            is LibraryError.UnsupportedFormat -> "不支持的格式：${error.format}"
            is LibraryError.FileAlreadyExists -> "词库已存在：${error.fileName}"
            is LibraryError.Unknown -> "未知错误：${error.cause?.message ?: "请重试"}"
            LibraryError.FileSelectionCancelled -> "文件选择已取消"
            LibraryError.InsufficientStorage -> "存储空间不足"
            LibraryError.PermissionDenied -> "权限不足，请授予文件访问权限"
        }
    }
}
