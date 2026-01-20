package com.jacky.verity

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.lifecycle.viewmodel.compose.viewModel
import com.jacky.verity.algorithm.api.SpacedRepetitionEngine
import com.jacky.verity.algorithm.api.SpacedRepetitionEngineImpl
import com.jacky.verity.algorithm.core.scheduler.ReviewScheduler
import com.jacky.verity.algorithm.data.repository.LearningStateRepository
import com.jacky.verity.algorithm.domain.manager.LearningStateManager
import com.jacky.verity.data.database.AppDatabase
import com.jacky.verity.feature.learning.data.model.SessionType
import com.jacky.verity.feature.learning.data.repository.LibraryWordRepository
import com.jacky.verity.feature.learning.ui.session.LearningSessionScreen
import com.jacky.verity.feature.learning.vm.LearningSessionViewModel
import com.jacky.verity.library.data.datasource.LibraryLocalDataSource
import com.jacky.verity.library.data.repository.LibraryRepository
import com.jacky.verity.library.ui.LibraryScreen
import com.jacky.verity.library.ui.LibraryViewModel
import com.jacky.verity.ui.theme.VerityTheme

/**
 * 应用屏幕枚举
 */
enum class AppScreen {
    LIBRARY,  // 词库管理
    LEARNING  // 学习界面
}

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        
        // 初始化依赖（简化版，实际应使用依赖注入框架）
        val database = AppDatabase.getInstance(this)
        val learningStateDao = database.wordLearningStateDao()
        val learningStateRepository = LearningStateRepository(learningStateDao)
        val stateManager = LearningStateManager(learningStateRepository)
        val scheduler = ReviewScheduler(learningStateRepository)
        val algorithmEngine: SpacedRepetitionEngine = SpacedRepetitionEngineImpl(
            stateManager = stateManager,
            scheduler = scheduler
        )
        // 词库相关依赖
        val libraryDataSource = LibraryLocalDataSource(this)
        val libraryRepository = LibraryRepository(libraryDataSource, this)
        val wordRepository = LibraryWordRepository(this, libraryDataSource)
        
        setContent {
            VerityTheme {
                // 当前屏幕状态
                var currentScreen by remember { mutableStateOf(AppScreen.LIBRARY) }
                
                when (currentScreen) {
                    AppScreen.LIBRARY -> {
                        val libraryViewModel: LibraryViewModel = viewModel {
                            LibraryViewModel(libraryRepository)
                        }
                        val libraryUiState by libraryViewModel.uiState.collectAsState()
                        
                        LibraryScreen(
                            uiState = libraryUiState,
                            onImportLibrary = { uri, fileName ->
                                libraryViewModel.importLibrary(uri, fileName)
                            },
                            onSelectLibrary = { libraryId ->
                                libraryViewModel.selectLibrary(libraryId)
                            },
                            onDeleteLibrary = { libraryId ->
                                libraryViewModel.deleteLibrary(libraryId)
                            },
                            onNavigateToLearning = {
                                currentScreen = AppScreen.LEARNING
                            },
                            onClearError = {
                                libraryViewModel.clearError()
                            },
                            onClearImportSuccess = {
                                libraryViewModel.clearImportSuccess()
                            },
                            modifier = Modifier.fillMaxSize()
                        )
                    }
                    
                    AppScreen.LEARNING -> {
                        val learningViewModel: LearningSessionViewModel = viewModel {
                            LearningSessionViewModel(algorithmEngine, wordRepository)
                        }
                        val learningUiState by learningViewModel.uiState.collectAsState()
                        
                        // 启动学习会话
                        LaunchedEffect(Unit) {
                            learningViewModel.startSession(SessionType.LEARNING)
                        }
                        
                        LearningSessionScreen(
                            currentWord = learningUiState.currentWordCard,
                            isLoading = learningUiState.isLoading,
                            error = learningUiState.error,
                            onNextWord = { learningViewModel.nextWord() },
                            onWordRated = { wordId, quality ->
                                learningViewModel.submitWordRating(wordId, quality)
                            },
                            modifier = Modifier.fillMaxSize()
                        )
                    }
                }
            }
        }
    }
}