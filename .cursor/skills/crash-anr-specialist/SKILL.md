---
name: crash-anr-specialist
description: Android 崩溃和 ANR 专家。分析应用崩溃、无响应、异常堆栈跟踪、ANR traces,定位根因并提供修复方案。当应用崩溃、强制关闭、ANR 或出现未捕获异常时使用。
---

# Crash / ANR Specialist - 崩溃和 ANR 专家

专门分析和解决 Android 应用崩溃和 ANR (Application Not Responding) 问题。

## 崩溃分析流程

### 第 1 步: 收集崩溃信息

**必需信息:**
- 完整的堆栈跟踪 (Stack Trace)
- 异常类型和消息
- 崩溃发生的代码位置
- Android 版本和设备信息

**从 logcat 提取:**
```bash
adb logcat -d | grep -A 50 "FATAL EXCEPTION"
```

### 第 2 步: 分析异常类型

#### NullPointerException (NPE)
**症状:** 访问空对象的方法或属性

**分析清单:**
- [ ] 确定哪个对象为 null
- [ ] 追溯对象的初始化位置
- [ ] 检查生命周期问题 (Activity/Fragment)
- [ ] 查看异步回调时机

**修复模式:**
```kotlin
// 问题代码
val name = user.getName()  // user 可能为 null

// 修复方案 1: 空值检查
val name = user?.getName() ?: "Unknown"

// 修复方案 2: 提前返回
if (user == null) {
    Log.e(TAG, "User is null")
    return
}
val name = user.getName()

// 修复方案 3: 使用 lateinit 和初始化检查
private lateinit var user: User

fun updateUI() {
    if (!::user.isInitialized) {
        Log.e(TAG, "User not initialized")
        return
    }
    val name = user.getName()
}
```

#### IndexOutOfBoundsException
**症状:** 访问数组或列表的无效索引

**分析清单:**
- [ ] 检查索引计算逻辑
- [ ] 验证集合大小
- [ ] 查看并发修改
- [ ] 检查边界条件

**修复模式:**
```kotlin
// 问题代码
val item = list[position]  // position 可能越界

// 修复方案 1: 边界检查
if (position >= 0 && position < list.size) {
    val item = list[position]
} else {
    Log.e(TAG, "Invalid position: $position, size: ${list.size}")
}

// 修复方案 2: 使用 getOrNull
val item = list.getOrNull(position) ?: return

// 修复方案 3: 使用 safe index
val safePosition = position.coerceIn(0, list.size - 1)
val item = list[safePosition]
```

#### IllegalStateException
**症状:** 对象状态不正确时调用方法

**常见场景:**
- Fragment 已 detached 时操作 UI
- Activity 已销毁时执行回调
- 生命周期状态错误

**修复模式:**
```kotlin
// 场景 1: Fragment 事务
// 问题代码
fragmentManager.beginTransaction()
    .replace(R.id.container, fragment)
    .commit()  // 可能在 onSaveInstanceState 后调用

// 修复方案
if (!isStateSaved) {
    fragmentManager.beginTransaction()
        .replace(R.id.container, fragment)
        .commitAllowingStateLoss()
}

// 场景 2: 异步回调
// 问题代码
apiCall.enqueue(object : Callback {
    override fun onResponse(response: Response) {
        updateUI(response)  // Activity 可能已销毁
    }
})

// 修复方案
apiCall.enqueue(object : Callback {
    override fun onResponse(response: Response) {
        if (!isFinishing && !isDestroyed) {
            updateUI(response)
        }
    }
})
```

#### ClassCastException
**症状:** 类型转换失败

**修复模式:**
```kotlin
// 问题代码
val user = obj as User  // obj 可能不是 User 类型

// 修复方案 1: 安全转换
val user = obj as? User ?: run {
    Log.e(TAG, "Object is not User type: ${obj::class.java}")
    return
}

// 修复方案 2: 类型检查
if (obj is User) {
    val user = obj
    // 使用 user
}
```

#### ConcurrentModificationException
**症状:** 迭代时修改集合

**修复模式:**
```kotlin
// 问题代码
for (item in list) {
    if (condition) {
        list.remove(item)  // 迭代时修改
    }
}

// 修复方案 1: 使用 Iterator
val iterator = list.iterator()
while (iterator.hasNext()) {
    val item = iterator.next()
    if (condition) {
        iterator.remove()
    }
}

// 修复方案 2: 使用新列表
val itemsToRemove = list.filter { condition }
list.removeAll(itemsToRemove)

// 修复方案 3: 使用 removeIf
list.removeIf { condition }
```

### 第 3 步: 分析崩溃上下文

**检查项:**
1. **生命周期状态** - Activity/Fragment 是否处于正确状态
2. **线程安全** - 是否在正确的线程操作
3. **资源状态** - 资源是否已释放或未初始化
4. **依赖注入** - 依赖是否正确注入
5. **配置变更** - 是否处理了屏幕旋转等配置变更

---

