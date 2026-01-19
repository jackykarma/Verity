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
> - 若 plan.md 已包含 Story 二层详细设计（Story Detailed Design / L2）：每个 Task 必须提供**设计引用**（指向 plan.md 对应 ST-xxx 的小节/图表/异常矩阵）。

## 变更记录（增量变更）

| 版本 | 日期 | 变更范围（Feature/Story/Task） | 变更摘要 | 影响模块 | 是否需要回滚设计 |
|---|---|---|---|---|---|
| v0.1.0 | 2026-01-19 | Feature | 初始版本：基于 plan.md 的 Story Breakdown 生成 tasks.md |  | 否 |

## 阶段 0：准备

**目标**：对齐版本、冻结设计输入，避免 Implement 期返工

- [ ] T001 在 `specs/epics/EPIC-001-word-memory-app/features/FEAT-005-learning-progress-stats/` 中核对 `spec.md`、`plan.md` 的 Version 字段一致性并补齐变更记录
  - **依赖**：无
  - **步骤**：
    - 1) 确认 `Feature Version` 为 v0.1.0
    - 2) 确认 `Plan Version` 为 v0.1.0
    - 3) 确认 Plan 的 Story Breakdown 已完成（ST-001 至 ST-008）
    - 4) 确认 Story Detailed Design 已包含 ST-001 和 ST-002
  - **验证**：
    - [ ] tasks.md 中 `Plan Version` 与 plan.md 一致（v0.1.0）
    - [ ] tasks.md 中 `Feature Version` 与 spec.md 一致（v0.1.0）
  - **产物**：`spec.md`、`plan.md`、`tasks.md`

---

## 阶段 1：环境搭建（共享基础设施）

**目标**：项目初始化与基础结构搭建

- [ ] T010 按照 plan.md:B7 的"源代码结构"创建项目目录结构（路径：`app/src/main/java/com/jacky/verity/statistics/`）
  - **依赖**：T001
  - **设计引用**：plan.md:B7 源代码结构
  - **步骤**：
    - 1) 创建 `statistics/ui/` 目录（StatisticsScreen、ReportScreen、MemoryCurveScreen、chart/）
    - 2) 创建 `statistics/viewmodel/` 目录（StatisticsViewModel、ReportViewModel）
    - 3) 创建 `statistics/domain/usecase/` 目录（GetStatisticsUseCase、GenerateReportUseCase、GetMemoryCurveUseCase）
    - 4) 创建 `statistics/domain/model/` 目录（LearningStatistics、LearningReport、MemoryCurveData）
    - 5) 创建 `statistics/data/repository/` 目录（StatisticsRepository）
    - 6) 创建 `statistics/data/cache/` 目录（StatisticsCache）
  - **验证**：
    - [ ] 目录结构与 plan.md:B7 完全一致
  - **产物**：相关目录结构

- [ ] T011 在 `app/build.gradle.kts` 中添加项目依赖（路径：`app/build.gradle.kts`）
  - **依赖**：T010
  - **设计引用**：plan.md:B1 技术背景
  - **步骤**：
    - 1) 添加 Jetpack Compose 依赖（UI 层）
    - 2) 添加 Room 数据库依赖（通过 FEAT-007）
    - 3) 添加 Coroutines、Flow 依赖（异步处理）
    - 4) 添加 Vico 图表库依赖（`com.patrykandpatrick.vico:compose:1.x.x`）
    - 5) 同步 Gradle 构建
  - **验证**：
    - [ ] 基础构建可通过（`./gradlew build`）
    - [ ] 所有依赖成功下载
  - **产物**：`app/build.gradle.kts`

- [ ] T012 [P] 配置代码检查与格式化工具（路径：`.editorconfig`、`gradle/libs.versions.toml`）
  - **依赖**：T011
  - **步骤**：
    - 1) 配置 Kotlin 代码格式化规则
    - 2) 配置 Compose 代码检查规则
    - 3) 确保与项目现有规范一致
  - **验证**：
    - [ ] `./gradlew ktlintCheck` 可通过
    - [ ] `./gradlew ktlintFormat` 可运行
  - **产物**：`.editorconfig`、相关配置文件

---

## 阶段 2：核心基础（阻塞性前置条件，阻塞所有 Story）

**目标**：所有用户故事实现前必须完成的核心基础设施搭建

**⚠️ 关键**：此阶段完成前，任何用户故事相关工作均不可启动

- [ ] T020 在 `app/src/main/java/com/jacky/verity/statistics/domain/model/` 中创建数据模型（路径：`statistics/domain/model/`）
  - **依赖**：T011
  - **设计引用**：plan.md:B3.2 数据实体定义、plan.md:Story Detailed Design:ST-001:3 核心接口与数据契约
  - **步骤**：
    - 1) 创建 `LearningStatistics.kt`：学习统计数据模型（学习天数、学习单词数量、复习单词数量、平均正确率、总学习时长、时间范围）
    - 2) 创建 `LearningTrendData.kt`：学习趋势数据模型（日期、学习时长、学习单词数量、正确率）
    - 3) 创建 `MemoryCurveData.kt`：记忆曲线数据模型（单词ID、时间点、记忆强度）
    - 4) 创建 `LearningReport.kt`：学习报告模型（报告类型、时间范围、统计数据、趋势数据、生成时间）
    - 5) 创建 `TimeRange.kt`：时间范围数据类（开始时间、结束时间）
    - 6) 创建 `ReportType.kt`：报告类型枚举（Daily、Weekly、Monthly）
    - 7) 创建 `TrendMetric.kt`：趋势指标枚举（LearningTime、WordsLearned、Accuracy）
  - **验证**：
    - [ ] 数据模型编译通过
    - [ ] 数据模型字段与 plan.md:B3.2 一致
  - **产物**：`statistics/domain/model/*.kt`

- [ ] T021 在 `app/src/main/java/com/jacky/verity/statistics/data/repository/` 中创建错误类型（路径：`statistics/data/repository/StatisticsError.kt`）
  - **依赖**：T020
  - **设计引用**：plan.md:A3.4:StatisticsRepository:UML类图、plan.md:Story Detailed Design:ST-001:3 核心接口与数据契约
  - **步骤**：
    - 1) 创建 `StatisticsError` Sealed Class（QueryError、CalculationError、CacheError）
    - 2) 为每个错误类型添加错误消息和错误码
    - 3) 创建 `ReportError` Sealed Class（GenerationError、DataError、TimeoutError）
  - **验证**：
    - [ ] 错误类型编译通过
    - [ ] 错误类型与 plan.md 设计一致
  - **产物**：`statistics/data/repository/StatisticsError.kt`、`statistics/domain/ReportError.kt`

