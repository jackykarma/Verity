# Tasks：学习进度与统计

**Epic**：EPIC-001 - 无痛记忆单词神器APP
**Feature ID**：FEAT-005
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

- **依赖**：T???（无则写"无"）
- **步骤**：
  - 1) …
  - 2) …
- **验证**：
  - [ ] 单元/集成/手动验证步骤（可执行）
  - [ ] 指标（如 p95、mAh、内存 MB）与阈值（如适用）
- **产物**：涉及的文件/文档/脚本

## 路径约定（按 plan.md 的结构决策为准）

- **移动端**：`app/src/main/java/com/jacky/verity/statistics/`

---

## 阶段 0：准备（可选但建议）

**目标**：对齐版本、冻结设计输入，避免 Implement 期返工

- [ ] T001 在 `specs/epics/EPIC-001-word-memory-app/features/FEAT-005-learning-progress-stats/` 中核对 `spec.md`、`plan.md` 的 Version 字段一致性并补齐变更记录
  - **依赖**：无
  - **步骤**：
    - 1) 确认 `Feature Version`（v0.1.0）、`Plan Version`（v0.1.0）已填写
    - 2) 确认 Plan 的 Story Breakdown 已完成（ST-001 至 ST-008）
    - 3) 确认所有 FR/NFR 已映射到 Story
  - **验证**：
    - [ ] tasks.md 中 `Plan Version` 与 plan.md 一致（v0.1.0）
    - [ ] Story 列表完整（8 个 Story）
  - **产物**：`spec.md`、`plan.md`、`tasks.md`

---

## 阶段 1：环境搭建（共享基础设施）

**目标**：项目初始化与基础结构搭建

- [ ] T010 按照 plan.md 的"结构决策"创建项目目录结构（路径：`app/src/main/java/com/jacky/verity/statistics/`）
  - **依赖**：T001
  - **步骤**：
    - 1) 创建 `statistics/ui/` 目录（StatisticsScreen.kt、ReportScreen.kt、MemoryCurveScreen.kt、chart/）
    - 2) 创建 `statistics/viewmodel/` 目录（StatisticsViewModel.kt、ReportViewModel.kt）
    - 3) 创建 `statistics/domain/usecase/` 目录（GetStatisticsUseCase.kt、GenerateReportUseCase.kt、GetMemoryCurveUseCase.kt）
    - 4) 创建 `statistics/domain/model/` 目录（LearningStatistics.kt、LearningReport.kt、MemoryCurveData.kt）
    - 5) 创建 `statistics/data/repository/` 目录（StatisticsRepository.kt）
    - 6) 创建 `statistics/data/cache/` 目录（StatisticsCache.kt）
  - **验证**：
    - [ ] 目录结构与 plan.md B7 一致
    - [ ] 所有目录已创建
  - **产物**：相关目录

- [ ] T011 初始化构建与依赖（路径：`app/build.gradle.kts`）
  - **依赖**：T010
  - **步骤**：
    - 1) 添加 Vico 图表库依赖（`implementation("com.patrykandpatrick.vico:compose:1.x.x")`）
    - 2) 添加 Coroutines 和 Flow 依赖（如未添加）
    - 3) 添加 Room 依赖（如未添加，通过 FEAT-007 使用）
    - 4) 确保 Jetpack Compose 依赖已配置
  - **验证**：
    - [ ] 基础构建可通过（`./gradlew build`）
    - [ ] 所有依赖已正确添加
  - **产物**：`app/build.gradle.kts`

- [ ] T012 [P] 配置代码检查与格式化工具（路径：`.editorconfig`、`app/build.gradle.kts`）
  - **依赖**：T011
  - **步骤**：
    - 1) 配置 Kotlin 代码格式化规则（如 ktlint）
    - 2) 配置代码检查规则（如 detekt）
    - 3) 确保与项目其他模块的代码风格一致
  - **验证**：
    - [ ] lint/format 命令可运行（`./gradlew ktlintCheck`）
  - **产物**：`.editorconfig`、`app/build.gradle.kts`

---

## 阶段 2：核心基础（阻塞性前置条件，阻塞所有 Story）

**目标**：所有 Story 实现前必须完成的核心基础设施搭建

**⚠️ 关键**：此阶段完成前，任何 Story 相关工作均不可启动

- [ ] T020 在 `app/src/main/java/com/jacky/verity/statistics/domain/model/` 中创建核心数据模型（LearningStatistics.kt、LearningReport.kt、MemoryCurveData.kt、TimeRange.kt、ReportType.kt、TrendMetric.kt）
  - **依赖**：T012
  - **步骤**：
    - 1) 创建 `LearningStatistics` data class（包含 learningDays、totalWordsLearned、totalWordsReviewed、averageAccuracy、totalLearningTime、timeRange）
    - 2) 创建 `LearningTrendData` data class（包含 date、learningTime、wordsLearned、accuracy）
    - 3) 创建 `MemoryCurveData` data class（包含 wordId、timestamp、memoryStrength）
    - 4) 创建 `LearningReport` data class（包含 type、timeRange、statistics、trendData、generatedAt）
    - 5) 创建 `TimeRange` data class（包含 startTime、endTime）
    - 6) 创建 `ReportType` enum（Daily、Weekly、Monthly）
    - 7) 创建 `TrendMetric` enum（LearningTime、WordsLearned、Accuracy）
  - **验证**：
    - [ ] 数据模型与 plan.md B3.2 一致
    - [ ] 所有字段类型正确
    - [ ] 数据类可序列化（如需要）
  - **产物**：`LearningStatistics.kt`、`LearningReport.kt`、`MemoryCurveData.kt`、`TimeRange.kt`、`ReportType.kt`、`TrendMetric.kt`