## ANR 分析流程

### 第 1 步: 获取 ANR Trace

**从设备提取:**
```bash
adb pull /data/anr/traces.txt
```

**从 Logcat 查看:**
```bash
adb logcat -d | grep -A 100 "ANR in"
```

### 第 2 步: 分析 ANR 类型

#### Input Dispatching Timeout
**症状:** 5 秒内未响应触摸事件

**常见原因:**
- 主线程执行耗时操作
- 网络请求在主线程
- 数据库操作在主线程
- 大量计算在主线程
- 死锁

**分析 Trace:**
```
"main" prio=5 tid=1 BLOCKED
  | group="main" sCount=1 dsCount=0 flags=1 obj=0x74b38080 self=0x7f8c014c00
  | sysTid=12345 nice=-10 cgrp=default sched=0/0 handle=0x7f8c014c00
  | state=S schedstat=( 123456789 0 123 ) utm=12 stm=3 core=2 HZ=100
  | stack=0x7f8c014c00-0x7f8c014d00 stackSize=8MB
  at com.example.MainActivity.loadData(MainActivity.java:123)
  - waiting to lock <0x12345678> (a java.lang.Object) held by thread 15
```

**关键信息:**
- `BLOCKED` - 线程被阻塞
- `waiting to lock` - 等待锁
- 堆栈显示阻塞位置

#### Broadcast Timeout
**症状:** BroadcastReceiver 10 秒内未完成

**修复方案:**
```kotlin
// 问题代码
class MyReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        // 耗时操作在主线程
        val data = fetchDataFromNetwork()
        processData(data)
    }
}

// 修复方案: 使用 WorkManager
class MyReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        val workRequest = OneTimeWorkRequestBuilder<MyWorker>()
            .build()
        WorkManager.getInstance(context).enqueue(workRequest)
    }
}

class MyWorker(context: Context, params: WorkerParameters) 
    : Worker(context, params) {
    override fun doWork(): Result {
        val data = fetchDataFromNetwork()
        processData(data)
        return Result.success()
    }
}
```

#### Service Timeout
**症状:** Service 启动后 20 秒内未完成

**修复方案:**
```kotlin
// 问题代码
class MyService : Service() {
    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        // 耗时操作
        processLargeFile()
        return START_STICKY
    }
}

// 修复方案: 使用后台线程
class MyService : Service() {
    private val scope = CoroutineScope(Dispatchers.IO + SupervisorJob())
    
    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        scope.launch {
            processLargeFile()
            stopSelf(startId)
        }
        return START_STICKY
    }
    
    override fun onDestroy() {
        scope.cancel()
        super.onDestroy()
    }
}
```

### 第 3 步: 定位主线程阻塞

**常见阻塞原因:**

1. **网络请求**
```kotlin
// 错误: 主线程网络请求
val response = URL(url).readText()  // 阻塞主线程

// 正确: 后台线程
viewModelScope.launch(Dispatchers.IO) {
    val response = URL(url).readText()
    withContext(Dispatchers.Main) {
        updateUI(response)
    }
}
```

2. **数据库操作**
```kotlin
// 错误: 主线程数据库操作
val users = database.userDao().getAllUsers()

// 正确: 使用 Flow 或 suspend
@Dao
interface UserDao {
    @Query("SELECT * FROM users")
    fun getAllUsersFlow(): Flow<List<User>>
    
    @Query("SELECT * FROM users")
    suspend fun getAllUsers(): List<User>
}
```

3. **文件 I/O**
```kotlin
// 错误: 主线程读文件
val content = File(path).readText()

// 正确: 后台线程
withContext(Dispatchers.IO) {
    val content = File(path).readText()
}
```

4. **大量计算**
```kotlin
// 错误: 主线程计算
val result = complexCalculation(largeData)

// 正确: 后台线程
val result = withContext(Dispatchers.Default) {
    complexCalculation(largeData)
}
```

---

## 崩溃防护策略

### 1. 全局异常捕获

```kotlin
class CrashHandler : Thread.UncaughtExceptionHandler {
    private val defaultHandler = Thread.getDefaultUncaughtExceptionHandler()
    
    override fun uncaughtException(thread: Thread, throwable: Throwable) {
        // 记录崩溃信息
        logCrash(throwable)
        
        // 上报到服务器
        reportCrash(throwable)
        
        // 调用默认处理器
        defaultHandler?.uncaughtException(thread, throwable)
    }
    
    private fun logCrash(throwable: Throwable) {
        val crashInfo = """
            Time: ${System.currentTimeMillis()}
            Thread: ${Thread.currentThread().name}
            Exception: ${throwable.javaClass.name}
            Message: ${throwable.message}
            StackTrace: ${Log.getStackTraceString(throwable)}
        """.trimIndent()
        
        // 写入文件
        File(crashDir, "crash_${System.currentTimeMillis()}.txt")
            .writeText(crashInfo)
    }
}

// 在 Application 中注册
class MyApplication : Application() {
    override fun onCreate() {
        super.onCreate()
        Thread.setDefaultUncaughtExceptionHandler(CrashHandler())
    }
}
```

