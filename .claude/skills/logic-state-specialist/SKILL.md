---
name: logic-state-specialist
description: Android 业务逻辑和状态管理专家。分析和解决业务逻辑错误、状态不一致、数据校验失败、流程错误、边界条件处理等问题。当功能不符合预期、数据错误但不崩溃或业务规则违反时使用。
---

# Logic / State Specialist - 逻辑和状态专家

专门分析和解决 Android 应用的业务逻辑和状态管理问题。

## 逻辑问题分析流程

### 第 1 步: 识别问题类型

#### 1. 业务逻辑错误

**症状:**
- 计算结果不正确
- 业务流程不符合预期
- 条件判断错误
- 算法实现错误

#### 2. 状态管理问题

**症状:**
- 状态不一致
- 状态丢失
- 状态更新不及时
- 多个组件状态不同步

#### 3. 数据校验问题

**症状:**
- 无效数据未被拦截
- 校验逻辑不完整
- 边界条件未处理
- 异常输入导致错误

#### 4. 异步逻辑问题

**症状:**
- 回调顺序错误
- 数据竞争
- 状态更新时机错误
- 异步操作未完成就使用结果

---

## 常见逻辑问题和解决方案

### 场景 1: 条件判断错误

#### 问题 1: 空值判断不完整

**问题代码:**
```kotlin
fun processUser(user: User?) {
    // 问题: 只检查了 user,未检查 name
    if (user != null) {
        val length = user.name.length  // name 可能为 null
    }
}
```

**解决方案:**
```kotlin
// 方案 1: 链式空值检查
fun processUser(user: User?) {
    val length = user?.name?.length ?: 0
}

// 方案 2: let 作用域
fun processUser(user: User?) {
    user?.name?.let { name ->
        val length = name.length
    }
}

// 方案 3: 提前返回
fun processUser(user: User?) {
    if (user == null) return
    val name = user.name ?: return
    val length = name.length
}

// 方案 4: 使用非空类型
data class User(
    val id: String,
    val name: String  // 非空
)

fun processUser(user: User?) {
    if (user != null) {
        val length = user.name.length  // 安全
    }
}
```

#### 问题 2: 边界条件未处理

**问题代码:**
```kotlin
fun calculateDiscount(price: Double, discountPercent: Int): Double {
    // 问题: 未处理边界条件
    return price * (100 - discountPercent) / 100
}

// 问题:
// - discountPercent < 0 会增加价格
// - discountPercent > 100 会导致负价格
// - price < 0 未处理
```

**解决方案:**
```kotlin
fun calculateDiscount(price: Double, discountPercent: Int): Double {
    // 校验输入
    require(price >= 0) { "Price must be non-negative" }
    require(discountPercent in 0..100) { "Discount percent must be between 0 and 100" }
    
    return price * (100 - discountPercent) / 100
}

// 或使用 check 检查状态
fun calculateDiscount(price: Double, discountPercent: Int): Double {
    check(price >= 0) { "Price must be non-negative" }
    check(discountPercent in 0..100) { "Discount percent must be between 0 and 100" }
    
    return price * (100 - discountPercent) / 100
}

// 或返回 Result
fun calculateDiscount(price: Double, discountPercent: Int): Result<Double> {
    if (price < 0) {
        return Result.failure(IllegalArgumentException("Price must be non-negative"))
    }
    if (discountPercent !in 0..100) {
        return Result.failure(IllegalArgumentException("Discount percent must be between 0 and 100"))
    }
    
    val discountedPrice = price * (100 - discountPercent) / 100
    return Result.success(discountedPrice)
}
```

#### 问题 3: 逻辑运算符使用错误

**问题代码:**
```kotlin
// 问题: 使用 || 而非 &&
fun isValidUser(user: User?): Boolean {
    return user != null || user.age >= 18  // 错误!
    // user 为 null 时也返回 true
}

// 问题: 优先级错误
fun shouldShowAd(isPremium: Boolean, adCount: Int): Boolean {
    return !isPremium && adCount < 5 || adCount == 0
    // 实际: (!isPremium && adCount < 5) || adCount == 0
    // 期望: !isPremium && (adCount < 5 || adCount == 0)
}
```

**解决方案:**
```kotlin
// 正确的空值检查
fun isValidUser(user: User?): Boolean {
    return user != null && user.age >= 18
}

// 使用括号明确优先级
fun shouldShowAd(isPremium: Boolean, adCount: Int): Boolean {
    return !isPremium && (adCount < 5 || adCount == 0)
}

// 或拆分为多个条件
fun shouldShowAd(isPremium: Boolean, adCount: Int): Boolean {
    if (isPremium) return false
    return adCount < 5 || adCount == 0
}
```

