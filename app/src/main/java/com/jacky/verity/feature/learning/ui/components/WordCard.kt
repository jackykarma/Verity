package com.jacky.verity.feature.learning.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.PlayArrow
import androidx.compose.material.icons.filled.Star
import androidx.compose.material.icons.filled.Info
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.jacky.verity.feature.learning.data.model.*

/**
 * 单词卡片组件（无痛单词风格）
 */
@Composable
fun WordCard(
    wordCard: WordCardModel,
    onPlayPronunciation: () -> Unit = {},
    onFavorite: () -> Unit = {},
    onDelete: () -> Unit = {},
    onStats: () -> Unit = {},
    modifier: Modifier = Modifier
) {
    Box(modifier = modifier.fillMaxSize()) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .background(Color.White)
                .padding(24.dp),
            horizontalAlignment = Alignment.Start
        ) {
        // 单词和音标
        WordHeader(
            word = wordCard.word,
            phonetic = wordCard.phonetic,
            hasPronunciation = wordCard.hasPronunciation,
            onPlayPronunciation = onPlayPronunciation
        )
        
        Spacer(modifier = Modifier.height(24.dp))
        
        // 定义列表
        if (wordCard.definitions.isNotEmpty()) {
            DefinitionsSection(definitions = wordCard.definitions)
            Spacer(modifier = Modifier.height(24.dp))
        }
        
        // 标签页（例句、词根词缀等）
        TabsSection(
            examples = wordCard.examples,
            translation = wordCard.translation
        )
        
        Spacer(modifier = Modifier.weight(1f))
        
            // 翻译部分
            if (wordCard.translation != null) {
                TranslationSection(translation = wordCard.translation)
            }
        }
        
        // 右侧浮动按钮
        FloatingActionButtons(
            onFavorite = onFavorite,
            onDelete = onDelete,
            onStats = onStats,
            modifier = Modifier.align(Alignment.CenterEnd)
        )
    }
}

@Composable
private fun WordHeader(
    word: String,
    phonetic: String?,
    hasPronunciation: Boolean,
    onPlayPronunciation: () -> Unit
) {
    Column {
        // 单词（大字体，带音节分隔）
        Text(
            text = formatWordWithSyllables(word),
            fontSize = 48.sp,
            fontWeight = FontWeight.Bold,
            fontFamily = androidx.compose.ui.text.font.FontFamily.Serif,
            color = Color.Black
        )
        
        Spacer(modifier = Modifier.height(8.dp))
        
        // 音标和发音按钮
        Row(
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            if (phonetic != null) {
                Text(
                    text = phonetic,
                    fontSize = 18.sp,
                    color = Color.Gray
                )
            }
            if (hasPronunciation) {
                IconButton(
                    onClick = onPlayPronunciation,
                    modifier = Modifier.size(24.dp)
                ) {
                    Icon(
                        imageVector = Icons.Default.PlayArrow,
                        contentDescription = "播放发音",
                        tint = Color.Black,
                        modifier = Modifier.size(20.dp)
                    )
                }
            }
        }
    }
}

@Composable
private fun DefinitionsSection(definitions: List<WordDefinition>) {
    definitions.forEach { definition ->
        Column(modifier = Modifier.padding(vertical = 8.dp)) {
            // 词性标签
            Text(
                text = definition.partOfSpeech,
                fontSize = 14.sp,
                fontWeight = FontWeight.Bold,
                color = Color.White,
                modifier = Modifier
                    .clip(RoundedCornerShape(4.dp))
                    .background(Color(0xFF424242))
                    .padding(horizontal = 12.dp, vertical = 4.dp)
            )
            
            Spacer(modifier = Modifier.height(8.dp))
            
            // 定义项列表
            definition.definitions.forEach { item ->
                DefinitionItemRow(item = item)
                Spacer(modifier = Modifier.height(4.dp))
            }
        }
    }
}

@Composable
private fun DefinitionItemRow(item: DefinitionItem) {
    Row(
        verticalAlignment = Alignment.Top,
        horizontalArrangement = Arrangement.spacedBy(8.dp)
    ) {
        // 标签（如果有）
        if (item.label != null) {
            Text(
                text = item.label,
                fontSize = 12.sp,
                fontWeight = FontWeight.Bold,
                color = Color.White,
                textAlign = TextAlign.Center,
                modifier = Modifier
                    .clip(RoundedCornerShape(4.dp))
                    .background(getLabelColor(item.labelColor))
                    .padding(horizontal = 8.dp, vertical = 2.dp)
            )
        }
        
        // 定义文本
        Text(
            text = item.text,
            fontSize = 16.sp,
            color = Color.Black,
            modifier = Modifier.weight(1f)
        )
    }
}

