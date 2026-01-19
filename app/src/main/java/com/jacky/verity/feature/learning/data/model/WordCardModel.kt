package com.jacky.verity.feature.learning.data.model

/**
 * 单词卡片数据模型
 */
data class WordCardModel(
    val wordId: String,
    val word: String, // 单词拼写
    val phonetic: String? = null, // 音标
    val definitions: List<WordDefinition> = emptyList(), // 定义列表
    val examples: List<WordExample> = emptyList(), // 例句列表
    val translation: String? = null, // 中文翻译
    val hasPronunciation: Boolean = false // 是否有发音
)

/**
 * 单词定义
 */
data class WordDefinition(
    val partOfSpeech: String, // 词性（adjective, verb等）
    val definitions: List<DefinitionItem> = emptyList() // 具体定义项
)

/**
 * 定义项（带标签）
 */
data class DefinitionItem(
    val label: String? = null, // 标签（如A1, B2, R等）
    val labelColor: LabelColor = LabelColor.Gray, // 标签颜色
    val text: String // 定义文本
)

/**
 * 标签颜色
 */
enum class LabelColor {
    Green, // 绿色（如A1）
    Orange, // 橙色（如B2）
    Blue, // 蓝色
    Gray // 灰色（如R）
}

/**
 * 单词例句
 */
data class WordExample(
    val labels: List<String> = emptyList(), // 标签（如"example", "四级真题"）
    val english: String, // 英文例句
    val chinese: String? = null, // 中文翻译
    val hasAudio: Boolean = false // 是否有音频
)