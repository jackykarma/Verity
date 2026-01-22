---
name: memory-specialist
description: Android 内存问题专家。分析和解决内存泄漏、OOM、内存抖动、内存占用过高等问题。使用 Memory Profiler、LeakCanary 定位泄漏源,提供修复方案。当出现 OutOfMemoryError、内存持续增长或频繁 GC 时使用。
---

# Memory Specialist - 内存问题专家

专门分析和解决 Android 应用的内存问题,包括内存泄漏、OOM、内存抖动等。

## 内存问题分析流程

### 第 1 步: 识别内存问题类型

#### 1. 内存泄漏 (Memory Leak)

**症状:**
- 内存占用持续增长
- 应用使用时间越长越慢
- 最终可能导致 OOM

**检测方法:**
```bash
# 使用 LeakCanary (推荐)
dependencies {
    debugImplementation 'com.squareup.leakcanary:leakcanary-android:2.12'
}

# 或使用 Memory Profiler
# Android Studio -> View -> Tool Windows -> Profiler
```

#### 2. OutOfMemoryError (OOM)

**症状:**
- 应用崩溃
- 日志显示 OOM

**日志特征:**
```
java.lang.OutOfMemoryError: Failed to allocate a 4194316 byte allocation with 2097152 free bytes and 2MB until OOM
```

#### 3. 内存抖动 (Memory Churn)

**症状:**
- 频繁 GC
- 应用卡顿
- Memory Profiler 显示锯齿状图形

**日志特征:**
```
GC_FOR_ALLOC freed 2MB, 8% free 50MB/54MB, paused 15ms
```

---

## 常见内存泄漏场景和解决方案

### 场景 1: Activity 泄漏

#### 原因 1: 静态引用

**问题代码:**
```kotlin
class MainActivity : AppCompatActivity() {
    companion object {
        // 静态变量持有 Activity 引用
        var instance: MainActivity? = null
    }
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        instance = this  // 泄漏!
    }
}
```

**解决方案:**
```kotlin
// 方案 1: 使用 WeakReference
class MainActivity : AppCompatActivity() {
    companion object {
        private var instanceRef: WeakReference<MainActivity>? = null
        
        fun getInstance(): MainActivity? = instanceRef?.get()
    }
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        instanceRef = WeakReference(this)
    }
}

// 方案 2: 避免静态引用 Activity
// 使用 Application Context 或其他设计模式
```

#### 原因 2: 非静态内部类持有外部引用

**问题代码:**
```kotlin
class MainActivity : AppCompatActivity() {
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        // 非静态内部类持有 Activity 引用
        val runnable = object : Runnable {
            override fun run() {
                // 长时间运行的任务
                Thread.sleep(10000)
            }
        }
        Thread(runnable).start()  // Activity 销毁后线程仍在运行
    }
}
```

**解决方案:**
```kotlin
// 方案 1: 使用静态内部类 + WeakReference
class MainActivity : AppCompatActivity() {
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        val runnable = MyRunnable(this)
        Thread(runnable).start()
    }
    
    private class MyRunnable(activity: MainActivity) : Runnable {
        private val activityRef = WeakReference(activity)
        
        override fun run() {
            Thread.sleep(10000)
            activityRef.get()?.let { activity ->
                // 使用 activity
            }
        }
    }
}

// 方案 2: 使用协程 (推荐)
class MainActivity : AppCompatActivity() {
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        // 协程会在 Activity 销毁时自动取消
        lifecycleScope.launch {
            delay(10000)
            // 执行任务
        }
    }
}
```

#### 原因 3: Handler 泄漏

**问题代码:**
```kotlin
class MainActivity : AppCompatActivity() {
    
    // 非静态 Handler 持有 Activity 引用
    private val handler = Handler(Looper.getMainLooper()) {
        // 处理消息
        true
    }
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        // 延迟消息可能在 Activity 销毁后才执行
        handler.postDelayed({
            // 访问 Activity
        }, 60000)
    }
}
```

