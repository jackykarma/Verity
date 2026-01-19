# Tasks：游戏化与激励机制

**Epic**：EPIC-001 - 无痛记忆单词神器APP
**Feature ID**：FEAT-004
**Feature Version**：v0.1.0（来自 `spec.md`）
**Plan Version**：v0.1.0（来自 `plan.md`）
**Tasks Version**：v0.1.0
**输入**：来自 `Feature 目录/` 的设计文档（`spec.md`、`plan.md`）

> 规则：
> - Task 只能拆解与执行 Plan 的既定 Story；**禁止**在 tasks.md 里改写 Plan 的技术决策或新增未决策的方案。
> - 每个 Task 必须包含：执行步骤、依赖关系（顺序/并行）、验证方式（可执行/可量化）。

## 阶段 0：准备

**目标**：对齐版本、冻结设计输入，避免 Implement 期返工

- [ ] T001 在 `specs/epics/EPIC-001-word-memory-app/features/FEAT-004-gamification-incentive/` 中核对 `spec.md`、`plan.md` 的 Version 字段一致性并补齐变更记录
  - **依赖**：无
  - **步骤**：
    - 1) 确认 `spec.md` 中 `Feature Version` 为 v0.1.0
    - 2) 确认 `plan.md` 中 `Plan Version` 为 v0.1.0
    - 3) 确认 Plan 的 Story Breakdown 已完成（ST-001 至 ST-008）
    - 4) 确认所有 Story 都有明确的依赖关系和验收方式
  - **验证**：
    - [ ] `tasks.md` 中 `Plan Version` 与 `plan.md` 一致
    - [ ] 所有 Story（ST-001 至 ST-008）都已识别并映射到任务
  - **产物**：`spec.md`、`plan.md`、`tasks.md`

---

## 阶段 1：环境搭建（共享基础设施）

**目标**：项目初始化与基础结构搭建

- [ ] T010 按照 plan.md 的"源代码结构"创建游戏化模块目录结构（路径：`app/src/main/java/com/jacky/verity/gamification/`）
  - **依赖**：T001
  - **步骤**：
    - 1) 创建 `gamification/ui/achievement/` 目录（成就列表 UI）
    - 2) 创建 `gamification/ui/points/` 目录（积分等级 UI）
    - 3) 创建 `gamification/ui/progress/` 目录（进度可视化 UI）
    - 4) 创建 `gamification/viewmodel/` 目录（ViewModel 层）
    - 5) 创建 `gamification/domain/` 目录（领域层 Engine）
    - 6) 创建 `gamification/data/repository/` 目录（Repository 层）
    - 7) 创建 `gamification/data/database/dao/` 目录（DAO 接口）
    - 8) 创建 `gamification/data/database/entity/` 目录（Room 实体）
    - 9) 创建 `gamification/data/model/` 目录（数据模型）
    - 10) 创建 `gamification/di/` 目录（依赖注入）
  - **验证**：
    - [ ] 目录结构与 plan.md B7 节一致
    - [ ] 所有目录已创建且为空（或仅包含占位文件）
  - **产物**：相关目录结构

- [ ] T011 在 `app/build.gradle.kts` 中添加游戏化模块依赖（Room、Coroutines、Flow、Compose）
  - **依赖**：T010
  - **步骤**：
    - 1) 添加 Room 依赖：`implementation("androidx.room:room-runtime:2.6.1")`、`kapt("androidx.room:room-compiler:2.6.1")`
    - 2) 添加 Coroutines 依赖：`implementation("org.jetbrains.kotlinx:kotlinx-coroutines-android:1.7.3")`
    - 3) 添加 Flow 依赖（已包含在 Coroutines 中）
    - 4) 确认 Compose 依赖已存在（EPIC 级依赖）
  - **验证**：
    - [ ] 项目可以成功构建（`./gradlew build`）
    - [ ] 所有依赖已正确解析
  - **产物**：`app/build.gradle.kts`

- [ ] T012 [P] 在 `app/src/main/res/` 中创建游戏化资源目录（图标、动画资源等）
  - **依赖**：T010
  - **步骤**：
    - 1) 创建 `res/drawable/gamification/` 目录（成就图标、等级图标）
    - 2) 创建 `res/values/gamification/` 目录（字符串资源、颜色资源）
  - **验证**：
    - [ ] 资源目录已创建
  - **产物**：资源目录结构

---

## 阶段 2：核心基础（阻塞性前置条件，阻塞所有 Story）

**目标**：所有用户故事实现前必须完成的核心基础设施搭建

**⚠️ 关键**：此阶段完成前，任何用户故事相关工作均不可启动

- [ ] T020 在 `app/src/main/java/com/jacky/verity/gamification/data/database/entity/` 中创建 Room 数据库实体类（Achievement、PointsRecord、UserLevel、AchievementDefinition、LevelDefinition）
  - **依赖**：T011
  - **步骤**：
    - 1) 创建 `Achievement.kt` 实体（achievement_id, user_id, unlocked_at, status）
    - 2) 创建 `PointsRecord.kt` 实体（record_id, user_id, points_change, reason, total_points, created_at）
    - 3) 创建 `UserLevel.kt` 实体（user_id, level_id, current_points, updated_at）
    - 4) 创建 `AchievementDefinition.kt` 实体（achievement_id, name, description, condition_type, condition_value, icon）
    - 5) 创建 `LevelDefinition.kt` 实体（level_id, name, required_points, icon）
    - 6) 添加 Room 注解（@Entity、@PrimaryKey、@ColumnInfo）
  - **验证**：
    - [ ] 所有实体类编译通过
    - [ ] 实体字段与 plan.md B3.2 节表结构一致
  - **产物**：`Achievement.kt`、`PointsRecord.kt`、`UserLevel.kt`、`AchievementDefinition.kt`、`LevelDefinition.kt`

