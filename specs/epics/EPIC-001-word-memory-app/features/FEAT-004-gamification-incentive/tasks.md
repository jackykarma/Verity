# Tasks：游戏化与激励机制

**Epic**：EPIC-001 - 无痛记忆单词神器APP
**Feature ID**：FEAT-004
**Feature Version**：v0.1.0（来自 `spec.md`）
**Plan Version**：v0.1.0（来自 `plan.md`）
**Tasks Version**：v0.1.0
**输入**：来自 `Feature 目录/` 的设计文档（`spec.md`、`plan.md` 以及可选工件）

> 规则：
> - Task 只能拆解与执行 Plan 的既定 Story；**禁止**在 tasks.md 里改写 Plan 的技术决策或新增未决策的方案。
> - 每个 Task 必须包含：执行步骤、依赖关系（顺序/并行）、验证方式（可执行/可量化）。
> - 若 plan.md 已包含 Story 二层详细设计（Story Detailed Design / L2）：每个 Task 必须提供**设计引用**（指向 plan.md 对应 ST-xxx 的小节/图表/异常矩阵）。

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

- **移动端**：`app/src/main/java/com/jacky/verity/gamification/`

## 阶段 0：准备（可选但建议）

**目标**：对齐版本、冻结设计输入，避免 Implement 期返工

- [ ] T001 在 `specs/epics/EPIC-001-word-memory-app/features/FEAT-004-gamification-incentive/` 中核对 `spec.md`、`plan.md` 的 Version 字段一致性并补齐变更记录
  - **依赖**：无
  - **设计引用**：N/A
  - **步骤**：
    - 1) 确认 `Feature Version`（v0.1.0）、`Plan Version`（v0.1.0）已填写
    - 2) 确认 Plan 的 Story Breakdown 已完成（ST-001 到 ST-005）
    - 3) 确认 Plan 的 Story Detailed Design 已完成（ST-001、ST-002 详细设计）
  - **验证**：
    - [ ] tasks.md 中 `Plan Version`（v0.1.0）与 plan.md 一致
    - [ ] tasks.md 中 `Feature Version`（v0.1.0）与 spec.md 一致
  - **产物**：`spec.md`、`plan.md`、`tasks.md`

---

## 阶段 1：环境搭建（共享基础设施）

**目标**：项目初始化与基础结构搭建

- [ ] T010 按照 plan.md 的"源代码结构"创建游戏化模块目录结构（路径：`app/src/main/java/com/jacky/verity/gamification/`）
  - **依赖**：T001
  - **设计引用**：plan.md:B7 源代码结构
  - **步骤**：
    - 1) 创建 `gamification/` 目录及其子目录：`ui/`、`viewmodel/`、`domain/`、`calculator/`、`data/`、`di/`
    - 2) 创建子目录：`ui/achievement/`、`ui/points/`、`ui/progress/`、`data/repository/`、`data/local/`、`data/database/dao/`、`data/database/entity/`
    - 3) 确保与现有模块边界一致（不冲突）
  - **验证**：
    - [ ] 目录结构与 plan.md:B7 源代码结构一致
    - [ ] 所有子目录已创建
  - **产物**：目录结构

- [ ] T011 初始化构建与依赖（路径：`app/build.gradle.kts`）
  - **依赖**：T010
  - **设计引用**：plan.md:B1 技术背景
  - **步骤**：
    - 1) 添加 Kotlin 2.x 依赖（如未添加）
    - 2) 添加 Jetpack Compose 依赖（如未添加）
    - 3) 添加 Room 数据库依赖：`implementation("androidx.room:room-runtime:2.6.1")`、`kapt("androidx.room:room-compiler:2.6.1")`、`implementation("androidx.room:room-ktx:2.6.1")`
    - 4) 添加 Kotlin Coroutines 依赖：`implementation("org.jetbrains.kotlinx:kotlinx-coroutines-android:1.7.3")`
    - 5) 添加 Flow 依赖（Kotlin Coroutines 已包含）
  - **验证**：
    - [ ] 基础构建可通过（`./gradlew build`）
    - [ ] 依赖下载成功
  - **产物**：`app/build.gradle.kts`

- [ ] T012 [P] 配置代码检查与格式化工具（路径：`.editorconfig`、`app/.editorconfig`）
  - **依赖**：T011
  - **设计引用**：N/A
  - **步骤**：
    - 1) 配置 Kotlin 代码风格（4 空格缩进、120 字符行宽）
    - 2) 配置 Jetpack Compose 代码风格
  - **验证**：
    - [ ] Kotlin/Compose 代码格式检查可通过
  - **产物**：`.editorconfig`、`app/.editorconfig`

---

## 阶段 2：核心基础（阻塞性前置条件，阻塞所有 Story）

**目标**：所有用户故事实现前必须完成的核心基础设施搭建（ST-005：数据模型和存储实现）

**⚠️ 关键**：此阶段完成前，任何用户故事相关工作均不可启动

- [ ] T020 [ST-005] 创建游戏化数据模型（路径：`app/src/main/java/com/jacky/verity/gamification/data/model/Achievement.kt`、`Points.kt`、`Level.kt`、`Progress.kt`）
  - **依赖**：T012
  - **设计引用**：plan.md:B3.2 物理数据结构、plan.md:Story Detailed Design:ST-005
  - **步骤**：
    - 1) 创建 `Achievement` data class（id、name、description、icon、conditionType、conditionThreshold、pointsReward、isUnlocked、unlockedAt）
    - 2) 创建 `Points` data class（userId、totalPoints、updatedAt）
    - 3) 创建 `Level` data class（userId、levelId、levelName、updatedAt）
    - 4) 创建 `Progress` data class（overallProgress、milestones、recentMilestone）
    - 5) 创建 `PointsHistory` data class（id、userId、pointsChange、reason、totalPoints、createdAt）
    - 6) 创建 `AchievementHistory` data class（id、achievementId、userId、unlockedAt）
  - **验证**：
    - [ ] 数据模型与 plan.md:B3.2 字段说明一致
    - [ ] 数据模型可编译通过
  - **产物**：数据模型文件

