# Tasks：间隔重复学习算法引擎

**Epic**：EPIC-001 - 无痛记忆单词神器APP
**Feature ID**：FEAT-002
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

- **移动端**：`app/src/main/java/com/jacky/verity/algorithm/`

## 阶段 0：准备（可选但建议）

**目标**：对齐版本、冻结设计输入，避免 Implement 期返工

- [ ] T001 在 `specs/epics/EPIC-001-word-memory-app/features/FEAT-002-spaced-repetition-algorithm/` 中核对 `spec.md`、`plan.md` 的 Version 字段一致性并补齐变更记录
  - **依赖**：无
  - **步骤**：
    - 1) 确认 `Feature Version`（v0.1.0）、`Plan Version`（v0.1.0）已填写
    - 2) 确认 Plan 的 Story Breakdown 已完成（ST-001 至 ST-007）
    - 3) 确认所有 FR/NFR 已映射到 Story
  - **验证**：
    - [ ] tasks.md 中 `Plan Version` 与 plan.md 一致（v0.1.0）
    - [ ] Story 列表完整（7 个 Story）
  - **产物**：`spec.md`、`plan.md`、`tasks.md`

---

## 阶段 1：环境搭建（共享基础设施）

**目标**：项目初始化与基础结构搭建

- [ ] T010 按照 plan.md 的"结构决策"创建算法引擎模块目录结构（路径：`app/src/main/java/com/jacky/verity/algorithm/`）
  - **依赖**：T001
  - **步骤**：
    - 1) 创建 `api/`、`core/`、`domain/`、`data/`、`di/` 目录
    - 2) 在 `core/` 下创建 `sm2/`、`evaluator/`、`scheduler/` 子目录
    - 3) 在 `domain/` 下创建 `manager/`、`calculator/` 子目录
    - 4) 在 `data/` 下创建 `repository/`、`database/` 目录
    - 5) 在 `database/` 下创建 `dao/`、`entity/` 子目录
  - **验证**：
    - [ ] 目录结构与 plan.md B7 部分一致
  - **产物**：算法引擎模块目录结构

- [ ] T011 初始化 Room 数据库依赖（路径：`app/build.gradle.kts`）
  - **依赖**：T010
  - **步骤**：
    - 1) 添加 Room 依赖（`androidx.room:room-runtime`、`androidx.room:room-ktx`）
    - 2) 添加 Room 编译插件（`androidx.room:room-compiler`）
    - 3) 添加 Kotlin Coroutines 依赖（`org.jetbrains.kotlinx:kotlinx-coroutines-android`）
    - 4) 添加 KSP/KAPT 插件（用于 Room 注解处理）
  - **验证**：
    - [ ] 项目构建成功（`./gradlew build`）
    - [ ] Room 依赖版本符合要求（2.6.0+）
  - **产物**：`app/build.gradle.kts`

- [ ] T012 [P] 配置代码检查与格式化工具（路径：`.editorconfig`、`ktlint.yml`）
  - **依赖**：T011
  - **步骤**：
    - 1) 配置 Kotlin 代码格式化规则
    - 2) 配置 ktlint 或 detekt 代码检查规则
  - **验证**：
    - [ ] `./gradlew ktlintCheck` 或 `./gradlew detekt` 可运行
  - **产物**：代码检查配置文件

---

## 阶段 2：核心基础（阻塞性前置条件，阻塞所有 Story）

**目标**：所有 Story 实现前必须完成的核心基础设施搭建

**⚠️ 关键**：此阶段完成前，任何 Story 相关工作均不可启动

- [ ] T020 搭建错误处理基础设施（路径：`app/src/main/java/com/jacky/verity/algorithm/core/AlgorithmError.kt`）
  - **依赖**：T012
  - **步骤**：
    - 1) 创建 `AlgorithmError` Sealed Class（包含 `CalculationError`、`DataError`、`InvalidInputError`）
    - 2) 创建 `Result<T>` 类型别名或使用标准 Result 类
    - 3) 定义错误码和错误消息规范
  - **验证**：
    - [ ] 错误类型定义符合 Plan-B B2 错误处理规范
    - [ ] 单元测试验证错误类型创建
  - **产物**：`AlgorithmError.kt`

