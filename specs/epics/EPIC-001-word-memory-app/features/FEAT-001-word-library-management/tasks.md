---
description: "Story → Task 落地任务清单模板"
---

# Tasks：单词库管理

**Epic**：EPIC-001 - 无痛记忆单词神器APP
**Feature ID**：FEAT-001
**Feature Version**：v0.1.0（来自 `spec.md`）
**Plan Version**：v0.1.0（来自 `plan.md`）
**Tasks Version**：v0.1.0
**输入**：来自 `Feature 目录/` 的设计文档（`spec.md`、`plan.md`）

> 规则：
> - Task 只能拆解与执行 Plan 的既定 Story；**禁止**在 tasks.md 里改写 Plan 的技术决策或新增未决策的方案。
> - 每个 Task 必须包含：执行步骤、依赖关系（顺序/并行）、验证方式（可执行/可量化）。

## Task 行格式（首行必须严格遵循）

```text
- [ ] T001 [P?] [ST-001] <带路径的任务标题>
```

- **复选框**：必须以 `- [ ]` 开头（完成后改为 `- [x]`）
- **任务 ID**：T001、T002…（全局递增）
- **[P]**：可并行执行（不改同一文件，且无依赖）
- **[ST-xxx]**：必须绑定到 Plan 中的 Story ID
- **路径**：必须写出影响的关键文件路径（真实路径）

### Task 详细信息（紧随首行的子项）

- **依赖**：T???（无则写“无”）
- **步骤**：
  - 1) …
  - 2) …
- **验证**：
  - [ ] 单元/集成/手动验证步骤（可执行）
  - [ ] 指标（如 p95、mAh、内存 MB）与阈值（如适用）
- **产物**：涉及的文件/文档/脚本

## 路径约定（按 plan.md 的结构决策为准）

- **单一项目**：仓库根目录下的 `src/`、`tests/`
- **Web 应用**：`backend/`、`frontend/`
- **移动端**：`android/`、`ios/`（可选 `api/`）


## 阶段 0：准备（可选但建议）

**目标**：对齐版本、冻结设计输入，避免 Implement 期返工

- [ ] T001 在 `specs/epics/EPIC-001-word-memory-app/features/FEAT-001-word-library-management/` 中核对 `spec.md`、`plan.md` 的 Version 字段一致性并补齐变更记录
  - **依赖**：无
  - **步骤**：
    - 1) 确认 `Feature Version`（v0.1.0）、`Plan Version`（v0.1.0）已填写
    - 2) 确认 Plan 的 Story Breakdown 已完成（ST-001 至 ST-006）
    - 3) 确认所有 FR/NFR 已映射到 Story
  - **验证**：
    - [ ] tasks.md 中 `Plan Version` 与 plan.md 一致（v0.1.0）
    - [ ] Story 列表完整（6 个 Story）
  - **产物**：`spec.md`、`plan.md`、`tasks.md`

---

## 阶段 1：环境搭建（共享基础设施）

**目标**：项目初始化与基础结构搭建

- [ ] T010 按照 plan.md 的“结构决策”创建项目目录结构（路径：`[真实目录]`）
  - **依赖**：T001
  - **步骤**：
    - 1) 创建/调整目录
    - 2) 确保与现有模块边界一致
  - **验证**：
    - [ ] 目录结构与 plan.md 一致
  - **产物**：相关目录

- [ ] T011 初始化构建与依赖（路径：`[真实文件，如 build.gradle.kts / package.json]`）
  - **依赖**：T010
  - **步骤**：
    - 1) …
  - **验证**：
    - [ ] 基础构建可通过（本地构建/测试命令）
  - **产物**：构建文件

- [ ] T012 [P] 配置代码检查与格式化工具（路径：`[真实配置文件]`）
  - **依赖**：T011
  - **步骤**：
    - 1) …
  - **验证**：
    - [ ] lint/format 命令可运行
  - **产物**：配置文件

---

## 阶段 2：核心基础（阻塞性前置条件，阻塞所有 Story）

**目标**：所有 Story 实现前必须完成的核心基础设施搭建

**⚠️ 关键**：此阶段完成前，任何 Story 相关工作均不可启动