- [ ] T021 [P] 在 `app/src/main/java/com/jacky/verity/statistics/domain/model/` 中创建错误类型（StatisticsError.kt、ReportError.kt）
  - **依赖**：T020
  - **步骤**：
    - 1) 创建 `StatisticsError` sealed class（QueryError、CalculationError、CacheError）
    - 2) 创建 `ReportError` sealed class（GenerationError、DataError、TimeoutError）
    - 3) 为每个错误类型添加错误消息和可选的异常信息
  - **验证**：
    - [ ] 错误类型与 plan.md A3.4 一致
    - [ ] 所有错误类型已定义
  - **产物**：`StatisticsError.kt`、`ReportError.kt`

- [ ] T022 [P] 在 `app/src/main/java/com/jacky/verity/statistics/di/` 中创建依赖注入模块（StatisticsModule.kt）
  - **依赖**：T020
  - **步骤**：
    - 1) 创建 StatisticsModule（使用 Hilt/Dagger/Koin）
    - 2) 提供 StatisticsRepository 单例（依赖 FEAT-007 UserDataRepository、FEAT-002 AlgorithmRepository）
    - 3) 提供 StatisticsCache 单例
    - 4) 提供 UseCase 实例（GetStatisticsUseCase、GenerateReportUseCase、GetMemoryCurveUseCase）
  - **验证**：
    - [ ] 依赖注入配置正确
    - [ ] 所有依赖可正常注入
  - **产物**：`StatisticsModule.kt`

**检查点**：基础层就绪——数据模型、错误类型、依赖注入已就绪，Story 实现可启动

---

## 阶段 3：Story ST-001 - 实现统计数据查询功能（类型：Functional）

**目标**：用户能够查看基础统计数据，数据准确可靠，查询响应迅速

**验证方式（高层）**：
- 用户能够成功查看统计数据，数据准确，查询时间 p95 ≤ 1 秒
- 统计数据查询成功率 ≥ 99.5%
- 统计数据准确性误差 ≤ 0.1%

**覆盖 FR/NFR**：FR-001、FR-005；NFR-PERF-001、NFR-REL-001、NFR-REL-002

### ST-001 任务

- [ ] T100 [ST-001] 在 `app/src/main/java/com/jacky/verity/statistics/data/repository/` 中创建 StatisticsRepository 接口和实现
  - **依赖**：T022
  - **步骤**：
    - 1) 定义 `StatisticsRepository` 接口（getStatistics、getTrendData、getMemoryCurve）
    - 2) 实现 `StatisticsRepositoryImpl`，依赖 FEAT-007 UserDataRepository 和 FEAT-002 AlgorithmRepository
    - 3) 实现 `getStatistics(timeRange: TimeRange)` 方法，查询学习记录数据并聚合计算
    - 4) 实现数据聚合逻辑（学习天数、单词数量、正确率等）
    - 5) 处理查询超时（5 秒超时）
    - 6) 处理查询失败和错误返回
  - **验证**：
    - [ ] Repository 接口定义与 plan.md B4.2 一致
    - [ ] 统计数据查询功能正常
    - [ ] 查询超时处理正确
    - [ ] 错误处理完善
  - **产物**：`StatisticsRepository.kt`、`StatisticsRepositoryImpl.kt`

- [ ] T101 [ST-001] 在 `app/src/main/java/com/jacky/verity/statistics/domain/usecase/` 中实现 GetStatisticsUseCase
  - **依赖**：T100
  - **步骤**：
    - 1) 创建 `GetStatisticsUseCase`，依赖 StatisticsRepository
    - 2) 实现 `invoke(timeRange: TimeRange): Flow<Result<LearningStatistics>>`
    - 3) 在 IO 线程执行查询
    - 4) 处理错误并转换为 Result
    - 5) 返回 Flow 支持实时更新
  - **验证**：
    - [ ] UseCase 在 IO 线程执行
    - [ ] 错误处理正确
    - [ ] Flow 数据流正常
  - **产物**：`GetStatisticsUseCase.kt`

- [ ] T102 [ST-001] 在 `app/src/main/java/com/jacky/verity/statistics/viewmodel/` 中实现 StatisticsViewModel
  - **依赖**：T101
  - **步骤**：
    - 1) 创建 `StatisticsViewModel`，依赖 GetStatisticsUseCase
    - 2) 定义 UI 状态（Loading、Success、Error、Empty）
    - 3) 实现 `loadStatistics(timeRange: TimeRange)` 方法
    - 4) 使用 `viewModelScope` 启动协程
    - 5) 处理加载状态和错误状态
    - 6) 支持时间范围选择（最近 7 天、30 天、90 天）
  - **验证**：
    - [ ] ViewModel 状态管理正确
    - [ ] 时间范围选择功能正常
    - [ ] 加载状态和错误状态处理正确
  - **产物**：`StatisticsViewModel.kt`