- [ ] T022 [P] 配置依赖注入（路径：`app/src/main/java/com/jacky/verity/statistics/`）
  - **依赖**：T021
  - **步骤**：
    - 1) 配置 Hilt/Dagger 依赖注入（如项目已使用）
    - 2) 为 StatisticsRepository、StatisticsCache 创建 Module
    - 3) 为 UseCase 创建 Factory/Provider
  - **验证**：
    - [ ] 依赖注入配置编译通过
    - [ ] 可以正确注入所有依赖
  - **产物**：依赖注入配置文件

**检查点**：基础层就绪——用户故事实现可并行启动

---

## 阶段 3：Story ST-001 - 实现统计数据查询功能（类型：Functional）

**目标**：用户能够查看基础统计数据，数据准确可靠，查询响应迅速

**验证方式（高层）**：用户能够成功查看统计数据，数据准确，查询时间 p95 ≤ 1 秒（引用 FR-001、FR-005；NFR-PERF-001、NFR-REL-001、NFR-REL-002）

### ST-001 任务

- [ ] T100 [P] [ST-001] 在 `app/src/main/java/com/jacky/verity/statistics/data/cache/` 中实现 StatisticsCache（路径：`statistics/data/cache/StatisticsCache.kt`、`statistics/data/cache/CacheEntry.kt`）
  - **依赖**：T022
  - **设计引用**：plan.md:A3.4:StatisticsRepository:UML类图、plan.md:Story Detailed Design:ST-002:4 静态结构设计
  - **步骤**：
    - 1) 创建 `CacheEntry.kt` 数据类（data、timestamp、expiryMs、isExpired()）
    - 2) 创建 `StatisticsCache` 接口（get、put、clear、removeExpired）
    - 3) 实现 `StatisticsCacheImpl`：使用 ConcurrentHashMap 存储缓存，实现线程安全
    - 4) 实现缓存过期检查（1 小时失效）
    - 5) 实现缓存大小限制（最多 10MB）
    - 6) 实现 LRU 清理策略（内存不足时）
  - **验证**：
    - [ ] 缓存命中/未命中逻辑正确
    - [ ] 缓存过期时间准确（1 小时）
    - [ ] 缓存大小限制有效（≤ 10MB）
    - [ ] 线程安全测试通过
  - **产物**：`statistics/data/cache/StatisticsCache.kt`、`statistics/data/cache/CacheEntry.kt`

- [ ] T101 [ST-001] 在 `app/src/main/java/com/jacky/verity/statistics/data/repository/` 中实现 StatisticsRepository 接口（路径：`statistics/data/repository/StatisticsRepository.kt`）
  - **依赖**：T100
  - **设计引用**：plan.md:A3.4:StatisticsRepository:UML类图、plan.md:Story Detailed Design:ST-001:4 静态结构设计
  - **步骤**：
    - 1) 定义 `StatisticsRepository` 接口（getStatistics、getTrendData、getMemoryCurve）
    - 2) 接口方法返回 `Result<LearningStatistics>` 和 `Flow<List<LearningTrendData>>`
    - 3) 接口方法支持协程（suspend 函数）
  - **验证**：
    - [ ] 接口编译通过
    - [ ] 接口签名与 plan.md:A3.4 一致
  - **产物**：`statistics/data/repository/StatisticsRepository.kt`

- [ ] T102 [ST-001] 在 `app/src/main/java/com/jacky/verity/statistics/data/repository/` 中实现 StatisticsRepositoryImpl（路径：`statistics/data/repository/StatisticsRepositoryImpl.kt`）
  - **依赖**：T101、FEAT-007（UserDataRepository 接口）
  - **设计引用**：plan.md:A3.4:StatisticsRepository:UML类图、plan.md:A3.4:StatisticsRepository:时序-成功、plan.md:A3.4:StatisticsRepository:时序-异常、plan.md:Story Detailed Design:ST-001:5 动态交互设计、plan.md:Story Detailed Design:ST-001:6 异常场景矩阵
  - **步骤**：
    - 1) 实现 `StatisticsRepositoryImpl` 类，注入 UserDataRepository、AlgorithmRepository、StatisticsCache
    - 2) 实现 `getStatistics(timeRange)`：先检查缓存，缓存未命中时查询数据库
    - 3) 实现缓存查询逻辑（检查缓存键、过期时间）
    - 4) 调用 UserDataRepository.getLearningRecords() 查询学习记录
    - 5) 实现 `calculateStatistics(records)`：聚合计算统计数据（学习天数、单词数量、正确率等）
    - 6) 实现查询超时处理（>5秒）：取消查询，返回超时错误
    - 7) 实现错误处理：捕获 SQLException、TimeoutException、计算异常
    - 8) 实现缓存更新：查询成功后更新缓存
    - 9) 实现日志记录：记录查询操作、错误操作、缓存命中率
  - **验证**：
    - [ ] 统计数据查询成功（有数据）
    - [ ] 统计数据查询失败（无数据）：返回空状态
    - [ ] 查询超时（>5秒）：返回超时错误
    - [ ] 查询失败（SQLException）：返回查询错误
    - [ ] 数据计算失败（如除零错误）：返回计算错误
    - [ ] 缓存命中/未命中逻辑正确
    - [ ] 统计数据准确性测试通过（误差 ≤ 0.1%）
  - **产物**：`statistics/data/repository/StatisticsRepositoryImpl.kt`

- [ ] T103 [ST-001] 在 `app/src/main/java/com/jacky/verity/statistics/domain/usecase/` 中实现 GetStatisticsUseCase（路径：`statistics/domain/usecase/GetStatisticsUseCase.kt`）
  - **依赖**：T102
  - **设计引用**：plan.md:Story Detailed Design:ST-001:3 核心接口与数据契约、plan.md:Story Detailed Design:ST-001:5 动态交互设计、plan.md:Story Detailed Design:ST-001:7 并发/生命周期/资源管理
  - **步骤**：
    - 1) 创建 `GetStatisticsUseCase` 类，注入 StatisticsRepository
    - 2) 实现 `invoke(timeRange)`：返回 `Flow<LearningStatistics>`
    - 3) 使用 `Dispatchers.IO` 在 IO 线程执行
    - 4) 实现协程取消处理：取消时释放资源，不更新 UI 状态
    - 5) 实现时间范围验证：结束时间 > 开始时间
    - 6) 处理 Repository 返回的 Result，转换为 Flow
  - **验证**：
    - [ ] UseCase 调用 Repository 成功
    - [ ] 协程取消时正确处理
    - [ ] 时间范围无效时返回错误
    - [ ] Flow 正确发射数据
  - **产物**：`statistics/domain/usecase/GetStatisticsUseCase.kt`