- [ ] T020 在 `app/src/main/java/com/jacky/verity/library/domain/model/` 中创建核心数据模型（WordLibrary.kt、LibraryError.kt、LibraryFormat.kt）
  - **依赖**：T012
  - **步骤**：
    - 1) 创建 `WordLibrary` data class（包含 id、name、wordCount、createdAt、filePath、fileSize、format、isSelected）
    - 2) 创建 `LibraryFormat` enum（JSON、CSV、TXT）
    - 3) 创建 `LibraryError` sealed class（ImportError、ParseError、StorageError、NotFoundError）
    - 4) 添加数据校验方法（名称、单词数量、文件大小等）
  - **验证**：
    - [ ] 数据模型与 plan.md B3 一致
    - [ ] 所有字段类型正确
    - [ ] 校验规则已实现
  - **产物**：`WordLibrary.kt`、`LibraryError.kt`、`LibraryFormat.kt`

- [ ] T021 [P] 在 `app/src/main/java/com/jacky/verity/library/data/datasource/` 中创建 LibraryLocalDataSource 接口和实现
  - **依赖**：T020
  - **步骤**：
    - 1) 定义接口：保存/读取词库元数据（SharedPreferences）、保存/读取词库文件
    - 2) 实现 SharedPreferences 操作（保存/读取词库列表、当前选择词库 ID）
    - 3) 实现文件系统操作（保存词库文件到私有目录、读取词库文件）
    - 4) 实现文件指纹计算（路径+大小+修改时间）
  - **验证**：
    - [ ] 接口定义与 plan.md B4 一致
    - [ ] SharedPreferences 读写正常
    - [ ] 文件操作正常（私有目录）
  - **产物**：`LibraryLocalDataSource.kt`、`LibraryLocalDataSourceImpl.kt`

- [ ] T022 [P] 在 `app/src/main/java/com/jacky/verity/library/di/` 中创建依赖注入模块（LibraryModule.kt）
  - **依赖**：T020
  - **步骤**：
    - 1) 创建 LibraryModule（使用 Hilt/Dagger/Koin）
    - 2) 提供 SharedPreferences 实例（词库元数据存储）
    - 3) 提供文件系统访问实例
    - 4) 提供 DataSource 单例
  - **验证**：
    - [ ] 依赖注入配置正确
    - [ ] 所有依赖可正常注入
  - **产物**：`LibraryModule.kt`

**检查点**：基础层就绪——数据模型、数据源、依赖注入已就绪，Story 实现可启动

---

## 阶段 3：Story ST-001 - 词库文件导入功能（类型：Functional）

**目标**：用户能够成功导入词库文件，词库出现在列表中，导入耗时满足性能要求（10MB 文件 ≤ 5秒）

**验证方式（高层）**：
- 能够导入 JSON/CSV/TXT 格式文件
- 导入成功率达到 99%（排除格式不支持的情况）
- 导入耗时符合要求（10MB 文件 ≤ 5 秒，p95）
- 词库文件存储在应用私有目录（符合 NFR-SEC-001）
- 使用 Storage Access Framework，不申请全局权限（符合 NFR-SEC-002）
- 记录导入成功/失败事件（符合 NFR-OBS-001）

### ST-001 任务

- [ ] T100 [P] [ST-001] 在 `app/src/main/java/com/jacky/verity/library/data/parser/` 中创建文件解析器接口和实现（LibraryParser.kt、JsonLibraryParser.kt、CsvLibraryParser.kt、TxtLibraryParser.kt）
  - **依赖**：T020、T021
  - **步骤**：
    - 1) 创建 `LibraryParser` 接口（parseLibrary 方法，支持进度回调）
    - 2) 实现 `JsonLibraryParser`（使用 Gson/JsonReader 流式解析）
    - 3) 实现 `CsvLibraryParser`（逐行读取，分批处理）
    - 4) 实现 `TxtLibraryParser`（逐行读取，每行一个单词）
    - 5) 实现编码自动检测（UTF-8/GBK）
    - 6) 实现流式处理，避免大文件内存溢出
  - **验证**：
    - [ ] 能够解析 JSON/CSV/TXT 格式文件
    - [ ] 解析 10MB 文件耗时 ≤ 5 秒（p95）
    - [ ] 解析 50MB 文件不内存溢出（流式处理）
    - [ ] 编码检测正常（UTF-8/GBK）
  - **产物**：`LibraryParser.kt`、`JsonLibraryParser.kt`、`CsvLibraryParser.kt`、`TxtLibraryParser.kt`