- [ ] T103 [ST-001] 在 `app/src/main/java/com/jacky/verity/statistics/ui/` 中实现 StatisticsScreen
  - **依赖**：T102
  - **步骤**：
    - 1) 创建 `StatisticsScreen` Compose 函数
    - 2) 实现时间范围选择器（最近 7 天、30 天、90 天）
    - 3) 实现统计数据展示（学习天数、学习单词数量、复习单词数量、平均正确率）
    - 4) 实现加载状态 UI（显示加载指示器）
    - 5) 实现错误状态 UI（显示错误提示和重试按钮）
    - 6) 使用 ViewModel 的状态驱动 UI
  - **验证**：
    - [ ] UI 与 ViewModel 正确集成
    - [ ] 统计数据正确显示
    - [ ] 加载状态和错误状态 UI 正确
    - [ ] 时间范围选择功能正常
  - **产物**：`StatisticsScreen.kt`

- [ ] T104 [ST-001] 实现统计数据准确性验证（路径：`app/src/test/java/com/jacky/verity/statistics/`）
  - **依赖**：T103
  - **步骤**：
    - 1) 编写单元测试验证统计数据计算准确性
    - 2) 测试数据聚合逻辑（学习天数、单词数量、正确率）
    - 3) 验证统计数据与学习记录数据一致性（误差 ≤ 0.1%）
    - 4) 测试查询超时处理
  - **验证**：
    - [ ] 单元测试通过
    - [ ] 统计数据准确性误差 ≤ 0.1%（NFR-REL-002）
  - **产物**：`StatisticsRepositoryTest.kt`、`GetStatisticsUseCaseTest.kt`

**检查点**：至此，Story ST-001 应具备完整功能且可独立测试，统计数据查询功能可用

---

## 阶段 4：Story ST-002 - 实现统计数据缓存机制（类型：Infrastructure）

**目标**：统计数据缓存命中率 ≥ 80%，缓存大小 ≤ 10MB，缓存失效时间 1 小时

**验证方式（高层）**：
- 缓存命中率 ≥ 80%
- 缓存大小 ≤ 10MB
- 缓存失效时间 1 小时

**覆盖 FR/NFR**：NFR-PERF-001、NFR-MEM-001、NFR-REL-003

### ST-002 任务

- [ ] T110 [ST-002] 在 `app/src/main/java/com/jacky/verity/statistics/data/cache/` 中实现 StatisticsCache
  - **依赖**：T100
  - **步骤**：
    - 1) 创建 `StatisticsCache` 类，使用 `ConcurrentHashMap` 存储缓存
    - 2) 实现缓存键策略（基于 TimeRange 生成缓存键）
    - 3) 实现缓存存储方法（put、get）
    - 4) 实现缓存失效检查（1 小时失效）
    - 5) 实现缓存大小限制（≤ 10MB）
    - 6) 实现缓存清理方法（清理过期缓存）
  - **验证**：
    - [ ] 缓存存储和读取正常
    - [ ] 缓存失效时间 1 小时正确
    - [ ] 缓存大小限制有效（≤ 10MB）
  - **产物**：`StatisticsCache.kt`

- [ ] T111 [ST-002] 在 `app/src/main/java/com/jacky/verity/statistics/data/repository/StatisticsRepositoryImpl.kt` 中集成缓存机制
  - **依赖**：T110
  - **步骤**：
    - 1) 在 `getStatistics` 方法中先检查缓存
    - 2) 缓存命中时直接返回缓存数据
    - 3) 缓存未命中时查询数据库并更新缓存
    - 4) 缓存失效时重新查询并更新缓存
    - 5) 记录缓存命中率（用于可观测性）
  - **验证**：
    - [ ] 缓存命中时直接返回，不查询数据库
    - [ ] 缓存未命中时查询数据库并更新缓存
    - [ ] 缓存失效时重新查询
    - [ ] 缓存命中率 ≥ 80%
  - **产物**：`StatisticsRepositoryImpl.kt`（更新）

- [ ] T112 [ST-002] 实现缓存性能测试（路径：`app/src/test/java/com/jacky/verity/statistics/`）
  - **依赖**：T111
  - **步骤**：
    - 1) 编写单元测试验证缓存命中率
    - 2) 测试缓存大小限制
    - 3) 测试缓存失效时间
    - 4) 测试缓存清理功能
  - **验证**：
    - [ ] 缓存命中率 ≥ 80%（NFR-REL-003）
    - [ ] 缓存大小 ≤ 10MB（NFR-MEM-001）
    - [ ] 缓存失效时间 1 小时正确
  - **产物**：`StatisticsCacheTest.kt`

**检查点**：至此，Story ST-002 应具备完整功能且可独立测试，缓存机制可用

---

## 阶段 5：Story ST-003 - 实现学习趋势图表功能（类型：Functional）

**目标**：用户能够查看学习趋势图表，图表渲染流畅，数据准确

**验证方式（高层）**：
- 用户能够查看学习趋势图表，图表渲染时间 p95 ≤ 500ms

**覆盖 FR/NFR**：FR-002；NFR-PERF-001、NFR-MEM-001

### ST-003 任务