- [ ] T104 [ST-001] 在 `app/src/main/java/com/jacky/verity/statistics/ui/viewmodel/` 中实现 StatisticsViewModel（路径：`statistics/ui/viewmodel/StatisticsViewModel.kt`）
  - **依赖**：T103
  - **设计引用**：plan.md:Story Detailed Design:ST-001:4 静态结构设计、plan.md:Story Detailed Design:ST-001:5 动态交互设计、plan.md:Story Detailed Design:ST-001:7 并发/生命周期/资源管理
  - **步骤**：
    - 1) 创建 `StatisticsViewModel` 类，继承 ViewModel，注入 GetStatisticsUseCase
    - 2) 创建 `StatisticsUiState` 数据类（isLoading、data、error、isEmpty）
    - 3) 创建 `statistics: StateFlow<StatisticsUiState>` 状态
    - 4) 实现 `loadStatistics(timeRange)`：调用 UseCase，更新状态
    - 5) 实现状态更新：加载中、成功、失败、空状态
    - 6) 使用 `viewModelScope.launch(Dispatchers.IO)` 启动协程
    - 7) 实现 `retry()`：重新加载统计数据
    - 8) 实现生命周期处理：页面旋转时保存状态（SavedStateHandle）
  - **验证**：
    - [ ] ViewModel 状态管理正确
    - [ ] 加载中状态正确更新
    - [ ] 成功状态正确更新
    - [ ] 失败状态正确更新
    - [ ] 空状态正确更新
    - [ ] 重试功能正常
    - [ ] 页面旋转后状态恢复
  - **产物**：`statistics/ui/viewmodel/StatisticsViewModel.kt`、`statistics/ui/viewmodel/StatisticsUiState.kt`

- [ ] T105 [ST-001] 在 `app/src/main/java/com/jacky/verity/statistics/ui/` 中实现 StatisticsScreen UI（路径：`statistics/ui/StatisticsScreen.kt`）
  - **依赖**：T104
  - **设计引用**：plan.md:A4:流程1 统计数据查询流程、plan.md:Story Detailed Design:ST-001:2 代码落点与边界
  - **步骤**：
    - 1) 创建 `StatisticsScreen` Composable 函数
    - 2) 注入 StatisticsViewModel
    - 3) 使用 `collectAsState()` 观察 ViewModel 状态
    - 4) 实现时间范围选择器（最近 7 天、30 天、90 天）
    - 5) 实现统计数据展示：学习天数、学习单词数量、复习单词数量、平均正确率
    - 6) 实现加载状态展示：显示 Loading 指示器
    - 7) 实现空状态展示：显示空状态提示和引导按钮
    - 8) 实现错误状态展示：显示错误提示和重试按钮
    - 9) 实现时间范围切换：调用 ViewModel.loadStatistics()
  - **验证**：
    - [ ] UI 显示统计数据正确
    - [ ] 加载状态显示正确
    - [ ] 空状态显示正确（FR-006）
    - [ ] 错误状态显示正确
    - [ ] 时间范围切换正常（FR-005）
    - [ ] 重试功能正常
    - [ ] UI 性能测试通过（页面加载 p95 ≤ 1 秒）（NFR-PERF-001）
  - **产物**：`statistics/ui/StatisticsScreen.kt`

- [ ] T106 [ST-001] 编写单元测试（路径：`app/src/test/java/com/jacky/verity/statistics/`）
  - **依赖**：T105
  - **设计引用**：plan.md:Story Detailed Design:ST-001:8 验证与测试设计
  - **步骤**：
    - 1) 创建 `StatisticsRepositoryTest.kt`：测试统计数据查询（成功、失败、超时）、缓存命中/未命中、数据计算
    - 2) 创建 `GetStatisticsUseCaseTest.kt`：测试用例调用 Repository、错误处理、Flow 发射
    - 3) 创建 `StatisticsViewModelTest.kt`：测试 ViewModel 状态管理、用户交互、错误处理
    - 4) 创建 `StatisticsCacheTest.kt`：测试缓存命中/未命中、过期处理、LRU 清理、并发访问
  - **验证**：
    - [ ] 所有单元测试通过
    - [ ] 测试覆盖率 ≥ 80%
    - [ ] 统计数据准确性测试通过（误差 ≤ 0.1%）（NFR-REL-002）
  - **产物**：`app/src/test/java/com/jacky/verity/statistics/**/*Test.kt`

- [ ] T107 [ST-001] 编写集成测试（路径：`app/src/androidTest/java/com/jacky/verity/statistics/`）
  - **依赖**：T106
  - **设计引用**：plan.md:Story Detailed Design:ST-001:8 验证与测试设计
  - **步骤**：
    - 1) 创建 `StatisticsIntegrationTest.kt`：测试 UI → ViewModel → UseCase → Repository → 数据库完整链路
    - 2) 测试场景：查询成功、查询失败、无数据、超时、并发查询
    - 3) 性能测试：使用性能分析工具测量统计数据页面加载时间（p95 ≤ 1 秒）（NFR-PERF-001）
    - 4) 可靠性测试：自动化测试统计数据查询成功率（≥ 99.5%）（NFR-REL-001）
  - **验证**：
    - [ ] 所有集成测试通过
    - [ ] 性能测试通过（p95 ≤ 1 秒）
    - [ ] 可靠性测试通过（成功率 ≥ 99.5%）
  - **产物**：`app/src/androidTest/java/com/jacky/verity/statistics/StatisticsIntegrationTest.kt`

**检查点**：至此，用户故事 ST-001 应具备完整功能且可独立测试

---

## 阶段 4：Story ST-002 - 实现统计数据缓存机制（类型：Infrastructure）

**目标**：统计数据缓存命中率 ≥ 80%，缓存大小 ≤ 10MB，缓存失效时间 1 小时

**验证方式（高层）**：缓存命中率 ≥ 80%，缓存大小 ≤ 10MB，缓存失效时间 1 小时（引用 NFR-PERF-001、NFR-MEM-001、NFR-REL-003）

### ST-002 任务

- [ ] T110 [ST-002] 优化 StatisticsCache 实现（路径：`statistics/data/cache/StatisticsCacheImpl.kt`）
  - **依赖**：T100
  - **设计引用**：plan.md:Story Detailed Design:ST-002:4 静态结构设计、plan.md:Story Detailed Design:ST-002:5 动态交互设计
  - **步骤**：
    - 1) 优化缓存键生成策略（`statistics_${timeRange}` 格式）
    - 2) 实现缓存过期自动清理（查询时触发）
    - 3) 实现缓存大小监控（计算缓存总大小）
    - 4) 优化 LRU 清理策略（内存不足时优先清理最少使用的条目）
    - 5) 实现缓存命中率统计
  - **验证**：
    - [ ] 缓存命中率 ≥ 80%（NFR-REL-003）
    - [ ] 缓存大小 ≤ 10MB（NFR-MEM-001）
    - [ ] 缓存失效时间准确（1 小时）
    - [ ] LRU 清理策略有效
  - **产物**：`statistics/data/cache/StatisticsCacheImpl.kt`

