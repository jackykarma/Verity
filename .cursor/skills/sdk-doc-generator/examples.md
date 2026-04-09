# SDK 文档生成器使用示例

这个文件展示了如何使用 SDK 文档生成器 skill 来生成各种类型的文档。

## 示例 1: 为现有 SDK 生成完整文档

### 用户请求

"请为我的 Verity SDK 生成完整的 API 文档"

### Skill 执行流程

1. **分析项目结构**
   - 扫描 `app/src/main/java/com/jacky/verity/` 目录
   - 识别公开的类和方法
   - 提取 KDoc 注释

2. **生成 API 文档**
   - 为每个公开类创建文档条目
   - 提取方法签名和参数
   - 生成使用示例

3. **生成 README**
   - 创建项目概述
   - 添加快速开始指南
   - 包含安装说明

### 预期输出

```
docs/
├── README.md              # 主文档
├── api-reference.md       # 完整 API 参考
├── getting-started.md     # 快速开始
└── examples/
    └── basic-usage.kt     # 示例代码
```

---

## 示例 2: 为特定类生成文档

### 用户请求

"为 MainActivity 类生成详细的 API 文档"

### Skill 执行流程

1. **读取源文件**
   ```kotlin
   // 读取 MainActivity.kt
   ```

2. **提取 API 信息**
   - 类定义
   - 公开方法
   - 属性
   - 构造函数

3. **生成文档**
   使用 API 模板生成:

```markdown
### `MainActivity`

主活动类,应用的入口点。

**包名**: `com.jacky.verity`

**继承**: `ComponentActivity()`

#### 方法

##### `onCreate()`

\`\`\`kotlin
override fun onCreate(savedInstanceState: Bundle?)
\`\`\`

初始化活动并设置 UI 内容。

**参数**:
- `savedInstanceState` (Bundle?): 保存的状态数据

**示例**:
\`\`\`kotlin
class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            VerityTheme {
                // UI 内容
            }
        }
    }
}
\`\`\`
```

---

## 示例 3: 生成 OpenAPI 规范

### 用户请求

"为 REST API 生成 OpenAPI 3.0 规范"

### Skill 执行流程

1. **识别 API 端点**
   - 扫描路由定义
   - 提取请求/响应模型
   - 识别认证方式

2. **生成 OpenAPI YAML**

```yaml
openapi: 3.0.0
info:
  title: Verity API
  version: 1.0.0
  description: Word memory application API

servers:
  - url: https://api.verity.com/v1

paths:
  /words:
    get:
      summary: 获取单词列表
      parameters:
        - name: limit
          in: query
          schema:
            type: integer
            default: 20
      responses:
        '200':
          description: 成功
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/Word'

components:
  schemas:
    Word:
      type: object
      properties:
        id:
          type: string
        text:
          type: string
        definition:
          type: string
```

---

## 示例 4: 更新现有文档

### 用户请求

"我添加了新的 API 方法,请更新文档"

### Skill 执行流程

1. **对比变更**
   - 读取现有文档
   - 扫描当前代码
   - 识别新增/修改的 API

2. **增量更新**
   - 添加新 API 条目
   - 更新修改的方法签名
   - 标记已弃用的 API

3. **更新版本信息**
   - 在变更日志中添加条目
   - 更新版本号

---

## 示例 5: 生成使用示例

### 用户请求

"为单词管理 API 生成使用示例"

### Skill 执行流程

1. **识别关键场景**
   - 添加单词
   - 查询单词
   - 更新单词
   - 删除单词

2. **生成场景示例**

```kotlin
// 示例 1: 添加新单词
val wordManager = WordManager.getInstance()
val word = Word(
    text = "algorithm",
    definition = "A step-by-step procedure for solving a problem"
)
wordManager.addWord(word)

// 示例 2: 查询单词
val result = wordManager.searchWords("algo")
result.forEach { word ->
    println("${word.text}: ${word.definition}")
}

// 示例 3: 更新单词
val updated = word.copy(
    definition = "Updated definition"
)
wordManager.updateWord(updated)

// 示例 4: 删除单词
wordManager.deleteWord(word.id)
```

---

## 示例 6: 批量生成文档

### 用户请求

"为整个项目生成文档包,包括 README、API 参考和使用指南"