- [ ] T021 在 `app/src/main/java/com/jacky/verity/gamification/data/database/dao/` 中创建 DAO 接口（AchievementDao、PointsDao、LevelDao）
  - **依赖**：T020
  - **步骤**：
    - 1) 创建 `AchievementDao.kt`（查询用户成就、插入成就、更新成就状态）
    - 2) 创建 `PointsDao.kt`（查询积分历史、插入积分记录、查询总积分）
    - 3) 创建 `LevelDao.kt`（查询用户等级、更新用户等级、查询等级定义）
    - 4) 添加 Room @Dao 注解和查询方法（@Query、@Insert、@Update、@Transaction）
  - **验证**：
    - [ ] 所有 DAO 接口编译通过
    - [ ] 查询方法与 plan.md 典型查询一致
  - **产物**：`AchievementDao.kt`、`PointsDao.kt`、`LevelDao.kt`

- [ ] T022 在 `app/src/main/java/com/jacky/verity/gamification/data/database/` 中创建 Room 数据库类 `GamificationDatabase.kt`
  - **依赖**：T021
  - **步骤**：
    - 1) 创建 `GamificationDatabase` 抽象类，继承 `RoomDatabase`
    - 2) 定义 DAO 属性（achievementDao、pointsDao、levelDao）
    - 3) 配置数据库版本（version = 1）
    - 4) 实现单例模式（getInstance 方法）
  - **验证**：
    - [ ] 数据库类编译通过
    - [ ] 数据库可以成功创建（单元测试验证）
  - **产物**：`GamificationDatabase.kt`

- [ ] T023 在 `app/src/main/java/com/jacky/verity/gamification/data/model/` 中创建数据模型类（AchievementDefinition、PointsRule、LevelDefinition、LearningStats、LearningEvent）
  - **依赖**：T020
  - **步骤**：
    - 1) 创建 `AchievementDefinition.kt` 数据类（成就定义模型）
    - 2) 创建 `PointsRule.kt` 数据类（积分规则模型）
    - 3) 创建 `LevelDefinition.kt` 数据类（等级定义模型）
    - 4) 创建 `LearningStats.kt` 数据类（学习统计数据，用于成就计算）
    - 5) 创建 `LearningEvent.kt` 数据类（学习事件，用于积分计算）
  - **验证**：
    - [ ] 所有数据模型类编译通过
    - [ ] 数据模型与 plan.md 核心数据结构一致
  - **产物**：`AchievementDefinition.kt`、`PointsRule.kt`、`LevelDefinition.kt`、`LearningStats.kt`、`LearningEvent.kt`

- [ ] T024 在 `app/src/main/java/com/jacky/verity/gamification/data/repository/` 中创建 `GamificationRepository.kt` 基础接口
  - **依赖**：T022, T023
  - **步骤**：
    - 1) 定义 Repository 接口（suspend 函数、Flow 返回类型）
    - 2) 定义错误类型（sealed class GamificationError）
    - 3) 定义结果类型（Result<T>）
  - **验证**：
    - [ ] Repository 接口编译通过
    - [ ] 接口方法与 plan.md B4.1 节一致
  - **产物**：`GamificationRepository.kt`

**检查点**：基础层就绪——用户故事实现可并行启动

---

## 阶段 3：Story ST-001 - 成就系统核心功能（类型：Functional）

**目标**：用户完成学习任务后，系统能够自动检查并解锁符合条件的成就，显示解锁动画

**验证方式（高层）**：单元测试验证成就检查逻辑、性能测试验证检查耗时（p95 ≤ 100ms）、集成测试验证成就解锁流程、准确率测试验证（100%）

### ST-001 任务

- [ ] T100 [ST-001] 在 `app/src/main/java/com/jacky/verity/gamification/domain/` 中创建 `AchievementEngine.kt` 成就计算引擎
  - **依赖**：T024
  - **步骤**：
    - 1) 实现 `checkAchievements(stats: LearningStats): List<AchievementUnlocked>` 方法
    - 2) 实现成就定义加载逻辑（从数据库加载，支持内存缓存）
    - 3) 实现解锁条件判断逻辑（学习天数、连续学习天数、单词数量、学习时长）
    - 4) 实现批量检查所有成就定义，只返回新解锁的成就
    - 5) 实现去重逻辑（基于成就ID + 解锁时间）
    - 6) 添加性能监控（检查耗时，确保 p95 ≤ 100ms）
  - **验证**：
    - [ ] 单元测试：验证成就检查逻辑正确性（所有成就类型）
    - [ ] 性能测试：验证检查耗时 p95 ≤ 100ms（模拟 100 个成就定义）
    - [ ] 准确率测试：验证不误解锁、不漏解锁（100% 准确率）
  - **产物**：`AchievementEngine.kt`

