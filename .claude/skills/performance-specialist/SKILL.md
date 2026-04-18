---
name: performance-specialist
description: Android 性能优化专家。分析和解决应用卡顿、启动慢、帧率下降、CPU/GPU 过载、主线程阻塞等性能问题。当应用响应慢、滑动不流畅、启动时间长或出现性能瓶颈时使用。
---

# Performance Specialist - 性能优化专家

专门分析和优化 Android 应用性能问题,包括卡顿、慢启动、帧率下降等。

## 性能分析流程

### 第 1 步: 性能指标收集

**关键指标:**
- **启动时间:** 冷启动、温启动、热启动
- **帧率 (FPS):** 目标 60 FPS (16.67ms/帧)
- **CPU 使用率:** 各线程的 CPU 占用
- **内存使用:** 堆内存、Native 内存
- **网络延迟:** API 响应时间
- **磁盘 I/O:** 读写操作耗时

**收集工具:**
```bash
# 使用 adb 收集性能数据
adb shell dumpsys gfxinfo <package-name> framestats

# CPU 分析
adb shell top -n 1 | grep <package-name>

# 内存分析
adb shell dumpsys meminfo <package-name>
```

### 第 2 步: 识别性能瓶颈

#### 启动性能问题

**症状:**
- 冷启动时间 > 3 秒
- 白屏或黑屏时间长
- 启动过程卡顿

**分析方法:**
```kotlin
// 使用 Startup Profiler 或手动计时
class MyApplication : Application() {
    override fun onCreate() {
        val startTime = System.currentTimeMillis()
        super.onCreate()
        
        // 初始化操作
        initializeLibraries()
        
        val duration = System.currentTimeMillis() - startTime
        Log.d("Startup", "Application onCreate: ${duration}ms")
    }
}
```

**常见问题和解决方案:**

1. **Application.onCreate() 耗时过长**
```kotlin
// 问题: 同步初始化所有库
class MyApplication : Application() {
    override fun onCreate() {
        super.onCreate()
        initFirebase()      // 100ms
        initAnalytics()     // 50ms
        initImageLoader()   // 80ms
        initDatabase()      // 150ms
        // 总计: 380ms
    }
}

// 解决方案 1: 延迟初始化
class MyApplication : Application() {
    override fun onCreate() {
        super.onCreate()
        
        // 只初始化关键库
        initCrashReporting()  // 必须同步
        
        // 其他库延迟初始化
        GlobalScope.launch(Dispatchers.IO) {
            initFirebase()
            initAnalytics()
        }
    }
    
    // 按需初始化
    val imageLoader by lazy { initImageLoader() }
}

// 解决方案 2: 使用 App Startup 库
class FirebaseInitializer : Initializer<FirebaseApp> {
    override fun create(context: Context): FirebaseApp {
        return FirebaseApp.initializeApp(context)
    }
    
    override fun dependencies(): List<Class<out Initializer<*>>> {
        return emptyList()
    }
}
```

2. **首屏 Activity 加载慢**
```kotlin
// 问题: onCreate 中执行耗时操作
class MainActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)
        
        // 耗时操作阻塞 UI
        loadUserData()      // 200ms
        loadConfiguration() // 150ms
        setupViews()        // 100ms
    }
}

// 解决方案: 异步加载 + 占位符
class MainActivity : AppCompatActivity() {
    private val viewModel: MainViewModel by viewModels()
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)
        
        // 立即显示占位符
        showLoadingState()
        
        // 异步加载数据
        lifecycleScope.launch {
            val data = viewModel.loadData()
            showContent(data)
        }
    }
}
```

3. **布局复杂导致 inflate 慢**
```kotlin
// 问题: 深层嵌套布局
<LinearLayout>
    <RelativeLayout>
        <LinearLayout>
            <FrameLayout>
                <!-- 多层嵌套 -->
            </FrameLayout>
        </LinearLayout>
    </RelativeLayout>
</LinearLayout>

// 解决方案 1: 使用 ConstraintLayout 扁平化
<androidx.constraintlayout.widget.ConstraintLayout>
    <!-- 单层布局实现相同效果 -->
</androidx.constraintlayout.widget.ConstraintLayout>

// 解决方案 2: 使用 ViewStub 延迟加载
<ViewStub
    android:id="@+id/stub_complex_view"
    android:layout="@layout/complex_view"
    android:inflateId="@+id/complex_view" />

// 需要时才 inflate
binding.stubComplexView.inflate()
```

