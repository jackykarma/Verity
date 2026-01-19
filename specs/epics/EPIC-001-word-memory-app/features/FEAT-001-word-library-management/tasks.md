---
description: "Story → Task 落地任务清单模板"
---

# Tasks：单词库管理

**Epic**：EPIC-001 - 无痛记忆单词神器APP
**Feature ID**：FEAT-001
**Feature Version**：v0.1.0（来自 `spec.md`）
**Plan Version**：v0.2.0（来自 `plan.md`）
**Tasks Version**：v0.1.0
**输入**：来自 `Feature 目录/` 的设计文档（`spec.md`、`plan.md`）

> 规则：
> - Task 只能拆解与执行 Plan 的既定 Story；**禁止**在 tasks.md 里改写 Plan 的技术决策或新增未决策的方案。
> - 每个 Task 必须包含：执行步骤、依赖关系（顺序/并行）、验证方式（可执行/可量化）。
> - 若 plan.md 已包含 Story 二层详细设计（Story Detailed Design / L2）：每个 Task 必须提供**设计引用**（指向 plan.md 对应 ST-xxx 的小节/图表/异常矩阵）。
> - 若 plan.md 包含模块级详细设计（A3.4）：每个 Task 必须提供**设计引用**（指向 plan.md 对应模块的 UML 图）。

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

- **依赖**：T???（无则写"无"）
- **设计引用**：
  - 模块级：`plan.md:A3.4:<模块名>:UML类图/时序-成功/时序-异常`
  - 或 Story 级：`plan.md:Story Detailed Design:ST-xxx:...`
  - （若该 Story/模块设计尚未补齐，则写 `N/A` 并在 Plan 中补齐）
- **步骤**：
  - 1) …
  - 2) …
- **验证**：
  - [ ] 单元/集成/手动验证步骤（可执行）
  - [ ] 指标（如 p95、mAh、内存 MB）与阈值（如适用）
- **产物**：涉及的文件/文档/脚本

## 路径约定（按 plan.md 的结构决策为准）

- **移动端（Android）**：`app/src/main/java/com/jacky/verity/library/`

## 阶段 0：准备（可选但建议）

**目标**：对齐版本、冻结设计输入，避免 Implement 期返工

- [ ] T001 在 `specs/epics/EPIC-001-word-memory-app/features/FEAT-001-word-library-management/` 中核对 `spec.md`、`plan.md` 的 Version 字段一致性并补齐变更记录
  - **依赖**：无
  - **设计引用**：N/A
  - **步骤**：
    - 1) 确认 `Feature Version`（v0.1.0）、`Plan Version`（v0.2.0）已填写
    - 2) 确认 Plan 的 Story Breakdown 已完成（ST-001 至 ST-006）
    - 3) 确认 Plan 的模块级 UML 设计已完成（A3.4：6 个模块）
  - **验证**：
    - [ ] tasks.md 中 `Plan Version` 与 plan.md 一致（v0.2.0）
  - **产物**：`spec.md`、`plan.md`、`tasks.md`

---

## 阶段 1：环境搭建（共享基础设施）

**目标**：项目初始化与基础结构搭建

- [ ] T010 按照 plan.md 的"结构决策"创建项目目录结构（路径：`app/src/main/java/com/jacky/verity/library/`）
  - **依赖**：T001
  - **设计引用**：plan.md:B7 源代码结构
  - **步骤**：
    - 1) 创建目录：`ui/`、`viewmodel/`、`domain/usecase/`、`domain/model/`、`data/repository/`、`data/datasource/`、`data/parser/`、`di/`
    - 2) 确保与 plan.md:B7 的目录结构一致
  - **验证**：
    - [ ] 目录结构与 plan.md:B7 一致
  - **产物**：相关目录结构

- [ ] T011 初始化构建与依赖（路径：`app/build.gradle.kts`）
  - **依赖**：T010
  - **设计引用**：plan.md:B1 技术背景
  - **步骤**：
    - 1) 添加依赖：Jetpack Compose、Kotlin Coroutines、AndroidX Lifecycle、SharedPreferences
    - 2) 配置 Kotlin 1.9+、Java 17、Android 8.0+（API Level 26+）
    - 3) 配置测试框架：JUnit 5、Kotlin Coroutines Test、MockK、Robolectric
  - **验证**：
    - [ ] 基础构建可通过（`./gradlew build`）
  - **产物**：`app/build.gradle.kts`

- [ ] T012 [P] 配置代码检查与格式化工具（路径：`.editorconfig`、`ktlint.yml` 等）
  - **依赖**：T011
  - **设计引用**：N/A
  - **步骤**：
    - 1) 配置 Kotlin 代码格式化规则
    - 2) 配置 lint 规则（如适用）
  - **验证**：
    - [ ] lint/format 命令可运行
  - **产物**：配置文件

---

## 阶段 2：核心基础（阻塞性前置条件，阻塞所有 Story）

**目标**：所有用户故事实现前必须完成的核心基础设施搭建

**⚠️ 关键**：此阶段完成前，任何用户故事相关工作均不可启动

- [ ] T020 搭建公共基础设施（按 Plan-B:B2 的架构约束）
  - **依赖**：T012
  - **设计引用**：plan.md:B2 架构细化
  - **步骤**：
    - 1) 创建 Result<T> Sealed Class（路径：`app/src/main/java/com/jacky/verity/library/domain/model/Result.kt`）
    - 2) 创建错误类型基类（路径：`app/src/main/java/com/jacky/verity/library/domain/model/LibraryError.kt`）
    - 3) 配置结构化日志（如 Timber，路径：`app/src/main/java/com/jacky/verity/library/di/LoggingModule.kt`）
    - 4) 确保分层约束：UI → ViewModel → UseCase → Repository → DataSource
  - **验证**：
    - [ ] 与 Plan-B:B2 约束一致（分层/错误处理/日志规范）
    - [ ] Result<T> 和错误类型可正常使用
  - **产物**：基础设施代码