### Skill 执行流程

1. **扫描整个项目**
   - 识别所有模块
   - 提取公开 API
   - 收集示例代码

2. **生成文档结构**

```
docs/
├── README.md                    # 主文档
├── getting-started.md           # 快速开始
├── api-reference.md             # API 完整参考
├── guides/
│   ├── word-management.md       # 单词管理指南
│   ├── spaced-repetition.md     # 间隔重复算法
│   ├── authentication.md        # 认证指南
│   └── best-practices.md        # 最佳实践
├── examples/
│   ├── basic-usage.kt           # 基础用法
│   ├── advanced-usage.kt        # 高级用法
│   └── use-cases/
│       ├── add-words.kt
│       ├── study-session.kt
│       └── export-data.kt
└── api/
    ├── word-manager.md
    ├── repetition-engine.md
    └── data-models.md
```

3. **生成每个文档**
   - 使用相应的模板
   - 填充实际的 API 信息
   - 添加代码示例

---

## 示例 7: 为多语言项目生成文档

### 用户请求

"生成同时包含 Kotlin 和 Java 调用示例的文档"

### Skill 执行流程

1. **生成双语言示例**

```markdown
### `WordManager.addWord()`

添加新单词到词库。

#### Kotlin 用法

\`\`\`kotlin
val manager = WordManager.getInstance()
manager.addWord(Word("hello", "问候"))
\`\`\`

#### Java 用法

\`\`\`java
WordManager manager = WordManager.getInstance();
manager.addWord(new Word("hello", "问候"));
\`\`\`
```

---

## 示例 8: 生成变更日志

### 用户请求

"根据 git 提交历史生成变更日志"

### Skill 执行流程

1. **分析 Git 历史**
   ```bash
   git log --oneline --since="2026-01-01"
   ```

2. **分类变更**
   - 新特性
   - Bug 修复
   - 性能优化
   - 重大变更

3. **生成 CHANGELOG.md**

```markdown
# 变更日志

## [1.1.0] - 2026-01-22

### 新增
- ✨ 添加间隔重复算法
- ✨ 支持单词导入/导出
- ✨ 添加学习统计功能

### 修复
- 🐛 修复单词搜索的性能问题
- 🐛 修复数据同步异常

### 优化
- ⚡ 提升启动速度 50%
- ⚡ 优化内存使用

### 变更
- 💥 API: `getWord()` 现在返回 `Result<Word>` 而非 `Word?`
```

---

## 最佳实践

### 何时使用这个 Skill

✅ **适用场景**:
- 创建新 SDK 时需要生成文档
- 现有 SDK 缺少文档
- API 发生变更需要更新文档
- 需要生成多种格式的文档(Markdown、HTML、OpenAPI)
- 准备开源项目

❌ **不适用场景**:
- 简单的代码注释
- 内部实现细节的文档
- 纯设计文档(无代码)

### 提示词技巧

更具体的提示可以获得更好的结果:

- ✅ "为 WordManager 类生成包含使用示例的 API 文档"
- ✅ "生成 OpenAPI 3.0 规范,包含所有 REST 端点"
- ✅ "更新 README,添加新的安装方式和快速开始指南"

- ❌ "生成文档" (太笼统)
- ❌ "写点说明" (不够具体)

### 自定义模板

你可以修改 `templates/` 目录中的模板来适应你的风格:

1. 编辑 `templates/api-template.md`
2. 调整格式和结构
3. 添加你的品牌元素

---

## 故障排除

### 问题: 生成的文档缺少某些 API

**解决方案**: 
- 确保 API 是 `public` 或 `open`
- 检查是否有 KDoc/JavaDoc 注释
- 确认文件在源代码目录中

### 问题: 示例代码无法运行

**解决方案**:
- 检查导入语句是否完整
- 验证 API 签名是否正确
- 确保使用的是最新版本的 SDK

### 问题: 文档格式不一致

**解决方案**:
- 使用统一的模板
- 遵循风格指南 (`style-guide.md`)
- 运行格式化工具

---

## 相关资源

- [SKILL.md](SKILL.md) - 完整的 skill 指令
- [style-guide.md](style-guide.md) - 文档风格指南
- [templates/](templates/) - 文档模板