- [ ] T101 [ST-001] 在 `app/src/main/java/com/jacky/verity/library/data/repository/` 中实现 LibraryRepository 接口和实现（LibraryRepository.kt、LibraryRepositoryImpl.kt）
  - **依赖**：T100、T021
  - **步骤**：
    - 1) 定义 `LibraryRepository` 接口（importLibrary、getLibraries、selectLibrary、searchLibraries）
    - 2) 实现 `importLibrary` 方法（调用 Parser 解析文件，保存到 DataSource）
    - 3) 实现文件指纹计算（路径+大小+修改时间），用于去重
    - 4) 实现导入队列化（一次只处理一个导入）
    - 5) 实现元数据保存（SharedPreferences）
  - **验证**：
    - [ ] 导入功能正常（JSON/CSV/TXT）
    - [ ] 重复导入检测正常（文件指纹）
    - [ ] 导入队列化正常（并发导入）
    - [ ] 元数据保存正常
  - **产物**：`LibraryRepository.kt`、`LibraryRepositoryImpl.kt`

- [ ] T102 [ST-001] 在 `app/src/main/java/com/jacky/verity/library/domain/usecase/` 中实现 ImportLibraryUseCase（ImportLibraryUseCase.kt）
  - **依赖**：T101
  - **步骤**：
    - 1) 创建 `ImportLibraryUseCase` 类
    - 2) 实现业务逻辑（调用 Repository，处理错误）
    - 3) 实现存储空间检查（≥50MB）
    - 4) 实现文件格式验证
  - **验证**：
    - [ ] UseCase 逻辑正确
    - [ ] 错误处理正确（Result<T>）
    - [ ] 存储空间检查正常
  - **产物**：`ImportLibraryUseCase.kt`

- [ ] T103 [ST-001] 在 `app/src/main/java/com/jacky/verity/library/viewmodel/` 中实现 LibraryViewModel 的导入功能部分（LibraryViewModel.kt）
  - **依赖**：T102
  - **步骤**：
    - 1) 创建 `LibraryViewModel` 类
    - 2) 实现导入状态管理（StateFlow：导入中、导入成功、导入失败）
    - 3) 实现导入进度管理（进度百分比）
    - 4) 实现导入方法（调用 UseCase，处理结果）
  - **验证**：
    - [ ] ViewModel 状态管理正常
    - [ ] 导入进度更新正常
    - [ ] 错误状态处理正常
  - **产物**：`LibraryViewModel.kt`（部分）

- [ ] T104 [ST-001] 在 `app/src/main/java/com/jacky/verity/library/ui/` 中实现导入界面（ImportLibraryScreen.kt）
  - **依赖**：T103
  - **步骤**：
    - 1) 创建 `ImportLibraryScreen` Compose 函数
    - 2) 实现文件选择器（Storage Access Framework Intent）
    - 3) 实现导入按钮和进度指示器
    - 4) 实现错误提示显示
    - 5) 实现导入结果反馈
  - **验证**：
    - [ ] 文件选择器正常打开
    - [ ] 导入进度显示正常
    - [ ] 错误提示清晰
    - [ ] UI 符合 Material Design 规范
  - **产物**：`ImportLibraryScreen.kt`

- [ ] T105 [ST-001] 在 `app/src/main/java/com/jacky/verity/library/` 中实现可观测性埋点（导入事件记录）
  - **依赖**：T101
  - **步骤**：
    - 1) 在 Repository 中记录导入成功事件（词库名称、文件大小、格式、耗时）
    - 2) 在 Repository 中记录导入失败事件（错误类型、文件路径）
    - 3) 使用结构化日志（如 Timber）
  - **验证**：
    - [ ] 导入成功事件正确记录（符合 NFR-OBS-001）
    - [ ] 导入失败事件正确记录（符合 NFR-OBS-002）
    - [ ] 敏感信息已脱敏（不记录文件完整路径）
  - **产物**：Repository 中的埋点代码

**检查点**：至此，ST-001 应具备完整功能且可独立测试——用户能够导入词库文件，导入成功率达到 99%，导入耗时符合要求

---

## 阶段 4：Story ST-002 - 词库列表展示功能（类型：Functional）

**目标**：词库列表能够正确显示词库信息，列表加载时间不超过 500ms（p95），空状态提示清晰

**验证方式（高层）**：
- 列表正确显示词库信息（名称、单词数量、创建时间）
- 列表加载时间 ≤ 500ms（p95）（符合 NFR-PERF-001）
- 列表内存占用 ≤ 20MB（符合 NFR-MEM-001）
- 空状态提示清晰（符合 FR-006）
- 记录加载事件（符合 NFR-OBS-001）

### ST-002 任务

