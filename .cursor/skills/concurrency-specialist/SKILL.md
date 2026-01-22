---
name: concurrency-specialist
description: Android 并发问题专家。分析和解决死锁、竞态条件、线程同步、数据竞争、协程异常等并发问题。处理多线程、RxJava、Kotlin Coroutines 相关的复杂并发场景。当出现线程问题、数据不一致或偶发性错误时使用。
---

# Concurrency Specialist - 并发问题专家

专门分析和解决 Android 应用的并发问题,包括死锁、竞态条件、线程同步等。

## 并发问题分析流程

### 第 1 步: 识别并发问题类型

#### 1. 死锁 (Deadlock)

**症状:**
- 应用卡死,无响应
- 多个线程互相等待
- CPU 使用率低

**日志特征:**
```
"Thread-1" prio=5 tid=10 BLOCKED
  waiting to lock <0x12345678> held by thread 15

"Thread-2" prio=5 tid=15 BLOCKED
  waiting to lock <0x87654321> held by thread 10
```

#### 2. 竞态条件 (Race Condition)

**症状:**
- 偶发性错误,难以复现
- 数据不一致
- 结果不确定

**示例:**
```kotlin
// 两个线程同时修改 count
var count = 0
thread1: count++  // 读取 0,写入 1
thread2: count++  // 读取 0,写入 1
// 期望结果: 2, 实际结果: 1
```

#### 3. 数据竞争 (Data Race)

**症状:**
- 无同步保护的共享变量访问
- 读写冲突
- 数据损坏

#### 4. 线程安全问题

**症状:**
- ConcurrentModificationException
- 集合操作异常
- 状态不一致

---

## 常见并发问题和解决方案

### 场景 1: 死锁

#### 原因 1: 锁顺序不一致

**问题代码:**
```kotlin
class BankAccount(val id: Int, var balance: Int)

// 线程 1: 从账户 A 转账到账户 B
fun transfer(from: BankAccount, to: BankAccount, amount: Int) {
    synchronized(from) {
        synchronized(to) {
            from.balance -= amount
            to.balance += amount
        }
    }
}

// 线程 1: transfer(accountA, accountB, 100)
// 线程 2: transfer(accountB, accountA, 50)
// 死锁! 线程 1 持有 A 等待 B,线程 2 持有 B 等待 A
```

**解决方案:**
```kotlin
// 方案 1: 统一锁顺序
fun transfer(from: BankAccount, to: BankAccount, amount: Int) {
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

// 方案 2: 使用单一全局锁
private val transferLock = Any()

fun transfer(from: BankAccount, to: BankAccount, amount: Int) {
    synchronized(transferLock) {
        from.balance -= amount
        to.balance += amount
    }
}

// 方案 3: 使用 tryLock 避免死锁
private val lock1 = ReentrantLock()
private val lock2 = ReentrantLock()

fun transfer(from: BankAccount, to: BankAccount, amount: Int): Boolean {
    val fromLock = if (from.id < to.id) lock1 else lock2
    val toLock = if (from.id < to.id) lock2 else lock1
    
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
```

#### 原因 2: 持有锁时调用外部方法

**问题代码:**
```kotlin
class EventManager {
    private val listeners = mutableListOf<Listener>()
    
    @Synchronized
    fun addListener(listener: Listener) {
        listeners.add(listener)
    }
    
    @Synchronized
    fun notifyListeners() {
        for (listener in listeners) {
            listener.onEvent()  // 外部方法可能获取其他锁,导致死锁
        }
    }
}
```

**解决方案:**
```kotlin
// 方案 1: 复制集合,释放锁后调用
class EventManager {
    private val listeners = mutableListOf<Listener>()
    
    @Synchronized
    fun addListener(listener: Listener) {
        listeners.add(listener)
    }
    
    fun notifyListeners() {
        val snapshot = synchronized(this) {
            listeners.toList()  // 复制集合
        }
        // 释放锁后调用外部方法
        for (listener in snapshot) {
            listener.onEvent()
        }
    }
}

// 方案 2: 使用 CopyOnWriteArrayList (适合读多写少)
class EventManager {
    private val listeners = CopyOnWriteArrayList<Listener>()
    
    fun addListener(listener: Listener) {
        listeners.add(listener)
    }
    
    fun notifyListeners() {
        for (listener in listeners) {
            listener.onEvent()  // 无需加锁
        }
    }
}
```