- [ ] T111 [ST-002] 在 StatisticsRepositoryImpl 中集成缓存机制（路径：`statistics/data/repository/StatisticsRepositoryImpl.kt`）
  - **依赖**：T110、T102
  - **设计引用**：plan.md:A3.4:StatisticsRepository:时序-成功、plan.md:Story Detailed Design:ST-002:6 异常场景矩阵
  - **步骤**：
    - 1) 优化缓存查询逻辑（先查缓存，缓存未命中时查询数据库）
    - 2) 实现缓存写入逻辑（查询成功后更新缓存）
    - 3) 实现缓存过期检查（查询时自动清理过期缓存）
    - 4) 实现缓存大小限制（超过 10MB 时触发 LRU 清理）
    - 5) 记录缓存命中率日志
  - **验证**：
    - [ ] 缓存命中时查询响应时间 p95 ≤ 100ms（相比未缓存提升 10 倍）
    - [ ] 缓存未命中时正常查询数据库
    - [ ] 缓存过期时自动重新查询
    - [ ] 缓存大小限制有效
  - **产物**：`statistics/data/repository/StatisticsRepositoryImpl.kt`

- [ ] T112 [ST-002] 编写缓存机制测试（路径：`app/src/test/java/com/jacky/verity/statistics/data/cache/StatisticsCacheTest.kt`）
  - **依赖**：T111
  - **设计引用**：plan.md:Story Detailed Design:ST-002:8 验证与测试设计
  - **步骤**：
    - 1) 测试缓存命中/未命中逻辑
    - 2) 测试缓存过期处理
    - 3) 测试 LRU 清理策略
    - 4) 测试并发访问（线程安全）
    - 5) 测试缓存命中率（≥ 80%）
    - 6) 测试缓存大小限制（≤ 10MB）
  - **验证**：
    - [ ] 所有缓存测试通过
    - [ ] 缓存命中率 ≥ 80%
    - [ ] 缓存大小 ≤ 10MB
  - **产物**：`app/src/test/java/com/jacky/verity/statistics/data/cache/StatisticsCacheTest.kt`

**检查点**：至此，用户故事 ST-002 应具备完整功能且可独立测试

---

## 阶段 5：Story ST-003 - 实现学习趋势图表功能（类型：Functional）

**目标**：用户能够查看学习趋势图表，图表渲染流畅，数据准确

**验证方式（高层）**：用户能够查看学习趋势图表，图表渲染时间 p95 ≤ 500ms（引用 FR-002；NFR-PERF-001、NFR-MEM-001）

### ST-003 任务

- [ ] T120 [P] [ST-003] 在 `app/src/main/java/com/jacky/verity/statistics/domain/usecase/` 中实现 GetTrendDataUseCase（路径：`statistics/domain/usecase/GetTrendDataUseCase.kt`）
  - **依赖**：T102
  - **设计引用**：plan.md:A3.4:StatisticsRepository:UML类图
  - **步骤**：
    - 1) 创建 `GetTrendDataUseCase` 类，注入 StatisticsRepository
    - 2) 实现 `invoke(timeRange, metric)`：返回 `Flow<List<LearningTrendData>>`
    - 3) 调用 StatisticsRepository.getTrendData() 获取趋势数据
    - 4) 使用 `Dispatchers.IO` 在 IO 线程执行
  - **验证**：
    - [ ] UseCase 调用 Repository 成功
    - [ ] Flow 正确发射趋势数据
  - **产物**：`statistics/domain/usecase/GetTrendDataUseCase.kt`

- [ ] T121 [ST-003] 在 StatisticsRepositoryImpl 中实现 getTrendData（路径：`statistics/data/repository/StatisticsRepositoryImpl.kt`）
  - **依赖**：T120
  - **设计引用**：plan.md:A3.4:StatisticsRepository:UML类图、plan.md:A3.4:StatisticsRepository:策略与算法
  - **步骤**：
    - 1) 实现 `getTrendData(timeRange, metric)`：返回 `Flow<List<LearningTrendData>>`
    - 2) 查询学习记录数据（按时间维度聚合）
    - 3) 计算趋势数据（学习时长趋势、单词学习量趋势、正确率趋势）
    - 4) 实现数据采样策略：数据点超过 100 个时，每 10 个点取 1 个
    - 5) 缓存趋势数据（缓存键：`trend_${timeRange}_${metric}`）
  - **验证**：
    - [ ] 趋势数据查询成功
    - [ ] 数据采样策略有效（数据点 >100 个时采样）
    - [ ] 趋势数据准确
  - **产物**：`statistics/data/repository/StatisticsRepositoryImpl.kt`

- [ ] T122 [ST-003] 在 `app/src/main/java/com/jacky/verity/statistics/ui/chart/` 中实现 ChartRenderer（路径：`statistics/ui/chart/ChartRenderer.kt`）
  - **依赖**：T121
  - **设计引用**：plan.md:A3.4:ChartRenderer:UML类图、plan.md:A3.4:ChartRenderer:时序-成功、plan.md:A3.4:ChartRenderer:时序-异常、plan.md:A3.4:ChartRenderer:关键异常清单
  - **步骤**：
    - 1) 创建 `ChartRenderer` Composable 组件
    - 2) 实现 `LineChart(data, modifier)`：使用 Vico 库渲染折线图
    - 3) 实现 `BarChart(data, modifier)`：使用 Vico 库渲染柱状图
    - 4) 实现数据采样逻辑（数据点 >100 个时采样）
    - 5) 使用 `remember` 缓存图表数据，避免重复计算
    - 6) 实现内存检查：内存不足时降级为简化图表
    - 7) 实现渲染失败处理：降级为文本列表
    - 8) 记录图表渲染性能指标（渲染耗时、数据点数量、是否降级）
  - **验证**：
    - [ ] 折线图渲染成功
    - [ ] 柱状图渲染成功
    - [ ] 数据采样有效（数据点 >100 个时采样）
    - [ ] 内存不足时降级为简化图表
    - [ ] 渲染失败时降级为文本列表
    - [ ] 图表渲染时间 p95 ≤ 500ms（NFR-PERF-001）
  - **产物**：`statistics/ui/chart/ChartRenderer.kt`

- [ ] T123 [ST-003] 在 StatisticsScreen 中集成趋势图表（路径：`statistics/ui/StatisticsScreen.kt`）
  - **依赖**：T122
  - **设计引用**：plan.md:A4:流程1 统计数据查询流程
  - **步骤**：
    - 1) 在 StatisticsScreen 中添加趋势图表展示区域
    - 2) 使用 GetTrendDataUseCase 获取趋势数据
    - 3) 使用 ChartRenderer 渲染趋势图表（学习时长趋势、单词学习量趋势、正确率趋势）
    - 4) 实现趋势指标切换（LearningTime、WordsLearned、Accuracy）
    - 5) 实现图表加载状态展示
  - **验证**：
    - [ ] 趋势图表显示正确（FR-002）
    - [ ] 趋势指标切换正常
    - [ ] 图表加载状态显示正确
    - [ ] 图表渲染性能测试通过（p95 ≤ 500ms）（NFR-PERF-001）
    - [ ] 内存占用测试通过（峰值 ≤ 50MB）（NFR-MEM-001）
  - **产物**：`statistics/ui/StatisticsScreen.kt`

