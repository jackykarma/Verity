# Bug 分析 Skills 使用示例

真实场景的完整使用示例,展示如何使用 Skills 系统解决实际问题。

---

## 示例 1: NullPointerException 崩溃

### 问题描述
```
用户报告: 点击"我的"页面时应用崩溃

日志:
FATAL EXCEPTION: main
Process: com.example.myapp, PID: 12345
java.lang.NullPointerException: Attempt to invoke virtual method 
'java.lang.String com.example.model.User.getName()' on a null object reference
    at com.example.ui.ProfileActivity.updateUI(ProfileActivity.kt:45)
    at com.example.ui.ProfileActivity.onCreate(ProfileActivity.kt:30)
    at android.app.Activity.performCreate(Activity.java:7136)
```

### 使用 Skill
```
用户: 请使用 crash-anr-specialist 分析这个崩溃
```

### 分析过程

**1. 识别异常类型**
- 异常: NullPointerException
- 位置: ProfileActivity.kt:45
- 对象: User.getName()

**2. 查看问题代码**
```kotlin
// ProfileActivity.kt
class ProfileActivity : AppCompatActivity() {
    private var user: User? = null
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_profile)
        
        // 从 Intent 获取用户 ID
        val userId = intent.getStringExtra("user_id")
        
        // 异步加载用户数据
        loadUser(userId)
        
        // 问题: 立即更新 UI,但 user 还未加载
        updateUI()  // 第 30 行
    }
    
    private fun updateUI() {
        // 第 45 行: user 为 null
        binding.nameTextView.text = user.getName()  // 崩溃!
    }
    
    private fun loadUser(userId: String?) {
        viewModelScope.launch {
            user = repository.getUser(userId)
            updateUI()
        }
    }
}
```

**3. 根因分析**
- user 对象在异步加载完成前为 null
- onCreate 中立即调用 updateUI(),此时 user 还未初始化
- 未进行空值检查

**4. 修复方案**
```kotlin
// 方案 1: 添加空值检查
private fun updateUI() {
    val currentUser = user ?: return
    binding.nameTextView.text = currentUser.getName()
}

// 方案 2: 使用 LiveData/StateFlow (推荐)
class ProfileActivity : AppCompatActivity() {
    private val viewModel: ProfileViewModel by viewModels()
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_profile)
        
        val userId = intent.getStringExtra("user_id") ?: return
        
        // 观察数据变化
        lifecycleScope.launch {
            viewModel.user.collect { user ->
                user?.let { updateUI(it) }
            }
        }
        
        // 加载数据
        viewModel.loadUser(userId)
    }
    
    private fun updateUI(user: User) {
        binding.nameTextView.text = user.getName()
    }
}

class ProfileViewModel : ViewModel() {
    private val _user = MutableStateFlow<User?>(null)
    val user: StateFlow<User?> = _user.asStateFlow()
    
    fun loadUser(userId: String) {
        viewModelScope.launch {
            _user.value = repository.getUser(userId)
        }
    }
}
```

**5. 测试验证**
```kotlin
@Test
fun `test updateUI with null user`() {
    // 验证空值不会崩溃
    activity.updateUI()
    // 应该不崩溃
}

@Test
fun `test updateUI with valid user`() {
    val user = User(id = "1", name = "Test User")
    viewModel.setUser(user)
    
    // 验证 UI 更新
    assertEquals("Test User", binding.nameTextView.text)
}
```

### 结果
✅ 崩溃已修复  
✅ 使用 ViewModel 管理状态  
✅ 添加单元测试  
✅ 代码更健壮

---

## 示例 2: RecyclerView 滑动卡顿

### 问题描述
```
用户报告: 新闻列表滑动时明显卡顿

日志:
I/Choreographer: Skipped 45 frames! The application may be doing 
too much work on its main thread.
```

### 使用 Skill
```
用户: 请使用 performance-specialist 分析这个性能问题
```

### 分析过程

**1. 检查性能指标**
- 掉帧: 45 帧 (严重)
- 目标: 16.67ms/帧 (60 FPS)
- 实际: 约 750ms/帧

