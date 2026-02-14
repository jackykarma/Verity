package com.jacky.verity.gallery.viewer

import android.content.ContentResolver
import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import com.jacky.verity.gallery.data.loader.BigImageLoaderImpl

/**
 * 大图 ViewModel 工厂，注入 BigImageLoader。
 */
class PhotoViewerViewModelFactory(
    private val contentResolver: ContentResolver
) : ViewModelProvider.Factory {

    private val loader by lazy { BigImageLoaderImpl(contentResolver) }

    @Suppress("UNCHECKED_CAST")
    override fun <T : ViewModel> create(modelClass: Class<T>): T {
        if (modelClass != PhotoViewerViewModel::class.java) {
            throw IllegalArgumentException("Unknown ViewModel class")
        }
        return PhotoViewerViewModel(loader) as T
    }
}
