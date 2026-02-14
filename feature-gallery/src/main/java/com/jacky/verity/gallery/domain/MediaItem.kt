package com.jacky.verity.gallery.domain

import android.net.Uri

/**
 * 媒体项实体（plan A0.1 / story_detail_design ST-001）。
 * 来自系统媒体库的照片/视频元数据，不可变。
 */
data class MediaItem(
    val id: Long,
    val contentUri: Uri,
    val dateTaken: Long,
    val mimeType: String
)