- [ ] T021 [P] 搭建日志基础设施（路径：`app/src/main/java/com/jacky/verity/algorithm/core/AlgorithmLogger.kt`）
  - **依赖**：T012
  - **步骤**：
    - 1) 配置结构化日志库（如 Timber）
    - 2) 定义日志格式规范（操作类型、结果、耗时）
    - 3) 实现敏感信息脱敏逻辑
  - **验证**：
    - [ ] 日志输出符合 Plan-B B2 日志规范
    - [ ] 敏感信息（单词内容）不记录到日志
  - **产物**：`AlgorithmLogger.kt`

- [ ] T022 [P] 创建算法引擎接口定义（路径：`app/src/main/java/com/jacky/verity/algorithm/api/SpacedRepetitionEngine.kt`）
  - **依赖**：T020
  - **步骤**：
    - 1) 定义 `SpacedRepetitionEngine` 接口（符合 Plan-B B4 接口规范）
    - 2) 定义接口方法签名（`calculateNextReview`、`getLearningTaskList`、`updateLearningState` 等）
    - 3) 定义输入输出数据类型（`LearningState`、`ReviewResult` 等）
  - **验证**：
    - [ ] 接口定义符合 Plan-B B4 接口规范
    - [ ] 接口方法签名完整
  - **产物**：`SpacedRepetitionEngine.kt`

**检查点**：基础层就绪——Story 实现可并行启动

---

## 阶段 3：Story ST-001 - SM-2 算法实现（类型：Functional）

**目标**：算法能够正确计算复习时机，计算结果符合 SM-2 算法规律，计算耗时满足性能要求（单个单词 ≤ 10ms p95）

**验证方式（高层）**：算法计算结果与标准 SM-2 算法一致，计算耗时 ≤ 10ms（p95），算法参数在合理范围内

**覆盖 FR/NFR**：FR-001；FR-002；NFR-PERF-001（算法计算耗时）；NFR-OBS-001（算法计算事件记录）；NFR-REL-001（计算成功率）

### ST-001 任务

- [ ] T100 [P] [ST-001] 创建算法参数数据类（路径：`app/src/main/java/com/jacky/verity/algorithm/core/sm2/AlgorithmParameters.kt`）
  - **依赖**：T022
  - **步骤**：
    - 1) 定义 `AlgorithmParameters` data class（包含 `initialInterval`、`minDifficultyFactor`、`maxInterval` 等）
    - 2) 实现参数校验逻辑（范围检查：间隔 1 小时-365 天，难度因子 1.3-3.0）
    - 3) 定义默认参数常量
  - **验证**：
    - [ ] 参数校验单元测试通过
    - [ ] 默认参数符合 SM-2 算法规范
  - **产物**：`AlgorithmParameters.kt`

- [ ] T101 [P] [ST-001] 创建 SM-2 算法核心实现（路径：`app/src/main/java/com/jacky/verity/algorithm/core/sm2/SM2Algorithm.kt`）
  - **依赖**：T100
  - **步骤**：
    - 1) 实现 SM-2 算法核心逻辑（根据 quality 调整 EF 和 interval）
    - 2) 实现边界处理（间隔限制在 1 小时-365 天，EF 限制在 1.3-3.0）
    - 3) 实现异常处理（捕获计算溢出、除零等异常）
    - 4) 使用协程在 IO 线程执行计算
  - **验证**：
    - [ ] 算法计算结果与标准 SM-2 算法一致（使用测试数据集验证）
    - [ ] 计算耗时 ≤ 10ms（p95）（性能测试）
    - [ ] 边界情况处理正确（quality 0-5、各种间隔值）
    - [ ] 异常情况有明确的错误处理和降级策略
  - **产物**：`SM2Algorithm.kt`

- [ ] T102 [ST-001] 实现记忆强度更新功能（路径：`app/src/main/java/com/jacky/verity/algorithm/core/sm2/SM2Algorithm.kt`）
  - **依赖**：T101
  - **步骤**：
    - 1) 实现 `updateMemoryStrength` 方法（基于学习次数、复习间隔、正确率）
    - 2) 记忆强度值范围：0.0-1.0
  - **验证**：
    - [ ] 记忆强度计算准确（单元测试）
    - [ ] 记忆强度值在合理范围内
  - **产物**：`SM2Algorithm.kt`（更新）