- [ ] T200 [ST-002] 在 `app/src/main/java/com/jacky/verity/library/domain/usecase/` 中实现 GetLibrariesUseCase（GetLibrariesUseCase.kt）
  - **依赖**：T101（Repository 已实现 getLibraries）
  - **步骤**：
    - 1) 创建 `GetLibrariesUseCase` 类
    - 2) 实现获取词库列表逻辑（调用 Repository）
    - 3) 实现数据转换（LibraryMetadata → WordLibrary）
  - **验证**：
    - [ ] UseCase 逻辑正确
    - [ ] 返回 Flow<List<WordLibrary>>
  - **产物**：`GetLibrariesUseCase.kt`

- [ ] T201 [ST-002] 在 `app/src/main/java/com/jacky/verity/library/viewmodel/` 中扩展 LibraryViewModel 的列表功能（LibraryViewModel.kt）
  - **依赖**：T200
  - **步骤**：
    - 1) 实现词库列表状态（StateFlow<List<WordLibrary>>）
    - 2) 实现加载状态（StateFlow<Boolean>）
    - 3) 实现加载方法（调用 UseCase，观察 Flow）
    - 4) 实现内存缓存机制
  - **验证**：
    - [ ] 列表状态更新正常
    - [ ] 加载状态管理正常
    - [ ] 内存缓存正常
  - **产物**：`LibraryViewModel.kt`（扩展）

- [ ] T202 [ST-002] 在 `app/src/main/java/com/jacky/verity/library/ui/components/` 中创建词库列表项组件（LibraryItem.kt）
  - **依赖**：T201
  - **步骤**：
    - 1) 创建 `LibraryItem` Compose 函数
    - 2) 显示词库名称、单词数量、创建时间
    - 3) 显示当前使用标记（isSelected）
    - 4) 实现点击交互
  - **验证**：
    - [ ] 列表项显示正确
    - [ ] 当前使用标记正确
    - [ ] UI 符合 Material Design
  - **产物**：`LibraryItem.kt`

- [ ] T203 [ST-002] 在 `app/src/main/java/com/jacky/verity/library/ui/components/` 中创建空状态组件（EmptyState.kt）
  - **依赖**：T201
  - **步骤**：
    - 1) 创建 `EmptyState` Compose 函数
    - 2) 显示空状态图标和提示文字
    - 3) 显示"导入词库"引导按钮
  - **验证**：
    - [ ] 空状态显示清晰（符合 FR-006）
    - [ ] 引导按钮可点击
  - **产物**：`EmptyState.kt`

- [ ] T204 [ST-002] 在 `app/src/main/java/com/jacky/verity/library/ui/` 中实现词库列表界面（LibraryListScreen.kt）
  - **依赖**：T202、T203
  - **步骤**：
    - 1) 创建 `LibraryListScreen` Compose 函数
    - 2) 实现列表展示（LazyColumn）
    - 3) 实现空状态展示（列表为空时显示 EmptyState）
    - 4) 实现加载状态展示
    - 5) 实现列表刷新（下拉刷新）
  - **验证**：
    - [ ] 列表正确显示词库信息（符合 FR-002）
    - [ ] 列表加载时间 ≤ 500ms（p95）（符合 NFR-PERF-001）
    - [ ] 空状态提示清晰（符合 FR-006）
    - [ ] 内存占用 ≤ 20MB（符合 NFR-MEM-001）
  - **产物**：`LibraryListScreen.kt`

- [ ] T205 [ST-002] 在 `app/src/main/java/com/jacky/verity/library/` 中实现可观测性埋点（列表加载事件记录）
  - **依赖**：T101
  - **步骤**：
    - 1) 在 Repository 中记录列表加载成功事件
    - 2) 记录加载耗时
  - **验证**：
    - [ ] 加载事件正确记录（符合 NFR-OBS-001）
  - **产物**：Repository 中的埋点代码

**检查点**：至此，ST-002 应具备完整功能且可独立测试——词库列表能够正确显示，加载时间符合要求，空状态提示清晰

---

## 阶段 5：Story ST-003 - 词库选择功能（类型：Functional）

**目标**：用户能够选择词库，当前词库被正确标记，选择状态持久化保存

**验证方式（高层）**：
- 能够选择词库作为当前学习词库（符合 FR-003）
- 当前词库被正确标记
- 选择状态持久化保存（符合 NFR-REL-002）
- 记录选择事件（符合 NFR-OBS-001）

### ST-003 任务

- [ ] T300 [ST-003] 在 `app/src/main/java/com/jacky/verity/library/domain/usecase/` 中实现 SelectLibraryUseCase（SelectLibraryUseCase.kt）
  - **依赖**：T101（Repository 已实现 selectLibrary）
  - **步骤**：
    - 1) 创建 `SelectLibraryUseCase` 类
    - 2) 实现选择词库逻辑（调用 Repository）
    - 3) 实现状态更新（更新 isSelected 标记）
  - **验证**：
    - [ ] UseCase 逻辑正确
    - [ ] 选择操作成功
  - **产物**：`SelectLibraryUseCase.kt`