- [ ] T101 [ST-001] 在 `app/src/main/java/com/jacky/verity/gamification/data/repository/` 中实现 `GamificationRepository` 的成就相关方法
  - **依赖**：T100
  - **步骤**：
    - 1) 实现 `saveAchievement(achievement: Achievement): Result<Unit>` 方法
    - 2) 实现 `getAllAchievements(): Flow<List<Achievement>>` 方法
    - 3) 实现 `getAchievementById(achievementId: String): Achievement?` 方法
    - 4) 实现事务保证数据一致性
    - 5) 添加错误处理（AchievementError.CalculationError、AchievementError.DataError）
  - **验证**：
    - [ ] 单元测试：验证数据持久化正确性
    - [ ] 集成测试：验证成就解锁流程（学习数据变化 → 成就检查 → 数据保存 → UI 更新）
  - **产物**：`GamificationRepository.kt`（成就相关方法）

- [ ] T102 [ST-001] 在 `app/src/main/java/com/jacky/verity/gamification/domain/` 中实现成就定义初始化逻辑（默认成就定义数据）
  - **依赖**：T100
  - **步骤**：
    - 1) 定义默认成就列表（学习天数成就、连续学习成就、单词数量成就、学习时长成就）
    - 2) 实现成就定义初始化方法（首次启动时插入默认成就定义）
    - 3) 实现成就定义缓存机制（内存缓存，减少数据库查询）
  - **验证**：
    - [ ] 单元测试：验证成就定义初始化正确性
    - [ ] 集成测试：验证首次启动时成就定义已初始化
  - **产物**：`AchievementEngine.kt`（成就定义初始化逻辑）

- [ ] T103 [ST-001] 在 `app/src/main/java/com/jacky/verity/gamification/viewmodel/` 中创建 `AchievementViewModel.kt`
  - **依赖**：T101
  - **步骤**：
    - 1) 实现 ViewModel 类，继承 `ViewModel`
    - 2) 实现成就列表状态管理（StateFlow<List<Achievement>>）
    - 3) 实现成就检查触发逻辑（监听学习数据变化事件）
    - 4) 实现成就解锁事件处理（显示解锁动画、更新 UI）
    - 5) 添加错误处理和降级策略
  - **验证**：
    - [ ] 单元测试：验证 ViewModel 状态管理正确性
    - [ ] 集成测试：验证成就解锁事件触发 UI 更新
  - **产物**：`AchievementViewModel.kt`

**检查点**：至此，Story ST-001 应具备完整功能且可独立测试（成就检查、解锁、数据持久化）

---

## 阶段 4：Story ST-002 - 积分系统核心功能（类型：Functional）

**目标**：用户学习行为产生积分，积分实时累计和更新，支持积分历史记录

**验证方式（高层）**：单元测试验证积分计算逻辑、性能测试验证计算耗时（p95 ≤ 50ms）、集成测试验证积分累计流程、准确率测试验证（100%）

### ST-002 任务

- [ ] T200 [P] [ST-002] 在 `app/src/main/java/com/jacky/verity/gamification/domain/` 中创建 `PointsEngine.kt` 积分计算引擎
  - **依赖**：T024
  - **步骤**：
    - 1) 实现 `calculatePoints(event: LearningEvent): PointsChange` 方法
    - 2) 实现积分规则加载逻辑（从数据库加载，支持内存缓存）
    - 3) 实现积分计算逻辑（基于学习行为类型：学习单词、完成复习、连续学习）
    - 4) 实现积分累计逻辑（事务保证原子性）
    - 5) 实现积分历史记录（PointsRecord）
    - 6) 实现去重逻辑（基于事件ID + 时间戳）
    - 7) 实现缓存机制（总积分内存缓存）
    - 8) 添加性能监控（计算耗时，确保 p95 ≤ 50ms）
  - **验证**：
    - [ ] 单元测试：验证积分计算逻辑正确性（所有行为类型）
    - [ ] 性能测试：验证计算耗时 p95 ≤ 50ms
    - [ ] 准确率测试：验证积分计算准确率 100%（与学习数据一致）
  - **产物**：`PointsEngine.kt`

- [ ] T201 [ST-002] 在 `app/src/main/java/com/jacky/verity/gamification/data/repository/` 中实现 `GamificationRepository` 的积分相关方法
  - **依赖**：T200
  - **步骤**：
    - 1) 实现 `savePointsRecord(record: PointsRecord): Result<Unit>` 方法
    - 2) 实现 `getTotalPoints(): Flow<Int>` 方法
    - 3) 实现 `getPointsHistory(limit: Int): List<PointsRecord>` 方法
    - 4) 实现 `updatePointsState(totalPoints: Int): Result<Unit>` 方法（更新积分状态缓存）
    - 5) 实现事务保证积分累计原子性
    - 6) 添加错误处理（PointsError.CalculationError、PointsError.StorageError）
  - **验证**：
    - [ ] 单元测试：验证数据持久化正确性
    - [ ] 集成测试：验证积分累计流程（学习事件 → 积分计算 → 数据保存 → UI 更新）
  - **产物**：`GamificationRepository.kt`（积分相关方法）

- [ ] T202 [ST-002] 在 `app/src/main/java/com/jacky/verity/gamification/domain/` 中实现积分规则初始化逻辑（默认积分规则配置）
  - **依赖**：T200
  - **步骤**：
    - 1) 定义默认积分规则（学习单词：10 分、完成复习：5 分、连续学习：20 分）
    - 2) 实现积分规则初始化方法（首次启动时插入默认规则）
    - 3) 实现积分规则缓存机制（内存缓存，减少数据库查询）
  - **验证**：
    - [ ] 单元测试：验证积分规则初始化正确性
    - [ ] 集成测试：验证首次启动时积分规则已初始化
  - **产物**：`PointsEngine.kt`（积分规则初始化逻辑）