@Composable
private fun TabsSection(
    examples: List<WordExample>,
    translation: String?
) {
    // 标签页：例句、词根词缀、派生、近反义
    Row(
        horizontalArrangement = Arrangement.spacedBy(16.dp),
        modifier = Modifier.padding(vertical = 8.dp)
    ) {
        TabItem("例句", isSelected = true)
        TabItem("词根词缀", isSelected = false)
        TabItem("派生", isSelected = false)
        TabItem("近反义", isSelected = false)
    }
    
    Spacer(modifier = Modifier.height(16.dp))
    
    // 例句内容
    if (examples.isNotEmpty()) {
        examples.forEach { example ->
            ExampleRow(example = example)
            Spacer(modifier = Modifier.height(12.dp))
        }
    }
}

@Composable
private fun TabItem(text: String, isSelected: Boolean) {
    Column {
        Text(
            text = text,
            fontSize = 14.sp,
            fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Normal,
            color = if (isSelected) Color(0xFF4CAF50) else Color.Gray
        )
        
        if (isSelected) {
            Spacer(modifier = Modifier.height(4.dp))
            HorizontalDivider(
                color = Color(0xFF4CAF50),
                thickness = 2.dp
            )
        }
    }
}

@Composable
private fun ExampleRow(example: WordExample) {
    Column {
        // 标签行
        Row(
            horizontalArrangement = Arrangement.spacedBy(8.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            example.labels.forEach { label ->
                Text(
                    text = label,
                    fontSize = 12.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color.White,
                    modifier = Modifier
                        .clip(RoundedCornerShape(4.dp))
                        .background(Color(0xFF424242))
                        .padding(horizontal = 8.dp, vertical = 4.dp)
                )
            }
            if (example.hasAudio) {
                IconButton(
                    onClick = { /* 播放例句音频 */ },
                    modifier = Modifier.size(20.dp)
                ) {
                    Icon(
                        imageVector = Icons.Default.PlayArrow,
                        contentDescription = "播放例句",
                        tint = Color.Black,
                        modifier = Modifier.size(16.dp)
                    )
                }
            }
        }
        
        Spacer(modifier = Modifier.height(8.dp))
        
        // 英文例句
        Text(
            text = example.english,
            fontSize = 16.sp,
            color = Color.Black,
            lineHeight = 24.sp
        )
        
        // 中文翻译
        if (example.chinese != null) {
            Spacer(modifier = Modifier.height(4.dp))
            Text(
                text = example.chinese,
                fontSize = 14.sp,
                color = Color.Gray
            )
        }
    }
}

@Composable
private fun TranslationSection(translation: String) {
    Column {
        Text(
            text = "translation",
            fontSize = 12.sp,
            fontWeight = FontWeight.Bold,
            color = Color.White,
            modifier = Modifier
                .clip(RoundedCornerShape(4.dp))
                .background(Color(0xFF424242))
                .padding(horizontal = 8.dp, vertical = 4.dp)
        )
        Spacer(modifier = Modifier.height(8.dp))
        Text(
            text = translation,
            fontSize = 14.sp,
            color = Color.Gray
        )
    }
}

@Composable
private fun FloatingActionButtons(
    onFavorite: () -> Unit,
    onDelete: () -> Unit,
    onStats: () -> Unit,
    modifier: Modifier = Modifier
) {
    Column(
        modifier = modifier
            .padding(end = 16.dp)
            .fillMaxHeight(),
        verticalArrangement = Arrangement.Center,
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        FloatingActionButton(
            onClick = onFavorite,
            modifier = Modifier.size(48.dp),
            containerColor = Color(0xFFF5F5F5),
            elevation = FloatingActionButtonDefaults.elevation(2.dp)
        ) {
            Icon(
                imageVector = Icons.Default.Star,
                contentDescription = "收藏",
                tint = Color.Black
            )
        }
        
        Spacer(modifier = Modifier.height(16.dp))
        
        FloatingActionButton(
            onClick = onDelete,
            modifier = Modifier.size(48.dp),
            containerColor = Color(0xFFF5F5F5),
            elevation = FloatingActionButtonDefaults.elevation(2.dp)
        ) {
            Icon(
                imageVector = Icons.Default.Delete,
                contentDescription = "删除",
                tint = Color.Black
            )
        }
        
        Spacer(modifier = Modifier.height(16.dp))
        
        FloatingActionButton(
            onClick = onStats,
            modifier = Modifier.size(48.dp),
            containerColor = Color(0xFFF5F5F5),
            elevation = FloatingActionButtonDefaults.elevation(2.dp)
        ) {
            Icon(
                imageVector = Icons.Default.Info,
                contentDescription = "统计",
                tint = Color.Black
            )
        }
    }
}

// 辅助函数
private fun formatWordWithSyllables(word: String): String {
    // 简化实现：在单词中间添加分隔符
    // 实际应该根据音节规则分割
    if (word.length <= 4) return word
    val mid = word.length / 2
    return "${word.substring(0, mid)} • ${word.substring(mid)}"
}

private fun getLabelColor(color: LabelColor): Color {
    return when (color) {
        LabelColor.Green -> Color(0xFF4CAF50)
        LabelColor.Orange -> Color(0xFFFF9800)
        LabelColor.Blue -> Color(0xFF2196F3)
        LabelColor.Gray -> Color(0xFF424242)
    }
}