**解决方案:**
```kotlin
// 方案 1: 静态 Handler + WeakReference
class MainActivity : AppCompatActivity() {
    
    private val handler = MyHandler(this)
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        handler.postDelayed(MyRunnable(this), 60000)
    }
    
    override fun onDestroy() {
        handler.removeCallbacksAndMessages(null)  // 清理所有消息
        super.onDestroy()
    }
    
    private class MyHandler(activity: MainActivity) : Handler(Looper.getMainLooper()) {
        private val activityRef = WeakReference(activity)
        
        override fun handleMessage(msg: Message) {
            activityRef.get()?.let { activity ->
                // 处理消息
            }
        }
    }
    
    private class MyRunnable(activity: MainActivity) : Runnable {
        private val activityRef = WeakReference(activity)
        
        override fun run() {
            activityRef.get()?.let { activity ->
                // 执行任务
            }
        }
    }
}

// 方案 2: 使用协程 (推荐)
class MainActivity : AppCompatActivity() {
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        lifecycleScope.launch {
            delay(60000)
            // 执行任务,自动取消
        }
    }
}
```

### 场景 2: 监听器泄漏

**问题代码:**
```kotlin
class MainActivity : AppCompatActivity() {
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        // 注册监听器但未取消注册
        SomeManager.getInstance().addListener(object : Listener {
            override fun onEvent() {
                // 访问 Activity
            }
        })
    }
}
```

**解决方案:**
```kotlin
class MainActivity : AppCompatActivity() {
    
    private val listener = object : Listener {
        override fun onEvent() {
            // 处理事件
        }
    }
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        SomeManager.getInstance().addListener(listener)
    }
    
    override fun onDestroy() {
        SomeManager.getInstance().removeListener(listener)
        super.onDestroy()
    }
}

// 或使用 Lifecycle-aware 组件
class MainActivity : AppCompatActivity() {
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        lifecycle.addObserver(object : DefaultLifecycleObserver {
            override fun onCreate(owner: LifecycleOwner) {
                SomeManager.getInstance().addListener(listener)
            }
            
            override fun onDestroy(owner: LifecycleOwner) {
                SomeManager.getInstance().removeListener(listener)
            }
        })
    }
}
```

### 场景 3: 单例持有 Context

**问题代码:**
```kotlin
class DataManager private constructor(private val context: Context) {
    
    companion object {
        @Volatile
        private var instance: DataManager? = null
        
        fun getInstance(context: Context): DataManager {
            return instance ?: synchronized(this) {
                instance ?: DataManager(context).also { instance = it }
            }
        }
    }
}

// 使用时传入 Activity Context
val manager = DataManager.getInstance(this)  // 泄漏!
```

**解决方案:**
```kotlin
// 方案 1: 使用 Application Context
class DataManager private constructor(context: Context) {
    private val appContext = context.applicationContext
    
    companion object {
        @Volatile
        private var instance: DataManager? = null
        
        fun getInstance(context: Context): DataManager {
            return instance ?: synchronized(this) {
                instance ?: DataManager(context.applicationContext)
                    .also { instance = it }
            }
        }
    }
}

// 方案 2: 使用依赖注入 (Hilt/Koin)
@Singleton
class DataManager @Inject constructor(
    @ApplicationContext private val context: Context
) {
    // 自动使用 Application Context
}
```

### 场景 4: 集合类泄漏

**问题代码:**
```kotlin
object EventBus {
    private val listeners = mutableListOf<Listener>()
    
    fun register(listener: Listener) {
        listeners.add(listener)
        // 忘记移除,导致泄漏
    }
}
```

**解决方案:**
```kotlin
// 方案 1: 提供 unregister 方法
object EventBus {
    private val listeners = mutableListOf<Listener>()
    
    fun register(listener: Listener) {
        listeners.add(listener)
    }
    
    fun unregister(listener: Listener) {
        listeners.remove(listener)
    }
}

// 方案 2: 使用 WeakReference
object EventBus {
    private val listeners = mutableListOf<WeakReference<Listener>>()
    
    fun register(listener: Listener) {
        listeners.add(WeakReference(listener))
    }
    
    fun notifyListeners() {
        listeners.removeAll { it.get() == null }  // 清理已回收的引用
        listeners.forEach { it.get()?.onEvent() }
    }
}
```

### 场景 5: Bitmap 泄漏

**问题代码:**
```kotlin
class ImageCache {
    private val cache = mutableMapOf<String, Bitmap>()
    
    fun put(key: String, bitmap: Bitmap) {
        cache[key] = bitmap  // Bitmap 永不释放
    }
}
```

