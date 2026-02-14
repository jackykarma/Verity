package com.jacky.verity.gallery.domain

import android.net.Uri

/**
 * 图集领域模型（FEAT-002 plan A0.1）。
 * 区分系统图集与用户图集（type）；id 为 identity，聚合根。
 */
data class Album(
    val id: Long,
    val name: String,
    val type: AlbumType,
    val itemCount: Int = 0,
    val coverUri: Uri? = null
)

enum class AlbumType {
    System,
    User
}