### 场景 2: 状态管理问题

#### 问题 1: 状态不一致

**问题代码:**
```kotlin
class ShoppingCart {
    private val items = mutableListOf<Item>()
    private var totalPrice = 0.0
    
    fun addItem(item: Item) {
        items.add(item)
        // 问题: 忘记更新 totalPrice
    }
    
    fun removeItem(item: Item) {
        items.remove(item)
        totalPrice -= item.price
        // 问题: 如果 item 不在列表中,totalPrice 仍会减少
    }
}
```

**解决方案:**
```kotlin
// 方案 1: 计算属性,避免状态不一致
class ShoppingCart {
    private val items = mutableListOf<Item>()
    
    val totalPrice: Double
        get() = items.sumOf { it.price }
    
    fun addItem(item: Item) {
        items.add(item)
        // totalPrice 自动更新
    }
    
    fun removeItem(item: Item) {
        items.remove(item)
        // totalPrice 自动更新
    }
}

// 方案 2: 使用不可变数据
data class ShoppingCart(
    val items: List<Item> = emptyList()
) {
    val totalPrice: Double
        get() = items.sumOf { it.price }
    
    fun addItem(item: Item): ShoppingCart {
        return copy(items = items + item)
    }
    
    fun removeItem(item: Item): ShoppingCart {
        return copy(items = items - item)
    }
}

// 方案 3: 封装状态更新
class ShoppingCart {
    private val _items = mutableListOf<Item>()
    val items: List<Item> get() = _items.toList()
    
    private var _totalPrice = 0.0
    val totalPrice: Double get() = _totalPrice
    
    fun addItem(item: Item) {
        _items.add(item)
        updateTotalPrice()
    }
    
    fun removeItem(item: Item) {
        if (_items.remove(item)) {
            updateTotalPrice()
        }
    }
    
    private fun updateTotalPrice() {
        _totalPrice = _items.sumOf { it.price }
    }
}
```

#### 问题 2: 状态丢失

**问题代码:**
```kotlin
class MainActivity : AppCompatActivity() {
    private var selectedTab = 0
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)
        
        // 问题: 配置变更后 selectedTab 丢失
    }
}
```

**解决方案:**
```kotlin
// 方案 1: 保存和恢复状态
class MainActivity : AppCompatActivity() {
    private var selectedTab = 0
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)
        
        selectedTab = savedInstanceState?.getInt("selected_tab") ?: 0
    }
    
    override fun onSaveInstanceState(outState: Bundle) {
        super.onSaveInstanceState(outState)
        outState.putInt("selected_tab", selectedTab)
    }
}

// 方案 2: 使用 ViewModel (推荐)
class MainViewModel : ViewModel() {
    private val _selectedTab = MutableStateFlow(0)
    val selectedTab: StateFlow<Int> = _selectedTab.asStateFlow()
    
    fun selectTab(index: Int) {
        _selectedTab.value = index
    }
}

class MainActivity : AppCompatActivity() {
    private val viewModel: MainViewModel by viewModels()
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)
        
        lifecycleScope.launch {
            viewModel.selectedTab.collect { tab ->
                // 更新 UI
            }
        }
    }
}

// 方案 3: 使用 SavedStateHandle
class MainViewModel(
    private val savedStateHandle: SavedStateHandle
) : ViewModel() {
    
    var selectedTab: Int
        get() = savedStateHandle.get<Int>("selected_tab") ?: 0
        set(value) {
            savedStateHandle["selected_tab"] = value
        }
}
```

#### 问题 3: 状态更新不及时

**问题代码:**
```kotlin
class UserRepository {
    private var cachedUser: User? = null
    
    fun getUser(): User? {
        return cachedUser
    }
    
    suspend fun refreshUser() {
        val user = api.fetchUser()
        cachedUser = user
        // 问题: 调用 getUser() 的地方不知道数据已更新
    }
}
```