### 2. 生命周期安全

```kotlin
// 使用 Lifecycle-aware 组件
class MyActivity : AppCompatActivity() {
    private val viewModel: MyViewModel by viewModels()
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        // 使用 lifecycleScope,自动取消
        lifecycleScope.launch {
            viewModel.dataFlow.collect { data ->
                updateUI(data)
            }
        }
    }
}
```

### 3. 空值安全

```kotlin
// 使用 Kotlin 的空值安全特性
data class User(
    val id: String,
    val name: String?,  // 可空
    val email: String   // 非空
)

fun displayUser(user: User?) {
    // 安全调用
    val name = user?.name ?: "Unknown"
    
    // let 作用域
    user?.let {
        println("User: ${it.name}")
    }
    
    // Elvis 操作符
    val email = user?.email ?: return
}
```

---

## 常见崩溃场景和解决方案

### 场景 1: Fragment 事务崩溃

**问题:**
```
IllegalStateException: Can not perform this action after onSaveInstanceState
```

**解决方案:**
```kotlin
// 方案 1: 使用 commitAllowingStateLoss
fragmentManager.beginTransaction()
    .replace(R.id.container, fragment)
    .commitAllowingStateLoss()

// 方案 2: 检查状态
if (!supportFragmentManager.isStateSaved) {
    supportFragmentManager.beginTransaction()
        .replace(R.id.container, fragment)
        .commit()
}

// 方案 3: 使用 Lifecycle
lifecycle.addObserver(object : DefaultLifecycleObserver {
    override fun onResume(owner: LifecycleOwner) {
        // 在 onResume 时执行事务
        supportFragmentManager.beginTransaction()
            .replace(R.id.container, fragment)
            .commit()
    }
})
```

### 场景 2: RecyclerView 崩溃

**问题:**
```
IndexOutOfBoundsException: Inconsistency detected
```

**解决方案:**
```kotlin
// 方案 1: 使用 DiffUtil
class MyAdapter : ListAdapter<Item, ViewHolder>(ItemDiffCallback()) {
    // ListAdapter 自动处理数据变化
}

class ItemDiffCallback : DiffUtil.ItemCallback<Item>() {
    override fun areItemsTheSame(oldItem: Item, newItem: Item) = 
        oldItem.id == newItem.id
    
    override fun areContentsTheSame(oldItem: Item, newItem: Item) = 
        oldItem == newItem
}

// 方案 2: 在主线程更新数据
fun updateData(newData: List<Item>) {
    if (Looper.myLooper() == Looper.getMainLooper()) {
        items = newData
        notifyDataSetChanged()
    } else {
        Handler(Looper.getMainLooper()).post {
            items = newData
            notifyDataSetChanged()
        }
    }
}
```

### 场景 3: 内存不足崩溃

**问题:**
```
OutOfMemoryError: Failed to allocate a XXX byte allocation with XXX free bytes
```

**解决方案:**
```kotlin
// 方案 1: 压缩 Bitmap
fun decodeSampledBitmap(path: String, reqWidth: Int, reqHeight: Int): Bitmap {
    return BitmapFactory.Options().run {
        inJustDecodeBounds = true
        BitmapFactory.decodeFile(path, this)
        
        inSampleSize = calculateInSampleSize(this, reqWidth, reqHeight)
        inJustDecodeBounds = false
        
        BitmapFactory.decodeFile(path, this)
    }
}

// 方案 2: 使用图片加载库
Glide.with(context)
    .load(imageUrl)
    .override(targetWidth, targetHeight)
    .into(imageView)

// 方案 3: 及时释放资源
override fun onTrimMemory(level: Int) {
    super.onTrimMemory(level)
    when (level) {
        TRIM_MEMORY_RUNNING_LOW,
        TRIM_MEMORY_RUNNING_CRITICAL -> {
            // 清理缓存
            clearCache()
        }
    }
}
```

---

## 分析报告模板

```markdown
# 崩溃/ANR 分析报告

## 问题概述
- **类型:** [Crash / ANR]
- **异常:** [异常类型]
- **位置:** [文件:行号]
- **频率:** [发生频率]

## 堆栈跟踪
\`\`\`
[完整堆栈跟踪]
\`\`\`

## 根因分析
[详细的根因说明]

## 修复方案
\`\`\`kotlin
[修复代码]
\`\`\`

## 测试验证
- [ ] 单元测试
- [ ] 集成测试
- [ ] 手动测试复现场景

## 预防措施
[避免类似问题的建议]
```

## 调试工具

- **Logcat:** 查看实时日志
- **Android Studio Debugger:** 断点调试
- **StrictMode:** 检测主线程违规
- **LeakCanary:** 检测内存泄漏
- **Firebase Crashlytics:** 崩溃报告
- **Stetho:** 网络和数据库调试