### 场景 2: 竞态条件

#### 原因 1: Check-Then-Act 模式

**问题代码:**
```kotlin
class UserCache {
    private val cache = mutableMapOf<String, User>()
    
    fun getUser(id: String): User {
        if (!cache.containsKey(id)) {  // Check
            val user = loadUserFromDb(id)
            cache[id] = user  // Act
        }
        return cache[id]!!
    }
}

// 线程 1: 检查 cache 不存在 -> 加载用户
// 线程 2: 检查 cache 不存在 -> 加载用户
// 结果: 用户被加载两次
```

**解决方案:**
```kotlin
// 方案 1: 使用 synchronized
class UserCache {
    private val cache = mutableMapOf<String, User>()
    
    @Synchronized
    fun getUser(id: String): User {
        return cache.getOrPut(id) {
            loadUserFromDb(id)
        }
    }
}

// 方案 2: 使用 ConcurrentHashMap
class UserCache {
    private val cache = ConcurrentHashMap<String, User>()
    
    fun getUser(id: String): User {
        return cache.computeIfAbsent(id) { key ->
            loadUserFromDb(key)
        }
    }
}

// 方案 3: 使用协程 + Mutex
class UserCache {
    private val cache = mutableMapOf<String, User>()
    private val mutex = Mutex()
    
    suspend fun getUser(id: String): User {
        mutex.withLock {
            return cache.getOrPut(id) {
                loadUserFromDb(id)
            }
        }
    }
}
```

#### 原因 2: 复合操作非原子性

**问题代码:**
```kotlin
class Counter {
    private var count = 0
    
    fun increment() {
        count++  // 非原子操作: 读取 -> 加 1 -> 写入
    }
    
    fun get(): Int = count
}

// 线程 1: increment() 读取 0
// 线程 2: increment() 读取 0
// 线程 1: 写入 1
// 线程 2: 写入 1
// 结果: count = 1 (期望 2)
```

**解决方案:**
```kotlin
// 方案 1: 使用 AtomicInteger
class Counter {
    private val count = AtomicInteger(0)
    
    fun increment() {
        count.incrementAndGet()  // 原子操作
    }
    
    fun get(): Int = count.get()
}

// 方案 2: 使用 synchronized
class Counter {
    private var count = 0
    
    @Synchronized
    fun increment() {
        count++
    }
    
    @Synchronized
    fun get(): Int = count
}

// 方案 3: 使用 Mutex (协程)
class Counter {
    private var count = 0
    private val mutex = Mutex()
    
    suspend fun increment() {
        mutex.withLock {
            count++
        }
    }
    
    suspend fun get(): Int = mutex.withLock {
        count
    }
}
```

### 场景 3: 线程安全问题

#### 原因 1: 非线程安全的集合

**问题代码:**
```kotlin
class DataManager {
    private val items = mutableListOf<Item>()
    
    fun addItem(item: Item) {
        items.add(item)  // 线程不安全
    }
    
    fun getItems(): List<Item> = items
}

// 线程 1: addItem()
// 线程 2: 遍历 items
// 异常: ConcurrentModificationException
```

**解决方案:**
```kotlin
// 方案 1: 使用线程安全的集合
class DataManager {
    private val items = CopyOnWriteArrayList<Item>()
    
    fun addItem(item: Item) {
        items.add(item)  // 线程安全
    }
    
    fun getItems(): List<Item> = items
}

// 方案 2: 使用 synchronized
class DataManager {
    private val items = mutableListOf<Item>()
    
    @Synchronized
    fun addItem(item: Item) {
        items.add(item)
    }
    
    @Synchronized
    fun getItems(): List<Item> = items.toList()
}

// 方案 3: 使用 ReadWriteLock (读多写少)
class DataManager {
    private val items = mutableListOf<Item>()
    private val lock = ReentrantReadWriteLock()
    
    fun addItem(item: Item) {
        lock.writeLock().lock()
        try {
            items.add(item)
        } finally {
            lock.writeLock().unlock()
        }
    }
    
    fun getItems(): List<Item> {
        lock.readLock().lock()
        try {
            return items.toList()
        } finally {
            lock.readLock().unlock()
        }
    }
}
```