- [ ] T103 [ST-001] 实现批量计算支持（路径：`app/src/main/java/com/jacky/verity/algorithm/core/sm2/SM2Algorithm.kt`）
  - **依赖**：T102
  - **步骤**：
    - 1) 实现批量计算多个单词的复习时机
    - 2) 使用协程并行处理（限制并发数最多 10 个）
    - 3) 优化批量计算性能
  - **验证**：
    - [ ] 批量计算（1000 个单词）耗时 ≤ 500ms（p95）（性能测试）
    - [ ] 并发数限制生效
  - **产物**：`SM2Algorithm.kt`（更新）

- [ ] T104 [ST-001] 添加算法计算事件日志（路径：`app/src/main/java/com/jacky/verity/algorithm/core/sm2/SM2Algorithm.kt`）
  - **依赖**：T103
  - **步骤**：
    - 1) 记录算法计算事件（单词 ID、计算类型、耗时、参数）
    - 2) 记录算法异常事件（异常类型、异常详情）
    - 3) 不记录敏感信息（单词内容）
  - **验证**：
    - [ ] 日志记录符合 NFR-OBS-001 要求
    - [ ] 敏感信息不泄露
  - **产物**：`SM2Algorithm.kt`（更新）

**检查点**：ST-001 完成——SM-2 算法实现完成，可独立测试

---

## 阶段 4：Story ST-002 - 学习状态管理（类型：Functional）

**目标**：学习状态能够正确跟踪和更新，状态更新耗时满足性能要求（≤ 100ms p95），状态数据持久化正常

**验证方式（高层）**：学习状态正确跟踪和更新，状态更新耗时符合要求，状态数据持久化正常

**覆盖 FR/NFR**：FR-003；FR-006；NFR-PERF-001（状态更新耗时）；NFR-MEM-001（状态缓存内存占用）；NFR-OBS-001（状态更新事件）；NFR-REL-002（状态持久化）

**依赖**：ST-001（需要算法计算结果更新状态）

### ST-002 任务

- [ ] T200 [P] [ST-002] 创建学习状态实体（路径：`app/src/main/java/com/jacky/verity/algorithm/data/database/entity/LearningStateEntity.kt`）
  - **依赖**：T104
  - **步骤**：
    - 1) 定义 `LearningStateEntity` Room Entity（包含 `wordId`、`learningCount`、`lastReviewTime`、`memoryStrength`、`nextReviewTime`、`mastered`、`difficultyFactor`、`currentInterval`）
    - 2) 设置主键为 `wordId`
    - 3) 添加索引（`nextReviewTime`、`memoryStrength`）
  - **验证**：
    - [ ] 实体定义符合 Plan-B B3 数据模型
    - [ ] 索引创建成功
  - **产物**：`LearningStateEntity.kt`

- [ ] T201 [P] [ST-002] 创建复习记录实体（路径：`app/src/main/java/com/jacky/verity/algorithm/data/database/entity/ReviewRecordEntity.kt`）
  - **依赖**：T104
  - **步骤**：
    - 1) 定义 `ReviewRecordEntity` Room Entity（包含 `wordId`、`reviewTime`、`quality`、`interval`、`result`）
    - 2) 设置主键为 `wordId + reviewTime` 组合
    - 3) 添加外键关联到 `LearningStateEntity`
  - **验证**：
    - [ ] 实体定义符合 Plan-B B3 数据模型
    - [ ] 外键关联正确
  - **产物**：`ReviewRecordEntity.kt`

- [ ] T202 [ST-002] 创建 Room 数据库和 DAO（路径：`app/src/main/java/com/jacky/verity/algorithm/data/database/LearningDatabase.kt`、`dao/LearningStateDao.kt`、`dao/ReviewRecordDao.kt`）
  - **依赖**：T200、T201
  - **步骤**：
    - 1) 创建 `LearningDatabase` Room 数据库类
    - 2) 创建 `LearningStateDao`（包含查询、插入、更新、删除方法）
    - 3) 创建 `ReviewRecordDao`（包含查询、插入方法）
    - 4) 实现数据库版本管理和迁移策略
  - **验证**：
    - [ ] 数据库创建成功
    - [ ] DAO 方法可正常调用
    - [ ] 数据库版本迁移测试通过
  - **产物**：`LearningDatabase.kt`、`LearningStateDao.kt`、`ReviewRecordDao.kt`