- [ ] T120 [ST-003] 在 `app/src/main/java/com/jacky/verity/statistics/data/repository/StatisticsRepositoryImpl.kt` 中实现 getTrendData 方法
  - **依赖**：T100
  - **步骤**：
    - 1) 实现 `getTrendData(timeRange: TimeRange, metric: TrendMetric)` 方法
    - 2) 查询学习记录数据并按时间维度聚合
    - 3) 计算学习时长趋势、单词学习量趋势、正确率趋势
    - 4) 返回 `Flow<List<LearningTrendData>>` 支持实时更新
  - **验证**：
    - [ ] 趋势数据查询功能正常
    - [ ] 数据聚合逻辑正确
    - [ ] Flow 数据流正常
  - **产物**：`StatisticsRepositoryImpl.kt`（更新）

- [ ] T121 [ST-003] 在 `app/src/main/java/com/jacky/verity/statistics/ui/chart/` 中实现 ChartRenderer
  - **依赖**：T020
  - **步骤**：
    - 1) 创建 `ChartRenderer` 类，封装 Vico 图表库
    - 2) 实现 `LineChart` Compose 函数，渲染折线图
    - 3) 实现 `BarChart` Compose 函数，渲染柱状图
    - 4) 实现数据采样逻辑（数据点 >100 个时采样，每 10 个点取 1 个）
    - 5) 使用 `remember` 缓存图表数据，避免重复计算
  - **验证**：
    - [ ] 图表渲染功能正常
    - [ ] 数据采样逻辑正确（数据点 >100 个时采样）
    - [ ] 图表性能满足要求（渲染时间 p95 ≤ 500ms）
  - **产物**：`ChartRenderer.kt`

- [ ] T122 [ST-003] 在 `app/src/main/java/com/jacky/verity/statistics/viewmodel/StatisticsViewModel.kt` 中添加趋势数据加载逻辑
  - **依赖**：T120、T121
  - **步骤**：
    - 1) 添加 `loadTrendData(timeRange: TimeRange, metric: TrendMetric)` 方法
    - 2) 使用 GetStatisticsUseCase 获取趋势数据
    - 3) 处理加载状态和错误状态
    - 4) 支持切换趋势指标（学习时长、单词学习量、正确率）
  - **验证**：
    - [ ] 趋势数据加载功能正常
    - [ ] 趋势指标切换功能正常
    - [ ] 加载状态和错误状态处理正确
  - **产物**：`StatisticsViewModel.kt`（更新）

- [ ] T123 [ST-003] 在 `app/src/main/java/com/jacky/verity/statistics/ui/StatisticsScreen.kt` 中集成趋势图表
  - **依赖**：T122
  - **步骤**：
    - 1) 在 StatisticsScreen 中添加趋势图表区域
    - 2) 实现趋势指标选择器（学习时长、单词学习量、正确率）
    - 3) 使用 ChartRenderer 渲染趋势图表
    - 4) 实现图表加载状态和错误状态 UI
  - **验证**：
    - [ ] 趋势图表正确显示
    - [ ] 趋势指标切换功能正常
    - [ ] 图表渲染时间 p95 ≤ 500ms（NFR-PERF-001）
  - **产物**：`StatisticsScreen.kt`（更新）

**检查点**：至此，Story ST-003 应具备完整功能且可独立测试，学习趋势图表功能可用

---

## 阶段 6：Story ST-004 - 实现记忆曲线展示功能（类型：Functional）

**目标**：用户能够查看记忆曲线，图表渲染流畅，数据准确

**验证方式（高层）**：
- 用户能够查看记忆曲线，图表渲染时间 p95 ≤ 500ms

**覆盖 FR/NFR**：FR-003、FR-008；NFR-PERF-001、NFR-MEM-001

### ST-004 任务

- [ ] T130 [ST-004] 在 `app/src/main/java/com/jacky/verity/statistics/data/repository/StatisticsRepositoryImpl.kt` 中实现 getMemoryCurve 方法
  - **依赖**：T100
  - **步骤**：
    - 1) 实现 `getMemoryCurve(wordId: String?, timeRange: TimeRange)` 方法
    - 2) 如果 wordId 为空，查询所有单词的记忆曲线数据
    - 3) 如果 wordId 不为空，查询单个单词的记忆曲线数据
    - 4) 调用 FEAT-002 AlgorithmRepository 获取记忆强度数据
    - 5) 处理算法引擎不可用的情况（使用默认值记忆强度 0）
    - 6) 返回 `Result<List<MemoryCurveData>>`
  - **验证**：
    - [ ] 记忆曲线数据查询功能正常
    - [ ] 单个单词和所有单词的查询都正常
    - [ ] 算法引擎不可用时使用默认值
  - **产物**：`StatisticsRepositoryImpl.kt`（更新）

- [ ] T131 [ST-004] 在 `app/src/main/java/com/jacky/verity/statistics/domain/usecase/` 中实现 GetMemoryCurveUseCase
  - **依赖**：T130
  - **步骤**：
    - 1) 创建 `GetMemoryCurveUseCase`，依赖 StatisticsRepository
    - 2) 实现 `invoke(wordId: String?, timeRange: TimeRange): Flow<Result<List<MemoryCurveData>>>`
    - 3) 在 IO 线程执行查询
    - 4) 处理错误并转换为 Result
    - 5) 实现数据采样逻辑（数据点 >100 个时采样）
  - **验证**：
    - [ ] UseCase 在 IO 线程执行
    - [ ] 错误处理正确
    - [ ] 数据采样逻辑正确
    - [ ] Flow 数据流正常
  - **产物**：`GetMemoryCurveUseCase.kt`

