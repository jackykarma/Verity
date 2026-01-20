package com.jacky.verity.feature.learning.data.repository

import android.content.Context
import com.jacky.verity.feature.learning.data.model.*
import com.jacky.verity.feature.learning.vm.WordRepository
import com.jacky.verity.library.data.datasource.LibraryLocalDataSource
import com.jacky.verity.library.domain.model.LibraryFormat
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import kotlinx.serialization.Serializable
import kotlinx.serialization.json.Json
import java.io.File

/**
 * 基于导入词库的单词仓库实现
 */
class LibraryWordRepository(
    private val context: Context,
    private val libraryDataSource: LibraryLocalDataSource
) : WordRepository {
    
    private val json = Json { 
        ignoreUnknownKeys = true 
        isLenient = true
    }
    
    // 缓存已解析的单词列表
    private var cachedWords: List<WordEntry>? = null
    private var cachedLibraryId: String? = null
    
    override suspend fun getWordCard(wordId: String): WordCardModel? = withContext(Dispatchers.IO) {
        // 确保词库已加载
        val words = loadWordsFromSelectedLibrary() ?: return@withContext null
        
        // 查找对应单词
        val wordEntry = words.find { it.id == wordId || it.word == wordId }
            ?: return@withContext null
        
        // 转换为 WordCardModel
        wordEntry.toWordCardModel()
    }
    
    /**
     * 获取所有单词ID列表
     */
    suspend fun getAllWordIds(): List<String> = withContext(Dispatchers.IO) {
        val words = loadWordsFromSelectedLibrary() ?: return@withContext emptyList()
        words.map { it.id ?: it.word }
    }
    
    /**
     * 从选中的词库加载单词
     */
    private suspend fun loadWordsFromSelectedLibrary(): List<WordEntry>? {
        val selectedId = libraryDataSource.getSelectedLibraryId() ?: return null
        
        // 检查缓存
        if (cachedLibraryId == selectedId && cachedWords != null) {
            return cachedWords
        }
        
        // 获取词库元数据
        val libraries = libraryDataSource.getAllLibraries()
        val library = libraries.find { it.id == selectedId } ?: return null
        
        // 根据格式解析文件
        val file = File(library.filePath)
        if (!file.exists()) return null
        
        val words = when (LibraryFormat.valueOf(library.format)) {
            LibraryFormat.JSON -> parseJsonFile(file)
            LibraryFormat.CSV -> parseCsvFile(file)
            LibraryFormat.TXT -> parseTxtFile(file)
        }
        
        // 更新缓存
        cachedLibraryId = selectedId
        cachedWords = words
        
        return words
    }
    
    /**
     * 解析JSON格式词库
     */
    private fun parseJsonFile(file: File): List<WordEntry> {
        return try {
            val content = file.readText()
            // 尝试解析为数组
            try {
                json.decodeFromString<List<WordEntry>>(content)
            } catch (e: Exception) {
                // 尝试解析为带words字段的对象
                try {
                    val wrapper = json.decodeFromString<WordListWrapper>(content)
                    wrapper.words
                } catch (e2: Exception) {
                    // 简单文本格式，每行一个单词
                    content.lines()
                        .filter { it.isNotBlank() }
                        .mapIndexed { index, line -> 
                            WordEntry(id = "word_$index", word = line.trim())
                        }
                }
            }
        } catch (e: Exception) {
            emptyList()
        }
    }
    
    /**
     * 解析CSV格式词库
     */
    private fun parseCsvFile(file: File): List<WordEntry> {
        return try {
            val lines = file.readLines()
            if (lines.isEmpty()) return emptyList()
            
            // 跳过标题行
            val dataLines = if (lines.first().contains("word", ignoreCase = true)) {
                lines.drop(1)
            } else {
                lines
            }
            
            dataLines.mapIndexed { index, line ->
                val parts = line.split(",").map { it.trim() }
                WordEntry(
                    id = "word_$index",
                    word = parts.getOrNull(0) ?: "",
                    phonetic = parts.getOrNull(1),
                    translation = parts.getOrNull(2),
                    definition = parts.getOrNull(3)
                )
            }.filter { it.word.isNotBlank() }
        } catch (e: Exception) {
            emptyList()
        }
    }
    
    /**
     * 解析TXT格式词库（每行一个单词或单词\t翻译格式）
     */
    private fun parseTxtFile(file: File): List<WordEntry> {
        return try {
            file.readLines()
                .filter { it.isNotBlank() }
                .mapIndexed { index, line ->
                    val parts = line.split("\t", "  ", " - ").map { it.trim() }
                    WordEntry(
                        id = "word_$index",
                        word = parts.getOrNull(0) ?: line.trim(),
                        translation = parts.getOrNull(1)
                    )
                }
        } catch (e: Exception) {
            emptyList()
        }
    }
    
    /**
     * 清除缓存
     */
    fun clearCache() {
        cachedWords = null
        cachedLibraryId = null
    }
}

/**
 * 词库中的单词条目
 */
@Serializable
data class WordEntry(
    val id: String? = null,
    val word: String,
    val phonetic: String? = null,
    val translation: String? = null,
    val definition: String? = null,
    val definitions: List<DefinitionEntry>? = null,
    val examples: List<ExampleEntry>? = null,
    val partOfSpeech: String? = null
) {
    fun toWordCardModel(): WordCardModel {
        return WordCardModel(
            wordId = id ?: word,
            word = word,
            phonetic = phonetic,
            definitions = buildDefinitions(),
            examples = buildExamples(),
            translation = translation ?: definition,
            hasPronunciation = false
        )
    }
    
    private fun buildDefinitions(): List<WordDefinition> {
        // 如果有详细定义列表
        if (!definitions.isNullOrEmpty()) {
            return definitions.map { def ->
                WordDefinition(
                    partOfSpeech = def.partOfSpeech ?: partOfSpeech ?: "n.",
                    definitions = def.meanings?.map { meaning ->
                        DefinitionItem(
                            text = meaning,
                            label = null,
                            labelColor = LabelColor.Gray
                        )
                    } ?: listOf(DefinitionItem(text = def.text ?: "", label = null, labelColor = LabelColor.Gray))
                )
            }
        }
        
        // 如果只有简单的翻译/定义
        val defText = definition ?: translation ?: return emptyList()
        return listOf(
            WordDefinition(
                partOfSpeech = partOfSpeech ?: "n.",
                definitions = listOf(
                    DefinitionItem(
                        text = defText,
                        label = null,
                        labelColor = LabelColor.Gray
                    )
                )
            )
        )
    }
    
    private fun buildExamples(): List<WordExample> {
        return examples?.map { ex ->
            WordExample(
                english = ex.english ?: ex.sentence ?: "",
                chinese = ex.chinese ?: ex.translation,
                labels = listOfNotNull(ex.source),
                hasAudio = false
            )
        } ?: emptyList()
    }
}

@Serializable
data class DefinitionEntry(
    val partOfSpeech: String? = null,
    val text: String? = null,
    val meanings: List<String>? = null
)

@Serializable
data class ExampleEntry(
    val english: String? = null,
    val chinese: String? = null,
    val sentence: String? = null,
    val translation: String? = null,
    val source: String? = null
)

@Serializable
data class WordListWrapper(
    val words: List<WordEntry> = emptyList(),
    val name: String? = null
)