**检查点**：基础层就绪——用户故事实现可并行启动

---

## 阶段 3：Story ST-001 - 词库文件导入功能（类型：Functional）

**目标**：用户能够成功导入词库文件，词库出现在列表中，导入耗时满足性能要求（10MB 文件 ≤ 5秒）

**验证方式（高层）**：能够导入 JSON/CSV/TXT 格式文件，导入成功率达到 99%，导入耗时符合要求（10MB 文件 ≤ 5秒）

**覆盖 FR/NFR**：FR-001；NFR-PERF-001（导入耗时）；NFR-SEC-001/002（存储和权限）；NFR-OBS-001（导入事件记录）；NFR-REL-001（导入成功率）

### ST-001 任务

- [ ] T100 [ST-001] 创建领域模型（路径：`app/src/main/java/com/jacky/verity/library/domain/model/WordLibrary.kt`、`LibraryFormat.kt`）
  - **依赖**：T020
  - **设计引用**：plan.md:B3 数据模型
  - **步骤**：
    - 1) 创建 `WordLibrary` data class（id, name, wordCount, createdAt, filePath, fileSize, format, isSelected）
    - 2) 创建 `LibraryFormat` 枚举（JSON, CSV, TXT）
    - 3) 创建 `LibraryMetadata` data class（用于 SharedPreferences 序列化）
  - **验证**：
    - [ ] 数据类符合 plan.md:B3 定义
  - **产物**：`WordLibrary.kt`、`LibraryFormat.kt`、`LibraryMetadata.kt`

- [ ] T101 [ST-001] 实现错误类型（路径：`app/src/main/java/com/jacky/verity/library/domain/model/LibraryError.kt`）
  - **依赖**：T020
  - **设计引用**：plan.md:A3.4:Repository层:异常清单表
  - **步骤**：
    - 1) 创建 `LibraryError` Sealed Class（ImportError, NotFoundError, StorageError）
    - 2) 创建 `ParseError` Sealed Class（FormatError, EncodingError, SizeError, IOError）
    - 3) 创建 `StorageError` Sealed Class（WriteFailed, ReadFailed, InsufficientSpace, DataCorrupted）
  - **验证**：
    - [ ] 错误类型与 plan.md 定义一致
  - **产物**：`LibraryError.kt`、`ParseError.kt`、`StorageError.kt`

- [ ] T102 [ST-001] 实现 DataSource 层接口和实现（路径：`app/src/main/java/com/jacky/verity/library/data/datasource/LibraryLocalDataSource.kt`、`LibraryLocalDataSourceImpl.kt`）
  - **依赖**：T100
  - **设计引用**：plan.md:A3.4:DataSource层:UML类图、plan.md:A3.4:DataSource层:时序-成功、plan.md:A3.4:DataSource层:时序-异常
  - **步骤**：
    - 1) 创建 `LibraryLocalDataSource` 接口（saveLibraryMetadata, getLibraryMetadataList, updateSelectedLibraryId, getSelectedLibraryId, saveLibraryFile）
    - 2) 实现 `LibraryLocalDataSourceImpl`（使用 SharedPreferences 和文件系统）
    - 3) 实现文件保存策略：临时文件 → 校验 → 原子替换
    - 4) 实现存储空间检查
  - **验证**：
    - [ ] 接口符合 plan.md:B4.1 定义
    - [ ] 文件保存使用原子替换策略
    - [ ] 存储空间检查正常工作
  - **产物**：`LibraryLocalDataSource.kt`、`LibraryLocalDataSourceImpl.kt`

- [ ] T103 [ST-001] 实现 Parser 层接口和实现（路径：`app/src/main/java/com/jacky/verity/library/data/parser/LibraryParser.kt`、`JsonLibraryParser.kt`、`CsvLibraryParser.kt`、`TxtLibraryParser.kt`）
  - **依赖**：T100
  - **设计引用**：plan.md:A3.4:Parser层:UML类图、plan.md:A3.4:Parser层:时序-成功、plan.md:A3.4:Parser层:时序-异常
  - **步骤**：
    - 1) 创建 `LibraryParser` 接口（parseLibrary 支持进度回调）
    - 2) 实现 `JsonLibraryParser`（使用 Gson/JsonReader 流式解析）
    - 3) 实现 `CsvLibraryParser`（逐行读取，分批处理每批 1000 行）
    - 4) 实现 `TxtLibraryParser`（逐行读取，每行一个单词）
    - 5) 实现格式检测和编码自动检测（UTF-8/GBK）
    - 6) 实现进度计算（基于已读取字节数 / 文件总大小）
  - **验证**：
    - [ ] 支持 JSON/CSV/TXT 格式解析
    - [ ] 流式处理，不一次性加载整个文件
    - [ ] 进度回调正常工作
    - [ ] 解析 10MB 文件耗时 ≤ 5 秒
  - **产物**：`LibraryParser.kt`、`JsonLibraryParser.kt`、`CsvLibraryParser.kt`、`TxtLibraryParser.kt`