- [ ] T021 [P] [ST-005] 创建 Room 数据库实体（路径：`app/src/main/java/com/jacky/verity/gamification/data/database/entity/AchievementEntity.kt`、`PointsEntity.kt`、`LevelEntity.kt`、`PointsHistoryEntity.kt`、`AchievementHistoryEntity.kt`）
  - **依赖**：T020
  - **设计引用**：plan.md:B3.2 物理数据结构（表结构清单、字段说明）
  - **步骤**：
    - 1) 创建 `AchievementEntity`（@Entity，表名 `achievements`，主键 id、user_id）
    - 2) 创建 `PointsEntity`（@Entity，表名 `points`，主键 user_id）
    - 3) 创建 `LevelEntity`（@Entity，表名 `level`，主键 user_id）
    - 4) 创建 `PointsHistoryEntity`（@Entity，表名 `points_history`，主键 id，索引 user_id、created_at）
    - 5) 创建 `AchievementHistoryEntity`（@Entity，表名 `achievement_history`，主键 id，索引 achievement_id、user_id、unlocked_at）
    - 6) 添加索引注解（@Index）
  - **验证**：
    - [ ] Entity 与 plan.md:B3.2 表结构一致
    - [ ] Entity 可编译通过
  - **产物**：Room Entity 文件

- [ ] T022 [ST-005] 创建 Room DAO 接口（路径：`app/src/main/java/com/jacky/verity/gamification/data/database/dao/AchievementDao.kt`、`PointsDao.kt`、`LevelDao.kt`、`PointsHistoryDao.kt`、`AchievementHistoryDao.kt`）
  - **依赖**：T021
  - **设计引用**：plan.md:A3.4 模块：DataSource 层（UML 类图）
  - **步骤**：
    - 1) 创建 `AchievementDao`（@Dao，方法：getAllAchievements()、getUnlockedAchievements()、insertAchievements()、updateAchievement()）
    - 2) 创建 `PointsDao`（@Dao，方法：getPoints()、insertPoints()、updatePoints()）
    - 3) 创建 `LevelDao`（@Dao，方法：getLevel()、insertLevel()、updateLevel()）
    - 4) 创建 `PointsHistoryDao`（@Dao，方法：insertPointsHistory()、getPointsHistory(limit: Int)）
    - 5) 创建 `AchievementHistoryDao`（@Dao，方法：insertAchievementHistory()、getAchievementHistory(limit: Int)）
    - 6) 添加 @Query 注解和 SQL 语句
    - 7) 添加事务注解（@Transaction）用于批量操作
  - **验证**：
    - [ ] DAO 接口与 plan.md:A3.4 模块：DataSource 层一致
    - [ ] DAO 可编译通过
  - **产物**：Room DAO 文件

- [ ] T023 [ST-005] 创建 Room 数据库类（路径：`app/src/main/java/com/jacky/verity/gamification/data/database/GamificationDatabase.kt`）
  - **依赖**：T022
  - **设计引用**：plan.md:B3.2 数据库迁移与兼容策略
  - **步骤**：
    - 1) 创建 `@Database(entities = [...], version = 1)` 类
    - 2) 定义 abstract 方法返回所有 DAO
    - 3) 创建数据库实例（单例模式，使用 Room.databaseBuilder）
    - 4) 配置数据库迁移策略（Migration 1，初始版本，无需迁移）
  - **验证**：
    - [ ] 数据库类可编译通过
    - [ ] 数据库版本为 v1（与 plan.md 一致）
  - **产物**：`GamificationDatabase.kt`

- [ ] T024 [P] [ST-005] 创建数据源层（DataSource）（路径：`app/src/main/java/com/jacky/verity/gamification/data/local/AchievementLocalDataSource.kt`、`PointsLocalDataSource.kt`、`LevelLocalDataSource.kt`）
  - **依赖**：T023
  - **设计引用**：plan.md:A3.4 模块：DataSource 层（UML 类图、时序图-成功、时序图-异常、异常清单）
  - **步骤**：
    - 1) 创建 `AchievementLocalDataSource`（依赖 `AchievementDao`、`AchievementHistoryDao`，实现数据访问方法）
    - 2) 创建 `PointsLocalDataSource`（依赖 `PointsDao`、`PointsHistoryDao`，实现数据访问方法）
    - 3) 创建 `LevelLocalDataSource`（依赖 `LevelDao`，实现数据访问方法）
    - 4) 实现错误处理（捕获 SQLiteException，转换为 DataCorruptionError/DatabaseError）
    - 5) 实现事务支持（使用 Room 的 @Transaction 注解）
  - **验证**：
    - [ ] DataSource 与 plan.md:A3.4 模块：DataSource 层设计一致
    - [ ] DataSource 可编译通过
    - [ ] 单元测试覆盖异常场景（见 plan.md:A3.4 模块：DataSource 层异常清单）
  - **产物**：DataSource 文件

- [ ] T025 [ST-005] 创建 Repository 层（路径：`app/src/main/java/com/jacky/verity/gamification/data/repository/GamificationRepository.kt`）
  - **依赖**：T024
  - **设计引用**：plan.md:A3.4 模块：Repository 层（UML 类图、时序图-成功、时序图-异常、异常清单）
  - **步骤**：
    - 1) 创建 `GamificationRepository`（依赖所有 DataSource，统一数据访问接口）
    - 2) 实现缓存策略（内存缓存成就列表、等级配置）
    - 3) 实现事务管理（成就解锁和积分保存使用事务保证原子性）
    - 4) 实现错误处理（捕获 DataSource 错误，转换为 Repository 错误）
    - 5) 实现并发控制（使用 Mutex 保护共享状态，重试机制处理冲突）
  - **验证**：
    - [ ] Repository 与 plan.md:A3.4 模块：Repository 层设计一致
    - [ ] Repository 可编译通过
    - [ ] 单元测试覆盖异常场景（见 plan.md:A3.4 模块：Repository 层异常清单）
  - **产物**：`GamificationRepository.kt`

- [ ] T026 [ST-005] 创建成就配置和等级配置（路径：`app/src/main/java/com/jacky/verity/gamification/calculator/AchievementConfig.kt`、`LevelConfig.kt`）
  - **依赖**：T025
  - **设计引用**：plan.md:A3.4 模块：Calculator 层（核心数据结构/状态）
  - **步骤**：
    - 1) 创建 `AchievementConfig` 数据类（成就ID、名称、描述、解锁条件、积分奖励）
    - 2) 创建 `LevelConfig` 数据类（等级ID、等级名称、所需积分、等级图标）
    - 3) 硬编码成就配置列表（100 个成就定义：学习天数成就、连续学习成就、单词数量成就、学习时长成就等）
    - 4) 硬编码等级配置列表（20 个等级定义：Lv.1 到 Lv.20，积分阈值递增）
  - **验证**：
    - [ ] 成就配置与 plan.md 成就类型一致（学习天数、连续学习、单词数量、学习时长）
    - [ ] 等级配置与 plan.md 一致（20 个等级）
    - [ ] 配置可编译通过
  - **产物**：配置文件

