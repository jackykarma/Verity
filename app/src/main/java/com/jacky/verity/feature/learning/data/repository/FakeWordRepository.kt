package com.jacky.verity.feature.learning.data.repository

import com.jacky.verity.feature.learning.data.model.*
import com.jacky.verity.feature.learning.vm.WordRepository

/**
 * 临时Fake实现（用于测试和演示）
 */
class FakeWordRepository : WordRepository {
    override suspend fun getWordCard(wordId: String): WordCardModel? {
        // 临时返回示例数据（即使wordId不同，也返回相同数据用于演示）
        // 实际应用中，这里应该根据wordId从词库中查找对应的单词
        return WordCardModel(
            wordId = wordId,
            word = "painless",
            phonetic = "/'peinləs/",
            definitions = listOf(
                WordDefinition(
                    partOfSpeech = "adjective",
                    definitions = listOf(
                        DefinitionItem(
                            label = "A1",
                            labelColor = LabelColor.Green,
                            text = "Causing you no pain"
                        ),
                        DefinitionItem(
                            label = "B2",
                            labelColor = LabelColor.Orange,
                            text = "Not causing any physical pain"
                        ),
                        DefinitionItem(
                            label = "R",
                            labelColor = LabelColor.Gray,
                            text = "Less difficult or unpleasant than expected"
                        )
                    )
                ),
                WordDefinition(
                    partOfSpeech = "verb",
                    definitions = listOf(
                        DefinitionItem(
                            text = "To make something painless"
                        )
                    )
                )
            ),
            examples = listOf(
                WordExample(
                    labels = listOf("example", "四级真题"),
                    english = "The vaccination was **painless**, I hardly felt a thing.",
                    chinese = "疫苗是无痛的,我几乎没感觉。",
                    hasAudio = true
                )
            ),
            translation = "adj.无痛的,愉快的,轻松的\nn.无痛",
            hasPronunciation = true
        )
    }
}