- [ ] T104 [ST-001] 实现 Repository 层接口和实现（路径：`app/src/main/java/com/jacky/verity/library/data/repository/LibraryRepository.kt`、`LibraryRepositoryImpl.kt`）
  - **依赖**：T102、T103
  - **设计引用**：plan.md:A3.4:Repository层:UML类图、plan.md:A3.4:Repository层:时序-成功、plan.md:A3.4:Repository层:时序-异常
  - **步骤**：
    - 1) 创建 `LibraryRepository` 接口（importLibrary, getLibraries, selectLibrary, searchLibraries）
    - 2) 实现 `LibraryRepositoryImpl`（依赖 LibraryLocalDataSource 和 LibraryParser）
    - 3) 实现文件指纹生成（路径+大小+修改时间）
    - 4) 实现去重检查（基于文件指纹）
    - 5) 实现内存缓存（MutableStateFlow<List<WordLibrary>>）
    - 6) 实现批量操作（列表更新批量写入 SharedPreferences）
  - **验证**：
    - [ ] 接口符合 plan.md:B4.1 定义
    - [ ] 去重检查正常工作
    - [ ] 内存缓存正常工作
    - [ ] 导入操作串行化（避免并发冲突）
  - **产物**：`LibraryRepository.kt`、`LibraryRepositoryImpl.kt`

- [ ] T105 [ST-001] 实现 UseCase 层（路径：`app/src/main/java/com/jacky/verity/library/domain/usecase/ImportLibraryUseCase.kt`）
  - **依赖**：T104
  - **设计引用**：plan.md:A3.4:Domain层:UML类图、plan.md:A3.4:Domain层:时序-成功、plan.md:A3.4:Domain层:时序-异常
  - **步骤**：
    - 1) 创建 `ImportLibraryUseCase`（依赖 LibraryRepository 和 LibraryParser）
    - 2) 实现业务规则校验（格式、大小、重复）
    - 3) 实现错误转换（Repository 错误 → 领域错误）
  - **验证**：
    - [ ] 业务规则校验正常工作
    - [ ] 错误转换正确
  - **产物**：`ImportLibraryUseCase.kt`

- [ ] T106 [ST-001] 实现 ViewModel 层（路径：`app/src/main/java/com/jacky/verity/library/viewmodel/LibraryViewModel.kt`）
  - **依赖**：T105
  - **设计引用**：plan.md:A3.4:ViewModel层:UML类图、plan.md:A3.4:ViewModel层:时序-成功、plan.md:A3.4:ViewModel层:时序-异常
  - **步骤**：
    - 1) 创建 `LibraryViewModel`（依赖 ImportLibraryUseCase）
    - 2) 创建 `LibraryUiState` 和 `ImportUiState` data class
    - 3) 实现 `StateFlow<LibraryUiState>` 状态管理
    - 4) 实现 `onImportClick()`、`onFileSelected(uri: Uri)` 方法
    - 5) 实现错误处理（UseCase Result → UI 状态 error 字段）
  - **验证**：
    - [ ] 状态管理正常工作
    - [ ] 错误处理正确
    - [ ] 协程取消时资源正确清理
  - **产物**：`LibraryViewModel.kt`

- [ ] T107 [ST-001] 实现 UI 层 - 导入界面（路径：`app/src/main/java/com/jacky/verity/library/ui/ImportLibraryScreen.kt`）
  - **依赖**：T106
  - **设计引用**：plan.md:A3.4:UI层:UML类图、plan.md:A3.4:UI层:时序-成功、plan.md:A3.4:UI层:时序-异常
  - **步骤**：
    - 1) 创建 `ImportLibraryScreen` Compose 函数
    - 2) 集成 Storage Access Framework（SAF）文件选择器
    - 3) 实现导入进度显示
    - 4) 实现错误提示（权限错误、格式错误、存储空间不足、保存失败）
    - 5) 实现导入状态管理（isImporting, importProgress, error）
  - **验证**：
    - [ ] 文件选择器正常工作
    - [ ] 导入进度正确显示
    - [ ] 错误提示清晰明确
  - **产物**：`ImportLibraryScreen.kt`

- [ ] T108 [ST-001] 实现依赖注入模块（路径：`app/src/main/java/com/jacky/verity/library/di/LibraryModule.kt`）
  - **依赖**：T104、T105、T106
  - **设计引用**：plan.md:B7 源代码结构
  - **步骤**：
    - 1) 创建 Hilt/Koin 依赖注入模块
    - 2) 提供 DataSource、Parser、Repository、UseCase、ViewModel 的依赖注入
  - **验证**：
    - [ ] 依赖注入正常工作
  - **产物**：`LibraryModule.kt`

- [ ] T109 [ST-001] 实现可观测性（埋点/日志）（路径：相关文件）
  - **依赖**：T104、T105
  - **设计引用**：plan.md:A3.4:Repository层:可观测性、plan.md:A3.4:Parser层:可观测性
  - **步骤**：
    - 1) 记录导入成功事件（词库名称、文件大小、格式、耗时）
    - 2) 记录导入失败事件（错误类型、文件路径脱敏、错误详情）
    - 3) 使用结构化日志（操作类型、结果、耗时）
  - **验证**：
    - [ ] 导入事件正确记录（符合 NFR-OBS-001）
    - [ ] 错误日志正确记录（符合 NFR-OBS-002）
  - **产物**：日志/埋点代码

- [ ] T110 [ST-001] 性能验证（路径：测试文件）
  - **依赖**：T107
  - **设计引用**：plan.md:A9 性能评估
  - **步骤**：
    - 1) 创建性能测试：导入 10MB 文件，测量耗时
    - 2) 验证导入耗时 ≤ 5 秒（p95）
  - **验证**：
    - [ ] 导入 10MB 文件耗时 ≤ 5 秒（p95）（符合 NFR-PERF-001）
  - **产物**：性能测试报告

**检查点**：至此，Story ST-001 应具备完整功能且可独立测试（能够导入 JSON/CSV/TXT 格式文件，导入成功率达到 99%，导入耗时符合要求）

---

## 阶段 4：Story ST-002 - 词库列表展示功能（类型：Functional）

**目标**：词库列表能够正确显示词库信息，列表加载时间不超过 500ms（p95），空状态提示清晰