**解决方案:**
```kotlin
// 方案 1: 使用 LruCache
class ImageCache {
    private val maxMemory = (Runtime.getRuntime().maxMemory() / 1024).toInt()
    private val cacheSize = maxMemory / 8
    
    private val cache = object : LruCache<String, Bitmap>(cacheSize) {
        override fun sizeOf(key: String, bitmap: Bitmap): Int {
            return bitmap.byteCount / 1024
        }
        
        override fun entryRemoved(
            evicted: Boolean,
            key: String,
            oldValue: Bitmap,
            newValue: Bitmap?
        ) {
            if (evicted) {
                oldValue.recycle()  // 回收 Bitmap
            }
        }
    }
    
    fun put(key: String, bitmap: Bitmap) {
        cache.put(key, bitmap)
    }
    
    fun get(key: String): Bitmap? = cache.get(key)
}

// 方案 2: 使用 Glide/Coil 等图片加载库
Glide.with(context)
    .load(imageUrl)
    .into(imageView)  // 自动管理内存
```

---

## OOM 问题解决方案

### 1. Bitmap OOM

**问题:**
```
OutOfMemoryError: Failed to allocate a 4194316 byte allocation
```

**解决方案:**

```kotlin
// 方案 1: 压缩加载大图片
fun decodeSampledBitmap(
    filePath: String,
    reqWidth: Int,
    reqHeight: Int
): Bitmap {
    return BitmapFactory.Options().run {
        // 首先获取图片尺寸
        inJustDecodeBounds = true
        BitmapFactory.decodeFile(filePath, this)
        
        // 计算 inSampleSize
        inSampleSize = calculateInSampleSize(this, reqWidth, reqHeight)
        
        // 实际解码图片
        inJustDecodeBounds = false
        inPreferredConfig = Bitmap.Config.RGB_565  // 减少内存占用
        
        BitmapFactory.decodeFile(filePath, this)
    }
}

fun calculateInSampleSize(
    options: BitmapFactory.Options,
    reqWidth: Int,
    reqHeight: Int
): Int {
    val (height: Int, width: Int) = options.run { outHeight to outWidth }
    var inSampleSize = 1
    
    if (height > reqHeight || width > reqWidth) {
        val halfHeight: Int = height / 2
        val halfWidth: Int = width / 2
        
        while (halfHeight / inSampleSize >= reqHeight &&
               halfWidth / inSampleSize >= reqWidth) {
            inSampleSize *= 2
        }
    }
    
    return inSampleSize
}

// 方案 2: 使用图片加载库
Glide.with(context)
    .load(imageUrl)
    .override(targetWidth, targetHeight)
    .format(DecodeFormat.PREFER_RGB_565)
    .diskCacheStrategy(DiskCacheStrategy.ALL)
    .into(imageView)

// 方案 3: 及时回收 Bitmap
private var bitmap: Bitmap? = null

override fun onDestroy() {
    bitmap?.recycle()
    bitmap = null
    super.onDestroy()
}
```

### 2. 大对象 OOM

**问题:**
```kotlin
// 一次性加载大量数据
val allData = database.getAllRecords()  // 100万条记录
```

**解决方案:**
```kotlin
// 方案 1: 分页加载
fun loadDataPage(page: Int, pageSize: Int = 100): List<Record> {
    val offset = page * pageSize
    return database.getRecords(limit = pageSize, offset = offset)
}

// 方案 2: 使用 Paging 库
@Dao
interface RecordDao {
    @Query("SELECT * FROM records")
    fun getAllRecordsPaged(): PagingSource<Int, Record>
}

val pager = Pager(
    config = PagingConfig(pageSize = 20),
    pagingSourceFactory = { recordDao.getAllRecordsPaged() }
).flow

// 方案 3: 使用 Flow 流式处理
@Dao
interface RecordDao {
    @Query("SELECT * FROM records")
    fun getAllRecordsFlow(): Flow<List<Record>>
}

recordDao.getAllRecordsFlow()
    .collect { records ->
        processRecords(records)
    }
```

### 3. 增加堆内存 (临时方案)

**在 AndroidManifest.xml 中:**
```xml
<application
    android:largeHeap="true"
    ...>
```

**注意:** 这只是临时方案,应该优先优化代码减少内存使用。

---

## 内存抖动解决方案

### 问题: 频繁创建临时对象

**问题代码:**
```kotlin
// 在循环或频繁调用的方法中创建对象
override fun onDraw(canvas: Canvas) {
    for (i in 0 until 100) {
        val paint = Paint()  // 每次循环创建新对象
        canvas.drawCircle(i * 10f, 50f, 5f, paint)
    }
}
```