- [ ] T203 [ST-002] 在 `app/src/main/java/com/jacky/verity/gamification/viewmodel/` 中创建 `PointsViewModel.kt`
  - **依赖**：T201
  - **步骤**：
    - 1) 实现 ViewModel 类，继承 `ViewModel`
    - 2) 实现积分状态管理（StateFlow<Int>）
    - 3) 实现积分变化事件处理（监听学习事件，触发积分计算）
    - 4) 实现积分实时更新逻辑（Flow 收集，更新 UI）
    - 5) 添加错误处理和降级策略
  - **验证**：
    - [ ] 单元测试：验证 ViewModel 状态管理正确性
    - [ ] 集成测试：验证积分变化事件触发 UI 更新
  - **产物**：`PointsViewModel.kt`

**检查点**：至此，Story ST-002 应具备完整功能且可独立测试（积分计算、累计、数据持久化）

---

## 阶段 5：Story ST-003 - 等级系统核心功能（类型：Functional）

**目标**：用户积分达到等级提升条件时，系统显示等级提升动画和奖励提示

**验证方式（高层）**：单元测试验证等级计算逻辑、性能测试验证计算耗时（p95 ≤ 50ms）、集成测试验证等级提升流程、准确率测试验证（100%）

### ST-003 任务

- [ ] T300 [ST-003] 在 `app/src/main/java/com/jacky/verity/gamification/domain/` 中创建 `LevelEngine.kt` 等级计算引擎
  - **依赖**：T201
  - **步骤**：
    - 1) 实现 `calculateLevel(totalPoints: Int): Level` 方法
    - 2) 实现 `checkLevelUp(currentLevel: Level, newPoints: Int): LevelUpResult?` 方法
    - 3) 实现等级定义加载逻辑（从数据库加载，支持内存缓存）
    - 4) 实现等级计算逻辑（基于积分阈值配置表）
    - 5) 实现等级提升判断逻辑（积分变化时检查是否达到下一等级所需积分）
    - 6) 添加性能监控（计算耗时，确保 p95 ≤ 50ms）
  - **验证**：
    - [ ] 单元测试：验证等级计算逻辑正确性（所有等级）
    - [ ] 性能测试：验证计算耗时 p95 ≤ 50ms
    - [ ] 准确率测试：验证等级计算准确率 100%（与积分数据一致）
  - **产物**：`LevelEngine.kt`

- [ ] T301 [ST-003] 在 `app/src/main/java/com/jacky/verity/gamification/data/repository/` 中实现 `GamificationRepository` 的等级相关方法
  - **依赖**：T300
  - **步骤**：
    - 1) 实现 `saveUserLevel(level: UserLevel): Result<Unit>` 方法
    - 2) 实现 `getCurrentLevel(): Flow<Level>` 方法
    - 3) 实现 `getLevelDefinitions(): List<LevelDefinition>` 方法
    - 4) 实现事务保证等级更新原子性
    - 5) 添加错误处理（LevelError.CalculationError、LevelError.ConfigError）
  - **验证**：
    - [ ] 单元测试：验证数据持久化正确性
    - [ ] 集成测试：验证等级提升流程（积分变化 → 等级计算 → 数据保存 → UI 更新）
  - **产物**：`GamificationRepository.kt`（等级相关方法）

- [ ] T302 [ST-003] 在 `app/src/main/java/com/jacky/verity/gamification/domain/` 中实现等级定义初始化逻辑（默认等级配置）
  - **依赖**：T300
  - **步骤**：
    - 1) 定义默认等级列表（Lv.1 至 Lv.20，每个等级所需积分递增）
    - 2) 实现等级定义初始化方法（首次启动时插入默认等级定义）
    - 3) 实现等级定义缓存机制（内存缓存，减少数据库查询）
  - **验证**：
    - [ ] 单元测试：验证等级定义初始化正确性
    - [ ] 集成测试：验证首次启动时等级定义已初始化
  - **产物**：`LevelEngine.kt`（等级定义初始化逻辑）

- [ ] T303 [ST-003] 在 `app/src/main/java/com/jacky/verity/gamification/viewmodel/` 中创建 `LevelViewModel.kt`
  - **依赖**：T301
  - **步骤**：
    - 1) 实现 ViewModel 类，继承 `ViewModel`
    - 2) 实现等级状态管理（StateFlow<Level>）
    - 3) 实现等级提升事件处理（监听积分变化，触发等级计算）
    - 4) 实现等级提升动画触发逻辑（显示升级动画、奖励提示）
    - 5) 添加错误处理和降级策略
  - **验证**：
    - [ ] 单元测试：验证 ViewModel 状态管理正确性
    - [ ] 集成测试：验证等级提升事件触发 UI 更新和动画
  - **产物**：`LevelViewModel.kt`

**检查点**：至此，Story ST-003 应具备完整功能且可独立测试（等级计算、提升、数据持久化）

---

## 阶段 6：Story ST-004 - 成就列表 UI（类型：Functional）

**目标**：用户能够查看已解锁的成就列表，列表显示成就名称、解锁时间、描述

**验证方式（高层）**：UI 测试验证列表展示、性能测试验证加载耗时（p95 ≤ 300ms）、集成测试验证列表交互

### ST-004 任务

