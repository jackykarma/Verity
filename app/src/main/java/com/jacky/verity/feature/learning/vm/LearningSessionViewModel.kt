package com.jacky.verity.feature.learning.vm

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.jacky.verity.algorithm.api.SpacedRepetitionEngine
import com.jacky.verity.algorithm.data.repository.AlgorithmResult
import com.jacky.verity.feature.learning.data.model.SessionType
import com.jacky.verity.feature.learning.data.model.StudyTask
import com.jacky.verity.feature.learning.data.model.WordCardModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

/**
 * 学习会话UI状态
 */
data class LearningSessionUiState(
    val currentWordCard: WordCardModel? = null,
    val isLoading: Boolean = false,
    val error: String? = null,
    val taskList: List<String> = emptyList(),
    val currentIndex: Int = 0
)

/**
 * 学习会话ViewModel
 */
class LearningSessionViewModel(
    private val algorithmEngine: SpacedRepetitionEngine,
    private val wordRepository: WordRepository
) : ViewModel() {
    
    private val _uiState = MutableStateFlow(LearningSessionUiState())
    val uiState: StateFlow<LearningSessionUiState> = _uiState.asStateFlow()
    
    /**
     * 开始学习会话
     */
    fun startSession(sessionType: SessionType) {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, error = null)
            
            // 获取学习任务列表
            val taskListResult = algorithmEngine.getLearningTaskList(limit = 20)
            taskListResult.fold(
                onSuccess = { taskList ->
                    if (taskList.isNotEmpty()) {
                        _uiState.value = _uiState.value.copy(
                            taskList = taskList,
                            currentIndex = 0,
                            isLoading = false
                        )
                        loadCurrentWord()
                    } else {
                        _uiState.value = _uiState.value.copy(
                            isLoading = false,
                            error = "没有可学习的单词"
                        )
                    }
                },
                onFailure = { error ->
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        error = error.message
                    )
                }
            )
        }
    }
    
    /**
     * 加载当前单词卡片
     */
    private fun loadCurrentWord() {
        val currentState = _uiState.value
        if (currentState.currentIndex < currentState.taskList.size) {
            val wordId = currentState.taskList[currentState.currentIndex]
            viewModelScope.launch {
                // 从词库获取单词详情
                val wordCard = wordRepository.getWordCard(wordId)
                _uiState.value = currentState.copy(currentWordCard = wordCard)
            }
        }
    }
    
    /**
     * 切换到下一个单词
     */
    fun nextWord() {
        val currentState = _uiState.value
        if (currentState.currentIndex < currentState.taskList.size - 1) {
            _uiState.value = currentState.copy(
                currentIndex = currentState.currentIndex + 1,
                currentWordCard = null
            )
            loadCurrentWord()
        } else {
            // 没有更多单词
            _uiState.value = currentState.copy(currentWordCard = null)
        }
    }
    
    /**
     * 提交单词评分（根据停留时长智能判定）
     */
    fun submitWordRating(wordId: String, quality: Int) {
        viewModelScope.launch {
            algorithmEngine.updateLearningState(wordId, quality).fold(
                onSuccess = {
                    // 评分成功，继续下一个单词
                    nextWord()
                },
                onFailure = { error ->
                    _uiState.value = _uiState.value.copy(error = error.message)
                }
            )
        }
    }
}

/**
 * 单词仓库接口（临时，后续接入FEAT-001）
 */
interface WordRepository {
    suspend fun getWordCard(wordId: String): WordCardModel?
}