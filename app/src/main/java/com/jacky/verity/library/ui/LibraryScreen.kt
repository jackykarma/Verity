package com.jacky.verity.library.ui

import android.net.Uri
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.jacky.verity.library.domain.model.WordLibrary

/**
 * 词库管理界面
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun LibraryScreen(
    uiState: LibraryUiState,
    onImportLibrary: (Uri, String) -> Unit,
    onSelectLibrary: (String) -> Unit,
    onDeleteLibrary: (String) -> Unit,
    onNavigateToLearning: () -> Unit,
    onClearError: () -> Unit,
    onClearImportSuccess: () -> Unit,
    modifier: Modifier = Modifier
) {
    val context = LocalContext.current
    var showDeleteDialog by remember { mutableStateOf<String?>(null) }
    
    // 文件选择器
    val filePickerLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.OpenDocument()
    ) { uri: Uri? ->
        uri?.let {
            // 获取文件名
            val fileName = getFileName(context, it) ?: "unknown.txt"
            onImportLibrary(it, fileName)
        }
    }
    
    // 显示错误提示
    uiState.error?.let { error ->
        LaunchedEffect(error) {
            // 自动清除错误
        }
    }
    
    // 显示导入成功提示
    if (uiState.importSuccess) {
        LaunchedEffect(Unit) {
            onClearImportSuccess()
        }
    }
    
    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("词库管理") },
                actions = {
                    if (uiState.selectedLibraryId != null) {
                        TextButton(onClick = onNavigateToLearning) {
                            Text("开始学习")
                        }
                    }
                }
            )
        },
        floatingActionButton = {
            ExtendedFloatingActionButton(
                onClick = {
                    filePickerLauncher.launch(arrayOf(
                        "application/json",
                        "text/csv",
                        "text/plain",
                        "*/*"
                    ))
                },
                icon = { Icon(Icons.Default.Add, contentDescription = null) },
                text = { Text("导入词库") },
                containerColor = MaterialTheme.colorScheme.primary
            )
        },
        snackbarHost = {
            // 错误提示
            uiState.error?.let { error ->
                Snackbar(
                    modifier = Modifier.padding(16.dp),
                    action = {
                        TextButton(onClick = onClearError) {
                            Text("关闭")
                        }
                    }
                ) {
                    Text(error)
                }
            }
        }
    ) { paddingValues ->
        Box(
            modifier = modifier
                .fillMaxSize()
                .padding(paddingValues)
        ) {
            when {
                uiState.isLoading -> {
                    CircularProgressIndicator(
                        modifier = Modifier.align(Alignment.Center)
                    )
                }
                uiState.libraries.isEmpty() -> {
                    EmptyLibraryState(
                        modifier = Modifier.align(Alignment.Center)
                    )
                }
                else -> {
                    LazyColumn(
                        contentPadding = PaddingValues(16.dp),
                        verticalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        items(uiState.libraries, key = { it.id }) { library ->
                            LibraryCard(
                                library = library,
                                isSelected = library.id == uiState.selectedLibraryId,
                                onClick = { onSelectLibrary(library.id) },
                                onDelete = { showDeleteDialog = library.id }
                            )
                        }
                        
                        // 底部留空，避免FAB遮挡
                        item {
                            Spacer(modifier = Modifier.height(80.dp))
                        }
                    }
                }
            }
            
            // 导入中遮罩
            if (uiState.isImporting) {
                Box(
                    modifier = Modifier
                        .fillMaxSize()
                        .background(Color.Black.copy(alpha = 0.3f)),
                    contentAlignment = Alignment.Center
                ) {
                    Card(
                        modifier = Modifier.padding(32.dp),
                        shape = RoundedCornerShape(16.dp)
                    ) {
                        Column(
                            modifier = Modifier.padding(24.dp),
                            horizontalAlignment = Alignment.CenterHorizontally
                        ) {
                            CircularProgressIndicator()
                            Spacer(modifier = Modifier.height(16.dp))
                            Text("正在导入词库...")
                        }
                    }
                }
            }
        }
    }
    
    // 删除确认对话框
    showDeleteDialog?.let { libraryId ->
        val library = uiState.libraries.find { it.id == libraryId }
        AlertDialog(
            onDismissRequest = { showDeleteDialog = null },
            title = { Text("删除词库") },
            text = { Text("确定要删除词库「${library?.name}」吗？此操作不可恢复。") },
            confirmButton = {
                TextButton(
                    onClick = {
                        onDeleteLibrary(libraryId)
                        showDeleteDialog = null
                    },
                    colors = ButtonDefaults.textButtonColors(
                        contentColor = MaterialTheme.colorScheme.error
                    )
                ) {
                    Text("删除")
                }
            },
            dismissButton = {
                TextButton(onClick = { showDeleteDialog = null }) {
                    Text("取消")
                }
            }
        )
    }
}

/**
 * 词库卡片
 */
@Composable
private fun LibraryCard(
    library: WordLibrary,
    isSelected: Boolean,
    onClick: () -> Unit,
    onDelete: () -> Unit,
    modifier: Modifier = Modifier
) {
    Card(
        modifier = modifier
            .fillMaxWidth()
            .clickable(onClick = onClick),
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(
            containerColor = if (isSelected) 
                MaterialTheme.colorScheme.primaryContainer 
            else 
                MaterialTheme.colorScheme.surface
        ),
        elevation = CardDefaults.cardElevation(
            defaultElevation = if (isSelected) 4.dp else 1.dp
        )
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            // 选中标记
            if (isSelected) {
                Icon(
                    imageVector = Icons.Default.Check,
                    contentDescription = "已选中",
                    tint = MaterialTheme.colorScheme.primary,
                    modifier = Modifier.size(24.dp)
                )
                Spacer(modifier = Modifier.width(12.dp))
            }
            
            // 词库信息
            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = library.name,
                    fontSize = 18.sp,
                    fontWeight = FontWeight.Bold,
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis
                )
                Spacer(modifier = Modifier.height(4.dp))
                Row(
                    horizontalArrangement = Arrangement.spacedBy(16.dp)
                ) {
                    Text(
                        text = "${library.wordCount} 个单词",
                        fontSize = 14.sp,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                    Text(
                        text = library.format.name,
                        fontSize = 14.sp,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
            }
            
            // 删除按钮
            IconButton(onClick = onDelete) {
                Icon(
                    imageVector = Icons.Default.Delete,
                    contentDescription = "删除",
                    tint = MaterialTheme.colorScheme.error
                )
            }
        }
    }
}

/**
 * 空状态
 */
@Composable
private fun EmptyLibraryState(
    modifier: Modifier = Modifier
) {
    Column(
        modifier = modifier.padding(32.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Text(
            text = "📚",
            fontSize = 64.sp
        )
        Spacer(modifier = Modifier.height(16.dp))
        Text(
            text = "还没有词库",
            fontSize = 20.sp,
            fontWeight = FontWeight.Bold
        )
        Spacer(modifier = Modifier.height(8.dp))
        Text(
            text = "点击下方按钮导入词库文件\n支持 JSON、CSV、TXT 格式",
            fontSize = 14.sp,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
            textAlign = androidx.compose.ui.text.style.TextAlign.Center
        )
    }
}

/**
 * 获取文件名
 */
private fun getFileName(context: android.content.Context, uri: Uri): String? {
    return context.contentResolver.query(uri, null, null, null, null)?.use { cursor ->
        val nameIndex = cursor.getColumnIndex(android.provider.OpenableColumns.DISPLAY_NAME)
        cursor.moveToFirst()
        if (nameIndex >= 0) cursor.getString(nameIndex) else null
    }
}