- [ ] T400 [ST-004] 在 `app/src/main/java/com/jacky/verity/gamification/ui/achievement/` 中创建成就列表 Compose UI 组件
  - **依赖**：T103
  - **步骤**：
    - 1) 创建 `AchievementListScreen.kt` Composable 函数
    - 2) 实现成就列表展示（LazyColumn，显示已解锁和未解锁成就）
    - 3) 实现成就卡片组件（显示成就名称、描述、解锁时间、图标）
    - 4) 实现未解锁成就显示（灰色锁定状态）
    - 5) 实现空状态处理（无成就时显示引导）
    - 6) 添加加载状态处理（显示加载指示器）
  - **验证**：
    - [ ] UI 测试：验证列表展示正确性（已解锁/未解锁成就显示）
    - [ ] 性能测试：验证列表加载耗时 p95 ≤ 300ms
  - **产物**：`AchievementListScreen.kt`

- [ ] T401 [ST-004] 在 `app/src/main/java/com/jacky/verity/gamification/ui/achievement/` 中实现成就卡片组件 `AchievementCard.kt`
  - **依赖**：T400
  - **步骤**：
    - 1) 创建 `AchievementCard` Composable 函数
    - 2) 实现成就图标显示（已解锁显示彩色图标，未解锁显示灰色图标）
    - 3) 实现成就信息显示（名称、描述、解锁时间）
    - 4) 实现卡片样式（Material Design 3 风格）
    - 5) 添加点击交互（点击查看成就详情）
  - **验证**：
    - [ ] UI 测试：验证卡片展示正确性
    - [ ] 交互测试：验证点击交互响应
  - **产物**：`AchievementCard.kt`

- [ ] T402 [ST-004] 在 `app/src/main/java/com/jacky/verity/gamification/` 中集成成就列表 UI 到导航系统
  - **依赖**：T401
  - **步骤**：
    - 1) 在 Navigation Compose 中添加成就列表路由
    - 2) 实现导航参数传递（如需要）
    - 3) 实现返回导航逻辑
  - **验证**：
    - [ ] 集成测试：验证导航流程正确性
  - **产物**：导航配置更新

**检查点**：至此，Story ST-004 应具备完整功能且可独立测试（成就列表展示、交互）

---

## 阶段 7：Story ST-005 - 积分等级 UI 和进度可视化（类型：Functional）

**目标**：用户能够查看当前积分、等级和距离下一等级的进度条，进度条实时更新

**验证方式（高层）**：UI 测试验证积分等级展示、性能测试验证渲染耗时（p95 ≤ 200ms）、内存测试验证内存占用（≤ 10MB）

### ST-005 任务

- [ ] T500 [ST-005] 在 `app/src/main/java/com/jacky/verity/gamification/ui/points/` 中创建积分等级页面 Compose UI 组件
  - **依赖**：T203, T303
  - **步骤**：
    - 1) 创建 `PointsLevelScreen.kt` Composable 函数
    - 2) 实现积分显示（当前总积分）
    - 3) 实现等级显示（当前等级、等级名称、等级图标）
    - 4) 实现进度条组件（显示距离下一等级的进度）
    - 5) 实现进度条动画（积分变化时动画更新）
    - 6) 添加加载状态处理
  - **验证**：
    - [ ] UI 测试：验证积分等级展示正确性
    - [ ] 性能测试：验证渲染耗时 p95 ≤ 200ms
    - [ ] 内存测试：验证内存占用 ≤ 10MB
  - **产物**：`PointsLevelScreen.kt`

- [ ] T501 [ST-005] 在 `app/src/main/java/com/jacky/verity/gamification/ui/progress/` 中实现进度条组件 `ProgressBar.kt`
  - **依赖**：T500
  - **步骤**：
    - 1) 创建 `ProgressBar` Composable 函数
    - 2) 实现进度条绘制（当前积分 / 下一等级所需积分）
    - 3) 实现进度条动画（使用 Compose Animation API，60fps）
    - 4) 实现进度百分比显示
    - 5) 实现进度条样式（Material Design 3 风格）
  - **验证**：
    - [ ] UI 测试：验证进度条显示正确性
    - [ ] 性能测试：验证动画帧率 60fps
  - **产物**：`ProgressBar.kt`

- [ ] T502 [ST-005] 在 `app/src/main/java/com/jacky/verity/gamification/` 中集成积分等级 UI 到导航系统
  - **依赖**：T501
  - **步骤**：
    - 1) 在 Navigation Compose 中添加积分等级页面路由
    - 2) 实现导航参数传递（如需要）
    - 3) 实现返回导航逻辑
  - **验证**：
    - [ ] 集成测试：验证导航流程正确性
  - **产物**：导航配置更新

**检查点**：至此，Story ST-005 应具备完整功能且可独立测试（积分等级展示、进度可视化）

---

## 阶段 8：Story ST-006 - 数据持久化和一致性保障（类型：Infrastructure）

**目标**：游戏化数据正确持久化，应用重启后恢复，数据与学习数据保持一致

**验证方式（高层）**：集成测试验证数据持久化、数据一致性测试验证数据修复、压力测试验证并发写入

### ST-006 任务

- [ ] T600 [P] [ST-006] 在 `app/src/main/java/com/jacky/verity/gamification/data/repository/` 中实现数据一致性检查逻辑
  - **依赖**：T024
  - **步骤**：
    - 1) 实现数据一致性检查方法（比较游戏化数据与学习数据）
    - 2) 实现数据修复方法（基于学习数据重新计算游戏化数据）
    - 3) 实现启动时数据一致性检查（应用启动时自动检查）
    - 4) 实现定期数据一致性检查（可选，后台任务）
  - **验证**：
    - [ ] 单元测试：验证数据一致性检查逻辑正确性
    - [ ] 集成测试：验证数据修复机制有效性
  - **产物**：`GamificationRepository.kt`（数据一致性检查逻辑）