**检查点**：至此，用户故事 ST-003 应具备完整功能且可独立测试

---

## 阶段 6：Story ST-004 - 实现记忆曲线展示功能（类型：Functional）

**目标**：用户能够查看记忆曲线，图表渲染流畅，数据准确

**验证方式（高层）**：用户能够查看记忆曲线，图表渲染时间 p95 ≤ 500ms（引用 FR-003、FR-008；NFR-PERF-001、NFR-MEM-001）

### ST-004 任务

- [ ] T130 [ST-004] 在 `app/src/main/java/com/jacky/verity/statistics/domain/usecase/` 中实现 GetMemoryCurveUseCase（路径：`statistics/domain/usecase/GetMemoryCurveUseCase.kt`）
  - **依赖**：T102、FEAT-002（AlgorithmRepository 接口）
  - **设计引用**：plan.md:A4:流程3 记忆曲线查询流程
  - **步骤**：
    - 1) 创建 `GetMemoryCurveUseCase` 类，注入 StatisticsRepository
    - 2) 实现 `invoke(wordId, timeRange)`：返回 `Flow<List<MemoryCurveData>>`
    - 3) 调用 StatisticsRepository.getMemoryCurve() 获取记忆曲线数据
    - 4) 支持查询所有单词或单个单词的记忆曲线
    - 5) 使用 `Dispatchers.IO` 在 IO 线程执行
  - **验证**：
    - [ ] UseCase 调用 Repository 成功
    - [ ] 支持查询所有单词记忆曲线
    - [ ] 支持查询单个单词记忆曲线（FR-008）
    - [ ] Flow 正确发射记忆曲线数据
  - **产物**：`statistics/domain/usecase/GetMemoryCurveUseCase.kt`

- [ ] T131 [ST-004] 在 StatisticsRepositoryImpl 中实现 getMemoryCurve（路径：`statistics/data/repository/StatisticsRepositoryImpl.kt`）
  - **依赖**：T130
  - **设计引用**：plan.md:A4:流程3 记忆曲线查询流程、plan.md:A3.4:StatisticsRepository:失败与降级
  - **步骤**：
    - 1) 实现 `getMemoryCurve(wordId, timeRange)`：返回 `Result<List<MemoryCurveData>>`
    - 2) 查询学习记录数据（所有单词或单个单词）
    - 3) 调用 AlgorithmRepository 获取记忆强度数据
    - 4) 实现容错处理：算法引擎不可用时使用默认值（记忆强度 0）
    - 5) 实现数据采样策略：数据点超过 100 个时，每 10 个点取 1 个
    - 6) 按时间排序记忆曲线数据
    - 7) 缓存记忆曲线数据（缓存键：`memory_curve_${wordId}_${timeRange}`）
  - **验证**：
    - [ ] 记忆曲线数据查询成功
    - [ ] 算法引擎不可用时使用默认值
    - [ ] 数据采样策略有效
    - [ ] 记忆曲线数据按时间排序正确
  - **产物**：`statistics/data/repository/StatisticsRepositoryImpl.kt`

- [ ] T132 [ST-004] 在 `app/src/main/java/com/jacky/verity/statistics/ui/` 中实现 MemoryCurveScreen UI（路径：`statistics/ui/MemoryCurveScreen.kt`）
  - **依赖**：T131、T122
  - **设计引用**：plan.md:A4:流程3 记忆曲线查询流程
  - **步骤**：
    - 1) 创建 `MemoryCurveScreen` Composable 函数
    - 2) 创建 MemoryCurveViewModel（注入 GetMemoryCurveUseCase）
    - 3) 实现单词选择器（所有单词或单个单词）
    - 4) 实现时间范围选择器
    - 5) 使用 ChartRenderer 渲染记忆曲线图表（折线图）
    - 6) 实现加载状态展示
    - 7) 实现错误状态展示（算法引擎不可用时提示）
  - **验证**：
    - [ ] 记忆曲线图表显示正确（FR-003）
    - [ ] 单个单词记忆曲线显示正确（FR-008）
    - [ ] 单词选择器正常工作
    - [ ] 时间范围选择器正常工作
    - [ ] 图表渲染性能测试通过（p95 ≤ 500ms）（NFR-PERF-001）
    - [ ] 内存占用测试通过（峰值 ≤ 50MB）（NFR-MEM-001）
  - **产物**：`statistics/ui/MemoryCurveScreen.kt`、`statistics/ui/viewmodel/MemoryCurveViewModel.kt`

- [ ] T133 [ST-004] 编写记忆曲线功能测试（路径：`app/src/test/java/com/jacky/verity/statistics/`）
  - **依赖**：T132
  - **步骤**：
    - 1) 测试记忆曲线数据查询（所有单词、单个单词）
    - 2) 测试算法引擎不可用时的降级处理
    - 3) 测试数据采样策略
    - 4) 测试记忆曲线图表渲染
  - **验证**：
    - [ ] 所有测试通过
    - [ ] 图表渲染性能测试通过（p95 ≤ 500ms）
  - **产物**：`app/src/test/java/com/jacky/verity/statistics/**/*MemoryCurve*Test.kt`

**检查点**：至此，用户故事 ST-004 应具备完整功能且可独立测试

---

## 阶段 7：Story ST-005 - 实现报告生成功能（类型：Functional）

**目标**：用户能够生成和查看报告，报告内容完整准确，生成时间 p95 ≤ 2 秒

**验证方式（高层）**：用户能够生成和查看报告，报告生成时间 p95 ≤ 2 秒（引用 FR-004、FR-007；NFR-PERF-001、NFR-REL-001）

### ST-005 任务

- [ ] T140 [ST-005] 在 `app/src/main/java/com/jacky/verity/statistics/domain/` 中实现 ReportGenerator（路径：`statistics/domain/ReportGenerator.kt`）
  - **依赖**：T102
  - **设计引用**：plan.md:A3.4:ReportGenerator:UML类图、plan.md:A3.4:ReportGenerator:时序-成功、plan.md:A3.4:ReportGenerator:时序-异常、plan.md:A4:流程2 报告生成流程
  - **步骤**：
    - 1) 创建 `ReportGenerator` 类，注入 StatisticsRepository
    - 2) 实现 `generateReport(type, timeRange, onProgress)`：返回 `Result<LearningReport>`
    - 3) 实现时间范围验证：validateTimeRange()
    - 4) 实现进度回调：onProgress(0%、30%、60%、80%、100%)
    - 5) 查询统计数据：调用 StatisticsRepository.getStatistics()
    - 6) 查询趋势数据：调用 StatisticsRepository.getTrendData()
    - 7) 聚合数据：计算统计指标和趋势数据
    - 8) 生成报告对象：LearningReport(type, timeRange, statistics, trendData)
    - 9) 实现超时处理（>10秒）：取消生成，返回超时错误
    - 10) 实现错误处理：时间范围无效、查询失败、生成失败
    - 11) 记录报告生成日志（报告类型、时间范围、生成耗时）
  - **验证**：
    - [ ] 报告生成成功（日报、周报、月报）
    - [ ] 进度回调正确（0%、30%、60%、80%、100%）
    - [ ] 时间范围无效时返回错误
    - [ ] 查询失败时返回错误
    - [ ] 生成超时（>10秒）时取消生成
    - [ ] 数据缺失时返回空报告
    - [ ] 报告内容完整准确（FR-004）
  - **产物**：`statistics/domain/ReportGenerator.kt`