- [ ] T203 [ST-002] 实现学习状态仓库（路径：`app/src/main/java/com/jacky/verity/algorithm/data/repository/LearningStateRepository.kt`）
  - **依赖**：T202
  - **步骤**：
    - 1) 实现 `LearningStateRepository` 接口
    - 2) 实现学习状态查询方法（`getLearningState`、`getLearningStates`）
    - 3) 实现学习状态更新方法（`updateLearningState`，使用事务确保一致性）
    - 4) 实现内存缓存机制（首次加载后缓存，数据库变更时更新缓存）
    - 5) 实现批量更新支持
  - **验证**：
    - [ ] 状态查询正确（单元测试）
    - [ ] 状态更新耗时 ≤ 100ms（p95）（性能测试）
    - [ ] 内存缓存机制正常工作
    - [ ] 事务确保数据一致性
  - **产物**：`LearningStateRepository.kt`

- [ ] T204 [ST-002] 实现学习状态管理器（路径：`app/src/main/java/com/jacky/verity/algorithm/domain/manager/LearningStateManager.kt`）
  - **依赖**：T203
  - **步骤**：
    - 1) 实现 `LearningStateManager` 类
    - 2) 实现学习状态创建逻辑（首次学习时初始化状态）
    - 3) 实现学习状态更新逻辑（基于算法计算结果更新状态）
    - 4) 实现状态机逻辑（未学习 → 学习中 → 已掌握）
    - 5) 实现幂等性保证（基于单词 ID + 时间戳去重）
  - **验证**：
    - [ ] 状态创建和更新正确（单元测试）
    - [ ] 状态机转换正确
    - [ ] 幂等性保证生效
  - **产物**：`LearningStateManager.kt`

- [ ] T205 [ST-002] 添加学习状态更新事件日志（路径：`app/src/main/java/com/jacky/verity/algorithm/domain/manager/LearningStateManager.kt`）
  - **依赖**：T204
  - **步骤**：
    - 1) 记录状态更新操作（单词 ID、更新类型、耗时）
    - 2) 记录状态更新失败（错误类型、单词 ID）
  - **验证**：
    - [ ] 日志记录符合 NFR-OBS-001 要求
  - **产物**：`LearningStateManager.kt`（更新）

**检查点**：ST-002 完成——学习状态管理完成，可独立测试

---

## 阶段 5：Story ST-003 - 复习时机计算（类型：Functional）

**目标**：复习时机计算准确，计算结果符合间隔重复算法规律，计算耗时满足性能要求（≤ 10ms p95）

**验证方式（高层）**：复习时机计算准确，计算耗时符合要求，计算结果符合算法规律

**覆盖 FR/NFR**：FR-001；NFR-PERF-001（计算耗时）；NFR-OBS-001（计算事件记录）

**依赖**：ST-001（需要 SM-2 算法）、ST-002（需要学习状态数据）

### ST-003 任务

- [ ] T300 [ST-003] 实现复习时机计算器（路径：`app/src/main/java/com/jacky/verity/algorithm/domain/calculator/ReviewCalculator.kt`）
  - **依赖**：T205
  - **步骤**：
    - 1) 实现 `ReviewCalculator` 类
    - 2) 实现复习时机计算逻辑（调用 SM-2 算法，基于学习状态计算下次复习时间）
    - 3) 实现输入参数验证（单词 ID、学习状态有效性）
    - 4) 实现计算结果验证（间隔范围 1 小时-365 天）
    - 5) 使用协程在 IO 线程执行计算
  - **验证**：
    - [ ] 复习时机计算准确（单元测试，与标准算法对比）
    - [ ] 计算耗时 ≤ 10ms（p95）（性能测试）
    - [ ] 参数验证和结果验证正确
  - **产物**：`ReviewCalculator.kt`

- [ ] T301 [ST-003] 添加复习时机计算事件日志（路径：`app/src/main/java/com/jacky/verity/algorithm/domain/calculator/ReviewCalculator.kt`）
  - **依赖**：T300
  - **步骤**：
    - 1) 记录计算事件（单词 ID、计算类型、耗时、参数）
    - 2) 记录计算结果（单词 ID、下次复习时间、记忆强度）
  - **验证**：
    - [ ] 日志记录符合 NFR-OBS-001 要求
  - **产物**：`ReviewCalculator.kt`（更新）