#### UI 渲染性能问题

**症状:**
- 滑动卡顿
- 掉帧 (Skipped frames)
- 动画不流畅

**分析日志:**
```
Choreographer: Skipped 45 frames! The application may be doing too much work on its main thread.
```

**常见问题和解决方案:**

1. **RecyclerView 滑动卡顿**
```kotlin
// 问题: onBindViewHolder 中执行耗时操作
class MyAdapter : RecyclerView.Adapter<ViewHolder>() {
    override fun onBindViewHolder(holder: ViewHolder, position: Int) {
        val item = items[position]
        
        // 问题 1: 主线程加载图片
        val bitmap = BitmapFactory.decodeFile(item.imagePath)
        holder.imageView.setImageBitmap(bitmap)
        
        // 问题 2: 复杂计算
        val result = complexCalculation(item.data)
        holder.textView.text = result
        
        // 问题 3: 频繁创建对象
        holder.itemView.setOnClickListener {
            // 每次 bind 都创建新的 listener
        }
    }
}

// 解决方案: 优化 onBindViewHolder
class MyAdapter : RecyclerView.Adapter<ViewHolder>() {
    private val imageLoader = ImageLoader.getInstance()
    
    override fun onBindViewHolder(holder: ViewHolder, position: Int) {
        val item = items[position]
        
        // 解决方案 1: 使用图片加载库
        imageLoader.load(item.imagePath)
            .placeholder(R.drawable.placeholder)
            .into(holder.imageView)
        
        // 解决方案 2: 预计算数据
        holder.textView.text = item.preCalculatedResult
        
        // 解决方案 3: 在 ViewHolder 中设置 listener
        // (在 onCreateViewHolder 中设置,不在 onBindViewHolder)
    }
    
    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ViewHolder {
        val holder = ViewHolder(/* ... */)
        holder.itemView.setOnClickListener {
            val position = holder.adapterPosition
            if (position != RecyclerView.NO_POSITION) {
                onItemClick(items[position])
            }
        }
        return holder
    }
}

// 解决方案 4: 使用 DiffUtil 避免全量刷新
class MyAdapter : ListAdapter<Item, ViewHolder>(ItemDiffCallback()) {
    // submitList 会自动计算差异并局部刷新
}

// 解决方案 5: 设置 RecyclerView 优化
recyclerView.apply {
    setHasFixedSize(true)  // 如果 item 大小固定
    setItemViewCacheSize(20)  // 增加缓存
    recycledViewPool.setMaxRecycledViews(0, 20)
}
```

2. **过度绘制 (Overdraw)**
```kotlin
// 问题: 多层背景重叠绘制
<LinearLayout android:background="@color/white">
    <FrameLayout android:background="@color/white">
        <TextView android:background="@color/white" />
    </FrameLayout>
</LinearLayout>

// 解决方案: 移除不必要的背景
<LinearLayout android:background="@color/white">
    <FrameLayout>  <!-- 移除背景 -->
        <TextView />  <!-- 移除背景 -->
    </FrameLayout>
</LinearLayout>

// 或在代码中移除 Window 背景
override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    // 如果布局有自己的背景,移除 Window 背景
    window.setBackgroundDrawable(null)
    setContentView(R.layout.activity_main)
}
```

3. **布局层级过深**
```kotlin
// 使用 Layout Inspector 检查层级
// Android Studio -> Tools -> Layout Inspector

// 问题: 深层嵌套
<LinearLayout>          <!-- 层级 1 -->
    <RelativeLayout>    <!-- 层级 2 -->
        <LinearLayout>  <!-- 层级 3 -->
            <TextView /> <!-- 层级 4 -->
        </LinearLayout>
    </RelativeLayout>
</LinearLayout>

// 解决方案: 使用 ConstraintLayout 扁平化
<androidx.constraintlayout.widget.ConstraintLayout>
    <TextView
        app:layout_constraintTop_toTopOf="parent"
        app:layout_constraintStart_toStartOf="parent" />
</androidx.constraintlayout.widget.ConstraintLayout>
```