- [ ] T601 [ST-006] 在 `app/src/main/java/com/jacky/verity/gamification/data/database/` 中实现数据库迁移策略
  - **依赖**：T022
  - **步骤**：
    - 1) 实现数据库迁移类（Migration 1→2，如需要）
    - 2) 实现数据回填逻辑（基于学习数据重新计算）
    - 3) 实现失败回滚策略（迁移失败时回滚到上一版本）
    - 4) 添加迁移日志记录
  - **验证**：
    - [ ] 集成测试：验证数据库迁移正确性
    - [ ] 压力测试：验证迁移性能
  - **产物**：`GamificationDatabase.kt`（迁移策略）

- [ ] T602 [ST-006] 在 `app/src/main/java/com/jacky/verity/gamification/` 中实现应用生命周期监听和数据保存
  - **依赖**：T600
  - **步骤**：
    - 1) 实现 Application 生命周期监听（ProcessLifecycleOwner）
    - 2) 实现应用退出时数据保存逻辑（保存未保存的数据）
    - 3) 实现应用启动时数据加载逻辑（从数据库加载，更新缓存）
    - 4) 实现数据备份机制（可选，定期备份到文件）
  - **验证**：
    - [ ] 集成测试：验证应用退出时数据保存
    - [ ] 集成测试：验证应用启动时数据恢复
  - **产物**：生命周期监听实现

- [ ] T603 [ST-006] 在 `app/src/main/java/com/jacky/verity/gamification/data/repository/` 中实现并发写入保护（Mutex）
  - **依赖**：T600
  - **步骤**：
    - 1) 实现 Mutex 保护共享状态（积分累计、成就检查）
    - 2) 实现并发写入队列化处理
    - 3) 实现事务保证数据一致性
  - **验证**：
    - [ ] 压力测试：验证并发写入数据一致性
    - [ ] 性能测试：验证并发写入性能影响
  - **产物**：`GamificationRepository.kt`（并发保护逻辑）

**检查点**：至此，Story ST-006 应具备完整功能且可独立测试（数据持久化、一致性保障）

---

## 阶段 9：Story ST-007 - 学习里程碑和庆祝动画（类型：Functional）

**目标**：用户达成学习里程碑时，系统显示庆祝动画

**验证方式（高层）**：UI 测试验证里程碑展示、性能测试验证动画帧率（60fps）、内存测试验证资源释放

### ST-007 任务

- [ ] T700 [ST-007] 在 `app/src/main/java/com/jacky/verity/gamification/domain/` 中实现学习里程碑判断逻辑
  - **依赖**：T100
  - **步骤**：
    - 1) 定义里程碑列表（学习100个单词、连续学习7天等）
    - 2) 实现里程碑判断逻辑（基于学习数据统计）
    - 3) 实现里程碑达成事件触发
    - 4) 集成到成就系统（里程碑是特殊的成就类型）
  - **验证**：
    - [ ] 单元测试：验证里程碑判断逻辑正确性
    - [ ] 集成测试：验证里程碑达成事件触发
  - **产物**：`AchievementEngine.kt`（里程碑判断逻辑）

- [ ] T701 [ST-007] 在 `app/src/main/java/com/jacky/verity/gamification/ui/` 中实现庆祝动画组件 `CelebrationAnimation.kt`
  - **依赖**：T700
  - **步骤**：
    - 1) 创建 `CelebrationAnimation` Composable 函数
    - 2) 实现庆祝动画（使用 Compose Animation API，60fps）
    - 3) 实现动画资源管理（播放完成后立即释放）
    - 4) 实现动画样式（粒子效果、缩放动画等）
    - 5) 实现动画触发逻辑（里程碑达成时显示）
  - **验证**：
    - [ ] UI 测试：验证动画展示正确性
    - [ ] 性能测试：验证动画帧率 60fps
    - [ ] 内存测试：验证动画资源及时释放
  - **产物**：`CelebrationAnimation.kt`

- [ ] T702 [ST-007] 在 `app/src/main/java/com/jacky/verity/gamification/` 中集成里程碑功能到学习流程（FEAT-003）
  - **依赖**：T701
  - **步骤**：
    - 1) 在学习界面（FEAT-003）中监听里程碑达成事件
    - 2) 实现里程碑达成时显示庆祝动画
    - 3) 实现动画显示逻辑（不阻断学习流程）
  - **验证**：
    - [ ] 集成测试：验证里程碑功能集成到学习流程
    - [ ] UI 测试：验证庆祝动画显示不阻断学习
  - **产物**：学习界面集成代码

**检查点**：至此，Story ST-007 应具备完整功能且可独立测试（里程碑判断、庆祝动画）

---

## 阶段 10：Story ST-008 - 可观测性和错误处理（类型：Infrastructure）

**目标**：记录关键事件（成就解锁、积分变化、等级提升），错误处理完善，降级策略有效

**验证方式（高层）**：日志测试验证事件记录、错误处理测试验证错误场景、降级测试验证降级策略

### ST-008 任务

- [ ] T800 [P] [ST-008] 在 `app/src/main/java/com/jacky/verity/gamification/` 中实现事件记录系统
  - **依赖**：无
  - **步骤**：
    - 1) 创建事件记录接口（EventLogger）
    - 2) 实现成就解锁事件记录（成就ID、解锁时间、触发条件）
    - 3) 实现积分变化事件记录（变化量、变化原因、变化后总值）
    - 4) 实现等级提升事件记录（提升前等级、提升后等级、提升时间）
    - 5) 实现结构化日志（使用结构化字段）
    - 6) 实现敏感信息脱敏（不记录学习数据详情）
  - **验证**：
    - [ ] 日志测试：验证事件记录正确性
    - [ ] 单元测试：验证敏感信息脱敏
  - **产物**：`EventLogger.kt`