- [ ] T132 [ST-004] 在 `app/src/main/java/com/jacky/verity/statistics/viewmodel/` 中实现 MemoryCurveViewModel（或扩展 StatisticsViewModel）
  - **依赖**：T131
  - **步骤**：
    - 1) 创建 `MemoryCurveViewModel`，依赖 GetMemoryCurveUseCase
    - 2) 定义 UI 状态（Loading、Success、Error、Empty）
    - 3) 实现 `loadMemoryCurve(wordId: String?, timeRange: TimeRange)` 方法
    - 4) 使用 `viewModelScope` 启动协程
    - 5) 处理加载状态和错误状态
    - 6) 支持单词选择（单个单词或所有单词）
  - **验证**：
    - [ ] ViewModel 状态管理正确
    - [ ] 单词选择功能正常
    - [ ] 加载状态和错误状态处理正确
  - **产物**：`MemoryCurveViewModel.kt`

- [ ] T133 [ST-004] 在 `app/src/main/java/com/jacky/verity/statistics/ui/` 中实现 MemoryCurveScreen
  - **依赖**：T132
  - **步骤**：
    - 1) 创建 `MemoryCurveScreen` Compose 函数
    - 2) 实现单词选择器（单个单词或所有单词）
    - 3) 实现时间范围选择器
    - 4) 使用 ChartRenderer 渲染记忆曲线图表
    - 5) 实现加载状态 UI（显示加载指示器）
    - 6) 实现错误状态 UI（显示错误提示和重试按钮）
    - 7) 实现空状态 UI（无数据时显示提示）
  - **验证**：
    - [ ] UI 与 ViewModel 正确集成
    - [ ] 记忆曲线图表正确显示
    - [ ] 单词选择和时间范围选择功能正常
    - [ ] 图表渲染时间 p95 ≤ 500ms（NFR-PERF-001）
  - **产物**：`MemoryCurveScreen.kt`

**检查点**：至此，Story ST-004 应具备完整功能且可独立测试，记忆曲线展示功能可用

---

## 阶段 7：Story ST-005 - 实现报告生成功能（类型：Functional）

**目标**：用户能够生成和查看报告，报告内容完整准确，生成时间 p95 ≤ 2 秒

**验证方式（高层）**：
- 用户能够生成和查看报告，报告生成时间 p95 ≤ 2 秒

**覆盖 FR/NFR**：FR-004、FR-007；NFR-PERF-001、NFR-REL-001

### ST-005 任务

- [ ] T140 [ST-005] 在 `app/src/main/java/com/jacky/verity/statistics/domain/usecase/` 中实现 GenerateReportUseCase
  - **依赖**：T100、T120
  - **步骤**：
    - 1) 创建 `GenerateReportUseCase`，依赖 StatisticsRepository
    - 2) 实现 `invoke(type: ReportType, timeRange: TimeRange, onProgress: (Int) -> Unit): Flow<Result<LearningReport>>`
    - 3) 在 IO 线程执行报告生成
    - 4) 实现报告生成逻辑（查询数据、聚合统计、计算趋势）
    - 5) 实现进度回调（0%、30%、60%、80%、100%）
    - 6) 处理生成超时（10 秒超时）
    - 7) 处理生成失败和错误返回
  - **验证**：
    - [ ] UseCase 在 IO 线程执行
    - [ ] 报告生成逻辑正确
    - [ ] 进度回调正常
    - [ ] 生成超时处理正确
    - [ ] 错误处理完善
  - **产物**：`GenerateReportUseCase.kt`

- [ ] T141 [ST-005] 在 `app/src/main/java/com/jacky/verity/statistics/viewmodel/` 中实现 ReportViewModel
  - **依赖**：T140
  - **步骤**：
    - 1) 创建 `ReportViewModel`，依赖 GenerateReportUseCase
    - 2) 定义 UI 状态（Idle、Generating、Success、Error）
    - 3) 实现 `generateReport(type: ReportType, timeRange: TimeRange)` 方法
    - 4) 使用 `viewModelScope` 启动协程
    - 5) 处理生成进度（显示进度条）
    - 6) 处理生成成功和失败状态
  - **验证**：
    - [ ] ViewModel 状态管理正确
    - [ ] 报告生成功能正常
    - [ ] 进度显示正确
    - [ ] 生成成功和失败状态处理正确
  - **产物**：`ReportViewModel.kt`

- [ ] T142 [ST-005] 在 `app/src/main/java/com/jacky/verity/statistics/ui/` 中实现 ReportScreen
  - **依赖**：T141
  - **步骤**：
    - 1) 创建 `ReportScreen` Compose 函数
    - 2) 实现报告类型选择器（日报、周报、月报）
    - 3) 实现时间范围选择器
    - 4) 实现报告生成按钮
    - 5) 实现生成进度 UI（显示进度条和百分比）
    - 6) 实现报告展示 UI（显示统计数据、趋势图表）
    - 7) 实现错误状态 UI（显示错误提示和重试按钮）
    - 8) 实现空状态 UI（无数据时显示提示）
  - **验证**：
    - [ ] UI 与 ViewModel 正确集成
    - [ ] 报告生成功能正常
    - [ ] 报告内容完整准确
    - [ ] 报告生成时间 p95 ≤ 2 秒（NFR-PERF-001）
  - **产物**：`ReportScreen.kt`

