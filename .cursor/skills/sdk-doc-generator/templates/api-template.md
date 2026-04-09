# [模块名称] API 参考

**版本**: 1.0.0  
**最后更新**: YYYY-MM-DD

---

## 概述

[模块的简短描述 - 1-2 句话说明这个模块是做什么的]

[详细描述 - 包括主要功能、使用场景、与其他模块的关系]

---

## 快速开始

```kotlin
// 最简单的使用示例(3-5 行代码展示核心功能)
val instance = ModuleClass.create()
val result = instance.mainMethod()
println(result)
```

---

## 安装

### Gradle (Kotlin DSL)

```kotlin
dependencies {
    implementation("com.example:module-name:1.0.0")
}
```

### Maven

```xml
<dependency>
    <groupId>com.example</groupId>
    <artifactId>module-name</artifactId>
    <version>1.0.0</version>
</dependency>
```

---

## 核心类和接口

### `MainClass`

[类的简短描述]

[详细说明:主要功能、使用场景、重要概念]

**包名**: `com.example.module`

**实现**: `Interface1`, `Interface2`

**自**: `1.0.0`

#### 构造函数

##### `MainClass()`

```kotlin
MainClass(
    param1: String,
    param2: Int = 10,
    param3: Boolean = false
)
```

创建 MainClass 实例。

**参数**:
- `param1` (String): 参数1的说明
  - 有效值: "value1", "value2", "value3"
- `param2` (Int, 可选): 参数2的说明
  - 默认值: `10`
  - 范围: 1-100
- `param3` (Boolean, 可选): 参数3的说明
  - 默认值: `false`

**异常**:
- `IllegalArgumentException`: 当 param1 为空或 param2 超出范围时

**示例**:
```kotlin
// 使用默认值
val instance1 = MainClass("config1")

// 自定义配置
val instance2 = MainClass(
    param1 = "config2",
    param2 = 50,
    param3 = true
)
```

#### 属性

##### `propertyName`

```kotlin
val propertyName: String
```

[属性说明]

**类型**: `String`

**访问**: 只读

**自**: `1.0.0`

#### 方法

##### `mainMethod()`

```kotlin
fun mainMethod(
    input: String,
    options: Options? = null
): Result<Data>
```

[方法的简短描述 - 1句话]

[详细说明:
- 方法的具体功能
- 何时使用这个方法
- 与其他方法的区别
- 重要的注意事项]

**参数**:
- `input` (String): 输入参数说明
  - 格式要求: [说明格式]
  - 最大长度: 1000 字符
- `options` (Options?, 可选): 可选配置对象
  - `options.timeout`: 超时时间(毫秒)
  - `options.retryCount`: 重试次数

**返回值**: `Result<Data>` - 操作结果

成功时:
- `Result.Success<Data>`: 包含处理后的数据
  - `data.id`: 数据标识符
  - `data.value`: 数据值
  - `data.timestamp`: 处理时间戳

失败时:
- `Result.Error`: 包含错误信息
  - `error.code`: 错误代码
  - `error.message`: 错误描述

**异常**:
- `NetworkException`: 网络连接失败
- `ValidationException`: 输入验证失败
- `IllegalStateException`: 对象状态不正确

**性能**: 
- 时间复杂度: O(n)
- 建议: 对于大量数据建议使用批量方法

**自**: `1.0.0`