**检查点**：ST-003 完成——复习时机计算完成，可独立测试

---

## 阶段 6：Story ST-004 - 记忆强度评估和优先级排序（类型：Functional）

**目标**：记忆强度评估准确，优先级排序正确，评估耗时满足性能要求

**验证方式（高层）**：记忆强度评估准确，优先级排序正确

**覆盖 FR/NFR**：FR-004；NFR-PERF-001（评估耗时）

**依赖**：ST-002（需要学习状态数据）

### ST-004 任务

- [ ] T400 [ST-004] 实现记忆强度评估器（路径：`app/src/main/java/com/jacky/verity/algorithm/core/evaluator/MemoryStrengthEvaluator.kt`）
  - **依赖**：T205
  - **步骤**：
    - 1) 实现 `MemoryStrengthEvaluator` 类
    - 2) 实现记忆强度评估逻辑（基于学习次数、复习间隔、正确率）
    - 3) 记忆强度值范围：0.0-1.0
    - 4) 确保评估结果可复现
  - **验证**：
    - [ ] 记忆强度评估准确（单元测试）
    - [ ] 评估结果可复现（相同输入产生相同输出）
  - **产物**：`MemoryStrengthEvaluator.kt`

- [ ] T401 [ST-004] 实现优先级排序功能（路径：`app/src/main/java/com/jacky/verity/algorithm/core/evaluator/MemoryStrengthEvaluator.kt`）
  - **依赖**：T400
  - **步骤**：
    - 1) 实现基于记忆强度的优先级排序
    - 2) 记忆强度越低，优先级越高
    - 3) 支持批量排序
  - **验证**：
    - [ ] 优先级排序正确（单元测试）
    - [ ] 批量排序性能满足要求
  - **产物**：`MemoryStrengthEvaluator.kt`（更新）

**检查点**：ST-004 完成——记忆强度评估和优先级排序完成，可独立测试

---

## 阶段 7：Story ST-005 - 复习列表生成（类型：Functional）

**目标**：复习列表生成正确，列表生成耗时满足性能要求（≤ 200ms p95），列表按优先级正确排序

**验证方式（高层）**：复习列表生成正确，生成耗时符合要求，列表排序正确

**覆盖 FR/NFR**：FR-005；NFR-PERF-001（列表生成耗时）

**依赖**：ST-002（需要学习状态数据）、ST-003（需要复习时机计算）、ST-004（需要优先级排序）

### ST-005 任务

- [ ] T500 [ST-005] 实现复习调度器（路径：`app/src/main/java/com/jacky/verity/algorithm/core/scheduler/ReviewScheduler.kt`）
  - **依赖**：T301、T401
  - **步骤**：
    - 1) 实现 `ReviewScheduler` 类
    - 2) 实现复习列表生成逻辑（根据当前时间和学习状态，筛选到达复习时间的单词）
    - 3) 集成优先级排序功能（使用记忆强度评估器）
    - 4) 支持限制列表数量（limit 参数）
    - 5) 优化查询性能（使用数据库索引）
  - **验证**：
    - [ ] 复习列表生成正确（单元测试）
    - [ ] 列表生成耗时 ≤ 200ms（p95）（性能测试，100 个待复习单词）
    - [ ] 列表按优先级正确排序
  - **产物**：`ReviewScheduler.kt`

- [ ] T501 [ST-005] 实现学习任务列表生成功能（路径：`app/src/main/java/com/jacky/verity/algorithm/api/SpacedRepetitionEngine.kt`）
  - **依赖**：T500
  - **步骤**：
    - 1) 在 `SpacedRepetitionEngine` 接口中实现 `getLearningTaskList` 方法
    - 2) 调用复习调度器生成列表
    - 3) 返回 `Result<List<LearningState>>`
  - **验证**：
    - [ ] 学习任务列表生成正确（集成测试）
  - **产物**：`SpacedRepetitionEngine.kt`（实现类）

**检查点**：ST-005 完成——复习列表生成完成，可独立测试

---

## 阶段 8：Story ST-006 - 错误处理和异常场景（类型：Infrastructure）

**目标**：所有异常场景都有明确的错误处理和降级策略，错误日志正确记录，算法计算失败不影响用户体验