#### 原因 2: 迭代时修改集合

**问题代码:**
```kotlin
val list = mutableListOf(1, 2, 3, 4, 5)

// 线程 1: 遍历
for (item in list) {
    println(item)
}

// 线程 2: 修改
list.add(6)  // ConcurrentModificationException
```

**解决方案:**
```kotlin
// 方案 1: 使用 CopyOnWriteArrayList
val list = CopyOnWriteArrayList(listOf(1, 2, 3, 4, 5))

// 线程 1: 遍历 (不会抛异常)
for (item in list) {
    println(item)
}

// 线程 2: 修改
list.add(6)

// 方案 2: 复制集合后遍历
val snapshot = synchronized(list) {
    list.toList()
}
for (item in snapshot) {
    println(item)
}

// 方案 3: 使用 Iterator.remove()
val iterator = list.iterator()
while (iterator.hasNext()) {
    val item = iterator.next()
    if (shouldRemove(item)) {
        iterator.remove()  // 安全删除
    }
}
```

### 场景 4: 协程并发问题

#### 原因 1: 共享可变状态

**问题代码:**
```kotlin
class ViewModel : ViewModel() {
    private var counter = 0
    
    fun incrementCounter() {
        viewModelScope.launch {
            repeat(1000) {
                counter++  // 竞态条件
            }
        }
    }
}
```

**解决方案:**
```kotlin
// 方案 1: 使用 AtomicInteger
class ViewModel : ViewModel() {
    private val counter = AtomicInteger(0)
    
    fun incrementCounter() {
        viewModelScope.launch {
            repeat(1000) {
                counter.incrementAndGet()
            }
        }
    }
}

// 方案 2: 使用 Mutex
class ViewModel : ViewModel() {
    private var counter = 0
    private val mutex = Mutex()
    
    fun incrementCounter() {
        viewModelScope.launch {
            repeat(1000) {
                mutex.withLock {
                    counter++
                }
            }
        }
    }
}

// 方案 3: 使用单线程 Dispatcher
class ViewModel : ViewModel() {
    private var counter = 0
    private val singleThreadDispatcher = Dispatchers.IO.limitedParallelism(1)
    
    fun incrementCounter() {
        viewModelScope.launch(singleThreadDispatcher) {
            repeat(1000) {
                counter++  // 单线程,无竞态
            }
        }
    }
}

// 方案 4: 使用 StateFlow (推荐)
class ViewModel : ViewModel() {
    private val _counter = MutableStateFlow(0)
    val counter: StateFlow<Int> = _counter.asStateFlow()
    
    fun incrementCounter() {
        viewModelScope.launch {
            repeat(1000) {
                _counter.update { it + 1 }  // 线程安全
            }
        }
    }
}
```

#### 原因 2: 协程取消未处理

**问题代码:**
```kotlin
class ViewModel : ViewModel() {
    fun loadData() {
        viewModelScope.launch {
            val data1 = loadFromNetwork()  // 可能被取消
            database.save(data1)  // 取消后仍执行,导致数据不一致
        }
    }
}
```

**解决方案:**
```kotlin
// 方案 1: 检查 isActive
class ViewModel : ViewModel() {
    fun loadData() {
        viewModelScope.launch {
            val data1 = loadFromNetwork()
            if (isActive) {  // 检查是否已取消
                database.save(data1)
            }
        }
    }
}

// 方案 2: 使用 ensureActive()
class ViewModel : ViewModel() {
    fun loadData() {
        viewModelScope.launch {
            val data1 = loadFromNetwork()
            ensureActive()  // 如果已取消,抛出 CancellationException
            database.save(data1)
        }
    }
}

// 方案 3: 使用 NonCancellable 保证关键操作完成
class ViewModel : ViewModel() {
    fun loadData() {
        viewModelScope.launch {
            try {
                val data1 = loadFromNetwork()
                database.save(data1)
            } finally {
                withContext(NonCancellable) {
                    // 即使协程被取消,也会执行清理操作
                    cleanup()
                }
            }
        }
    }
}
```

---

## 线程同步机制选择

### 1. synchronized

**适用场景:**
- 简单的互斥访问
- 短时间持有锁
- 不需要公平性

