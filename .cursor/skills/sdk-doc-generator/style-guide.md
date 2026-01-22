# SDK 文档风格指南

本指南定义了生成 SDK 文档时应遵循的风格和格式标准。

## 语言和语气

### 使用第二人称
- ✅ "调用这个方法来获取数据"
- ❌ "我们调用这个方法" 或 "开发者调用这个方法"

### 使用主动语态
- ✅ "SDK 返回一个 Result 对象"
- ❌ "一个 Result 对象被返回"

### 保持简洁
- ✅ "使用此方法获取用户数据"
- ❌ "此方法可以被用来从服务器获取当前已登录用户的相关数据信息"

## 命名约定

### 类和接口
- 使用 PascalCase: `UserManager`, `DataProvider`
- 描述要清晰表达用途

### 方法和函数
- 使用 camelCase: `getUserData()`, `setApiKey()`
- 动词开头表示动作

### 常量
- 全大写加下划线: `MAX_RETRY_COUNT`, `DEFAULT_TIMEOUT`

### 参数和变量
- 使用 camelCase: `userId`, `retryCount`
- 名称要有描述性

## 文档结构

### 类文档结构

```markdown
### `ClassName`

[一句话描述类的用途]

[详细描述:包括主要功能、使用场景、注意事项]

**包名**: `com.example.package`

**继承**: `ParentClass` (如果有)

**实现**: `Interface1`, `Interface2` (如果有)

**自**: `1.0.0` (引入版本)

#### 构造函数
[构造函数文档]

#### 属性
[属性列表]

#### 方法
[方法列表]

#### 示例
[使用示例]
```

### 方法文档结构

```markdown
##### `methodName()`

\`\`\`kotlin
fun methodName(param1: Type1, param2: Type2): ReturnType
\`\`\`

[一句话描述方法功能]

[详细说明:具体做什么、何时使用、注意事项]

**参数**:
- `param1` (Type1): 参数说明,包括有效值范围
- `param2` (Type2, 可选): 参数说明,默认值为 `defaultValue`

**返回值**: `ReturnType` - 返回值说明

**异常**:
- `ExceptionType1`: 何时抛出此异常
- `ExceptionType2`: 何时抛出此异常

**自**: `1.0.0`

**另见**: `RelatedMethod()`, `RelatedClass`

**示例**:
\`\`\`kotlin
val result = instance.methodName(param1Value, param2Value)
\`\`\`
```

## 代码示例标准

### 基本原则

1. **完整性**: 示例应该可以直接复制运行
2. **相关性**: 专注于演示特定功能
3. **简洁性**: 去除不必要的代码
4. **真实性**: 使用真实场景的数据

### 示例格式

```kotlin
// 1. 设置/初始化
val sdk = SDKClass.Builder()
    .setApiKey("your-api-key")
    .build()

// 2. 执行操作
val result = sdk.doSomething()

// 3. 处理结果
when (result) {
    is Success -> {
        // 处理成功情况
        println("成功: ${result.data}")
    }
    is Error -> {
        // 处理错误情况
        println("失败: ${result.message}")
    }
}
```

### 注释规则

- 用注释分隔主要步骤
- 关键代码添加解释
- 不要注释显而易见的代码
- 使用中文注释

### 错误处理

示例代码应该展示适当的错误处理:

```kotlin
try {
    val result = sdk.riskyOperation()
    println("成功: $result")
} catch (e: NetworkException) {
    println("网络错误: ${e.message}")
} catch (e: AuthException) {
    println("认证失败: ${e.message}")
}
```

## 参数文档

### 参数说明格式

```
- `paramName` (Type, 可选): 参数的详细说明
  - 有效值: value1, value2, value3
  - 默认值: `defaultValue`
  - 范围: 1-100
```

### 必需参数 vs 可选参数

- 必需参数: `paramName` (Type)
- 可选参数: `paramName` (Type, 可选)
- 带默认值: `paramName` (Type, 默认 = value)

### 复杂类型参数

对于对象类型参数,提供结构说明:

```
- `config` (ConfigObject): 配置对象
  - `config.timeout` (Long): 超时时间(毫秒)
  - `config.retryCount` (Int): 重试次数
  - `config.headers` (Map<String, String>): 自定义请求头
```

## 返回值文档

### 简单返回值

```
**返回值**: `String` - 用户的唯一标识符
```

### 复杂返回值

```
**返回值**: `Result<Data>` - 操作结果

成功时:
- `Result.Success<Data>`: 包含请求的数据
  - `data.id`: 记录ID
  - `data.name`: 记录名称

失败时:
- `Result.Error`: 包含错误信息
  - `code`: 错误代码
  - `message`: 错误描述
```

### 异步返回值