**解决方案:**
```kotlin
// 方案 1: 对象复用
private val paint = Paint()

override fun onDraw(canvas: Canvas) {
    for (i in 0 until 100) {
        canvas.drawCircle(i * 10f, 50f, 5f, paint)  // 复用对象
    }
}

// 方案 2: 对象池
class PaintPool(private val maxSize: Int = 10) {
    private val pool = mutableListOf<Paint>()
    
    fun acquire(): Paint {
        return if (pool.isNotEmpty()) {
            pool.removeAt(pool.size - 1)
        } else {
            Paint()
        }
    }
    
    fun release(paint: Paint) {
        if (pool.size < maxSize) {
            paint.reset()
            pool.add(paint)
        }
    }
}

// 方案 3: 使用 StringBuilder 而非字符串拼接
// 问题
fun buildString(items: List<String>): String {
    var result = ""
    for (item in items) {
        result += item  // 每次创建新字符串
    }
    return result
}

// 解决
fun buildString(items: List<String>): String {
    return StringBuilder().apply {
        for (item in items) {
            append(item)
        }
    }.toString()
}
```

---

## 内存分析工具

### 1. LeakCanary (推荐)

**集成:**
```gradle
dependencies {
    debugImplementation 'com.squareup.leakcanary:leakcanary-android:2.12'
}
```

**自动检测:**
- Activity 泄漏
- Fragment 泄漏
- View 泄漏
- ViewModel 泄漏

### 2. Memory Profiler

**使用步骤:**
1. Android Studio -> View -> Tool Windows -> Profiler
2. 选择应用进程
3. 点击 Memory 时间轴
4. 执行操作并观察内存变化
5. 点击 "Dump Java heap" 捕获堆转储
6. 分析对象引用链

### 3. MAT (Memory Analyzer Tool)

**导出 hprof 文件:**
```bash
adb shell am dumpheap <package-name> /data/local/tmp/heap.hprof
adb pull /data/local/tmp/heap.hprof
```

**转换格式:**
```bash
hprof-conv heap.hprof heap-converted.hprof
```

**使用 MAT 分析:**
- Histogram: 查看对象实例数量
- Dominator Tree: 查看对象占用内存
- Leak Suspects: 自动检测泄漏

---

## 内存优化最佳实践

### 1. 及时释放资源

```kotlin
class MyActivity : AppCompatActivity() {
    private var mediaPlayer: MediaPlayer? = null
    private var database: SQLiteDatabase? = null
    
    override fun onDestroy() {
        // 释放 MediaPlayer
        mediaPlayer?.release()
        mediaPlayer = null
        
        // 关闭数据库
        database?.close()
        database = null
        
        super.onDestroy()
    }
}
```

### 2. 使用 Application Context

```kotlin
// 错误: 使用 Activity Context
class Singleton private constructor(context: Context) {
    private val ctx = context  // 可能泄漏
}

// 正确: 使用 Application Context
class Singleton private constructor(context: Context) {
    private val ctx = context.applicationContext
}
```

### 3. 避免静态 View

```kotlin
// 错误
companion object {
    var staticView: View? = null
}

// 正确: 不要持有 View 的静态引用
```

### 4. 使用 WeakReference

```kotlin
class MyClass(activity: Activity) {
    private val activityRef = WeakReference(activity)
    
    fun doSomething() {
        activityRef.get()?.let { activity ->
            // 使用 activity
        } ?: run {
            // Activity 已被回收
        }
    }
}
```

### 5. 监听内存警告

```kotlin
override fun onTrimMemory(level: Int) {
    super.onTrimMemory(level)
    when (level) {
        TRIM_MEMORY_RUNNING_MODERATE,
        TRIM_MEMORY_RUNNING_LOW,
        TRIM_MEMORY_RUNNING_CRITICAL -> {
            // 清理缓存
            clearCache()
        }
        TRIM_MEMORY_UI_HIDDEN -> {
            // UI 不可见,释放 UI 资源
            releaseUIResources()
        }
    }
}
```

---

## 内存分析报告模板

```markdown
# 内存问题分析报告

## 问题概述
- **类型:** [内存泄漏/OOM/内存抖动]
- **症状:** [具体表现]
- **影响:** [对应用的影响]

## 内存数据
- 初始内存: XXMB
- 峰值内存: XXMB
- 泄漏对象: [对象类型和数量]

## 泄漏分析
**泄漏对象:** [类名]
**引用链:**
\`\`\`
[GC Root] -> [引用链] -> [泄漏对象]
\`\`\`

## 根因
[详细的根因说明]

## 修复方案
\`\`\`kotlin
[修复代码]
\`\`\`

## 验证结果
- 修复前内存: XXMB
- 修复后内存: XXMB
- 泄漏是否解决: [是/否]

## 预防措施
[避免类似问题的建议]
```