**检查点**：基础层就绪——数据模型、数据库、Repository 层已完成，用户故事实现可并行启动

---

## 阶段 3：Story ST-005 - 数据模型和存储实现（类型：Infrastructure）

**目标**：建立完整的数据存储和访问基础设施，支持成就、积分、等级数据的持久化

**验证方式（高层）**：
- 功能验收：成就、积分、等级数据正确保存和查询，数据持久化正常
- 可靠性验收：应用重启后数据恢复，数据损坏时能够修复
- 性能验收：数据库查询时间 ≤ 5ms（p95），数据保存时间 ≤ 10ms（p95）

### ST-005 任务（已在阶段 2 完成）

> 说明：ST-005 作为基础设施，已在阶段 2（核心基础）完成，包括：
> - T020-T026：数据模型、Room 数据库、Repository 层

**检查点**：ST-005 完成——数据存储基础设施就绪，其他 Story 可依赖本 Story

---

## 阶段 4：Story ST-001 - 成就系统实现（类型：Functional）

**目标**：用户完成学习任务后，系统自动检查并解锁符合条件的成就，显示解锁动画和提示

**验证方式（高层）**：
- 功能验收：用户完成学习后看到成就解锁提示，成就列表显示已解锁成就
- 性能验收：成就检查计算时间 ≤ 100ms（p95），成就列表加载时间 ≤ 300ms（p95）
- 可靠性验收：成就检查准确率 100%，成就解锁数据正确持久化

### ST-001 任务

- [ ] T100 [P] [ST-001] 创建成就计算器（路径：`app/src/main/java/com/jacky/verity/gamification/calculator/AchievementCalculator.kt`）
  - **依赖**：T026
  - **设计引用**：plan.md:A3.4 模块：Calculator 层（UML 类图、时序图-成功、时序图-异常、异常清单）、plan.md:Story Detailed Design:ST-001
  - **步骤**：
    - 1) 创建 `AchievementCalculator` 类（依赖成就配置列表）
    - 2) 实现 `checkAchievementConditions(statistics: LearningStatistics, currentAchievements: List<Achievement>): List<Achievement>` 方法
    - 3) 实现成就条件检查逻辑（遍历成就配置，检查解锁条件：学习天数、连续学习天数、单词数量、学习时长）
    - 4) 实现去重逻辑（排除已解锁成就）
    - 5) 实现错误处理（捕获计算异常，转换为 CalculationError）
    - 6) 实现超时检测（检查耗时 > 100ms 时记录警告）
  - **验证**：
    - [ ] 单元测试覆盖所有成就类型和解锁条件（见 plan.md:Story Detailed Design:ST-001:8) 验证与测试设计）
    - [ ] 单元测试覆盖异常场景（统计数据为空、成就配置缺失、计算超时、条件判断异常）
    - [ ] 性能测试：成就检查计算时间 p95 ≤ 100ms（100 次迭代，模拟 100 个成就定义）
    - [ ] 准确率测试：成就检查准确率 100%（不误解锁、不漏解锁）
  - **产物**：`AchievementCalculator.kt`

- [ ] T101 [ST-001] 创建成就检查用例（路径：`app/src/main/java/com/jacky/verity/gamification/domain/CheckAchievementUseCase.kt`）
  - **依赖**：T100、T025
  - **设计引用**：plan.md:A3.4 模块：Domain 层（UseCase）（UML 类图、时序图-成功、时序图-异常、异常清单）、plan.md:Story Detailed Design:ST-001:5) 动态交互设计
  - **步骤**：
    - 1) 创建 `CheckAchievementUseCase` 类（依赖 `GamificationRepository`、`AchievementCalculator`、`LearningStatsRepository`）
    - 2) 实现 `execute(learningData: LearningData): Result<List<Achievement>>` suspend 方法
    - 3) 实现成就检查流程（获取学习统计数据 → 加载当前成就列表 → 调用 Calculator 检查 → 解锁成就 → 保存到数据库）
    - 4) 实现事务管理（使用 Repository 事务保证成就解锁和保存的原子性）
    - 5) 实现错误处理（学习数据不可用 → 降级处理；成就计算异常 → 记录日志；数据库保存失败 → 重试）
    - 6) 实现并发控制（使用队列化处理，一次只处理一个用户的成就检查）
  - **验证**：
    - [ ] 单元测试覆盖成功流程（Mock Repository 和 LearningStatsRepository）
    - [ ] 单元测试覆盖异常场景（学习统计数据不可用、成就计算异常、数据库保存失败、并发操作冲突）
    - [ ] 集成测试覆盖完整流程（学习 → 成就检查 → 解锁 → 动画）
  - **产物**：`CheckAchievementUseCase.kt`

- [ ] T102 [P] [ST-001] 创建获取成就列表用例（路径：`app/src/main/java/com/jacky/verity/gamification/domain/GetAchievementsUseCase.kt`）
  - **依赖**：T025
  - **设计引用**：plan.md:A3.4 模块：Domain 层（UseCase）、plan.md:Story Detailed Design:ST-001
  - **步骤**：
    - 1) 创建 `GetAchievementsUseCase` 类（依赖 `GamificationRepository`）
    - 2) 实现 `execute(): Result<List<Achievement>>` suspend 方法
    - 3) 实现缓存策略（首次加载后缓存，成就解锁时更新缓存）
    - 4) 实现错误处理（数据库查询失败 → 记录日志，返回错误）
  - **验证**：
    - [ ] 单元测试覆盖成功流程和异常场景
    - [ ] 性能测试：成就列表加载时间 p95 ≤ 300ms
  - **产物**：`GetAchievementsUseCase.kt`