4. **自定义 View 绘制性能**
```kotlin
// 问题: onDraw 中创建对象和耗时操作
class MyView : View {
    override fun onDraw(canvas: Canvas) {
        super.onDraw(canvas)
        
        // 问题 1: 在 onDraw 中创建 Paint
        val paint = Paint().apply {
            color = Color.RED
            strokeWidth = 5f
        }
        
        // 问题 2: 复杂计算
        val points = calculatePoints()
        
        canvas.drawLine(0f, 0f, 100f, 100f, paint)
    }
}

// 解决方案: 预创建对象,缓存计算结果
class MyView : View {
    // 在构造函数或 init 中创建
    private val paint = Paint().apply {
        color = Color.RED
        strokeWidth = 5f
        isAntiAlias = true
    }
    
    private var cachedPoints: FloatArray? = null
    
    override fun onSizeChanged(w: Int, h: Int, oldw: Int, oldh: Int) {
        super.onSizeChanged(w, h, oldw, oldh)
        // 在尺寸变化时预计算
        cachedPoints = calculatePoints(w, h)
    }
    
    override fun onDraw(canvas: Canvas) {
        super.onDraw(canvas)
        cachedPoints?.let { points ->
            canvas.drawLines(points, paint)
        }
    }
}
```

#### 内存性能问题

**症状:**
- 频繁 GC 导致卡顿
- 内存抖动
- 内存占用持续增长

**分析方法:**
```bash
# 查看 GC 日志
adb logcat | grep "GC_"

# 输出示例
GC_FOR_ALLOC freed 2MB, 8% free 50MB/54MB, paused 15ms
```

**解决方案:**

1. **避免内存抖动**
```kotlin
// 问题: 频繁创建临时对象
fun processData(items: List<Item>) {
    for (item in items) {
        val temp = TempObject(item)  // 每次循环创建新对象
        process(temp)
    }
}

// 解决方案: 对象复用
fun processData(items: List<Item>) {
    val temp = TempObject()  // 复用对象
    for (item in items) {
        temp.update(item)
        process(temp)
    }
}

// 或使用对象池
class ObjectPool<T>(private val factory: () -> T) {
    private val pool = mutableListOf<T>()
    
    fun acquire(): T = pool.removeLastOrNull() ?: factory()
    
    fun release(obj: T) {
        pool.add(obj)
    }
}
```

2. **优化 Bitmap 内存**
```kotlin
// 问题: 加载大图片
val bitmap = BitmapFactory.decodeResource(resources, R.drawable.large_image)

// 解决方案 1: 压缩加载
fun decodeSampledBitmap(res: Resources, resId: Int, reqWidth: Int, reqHeight: Int): Bitmap {
    return BitmapFactory.Options().run {
        inJustDecodeBounds = true
        BitmapFactory.decodeResource(res, resId, this)
        
        inSampleSize = calculateInSampleSize(this, reqWidth, reqHeight)
        inJustDecodeBounds = false
        inPreferredConfig = Bitmap.Config.RGB_565  // 减少内存占用
        
        BitmapFactory.decodeResource(res, resId, this)
    }
}

// 解决方案 2: 及时回收
override fun onDestroy() {
    bitmap?.recycle()
    bitmap = null
    super.onDestroy()
}

// 解决方案 3: 使用图片加载库
Glide.with(this)
    .load(imageUrl)
    .override(targetWidth, targetHeight)
    .format(DecodeFormat.PREFER_RGB_565)
    .into(imageView)
```

#### CPU 性能问题

**症状:**
- CPU 使用率过高
- 设备发热
- 电池消耗快

**分析工具:**
- Android Studio Profiler
- Systrace
- Traceview

**常见问题和解决方案:**

1. **主线程耗时操作**
```kotlin
// 问题: 主线程执行耗时任务
fun loadData() {
    val data = database.query()  // 阻塞主线程
    val processed = processData(data)  // 耗时计算
    updateUI(processed)
}

// 解决方案: 使用协程
suspend fun loadData() {
    val data = withContext(Dispatchers.IO) {
        database.query()  // IO 线程
    }
    val processed = withContext(Dispatchers.Default) {
        processData(data)  // 计算线程
    }
    withContext(Dispatchers.Main) {
        updateUI(processed)  // 主线程
    }
}
```