- [ ] T801 [ST-008] 在 `app/src/main/java/com/jacky/verity/gamification/` 中实现错误处理和降级策略
  - **依赖**：T800
  - **步骤**：
    - 1) 实现错误处理统一入口（GamificationErrorHandler）
    - 2) 实现错误日志记录（错误类型、学习数据、错误详情）
    - 3) 实现降级策略（学习数据不可用时降级为仅展示基础进度）
    - 4) 实现错误恢复机制（下次学习时重新计算）
    - 5) 实现用户友好错误提示（不暴露技术细节）
  - **验证**：
    - [ ] 错误处理测试：验证错误场景处理正确性
    - [ ] 降级测试：验证降级策略有效性
  - **产物**：`GamificationErrorHandler.kt`

- [ ] T802 [ST-008] 在 `app/src/main/java/com/jacky/verity/gamification/` 中集成可观测性到所有 Engine
  - **依赖**：T801
  - **步骤**：
    - 1) 在 AchievementEngine 中集成事件记录
    - 2) 在 PointsEngine 中集成事件记录
    - 3) 在 LevelEngine 中集成事件记录
    - 4) 在所有 Repository 方法中集成错误日志记录
  - **验证**：
    - [ ] 集成测试：验证所有关键事件都已记录
    - [ ] 集成测试：验证所有错误都已记录日志
  - **产物**：Engine 和 Repository 更新

**检查点**：至此，Story ST-008 应具备完整功能且可独立测试（事件记录、错误处理、降级策略）

---

## 阶段 11：优化与跨领域关注点

**目标**：性能优化、内存优化、功耗优化、最终集成测试

### 优化任务

- [ ] T900 性能优化：优化成就检查算法，确保 p95 ≤ 100ms
  - **依赖**：T100
  - **步骤**：
    - 1) 性能分析（使用 Android Profiler）
    - 2) 优化成就检查逻辑（批量检查优化、缓存优化）
    - 3) 性能测试验证（p95 ≤ 100ms）
  - **验证**：
    - [ ] 性能测试：验证成就检查 p95 ≤ 100ms
  - **产物**：性能优化代码

- [ ] T901 性能优化：优化积分计算算法，确保 p95 ≤ 50ms
  - **依赖**：T200
  - **步骤**：
    - 1) 性能分析（使用 Android Profiler）
    - 2) 优化积分计算逻辑（缓存优化、增量计算优化）
    - 3) 性能测试验证（p95 ≤ 50ms）
  - **验证**：
    - [ ] 性能测试：验证积分计算 p95 ≤ 50ms
  - **产物**：性能优化代码

- [ ] T902 内存优化：优化动画资源管理，确保内存占用 ≤ 10MB
  - **依赖**：T701
  - **步骤**：
    - 1) 内存分析（使用 Android Profiler、LeakCanary）
    - 2) 优化动画资源释放（WeakReference、及时释放）
    - 3) 内存测试验证（峰值 ≤ 10MB）
  - **验证**：
    - [ ] 内存测试：验证内存占用 ≤ 10MB
    - [ ] 内存泄漏测试：验证无内存泄漏
  - **产物**：内存优化代码

- [ ] T903 功耗优化：优化计算和动画，确保功耗增量 ≤ 5mAh/天
  - **依赖**：T900, T901, T902
  - **步骤**：
    - 1) 功耗分析（使用 Battery Historian）
    - 2) 优化计算频率（批量处理、延迟计算）
    - 3) 优化动画播放（简化动画、降低帧率）
    - 4) 功耗测试验证（≤ 5mAh/天）
  - **验证**：
    - [ ] 功耗测试：验证功耗增量 ≤ 5mAh/天
  - **产物**：功耗优化代码

- [ ] T904 最终集成测试：验证所有 Story 集成和端到端流程
  - **依赖**：T903
  - **步骤**：
    - 1) 端到端测试（学习流程 → 成就解锁 → 积分累计 → 等级提升 → UI 更新）
    - 2) 数据一致性测试（游戏化数据与学习数据一致）
    - 3) 性能测试（所有 NFR 指标验证）
    - 4) 内存测试（内存占用验证）
    - 5) 功耗测试（功耗增量验证）
  - **验证**：
    - [ ] 集成测试：验证所有 Story 集成正确性
    - [ ] 性能测试：验证所有 NFR 指标满足要求
    - [ ] 内存测试：验证内存占用满足要求
    - [ ] 功耗测试：验证功耗增量满足要求
  - **产物**：集成测试报告

---

## 依赖关系与执行顺序

### 阶段依赖

- **环境搭建（阶段 1）**：无依赖——可立即启动
- **核心基础（阶段 2）**：依赖环境搭建完成——阻塞所有用户故事
- **用户故事（阶段 3+）**：均依赖核心基础阶段完成
    - ST-001、ST-002、ST-006、ST-008 可并行启动（阶段 2 完成后）
    - ST-003 依赖 ST-002
    - ST-004 依赖 ST-001
    - ST-005 依赖 ST-002、ST-003
    - ST-007 依赖 ST-001、FEAT-003
- **优化完善（阶段 11）**：依赖所有目标用户故事完成