- [ ] T103 [ST-001] 创建成就 ViewModel（路径：`app/src/main/java/com/jacky/verity/gamification/viewmodel/AchievementViewModel.kt`）
  - **依赖**：T101、T102
  - **设计引用**：plan.md:A3.4 模块：ViewModel 层（UML 类图、时序图-成功、时序图-异常、异常清单）、plan.md:Story Detailed Design:ST-001
  - **步骤**：
    - 1) 创建 `AchievementViewModel` 类（依赖 `CheckAchievementUseCase`、`GetAchievementsUseCase`）
    - 2) 创建 UI State：`_uiState: MutableStateFlow<AchievementListState>`、`uiState: StateFlow<AchievementListState>`
    - 3) 创建动画触发器：`_unlockAnimationTrigger: MutableStateFlow<Achievement?>`、`unlockAnimationTrigger: StateFlow<Achievement?>`
    - 4) 实现 `onLearningCompleted(learningData: LearningData)` 方法（调用 UseCase 检查成就，更新 StateFlow）
    - 5) 实现 `loadAchievements()` 方法（调用 UseCase 获取成就列表）
    - 6) 实现 `retry()` 方法（错误重试）
    - 7) 实现错误处理（UseCase 错误转换为 UI 错误状态）
    - 8) 实现协程取消处理（用户离开页面时清理状态）
  - **验证**：
    - [ ] ViewModel 与 plan.md:A3.4 模块：ViewModel 层设计一致
    - [ ] ViewModel 可编译通过
    - [ ] 单元测试覆盖状态更新和错误处理
  - **产物**：`AchievementViewModel.kt`

- [ ] T104 [ST-001] 创建成就列表界面（路径：`app/src/main/java/com/jacky/verity/gamification/ui/achievement/AchievementScreen.kt`）
  - **依赖**：T103
  - **设计引用**：plan.md:A3.4 模块：UI 层（Jetpack Compose）（UML 类图、时序图-成功、时序图-异常、异常清单）、plan.md:Story Detailed Design:ST-001
  - **步骤**：
    - 1) 创建 `AchievementScreen` Composable 函数（依赖 `AchievementViewModel`）
    - 2) 实现成就列表展示（使用 LazyColumn 虚拟化长列表，展示成就名称、描述、图标、解锁状态）
    - 3) 实现状态观察（使用 `collectAsState` 观察 ViewModel 状态）
    - 4) 实现加载状态和错误提示（显示加载中、错误消息）
    - 5) 实现动画触发器（观察 `unlockAnimationTrigger`，播放解锁动画）
    - 6) 实现解锁动画（使用 Jetpack Compose Animation API，`AnimatedVisibility`、`animateAsState`）
    - 7) 实现错误降级（动画资源加载失败 → 降级为静态图标显示）
  - **验证**：
    - [ ] UI 与 plan.md:A3.4 模块：UI 层设计一致
    - [ ] UI 可编译通过
    - [ ] 手动测试：成就列表正确展示，解锁动画流畅（60fps）
    - [ ] 性能测试：列表加载时间 p95 ≤ 300ms
    - [ ] 内存测试：动画资源播放完成后立即释放
  - **产物**：`AchievementScreen.kt`

- [ ] T105 [ST-001] 创建成就解锁动画组件（路径：`app/src/main/java/com/jacky/verity/gamification/ui/achievement/AnimatedAchievementUnlock.kt`）
  - **依赖**：T104
  - **设计引用**：plan.md:A3.4 模块：UI 层（UML 类图）、plan.md:Story Detailed Design:ST-001
  - **步骤**：
    - 1) 创建 `AnimatedAchievementUnlock` Composable 函数（参数：achievement: Achievement）
    - 2) 实现解锁动画（使用 Compose Animation API：缩放动画、淡入动画、粒子效果等）
    - 3) 实现动画资源管理（动画播放完成后立即释放资源，使用 DisposableEffect）
    - 4) 实现错误降级（动画资源加载失败 → 降级为静态提示）
  - **验证**：
    - [ ] 动画播放流畅（60fps，使用 FrameMetrics 测量）
    - [ ] 动画资源及时释放（内存测试验证）
    - [ ] 错误降级有效（手动测试动画资源加载失败场景）
  - **产物**：`AnimatedAchievementUnlock.kt`

**检查点**：ST-001 完成——用户完成学习后看到成就解锁提示，成就列表显示已解锁成就，成就检查计算时间 ≤ 100ms（p95），成就列表加载时间 ≤ 300ms（p95），成就检查准确率 100%

---

## 阶段 5：Story ST-002 - 积分系统实现（类型：Functional）

**目标**：用户学习行为产生积分，积分实时累计和更新，显示积分变化

**验证方式（高层）**：
- 功能验收：用户学习后积分增加，积分历史记录正确保存
- 性能验收：积分计算时间 ≤ 50ms（p95）
- 可靠性验收：积分计算准确率 100%，积分数据与学习数据一致

### ST-002 任务

- [ ] T200 [P] [ST-002] 创建积分计算器（路径：`app/src/main/java/com/jacky/verity/gamification/calculator/PointsCalculator.kt`）
  - **依赖**：T026、T025
  - **设计引用**：plan.md:A3.4 模块：Calculator 层（PointsCalculator）、plan.md:Story Detailed Design:ST-002
  - **步骤**：
    - 1) 创建 `PointsCalculator` 类（依赖积分规则配置）
    - 2) 实现 `calculatePoints(learningData: LearningData): Int` 方法
    - 3) 实现积分规则计算（学习单词 +10、完成复习 +5、连续学习 +20 等）
    - 4) 实现错误处理（捕获计算异常，转换为 CalculationError）
  - **验证**：
    - [ ] 单元测试覆盖所有积分规则和边界情况
    - [ ] 性能测试：积分计算时间 p95 ≤ 50ms（100 次迭代）
    - [ ] 准确率测试：积分计算准确率 100%（与学习数据一致）
  - **产物**：`PointsCalculator.kt`