**验证方式（高层）**：列表正确显示词库信息，加载时间符合要求（p95 ≤ 500ms），内存占用符合要求（≤ 20MB）

**覆盖 FR/NFR**：FR-002；FR-006（空状态）；NFR-PERF-001（列表加载时间）；NFR-MEM-001（列表内存占用）；NFR-OBS-001（加载事件）

### ST-002 任务

- [ ] T200 [ST-002] 实现 UseCase 层 - 获取词库列表（路径：`app/src/main/java/com/jacky/verity/library/domain/usecase/GetLibrariesUseCase.kt`）
  - **依赖**：T104
  - **设计引用**：plan.md:A3.4:Domain层:UML类图、plan.md:A3.4:Domain层:时序-成功
  - **步骤**：
    - 1) 创建 `GetLibrariesUseCase`（依赖 LibraryRepository）
    - 2) 实现 `invoke()` 返回 `Flow<List<WordLibrary>>`
  - **验证**：
    - [ ] UseCase 正常工作
  - **产物**：`GetLibrariesUseCase.kt`

- [ ] T201 [ST-002] 更新 ViewModel 层 - 词库列表状态（路径：`app/src/main/java/com/jacky/verity/library/viewmodel/LibraryViewModel.kt`）
  - **依赖**：T200
  - **设计引用**：plan.md:A3.4:ViewModel层:UML类图、plan.md:A3.4:ViewModel层:时序-成功
  - **步骤**：
    - 1) 在 `LibraryViewModel` 中添加 `GetLibrariesUseCase` 依赖
    - 2) 实现词库列表加载逻辑（从 UseCase 获取 Flow，更新 StateFlow）
    - 3) 实现加载状态管理（isLoading）
    - 4) 实现内存缓存策略（首次加载后缓存，减少重复读取）
  - **验证**：
    - [ ] 列表加载正常工作
    - [ ] 加载状态正确更新
    - [ ] 内存缓存正常工作
  - **产物**：更新的 `LibraryViewModel.kt`

- [ ] T202 [ST-002] 实现 UI 层 - 词库列表界面（路径：`app/src/main/java/com/jacky/verity/library/ui/LibraryListScreen.kt`）
  - **依赖**：T201
  - **设计引用**：plan.md:A3.4:UI层:UML类图、plan.md:A3.4:UI层:时序-成功
  - **步骤**：
    - 1) 创建 `LibraryListScreen` Compose 函数
    - 2) 使用 `LazyColumn` 实现词库列表（虚拟化）
    - 3) 实现列表项显示（词库名称、单词数量、创建时间）
    - 4) 使用 `collectAsState` 观察 ViewModel 的 StateFlow
  - **验证**：
    - [ ] 列表正确显示词库信息（符合 FR-002）
    - [ ] 列表加载时间 ≤ 500ms（p95）（符合 NFR-PERF-001）
  - **产物**：`LibraryListScreen.kt`

- [ ] T203 [ST-002] 实现 UI 层 - 空状态组件（路径：`app/src/main/java/com/jacky/verity/library/ui/components/EmptyState.kt`）
  - **依赖**：T202
  - **设计引用**：plan.md:A3.4:UI层:UML类图
  - **步骤**：
    - 1) 创建 `EmptyState` Compose 组件
    - 2) 实现空状态提示（引导用户导入第一个词库）
    - 3) 在 `LibraryListScreen` 中集成空状态显示
  - **验证**：
    - [ ] 词库列表为空时显示空状态提示（符合 FR-006）
  - **产物**：`EmptyState.kt`

- [ ] T204 [ST-002] 实现 UI 层 - 词库列表项组件（路径：`app/src/main/java/com/jacky/verity/library/ui/components/LibraryItem.kt`）
  - **依赖**：T202
  - **设计引用**：plan.md:A3.4:UI层:UML类图
  - **步骤**：
    - 1) 创建 `LibraryItem` Compose 组件
    - 2) 显示词库名称、单词数量、创建时间
    - 3) 支持选中状态显示
  - **验证**：
    - [ ] 列表项正确显示词库信息
  - **产物**：`LibraryItem.kt`

- [ ] T205 [ST-002] 实现可观测性 - 列表加载事件（路径：相关文件）
  - **依赖**：T201
  - **设计引用**：plan.md:A3.4:Repository层:可观测性
  - **步骤**：
    - 1) 记录列表加载成功事件（加载耗时、词库数量）
    - 2) 使用结构化日志
  - **验证**：
    - [ ] 列表加载事件正确记录（符合 NFR-OBS-001）
  - **产物**：日志/埋点代码

- [ ] T206 [ST-002] 内存占用验证（路径：测试文件）
  - **依赖**：T202
  - **设计引用**：plan.md:A10 内存评估
  - **步骤**：
    - 1) 使用 Android Profiler 测量列表内存占用
    - 2) 验证峰值内存增量 ≤ 20MB（10 个词库场景）
  - **验证**：
    - [ ] 列表内存占用峰值 ≤ 20MB（符合 NFR-MEM-001）
  - **产物**：内存测试报告

**检查点**：至此，Story ST-002 应具备完整功能且可独立测试（列表正确显示词库信息，加载时间符合要求，内存占用符合要求）

---

## 阶段 5：Story ST-003 - 词库选择功能（类型：Functional）

**目标**：用户能够选择词库，当前词库被正确标记，选择状态持久化保存

**验证方式（高层）**：能够选择词库，当前词库被标记，选择状态持久化

**覆盖 FR/NFR**：FR-003；NFR-REL-002（状态持久化）；NFR-OBS-001（选择事件记录）

### ST-003 任务

