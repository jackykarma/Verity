package com.jacky.verity.gallery.domain

/**
 * 进入大图时的上下文（来自 FEAT-001）。
 * source 为 "timeline" | "album" | "search"。
 */
data class MediaViewerContext(
    val itemList: List<MediaItem>,
    val currentIndex: Int,
    val source: String
)