- [ ] T141 [ST-005] 在 `app/src/main/java/com/jacky/verity/statistics/domain/usecase/` 中实现 GenerateReportUseCase（路径：`statistics/domain/usecase/GenerateReportUseCase.kt`）
  - **依赖**：T140
  - **设计引用**：plan.md:Story Detailed Design:ST-001:3 核心接口与数据契约
  - **步骤**：
    - 1) 创建 `GenerateReportUseCase` 类，注入 ReportGenerator
    - 2) 实现 `invoke(type, timeRange, onProgress)`：返回 `Flow<LearningReport>`
    - 3) 调用 ReportGenerator.generateReport()
    - 4) 使用 `Dispatchers.IO` 在 IO 线程执行
    - 5) 处理 Result，转换为 Flow
  - **验证**：
    - [ ] UseCase 调用 ReportGenerator 成功
    - [ ] Flow 正确发射报告数据
  - **产物**：`statistics/domain/usecase/GenerateReportUseCase.kt`

- [ ] T142 [ST-005] 在 `app/src/main/java/com/jacky/verity/statistics/ui/viewmodel/` 中实现 ReportViewModel 并在 `app/src/main/java/com/jacky/verity/statistics/ui/` 中实现 ReportScreen UI（路径：`statistics/ui/viewmodel/ReportViewModel.kt`、`statistics/ui/ReportScreen.kt`）
  - **依赖**：T141
  - **设计引用**：plan.md:A4:流程2 报告生成流程
  - **步骤**：
    - 1) 创建 `ReportViewModel` 类，注入 GenerateReportUseCase
    - 2) 创建 `ReportUiState` 数据类（isLoading、report、error、progress）
    - 3) 创建 `report: StateFlow<ReportUiState>` 状态
    - 4) 实现 `generateReport(type, timeRange)`：调用 UseCase，更新状态
    - 5) 实现进度更新：onProgress() 回调更新进度状态
    - 6) 创建 `ReportScreen` Composable 函数
    - 7) 实现报告类型选择器（日报、周报、月报）
    - 8) 实现时间范围选择器
    - 9) 实现报告内容展示：学习时长、单词数量、正确率、趋势数据
    - 10) 实现加载状态展示：显示 Loading 指示器和进度条
    - 11) 实现错误状态展示：显示错误提示和重试按钮
  - **验证**：
    - [ ] 报告生成成功（FR-004）
    - [ ] 进度显示正确（FR-007）
    - [ ] 报告类型选择正常
    - [ ] 时间范围选择正常
    - [ ] 报告内容完整准确
    - [ ] 报告生成时间 p95 ≤ 2 秒（NFR-PERF-001）
    - [ ] 报告生成成功率 ≥ 99%（NFR-REL-001）
  - **产物**：`statistics/ui/viewmodel/ReportViewModel.kt`、`statistics/ui/ReportScreen.kt`

**检查点**：至此，用户故事 ST-005 应具备完整功能且可独立测试

---

## 阶段 8：Story ST-006 - 实现空状态和错误处理（类型：Functional）

**目标**：用户能够看到友好的空状态提示和错误提示，错误处理完善

**验证方式（高层）**：无学习数据时显示空状态提示，查询失败时显示错误提示并允许重试（引用 FR-006、FR-007；NFR-OBS-002、NFR-REL-001）

### ST-006 任务

- [ ] T150 [ST-006] 在 StatisticsScreen 中实现空状态提示（路径：`statistics/ui/StatisticsScreen.kt`）
  - **依赖**：T105
  - **设计引用**：plan.md:A6 边界 & 异常场景枚举、spec.md:FR-006
  - **步骤**：
    - 1) 检测统计数据为空（isEmpty == true）
    - 2) 显示空状态提示：引导用户开始学习的文案和按钮
    - 3) 说明统计数据将在学习后生成
  - **验证**：
    - [ ] 无学习数据时显示空状态提示（FR-006）
    - [ ] 空状态提示引导用户开始学习
  - **产物**：`statistics/ui/StatisticsScreen.kt`

- [ ] T151 [ST-006] 在所有页面中实现错误处理和重试机制（路径：`statistics/ui/StatisticsScreen.kt`、`statistics/ui/ReportScreen.kt`、`statistics/ui/MemoryCurveScreen.kt`）
  - **依赖**：T150、T142、T132
  - **设计引用**：plan.md:Story Detailed Design:ST-001:6 异常场景矩阵、spec.md:FR-007
  - **步骤**：
    - 1) 在所有页面中检测错误状态（error != null）
    - 2) 显示错误提示：用户友好的错误消息
    - 3) 实现重试按钮：调用 ViewModel.retry() 或重新加载
    - 4) 区分错误类型：查询超时、查询失败、计算失败、网络错误等
    - 5) 实现加载提示：加载时显示 Loading 指示器（FR-007）
  - **验证**：
    - [ ] 查询失败时显示错误提示并允许重试
    - [ ] 查询超时时显示超时错误提示并允许重试
    - [ ] 计算失败时显示计算错误提示
    - [ ] 加载时显示加载提示（FR-007）
    - [ ] 重试功能正常
  - **产物**：`statistics/ui/StatisticsScreen.kt`、`statistics/ui/ReportScreen.kt`、`statistics/ui/MemoryCurveScreen.kt`

- [ ] T152 [ST-006] 在 Repository 层实现错误日志记录（路径：`statistics/data/repository/StatisticsRepositoryImpl.kt`）
  - **依赖**：T151
  - **设计引用**：plan.md:Story Detailed Design:ST-001:6 异常场景矩阵、spec.md:NFR-OBS-002
  - **步骤**：
    - 1) 记录查询失败日志：错误类型、查询参数、错误详情
    - 2) 记录查询超时日志：查询参数、耗时
    - 3) 记录计算失败日志：错误类型、错误详情
    - 4) 记录算法引擎不可用日志：使用默认值的场景
    - 5) 使用结构化日志格式，便于排查
  - **验证**：
    - [ ] 所有错误都有日志记录（NFR-OBS-002）
    - [ ] 日志包含足够的排查信息
    - [ ] 日志格式便于分析
  - **产物**：`statistics/data/repository/StatisticsRepositoryImpl.kt`

**检查点**：至此，用户故事 ST-006 应具备完整功能且可独立测试