**检查点**：至此，Story ST-005 应具备完整功能且可独立测试，报告生成功能可用

---

## 阶段 8：Story ST-006 - 实现空状态和错误处理（类型：Functional）

**目标**：用户能够看到友好的空状态提示和错误提示，错误处理完善

**验证方式（高层）**：
- 无学习数据时显示空状态提示，查询失败时显示错误提示并允许重试

**覆盖 FR/NFR**：FR-006、FR-007；NFR-OBS-002、NFR-REL-001

### ST-006 任务

- [ ] T150 [ST-006] 在 `app/src/main/java/com/jacky/verity/statistics/ui/StatisticsScreen.kt` 中实现空状态 UI
  - **依赖**：T103
  - **步骤**：
    - 1) 检测无学习数据的情况（查询结果为空）
    - 2) 实现空状态 UI（显示图标、提示文字、引导按钮）
    - 3) 提示用户开始学习，说明统计数据将在学习后生成
    - 4) 提供跳转到学习页面的按钮（如需要）
  - **验证**：
    - [ ] 无学习数据时显示空状态提示（FR-006）
    - [ ] 空状态 UI 友好且引导明确
  - **产物**：`StatisticsScreen.kt`（更新）

- [ ] T151 [ST-006] 在 `app/src/main/java/com/jacky/verity/statistics/ui/StatisticsScreen.kt` 中实现错误处理 UI
  - **依赖**：T103
  - **步骤**：
    - 1) 检测查询失败的情况（数据库查询失败、计算失败）
    - 2) 实现错误状态 UI（显示错误图标、错误消息、重试按钮）
    - 3) 实现重试功能（点击重试按钮重新查询）
    - 4) 错误消息用户友好，提供明确的错误原因
  - **验证**：
    - [ ] 查询失败时显示错误提示（FR-007）
    - [ ] 错误提示用户友好
    - [ ] 重试功能正常
  - **产物**：`StatisticsScreen.kt`（更新）

- [ ] T152 [ST-006] 在 `app/src/main/java/com/jacky/verity/statistics/viewmodel/StatisticsViewModel.kt` 中实现错误处理和重试逻辑
  - **依赖**：T102
  - **步骤**：
    - 1) 处理查询失败的错误（捕获异常并转换为错误状态）
    - 2) 实现重试逻辑（重新调用 UseCase）
    - 3) 记录错误日志（错误类型、查询参数、错误详情）
    - 4) 处理超时错误（显示超时提示）
  - **验证**：
    - [ ] 错误处理逻辑正确
    - [ ] 重试功能正常
    - [ ] 错误日志记录正确（NFR-OBS-002）
  - **产物**：`StatisticsViewModel.kt`（更新）

- [ ] T153 [ST-006] 在其他页面（ReportScreen、MemoryCurveScreen）中实现空状态和错误处理
  - **依赖**：T142、T133
  - **步骤**：
    - 1) 在 ReportScreen 中实现空状态和错误处理 UI
    - 2) 在 MemoryCurveScreen 中实现空状态和错误处理 UI
    - 3) 确保错误处理一致性和用户体验一致性
  - **验证**：
    - [ ] 所有页面都有空状态和错误处理
    - [ ] 错误处理一致性良好
  - **产物**：`ReportScreen.kt`（更新）、`MemoryCurveScreen.kt`（更新）

**检查点**：至此，Story ST-006 应具备完整功能且可独立测试，空状态和错误处理功能可用

---

## 阶段 9：Story ST-007 - 实现性能优化和降级策略（类型：Optimization）

**目标**：统计数据查询和图表渲染性能满足要求，降级策略有效

**验证方式（高层）**：
- 查询超时时限制查询时间范围，图表数据点 >100 个时进行数据采样

**覆盖 FR/NFR**：NFR-PERF-002、NFR-PERF-003、NFR-MEM-001

### ST-007 任务

- [ ] T160 [ST-007] 在 `app/src/main/java/com/jacky/verity/statistics/data/repository/StatisticsRepositoryImpl.kt` 中实现查询超时降级策略
  - **依赖**：T100
  - **步骤**：
    - 1) 检测查询超时（>5 秒）
    - 2) 实现降级策略：限制查询时间范围（最多 3 个月）
    - 3) 实现分页加载数据（如果数据量过大）
    - 4) 显示加载提示和进度
    - 5) 记录超时日志
  - **验证**：
    - [ ] 查询超时时限制查询时间范围（NFR-PERF-002）
    - [ ] 分页加载功能正常
    - [ ] 加载提示显示正确
  - **产物**：`StatisticsRepositoryImpl.kt`（更新）

- [ ] T161 [ST-007] 在 `app/src/main/java/com/jacky/verity/statistics/ui/chart/ChartRenderer.kt` 中实现数据采样和降级策略
  - **依赖**：T121
  - **步骤**：
    - 1) 检测数据点数量（>100 个）
    - 2) 实现数据采样逻辑（每 10 个点取 1 个）
    - 3) 限制显示数据点数量（最多 100 个）
    - 4) 检测内存不足的情况
    - 5) 实现降级策略：内存不足时使用简化图表（文本列表）
    - 6) 记录降级日志（数据点数量、是否降级）
  - **验证**：
    - [ ] 数据采样逻辑正确（数据点 >100 个时采样）（NFR-PERF-003）
    - [ ] 内存不足时降级为简化图表
    - [ ] 降级日志记录正确
  - **产物**：`ChartRenderer.kt`（更新）