**2. 查看问题代码**
```kotlin
// NewsAdapter.kt
class NewsAdapter : RecyclerView.Adapter<NewsViewHolder>() {
    
    override fun onBindViewHolder(holder: NewsViewHolder, position: Int) {
        val news = newsList[position]
        
        // 问题 1: 主线程加载图片
        val bitmap = BitmapFactory.decodeFile(news.imagePath)
        holder.imageView.setImageBitmap(bitmap)  // 耗时 200ms
        
        // 问题 2: 复杂计算
        val summary = generateSummary(news.content)  // 耗时 100ms
        holder.summaryTextView.text = summary
        
        // 问题 3: 每次 bind 都创建 listener
        holder.itemView.setOnClickListener {
            onItemClick(news)
        }
        
        // 问题 4: 日期格式化
        val dateFormat = SimpleDateFormat("yyyy-MM-dd HH:mm:ss", Locale.getDefault())
        holder.dateTextView.text = dateFormat.format(news.publishTime)  // 耗时 50ms
    }
    
    private fun generateSummary(content: String): String {
        // 复杂的文本处理
        return content.take(100) + "..."
    }
}
```

**3. 性能分析**
```
onBindViewHolder 总耗时: ~350ms
- 图片加载: 200ms (57%)
- 文本处理: 100ms (29%)
- 日期格式化: 50ms (14%)

目标: < 16ms
实际: 350ms
超出: 21 倍!
```

**4. 优化方案**
```kotlin
// 优化后的 NewsAdapter
class NewsAdapter(
    private val imageLoader: ImageLoader,
    private val onItemClick: (News) -> Unit
) : ListAdapter<News, NewsViewHolder>(NewsDiffCallback()) {
    
    // 复用 DateFormat
    private val dateFormat = SimpleDateFormat("yyyy-MM-dd HH:mm:ss", Locale.getDefault())
    
    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): NewsViewHolder {
        val holder = NewsViewHolder(/* ... */)
        
        // 在 onCreateViewHolder 中设置 listener
        holder.itemView.setOnClickListener {
            val position = holder.adapterPosition
            if (position != RecyclerView.NO_POSITION) {
                onItemClick(getItem(position))
            }
        }
        
        return holder
    }
    
    override fun onBindViewHolder(holder: NewsViewHolder, position: Int) {
        val news = getItem(position)
        
        // 优化 1: 使用图片加载库
        imageLoader.load(news.imagePath)
            .placeholder(R.drawable.placeholder)
            .into(holder.imageView)  // 异步加载,< 1ms
        
        // 优化 2: 预计算摘要
        holder.summaryTextView.text = news.summary  // 直接使用,< 1ms
        
        // 优化 3: listener 已在 onCreateViewHolder 中设置
        
        // 优化 4: 复用 DateFormat
        holder.dateTextView.text = dateFormat.format(news.publishTime)  // < 5ms
    }
}

// 使用 DiffUtil 局部刷新
class NewsDiffCallback : DiffUtil.ItemCallback<News>() {
    override fun areItemsTheSame(oldItem: News, newItem: News) = 
        oldItem.id == newItem.id
    
    override fun areContentsTheSame(oldItem: News, newItem: News) = 
        oldItem == newItem
}

// 数据模型中预计算摘要
data class News(
    val id: String,
    val title: String,
    val content: String,
    val imagePath: String,
    val publishTime: Date
) {
    val summary: String by lazy {
        content.take(100) + "..."
    }
}

// RecyclerView 配置优化
recyclerView.apply {
    setHasFixedSize(true)
    setItemViewCacheSize(20)
    recycledViewPool.setMaxRecycledViews(0, 20)
}
```

**5. 性能对比**
```
优化前:
- onBindViewHolder: 350ms
- 帧率: 3 FPS
- 掉帧: 45 帧

优化后:
- onBindViewHolder: < 10ms
- 帧率: 60 FPS
- 掉帧: 0 帧

提升: 35 倍!
```

### 结果
✅ 滑动流畅,60 FPS  
✅ 无掉帧  
✅ 用户体验显著提升

---

## 示例 3: Activity 内存泄漏

### 问题描述
```
LeakCanary 报告:

MainActivity has leaked:
- MainActivity (Activity)
- mContext (Context)

Leak trace:
- GC ROOT static EventBus.instance
- EventBus.listeners
- ArrayList[0]
- MainActivity$1 (anonymous class)
- MainActivity.this$0
- MainActivity
```

### 使用 Skill
```
用户: 请使用 memory-specialist 分析这个内存泄漏
```

### 分析过程