**验证方式（高层）**：所有异常场景都有明确的错误处理和降级策略，错误日志正确记录

**覆盖 FR/NFR**：NFR-OBS-002（错误日志记录）；NFR-REL-001（错误处理）；NFR-PERF-002（降级策略）

**依赖**：ST-001（算法实现）

### ST-006 任务

- [ ] T600 [ST-006] 实现算法计算异常处理（路径：`app/src/main/java/com/jacky/verity/algorithm/core/sm2/SM2Algorithm.kt`）
  - **依赖**：T104
  - **步骤**：
    - 1) 捕获计算溢出异常，使用边界值
    - 2) 捕获除零异常，使用默认参数
    - 3) 捕获其他计算异常，使用降级策略（默认参数或上次成功结果）
    - 4) 记录错误日志（错误类型、输入参数、异常详情）
  - **验证**：
    - [ ] 所有异常场景都有明确的错误处理（单元测试）
    - [ ] 错误日志正确记录（符合 NFR-OBS-002）
    - [ ] 降级策略生效（算法计算失败不影响用户体验）
  - **产物**：`SM2Algorithm.kt`（更新）

- [ ] T601 [ST-006] 实现数据损坏异常处理（路径：`app/src/main/java/com/jacky/verity/algorithm/data/repository/LearningStateRepository.kt`）
  - **依赖**：T203
  - **步骤**：
    - 1) 实现数据校验逻辑（检查数据格式、字段完整性）
    - 2) 数据损坏时使用默认参数重新初始化
    - 3) 记录错误日志（错误类型、数据详情）
  - **验证**：
    - [ ] 数据损坏异常处理正确（单元测试）
    - [ ] 错误日志正确记录
  - **产物**：`LearningStateRepository.kt`（更新）

- [ ] T602 [ST-006] 实现参数无效异常处理（路径：`app/src/main/java/com/jacky/verity/algorithm/domain/calculator/ReviewCalculator.kt`）
  - **依赖**：T300
  - **步骤**：
    - 1) 实现参数校验逻辑（单词 ID 有效性、学习状态有效性）
    - 2) 参数无效时返回错误 Result，使用默认参数
    - 3) 记录警告日志
  - **验证**：
    - [ ] 参数无效异常处理正确（单元测试）
    - [ ] 警告日志正确记录
  - **产物**：`ReviewCalculator.kt`（更新）

- [ ] T603 [ST-006] 实现计算超时处理（路径：`app/src/main/java/com/jacky/verity/algorithm/core/sm2/SM2Algorithm.kt`）
  - **依赖**：T104
  - **步骤**：
    - 1) 实现计算超时保护（限制计算时间 100ms）
    - 2) 超时使用默认参数或上次成功结果
    - 3) 记录超时日志
  - **验证**：
    - [ ] 计算超时处理正确（单元测试）
    - [ ] 超时日志正确记录
  - **产物**：`SM2Algorithm.kt`（更新）

**检查点**：ST-006 完成——错误处理和异常场景完成，可独立测试

---

## 阶段 9：Story ST-007 - 数据持久化和生命周期管理（类型：Infrastructure）

**目标**：数据能够可靠持久化，应用重启后恢复，内存占用符合要求（≤ 30MB）

**验证方式（高层）**：数据持久化正常，应用重启后恢复，内存占用符合要求

**覆盖 FR/NFR**：NFR-REL-002（数据持久化）；NFR-MEM-001/002（内存生命周期）

**依赖**：ST-002（学习状态管理）

### ST-007 任务

- [ ] T700 [ST-007] 实现应用生命周期监听（路径：`app/src/main/java/com/jacky/verity/algorithm/domain/manager/LearningStateManager.kt`）
  - **依赖**：T205
  - **步骤**：
    - 1) 监听应用生命周期（使用 AndroidX Lifecycle）
    - 2) 应用退出前保存所有学习状态到数据库
    - 3) 应用启动时从数据库恢复学习状态
  - **验证**：
    - [ ] 应用退出前数据保存成功（集成测试）
    - [ ] 应用启动后数据恢复成功（集成测试）
  - **产物**：`LearningStateManager.kt`（更新）