- [ ] T301 [ST-003] 在 `app/src/main/java/com/jacky/verity/library/viewmodel/` 中扩展 LibraryViewModel 的选择功能（LibraryViewModel.kt）
  - **依赖**：T300
  - **步骤**：
    - 1) 实现选择词库方法（调用 UseCase）
    - 2) 更新当前选择词库状态
    - 3) 更新词库列表状态（isSelected 标记）
  - **验证**：
    - [ ] 选择操作正常
    - [ ] 状态更新正常
  - **产物**：`LibraryViewModel.kt`（扩展）

- [ ] T302 [ST-003] 在 `app/src/main/java/com/jacky/verity/library/ui/` 中扩展 LibraryListScreen 的选择交互（LibraryListScreen.kt）
  - **依赖**：T301
  - **步骤**：
    - 1) 在 LibraryItem 中添加点击事件
    - 2) 调用 ViewModel 的选择方法
    - 3) 更新 UI 显示（当前选择标记）
  - **验证**：
    - [ ] 点击选择正常（符合 FR-003）
    - [ ] 当前选择标记正确显示
    - [ ] UI 反馈及时
  - **产物**：`LibraryListScreen.kt`（扩展）

- [ ] T303 [ST-003] 在 `app/src/main/java/com/jacky/verity/library/` 中实现可观测性埋点（选择事件记录）
  - **依赖**：T101
  - **步骤**：
    - 1) 在 Repository 中记录选择事件（词库 ID、切换前后状态）
  - **验证**：
    - [ ] 选择事件正确记录（符合 NFR-OBS-001）
  - **产物**：Repository 中的埋点代码

**检查点**：至此，ST-003 应具备完整功能且可独立测试——用户能够选择词库，当前词库被标记，选择状态持久化

## 阶段 6：Story ST-004 - 词库搜索功能（类型：Functional）

**目标**：搜索功能正常工作，搜索响应时间不超过 200ms（p95），搜索结果实时更新

**验证方式（高层）**：
- 搜索功能正常（符合 FR-004）
- 搜索响应时间 ≤ 200ms（p95）（符合 NFR-PERF-001）
- 搜索结果实时更新
- 支持模糊匹配

### ST-004 任务

- [ ] T400 [ST-004] 在 `app/src/main/java/com/jacky/verity/library/domain/usecase/` 中实现 SearchLibrariesUseCase（SearchLibrariesUseCase.kt）
  - **依赖**：T101（Repository 已实现 searchLibraries）
  - **步骤**：
    - 1) 创建 `SearchLibrariesUseCase` 类
    - 2) 实现搜索逻辑（调用 Repository，模糊匹配词库名称）
    - 3) 实现搜索优化（防抖 debounce，300ms）
  - **验证**：
    - [ ] 搜索逻辑正确
    - [ ] 模糊匹配正常
    - [ ] 防抖正常
  - **产物**：`SearchLibrariesUseCase.kt`

- [ ] T401 [ST-004] 在 `app/src/main/java/com/jacky/verity/library/viewmodel/` 中扩展 LibraryViewModel 的搜索功能（LibraryViewModel.kt）
  - **依赖**：T400
  - **步骤**：
    - 1) 实现搜索关键词状态（StateFlow<String>）
    - 2) 实现搜索结果状态（StateFlow<List<WordLibrary>>）
    - 3) 实现搜索方法（调用 UseCase，使用防抖）
    - 4) 实现实时搜索（观察搜索关键词变化）
  - **验证**：
    - [ ] 搜索状态更新正常
    - [ ] 防抖延迟正常（300ms）
    - [ ] 搜索结果正确
  - **产物**：`LibraryViewModel.kt`（扩展）

- [ ] T402 [ST-004] 在 `app/src/main/java/com/jacky/verity/library/ui/` 中扩展 LibraryListScreen 的搜索功能（LibraryListScreen.kt）
  - **依赖**：T401
  - **步骤**：
    - 1) 添加搜索框（TextField）
    - 2) 实现搜索输入监听
    - 3) 实现搜索结果过滤显示
    - 4) 实现无结果提示
  - **验证**：
    - [ ] 搜索框正常输入（符合 FR-004）
    - [ ] 搜索响应时间 ≤ 200ms（p95）（符合 NFR-PERF-001）
    - [ ] 搜索结果实时更新
    - [ ] 无结果提示清晰
  - **产物**：`LibraryListScreen.kt`（扩展）