**1. 分析泄漏链**
```
GC Root → EventBus (单例) → listeners (List) → 
匿名内部类 → MainActivity
```

**2. 查看问题代码**
```kotlin
// EventBus.kt (单例)
object EventBus {
    private val listeners = mutableListOf<EventListener>()
    
    fun register(listener: EventListener) {
        listeners.add(listener)
    }
    
    fun unregister(listener: EventListener) {
        listeners.remove(listener)
    }
}

// MainActivity.kt
class MainActivity : AppCompatActivity() {
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)
        
        // 问题: 注册监听器但未取消注册
        EventBus.register(object : EventListener {
            override fun onEvent(event: Event) {
                // 访问 Activity
                updateUI(event)
            }
        })
    }
    
    private fun updateUI(event: Event) {
        // 更新 UI
    }
    
    // 问题: 未在 onDestroy 中取消注册
}
```

**3. 根因分析**
- EventBus 是单例,生命周期与应用相同
- 匿名内部类持有 MainActivity 的隐式引用
- 未在 onDestroy 中取消注册
- Activity 销毁后仍被 EventBus 持有

**4. 修复方案**
```kotlin
// 方案 1: 手动注册和取消注册
class MainActivity : AppCompatActivity() {
    
    private val eventListener = object : EventListener {
        override fun onEvent(event: Event) {
            updateUI(event)
        }
    }
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)
        
        EventBus.register(eventListener)
    }
    
    override fun onDestroy() {
        EventBus.unregister(eventListener)
        super.onDestroy()
    }
}

// 方案 2: 使用 Lifecycle-aware 组件 (推荐)
class MainActivity : AppCompatActivity() {
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)
        
        lifecycle.addObserver(object : DefaultLifecycleObserver {
            override fun onCreate(owner: LifecycleOwner) {
                EventBus.register(eventListener)
            }
            
            override fun onDestroy(owner: LifecycleOwner) {
                EventBus.unregister(eventListener)
            }
        })
    }
    
    private val eventListener = object : EventListener {
        override fun onEvent(event: Event) {
            updateUI(event)
        }
    }
}

// 方案 3: 使用 WeakReference
object EventBus {
    private val listeners = mutableListOf<WeakReference<EventListener>>()
    
    fun register(listener: EventListener) {
        listeners.add(WeakReference(listener))
    }
    
    fun notify(event: Event) {
        // 清理已回收的引用
        listeners.removeAll { it.get() == null }
        
        // 通知监听器
        listeners.forEach { ref ->
            ref.get()?.onEvent(event)
        }
    }
}

// 方案 4: 使用 LiveData/Flow (最推荐)
class EventBus {
    private val _events = MutableSharedFlow<Event>()
    val events: SharedFlow<Event> = _events.asSharedFlow()
    
    suspend fun post(event: Event) {
        _events.emit(event)
    }
}

class MainActivity : AppCompatActivity() {
    private val eventBus: EventBus by inject()
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)
        
        // 自动取消订阅
        lifecycleScope.launch {
            eventBus.events.collect { event ->
                updateUI(event)
            }
        }
    }
}
```

**5. 验证修复**
```kotlin
// 使用 LeakCanary 验证
@Test
fun `test no memory leak after activity destroyed`() {
    val scenario = ActivityScenario.launch(MainActivity::class.java)
    
    // 销毁 Activity
    scenario.close()
    
    // 触发 GC
    Runtime.getRuntime().gc()
    
    // 验证没有泄漏
    // LeakCanary 不应报告泄漏
}
```

### 结果
✅ 内存泄漏已修复  
✅ Activity 正常回收  
✅ 内存占用稳定  
✅ LeakCanary 无报告

---

## 示例 4: 死锁导致应用卡死

### 问题描述
```
用户报告: 应用突然卡死,无法操作

ANR trace:
"Thread-1" prio=5 tid=10 BLOCKED
  waiting to lock <0x12345678> (a Object) held by thread 15

"Thread-2" prio=5 tid=15 BLOCKED
  waiting to lock <0x87654321> (a Object) held by thread 10
```

### 使用 Skill
```
用户: 请使用 concurrency-specialist 分析这个死锁问题
```

### 分析过程

**1. 识别死锁**
- Thread-1 持有锁 A,等待锁 B
- Thread-2 持有锁 B,等待锁 A
- 互相等待,形成死锁