- [ ] T162 [ST-007] 实现性能测试和验证（路径：`app/src/androidTest/java/com/jacky/verity/statistics/`）
  - **依赖**：T160、T161
  - **步骤**：
    - 1) 编写性能测试验证查询超时降级策略
    - 2) 编写性能测试验证数据采样逻辑
    - 3) 编写性能测试验证图表渲染性能（p95 ≤ 500ms）
    - 4) 编写内存测试验证内存占用（峰值 ≤ 50MB）
  - **验证**：
    - [ ] 查询超时降级策略有效
    - [ ] 数据采样逻辑正确
    - [ ] 图表渲染时间 p95 ≤ 500ms（NFR-PERF-001）
    - [ ] 内存占用峰值 ≤ 50MB（NFR-MEM-001）
  - **产物**：`StatisticsPerformanceTest.kt`

**检查点**：至此，Story ST-007 应具备完整功能且可独立测试，性能优化和降级策略有效

---

## 阶段 10：Story ST-008 - 实现可观测性和日志记录（类型：Infrastructure）

**目标**：关键操作都有日志记录，性能指标可观测，错误日志便于排查

**验证方式（高层）**：
- 关键操作都有日志记录，性能指标可观测

**覆盖 FR/NFR**：NFR-OBS-001、NFR-OBS-002、NFR-OBS-003

### ST-008 任务

- [ ] T170 [ST-008] 在 `app/src/main/java/com/jacky/verity/statistics/data/repository/StatisticsRepositoryImpl.kt` 中实现统计数据查看事件日志
  - **依赖**：T100
  - **步骤**：
    - 1) 记录统计数据查看事件（页面类型、时间范围、查看时长）
    - 2) 记录查询操作日志（查询参数、查询耗时、结果数量）
    - 3) 使用结构化日志格式
    - 4) 记录缓存命中率
  - **验证**：
    - [ ] 统计数据查看事件日志记录正确（NFR-OBS-001）
    - [ ] 查询操作日志记录正确
    - [ ] 日志格式结构化
  - **产物**：`StatisticsRepositoryImpl.kt`（更新）

- [ ] T171 [ST-008] 在 `app/src/main/java/com/jacky/verity/statistics/domain/usecase/GenerateReportUseCase.kt` 中实现报告生成事件日志
  - **依赖**：T140
  - **步骤**：
    - 1) 记录报告生成事件（报告类型、生成耗时、是否成功）
    - 2) 记录报告生成进度（0%、30%、60%、80%、100%）
    - 3) 记录报告生成失败原因（如适用）
  - **验证**：
    - [ ] 报告生成事件日志记录正确（NFR-OBS-001）
    - [ ] 报告生成进度日志记录正确
  - **产物**：`GenerateReportUseCase.kt`（更新）

- [ ] T172 [ST-008] 在 `app/src/main/java/com/jacky/verity/statistics/ui/chart/ChartRenderer.kt` 中实现图表渲染性能指标日志
  - **依赖**：T121
  - **步骤**：
    - 1) 记录图表渲染性能指标（渲染耗时、数据点数量、是否降级）
    - 2) 记录图表类型（折线图、柱状图）
    - 3) 记录内存使用情况（如适用）
  - **验证**：
    - [ ] 图表渲染性能指标日志记录正确（NFR-OBS-003）
    - [ ] 性能指标可观测
  - **产物**：`ChartRenderer.kt`（更新）

- [ ] T173 [ST-008] 在 `app/src/main/java/com/jacky/verity/statistics/data/repository/StatisticsRepositoryImpl.kt` 中实现错误日志记录
  - **依赖**：T100
  - **步骤**：
    - 1) 记录统计数据查询失败事件（错误类型、查询参数、错误详情）
    - 2) 记录计算失败事件（错误类型、计算参数、错误详情）
    - 3) 记录缓存错误事件（如适用）
    - 4) 错误日志包含堆栈信息（便于排查）
  - **验证**：
    - [ ] 错误日志记录正确（NFR-OBS-002）
    - [ ] 错误日志包含足够信息便于排查
  - **产物**：`StatisticsRepositoryImpl.kt`（更新）

**检查点**：至此，Story ST-008 应具备完整功能且可独立测试，可观测性和日志记录功能可用

---

## 依赖关系与执行顺序

### 阶段依赖

- **环境搭建（阶段 1）**：无依赖——可立即启动
- **核心基础（阶段 2）**：依赖环境搭建完成——阻塞所有 Story
- **Story（阶段 3+）**：均依赖核心基础阶段完成
    - 完成后，Story 可并行推进（如有资源）
    - 或按优先级顺序串行推进（ST-001 → ST-002 → ST-003 → ST-004 → ST-005 → ST-006 → ST-007 → ST-008）
- **优化完善（阶段 10）**：依赖所有目标 Story 完成

### Story 依赖

- **ST-001**：依赖阶段 2 完成、FEAT-007 用户数据管理模块
- **ST-002**：依赖 ST-001
- **ST-003**：依赖 ST-001、Vico 图表库
- **ST-004**：依赖 FEAT-002 间隔重复算法引擎、ST-003
- **ST-005**：依赖 ST-001、ST-003
- **ST-006**：依赖 ST-001（可与 ST-001 并行开发）
- **ST-007**：依赖 ST-001、ST-003
- **ST-008**：依赖 ST-001、ST-003、ST-005（可与功能开发并行）