**检查点**：至此，ST-004 应具备完整功能且可独立测试——搜索功能正常，响应时间符合要求，搜索结果正确

---

## 阶段 7：Story ST-005 - 错误处理和异常场景（类型：Infrastructure）

**目标**：所有异常场景都有明确的错误提示和引导，用户能够理解错误原因并采取行动

**验证方式（高层）**：
- 所有异常场景都有明确的错误提示（符合 FR-005）
- 错误日志正确记录（符合 NFR-OBS-002）
- 错误处理机制完善（符合 NFR-REL-001）

### ST-005 任务

- [ ] T500 [ST-005] 在 `app/src/main/java/com/jacky/verity/library/domain/model/` 中扩展 LibraryError 错误类型（LibraryError.kt）
  - **依赖**：T020
  - **步骤**：
    - 1) 扩展错误类型：FormatError（格式不支持）、EncodingError（编码错误）、SizeError（文件过大）、IOError（文件读取失败）、StorageError（存储空间不足）、PermissionError（权限被拒绝）
    - 2) 为每个错误类型添加用户友好的错误消息
    - 3) 实现错误消息资源化（strings.xml）
  - **验证**：
    - [ ] 所有错误类型已定义
    - [ ] 错误消息用户友好
  - **产物**：`LibraryError.kt`（扩展）、`strings.xml`（错误消息）

- [ ] T501 [ST-005] 在 `app/src/main/java/com/jacky/verity/library/data/parser/` 中扩展解析器的错误处理（LibraryParser.kt 实现类）
  - **依赖**：T100、T500
  - **步骤**：
    - 1) 实现格式验证（JSON/CSV/TXT 格式检查）
    - 2) 实现编码错误处理（自动检测失败时返回 EncodingError）
    - 3) 实现文件大小检查（>50MB 返回 SizeError）
    - 4) 实现文件读取错误处理（IOError）
  - **验证**：
    - [ ] 格式验证正常
    - [ ] 编码错误处理正常
    - [ ] 文件大小检查正常
    - [ ] 文件读取错误处理正常
  - **产物**：Parser 实现类（扩展）

- [ ] T502 [ST-005] 在 `app/src/main/java/com/jacky/verity/library/data/repository/` 中扩展 Repository 的错误处理（LibraryRepositoryImpl.kt）
  - **依赖**：T101、T500
  - **步骤**：
    - 1) 实现存储空间检查（<50MB 返回 StorageError）
    - 2) 实现文件权限检查（权限被拒绝返回 PermissionError）
    - 3) 实现错误转换（底层异常转换为领域错误）
    - 4) 实现错误日志记录（记录错误类型、文件路径、错误详情）
  - **验证**：
    - [ ] 存储空间检查正常
    - [ ] 权限检查正常
    - [ ] 错误转换正确
    - [ ] 错误日志正确记录（符合 NFR-OBS-002）
  - **产物**：`LibraryRepositoryImpl.kt`（扩展）

- [ ] T503 [ST-005] 在 `app/src/main/java/com/jacky/verity/library/ui/` 中实现错误提示 UI（ImportLibraryScreen.kt、LibraryListScreen.kt）
  - **依赖**：T502
  - **步骤**：
    - 1) 在导入界面显示错误提示（Snackbar/Dialog）
    - 2) 实现错误消息显示（使用错误类型对应的用户友好消息）
    - 3) 实现错误引导（如权限被拒绝时引导到设置）
    - 4) 实现重试机制（允许用户重新选择文件）
  - **验证**：
    - [ ] 错误提示清晰（符合 FR-005）
    - [ ] 错误引导有效
    - [ ] 重试机制正常
  - **产物**：`ImportLibraryScreen.kt`（扩展）、错误提示组件

**检查点**：至此，ST-005 应具备完整功能且可独立测试——所有异常场景都有明确的错误提示，错误日志正确记录

---

## 阶段 8：Story ST-006 - 数据持久化和生命周期管理（类型：Infrastructure）

**目标**：数据能够可靠持久化，应用重启后恢复，内存占用符合要求

**验证方式（高层）**：
- 数据持久化正常（符合 NFR-REL-002）
- 应用重启后恢复（词库列表和当前选择状态）
- 内存占用符合要求（符合 NFR-MEM-001/002）

### ST-006 任务

