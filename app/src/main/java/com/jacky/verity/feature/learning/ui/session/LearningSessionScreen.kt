package com.jacky.verity.feature.learning.ui.session

import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.foundation.gestures.detectVerticalDragGestures
import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.platform.LocalDensity
import androidx.compose.ui.unit.dp
import com.jacky.verity.feature.learning.data.model.WordCardModel
import com.jacky.verity.feature.learning.ui.components.WordCard
import kotlinx.coroutines.delay

/**
 * 学习会话界面（无痛单词风格：垂直滑动切换）
 */
@Composable
fun LearningSessionScreen(
    currentWord: WordCardModel?,
    isLoading: Boolean = false,
    error: String? = null,
    onNextWord: () -> Unit = {},
    onWordRated: (wordId: String, quality: Int) -> Unit = { _, _ -> },
    modifier: Modifier = Modifier
) {
    var dragOffset by remember { mutableStateOf(0f) }
    var isDragging by remember { mutableStateOf(false) }
    var viewStartTime by remember { mutableStateOf(System.currentTimeMillis()) }
    
    // 当单词切换时，重置计时
    LaunchedEffect(currentWord?.wordId) {
        viewStartTime = System.currentTimeMillis()
    }
    
    // 根据停留时长自动判定熟悉度（后台计算）
    LaunchedEffect(currentWord?.wordId) {
        if (currentWord != null) {
            // 停留超过3秒，自动判定为"认识"（quality=4）
            delay(3000)
            val dwellTime = System.currentTimeMillis() - viewStartTime
            if (dwellTime >= 3000) {
                // 自动判定为认识
                onWordRated(currentWord.wordId, 4)
            }
        }
    }
    
    Box(
        modifier = modifier
            .fillMaxSize()
            .pointerInput(Unit) {
                detectVerticalDragGestures(
                    onDragStart = { _ -> isDragging = true },
                    onDragEnd = {
                        isDragging = false
                        // 滑动超过阈值，切换到下一个单词
                        if (dragOffset < -100f) {
                            onNextWord()
                        }
                        dragOffset = 0f
                    },
                    onVerticalDrag = { _, dragAmount ->
                        dragOffset += dragAmount
                    }
                )
            }
    ) {
        currentWord?.let { word ->
            // 卡片偏移动画
            val offsetY by animateFloatAsState(
                targetValue = if (isDragging) dragOffset else 0f,
                label = "cardOffset"
            )
            
            WordCard(
                wordCard = word,
                onPlayPronunciation = { /* TODO: 播放发音 */ },
                onFavorite = { /* TODO: 收藏 */ },
                onDelete = { /* TODO: 删除 */ },
                onStats = { /* TODO: 统计 */ },
                modifier = Modifier
                    .fillMaxSize()
                    .offset(y = with(LocalDensity.current) { offsetY.toDp() })
            )
        } ?: run {
            // 空状态：没有更多单词或加载中
            if (isLoading) {
                LoadingState()
            } else if (error != null) {
                ErrorState(error = error)
            } else {
                EmptyState()
            }
        }
    }
}

@Composable
private fun EmptyState() {
    Box(
        modifier = Modifier.fillMaxSize(),
        contentAlignment = Alignment.Center
    ) {
        Column(
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center
        ) {
            Text(
                text = "今天的学习已完成！",
                style = MaterialTheme.typography.headlineMedium
            )
            Spacer(modifier = Modifier.height(16.dp))
            Text(
                text = "上滑切换单词卡片",
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
        }
    }
}

@Composable
private fun LoadingState() {
    Box(
        modifier = Modifier.fillMaxSize(),
        contentAlignment = Alignment.Center
    ) {
        Column(
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center
        ) {
            CircularProgressIndicator()
            Spacer(modifier = Modifier.height(16.dp))
            Text(
                text = "正在加载学习任务...",
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
        }
    }
}

@Composable
private fun ErrorState(error: String) {
    Box(
        modifier = Modifier.fillMaxSize(),
        contentAlignment = Alignment.Center
    ) {
        Column(
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center
        ) {
            Text(
                text = "加载失败",
                style = MaterialTheme.typography.headlineMedium,
                color = MaterialTheme.colorScheme.error
            )
            Spacer(modifier = Modifier.height(8.dp))
            Text(
                text = error,
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
            Spacer(modifier = Modifier.height(16.dp))
            Text(
                text = "提示：请先导入词库",
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
        }
    }
}