**解决方案:**
```kotlin
// 方案 1: 使用 Flow (推荐)
class UserRepository {
    private val _user = MutableStateFlow<User?>(null)
    val user: StateFlow<User?> = _user.asStateFlow()
    
    suspend fun refreshUser() {
        val user = api.fetchUser()
        _user.value = user  // 自动通知观察者
    }
}

// ViewModel 中观察
class UserViewModel(
    private val repository: UserRepository
) : ViewModel() {
    
    val user: StateFlow<User?> = repository.user
    
    fun refreshUser() {
        viewModelScope.launch {
            repository.refreshUser()
        }
    }
}

// Activity 中观察
lifecycleScope.launch {
    viewModel.user.collect { user ->
        // UI 自动更新
    }
}

// 方案 2: 使用 LiveData
class UserRepository {
    private val _user = MutableLiveData<User?>()
    val user: LiveData<User?> = _user
    
    suspend fun refreshUser() {
        val user = api.fetchUser()
        _user.postValue(user)
    }
}

// 方案 3: 使用回调
class UserRepository {
    private var cachedUser: User? = null
    private val listeners = mutableListOf<(User?) -> Unit>()
    
    fun getUser(): User? = cachedUser
    
    fun addListener(listener: (User?) -> Unit) {
        listeners.add(listener)
    }
    
    fun removeListener(listener: (User?) -> Unit) {
        listeners.remove(listener)
    }
    
    suspend fun refreshUser() {
        val user = api.fetchUser()
        cachedUser = user
        listeners.forEach { it(user) }
    }
}
```

### 场景 3: 数据校验问题

#### 问题 1: 客户端校验不完整

**问题代码:**
```kotlin
fun registerUser(email: String, password: String): Result<User> {
    // 问题: 只检查是否为空,未检查格式
    if (email.isEmpty() || password.isEmpty()) {
        return Result.failure(Exception("Email and password required"))
    }
    
    return api.register(email, password)
}
```

**解决方案:**
```kotlin
// 完整的校验
fun registerUser(email: String, password: String): Result<User> {
    // 校验邮箱
    if (email.isEmpty()) {
        return Result.failure(Exception("Email is required"))
    }
    if (!isValidEmail(email)) {
        return Result.failure(Exception("Invalid email format"))
    }
    
    // 校验密码
    if (password.isEmpty()) {
        return Result.failure(Exception("Password is required"))
    }
    if (password.length < 8) {
        return Result.failure(Exception("Password must be at least 8 characters"))
    }
    if (!password.any { it.isDigit() }) {
        return Result.failure(Exception("Password must contain at least one digit"))
    }
    if (!password.any { it.isUpperCase() }) {
        return Result.failure(Exception("Password must contain at least one uppercase letter"))
    }
    
    return api.register(email, password)
}

fun isValidEmail(email: String): Boolean {
    return android.util.Patterns.EMAIL_ADDRESS.matcher(email).matches()
}

// 或使用验证器类
class Validator {
    fun validateEmail(email: String): ValidationResult {
        if (email.isEmpty()) {
            return ValidationResult.Error("Email is required")
        }
        if (!isValidEmail(email)) {
            return ValidationResult.Error("Invalid email format")
        }
        return ValidationResult.Success
    }
    
    fun validatePassword(password: String): ValidationResult {
        if (password.isEmpty()) {
            return ValidationResult.Error("Password is required")
        }
        if (password.length < 8) {
            return ValidationResult.Error("Password must be at least 8 characters")
        }
        if (!password.any { it.isDigit() }) {
            return ValidationResult.Error("Password must contain at least one digit")
        }
        if (!password.any { it.isUpperCase() }) {
            return ValidationResult.Error("Password must contain at least one uppercase letter")
        }
        return ValidationResult.Success
    }
}

sealed class ValidationResult {
    object Success : ValidationResult()
    data class Error(val message: String) : ValidationResult()
}
```

#### 问题 2: 数值范围未校验

**问题代码:**
```kotlin
fun setVolume(volume: Int) {
    audioManager.setStreamVolume(
        AudioManager.STREAM_MUSIC,
        volume,  // 问题: 未校验范围
        0
    )
}
```

**解决方案:**
```kotlin
fun setVolume(volume: Int) {
    val maxVolume = audioManager.getStreamMaxVolume(AudioManager.STREAM_MUSIC)
    val validVolume = volume.coerceIn(0, maxVolume)
    
    audioManager.setStreamVolume(
        AudioManager.STREAM_MUSIC,
        validVolume,
        0
    )
}
```

### 场景 4: 异步逻辑问题

#### 问题 1: 回调地狱

**问题代码:**
```kotlin
fun loadUserData(userId: String) {
    api.getUser(userId) { user ->
        if (user != null) {
            api.getUserPosts(userId) { posts ->
                if (posts != null) {
                    api.getPostComments(posts[0].id) { comments ->
                        if (comments != null) {
                            // 嵌套太深,难以维护
                        }
                    }
                }
            }
        }
    }
}
```