### Story 依赖

- **ST-001**：依赖阶段 2 完成、FEAT-005（学习进度与统计）、FEAT-007（数据管理）
- **ST-002**：依赖阶段 2 完成、FEAT-007（数据管理），可与 ST-001 并行
- **ST-003**：依赖 ST-002（积分系统）
- **ST-004**：依赖 ST-001（成就系统）
- **ST-005**：依赖 ST-002（积分系统）、ST-003（等级系统）
- **ST-006**：依赖阶段 2 完成、FEAT-007（数据管理），可与其他 Story 并行
- **ST-007**：依赖 ST-001（成就系统）、FEAT-003（学习界面）
- **ST-008**：无依赖，可与其他 Story 并行

### 单 Story 内部顺序

- 数据模型/实体开发先于 Engine 开发
- Engine 开发先于 Repository 开发
- Repository 开发先于 ViewModel 开发
- ViewModel 开发先于 UI 开发
- 核心功能实现先于集成工作
- 本故事完成后，再推进下一优先级故事

### 并行执行场景

- 所有标记 [P] 的环境搭建任务可并行（T012）
- 所有标记 [P] 的核心基础任务可并行（阶段 2 内）
- 核心基础阶段完成后，ST-001、ST-002、ST-006、ST-008 可并行启动（如团队容量允许）
- 单用户故事下所有标记 [P] 的任务可并行（如 T200、T600、T800）
- 不同团队成员可并行开发不同用户故事（ST-001 和 ST-002 可并行）

---

## 并行示例：Story ST-001

```bash
# 批量启动 ST-001 的可并行任务：
任务："T100 [ST-001] 创建 AchievementEngine.kt"
任务："T102 [ST-001] 实现成就定义初始化逻辑"
```

## 并行示例：Story ST-002

```bash
# 批量启动 ST-002 的可并行任务：
任务："T200 [P] [ST-002] 创建 PointsEngine.kt"
任务："T202 [ST-002] 实现积分规则初始化逻辑"
```

## 并行示例：Story ST-006

```bash
# 批量启动 ST-006 的可并行任务：
任务："T600 [P] [ST-006] 实现数据一致性检查逻辑"
任务："T603 [ST-006] 实现并发写入保护"
```

## 并行示例：Story ST-008

```bash
# 批量启动 ST-008 的可并行任务：
任务："T800 [P] [ST-008] 实现事件记录系统"
任务："T801 [ST-008] 实现错误处理和降级策略"
```

---

## 落地策略

### 先完成 MVP（优先完成关键 Story 集合）

1. 完成阶段 1：环境搭建
2. 完成阶段 2：核心基础（关键——阻塞所有故事）
3. 完成阶段 3：Story ST-001（成就系统核心功能）
4. **暂停并验证**：独立验证 ST-001（成就检查、解锁、数据持久化）
5. 如就绪，进行部署/演示

### 增量交付

1. 完成环境搭建 + 核心基础 → 基础层就绪
2. 新增 ST-001 → 独立验证 → 部署/演示（MVP！）
3. 新增 ST-002 → 独立验证 → 部署/演示
4. 新增 ST-003 → 独立验证 → 部署/演示
5. 新增 ST-004 → 独立验证 → 部署/演示
6. 新增 ST-005 → 独立验证 → 部署/演示
7. 新增 ST-006 → 独立验证 → 部署/演示
8. 新增 ST-007 → 独立验证 → 部署/演示
9. 新增 ST-008 → 独立验证 → 部署/演示
10. 每个故事均需在不破坏已有故事的前提下新增价值

### 团队并行策略

多开发者协作场景：

1. 团队共同完成环境搭建 + 核心基础
2. 核心基础完成后：
    - 开发者 A：负责 ST-001（成就系统）
    - 开发者 B：负责 ST-002（积分系统）
    - 开发者 C：负责 ST-006（数据持久化）
    - 开发者 D：负责 ST-008（可观测性）
3. ST-001 和 ST-002 完成后：
    - 开发者 A：负责 ST-004（成就列表 UI）
    - 开发者 B：负责 ST-003（等级系统）
4. ST-002 和 ST-003 完成后：
    - 开发者 B：负责 ST-005（积分等级 UI）
5. ST-001 完成后：
    - 开发者 A：负责 ST-007（学习里程碑）
6. 各 Story 独立完成并集成

---

## 备注

- [P] 标记的任务 = 涉及不同文件，无依赖关系
- [ST-xxx] 标签将任务关联至 Plan 的 Story，便于追溯
- 每个 Story 需可独立完成、独立验证
- 实现前验证测试用例执行失败（如适用）
- 完成单个任务或逻辑分组后提交代码
- 可在任意检查点暂停，独立验证对应故事
- 避免：模糊的任务描述、同一文件冲突、破坏独立性的跨故事依赖
- 所有性能指标（p95、内存、功耗）必须在任务完成后验证
- 所有 NFR 指标必须在对应 Story 完成后验证

---

## 任务统计

- **总任务数**：约 50 个任务
- **Story 任务分布**：
  - ST-001：4 个任务
  - ST-002：4 个任务
  - ST-003：4 个任务
  - ST-004：3 个任务
  - ST-005：3 个任务
  - ST-006：4 个任务
  - ST-007：3 个任务
  - ST-008：3 个任务
  - 优化阶段：5 个任务
- **可并行执行机会**：T012、T200、T600、T800 等
- **MVP 范围**：阶段 1 + 阶段 2 + ST-001（成就系统核心功能）