- [ ] T201 [ST-002] 创建积分计算用例（路径：`app/src/main/java/com/jacky/verity/gamification/domain/CalculatePointsUseCase.kt`）
  - **依赖**：T200、T025
  - **设计引用**：plan.md:A4 流程 2：积分计算与累计流程、plan.md:Story Detailed Design:ST-002:5) 动态交互设计
  - **步骤**：
    - 1) 创建 `CalculatePointsUseCase` 类（依赖 `GamificationRepository`、`PointsCalculator`、`LearningStatsRepository`）
    - 2) 实现 `execute(learningData: LearningData): Result<PointsResult>` suspend 方法
    - 3) 实现积分计算流程（获取学习数据 → 计算积分增量 → 累加积分 → 保存到数据库 → 保存积分历史）
    - 4) 实现事务管理（使用 Repository 事务保证积分累计和保存的原子性）
    - 5) 实现错误处理（学习数据不可用 → 降级处理；积分计算失败 → 记录日志；数据库保存失败 → 重试）
    - 6) 实现并发控制（使用事务重试机制处理并发冲突）
  - **验证**：
    - [ ] 单元测试覆盖成功流程和异常场景
    - [ ] 集成测试覆盖完整流程（学习 → 积分计算 → 保存 → 更新 UI）
    - [ ] 并发测试验证事务原子性
  - **产物**：`CalculatePointsUseCase.kt`

- [ ] T202 [P] [ST-002] 创建获取积分等级用例（路径：`app/src/main/java/com/jacky/verity/gamification/domain/GetPointsLevelUseCase.kt`）
  - **依赖**：T025
  - **设计引用**：plan.md:Story Detailed Design:ST-002
  - **步骤**：
    - 1) 创建 `GetPointsLevelUseCase` 类（依赖 `GamificationRepository`）
    - 2) 实现 `execute(): Result<PointsLevelResult>` suspend 方法
    - 3) 实现缓存策略（积分数据首次加载后缓存，积分变化时更新缓存）
  - **验证**：
    - [ ] 单元测试覆盖成功流程和异常场景
  - **产物**：`GetPointsLevelUseCase.kt`

- [ ] T203 [ST-002] 创建积分等级 ViewModel（路径：`app/src/main/java/com/jacky/verity/gamification/viewmodel/PointsLevelViewModel.kt`）
  - **依赖**：T201、T202
  - **设计引用**：plan.md:A3.4 模块：ViewModel 层、plan.md:Story Detailed Design:ST-002
  - **步骤**：
    - 1) 创建 `PointsLevelViewModel` 类（依赖 `CalculatePointsUseCase`、`GetPointsLevelUseCase`）
    - 2) 创建 UI State：`_uiState: MutableStateFlow<PointsLevelState>`（totalPoints、currentLevel、progressToNextLevel、isLevelUp）
    - 3) 创建动画触发器：`_levelUpAnimationTrigger: MutableStateFlow<Boolean>`
    - 4) 实现 `onPointsUpdated(points: Int)` 方法（调用 UseCase 计算积分，更新 StateFlow）
    - 5) 实现 `loadPointsLevel()` 方法（调用 UseCase 获取积分等级）
    - 6) 实现错误处理
  - **验证**：
    - [ ] ViewModel 可编译通过
    - [ ] 单元测试覆盖状态更新和错误处理
  - **产物**：`PointsLevelViewModel.kt`

**检查点**：ST-002 完成——用户学习后积分增加，积分历史记录正确保存，积分计算时间 ≤ 50ms（p95），积分计算准确率 100%

---

## 阶段 6：Story ST-003 - 等级系统实现（类型：Functional）

**目标**：用户积分达到等级提升条件时，系统显示等级提升动画和奖励提示

**验证方式（高层）**：
- 功能验收：用户积分达到等级提升条件时显示等级提升动画，等级数据正确保存
- 性能验收：等级计算时间 ≤ 20ms（p95）
- 可靠性验收：等级计算准确率 100%，等级数据与积分数据一致

### ST-003 任务

- [ ] T300 [P] [ST-003] 创建等级计算器（路径：`app/src/main/java/com/jacky/verity/gamification/calculator/LevelCalculator.kt`）
  - **依赖**：T026、T025
  - **设计引用**：plan.md:A3.4 模块：Calculator 层（LevelCalculator）、plan.md:A4 流程 3：等级计算与提升流程、plan.md:Story Detailed Design:ST-003
  - **步骤**：
    - 1) 创建 `LevelCalculator` 类（依赖等级配置列表）
    - 2) 实现 `calculateLevel(points: Int): Level` 方法（基于积分阈值配置表查找等级）
    - 3) 实现 `calculateProgressToNextLevel(currentLevel: Level, points: Int): Float` 方法
    - 4) 实现 `checkLevelUp(currentLevel: Level, newPoints: Int): LevelUpResult?` 方法
    - 5) 实现错误处理（等级配置缺失 → 使用默认等级）
  - **验证**：
    - [ ] 单元测试覆盖所有等级配置和边界情况
    - [ ] 性能测试：等级计算时间 p95 ≤ 20ms（100 次迭代）
    - [ ] 准确率测试：等级计算准确率 100%（与积分数据一致）
  - **产物**：`LevelCalculator.kt`

- [ ] T301 [ST-003] 创建等级计算用例（路径：`app/src/main/java/com/jacky/verity/gamification/domain/CalculateLevelUseCase.kt`）
  - **依赖**：T300、T025
  - **设计引用**：plan.md:A4 流程 3：等级计算与提升流程、plan.md:Story Detailed Design:ST-003
  - **步骤**：
    - 1) 创建 `CalculateLevelUseCase` 类（依赖 `GamificationRepository`、`LevelCalculator`）
    - 2) 实现 `execute(points: Int): Result<Level>` suspend 方法
    - 3) 实现等级计算流程（获取当前积分 → 计算等级 → 检查等级提升 → 保存等级 → 保存等级历史）
    - 4) 实现事务管理（使用 Repository 事务保证等级提升和保存的原子性）
    - 5) 实现错误处理（等级计算失败 → 记录日志；数据库保存失败 → 重试）
  - **验证**：
    - [ ] 单元测试覆盖成功流程和异常场景
    - [ ] 集成测试覆盖完整流程（积分变化 → 等级计算 → 提升 → 保存）
  - **产物**：`CalculateLevelUseCase.kt`

- [ ] T302 [ST-003] 创建等级 ViewModel（路径：`app/src/main/java/com/jacky/verity/gamification/viewmodel/LevelViewModel.kt`）
  - **依赖**：T301
  - **设计引用**：plan.md:Story Detailed Design:ST-003
  - **步骤**：
    - 1) 创建 `LevelViewModel` 类（依赖 `CalculateLevelUseCase`）
    - 2) 创建 UI State：`_uiState: MutableStateFlow<LevelState>`（currentLevel、progressToNextLevel、isLevelUp）
    - 3) 创建动画触发器：`_levelUpAnimationTrigger: MutableStateFlow<Boolean>`
    - 4) 实现 `onLevelUp()` 方法（触发等级提升动画）
    - 5) 实现错误处理
  - **验证**：
    - [ ] ViewModel 可编译通过
    - [ ] 单元测试覆盖状态更新和错误处理
  - **产物**：`LevelViewModel.kt`