**另见**: [`batchMethod()`](#batchmethod), [`asyncMethod()`](#asyncmethod)

**示例**:

基础用法:
```kotlin
val instance = MainClass("config")
val result = instance.mainMethod("input-data")

when (result) {
    is Result.Success -> {
        println("处理成功: ${result.data}")
    }
    is Result.Error -> {
        println("处理失败: ${result.error.message}")
    }
}
```

带选项:
```kotlin
val options = Options(
    timeout = 5000,
    retryCount = 3
)
val result = instance.mainMethod("input-data", options)
```

错误处理:
```kotlin
try {
    val result = instance.mainMethod("input-data")
    // 处理结果
} catch (e: NetworkException) {
    Log.e(TAG, "网络错误", e)
    // 处理网络错误
} catch (e: ValidationException) {
    Log.e(TAG, "验证错误", e)
    // 处理验证错误
}
```

##### `asyncMethod()`

```kotlin
suspend fun asyncMethod(input: String): Data
```

异步版本的主要方法,在协程中使用。

[详细说明]

**参数**:
- `input` (String): 输入参数

**返回值**: `Data` - 直接返回数据(成功时)

**异常**:
- `NetworkException`: 网络错误
- `CancellationException`: 协程被取消

**示例**:
```kotlin
// 在协程中使用
lifecycleScope.launch {
    try {
        val data = instance.asyncMethod("input")
        println("成功: $data")
    } catch (e: NetworkException) {
        println("网络错误: ${e.message}")
    }
}

// 使用 Flow
instance.asyncMethodFlow("input")
    .catch { e -> println("错误: $e") }
    .collect { data -> println("数据: $data") }
```

---

## 辅助类

### `Options`

配置选项数据类。

```kotlin
data class Options(
    val timeout: Long = 30000,
    val retryCount: Int = 3,
    val cacheEnabled: Boolean = true
)
```

**属性**:
- `timeout` (Long): 超时时间(毫秒),默认 30000
- `retryCount` (Int): 失败重试次数,默认 3
- `cacheEnabled` (Boolean): 是否启用缓存,默认 true

### `Result<T>`

```kotlin
sealed class Result<out T> {
    data class Success<T>(val data: T) : Result<T>()
    data class Error(val error: ErrorInfo) : Result<Nothing>()
}
```

操作结果的封装类。

**类型**:
- `Success<T>`: 成功结果,包含数据
- `Error`: 失败结果,包含错误信息

---

## 完整使用示例

### 示例 1: 基础用法

```kotlin
// 1. 创建实例
val sdk = MainClass("api-key")

// 2. 配置选项
val options = Options(
    timeout = 5000,
    retryCount = 2
)

// 3. 调用方法
val result = sdk.mainMethod("input-data", options)

// 4. 处理结果
when (result) {
    is Result.Success -> {
        val data = result.data
        println("ID: ${data.id}")
        println("Value: ${data.value}")
    }
    is Result.Error -> {
        val error = result.error
        Log.e(TAG, "错误 [${error.code}]: ${error.message}")
    }
}
```

### 示例 2: 异步操作

```kotlin
class MyViewModel : ViewModel() {
    private val sdk = MainClass("api-key")
    
    fun loadData() {
        viewModelScope.launch {
            try {
                // 显示加载中
                _uiState.value = UiState.Loading
                
                // 异步获取数据
                val data = sdk.asyncMethod("input")
                
                // 更新 UI
                _uiState.value = UiState.Success(data)
            } catch (e: Exception) {
                // 处理错误
                _uiState.value = UiState.Error(e.message)
            }
        }
    }
}
```

### 示例 3: 高级配置

```kotlin
// 使用构建器模式进行高级配置
val sdk = MainClass.Builder()
    .setApiKey("your-api-key")
    .setTimeout(10000)
    .setRetryPolicy(RetryPolicy.EXPONENTIAL)
    .setLogLevel(LogLevel.DEBUG)
    .enableCache(true)
    .build()

// 批量操作
val inputs = listOf("input1", "input2", "input3")
val results = sdk.batchMethod(inputs)

results.forEach { result ->
    when (result) {
        is Result.Success -> println("成功: ${result.data}")
        is Result.Error -> println("失败: ${result.error}")
    }
}
```

---

## 常见问题

### Q: 如何处理网络超时?

A: 可以通过 `Options` 设置超时时间:

```kotlin
val options = Options(timeout = 60000) // 60秒
val result = sdk.mainMethod("input", options)
```

### Q: 是否线程安全?

A: `MainClass` 实例是线程安全的,可以在多个线程中共享使用。但建议使用协程而非直接创建线程。

### Q: 如何启用调试日志?

A: 设置日志级别为 DEBUG:

```kotlin
val sdk = MainClass.Builder()
    .setLogLevel(LogLevel.DEBUG)
    .build()
```

---

## 最佳实践

1. **复用实例**: 创建一次 `MainClass` 实例并复用,避免频繁创建
2. **错误处理**: 始终处理可能的异常和错误结果
3. **异步优先**: 在 Android 中优先使用 `asyncMethod()` 和协程
4. **配置缓存**: 启用缓存可显著提升性能
5. **批量操作**: 处理多个项目时使用批量方法

---

## 性能优化

### 缓存

启用缓存可减少网络请求:

```kotlin
val options = Options(cacheEnabled = true)
```

### 批量处理

批量处理多个项目:

```kotlin
val results = sdk.batchMethod(listOf("item1", "item2", "item3"))
```

### 连接池

SDK 内部使用连接池,建议复用实例而非频繁创建。

---

## 错误代码

| 代码 | 说明 | 解决方案 |
|------|------|----------|
| 1001 | 网络连接失败 | 检查网络连接,增加超时时间 |
| 1002 | API 密钥无效 | 检查密钥是否正确 |
| 1003 | 参数验证失败 | 检查输入参数格式 |
| 1004 | 服务器错误 | 稍后重试或联系支持 |

---

## 版本历史

### 1.0.0 (2026-01-22)

- ✨ 初始版本发布
- ✨ 支持基础操作
- ✨ 异步方法支持

---

## 相关文档

- [快速开始指南](getting-started.md)
- [高级用法](guides/advanced-usage.md)
- [错误处理](guides/error-handling.md)
- [性能优化](guides/performance.md)

---

## 支持

- 📧 Email: support@example.com
- 💬 Discord: [加入我们](https://discord.gg/example)
- 🐛 问题反馈: [GitHub Issues](https://github.com/example/repo/issues)