- [ ] T300 [ST-003] 实现 UseCase 层 - 选择词库（路径：`app/src/main/java/com/jacky/verity/library/domain/usecase/SelectLibraryUseCase.kt`）
  - **依赖**：T104
  - **设计引用**：plan.md:A3.4:Domain层:UML类图、plan.md:A3.4:Domain层:时序-成功
  - **步骤**：
    - 1) 创建 `SelectLibraryUseCase`（依赖 LibraryRepository）
    - 2) 实现 `invoke(libraryId: String): Result<Unit>`
    - 3) 实现业务规则：选择词库时更新其他词库状态（isSelected）
  - **验证**：
    - [ ] UseCase 正常工作
    - [ ] 选择词库时其他词库状态正确更新
  - **产物**：`SelectLibraryUseCase.kt`

- [ ] T301 [ST-003] 更新 ViewModel 层 - 词库选择（路径：`app/src/main/java/com/jacky/verity/library/viewmodel/LibraryViewModel.kt`）
  - **依赖**：T300
  - **设计引用**：plan.md:A3.4:ViewModel层:UML类图、plan.md:A3.4:ViewModel层:时序-成功
  - **步骤**：
    - 1) 在 `LibraryViewModel` 中添加 `SelectLibraryUseCase` 依赖
    - 2) 实现 `onLibrarySelect(libraryId: String)` 方法
    - 3) 实现选择状态更新（更新 StateFlow 中的 isSelected 字段）
  - **验证**：
    - [ ] 选择功能正常工作
    - [ ] 状态更新正确
  - **产物**：更新的 `LibraryViewModel.kt`

- [ ] T302 [ST-003] 更新 UI 层 - 词库选择交互（路径：`app/src/main/java/com/jacky/verity/library/ui/LibraryListScreen.kt`、`app/src/main/java/com/jacky/verity/library/ui/components/LibraryItem.kt`）
  - **依赖**：T301
  - **设计引用**：plan.md:A3.4:UI层:UML类图、plan.md:A3.4:UI层:时序-成功
  - **步骤**：
    - 1) 在 `LibraryItem` 中添加点击事件处理
    - 2) 在 `LibraryListScreen` 中调用 ViewModel 的 `onLibrarySelect`
    - 3) 实现选中状态视觉反馈（高亮/标记）
  - **验证**：
    - [ ] 用户能够选择词库（符合 FR-003）
    - [ ] 当前词库被正确标记
  - **产物**：更新的 `LibraryListScreen.kt`、`LibraryItem.kt`

- [ ] T303 [ST-003] 实现可观测性 - 选择事件（路径：相关文件）
  - **依赖**：T300
  - **设计引用**：plan.md:A3.4:Repository层:可观测性
  - **步骤**：
    - 1) 记录词库选择事件（词库 ID、切换前后状态）
  - **验证**：
    - [ ] 选择事件正确记录（符合 NFR-OBS-001）
  - **产物**：日志/埋点代码

- [ ] T304 [ST-003] 持久化验证（路径：测试文件）
  - **依赖**：T302
  - **设计引用**：plan.md:A3.4:Repository层:时序-成功、plan.md:NFR-REL-002
  - **步骤**：
    - 1) 测试选择状态持久化：选择词库后退出应用，重启后验证状态恢复
  - **验证**：
    - [ ] 选择状态持久化正常，应用重启后恢复（符合 NFR-REL-002）
  - **产物**：持久化测试报告

**检查点**：至此，Story ST-003 应具备完整功能且可独立测试（能够选择词库，当前词库被标记，选择状态持久化）

---

## 阶段 6：Story ST-004 - 词库搜索功能（类型：Functional）

**目标**：搜索功能正常工作，搜索响应时间不超过 200ms（p95），搜索结果实时更新

**验证方式（高层）**：搜索功能正常，响应时间符合要求（p95 ≤ 200ms），搜索结果正确

**覆盖 FR/NFR**：FR-004；NFR-PERF-001（搜索响应时间）

### ST-004 任务

- [ ] T400 [ST-004] 实现 UseCase 层 - 搜索词库（路径：`app/src/main/java/com/jacky/verity/library/domain/usecase/SearchLibrariesUseCase.kt`）
  - **依赖**：T104
  - **设计引用**：plan.md:A3.4:Domain层:UML类图、plan.md:A3.4:Domain层:时序-成功
  - **步骤**：
    - 1) 创建 `SearchLibrariesUseCase`（依赖 LibraryRepository）
    - 2) 实现 `invoke(query: String): List<WordLibrary>`
    - 3) 实现业务规则：空查询返回全部词库
  - **验证**：
    - [ ] UseCase 正常工作
    - [ ] 空查询返回全部词库
  - **产物**：`SearchLibrariesUseCase.kt`

- [ ] T401 [ST-004] 更新 ViewModel 层 - 搜索功能（路径：`app/src/main/java/com/jacky/verity/library/viewmodel/LibraryViewModel.kt`）
  - **依赖**：T400
  - **设计引用**：plan.md:A3.4:ViewModel层:UML类图、plan.md:A3.4:ViewModel层:策略与算法
  - **步骤**：
    - 1) 在 `LibraryViewModel` 中添加 `SearchLibrariesUseCase` 依赖
    - 2) 实现 `onSearchQueryChange(query: String)` 方法
    - 3) 实现搜索防抖（debounce 300ms）减少 UseCase 调用频率
    - 4) 实现搜索结果状态更新
  - **验证**：
    - [ ] 搜索防抖正常工作
    - [ ] 搜索结果正确更新
  - **产物**：更新的 `LibraryViewModel.kt`