**2. 查看问题代码**
```kotlin
class BankAccount(val id: Int, var balance: Double)

object BankService {
    
    fun transfer(from: BankAccount, to: BankAccount, amount: Double) {
        synchronized(from) {
            Thread.sleep(100)  // 模拟处理时间
            
            synchronized(to) {
                from.balance -= amount
                to.balance += amount
            }
        }
    }
}

// 使用场景
val accountA = BankAccount(1, 1000.0)
val accountB = BankAccount(2, 1000.0)

// Thread-1: A → B
thread {
    BankService.transfer(accountA, accountB, 100.0)
}

// Thread-2: B → A (同时执行)
thread {
    BankService.transfer(accountB, accountA, 50.0)
}

// 死锁!
// Thread-1 持有 A 的锁,等待 B 的锁
// Thread-2 持有 B 的锁,等待 A 的锁
```

**3. 修复方案**
```kotlin
// 方案 1: 统一锁顺序
object BankService {
    
    fun transfer(from: BankAccount, to: BankAccount, amount: Double) {
        val (first, second) = if (from.id < to.id) {
            from to to
        } else {
            to to from
        }
        
        synchronized(first) {
            synchronized(second) {
                from.balance -= amount
                to.balance += amount
            }
        }
    }
}

// 方案 2: 使用单一全局锁
object BankService {
    private val transferLock = Any()
    
    fun transfer(from: BankAccount, to: BankAccount, amount: Double) {
        synchronized(transferLock) {
            from.balance -= amount
            to.balance += amount
        }
    }
}

// 方案 3: 使用 tryLock 避免死锁
object BankService {
    private val locks = ConcurrentHashMap<Int, ReentrantLock>()
    
    fun transfer(from: BankAccount, to: BankAccount, amount: Double): Boolean {
        val fromLock = locks.computeIfAbsent(from.id) { ReentrantLock() }
        val toLock = locks.computeIfAbsent(to.id) { ReentrantLock() }
        
        if (fromLock.tryLock()) {
            try {
                if (toLock.tryLock()) {
                    try {
                        from.balance -= amount
                        to.balance += amount
                        return true
                    } finally {
                        toLock.unlock()
                    }
                }
            } finally {
                fromLock.unlock()
            }
        }
        return false
    }
}

// 方案 4: 使用协程 + Mutex (推荐)
class BankService {
    private val mutexes = ConcurrentHashMap<Int, Mutex>()
    
    suspend fun transfer(from: BankAccount, to: BankAccount, amount: Double) {
        val fromMutex = mutexes.computeIfAbsent(from.id) { Mutex() }
        val toMutex = mutexes.computeIfAbsent(to.id) { Mutex() }
        
        val (first, second) = if (from.id < to.id) {
            fromMutex to toMutex
        } else {
            toMutex to fromMutex
        }
        
        first.withLock {
            second.withLock {
                from.balance -= amount
                to.balance += amount
            }
        }
    }
}
```

**4. 测试验证**
```kotlin
@Test
fun `test concurrent transfers no deadlock`() = runBlocking {
    val accountA = BankAccount(1, 1000.0)
    val accountB = BankAccount(2, 1000.0)
    
    // 并发执行 1000 次转账
    val jobs = List(1000) { i ->
        launch {
            if (i % 2 == 0) {
                bankService.transfer(accountA, accountB, 1.0)
            } else {
                bankService.transfer(accountB, accountA, 1.0)
            }
        }
    }
    
    // 等待所有任务完成
    jobs.joinAll()
    
    // 验证总金额不变
    assertEquals(2000.0, accountA.balance + accountB.balance, 0.01)
}
```

### 结果
✅ 死锁已解决  
✅ 并发转账正常  
✅ 数据一致性保证  
✅ 性能测试通过

---

## 总结

这些示例展示了如何使用 Bug 分析 Skills 系统:

1. **明确问题** - 收集日志和症状
2. **选择 Skill** - 根据问题类型选择专家
3. **深度分析** - 理解根因
4. **应用方案** - 实施修复
5. **验证结果** - 测试和确认

每个示例都包含:
- ✅ 问题描述
- ✅ 代码分析
- ✅ 根因定位
- ✅ 多种修复方案
- ✅ 测试验证
- ✅ 最佳实践

**开始使用这些 Skills 来解决您的 Android bug!** 🚀