- [ ] T600 [ST-006] 在 `app/src/main/java/com/jacky/verity/library/data/datasource/` 中扩展 DataSource 的持久化机制（LibraryLocalDataSourceImpl.kt）
  - **依赖**：T021
  - **步骤**：
    - 1) 实现同步写入 SharedPreferences（apply + commit 组合，确保数据保存）
    - 2) 实现数据校验（读取时验证数据完整性）
    - 3) 实现数据迁移（数据结构变更时自动迁移）
    - 4) 实现应用生命周期监听（退出前保存数据）
  - **验证**：
    - [ ] 数据持久化正常（符合 NFR-REL-002）
    - [ ] 数据校验正常
    - [ ] 数据迁移正常
    - [ ] 生命周期监听正常
  - **产物**：`LibraryLocalDataSourceImpl.kt`（扩展）

- [ ] T601 [ST-006] 在 `app/src/main/java/com/jacky/verity/library/viewmodel/` 中扩展 LibraryViewModel 的生命周期管理（LibraryViewModel.kt）
  - **依赖**：T201、T301
  - **步骤**：
    - 1) 实现应用退出时保存数据（onCleared 方法）
    - 2) 实现应用启动时恢复数据（init 方法）
    - 3) 实现内存清理（应用退出时清理列表数据）
    - 4) 实现状态恢复（应用重启后恢复当前选择状态）
  - **验证**：
    - [ ] 应用退出时数据保存正常
    - [ ] 应用启动时数据恢复正常（符合 NFR-REL-002）
    - [ ] 内存清理正常（符合 NFR-MEM-002）
    - [ ] 状态恢复正常
  - **产物**：`LibraryViewModel.kt`（扩展）

- [ ] T602 [ST-006] 在 `app/src/main/java/com/jacky/verity/library/` 中实现内存监控和优化
  - **依赖**：T201
  - **步骤**：
    - 1) 实现内存占用监控（使用 Android Profiler 或 Memory Profiler）
    - 2) 优化词库列表缓存（只缓存元数据，不缓存文件内容）
    - 3) 实现大文件解析内存优化（流式处理，立即释放临时内存）
    - 4) 验证内存占用 ≤ 20MB（符合 NFR-MEM-001）
  - **验证**：
    - [ ] 内存占用 ≤ 20MB（符合 NFR-MEM-001）
    - [ ] 文件解析临时内存立即释放
    - [ ] 列表缓存策略正确
  - **产物**：内存优化代码、内存监控报告

**检查点**：至此，ST-006 应具备完整功能且可独立测试——数据持久化正常，应用重启后恢复，内存占用符合要求

---

## 依赖关系与执行顺序

### 阶段依赖

- **环境搭建（阶段 1）**：无依赖——可立即启动
- **核心基础（阶段 2）**：依赖环境搭建完成——阻塞所有用户故事
- **用户故事（阶段 3+）**：均依赖核心基础阶段完成
    - 完成后，用户故事可并行推进（如有资源）
    - 或按优先级顺序串行推进（P1 → P2 → P3）
- **优化完善（最终阶段）**：依赖所有目标用户故事完成

### Story 依赖

- **ST-001**：依赖阶段 2 完成（无其他 Story 依赖）
- **ST-002**：依赖 ST-001 完成（需要词库元数据）
- **ST-003**：依赖 ST-002 完成（需要词库列表）
- **ST-004**：依赖 ST-002 完成（需要词库列表）
- **ST-005**：依赖 ST-001 完成（需要导入功能）
- **ST-006**：依赖 ST-001、ST-002、ST-003 完成（需要导入、列表、选择功能）

### 单 Story 内部顺序

- **数据层 → 领域层 → ViewModel 层 → UI 层**：按架构分层顺序开发
- **核心功能 → 集成 → 优化**：先实现核心功能，再集成，最后优化
- **错误处理**：在核心功能实现后添加错误处理
- **可观测性**：在功能实现后添加埋点
- **NFR 验证**：在功能实现后验证性能/内存/功耗指标

### 并行执行场景

- **阶段 1**：T012 [P] 可与其他任务并行（代码检查配置）
- **阶段 2**：T021 [P] 和 T022 [P] 可并行（DataSource 和 DI 模块）
- **阶段 3（ST-001）**：
  - T100 [P] 和 T105 [P] 可并行（Parser 实现和埋点）
  - T101 和 T102 需串行（Repository → UseCase）
  - T103 和 T104 需串行（ViewModel → UI）
- **阶段 4（ST-002）**：
  - T200 和 T205 [P] 可并行（UseCase 和埋点）
  - T202 [P] 和 T203 [P] 可并行（UI 组件）