- [ ] T303 [ST-003] 创建等级提升动画组件（路径：`app/src/main/java/com/jacky/verity/gamification/ui/points/LevelUpAnimation.kt`）
  - **依赖**：T302
  - **设计引用**：plan.md:Story Detailed Design:ST-003、plan.md:A3.4 模块：UI 层
  - **步骤**：
    - 1) 创建 `LevelUpAnimation` Composable 函数（参数：level: Level）
    - 2) 实现等级提升动画（使用 Compose Animation API：等级图标动画、升级提示动画等）
    - 3) 实现动画资源管理（动画播放完成后立即释放资源）
    - 4) 实现错误降级（动画资源加载失败 → 降级为静态提示）
  - **验证**：
    - [ ] 动画播放流畅（60fps）
    - [ ] 动画资源及时释放（内存测试验证）
  - **产物**：`LevelUpAnimation.kt`

**检查点**：ST-003 完成——用户积分达到等级提升条件时显示等级提升动画，等级数据正确保存，等级计算时间 ≤ 20ms（p95），等级计算准确率 100%

---

## 阶段 7：Story ST-004 - 进度可视化实现（类型：Functional）

**目标**：用户能够查看当前积分、等级和距离下一等级的进度条，达成里程碑时显示庆祝动画

**验证方式（高层）**：
- 功能验收：用户能够查看积分、等级和进度条，达成里程碑时显示庆祝动画
- 性能验收：进度可视化渲染时间 ≤ 200ms（p95），动画播放流畅（60fps）
- 内存验收：动画资源播放完成后立即释放，内存占用峰值 ≤ 10MB

### ST-004 任务

- [ ] T400 [P] [ST-004] 创建获取进度用例（路径：`app/src/main/java/com/jacky/verity/gamification/domain/GetProgressUseCase.kt`）
  - **依赖**：T025
  - **设计引用**：plan.md:Story Detailed Design:ST-004
  - **步骤**：
    - 1) 创建 `GetProgressUseCase` 类（依赖 `GamificationRepository`、`LearningStatsRepository`）
    - 2) 实现 `execute(): Result<ProgressResult>` suspend 方法
    - 3) 实现进度计算（获取积分、等级、学习数据 → 计算整体进度 → 计算里程碑）
  - **验证**：
    - [ ] 单元测试覆盖成功流程和异常场景
  - **产物**：`GetProgressUseCase.kt`

- [ ] T401 [ST-004] 创建进度 ViewModel（路径：`app/src/main/java/com/jacky/verity/gamification/viewmodel/ProgressViewModel.kt`）
  - **依赖**：T400
  - **设计引用**：plan.md:Story Detailed Design:ST-004
  - **步骤**：
    - 1) 创建 `ProgressViewModel` 类（依赖 `GetProgressUseCase`）
    - 2) 创建 UI State：`_uiState: MutableStateFlow<ProgressState>`（overallProgress、milestones、recentMilestone）
    - 3) 创建动画触发器：`_milestoneAnimationTrigger: MutableStateFlow<Milestone?>`
    - 4) 实现 `loadProgress()` 方法（调用 UseCase 获取进度）
    - 5) 实现错误处理
  - **验证**：
    - [ ] ViewModel 可编译通过
    - [ ] 单元测试覆盖状态更新和错误处理
  - **产物**：`ProgressViewModel.kt`

- [ ] T402 [ST-004] 创建进度可视化界面（路径：`app/src/main/java/com/jacky/verity/gamification/ui/progress/ProgressScreen.kt`）
  - **依赖**：T401
  - **设计引用**：plan.md:Story Detailed Design:ST-004、plan.md:A3.4 模块：UI 层
  - **步骤**：
    - 1) 创建 `ProgressScreen` Composable 函数（依赖 `ProgressViewModel`）
    - 2) 实现进度条展示（积分进度条、等级进度条、整体学习进度条）
    - 3) 实现里程碑展示（里程碑列表、里程碑状态）
    - 4) 实现状态观察（使用 `collectAsState` 观察 ViewModel 状态）
    - 5) 实现里程碑庆祝动画（使用 Compose Animation API）
    - 6) 实现动画资源管理（动画播放完成后立即释放资源）
  - **验证**：
    - [ ] UI 可编译通过
    - [ ] 手动测试：进度条正确展示，里程碑庆祝动画流畅（60fps）
    - [ ] 性能测试：进度可视化渲染时间 p95 ≤ 200ms
    - [ ] 内存测试：动画资源播放完成后立即释放，内存占用峰值 ≤ 10MB
    - [ ] 功耗测试：动画播放功耗增量 ≤ 3mAh/天（Top5% 用户，每天学习 30 分钟）
  - **产物**：`ProgressScreen.kt`

- [ ] T403 [ST-004] 创建积分等级展示界面（路径：`app/src/main/java/com/jacky/verity/gamification/ui/points/PointsLevelScreen.kt`）
  - **依赖**：T203、T302
  - **设计引用**：plan.md:Story Detailed Design:ST-004、plan.md:A3.4 模块：UI 层
  - **步骤**：
    - 1) 创建 `PointsLevelScreen` Composable 函数（依赖 `PointsLevelViewModel`、`LevelViewModel`）
    - 2) 实现积分展示（总积分显示、积分变化提示）
    - 3) 实现等级展示（当前等级、等级图标、等级名称）
    - 4) 实现进度条展示（距离下一等级的进度条）
    - 5) 实现状态观察和动画触发器
  - **验证**：
    - [ ] UI 可编译通过
    - [ ] 手动测试：积分等级正确展示，进度条实时更新
    - [ ] 性能测试：界面渲染时间 p95 ≤ 200ms
  - **产物**：`PointsLevelScreen.kt`

**检查点**：ST-004 完成——用户能够查看积分、等级和进度条，达成里程碑时显示庆祝动画，进度可视化渲染时间 ≤ 200ms（p95），动画播放流畅（60fps），内存占用峰值 ≤ 10MB

---