- [ ] T402 [ST-004] 更新 UI 层 - 搜索框和实时过滤（路径：`app/src/main/java/com/jacky/verity/library/ui/LibraryListScreen.kt`）
  - **依赖**：T401
  - **设计引用**：plan.md:A3.4:UI层:UML类图、plan.md:A3.4:UI层:策略与算法
  - **步骤**：
    - 1) 在 `LibraryListScreen` 中添加搜索框组件
    - 2) 实现搜索输入监听（调用 ViewModel 的 `onSearchQueryChange`）
    - 3) 实现搜索结果实时显示（基于 ViewModel 的 StateFlow）
    - 4) 实现无结果提示
  - **验证**：
    - [ ] 搜索功能正常（符合 FR-004）
    - [ ] 搜索响应时间 ≤ 200ms（p95）（符合 NFR-PERF-001）
    - [ ] 搜索结果实时更新
  - **产物**：更新的 `LibraryListScreen.kt`

- [ ] T403 [ST-004] 实现 Repository 层 - 搜索方法（路径：`app/src/main/java/com/jacky/verity/library/data/repository/LibraryRepositoryImpl.kt`）
  - **依赖**：T104
  - **设计引用**：plan.md:A3.4:Repository层:UML类图、plan.md:A3.4:Repository层:时序-成功
  - **步骤**：
    - 1) 在 `LibraryRepositoryImpl` 中实现 `searchLibraries(query: String): List<WordLibrary>`
    - 2) 实现模糊匹配（基于词库名称）
    - 3) 优化搜索性能（避免重复遍历）
  - **验证**：
    - [ ] 搜索功能正常工作
    - [ ] 模糊匹配正确
  - **产物**：更新的 `LibraryRepositoryImpl.kt`

**检查点**：至此，Story ST-004 应具备完整功能且可独立测试（搜索功能正常，响应时间符合要求，搜索结果正确）

---

## 阶段 7：Story ST-005 - 错误处理和异常场景（类型：Infrastructure）

**目标**：所有异常场景都有明确的错误提示和引导，用户能够理解错误原因并采取行动

**验证方式（高层）**：所有异常场景都有明确的错误提示，错误日志正确记录

**覆盖 FR/NFR**：FR-005；NFR-OBS-002（错误日志记录）；NFR-REL-001（错误处理）

### ST-005 任务

- [ ] T500 [ST-005] 完善错误处理 - 文件格式不支持（路径：相关文件）
  - **依赖**：T103
  - **设计引用**：plan.md:A3.4:Parser层:异常清单表（EX-PARSE-001）、plan.md:A3.4:Parser层:时序-异常
  - **步骤**：
    - 1) 在 Parser 层实现格式检测和错误返回（FormatError）
    - 2) 在 UI 层实现格式错误提示（说明支持的格式：JSON/CSV/TXT）
  - **验证**：
    - [ ] 格式不支持时显示明确错误提示（符合 FR-005）
    - [ ] 错误日志正确记录（符合 NFR-OBS-002）
  - **产物**：错误处理代码

- [ ] T501 [ST-005] 完善错误处理 - 文件解析失败（路径：相关文件）
  - **依赖**：T103
  - **设计引用**：plan.md:A3.4:Parser层:异常清单表（EX-PARSE-002/003/006）、plan.md:A3.4:Parser层:时序-异常
  - **步骤**：
    - 1) 在 Parser 层实现 IO 错误处理（IOError）
    - 2) 在 Parser 层实现编码错误处理（EncodingError）
    - 3) 在 Parser 层实现数据格式不规范处理（FormatError）
    - 4) 在 UI 层实现解析失败错误提示（说明失败原因）
  - **验证**：
    - [ ] 解析失败时显示明确错误提示（符合 FR-005）
    - [ ] 错误日志正确记录（符合 NFR-OBS-002）
  - **产物**：错误处理代码

- [ ] T502 [ST-005] 完善错误处理 - 存储空间不足（路径：相关文件）
  - **依赖**：T102
  - **设计引用**：plan.md:A3.4:DataSource层:异常清单表（EX-DS-003）、plan.md:A3.4:DataSource层:时序-异常
  - **步骤**：
    - 1) 在 DataSource 层实现存储空间检查
    - 2) 在 UI 层实现存储空间不足提示（引导用户清理空间）
  - **验证**：
    - [ ] 存储空间不足时显示明确提示（符合 FR-005）
    - [ ] 错误日志正确记录（符合 NFR-OBS-002）
  - **产物**：错误处理代码

- [ ] T503 [ST-005] 完善错误处理 - 文件权限被拒绝（路径：相关文件）
  - **依赖**：T107
  - **设计引用**：plan.md:A3.4:UI层:异常清单表（EX-UI-002）、plan.md:A3.4:UI层:时序-异常
  - **步骤**：
    - 1) 在 UI 层实现权限错误检测
    - 2) 实现权限错误提示（引导用户到系统设置授权）
    - 3) 提供设置入口
  - **验证**：
    - [ ] 权限被拒绝时显示明确提示并引导授权（符合 FR-005）
    - [ ] 错误日志正确记录（符合 NFR-OBS-002）
  - **产物**：错误处理代码

- [ ] T504 [ST-005] 完善错误处理 - SharedPreferences 写入失败（路径：相关文件）
  - **依赖**：T102
  - **设计引用**：plan.md:A3.4:DataSource层:异常清单表（EX-DS-001）、plan.md:A3.4:DataSource层:时序-异常
  - **步骤**：
    - 1) 在 DataSource 层实现写入失败检测和回滚
    - 2) 在 UI 层实现保存失败提示（允许重试）
  - **验证**：
    - [ ] 写入失败时显示明确提示（符合 FR-005）
    - [ ] 回滚策略正常工作
    - [ ] 错误日志正确记录（符合 NFR-OBS-002）
  - **产物**：错误处理代码