```
**返回值**: `Flow<Status>` - 状态流

发射的值:
- `Status.Loading`: 加载中
- `Status.Success(data)`: 成功,包含数据
- `Status.Error(message)`: 失败,包含错误信息
```

## 异常文档

### 列出所有可能的异常

```
**异常**:
- `NetworkException`: 网络连接失败或超时
- `AuthException`: API 密钥无效或已过期
- `ValidationException`: 参数验证失败
- `IllegalStateException`: SDK 未初始化或状态不正确
```

### 异常处理示例

在文档中展示如何处理异常:

```kotlin
try {
    sdk.operation()
} catch (e: NetworkException) {
    // 处理网络错误
    Log.e(TAG, "网络错误", e)
} catch (e: AuthException) {
    // 处理认证错误
    Log.e(TAG, "认证失败", e)
}
```

## 版本标记

### 引入版本

标记 API 首次引入的版本:

```
**自**: `1.0.0`
```

### 弃用标记

对于已弃用的 API:

```
**已弃用**: 自 2.0.0 起,请使用 `newMethod()` 代替

此方法将在 3.0.0 版本中移除。

**迁移指南**:
\`\`\`kotlin
// 旧代码
val result = sdk.oldMethod()

// 新代码
val result = sdk.newMethod()
\`\`\`
```

### 实验性 API

对于实验性或不稳定的 API:

```
**⚠️ 实验性**: 此 API 处于实验阶段,可能在未来版本中发生变化

建议仅在测试环境中使用。
```

## 链接和交叉引用

### 链接到其他 API

```markdown
参见 [`RelatedClass`](#relatedclass) 和 [`relatedMethod()`](#relatedmethod)
```

### 链接到指南

```markdown
详细说明请参考 [认证指南](guides/authentication.md)
```

### 链接到外部资源

```markdown
了解更多关于 [OAuth 2.0](https://oauth.net/2/)
```

## 表格格式

### 配置选项表格

```markdown
| 选项 | 类型 | 必需 | 默认值 | 说明 |
|------|------|------|--------|------|
| apiKey | String | ✅ | - | API 密钥 |
| timeout | Long | ❌ | 30000 | 超时时间(毫秒) |
| retryCount | Int | ❌ | 3 | 失败重试次数 |
```

### 方法对比表格

```markdown
| 方法 | 同步/异步 | 返回类型 | 使用场景 |
|------|-----------|----------|----------|
| getData() | 同步 | Data | 简单获取数据 |
| getDataAsync() | 异步 | Flow<Data> | 响应式数据流 |
| getDataSuspend() | 挂起 | Data | 协程中使用 |
```

## 警告和注意事项

### 警告框

```markdown
**⚠️ 警告**: 此操作不可逆,请谨慎使用
```

### 重要提示

```markdown
**💡 提示**: 建议在应用启动时初始化 SDK
```

### 注意事项

```markdown
**📝 注意**: 
- 此方法在主线程调用时可能阻塞
- 建议在后台线程使用
- 最大数据大小为 10MB
```

## 平台特定说明

### Android 特定

```markdown
**Android 要求**:
- 最低 SDK: API 21 (Android 5.0)
- 需要权限: `INTERNET`, `ACCESS_NETWORK_STATE`
- ProGuard 规则: [参见配置](#proguard)
```

### 多平台支持

```markdown
**平台支持**:
- ✅ Android (API 21+)
- ✅ JVM (Java 8+)
- ✅ iOS (实验性)
- ❌ JavaScript
```

## 性能说明

### 性能提示

```markdown
**性能**: 
- 时间复杂度: O(n)
- 空间复杂度: O(1)
- 建议批量处理以提高效率
```

### 最佳实践

```markdown
**最佳实践**:
- 复用 SDK 实例而非频繁创建
- 使用连接池减少网络开销
- 启用缓存可提升 50% 性能
```

## 安全说明

### 安全提示

```markdown
**🔒 安全**:
- 不要在客户端硬编码 API 密钥
- 使用 HTTPS 传输敏感数据
- 定期轮换访问令牌
```

## 许可和归属

### 开源许可

```markdown
**许可**: Apache License 2.0

**第三方库**:
- OkHttp (Apache 2.0)
- Gson (Apache 2.0)
```

## 文档元数据

每个文档文件应包含元数据:

```markdown
---
title: API 参考
version: 1.0.0
last_updated: 2026-01-22
---
```

## 检查清单

生成文档后,检查:

- [ ] 所有公开 API 都已文档化
- [ ] 每个方法有清晰的描述
- [ ] 参数类型和说明完整
- [ ] 返回值说明清楚
- [ ] 重要 API 有使用示例
- [ ] 异常情况已说明
- [ ] 版本信息完整
- [ ] 代码示例可运行
- [ ] 链接都有效
- [ ] 格式一致
- [ ] 无拼写错误
- [ ] 注意事项已标注
