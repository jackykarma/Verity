package com.jacky.verity

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.lifecycle.viewmodel.compose.viewModel
import com.jacky.verity.algorithm.api.SpacedRepetitionEngine
import com.jacky.verity.algorithm.api.SpacedRepetitionEngineImpl
import com.jacky.verity.algorithm.core.scheduler.ReviewScheduler
import com.jacky.verity.algorithm.data.repository.LearningStateRepository
import com.jacky.verity.algorithm.domain.manager.LearningStateManager
import com.jacky.verity.data.database.AppDatabase
import com.jacky.verity.feature.learning.data.model.SessionType
import com.jacky.verity.feature.learning.data.repository.FakeWordRepository
import com.jacky.verity.feature.learning.ui.session.LearningSessionScreen
import com.jacky.verity.feature.learning.vm.LearningSessionViewModel
import com.jacky.verity.ui.theme.VerityTheme

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
        val wordRepository = FakeWordRepository()
        
        setContent {
            VerityTheme {
                val viewModel: LearningSessionViewModel = viewModel {
                    LearningSessionViewModel(algorithmEngine, wordRepository)
                }
                
                val uiState by viewModel.uiState.collectAsState()
                
                // 启动学习会话
                LaunchedEffect(Unit) {
                    viewModel.startSession(SessionType.LEARNING)
                }
                
                LearningSessionScreen(
                    currentWord = uiState.currentWordCard,
                    onNextWord = { viewModel.nextWord() },
                    onWordRated = { wordId, quality ->
                        viewModel.submitWordRating(wordId, quality)
                    },
                    modifier = Modifier.fillMaxSize()
                )
            }
        }
    }
}