2. **不必要的计算**
```kotlin
// 问题: 重复计算
class MyView : View {
    override fun onDraw(canvas: Canvas) {
        val width = width / 2  // 每次 onDraw 都计算
        val height = height / 2
        // ...
    }
}

// 解决方案: 缓存计算结果
class MyView : View {
    private var centerX = 0f
    private var centerY = 0f
    
    override fun onSizeChanged(w: Int, h: Int, oldw: Int, oldh: Int) {
        super.onSizeChanged(w, h, oldw, oldh)
        centerX = w / 2f
        centerY = h / 2f
    }
    
    override fun onDraw(canvas: Canvas) {
        // 直接使用缓存值
        canvas.drawCircle(centerX, centerY, 50f, paint)
    }
}
```

3. **算法优化**
```kotlin
// 问题: O(n²) 算法
fun findDuplicates(list: List<Int>): List<Int> {
    val duplicates = mutableListOf<Int>()
    for (i in list.indices) {
        for (j in i + 1 until list.size) {
            if (list[i] == list[j]) {
                duplicates.add(list[i])
            }
        }
    }
    return duplicates
}

// 解决方案: 使用 HashSet,O(n)
fun findDuplicates(list: List<Int>): List<Int> {
    val seen = mutableSetOf<Int>()
    val duplicates = mutableSetOf<Int>()
    for (item in list) {
        if (!seen.add(item)) {
            duplicates.add(item)
        }
    }
    return duplicates.toList()
}
```

---

## 性能优化检查清单

### 启动优化
- [ ] Application.onCreate() < 100ms
- [ ] 延迟初始化非关键库
- [ ] 使用 App Startup 库管理初始化
- [ ] 首屏 Activity 快速显示占位符
- [ ] 优化布局层级和复杂度

### UI 渲染优化
- [ ] RecyclerView onBindViewHolder < 16ms
- [ ] 使用 DiffUtil 局部刷新
- [ ] 移除过度绘制
- [ ] 布局层级 < 10 层
- [ ] 自定义 View 避免在 onDraw 中创建对象

### 内存优化
- [ ] 避免内存泄漏
- [ ] 图片压缩加载
- [ ] 及时释放资源
- [ ] 避免内存抖动
- [ ] 使用对象池复用对象

### CPU 优化
- [ ] 耗时操作在后台线程
- [ ] 缓存计算结果
- [ ] 优化算法复杂度
- [ ] 减少不必要的计算
- [ ] 使用硬件加速

### 网络优化
- [ ] 使用缓存减少请求
- [ ] 批量请求合并
- [ ] 压缩数据传输
- [ ] 使用 CDN
- [ ] 实现请求重试和超时

---

## 性能监控

### 使用 StrictMode 检测违规

```kotlin
class MyApplication : Application() {
    override fun onCreate() {
        super.onCreate()
        
        if (BuildConfig.DEBUG) {
            StrictMode.setThreadPolicy(
                StrictMode.ThreadPolicy.Builder()
                    .detectDiskReads()
                    .detectDiskWrites()
                    .detectNetwork()
                    .detectCustomSlowCalls()
                    .penaltyLog()
                    .penaltyDialog()
                    .build()
            )
            
            StrictMode.setVmPolicy(
                StrictMode.VmPolicy.Builder()
                    .detectLeakedSqlLiteObjects()
                    .detectLeakedClosableObjects()
                    .detectActivityLeaks()
                    .penaltyLog()
                    .build()
            )
        }
    }
}
```

### 自定义性能监控

```kotlin
object PerformanceMonitor {
    fun measureTime(tag: String, block: () -> Unit) {
        val startTime = System.currentTimeMillis()
        block()
        val duration = System.currentTimeMillis() - startTime
        
        if (duration > 16) {  // 超过一帧时间
            Log.w("Performance", "$tag took ${duration}ms")
        }
    }
}

// 使用
PerformanceMonitor.measureTime("LoadData") {
    loadData()
}
```

---

## 性能分析报告模板

```markdown
# 性能分析报告

## 问题概述
- **类型:** [启动慢/卡顿/掉帧]
- **场景:** [具体场景描述]
- **指标:** [具体性能数据]

## 性能数据
- 启动时间: XXms
- 帧率: XX FPS
- CPU 使用率: XX%
- 内存占用: XXMB

## 瓶颈分析
[详细的瓶颈说明和证据]

## 优化方案
\`\`\`kotlin
[优化代码]
\`\`\`

## 优化效果
- 优化前: XXms
- 优化后: XXms
- 提升: XX%

## 建议
[长期优化建议]
```