**解决方案:**
```kotlin
// 使用协程 (推荐)
suspend fun loadUserData(userId: String) {
    try {
        val user = api.getUser(userId)
        val posts = api.getUserPosts(userId)
        val comments = if (posts.isNotEmpty()) {
            api.getPostComments(posts[0].id)
        } else {
            emptyList()
        }
        
        // 处理数据
        displayData(user, posts, comments)
    } catch (e: Exception) {
        handleError(e)
    }
}
```

#### 问题 2: 异步操作顺序错误

**问题代码:**
```kotlin
fun saveData() {
    viewModelScope.launch {
        // 问题: 两个操作并发执行,可能导致数据不一致
        launch { saveToDatabase() }
        launch { uploadToServer() }
    }
}
```

**解决方案:**
```kotlin
// 方案 1: 顺序执行
fun saveData() {
    viewModelScope.launch {
        saveToDatabase()  // 先保存到数据库
        uploadToServer()  // 再上传到服务器
    }
}

// 方案 2: 并发执行但等待完成
fun saveData() {
    viewModelScope.launch {
        val deferredDb = async { saveToDatabase() }
        val deferredServer = async { uploadToServer() }
        
        // 等待两个操作都完成
        deferredDb.await()
        deferredServer.await()
    }
}

// 方案 3: 使用 Flow 控制顺序
fun saveData() {
    viewModelScope.launch {
        flow {
            emit(saveToDatabase())
            emit(uploadToServer())
        }.collect { result ->
            // 按顺序处理结果
        }
    }
}
```

---

## 逻辑问题调试技巧

### 1. 使用日志追踪

```kotlin
fun processOrder(order: Order) {
    Log.d("Order", "Processing order: ${order.id}")
    
    val validationResult = validateOrder(order)
    Log.d("Order", "Validation result: $validationResult")
    
    if (validationResult.isSuccess) {
        val result = saveOrder(order)
        Log.d("Order", "Save result: $result")
    } else {
        Log.e("Order", "Validation failed: ${validationResult.error}")
    }
}
```

### 2. 使用断言

```kotlin
fun calculateTotal(items: List<Item>): Double {
    val total = items.sumOf { it.price }
    
    // 断言: 总价不应为负
    assert(total >= 0) { "Total price cannot be negative: $total" }
    
    return total
}
```

### 3. 单元测试

```kotlin
@Test
fun `test discount calculation with valid input`() {
    val result = calculateDiscount(price = 100.0, discountPercent = 20)
    assertEquals(80.0, result, 0.01)
}

@Test
fun `test discount calculation with negative price`() {
    assertThrows<IllegalArgumentException> {
        calculateDiscount(price = -100.0, discountPercent = 20)
    }
}

@Test
fun `test discount calculation with invalid percent`() {
    assertThrows<IllegalArgumentException> {
        calculateDiscount(price = 100.0, discountPercent = 150)
    }
}
```

---

## 逻辑问题最佳实践

### 1. 输入校验

- [ ] 校验空值
- [ ] 校验数据类型
- [ ] 校验数值范围
- [ ] 校验字符串格式
- [ ] 校验业务规则

### 2. 状态管理

- [ ] 使用不可变数据
- [ ] 单一数据源
- [ ] 使用 StateFlow/LiveData
- [ ] 保存和恢复状态
- [ ] 避免状态不一致

### 3. 错误处理

- [ ] 使用 Result/Either 类型
- [ ] 提供有意义的错误消息
- [ ] 记录错误日志
- [ ] 优雅降级
- [ ] 向用户展示友好提示

### 4. 代码可读性

- [ ] 使用有意义的变量名
- [ ] 提取复杂逻辑为函数
- [ ] 添加注释说明业务规则
- [ ] 使用 when 表达式替代复杂 if-else
- [ ] 保持函数简短

---

## 逻辑问题分析报告模板

```markdown
# 逻辑问题分析报告

## 问题概述
- **类型:** [业务逻辑/状态管理/数据校验/异步逻辑]
- **症状:** [具体表现]
- **期望行为:** [正确的行为]
- **实际行为:** [错误的行为]

## 复现步骤
1. [步骤 1]
2. [步骤 2]
3. [步骤 3]

## 根因分析
[详细的根因说明]

## 问题代码
\`\`\`kotlin
[问题代码]
\`\`\`

## 修复方案
\`\`\`kotlin
[修复代码]
\`\`\`

## 测试用例
\`\`\`kotlin
[单元测试代码]
\`\`\`

## 预防措施
[避免类似问题的建议]
```
