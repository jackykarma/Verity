package com.jacky.verity.gallery.timeline

import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import com.jacky.verity.gallery.domain.MediaRepository

/**
 * 用于在 Activity/NavHost 中创建 TimelineViewModel（需注入 MediaRepository）。
 */
class TimelineViewModelFactory(
    private val repository: MediaRepository
) : ViewModelProvider.Factory {
    @Suppress("UNCHECKED_CAST")
    override fun <T : ViewModel> create(modelClass: Class<T>): T =
        TimelineViewModel(repository) as T
}
