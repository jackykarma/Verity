---
name: sdk-doc-generator
description: 自动生成 SDK 接口文档,包括 API 扫描、使用示例、OpenAPI 规范和 README。支持 Kotlin/Java、Python、JavaScript 等多种语言。当用户需要生成 SDK 文档、API 参考、接口说明、或更新开发者文档时使用。
---

# SDK 接口文档生成器

自动分析代码库,提取公开 API,生成结构化的 SDK 文档,包括使用示例、参数说明、OpenAPI 规范等。

## 快速开始

当用户请求生成 SDK 文档时:

1. **识别文档范围** - 确定要文档化的模块/包
2. **扫描 API** - 提取公开的类、方法、接口
3. **生成文档** - 根据需求生成对应格式的文档
4. **添加示例** - 为关键 API 生成使用示例

## 工作流程

### 第 1 步: 分析项目结构

首先了解项目的组织方式:

```bash
# 查找主要的源代码目录
find . -type d -name "src" -o -name "lib" -o -name "api"

# 识别语言和框架
# Kotlin/Java: build.gradle.kts, .kt/.java 文件
# Python: setup.py, requirements.txt, .py 文件
# JavaScript/TypeScript: package.json, .js/.ts 文件
```

**输出**: 列出要文档化的主要模块和包

### 第 2 步: 扫描公开 API

根据语言提取公开的 API:

#### Kotlin/Java API 扫描

```kotlin
// 扫描标准:
// - public/open 类和接口
// - public 方法和属性
// - @JvmStatic 静态方法
// - 数据类的公开属性
// - 枚举类型
```

提取信息:
- 类名、包名
- 方法签名(参数、返回类型)
- 注释文档(KDoc/JavaDoc)
- 注解(如 @Deprecated)

#### Python API 扫描

```python
# 扫描标准:
# - 不以 _ 开头的类和函数
# - __all__ 中声明的接口
# - 类型注解
# - docstring 文档
```

#### JavaScript/TypeScript API 扫描

```javascript
// 扫描标准:
// - export 的类、函数、常量
// - 接口定义(TypeScript)
// - JSDoc 注释
// - 类型定义
```

### 第 3 步: 生成文档

根据用户需求选择文档格式:

#### 格式 A: Markdown API 文档

```markdown
# [模块名] API 参考

## 概述
[模块的简短描述]

## 快速开始
[最简单的使用示例]

## 类和接口

### `ClassName`

**描述**: [类的用途]

**包名**: `com.example.package`

#### 构造函数

\`\`\`kotlin
ClassName(param1: Type1, param2: Type2)
\`\`\`

**参数**:
- `param1` (Type1): 参数描述
- `param2` (Type2): 参数描述

#### 方法

##### `methodName()`

\`\`\`kotlin
fun methodName(arg: String): Result
\`\`\`

**描述**: 方法功能说明

**参数**:
- `arg` (String): 参数说明

**返回值**: Result - 返回值说明

**示例**:
\`\`\`kotlin
val instance = ClassName(param1, param2)
val result = instance.methodName("example")
\`\`\`

**异常**:
- `Exception1`: 抛出条件
```

#### 格式 B: KDoc/JavaDoc 风格

在代码中生成或补充文档注释:

```kotlin
/**
 * [类的简短描述]
 *
 * [详细描述,包括使用场景]
 *
 * 示例:
 * ```kotlin
 * val example = ClassName()
 * example.methodName()
 * ```
 *
 * @property propertyName 属性说明
 * @constructor 构造函数说明
 * @since 1.0.0
 * @see RelatedClass
 */
class ClassName {
    /**
     * [方法简短描述]
     *
     * [详细说明,包括使用场景和注意事项]
     *
     * @param paramName 参数说明
     * @return 返回值说明
     * @throws ExceptionType 异常说明
     * @sample com.example.samples.methodNameSample
     */
    fun methodName(paramName: String): Result {
        // ...
    }
}
```

#### 格式 C: OpenAPI/Swagger 规范

对于 REST API,生成 OpenAPI 3.0 规范:

```yaml
openapi: 3.0.0
info:
  title: [SDK 名称] API
  version: 1.0.0
  description: [SDK 描述]

servers:
  - url: https://api.example.com/v1

paths:
  /resource:
    get:
      summary: 获取资源
      operationId: getResource
      parameters:
        - name: id
          in: query
          required: true
          schema:
            type: string
      responses:
        '200':
          description: 成功响应
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Resource'

components:
  schemas:
    Resource:
      type: object
      properties:
        id:
          type: string
        name:
          type: string
```

### 第 4 步: 生成使用示例

为关键 API 创建实际可运行的示例:

#### 基础示例结构

```markdown
## 使用示例

### 基础用法

\`\`\`kotlin
// 1. 初始化
val sdk = SDKClass.Builder()
    .setApiKey("your-api-key")
    .build()

// 2. 调用 API
val result = sdk.someMethod("parameter")

// 3. 处理结果
when (result) {
    is Success -> println("成功: ${result.data}")
    is Error -> println("失败: ${result.message}")
}
\`\`\`

### 高级用法

\`\`\`kotlin
// 配置选项
val sdk = SDKClass.Builder()
    .setApiKey("your-api-key")
    .setTimeout(30000)
    .setRetryPolicy(RetryPolicy.EXPONENTIAL)
    .build()

// 异步调用
sdk.someMethodAsync("parameter") { result ->
    // 处理回调
}
\`\`\`

### 常见场景

#### 场景 1: [具体场景名称]

\`\`\`kotlin
// 详细的分步示例
\`\`\`

#### 场景 2: [具体场景名称]

\`\`\`kotlin
// 详细的分步示例
\`\`\`
```