**示例:**
```kotlin
@Synchronized
fun updateData(data: Data) {
    this.data = data
}
```

### 2. ReentrantLock

**适用场景:**
- 需要 tryLock 避免死锁
- 需要可中断的锁
- 需要公平锁

**示例:**
```kotlin
private val lock = ReentrantLock()

fun updateData(data: Data) {
    lock.lock()
    try {
        this.data = data
    } finally {
        lock.unlock()
    }
}
```

### 3. ReadWriteLock

**适用场景:**
- 读多写少
- 读操作可以并发
- 写操作需要独占

**示例:**
```kotlin
private val lock = ReentrantReadWriteLock()

fun readData(): Data {
    lock.readLock().lock()
    try {
        return data
    } finally {
        lock.readLock().unlock()
    }
}

fun writeData(data: Data) {
    lock.writeLock().lock()
    try {
        this.data = data
    } finally {
        lock.writeLock().unlock()
    }
}
```

### 4. Atomic 类

**适用场景:**
- 单个变量的原子操作
- 高并发场景
- 无锁算法

**示例:**
```kotlin
private val counter = AtomicInteger(0)

fun increment() {
    counter.incrementAndGet()
}
```

### 5. 协程 Mutex

**适用场景:**
- 协程中的互斥访问
- 挂起函数
- 结构化并发

**示例:**
```kotlin
private val mutex = Mutex()

suspend fun updateData(data: Data) {
    mutex.withLock {
        this.data = data
    }
}
```

---

## 并发问题调试

### 1. 启用 StrictMode

```kotlin
if (BuildConfig.DEBUG) {
    StrictMode.setThreadPolicy(
        StrictMode.ThreadPolicy.Builder()
            .detectAll()
            .penaltyLog()
            .build()
    )
}
```

### 2. 使用 Thread Sanitizer

在 build.gradle 中启用:
```gradle
android {
    defaultConfig {
        externalNativeBuild {
            cmake {
                arguments "-DANDROID_STL=c++_shared"
                cppFlags "-fsanitize=thread"
            }
        }
    }
}
```

### 3. 日志分析

```kotlin
// 记录线程信息
Log.d("Thread", "Current thread: ${Thread.currentThread().name}")

// 记录锁信息
Log.d("Lock", "Acquiring lock: $lockName")
synchronized(lock) {
    Log.d("Lock", "Lock acquired: $lockName")
    // 操作
}
Log.d("Lock", "Lock released: $lockName")
```

---

## 并发最佳实践

### 1. 最小化共享状态

```kotlin
// 不好: 共享可变状态
class Counter {
    var count = 0
    fun increment() { count++ }
}

// 好: 不可变数据
data class Counter(val count: Int) {
    fun increment() = Counter(count + 1)
}
```

### 2. 使用不可变对象

```kotlin
// 不可变数据类
data class User(
    val id: String,
    val name: String,
    val email: String
)

// 修改时创建新对象
fun updateName(user: User, newName: String): User {
    return user.copy(name = newName)
}
```

### 3. 优先使用高级并发工具

```kotlin
// 不好: 手动管理线程
Thread {
    // 耗时操作
}.start()

// 好: 使用协程
viewModelScope.launch {
    // 耗时操作
}
```

### 4. 避免嵌套锁

```kotlin
// 不好: 嵌套锁
synchronized(lock1) {
    synchronized(lock2) {
        // 操作
    }
}

// 好: 单一锁
synchronized(lock) {
    // 操作
}
```

---

## 并发问题分析报告模板

```markdown
# 并发问题分析报告

## 问题概述
- **类型:** [死锁/竞态条件/数据竞争]
- **症状:** [具体表现]
- **复现概率:** [高/中/低]

## 线程信息
**涉及线程:**
- Thread-1: [状态和堆栈]
- Thread-2: [状态和堆栈]

**锁信息:**
- Lock-1: held by Thread-X
- Lock-2: held by Thread-Y

## 根因分析
[详细的根因说明]

## 修复方案
\`\`\`kotlin
[修复代码]
\`\`\`

## 测试验证
- [ ] 单元测试
- [ ] 并发压力测试
- [ ] 长时间运行测试

## 预防措施
[避免类似问题的建议]
```