### 单 Story 内部顺序

- 数据层开发先于领域层
- 领域层开发先于 ViewModel 层
- ViewModel 层开发先于 UI 层
- 核心功能实现先于集成工作
- 本 Story 完成后，再推进下一 Story

### 并行执行场景

- 所有标记 [P] 的环境搭建任务可并行
- 所有标记 [P] 的核心基础任务可并行（阶段 2 内）
- 核心基础阶段完成后，ST-001 和 ST-006 可并行启动（ST-006 可与 ST-001 并行开发）
- ST-008 可与功能开发并行（标记为可并行）
- 单 Story 下所有标记 [P] 的任务可并行

---

## 并行示例：Story ST-001

```bash
# 批量启动 ST-001 的可并行任务（示例）：
任务："[ST-001] 创建 StatisticsRepository 接口和实现，路径：app/src/main/java/com/jacky/verity/statistics/data/repository/"
任务："[ST-001] 实现 GetStatisticsUseCase，路径：app/src/main/java/com/jacky/verity/statistics/domain/usecase/"
```

---

## 落地策略

### 先完成 MVP（优先完成关键 Story 集合）

1. 完成阶段 1：环境搭建
2. 完成阶段 2：核心基础（关键——阻塞所有 Story）
3. 完成阶段 3：Story ST-001（统计数据查询功能）
4. 完成阶段 8：Story ST-006（空状态和错误处理）
5. **暂停并验证**：独立验证 ST-001 和 ST-006
6. 如就绪，进行部署/演示

### 增量交付

1. 完成环境搭建 + 核心基础 → 基础层就绪
2. 新增 ST-001 + ST-006 → 独立验证 → 部署/演示（MVP！）
3. 新增 ST-002 → 独立验证 → 部署/演示（缓存优化）
4. 新增 ST-003 → 独立验证 → 部署/演示（趋势图表）
5. 新增 ST-004 → 独立验证 → 部署/演示（记忆曲线）
6. 新增 ST-005 → 独立验证 → 部署/演示（报告生成）
7. 新增 ST-007 → 独立验证 → 部署/演示（性能优化）
8. 新增 ST-008 → 独立验证 → 部署/演示（可观测性）
9. 每个 Story 均需在不破坏已有 Story 的前提下新增价值

### 团队并行策略

多开发者协作场景：

1. 团队共同完成环境搭建 + 核心基础
2. 核心基础完成后：
    - 开发者 A：负责 ST-001（统计数据查询）
    - 开发者 B：负责 ST-006（空状态和错误处理，可与 ST-001 并行）
    - 开发者 C：负责 ST-002（缓存机制，依赖 ST-001）
3. ST-001 完成后：
    - 开发者 A：负责 ST-003（趋势图表）
    - 开发者 B：负责 ST-005（报告生成，依赖 ST-001、ST-003）
    - 开发者 C：负责 ST-004（记忆曲线，依赖 ST-003）
4. 所有 Story 完成后：
    - 开发者 A：负责 ST-007（性能优化）
    - 开发者 B：负责 ST-008（可观测性，可并行）
5. 各 Story 独立完成并集成

---

## 备注

- [P] 标记的任务 = 涉及不同文件，无依赖关系
- [ST-xxx] 标签将任务关联至 Plan 的 Story，便于追溯
- 每个 Story 需可独立完成、独立验证
- 实现前验证测试用例执行失败
- 完成单个任务或逻辑分组后提交代码
- 可在任意检查点暂停，独立验证对应 Story
- 避免：模糊的任务描述、同一文件冲突、破坏独立性的跨 Story 依赖
- **关键依赖**：本 Feature 依赖 FEAT-007 用户数据管理模块和 FEAT-002 间隔重复算法引擎，需要确保这些 Feature 已实现或提供 Mock 接口

---

## 任务汇总

- **任务总数**：73 个任务
- **各 Story 对应的任务数量**：
  - ST-001：5 个任务
  - ST-002：3 个任务
  - ST-003：4 个任务
  - ST-004：4 个任务
  - ST-005：3 个任务
  - ST-006：4 个任务
  - ST-007：3 个任务
  - ST-008：4 个任务
- **识别出的可并行执行机会**：
  - 环境搭建阶段：T012 可并行
  - 核心基础阶段：T021、T022 可并行
  - ST-001 和 ST-006 可并行开发
  - ST-008 可与功能开发并行
- **每个 Story 的验证方式摘要（含指标阈值）**：
  - ST-001：查询时间 p95 ≤ 1 秒，查询成功率 ≥ 99.5%，数据准确性误差 ≤ 0.1%
  - ST-002：缓存命中率 ≥ 80%，缓存大小 ≤ 10MB，缓存失效时间 1 小时
  - ST-003：图表渲染时间 p95 ≤ 500ms
  - ST-004：图表渲染时间 p95 ≤ 500ms
  - ST-005：报告生成时间 p95 ≤ 2 秒
  - ST-006：空状态和错误处理功能正常
  - ST-007：查询超时降级、数据采样、内存占用 ≤ 50MB
  - ST-008：关键操作日志记录、性能指标可观测
- **建议的 MVP 范围**：ST-001（统计数据查询）+ ST-006（空状态和错误处理）