### 第 5 步: 生成 README 文档

创建用户友好的 README:

```markdown
# [SDK 名称]

[一句话描述 SDK 的用途]

## 特性

- ✨ 特性 1
- ✨ 特性 2
- ✨ 特性 3

## 安装

### Gradle (Kotlin DSL)

\`\`\`kotlin
dependencies {
    implementation("com.example:sdk-name:1.0.0")
}
\`\`\`

### Maven

\`\`\`xml
<dependency>
    <groupId>com.example</groupId>
    <artifactId>sdk-name</artifactId>
    <version>1.0.0</version>
</dependency>
\`\`\`

## 快速开始

\`\`\`kotlin
// 最简单的使用示例(3-5 行代码)
val sdk = SDK.create("api-key")
val result = sdk.doSomething()
println(result)
\`\`\`

## 文档

- [API 参考](docs/api-reference.md)
- [使用指南](docs/guide.md)
- [示例代码](examples/)

## 配置

### 基础配置

| 选项 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| apiKey | String | - | API 密钥(必需) |
| timeout | Long | 30000 | 超时时间(毫秒) |
| retryCount | Int | 3 | 重试次数 |

### 高级配置

\`\`\`kotlin
val sdk = SDK.Builder()
    .setApiKey("key")
    .setBaseUrl("https://custom.api.com")
    .setLogLevel(LogLevel.DEBUG)
    .build()
\`\`\`

## 示例

### 示例 1: [场景名称]

\`\`\`kotlin
// 完整的可运行示例
\`\`\`

[更多示例](examples/)

## 常见问题

### Q: [问题]
A: [解答]

### Q: [问题]
A: [解答]

## 贡献

欢迎贡献!请查看 [CONTRIBUTING.md](CONTRIBUTING.md)

## 许可证

[许可证类型] - 查看 [LICENSE](LICENSE) 文件
```

## 文档组织结构

推荐的文档目录结构:

```
docs/
├── README.md                 # 主文档入口
├── getting-started.md        # 快速开始指南
├── api-reference.md          # API 完整参考
├── guides/                   # 使用指南
│   ├── authentication.md
│   ├── error-handling.md
│   └── best-practices.md
├── examples/                 # 示例代码
│   ├── basic-usage.kt
│   ├── advanced-usage.kt
│   └── use-cases/
└── changelog.md              # 变更日志
```

## 最佳实践

### 文档质量标准

1. **清晰的描述**: 每个 API 都有简短(1 句)和详细描述
2. **完整的参数说明**: 包括类型、是否必需、默认值
3. **实际示例**: 每个重要 API 至少一个可运行示例
4. **错误处理**: 说明可能的异常和处理方法
5. **版本信息**: 标注 API 引入版本和弃用信息

### 示例代码标准

- ✅ **可运行**: 示例代码应该可以直接复制运行
- ✅ **完整**: 包含必要的导入和初始化
- ✅ **简洁**: 专注于演示特定功能
- ✅ **注释**: 关键步骤添加解释性注释
- ✅ **真实**: 使用接近真实场景的数据

### 文档维护

- 在代码中保持 KDoc/JavaDoc 注释最新
- API 变更时同步更新文档
- 定期检查示例代码是否仍可运行
- 收集用户反馈,改进文档

## 针对不同语言的特殊处理

### Kotlin 特性

- 扩展函数的文档化
- 协程和挂起函数的说明
- DSL 构建器的使用示例
- 属性委托的说明

### Java 互操作性

- @JvmStatic、@JvmOverloads 等注解
- Java 调用 Kotlin 代码的示例
- 类型擦除和泛型的说明

### Python 特性

- 类型提示(Type Hints)
- 装饰器的说明
- 魔法方法的文档
- async/await 异步 API

### TypeScript 特性

- 接口和类型定义
- 泛型使用
- Promise 和 async/await
- 类型保护

## 自动化增强

### 使用 Dokka (Kotlin)

```kotlin
// build.gradle.kts
plugins {
    id("org.jetbrains.dokka") version "1.9.10"
}

tasks.dokkaHtml {
    outputDirectory.set(file("docs/api"))
}
```

### 使用 JavaDoc (Java)

```bash
javadoc -d docs/api \
    -sourcepath src/main/java \
    -subpackages com.example
```

### 使用 Sphinx (Python)

```bash
sphinx-quickstart docs
sphinx-apidoc -o docs/source src/
sphinx-build -b html docs/source docs/build
```

### 使用 TypeDoc (TypeScript)

```bash
typedoc --out docs src/index.ts
```

## 文档发布

### GitHub Pages

```yaml
# .github/workflows/docs.yml
name: Deploy Docs
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Generate docs
        run: ./gradlew dokkaHtml
      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./docs
```

## 验证清单

生成文档后,验证:

- [ ] 所有公开 API 都已文档化
- [ ] 每个方法都有参数和返回值说明
- [ ] 重要 API 都有使用示例
- [ ] 示例代码可以运行
- [ ] README 包含快速开始指南
- [ ] 包含安装说明
- [ ] 错误处理有说明
- [ ] 版本信息完整
- [ ] 链接都可访问
- [ ] 代码格式正确

## 附加资源

- 详细的文档风格指南: [style-guide.md](style-guide.md)
- API 文档模板: [templates/api-template.md](templates/api-template.md)
- README 模板: [templates/readme-template.md](templates/readme-template.md)