- [ ] T505 [ST-005] 完善错误处理 - 文件 URI 失效（路径：相关文件）
  - **依赖**：T104
  - **设计引用**：plan.md:A5 技术风险（RISK-005）
  - **步骤**：
    - 1) 实现文件 URI 有效性验证
    - 2) 实现 URI 失效时的错误提示（提示用户重新选择文件）
  - **验证**：
    - [ ] URI 失效时显示明确提示（符合 FR-005）
    - [ ] 错误日志正确记录（符合 NFR-OBS-002）
  - **产物**：错误处理代码

- [ ] T506 [ST-005] 统一错误提示资源（路径：`app/src/main/res/values/strings.xml`）
  - **依赖**：T500、T501、T502、T503、T504、T505
  - **设计引用**：plan.md:B2 错误处理规范
  - **步骤**：
    - 1) 在 strings.xml 中定义所有错误提示字符串资源
    - 2) 确保错误信息用户友好
  - **验证**：
    - [ ] 所有错误提示使用字符串资源（符合 plan.md:B2）
  - **产物**：`strings.xml`

**检查点**：至此，Story ST-005 应具备完整功能且可独立测试（所有异常场景都有明确的错误提示，错误日志正确记录）

---

## 阶段 8：Story ST-006 - 数据持久化和生命周期管理（类型：Infrastructure）

**目标**：数据能够可靠持久化，应用重启后恢复，内存占用符合要求

**验证方式（高层）**：数据持久化正常，应用重启后恢复，内存占用符合要求

**覆盖 FR/NFR**：NFR-REL-002（数据持久化）；NFR-MEM-001/002（内存生命周期）

### ST-006 任务

- [ ] T600 [ST-006] 完善数据持久化 - SharedPreferences 同步写入（路径：`app/src/main/java/com/jacky/verity/library/data/datasource/LibraryLocalDataSourceImpl.kt`）
  - **依赖**：T102
  - **设计引用**：plan.md:A3.4:DataSource层:策略与算法、plan.md:A3.4:DataSource层:时序-成功
  - **步骤**：
    - 1) 确保 SharedPreferences 写入使用 `apply()` + `commit()` 组合确保同步写入
    - 2) 实现批量操作（列表更新批量序列化后一次性写入）
  - **验证**：
    - [ ] 数据持久化正常（符合 NFR-REL-002）
  - **产物**：更新的 `LibraryLocalDataSourceImpl.kt`

- [ ] T601 [ST-006] 完善数据持久化 - 文件原子替换（路径：`app/src/main/java/com/jacky/verity/library/data/datasource/LibraryLocalDataSourceImpl.kt`）
  - **依赖**：T102
  - **设计引用**：plan.md:A3.4:DataSource层:策略与算法、plan.md:B3.2 文件存储
  - **步骤**：
    - 1) 确保文件保存使用"临时文件 → 校验 → 原子替换"策略
    - 2) 实现文件完整性校验
  - **验证**：
    - [ ] 文件保存使用原子替换（避免半写入）
    - [ ] 数据持久化正常（符合 NFR-REL-002）
  - **产物**：更新的 `LibraryLocalDataSourceImpl.kt`

- [ ] T602 [ST-006] 实现生命周期管理 - 应用退出时清理内存（路径：`app/src/main/java/com/jacky/verity/library/viewmodel/LibraryViewModel.kt`）
  - **依赖**：T201
  - **设计引用**：plan.md:A3.4:ViewModel层:并发/生命周期、plan.md:A10 内存评估
  - **步骤**：
    - 1) 在 ViewModel 的 `onCleared()` 中清理内存缓存
    - 2) 确保应用退出时释放词库列表数据
  - **验证**：
    - [ ] 应用退出时内存正确清理（符合 NFR-MEM-002）
  - **产物**：更新的 `LibraryViewModel.kt`

- [ ] T603 [ST-006] 实现生命周期管理 - 应用重启后恢复（路径：`app/src/main/java/com/jacky/verity/library/viewmodel/LibraryViewModel.kt`）
  - **依赖**：T201
  - **设计引用**：plan.md:A3.4:Repository层:时序-成功、plan.md:NFR-REL-002
  - **步骤**：
    - 1) 在 ViewModel 初始化时从 SharedPreferences 恢复词库列表
    - 2) 恢复当前选择词库状态
  - **验证**：
    - [ ] 应用重启后词库列表正确恢复（符合 NFR-REL-002）
    - [ ] 应用重启后当前选择状态正确恢复（符合 NFR-REL-002）
  - **产物**：更新的 `LibraryViewModel.kt`

- [ ] T604 [ST-006] 实现生命周期管理 - 文件解析临时内存释放（路径：`app/src/main/java/com/jacky/verity/library/data/parser/`）
  - **依赖**：T103
  - **设计引用**：plan.md:A3.4:Parser层:安全与隐私、plan.md:A10 内存评估
  - **步骤**：
    - 1) 确保解析完成后立即释放文件句柄
    - 2) 确保解析过程中的临时内存及时释放
  - **验证**：
    - [ ] 解析完成后立即释放临时内存（符合 NFR-MEM-001）
  - **产物**：更新的 Parser 实现

- [ ] T605 [ST-006] 持久化验证 - 应用重启测试（路径：测试文件）
  - **依赖**：T603
  - **设计引用**：plan.md:NFR-REL-002
  - **步骤**：
    - 1) 测试场景：导入词库 → 选择词库 → 退出应用 → 重启应用
    - 2) 验证词库列表和选择状态正确恢复
  - **验证**：
    - [ ] 数据持久化正常，应用重启后恢复（符合 NFR-REL-002）
  - **产物**：持久化测试报告