- [ ] T701 [ST-007] 实现内存缓存生命周期管理（路径：`app/src/main/java/com/jacky/verity/algorithm/data/repository/LearningStateRepository.kt`）
  - **依赖**：T203
  - **步骤**：
    - 1) 实现缓存限制（最多 10000 个学习状态）
    - 2) 超出限制时使用数据库查询
    - 3) 已掌握单词的状态数据可归档或清理
    - 4) 应用退出时清理缓存
  - **验证**：
    - [ ] 内存占用 ≤ 30MB（使用 Android Profiler 测试，10000 个单词状态）
    - [ ] 缓存限制生效
    - [ ] 已掌握单词状态清理正确
  - **产物**：`LearningStateRepository.kt`（更新）

- [ ] T702 [ST-007] 实现数据持久化可靠性保证（路径：`app/src/main/java/com/jacky/verity/algorithm/data/database/LearningDatabase.kt`）
  - **依赖**：T202
  - **步骤**：
    - 1) 使用 Room 事务确保数据一致性
    - 2) 关键操作前检查数据库可用性
    - 3) 实现数据恢复机制（数据损坏时使用默认参数）
  - **验证**：
    - [ ] 数据持久化可靠性测试通过（集成测试）
    - [ ] 数据恢复机制正确
  - **产物**：`LearningDatabase.kt`（更新）

- [ ] T703 [ST-007] 实现算法计算临时内存管理（路径：`app/src/main/java/com/jacky/verity/algorithm/core/sm2/SM2Algorithm.kt`）
  - **依赖**：T104
  - **步骤**：
    - 1) 确保算法计算使用临时内存
    - 2) 计算完成后立即释放内存
    - 3) 批量计算分批处理，限制并发数
  - **验证**：
    - [ ] 算法计算临时内存正确释放（内存分析工具测试）
    - [ ] 不增加常驻内存
  - **产物**：`SM2Algorithm.kt`（更新）

**检查点**：ST-007 完成——数据持久化和生命周期管理完成，可独立测试

---

## 阶段 10：集成与优化

**目标**：完成算法引擎接口实现，集成所有 Story，优化性能和内存

- [ ] T800 实现算法引擎接口实现类（路径：`app/src/main/java/com/jacky/verity/algorithm/api/SpacedRepetitionEngineImpl.kt`）
  - **依赖**：T501、T703
  - **步骤**：
    - 1) 实现 `SpacedRepetitionEngine` 接口
    - 2) 集成所有 Story 的功能（SM-2 算法、学习状态管理、复习时机计算、记忆强度评估、复习列表生成）
    - 3) 实现接口方法（`calculateNextReview`、`getLearningTaskList`、`updateLearningState`、`getLearningState`、`getReviewList`）
  - **验证**：
    - [ ] 接口实现完整（集成测试）
    - [ ] 所有接口方法正常工作
  - **产物**：`SpacedRepetitionEngineImpl.kt`

- [ ] T801 创建依赖注入模块（路径：`app/src/main/java/com/jacky/verity/algorithm/di/AlgorithmModule.kt`）
  - **依赖**：T800
  - **步骤**：
    - 1) 使用 Hilt 或 Koin 创建依赖注入模块
    - 2) 提供算法引擎单例
    - 3) 提供数据库、Repository、Manager 等依赖
  - **验证**：
    - [ ] 依赖注入正常工作
  - **产物**：`AlgorithmModule.kt`

- [ ] T802 性能优化和内存优化（路径：相关文件）
  - **依赖**：T801
  - **步骤**：
    - 1) 优化算法计算性能（批量计算优化）
    - 2) 优化数据库查询性能（索引优化）
    - 3) 优化内存占用（缓存策略优化）
    - 4) 验证所有 NFR 指标
  - **验证**：
    - [ ] 复习时机计算 p95 ≤ 10ms（性能测试）
    - [ ] 批量计算（1000 个单词）p95 ≤ 500ms（性能测试）
    - [ ] 学习任务列表生成 p95 ≤ 200ms（性能测试）
    - [ ] 内存峰值 ≤ 30MB（内存分析工具测试）
    - [ ] 功耗 ≤ 2mAh/天（Top5% 用户模型）
  - **产物**：优化后的代码

---

## 依赖关系与执行顺序

### 阶段依赖

