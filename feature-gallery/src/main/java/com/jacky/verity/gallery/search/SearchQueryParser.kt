package com.jacky.verity.gallery.search

import com.jacky.verity.gallery.domain.Album
import java.util.Calendar

/**
 * 自然语言/结构化 → SearchCondition（领域服务，无 Android 依赖）。
 * 解析失败时降级为 keyword 或 Result.failure(ParseFailed)。
 */
class SearchQueryParser {

    /**
     * @param queryText 用户输入
     * @param albums 图集列表（用于 matchAlbumKeyword）
     * @return 解析成功或降级为 keyword 时 success；完全无法解析且 queryText 空白时 failure
     */
    fun parse(queryText: String, albums: List<Album>): Result<SearchCondition> {
        val trimmed = queryText.trim()
        if (trimmed.isBlank()) return Result.failure(ParseFailed)

        matchTemporalKeyword(trimmed)?.let { (from, to) ->
            return Result.success(SearchCondition(dateFrom = from, dateTo = to))
        }
        matchAlbumKeyword(trimmed, albums)?.let { albumId ->
            return Result.success(SearchCondition(albumId = albumId))
        }
        return Result.success(fallbackToKeyword(trimmed))
    }

    private fun matchTemporalKeyword(text: String): Pair<Long, Long>? {
        for ((keyword, rangeFn) in temporalRules) {
            if (text.contains(keyword, ignoreCase = true) ||
                text.equals(keyword, ignoreCase = true)
            ) {
                return rangeFn()
            }
        }
        return null
    }

    private fun matchAlbumKeyword(text: String, albums: List<Album>): Long? {
        val patterns = listOf(
            Regex("""图集\s*(.+)""", RegexOption.IGNORE_CASE),
            Regex("""in\s+(.+)""", RegexOption.IGNORE_CASE)
        )
        for (regex in patterns) {
            regex.find(text)?.groupValues?.getOrNull(1)?.let { name ->
                val search = name.trim()
                if (search.isBlank()) return@let Unit
                albums.find { it.name.equals(search, ignoreCase = true) }?.id?.let { return it }
                albums.find { it.name.contains(search, ignoreCase = true) }?.id?.let { return it }
            }
        }
        return null
    }

    private fun fallbackToKeyword(text: String): SearchCondition =
        SearchCondition(keyword = text.takeIf { it.isNotBlank() }, dateFrom = null, dateTo = null, albumId = null)

    companion object {
        private val temporalRules: List<Pair<String, () -> Pair<Long, Long>>> = listOf(
            "昨天" to {
                val cal = Calendar.getInstance()
                cal.add(Calendar.DAY_OF_YEAR, -1)
                val start = cal.clone() as Calendar
                start.set(Calendar.HOUR_OF_DAY, 0); start.set(Calendar.MINUTE, 0); start.set(Calendar.SECOND, 0); start.set(Calendar.MILLISECOND, 0)
                val end = cal.clone() as Calendar
                end.set(Calendar.HOUR_OF_DAY, 23); end.set(Calendar.MINUTE, 59); end.set(Calendar.SECOND, 59); end.set(Calendar.MILLISECOND, 999)
                Pair(start.timeInMillis, end.timeInMillis)
            },
            "yesterday" to {
                val cal = Calendar.getInstance()
                cal.add(Calendar.DAY_OF_YEAR, -1)
                val start = cal.clone() as Calendar
                start.set(Calendar.HOUR_OF_DAY, 0); start.set(Calendar.MINUTE, 0); start.set(Calendar.SECOND, 0); start.set(Calendar.MILLISECOND, 0)
                val end = cal.clone() as Calendar
                end.set(Calendar.HOUR_OF_DAY, 23); end.set(Calendar.MINUTE, 59); end.set(Calendar.SECOND, 59); end.set(Calendar.MILLISECOND, 999)
                Pair(start.timeInMillis, end.timeInMillis)
            },
            "上周" to {
                val cal = Calendar.getInstance()
                cal.add(Calendar.DAY_OF_YEAR, -7)
                val start = cal.clone() as Calendar
                start.set(Calendar.HOUR_OF_DAY, 0); start.set(Calendar.MINUTE, 0); start.set(Calendar.SECOND, 0); start.set(Calendar.MILLISECOND, 0)
                val end = Calendar.getInstance()
                end.set(Calendar.HOUR_OF_DAY, 23); end.set(Calendar.MINUTE, 59); end.set(Calendar.SECOND, 59); end.set(Calendar.MILLISECOND, 999)
                Pair(start.timeInMillis, end.timeInMillis)
            },
            "last week" to {
                val cal = Calendar.getInstance()
                cal.add(Calendar.DAY_OF_YEAR, -7)
                val start = cal.clone() as Calendar
                start.set(Calendar.HOUR_OF_DAY, 0); start.set(Calendar.MINUTE, 0); start.set(Calendar.SECOND, 0); start.set(Calendar.MILLISECOND, 0)
                val end = Calendar.getInstance()
                end.set(Calendar.HOUR_OF_DAY, 23); end.set(Calendar.MINUTE, 59); end.set(Calendar.SECOND, 59); end.set(Calendar.MILLISECOND, 999)
                Pair(start.timeInMillis, end.timeInMillis)
            },
            "今年" to {
                val cal = Calendar.getInstance()
                cal.set(Calendar.MONTH, Calendar.JANUARY); cal.set(Calendar.DAY_OF_MONTH, 1)
                cal.set(Calendar.HOUR_OF_DAY, 0); cal.set(Calendar.MINUTE, 0); cal.set(Calendar.SECOND, 0); cal.set(Calendar.MILLISECOND, 0)
                Pair(cal.timeInMillis, System.currentTimeMillis())
            },
            "this year" to {
                val cal = Calendar.getInstance()
                cal.set(Calendar.MONTH, Calendar.JANUARY); cal.set(Calendar.DAY_OF_MONTH, 1)
                cal.set(Calendar.HOUR_OF_DAY, 0); cal.set(Calendar.MINUTE, 0); cal.set(Calendar.SECOND, 0); cal.set(Calendar.MILLISECOND, 0)
                Pair(cal.timeInMillis, System.currentTimeMillis())
            }
        )
    }
}

/** 完全无法解析时返回（如 queryText 空白）。 */
object ParseFailed : Throwable("ParseFailed")