## 阶段 8：优化与跨领域关注点

**目标**：性能优化、可观测性、错误处理完善

### 优化任务

- [ ] T500 [ST-001] 性能优化：成就检查算法优化（路径：`app/src/main/java/com/jacky/verity/gamification/calculator/AchievementCalculator.kt`）
  - **依赖**：T100
  - **设计引用**：plan.md:A9 性能评估、plan.md:Story Detailed Design:ST-001
  - **步骤**：
    - 1) 优化成就检查算法（批量检查、提前退出、缓存配置）
    - 2) 实现性能监控（记录计算耗时，超过阈值时记录警告）
  - **验证**：
    - [ ] 性能测试：成就检查计算时间 p95 ≤ 100ms（100 次迭代，模拟 100 个成就定义）
  - **产物**：优化后的 `AchievementCalculator.kt`

- [ ] T501 [ST-002] 性能优化：积分计算算法优化（路径：`app/src/main/java/com/jacky/verity/gamification/calculator/PointsCalculator.kt`）
  - **依赖**：T200
  - **设计引用**：plan.md:A9 性能评估、plan.md:Story Detailed Design:ST-002
  - **步骤**：
    - 1) 优化积分计算算法（缓存积分规则、减少重复计算）
    - 2) 实现性能监控（记录计算耗时）
  - **验证**：
    - [ ] 性能测试：积分计算时间 p95 ≤ 50ms（100 次迭代）
  - **产物**：优化后的 `PointsCalculator.kt`

- [ ] T502 [ST-005] 内存优化：缓存策略优化（路径：`app/src/main/java/com/jacky/verity/gamification/data/repository/GamificationRepository.kt`）
  - **依赖**：T025
  - **设计引用**：plan.md:A10 内存评估、plan.md:Story Detailed Design:ST-005
  - **步骤**：
    - 1) 优化缓存策略（限制缓存大小、LRU 淘汰策略）
    - 2) 实现内存监控（记录内存使用情况）
  - **验证**：
    - [ ] 内存测试：游戏化数据内存占用峰值 ≤ 10MB（Android Profiler 测量）
    - [ ] 内存泄漏测试：无内存泄漏（LeakCanary 检测）
  - **产物**：优化后的 `GamificationRepository.kt`

- [ ] T503 [ST-001, ST-002, ST-003] 可观测性：事件记录系统（路径：`app/src/main/java/com/jacky/verity/gamification/data/observability/GamificationEventLogger.kt`）
  - **依赖**：T101、T201、T301
  - **设计引用**：plan.md:8. 埋点/可观测性设计、plan.md:NFR-OBS-001、NFR-OBS-002
  - **步骤**：
    - 1) 创建事件记录系统（记录成就解锁、积分变化、等级提升事件）
    - 2) 实现错误日志记录（记录计算失败、数据存储失败等错误）
    - 3) 实现结构化日志（使用结构化字段：成就ID、积分变化量、等级等）
    - 4) 实现敏感信息脱敏（不记录学习数据详情，只记录统计信息）
  - **验证**：
    - [ ] 日志测试：验证事件记录正确性（成就解锁、积分变化、等级提升）
    - [ ] 错误处理测试：验证错误日志记录正确性
  - **产物**：`GamificationEventLogger.kt`

- [ ] T504 [ST-001, ST-002, ST-003] 降级策略：学习数据不可用降级处理（路径：`app/src/main/java/com/jacky/verity/gamification/domain/` 相关 UseCase）
  - **依赖**：T101、T201、T301
  - **设计引用**：plan.md:A5 技术风险与消解策略（RISK-001）、plan.md:NFR-PERF-003
  - **步骤**：
    - 1) 实现降级策略（学习数据不可用 → 降级为仅展示基础进度，不计算成就和积分）
    - 2) 实现降级提示（提示用户学习数据不可用）
    - 3) 实现数据恢复机制（依赖就绪后重新计算）
  - **验证**：
    - [ ] 降级测试：验证降级策略有效性（模拟学习数据不可用场景）
  - **产物**：相关 UseCase 文件

**检查点**：优化完成——所有 NFR 指标满足要求（性能、内存、功耗、可观测性）

---

## 依赖关系与执行顺序

### 阶段依赖

- **环境搭建（阶段 1）**：无依赖——可立即启动
- **核心基础（阶段 2）**：依赖环境搭建完成——阻塞所有用户故事
- **用户故事（阶段 3-7）**：
  - **ST-005**（阶段 3）：基础设施，无依赖，其他 Story 依赖它
  - **ST-001**（阶段 4）：依赖 ST-005（数据模型和 Repository）
  - **ST-002**（阶段 5）：依赖 ST-005、ST-001
  - **ST-003**（阶段 6）：依赖 ST-005、ST-002
  - **ST-004**（阶段 7）：依赖 ST-005、ST-002、ST-003
- **优化完善（阶段 8）**：依赖所有目标用户故事完成

### Story 依赖

- **ST-005**：无依赖（基础设施，其他 Story 依赖它）
- **ST-001**：依赖 ST-005（数据模型和 Repository）
- **ST-002**：依赖 ST-005、ST-001
- **ST-003**：依赖 ST-005、ST-002
- **ST-004**：依赖 ST-005、ST-002、ST-003

### 单 Story 内部顺序

- 数据模型/实体开发先于 DAO/Repository
- DAO/Repository 开发先于 UseCase/Calculator
- Calculator 开发先于 UseCase
- UseCase 开发先于 ViewModel
- ViewModel 开发先于 UI
- 核心功能实现先于集成工作
- 功能实现先于性能优化
- 本故事完成后，再推进下一优先级故事

### 并行执行场景

- **阶段 1**：T012 [P]（代码检查配置）可与其他任务并行
- **阶段 2**：T020 [P]、T021 [P]、T024 [P]、T026 [P] 可并行（涉及不同文件）
- **ST-001**：T100 [P]、T102 [P] 可并行
- **ST-002**：T200 [P]、T202 [P] 可并行
- **ST-003**：T300 [P] 可与其他任务并行
- **ST-004**：T400 [P]、T403 [P] 可并行
- **阶段 8**：T500 [P]、T501 [P]、T502 [P]、T503 [P]、T504 [P] 可并行

---

## 并行示例：Story ST-001