---

## 阶段 9：Story ST-007 - 实现性能优化和降级策略（类型：Optimization）

**目标**：统计数据查询和图表渲染性能满足要求，降级策略有效

**验证方式（高层）**：查询超时时限制查询时间范围，图表数据点 >100 个时进行数据采样（引用 NFR-PERF-002、NFR-PERF-003、NFR-MEM-001）

### ST-007 任务

- [ ] T160 [ST-007] 在 StatisticsRepositoryImpl 中实现查询超时处理和降级策略（路径：`statistics/data/repository/StatisticsRepositoryImpl.kt`）
  - **依赖**：T102
  - **设计引用**：plan.md:A5 技术风险与消解策略:RISK-001、plan.md:A9 性能评估、spec.md:NFR-PERF-002
  - **步骤**：
    - 1) 实现查询时间范围限制：最多 3 个月（NFR-PERF-002）
    - 2) 实现查询超时检测（>5秒）：取消查询，返回超时错误
    - 3) 实现分页加载：数据量过大时分页查询
    - 4) 实现查询进度反馈：显示加载提示和进度
    - 5) 优化数据库查询：使用聚合查询（SUM、COUNT、AVG）减少内存占用
  - **验证**：
    - [ ] 查询时间范围限制有效（最多 3 个月）
    - [ ] 查询超时时正确处理
    - [ ] 分页加载有效
    - [ ] 查询性能满足要求（p95 ≤ 1 秒）
  - **产物**：`statistics/data/repository/StatisticsRepositoryImpl.kt`

- [ ] T161 [ST-007] 在 ChartRenderer 中优化数据采样策略（路径：`statistics/ui/chart/ChartRenderer.kt`）
  - **依赖**：T122
  - **设计引用**：plan.md:A3.4:ChartRenderer:策略与算法、plan.md:A5 技术风险与消解策略:RISK-003、spec.md:NFR-PERF-003
  - **步骤**：
    - 1) 优化数据采样策略：数据点 >100 个时，每 10 个点取 1 个（NFR-PERF-003）
    - 2) 实现数据点数量限制：最多显示 100 个数据点
    - 3) 优化内存不足时的降级策略：更激进采样（factor=20）
    - 4) 实现简化图表：内存不足时使用简化版图表
    - 5) 记录降级日志：内存不足、数据采样等场景
  - **验证**：
    - [ ] 数据采样策略有效（数据点 >100 个时采样）
    - [ ] 数据点数量限制有效（最多 100 个）
    - [ ] 内存不足时降级为简化图表
    - [ ] 图表渲染性能满足要求（p95 ≤ 500ms）
  - **产物**：`statistics/ui/chart/ChartRenderer.kt`

- [ ] T162 [ST-007] 实现内存优化和生命周期管理（路径：`statistics/ui/StatisticsScreen.kt`、`statistics/ui/viewmodel/StatisticsViewModel.kt`、`statistics/data/cache/StatisticsCache.kt`）
  - **依赖**：T161
  - **设计引用**：plan.md:A10 内存评估、plan.md:A6 边界 & 异常场景枚举:生命周期、spec.md:NFR-MEM-001、NFR-MEM-002
  - **步骤**：
    - 1) 实现页面退出时清理缓存：StatisticsViewModel.onCleared() 时调用 StatisticsCache.clear()
    - 2) 实现图表数据释放：页面退出时释放图表数据和渲染缓存
    - 3) 优化缓存大小：限制缓存大小（<10MB）
    - 4) 实现内存监控：监控内存占用，超过阈值时触发清理
    - 5) 实现统计数据计算完成后立即释放临时数据
  - **验证**：
    - [ ] 页面退出后内存释放 ≥ 80%（NFR-MEM-002）
    - [ ] 内存占用峰值 ≤ 50MB（NFR-MEM-001）
    - [ ] 缓存大小 ≤ 10MB
    - [ ] 统计数据计算完成后临时数据已释放
  - **产物**：`statistics/ui/StatisticsScreen.kt`、`statistics/ui/viewmodel/StatisticsViewModel.kt`、`statistics/data/cache/StatisticsCache.kt`

**检查点**：至此，用户故事 ST-007 应具备完整功能且可独立测试

---

## 阶段 10：Story ST-008 - 实现可观测性和日志记录（类型：Infrastructure）

**目标**：关键操作都有日志记录，性能指标可观测，错误日志便于排查

**验证方式（高层）**：关键操作都有日志记录，性能指标可观测（引用 NFR-OBS-001、NFR-OBS-002、NFR-OBS-003）

### ST-008 任务

- [ ] T170 [ST-008] 实现统计数据查看事件日志（路径：`statistics/ui/viewmodel/StatisticsViewModel.kt`）
  - **依赖**：T104
  - **设计引用**：plan.md:Story Detailed Design:ST-001:可观测性、spec.md:NFR-OBS-001
  - **步骤**：
    - 1) 记录统计数据查看事件：页面类型、时间范围、查看时长
    - 2) 在 StatisticsViewModel 中记录查看开始和结束时间
    - 3) 计算查看时长并记录
    - 4) 使用结构化日志格式
  - **验证**：
    - [ ] 统计数据查看事件都有日志记录（NFR-OBS-001）
    - [ ] 日志包含页面类型、时间范围、查看时长
  - **产物**：`statistics/ui/viewmodel/StatisticsViewModel.kt`

- [ ] T171 [ST-008] 实现报告生成事件日志（路径：`statistics/ui/viewmodel/ReportViewModel.kt`、`statistics/domain/ReportGenerator.kt`）
  - **依赖**：T142
  - **设计引用**：plan.md:A3.4:ReportGenerator:可观测性、spec.md:NFR-OBS-001
  - **步骤**：
    - 1) 记录报告生成事件：报告类型、生成耗时、是否成功
    - 2) 在 ReportGenerator 中记录生成开始和结束时间
    - 3) 计算生成耗时并记录
    - 4) 记录生成成功/失败状态
  - **验证**：
    - [ ] 报告生成事件都有日志记录（NFR-OBS-001）
    - [ ] 日志包含报告类型、生成耗时、是否成功
  - **产物**：`statistics/ui/viewmodel/ReportViewModel.kt`、`statistics/domain/ReportGenerator.kt`

- [ ] T172 [ST-008] 实现图表渲染性能指标日志（路径：`statistics/ui/chart/ChartRenderer.kt`）
  - **依赖**：T122
  - **设计引用**：plan.md:A3.4:ChartRenderer:可观测性、spec.md:NFR-OBS-003
  - **步骤**：
    - 1) 记录图表渲染性能指标：渲染耗时、数据点数量、是否降级
    - 2) 在 ChartRenderer 中记录渲染开始和结束时间
    - 3) 计算渲染耗时并记录
    - 4) 记录数据点数量和是否降级（内存不足、数据采样等）
  - **验证**：
    - [ ] 图表渲染性能指标都有日志记录（NFR-OBS-003）
    - [ ] 日志包含渲染耗时、数据点数量、是否降级
  - **产物**：`statistics/ui/chart/ChartRenderer.kt`