- **环境搭建（阶段 1）**：无依赖——可立即启动
- **核心基础（阶段 2）**：依赖环境搭建完成——阻塞所有 Story
- **Story（阶段 3+）**：均依赖核心基础阶段完成
    - ST-001：无 Story 依赖，可立即启动
    - ST-002：依赖 ST-001
    - ST-003：依赖 ST-001、ST-002
    - ST-004：依赖 ST-002
    - ST-005：依赖 ST-002、ST-003、ST-004
    - ST-006：依赖 ST-001
    - ST-007：依赖 ST-002
- **集成与优化（阶段 10）**：依赖所有 Story 完成

### Story 依赖

- **ST-001**：依赖阶段 2 完成
- **ST-002**：依赖 ST-001 和阶段 2
- **ST-003**：依赖 ST-001、ST-002 和阶段 2
- **ST-004**：依赖 ST-002 和阶段 2
- **ST-005**：依赖 ST-002、ST-003、ST-004 和阶段 2
- **ST-006**：依赖 ST-001 和阶段 2
- **ST-007**：依赖 ST-002 和阶段 2

### 单 Story 内部顺序

- 数据模型/实体开发先于 Repository 层
- Repository 层开发先于 Domain 层
- Domain 层开发先于 Core 层
- 核心功能实现先于集成工作
- 日志和错误处理在核心功能完成后添加

### 并行执行场景

- 所有标记 [P] 的环境搭建任务可并行
- 所有标记 [P] 的核心基础任务可并行（阶段 2 内）
- 核心基础阶段完成后，ST-001 可立即启动
- ST-001 完成后，ST-002 和 ST-006 可并行启动
- ST-002 完成后，ST-003、ST-004、ST-007 可并行启动
- ST-003 和 ST-004 完成后，ST-005 可启动
- 单 Story 内标记 [P] 的任务可并行

---

## 并行示例：Story ST-001

```bash
# 批量启动 ST-001 的可并行任务：
任务："[ST-001] 创建算法参数数据类，路径：app/src/main/java/com/jacky/verity/algorithm/core/sm2/AlgorithmParameters.kt"
任务："[ST-001] 创建 SM-2 算法核心实现，路径：app/src/main/java/com/jacky/verity/algorithm/core/sm2/SM2Algorithm.kt"
```

---

## 落地策略

### 先完成 MVP（优先完成关键 Story 集合）

1. 完成阶段 1：环境搭建
2. 完成阶段 2：核心基础（关键——阻塞所有故事）
3. 完成阶段 3：Story ST-001（SM-2 算法实现）
4. 完成阶段 4：Story ST-002（学习状态管理）
5. **暂停并验证**：独立验证 ST-001 和 ST-002
6. 如就绪，进行部署/演示（MVP！）

### 增量交付

1. 完成环境搭建 + 核心基础 → 基础层就绪
2. 新增 ST-001 → 独立验证 → 部署/演示
3. 新增 ST-002 → 独立验证 → 部署/演示
4. 新增 ST-003 → 独立验证 → 部署/演示
5. 新增 ST-004 → 独立验证 → 部署/演示
6. 新增 ST-005 → 独立验证 → 部署/演示
7. 新增 ST-006 → 独立验证 → 部署/演示
8. 新增 ST-007 → 独立验证 → 部署/演示
9. 每个 Story 均需在不破坏已有 Story 的前提下新增价值

### 团队并行策略

多开发者协作场景：

1. 团队共同完成环境搭建 + 核心基础
2. 核心基础完成后：
    - 开发者 A：负责 ST-001
3. ST-001 完成后：
    - 开发者 A：负责 ST-002
    - 开发者 B：负责 ST-006
4. ST-002 完成后：
    - 开发者 A：负责 ST-003
    - 开发者 B：负责 ST-004
    - 开发者 C：负责 ST-007
5. ST-003 和 ST-004 完成后：
    - 开发者 A：负责 ST-005
6. 各 Story 独立完成并集成

---

## 备注

- [P] 标记的任务 = 涉及不同文件，无依赖关系
- [ST-xxx] 标签将任务关联至 Plan 的 Story，便于追溯
- 每个 Story 需可独立完成、独立验证
- 实现前验证测试用例执行失败
- 完成单个任务或逻辑分组后提交代码
- 可在任意检查点暂停，独立验证对应故事
- 避免：模糊的任务描述、同一文件冲突、破坏独立性的跨故事依赖