```bash
# 批量启动 ST-001 的可并行任务：
任务："[ST-001] 创建成就计算器，路径：app/src/main/java/com/jacky/verity/gamification/calculator/AchievementCalculator.kt"
任务："[ST-001] 创建获取成就列表用例，路径：app/src/main/java/com/jacky/verity/gamification/domain/GetAchievementsUseCase.kt"
```

---

## 落地策略

### 先完成 MVP（优先完成关键 Story 集合）

1. 完成阶段 0：准备（版本对齐）
2. 完成阶段 1：环境搭建
3. 完成阶段 2：核心基础（ST-005：数据模型和存储实现，关键——阻塞所有故事）
4. 完成阶段 4：Story ST-001（成就系统实现）
5. **暂停并验证**：独立验证 ST-001（功能验收、性能验收、可靠性验收）
6. 如就绪，进行演示（MVP！）

### 增量交付

1. 完成环境搭建 + 核心基础（ST-005）→ 基础层就绪
2. 新增 ST-001（成就系统）→ 独立验证 → 演示（MVP！）
3. 新增 ST-002（积分系统）→ 独立验证 → 演示
4. 新增 ST-003（等级系统）→ 独立验证 → 演示
5. 新增 ST-004（进度可视化）→ 独立验证 → 演示
6. 完成优化与跨领域关注点 → 最终交付
7. 每个故事均需在不破坏已有故事的前提下新增价值

### 团队并行策略

多开发者协作场景：

1. 团队共同完成阶段 0-2（准备、环境搭建、核心基础）
2. 核心基础（ST-005）完成后：
   - 开发者 A：负责 ST-001（成就系统）
   - 开发者 B：负责 ST-002（积分系统）
   - 开发者 C：负责 ST-003（等级系统）
   - 开发者 D：负责 ST-004（进度可视化）
3. 各 Story 独立完成并集成
4. 最后完成优化与跨领域关注点（阶段 8）

---

## 任务汇总

### 任务总数

- **总任务数**：54 个任务
- **阶段 0（准备）**：1 个任务
- **阶段 1（环境搭建）**：3 个任务
- **阶段 2（核心基础 / ST-005）**：7 个任务
- **阶段 4（ST-001：成就系统）**：6 个任务
- **阶段 5（ST-002：积分系统）**：4 个任务
- **阶段 6（ST-003：等级系统）**：4 个任务
- **阶段 7（ST-004：进度可视化）**：4 个任务
- **阶段 8（优化与跨领域关注点）**：5 个任务

### 各 Story 对应的任务数量

- **ST-005（数据模型和存储）**：7 个任务（T020-T026，阶段 2）
- **ST-001（成就系统）**：6 个任务（T100-T105，阶段 4）+ 1 个优化任务（T500，阶段 8）
- **ST-002（积分系统）**：4 个任务（T200-T203，阶段 5）+ 1 个优化任务（T501，阶段 8）
- **ST-003（等级系统）**：4 个任务（T300-T303，阶段 6）
- **ST-004（进度可视化）**：4 个任务（T400-T403，阶段 7）

### 识别出的可并行执行机会

- **阶段 1**：T012 [P]（代码检查配置）
- **阶段 2**：T020 [P]、T021 [P]、T024 [P]、T026 [P]（数据模型、Entity、DataSource、配置可并行）
- **ST-001**：T100 [P]、T102 [P]（计算器、获取用例可并行）
- **ST-002**：T200 [P]、T202 [P]（计算器、获取用例可并行）
- **ST-003**：T300 [P]（计算器可并行）
- **ST-004**：T400 [P]、T403 [P]（获取用例、展示界面可并行）
- **阶段 8**：T500 [P]、T501 [P]、T502 [P]、T503 [P]、T504 [P]（所有优化任务可并行）

### 每个 Story 的验证方式摘要（含指标阈值）

- **ST-001（成就系统）**：
  - 功能验收：用户完成学习后看到成就解锁提示，成就列表显示已解锁成就
  - 性能验收：成就检查计算时间 ≤ 100ms（p95），成就列表加载时间 ≤ 300ms（p95）
  - 可靠性验收：成就检查准确率 100%，成就解锁数据正确持久化
- **ST-002（积分系统）**：
  - 功能验收：用户学习后积分增加，积分历史记录正确保存
  - 性能验收：积分计算时间 ≤ 50ms（p95）
  - 可靠性验收：积分计算准确率 100%，积分数据与学习数据一致
- **ST-003（等级系统）**：
  - 功能验收：用户积分达到等级提升条件时显示等级提升动画，等级数据正确保存
  - 性能验收：等级计算时间 ≤ 20ms（p95）
  - 可靠性验收：等级计算准确率 100%，等级数据与积分数据一致
- **ST-004（进度可视化）**：
  - 功能验收：用户能够查看积分、等级和进度条，达成里程碑时显示庆祝动画
  - 性能验收：进度可视化渲染时间 ≤ 200ms（p95），动画播放流畅（60fps）
  - 内存验收：动画资源播放完成后立即释放，内存占用峰值 ≤ 10MB
- **ST-005（数据模型和存储）**：
  - 功能验收：成就、积分、等级数据正确保存和查询，数据持久化正常
  - 可靠性验收：应用重启后数据恢复，数据损坏时能够修复
  - 性能验收：数据库查询时间 ≤ 5ms（p95），数据保存时间 ≤ 10ms（p95）

### 建议的 MVP 范围

建议的 MVP 范围：
- **阶段 0**：准备（版本对齐）
- **阶段 1**：环境搭建
- **阶段 2**：核心基础（ST-005：数据模型和存储实现，阻塞性前置条件）
- **阶段 4**：ST-001（成就系统实现）

MVP 完成后可独立验证成就检查、解锁和数据持久化功能。

### 格式验证

✅ 所有任务均遵循清单格式（复选框、任务ID、[ST-xxx] 标签、文件路径）

---

## 备注

- [P] 标记的任务 = 涉及不同文件，无依赖关系
- [ST-xxx] 标签将任务关联至 Plan 的 Story，便于追溯
- 每个 Story 需可独立完成、独立验证
- 实现前验证测试用例执行失败（如适用）
- 完成单个任务或逻辑分组后提交代码
- 可在任意检查点暂停，独立验证对应故事
- 避免：模糊的任务描述、同一文件冲突、破坏独立性的跨故事依赖
- 所有任务必须遵循 plan.md 的技术决策，不得擅自修改设计