- [ ] T606 [ST-006] 内存生命周期验证（路径：测试文件）
  - **依赖**：T602、T604
  - **设计引用**：plan.md:A10 内存评估
  - **步骤**：
    - 1) 使用 Android Profiler 测量应用退出时的内存释放
    - 2) 验证解析完成后临时内存释放
  - **验证**：
    - [ ] 应用退出时内存正确清理（符合 NFR-MEM-002）
    - [ ] 解析完成后临时内存立即释放（符合 NFR-MEM-001）
  - **产物**：内存生命周期测试报告

**检查点**：至此，Story ST-006 应具备完整功能且可独立测试（数据持久化正常，应用重启后恢复，内存占用符合要求）

---

## 依赖关系与执行顺序

### 阶段依赖

- **环境搭建（阶段 1）**：无依赖——可立即启动
- **核心基础（阶段 2）**：依赖环境搭建完成——阻塞所有用户故事
- **用户故事（阶段 3+）**：均依赖核心基础阶段完成
  - ST-001：依赖阶段 2 完成，可独立启动
  - ST-002：依赖 ST-001 完成
  - ST-003：依赖 ST-002 完成
  - ST-004：依赖 ST-002 完成（可与 ST-003 并行）
  - ST-005：依赖 ST-001 完成（可与 ST-002/ST-003/ST-004 并行）
  - ST-006：依赖 ST-001、ST-002、ST-003 完成（可与 ST-004/ST-005 并行）

### Story 依赖

- **ST-001**：依赖阶段 2 完成
- **ST-002**：依赖 ST-001 完成
- **ST-003**：依赖 ST-002 完成
- **ST-004**：依赖 ST-002 完成（可与 ST-003 并行）
- **ST-005**：依赖 ST-001 完成（可与 ST-002/ST-003/ST-004 并行）
- **ST-006**：依赖 ST-001、ST-002、ST-003 完成（可与 ST-004/ST-005 并行）

### 单 Story 内部顺序

- 领域模型/错误类型 → 数据层（DataSource/Parser/Repository）→ 领域层（UseCase）→ 表现层（ViewModel/UI）
- 核心功能实现先于集成工作
- 可观测性/性能验证在功能实现后

### 并行执行场景

- 所有标记 [P] 的环境搭建任务可并行（T012）
- 核心基础阶段完成后，ST-001 可立即启动
- ST-002 完成后，ST-003 和 ST-004 可并行
- ST-001 完成后，ST-005 可与 ST-002/ST-003/ST-004 并行
- ST-001/ST-002/ST-003 完成后，ST-006 可与 ST-004/ST-005 并行

---

## 并行示例：Story ST-001

```bash
# ST-001 内部可并行任务（示例）：
- T102 [P] [ST-001] 实现 DataSource 层（路径：LibraryLocalDataSourceImpl.kt）
- T103 [P] [ST-001] 实现 Parser 层（路径：JsonLibraryParser.kt、CsvLibraryParser.kt、TxtLibraryParser.kt）
```

---

## 落地策略

### 先完成 MVP（优先完成关键 Story 集合）

1. 完成阶段 1：环境搭建
2. 完成阶段 2：核心基础（关键——阻塞所有故事）
3. 完成阶段 3：Story ST-001（词库文件导入功能）
4. **暂停并验证**：独立验证 ST-001（导入功能完整可用）
5. 如就绪，进行部署/演示

### 增量交付

1. 完成环境搭建 + 核心基础 → 基础层就绪
2. 新增 ST-001 → 独立验证 → 部署/演示（MVP！）
3. 新增 ST-002 → 独立验证 → 部署/演示
4. 新增 ST-003 → 独立验证 → 部署/演示
5. 新增 ST-004 → 独立验证 → 部署/演示
6. 新增 ST-005 → 独立验证 → 部署/演示
7. 新增 ST-006 → 独立验证 → 部署/演示
8. 每个故事均需在不破坏已有故事的前提下新增价值

### 团队并行策略

多开发者协作场景：

1. 团队共同完成环境搭建 + 核心基础
2. 核心基础完成后：
   - 开发者 A：负责 ST-001
3. ST-001 完成后：
   - 开发者 A：负责 ST-002
   - 开发者 B：负责 ST-005（可与 ST-002 并行）
4. ST-002 完成后：
   - 开发者 A：负责 ST-003
   - 开发者 B：负责 ST-004（可与 ST-003 并行）
   - 开发者 C：负责 ST-006（可与 ST-003/ST-004 并行）
5. 各 Story 独立完成并集成

---

## 任务汇总

- **任务总数**：33 个任务
- **各 Story 任务数量**：
  - ST-001：11 个任务（T100-T110）
  - ST-002：7 个任务（T200-T206）
  - ST-003：5 个任务（T300-T304）
  - ST-004：4 个任务（T400-T403）
  - ST-005：7 个任务（T500-T506）
  - ST-006：7 个任务（T600-T606）
- **可并行执行机会**：
  - 阶段 1：T012 [P]
  - ST-001：T102 [P]、T103 [P]
  - ST-002 完成后：ST-003 和 ST-004 可并行
  - ST-001 完成后：ST-005 可与 ST-002/ST-003/ST-004 并行
- **建议的 MVP 范围**：阶段 1 + 阶段 2 + ST-001（词库文件导入功能）

---

## 备注

- [P] 标记的任务 = 涉及不同文件，无依赖关系
- [ST-xxx] 标签将任务关联至 Plan 的 Story，便于追溯
- 每个 Story 需可独立完成、独立验证
- 实现前验证测试用例执行失败（如适用）
- 完成单个任务或逻辑分组后提交代码
- 可在任意检查点暂停，独立验证对应故事
- 避免：模糊的任务描述、同一文件冲突、破坏独立性的跨故事依赖
- **设计引用**：所有任务均引用 plan.md 的模块级 UML 设计（A3.4），确保实现与设计一致