- [ ] T173 [ST-008] 实现错误日志记录（路径：`statistics/data/repository/StatisticsRepositoryImpl.kt`、`statistics/domain/ReportGenerator.kt`、`statistics/ui/chart/ChartRenderer.kt`）
  - **依赖**：T152、T172
  - **设计引用**：plan.md:Story Detailed Design:ST-001:6 异常场景矩阵、spec.md:NFR-OBS-002
  - **步骤**：
    - 1) 在所有组件中统一错误日志格式
    - 2) 记录查询失败日志：错误类型、查询参数、错误详情
    - 3) 记录报告生成失败日志：报告类型、时间范围、错误详情
    - 4) 记录图表渲染失败日志：图表类型、数据点数量、错误详情
    - 5) 使用结构化日志格式，便于排查
  - **验证**：
    - [ ] 所有错误都有日志记录（NFR-OBS-002）
    - [ ] 日志包含足够的排查信息
    - [ ] 日志格式便于分析
  - **产物**：`statistics/data/repository/StatisticsRepositoryImpl.kt`、`statistics/domain/ReportGenerator.kt`、`statistics/ui/chart/ChartRenderer.kt`

**检查点**：至此，用户故事 ST-008 应具备完整功能且可独立测试

---

## 依赖关系与执行顺序

### 阶段依赖

- **环境搭建（阶段 1）**：无依赖——可立即启动
- **核心基础（阶段 2）**：依赖环境搭建完成——阻塞所有用户故事
- **用户故事（阶段 3+）**：均依赖核心基础阶段完成
    - ST-001：依赖阶段 2 完成
    - ST-002：依赖 ST-001 完成
    - ST-003：依赖 ST-001 完成
    - ST-004：依赖 FEAT-002、ST-003 完成
    - ST-005：依赖 ST-001、ST-003 完成
    - ST-006：依赖 ST-001 完成（可与 ST-001 并行）
    - ST-007：依赖 ST-001、ST-003 完成
    - ST-008：依赖 ST-001、ST-003、ST-005 完成（可与功能开发并行）
- **优化完善（最终阶段）**：依赖所有目标用户故事完成

### Story 依赖

- **ST-001**：依赖阶段 2 完成、FEAT-007（UserDataRepository 接口）
- **ST-002**：依赖 ST-001
- **ST-003**：依赖 ST-001、Vico 图表库
- **ST-004**：依赖 FEAT-002（AlgorithmRepository 接口）、ST-003
- **ST-005**：依赖 ST-001、ST-003
- **ST-006**：依赖 ST-001（可与 ST-001 并行）
- **ST-007**：依赖 ST-001、ST-003
- **ST-008**：依赖 ST-001、ST-003、ST-005（可与功能开发并行）

### 单 Story 内部顺序

- 数据模型/错误类型（如有）必须先于 Repository 实现
- Repository 接口必须先于 Repository 实现
- Repository 实现必须先于 UseCase 实现
- UseCase 实现必须先于 ViewModel 实现
- ViewModel 实现必须先于 UI 实现
- 单元测试可与实现并行（标记 [P]）
- 集成测试必须在实现完成后

### 并行执行场景

- 所有标记 [P] 的环境搭建任务可并行（T012）
- 所有标记 [P] 的核心基础任务可并行（T020、T021、T022）
- ST-001 内部：T100、T101 可并行（T100 [P]）
- ST-006 可与 ST-001 并行（在 ST-001 的 Repository 层完成后）
- ST-008 可与功能开发并行（在基础组件完成后）
- 不同团队成员可并行开发不同用户故事（完成依赖后）

---

## 并行示例：Story ST-001

```bash
# 批量启动 ST-001 的可并行任务（示例）：
- T100 [P] [ST-001] 实现 StatisticsCache（路径：statistics/data/cache/StatisticsCache.kt）
- T101 [ST-001] 实现 StatisticsRepository 接口（路径：statistics/data/repository/StatisticsRepository.kt）
```

---

## 落地策略

### 先完成 MVP（优先完成关键 Story 集合）

1. 完成阶段 1：环境搭建
2. 完成阶段 2：核心基础（关键——阻塞所有故事）
3. 完成阶段 3：Story ST-001（统计数据查询功能）
4. 完成阶段 8：Story ST-006（空状态和错误处理）
5. **暂停并验证**：独立验证 ST-001 + ST-006（MVP！）
6. 如就绪，进行部署/演示

### 增量交付

1. 完成环境搭建 + 核心基础 → 基础层就绪
2. 新增 ST-001 + ST-006 → 独立验证 → 部署/演示（MVP！）
3. 新增 ST-002 → 独立验证 → 部署/演示（性能优化）
4. 新增 ST-003 → 独立验证 → 部署/演示（趋势图表）
5. 新增 ST-004 → 独立验证 → 部署/演示（记忆曲线）
6. 新增 ST-005 → 独立验证 → 部署/演示（报告生成）
7. 新增 ST-007 → 独立验证 → 部署/演示（性能优化和降级）
8. 新增 ST-008 → 独立验证 → 部署/演示（可观测性）
9. 每个故事均需在不破坏已有故事的前提下新增价值

### 团队并行策略

多开发者协作场景：

1. 团队共同完成环境搭建 + 核心基础
2. 核心基础完成后：
    - 开发者 A：负责 ST-001（统计数据查询）
    - 开发者 B：负责 ST-006（空状态和错误处理，可与 ST-001 并行）
    - 开发者 C：负责 ST-008（可观测性，可与功能开发并行）
3. ST-001 完成后：
    - 开发者 A：负责 ST-002（缓存机制）
    - 开发者 B：负责 ST-003（趋势图表）
4. ST-003 完成后：
    - 开发者 A：负责 ST-004（记忆曲线）
    - 开发者 B：负责 ST-005（报告生成）
5. ST-003、ST-004 完成后：
    - 开发者 A：负责 ST-007（性能优化和降级）
6. 各 Story 独立完成并集成

---

## 备注

- [P] 标记的任务 = 涉及不同文件，无依赖关系
- [ST-xxx] 标签将任务关联至 Plan 的 Story，便于追溯
- 每个 Story 需可独立完成、独立验证
- 实现前验证测试用例执行失败（如采用 TDD）
- 完成单个任务或逻辑分组后提交代码
- 可在任意检查点暂停，独立验证对应故事
- 避免：模糊的任务描述、同一文件冲突、破坏独立性的跨故事依赖
- 所有任务必须遵循严格的清单格式（复选框、任务ID、[ST-xxx]标签、文件路径）
- 每个任务需包含设计引用（指向 plan.md 对应章节）
- 验证方式必须包含 NFR 指标阈值（如 p95 ≤ 1 秒、内存 ≤ 50MB 等）
