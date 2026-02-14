package com.jacky.verity

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.IconButton
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.lifecycle.lifecycleScope
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import com.jacky.verity.gallery.album.AlbumDetailScreen
import com.jacky.verity.gallery.album.AlbumDetailViewModel
import com.jacky.verity.gallery.album.AlbumDetailViewModelFactory
import com.jacky.verity.gallery.album.AlbumListScreen
import com.jacky.verity.gallery.album.AlbumListViewModel
import com.jacky.verity.gallery.album.AlbumListViewModelFactory
import com.jacky.verity.gallery.data.MediaRepositoryImpl
import com.jacky.verity.gallery.data.album.AlbumDatabase
import com.jacky.verity.gallery.data.album.AlbumRepositoryImpl
import com.jacky.verity.gallery.domain.AlbumType
import com.jacky.verity.gallery.domain.MediaViewerContext
import com.jacky.verity.gallery.timeline.TimelineScreen
import com.jacky.verity.gallery.timeline.TimelineViewModel
import com.jacky.verity.gallery.timeline.TimelineViewModelFactory
import com.jacky.verity.gallery.search.SearchScreen
import com.jacky.verity.gallery.search.SearchViewModel
import com.jacky.verity.gallery.search.SearchViewModelFactory
import com.jacky.verity.gallery.viewer.PhotoViewerScreen
import com.jacky.verity.gallery.viewer.PhotoViewerViewModel
import com.jacky.verity.gallery.viewer.PhotoViewerViewModelFactory
import com.jacky.verity.ui.theme.VerityTheme

@OptIn(ExperimentalMaterial3Api::class)
class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        val albumDb = AlbumDatabase.create(applicationContext)
        val albumDao = albumDb.albumDao()
        val mediaRepo = MediaRepositoryImpl(contentResolver, lifecycleScope, albumDao)
        val albumRepo = AlbumRepositoryImpl(albumDao, contentResolver)
        val searchVmFactory = SearchViewModelFactory(mediaRepo, albumRepo)
        setContent {
            VerityTheme {
                val navController = rememberNavController()
                var pendingViewerContext by remember { mutableStateOf<MediaViewerContext?>(null) }
                Scaffold(
                    modifier = Modifier.fillMaxSize(),
                        topBar = {
                        @Suppress("OPT_IN_USAGE")
                        TopAppBar(
                            title = { Text("相册") },
                            actions = {
                                IconButton(onClick = { navController.navigate("albums") }) {
                                    Text("图集")
                                }
                                IconButton(onClick = { navController.navigate("search") }) {
                                    Text("搜索")
                                }
                            }
                        )
                    }
                ) { innerPadding ->
                    NavHost(
                        navController = navController,
                        startDestination = "timeline",
                        modifier = Modifier.padding(innerPadding)
                    ) {
                        composable("timeline") {
                            val timelineVm: TimelineViewModel = viewModel(
                                factory = TimelineViewModelFactory(mediaRepo)
                            )
                            TimelineScreen(
                                viewModel = timelineVm,
                                onNavigateToViewer = { ctx ->
                                    pendingViewerContext = ctx
                                    navController.navigate("viewer")
                                }
                            )
                        }
                        composable("albums") {
                            val albumListVm: AlbumListViewModel = viewModel(
                                factory = AlbumListViewModelFactory(albumRepo)
                            )
                            AlbumListScreen(
                                viewModel = albumListVm,
                                onAlbumClick = { album ->
                                    navController.navigate("album/${album.id}")
                                }
                            )
                        }
                        composable("album/{albumId}") { backStackEntry ->
                            val albumIdStr = backStackEntry.arguments?.getString("albumId") ?: "0"
                            val albumId = albumIdStr.toLongOrNull() ?: 0L
                            val albumDetailVm: AlbumDetailViewModel = viewModel(
                                factory = AlbumDetailViewModelFactory(albumId, albumRepo, mediaRepo)
                            )
                            val state by albumDetailVm.state.collectAsState()
                            val placeholderAlbum = com.jacky.verity.gallery.domain.Album(
                                id = albumId,
                                name = "图集",
                                type = if (albumId > 0) AlbumType.User else AlbumType.System,
                                itemCount = 0
                            )
                            AlbumDetailScreen(
                                album = placeholderAlbum,
                                viewModel = albumDetailVm,
                                pagingFlow = albumDetailVm.getMediaPagerByAlbum(state.mediaTypeFilter),
                                pickerPagingFlow = albumDetailVm.getMediaPagerForPicker(),
                                onNavigateToViewer = { ctx ->
                                    pendingViewerContext = ctx
                                    navController.navigate("viewer")
                                }
                            )
                        }
                        composable("search") {
                            val viewModel: SearchViewModel = viewModel(
                                factory = searchVmFactory
                            )
                            SearchScreen(
                                viewModel = viewModel,
                                onNavigateToViewer = { ctx ->
                                    pendingViewerContext = ctx
                                    navController.navigate("viewer")
                                }
                            )
                        }
                        composable("viewer") {
                            val ctx = pendingViewerContext
                            if (ctx != null) {
                                val viewerVm: PhotoViewerViewModel = viewModel(
                                    factory = PhotoViewerViewModelFactory(contentResolver)
                                )
                                PhotoViewerScreen(
                                    context = ctx,
                                    viewModel = viewerVm,
                                    onNavigateBack = { navController.popBackStack() }
                                )
                            } else {
                                Text("无预览内容", modifier = Modifier.padding(16.dp))
                            }
                        }
                    }
                }
            }
        }
    }
}