- **阶段 5（ST-003）**：T300 和 T303 [P] 可并行（UseCase 和埋点）
- **阶段 6（ST-004）**：所有任务需串行（搜索功能依赖关系）
- **阶段 7（ST-005）**：T500 [P] 和 T501 [P] 可并行（错误类型扩展和解析器错误处理）
- **阶段 8（ST-006）**：T600 和 T602 [P] 可并行（持久化机制和内存监控）
- **跨 Story 并行**：ST-001 完成后，ST-002 和 ST-005 可并行启动（依赖 ST-001）

---

## 并行执行示例

### Story ST-001 可并行任务

```bash
# 可并行执行的任务：
- T100 [P] [ST-001] 创建文件解析器接口和实现（Parser 实现）
- T105 [P] [ST-001] 实现可观测性埋点（埋点代码，不依赖 Parser 实现）
```

### Story ST-002 可并行任务

```bash
# 可并行执行的任务：
- T202 [P] [ST-002] 创建词库列表项组件（LibraryItem.kt）
- T203 [P] [ST-002] 创建空状态组件（EmptyState.kt）
- T205 [P] [ST-002] 实现可观测性埋点（埋点代码）
```

### Story ST-005 可并行任务

```bash
# 可并行执行的任务：
- T500 [P] [ST-005] 扩展 LibraryError 错误类型（错误类型定义）
- T501 [P] [ST-005] 扩展解析器的错误处理（Parser 错误处理）
```

---

## 落地策略

### MVP 范围（最小可行产品）

**MVP Story 集合**：ST-001（词库文件导入功能）

**MVP 目标**：用户能够导入词库文件，词库出现在列表中

**MVP 任务**：
1. 完成阶段 0：准备
2. 完成阶段 1：环境搭建
3. 完成阶段 2：核心基础（关键——阻塞所有 Story）
4. 完成阶段 3：Story ST-001
5. **暂停并验证**：独立验证 ST-001（导入功能、性能指标、NFR 验收）
6. 如就绪，进行部署/演示

### 增量交付策略

**增量 1（MVP）**：
- 完成环境搭建 + 核心基础 → 基础层就绪
- 新增 ST-001 → 独立验证 → 部署/演示（MVP！）
- **验证指标**：导入成功率 ≥ 99%，导入耗时 ≤ 5 秒（10MB 文件）

**增量 2**：
- 新增 ST-002 → 独立验证 → 部署/演示
- **验证指标**：列表加载时间 ≤ 500ms（p95），内存占用 ≤ 20MB

**增量 3**：
- 新增 ST-003 → 独立验证 → 部署/演示
- **验证指标**：选择功能正常，状态持久化正常

**增量 4**：
- 新增 ST-004 → 独立验证 → 部署/演示
- **验证指标**：搜索响应时间 ≤ 200ms（p95）

**增量 5**：
- 新增 ST-005 → 独立验证 → 部署/演示
- **验证指标**：所有异常场景都有明确的错误提示

**增量 6**：
- 新增 ST-006 → 独立验证 → 部署/演示
- **验证指标**：数据持久化正常，应用重启后恢复，内存占用符合要求

### 团队并行策略

**多开发者协作场景**：

1. **阶段 0-2**：团队共同完成（准备、环境搭建、核心基础）

2. **阶段 3+（Story 阶段）**：
   - **开发者 A**：负责 ST-001（词库文件导入功能）
   - **开发者 B**：等待 ST-001 完成后，负责 ST-002（词库列表展示功能）
   - **开发者 C**：等待 ST-001 完成后，负责 ST-005（错误处理和异常场景）
   - **开发者 D**：等待 ST-002 完成后，负责 ST-003（词库选择功能）和 ST-004（词库搜索功能）
   - **开发者 E**：等待 ST-001、ST-002、ST-003 完成后，负责 ST-006（数据持久化和生命周期管理）

3. **并行机会**：
   - ST-001 完成后，ST-002 和 ST-005 可并行启动
   - ST-002 完成后，ST-003 和 ST-004 可并行启动
   - 各 Story 内部标记 [P] 的任务可并行执行

4. **集成策略**：每个 Story 完成后独立验证，确保不破坏已有功能

---

## 备注

- [P] 标记的任务 = 涉及不同文件，无依赖关系
- [ST-xxx] 标签将任务关联至 Plan 的 Story，便于追溯
- 每个 Story 需可独立完成、独立验证
- 实现前验证测试用例执行失败
- 完成单个任务或逻辑分组后提交代码
- 可在任意检查点暂停，独立验证对应故事
- 避免：模糊的任务描述、同一文件冲突、破坏独立性的跨故事依赖