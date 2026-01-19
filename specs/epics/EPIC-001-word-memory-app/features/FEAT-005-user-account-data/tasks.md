# Tasks：用户账户与数据管理

**Epic**：EPIC-001 - 无痛记忆单词神器APP
**Feature ID**：FEAT-005
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

## 阶段 0：准备（可选但建议）

**目标**：对齐版本、冻结设计输入，避免 Implement 期返工

- [ ] T001 在 `specs/epics/EPIC-001-word-memory-app/features/FEAT-005-user-account-data/` 中核对 `spec.md`、`plan.md` 的 Version 字段一致性并补齐变更记录
  - **依赖**：无
  - **设计引用**：N/A
  - **步骤**：
    - 1) 确认 `Feature Version`（v0.1.0）、`Plan Version`（v0.1.0）已填写
    - 2) 确认 Plan 的 Story Breakdown 已完成（ST-001 至 ST-008）
    - 3) 确认所有 FR/NFR 已映射到 Story
  - **验证**：
    - [ ] tasks.md 中 `Plan Version` 与 plan.md 一致
    - [ ] 所有 Story 都有明确的验收方式
  - **产物**：`spec.md`、`plan.md`、`tasks.md`

---

## 阶段 1：环境搭建（共享基础设施）

**目标**：项目初始化与基础结构搭建

- [ ] T010 按照 plan.md 的"结构决策"创建项目目录结构（路径：`app/src/main/java/com/jacky/verity/data/`）
  - **依赖**：T001
  - **设计引用**：N/A
  - **步骤**：
    - 1) 创建数据层目录结构：`data/database/`、`data/repository/`、`data/entity/`、`data/dao/`
    - 2) 创建领域层目录结构：`domain/usecase/`、`domain/model/`
    - 3) 创建备份服务目录：`data/backup/`
    - 4) 确保与现有模块边界一致（不破坏现有 UI 层）
  - **验证**：
    - [ ] 目录结构与 plan.md 的架构设计一致
    - [ ] 所有目录已创建
  - **产物**：相关目录结构

- [ ] T011 初始化构建与依赖（路径：`app/build.gradle.kts`）
  - **依赖**：T010
  - **设计引用**：plan.md:B1 技术背景
  - **步骤**：
    - 1) 添加 Room 依赖：`androidx.room:room-runtime`、`androidx.room:room-ktx`、`androidx.room:room-compiler`（kapt）
    - 2) 添加 Kotlin Coroutines 依赖：`org.jetbrains.kotlinx:kotlinx-coroutines-core`、`org.jetbrains.kotlinx:kotlinx-coroutines-android`
    - 3) 添加 Kotlin Flow 依赖（已包含在 Coroutines 中）
    - 4) 配置 kapt 插件（用于 Room 注解处理）
    - 5) 配置 Java 17 兼容性
  - **验证**：
    - [ ] `./gradlew build` 命令可执行且无依赖错误
    - [ ] Room 和 Coroutines 依赖已正确添加
  - **产物**：`app/build.gradle.kts`

- [ ] T012 [P] 配置代码检查与格式化工具（路径：`.editorconfig`、`app/build.gradle.kts`）
  - **依赖**：T011
  - **设计引用**：N/A
  - **步骤**：
    - 1) 配置 Kotlin 代码格式化规则（如 ktlint）
    - 2) 配置 Android Lint 规则
    - 3) 确保代码风格与项目一致
  - **验证**：
    - [ ] `./gradlew ktlintCheck` 或 lint 命令可运行
    - [ ] 代码格式化工具正常工作
  - **产物**：`.editorconfig`、lint 配置文件

---

## 阶段 2：核心基础（阻塞性前置条件，阻塞所有 Story）

**目标**：所有用户故事实现前必须完成的核心基础设施搭建

**⚠️ 关键**：此阶段完成前，任何用户故事相关工作均不可启动

- [ ] T020 搭建公共基础设施（按 Plan-B 的架构约束）（路径：`app/src/main/java/com/jacky/verity/data/error/`）
  - **依赖**：T012
  - **设计引用**：plan.md:B2 架构细化（错误处理规范）
  - **步骤**：
    - 1) 创建错误类型 Sealed Class：`DatabaseError`、`BackupError`、`ValidationError`
    - 2) 创建 `Result<T, Error>` 类型封装类
    - 3) 实现错误转换逻辑（Error → 用户提示）
    - 4) 创建日志工具类（结构化日志，符合 NFR-OBS-001）
  - **验证**：
    - [ ] 错误类型定义完整，覆盖所有数据库和备份错误场景
    - [ ] Result 类型可正确封装成功/失败结果
    - [ ] 日志工具类可记录结构化日志
  - **产物**：`error/DatabaseError.kt`、`error/BackupError.kt`、`error/ValidationError.kt`、`error/Result.kt`、`util/Logger.kt`

- [ ] T021 [P] 创建数据层基础接口（路径：`app/src/main/java/com/jacky/verity/data/repository/`）
  - **依赖**：T020
  - **设计引用**：plan.md:A3.2 模块拆分与职责（Repository 层）
  - **步骤**：
    - 1) 创建 Repository 基础接口模板
    - 2) 定义数据访问抽象接口
    - 3) 确保符合分层约束（Repository 只能调用 DAO）
  - **验证**：
    - [ ] Repository 接口符合架构约束
    - [ ] 接口定义清晰，无 Android 框架依赖
  - **产物**：`repository/BaseRepository.kt`（如需要）

**检查点**：基础层就绪——用户故事实现可并行启动

---

## 阶段 3：Story ST-001 - 数据库基础设施搭建（类型：Infrastructure）

**目标**：应用启动时能够成功创建和初始化数据库，数据库版本管理和迁移机制就绪

**验证方式（高层）**：应用启动时数据库自动创建；数据库版本检查正常；启动耗时 ≤ 500ms（NFR-PERF-001）

### ST-001 任务

- [ ] T100 [ST-001] 创建数据库配置和版本管理（路径：`app/src/main/java/com/jacky/verity/data/database/AppDatabase.kt`）
  - **依赖**：T020
  - **设计引用**：plan.md:A3.2 模块拆分与职责（Room Database 模块）
  - **步骤**：
    - 1) 创建 Room Database 抽象类 `AppDatabase`
    - 2) 配置数据库版本号（初始版本：1）
    - 3) 配置数据库名称和存储路径（应用私有目录）
    - 4) 实现单例模式（确保数据库实例唯一）
    - 5) 配置数据库回调（onCreate、onOpen、onUpgrade）
  - **验证**：
    - [ ] 数据库类可编译通过
    - [ ] 数据库实例可正确创建
    - [ ] 数据库文件存储在应用私有目录
  - **产物**：`database/AppDatabase.kt`

- [ ] T101 [ST-001] 实现数据库初始化逻辑（路径：`app/src/main/java/com/jacky/verity/data/database/DatabaseInitializer.kt`）
  - **依赖**：T100
  - **设计引用**：plan.md:FR-007（数据库自动初始化）
  - **步骤**：
    - 1) 创建 `DatabaseInitializer` 类
    - 2) 实现数据库初始化方法（检查数据库是否存在，不存在则创建）
    - 3) 实现数据库版本检查逻辑
    - 4) 在 Application 类或 MainActivity 中调用初始化（应用启动时）
    - 5) 添加初始化耗时测量（确保 ≤ 500ms）
  - **验证**：
    - [ ] 应用首次启动时数据库自动创建
    - [ ] 应用再次启动时数据库正常打开
    - [ ] 数据库初始化耗时 ≤ 500ms（使用 InstrumentedTest 测量）
    - [ ] 数据库文件存在于应用私有目录
  - **产物**：`database/DatabaseInitializer.kt`、`MainActivity.kt`（修改）

- [ ] T102 [ST-001] 实现数据库连接池配置（路径：`app/src/main/java/com/jacky/verity/data/database/AppDatabase.kt`）
  - **依赖**：T100
  - **设计引用**：plan.md:A2.4 通信与交互说明（限流：连接池限制为 1 个连接）
  - **步骤**：
    - 1) 配置 Room 数据库连接池（单连接模式）
    - 2) 确保数据库连接在应用退出时正确关闭
    - 3) 实现连接生命周期管理
  - **验证**：
    - [ ] 数据库连接池配置正确（单连接）
    - [ ] 应用退出时连接正确关闭（无泄漏）
    - [ ] 内存占用符合 NFR-MEM-001（连接池 ≤ 5MB）
  - **产物**：`database/AppDatabase.kt`（修改）

**检查点**：至此，Story ST-001 应具备完整功能且可独立测试（数据库可创建和初始化）

---

## 阶段 4：Story ST-002 - 用户账户管理（类型：Functional）

**目标**：应用首次启动时自动创建用户账户，每个账户具有唯一标识符，账户信息可查询

**验证方式（高层）**：首次启动自动创建账户；账户 ID 唯一且稳定；账户信息可查询（FR-001）

### ST-002 任务

- [ ] T200 [ST-002] 创建用户账户 Entity（路径：`app/src/main/java/com/jacky/verity/data/entity/UserAccountEntity.kt`）
  - **依赖**：T101
  - **设计引用**：plan.md:B3.2 物理数据结构（user_account 表）
  - **步骤**：
    - 1) 创建 `UserAccountEntity` 数据类，使用 Room `@Entity` 注解
    - 2) 定义字段：`user_id`（主键，String/UUID）、`created_at`（Long）、`last_active_at`（Long）
    - 3) 配置主键和索引
    - 4) 在 `AppDatabase` 中注册 Entity
  - **验证**：
    - [ ] Entity 类可编译通过
    - [ ] 字段类型和约束正确
    - [ ] Entity 已在 AppDatabase 中注册
  - **产物**：`entity/UserAccountEntity.kt`、`database/AppDatabase.kt`（修改）

- [ ] T201 [ST-002] 创建用户账户 DAO（路径：`app/src/main/java/com/jacky/verity/data/dao/UserAccountDao.kt`）
  - **依赖**：T200
  - **设计引用**：plan.md:A3.2 模块拆分与职责（DAO 层）
  - **步骤**：
    - 1) 创建 `UserAccountDao` 接口，使用 Room `@Dao` 注解
    - 2) 实现查询方法：`getUserAccount()`、`getUserAccountById(userId: String)`
    - 3) 实现插入方法：`insertUserAccount(account: UserAccountEntity)`
    - 4) 实现更新方法：`updateLastActiveAt(userId: String, timestamp: Long)`
    - 5) 在 `AppDatabase` 中注册 DAO
  - **验证**：
    - [ ] DAO 接口可编译通过
    - [ ] 所有查询和更新方法定义正确
    - [ ] DAO 已在 AppDatabase 中注册
  - **产物**：`dao/UserAccountDao.kt`、`database/AppDatabase.kt`（修改）

- [ ] T202 [ST-002] 实现用户账户 Repository（路径：`app/src/main/java/com/jacky/verity/data/repository/UserAccountRepository.kt`）
  - **依赖**：T201
  - **设计引用**：plan.md:A3.2 模块拆分与职责（Repository 层）
  - **步骤**：
    - 1) 创建 `UserAccountRepository` 实现类
    - 2) 实现 `getCurrentUserAccount()` 方法（返回 Flow<UserAccountEntity>）
    - 3) 实现 `createUserAccount()` 方法（生成 UUID，插入数据库）
    - 4) 实现 `updateLastActiveAt()` 方法
    - 5) 使用协程和 Flow（Dispatchers.IO）
    - 6) 错误处理：返回 Result<UserAccountEntity, DatabaseError>
  - **验证**：
    - [ ] Repository 方法可正确调用
    - [ ] 数据库操作在 IO 线程执行
    - [ ] 错误处理正确（返回 Result 类型）
  - **产物**：`repository/UserAccountRepository.kt`

- [ ] T203 [ST-002] 实现用户账户 UseCase（路径：`app/src/main/java/com/jacky/verity/domain/usecase/GetOrCreateUserAccountUseCase.kt`）
  - **依赖**：T202
  - **设计引用**：plan.md:A3.2 模块拆分与职责（UseCase 层）
  - **步骤**：
    - 1) 创建 `GetOrCreateUserAccountUseCase` 类
    - 2) 实现业务逻辑：查询当前账户，不存在则创建新账户（UUID）
    - 3) 调用 Repository 方法
    - 4) 返回 Result<UserAccountEntity, DatabaseError>
  - **验证**：
    - [ ] UseCase 逻辑正确（首次启动创建账户，后续启动查询账户）
    - [ ] 账户 ID 唯一且稳定（UUID）
    - [ ] 符合 FR-001 要求
  - **产物**：`domain/usecase/GetOrCreateUserAccountUseCase.kt`

- [ ] T204 [ST-002] 集成用户账户初始化到应用启动流程（路径：`app/src/main/java/com/jacky/verity/MainActivity.kt`）
  - **依赖**：T203
  - **设计引用**：plan.md:FR-001（用户账户创建和管理）
  - **步骤**：
    - 1) 在 MainActivity 或 Application 中调用 `GetOrCreateUserAccountUseCase`
    - 2) 处理初始化结果（成功/失败）
    - 3) 确保账户在应用启动时自动创建（首次启动）
  - **验证**：
    - [ ] 应用首次启动时自动创建用户账户
    - [ ] 账户 ID 唯一且稳定
    - [ ] 账户信息可查询（通过 Repository）
    - [ ] 符合 FR-001 验收标准
  - **产物**：`MainActivity.kt`（修改）或 `Application.kt`（新建）

**检查点**：至此，Story ST-002 应具备完整功能且可独立测试（用户账户可自动创建和查询）

---

## 阶段 5：Story ST-003 - 学习数据持久化存储（类型：Functional）

**目标**：学习数据能够正确存储到数据库，支持查询和更新操作

**验证方式（高层）**：数据能够正确存储和查询；查询 p95 ≤ 100ms；写入 p95 ≤ 50ms（FR-002, FR-003, NFR-PERF-001, NFR-PERF-002）

### ST-003 任务

- [ ] T300 [P] [ST-003] 创建学习记录 Entity（路径：`app/src/main/java/com/jacky/verity/data/entity/LearningRecordEntity.kt`）
  - **依赖**：T101
  - **设计引用**：plan.md:B3.2 物理数据结构（learning_record 表）
  - **步骤**：
    - 1) 创建 `LearningRecordEntity` 数据类
    - 2) 定义字段：`record_id`（主键）、`user_id`（外键）、`word_id`（String）、`learn_date`（Long）、`learn_result`（Int，认识/不认识）、`review_interval`（Long）
    - 3) 配置主键、索引（user_id, word_id, learn_date, user_id+learn_date）
    - 4) 配置外键约束（user_id → user_account.user_id）
    - 5) 在 `AppDatabase` 中注册 Entity
  - **验证**：
    - [ ] Entity 类可编译通过
    - [ ] 字段类型、索引、外键配置正确
  - **产物**：`entity/LearningRecordEntity.kt`、`database/AppDatabase.kt`（修改）

- [ ] T301 [P] [ST-003] 创建学习进度 Entity（路径：`app/src/main/java/com/jacky/verity/data/entity/LearningProgressEntity.kt`）
  - **依赖**：T101
  - **设计引用**：plan.md:B3.2 物理数据结构（learning_progress 表）
  - **步骤**：
    - 1) 创建 `LearningProgressEntity` 数据类
    - 2) 定义字段：`progress_id`（主键）、`user_id`（外键，UNIQUE）、`total_learn_days`（Int）、`total_learn_words`（Int）、`current_learn_words`（Int）、`last_learn_time`（Long）
    - 3) 配置主键、唯一约束、索引
    - 4) 在 `AppDatabase` 中注册 Entity
  - **验证**：
    - [ ] Entity 类可编译通过
    - [ ] 唯一约束配置正确（一个用户一个进度记录）
  - **产物**：`entity/LearningProgressEntity.kt`、`database/AppDatabase.kt`（修改）

- [ ] T302 [P] [ST-003] 创建学习统计 Entity（路径：`app/src/main/java/com/jacky/verity/data/entity/LearningStatisticsEntity.kt`）
  - **依赖**：T101
  - **设计引用**：plan.md:B3.2 物理数据结构（learning_statistics 表）
  - **步骤**：
    - 1) 创建 `LearningStatisticsEntity` 数据类
    - 2) 定义字段：`stat_id`（主键）、`user_id`（外键）、`stat_date`（Long）、`learn_word_count`（Int）、`correct_rate`（Float）、`learn_duration`（Long）
    - 3) 配置主键、索引（user_id, stat_date, user_id+stat_date）
    - 4) 在 `AppDatabase` 中注册 Entity
  - **验证**：
    - [ ] Entity 类可编译通过
    - [ ] 索引配置正确（支持按日期范围查询）
  - **产物**：`entity/LearningStatisticsEntity.kt`、`database/AppDatabase.kt`（修改）

- [ ] T303 [ST-003] 创建学习记录 DAO（路径：`app/src/main/java/com/jacky/verity/data/dao/LearningRecordDao.kt`）
  - **依赖**：T300
  - **设计引用**：plan.md:A3.2 模块拆分与职责（DAO 层）
  - **步骤**：
    - 1) 创建 `LearningRecordDao` 接口
    - 2) 实现查询方法：`getLearningRecordsByDate(userId: String, date: Long)`、`getLearningRecordsByWord(userId: String, wordId: String)`、`getRecentLearningRecords(userId: String, limit: Int)`
    - 3) 实现插入方法：`insertLearningRecord(record: LearningRecordEntity)`、`insertLearningRecords(records: List<LearningRecordEntity>)`（批量）
    - 4) 实现更新方法：`updateLearningRecord(record: LearningRecordEntity)`
    - 5) 使用事务确保批量插入原子性
    - 6) 在 `AppDatabase` 中注册 DAO
  - **验证**：
    - [ ] DAO 接口可编译通过
    - [ ] 查询方法支持按日期、按单词、按最近记录查询
    - [ ] 批量插入使用事务
  - **产物**：`dao/LearningRecordDao.kt`、`database/AppDatabase.kt`（修改）

- [ ] T304 [ST-003] 创建学习进度和统计 DAO（路径：`app/src/main/java/com/jacky/verity/data/dao/LearningProgressDao.kt`、`app/src/main/java/com/jacky/verity/data/dao/LearningStatisticsDao.kt`）
  - **依赖**：T301, T302
  - **设计引用**：plan.md:A3.2 模块拆分与职责（DAO 层）
  - **步骤**：
    - 1) 创建 `LearningProgressDao` 接口：`getLearningProgress(userId: String)`、`insertOrUpdateProgress(progress: LearningProgressEntity)`
    - 2) 创建 `LearningStatisticsDao` 接口：`getStatisticsByDateRange(userId: String, startDate: Long, endDate: Long)`、`getStatisticsByDate(userId: String, date: Long)`、`insertOrUpdateStatistics(stat: LearningStatisticsEntity)`
    - 3) 在 `AppDatabase` 中注册 DAO
  - **验证**：
    - [ ] DAO 接口可编译通过
    - [ ] 查询方法支持按日期范围查询统计
  - **产物**：`dao/LearningProgressDao.kt`、`dao/LearningStatisticsDao.kt`、`database/AppDatabase.kt`（修改）

- [ ] T305 [ST-003] 实现学习数据 Repository（路径：`app/src/main/java/com/jacky/verity/data/repository/LearningDataRepository.kt`）
  - **依赖**：T303, T304
  - **设计引用**：plan.md:A3.2 模块拆分与职责（Repository 层）、plan.md:A3.3 模块协作与通信方式（并发控制）
  - **步骤**：
    - 1) 创建 `LearningDataRepository` 实现类
    - 2) 实现学习记录方法：`getLearningRecordsByDate()`、`getLearningRecordsByWord()`、`insertLearningRecord()`、`insertLearningRecords()`（批量）
    - 3) 实现学习进度方法：`getLearningProgress()`、`updateLearningProgress()`
    - 4) 实现学习统计方法：`getStatisticsByDateRange()`、`getStatisticsByDate()`、`insertOrUpdateStatistics()`
    - 5) 使用协程和 Flow（Dispatchers.IO）
    - 6) 实现并发写入控制（使用 Mutex 串行化写入操作，符合 RISK-004 消解策略）
    - 7) 错误处理：返回 Result<T, DatabaseError>
  - **验证**：
    - [ ] Repository 方法可正确调用
    - [ ] 数据库操作在 IO 线程执行
    - [ ] 并发写入使用 Mutex 保护（避免数据不一致）
    - [ ] 错误处理正确
  - **产物**：`repository/LearningDataRepository.kt`

- [ ] T306 [ST-003] 实现学习数据 UseCase（路径：`app/src/main/java/com/jacky/verity/domain/usecase/`）
  - **依赖**：T305
  - **设计引用**：plan.md:A3.2 模块拆分与职责（UseCase 层）
  - **步骤**：
    - 1) 创建 `SaveLearningRecordUseCase`：保存学习记录
    - 2) 创建 `GetLearningRecordsUseCase`：查询学习记录（按日期、按单词等）
    - 3) 创建 `UpdateLearningProgressUseCase`：更新学习进度
    - 4) 创建 `GetLearningStatisticsUseCase`：查询学习统计
    - 5) 调用 Repository 方法，实现业务逻辑验证
    - 6) 返回 Result<T, DatabaseError>
  - **验证**：
    - [ ] UseCase 逻辑正确
    - [ ] 业务规则验证正确
    - [ ] 符合 FR-002、FR-003 要求
  - **产物**：`domain/usecase/SaveLearningRecordUseCase.kt`、`domain/usecase/GetLearningRecordsUseCase.kt`、`domain/usecase/UpdateLearningProgressUseCase.kt`、`domain/usecase/GetLearningStatisticsUseCase.kt`

- [ ] T307 [ST-003] 性能验证：数据库查询和写入性能测试（路径：`app/src/androidTest/java/com/jacky/verity/data/`）
  - **依赖**：T306
  - **设计引用**：plan.md:NFR-PERF-001（查询 p95 ≤ 100ms）、NFR-PERF-002（写入 p95 ≤ 50ms）
  - **步骤**：
    - 1) 创建 InstrumentedTest：`LearningDataPerformanceTest.kt`
    - 2) 测试单表查询性能（10 万条记录，测量 p95 耗时）
    - 3) 测试单条插入性能（测量 p95 耗时）
    - 4) 测试批量插入性能（100 条记录，测量总耗时）
    - 5) 验证性能指标符合 NFR 要求
  - **验证**：
    - [ ] 单表查询 p95 ≤ 100ms（NFR-PERF-001）
    - [ ] 单条插入 p95 ≤ 50ms（NFR-PERF-002）
    - [ ] 批量插入（100 条）≤ 1 秒（NFR-PERF-001）
    - [ ] 测试在真实设备上运行
  - **产物**：`androidTest/java/com/jacky/verity/data/LearningDataPerformanceTest.kt`

**检查点**：至此，Story ST-003 应具备完整功能且可独立测试（学习数据可存储、查询、更新，性能符合要求）

---

## 阶段 6：Story ST-004 - 数据库查询优化（类型：Optimization）

**目标**：数据库查询性能满足 NFR 要求，支持大数据量场景（10 万条记录）

**验证方式（高层）**：单表查询 p95 ≤ 100ms（10 万条记录）；多表关联查询 p95 ≤ 500ms；内存占用 ≤ 25MB（NFR-PERF-001, NFR-MEM-001）

### ST-004 任务

- [ ] T400 [ST-004] 优化数据库索引（路径：`app/src/main/java/com/jacky/verity/data/entity/`）
  - **依赖**：T307
  - **设计引用**：plan.md:A5 技术风险与消解策略（RISK-006：查询性能下降）
  - **步骤**：
    - 1) 检查现有索引是否覆盖常用查询（按日期、按单词、按用户）
    - 2) 为 learning_record 表添加复合索引（user_id + learn_date）
    - 3) 为 learning_statistics 表添加复合索引（user_id + stat_date）
    - 4) 验证索引对查询性能的提升
  - **验证**：
    - [ ] 索引已正确创建
    - [ ] 查询性能提升（p95 耗时降低）
    - [ ] 索引不影响写入性能
  - **产物**：`entity/LearningRecordEntity.kt`（修改）、`entity/LearningStatisticsEntity.kt`（修改）

- [ ] T401 [ST-004] 实现查询结果缓存（路径：`app/src/main/java/com/jacky/verity/data/repository/LearningDataRepository.kt`）
  - **依赖**：T400
  - **设计引用**：plan.md:A10 内存评估（缓存策略：LRU，最多 100 条）
  - **步骤**：
    - 1) 实现 LRU 缓存（使用 LinkedHashMap 或 LruCache）
    - 2) 缓存热点数据（最近查询的学习记录、学习进度）
    - 3) 缓存大小限制：最多 100 条记录
    - 4) 缓存键策略：基于查询参数生成唯一键
    - 5) 在 Repository 中集成缓存（查询时先查缓存，未命中再查数据库）
  - **验证**：
    - [ ] 缓存正确工作（命中率 > 50%）
    - [ ] 缓存大小不超过限制（100 条）
    - [ ] 内存占用符合 NFR-MEM-001（缓存 ≤ 20MB）
  - **产物**：`repository/LearningDataRepository.kt`（修改）、`repository/CacheManager.kt`（新建）

- [ ] T402 [ST-004] 实现分页查询（路径：`app/src/main/java/com/jacky/verity/data/dao/LearningRecordDao.kt`）
  - **依赖**：T400
  - **设计引用**：plan.md:A10 内存评估（分页查询，限制单次加载 50 条）
  - **步骤**：
    - 1) 在 DAO 中添加分页查询方法：`getLearningRecordsPaged(userId: String, offset: Int, limit: Int)`
    - 2) 使用 LIMIT 和 OFFSET 实现分页
    - 3) 限制单次查询最多 50 条记录
    - 4) 在 Repository 中封装分页查询逻辑
  - **验证**：
    - [ ] 分页查询正确工作
    - [ ] 单次查询不超过 50 条
    - [ ] 内存占用降低（避免一次性加载大量数据）
  - **产物**：`dao/LearningRecordDao.kt`（修改）、`repository/LearningDataRepository.kt`（修改）

- [ ] T403 [ST-004] 性能验证：优化后查询性能测试（路径：`app/src/androidTest/java/com/jacky/verity/data/LearningDataPerformanceTest.kt`）
  - **依赖**：T401, T402
  - **设计引用**：plan.md:NFR-PERF-001（查询性能要求）、NFR-MEM-001（内存要求）
  - **步骤**：
    - 1) 更新性能测试：测试优化后的查询性能
    - 2) 测试单表查询（10 万条记录）：验证 p95 ≤ 100ms
    - 3) 测试多表关联查询：验证 p95 ≤ 500ms
    - 4) 测试内存占用：验证峰值 ≤ 25MB
    - 5) 对比优化前后的性能差异
  - **验证**：
    - [ ] 单表查询 p95 ≤ 100ms（10 万条记录）
    - [ ] 多表关联查询 p95 ≤ 500ms
    - [ ] 内存占用峰值 ≤ 25MB
    - [ ] 性能相比优化前有提升
  - **产物**：`androidTest/java/com/jacky/verity/data/LearningDataPerformanceTest.kt`（修改）

**检查点**：至此，Story ST-004 应具备完整功能且可独立测试（查询性能优化完成，符合 NFR 要求）

---

## 阶段 7：Story ST-005 - 数据库版本升级和迁移（类型：Infrastructure）

**目标**：数据库版本升级成功，升级过程中数据不丢失，支持回滚机制

**验证方式（高层）**：版本升级成功；升级过程中数据完整；升级失败时可回滚（FR-006, NFR-REL-003）

### ST-005 任务

- [ ] T500 [ST-005] 实现数据库迁移策略（路径：`app/src/main/java/com/jacky/verity/data/database/migration/`）
  - **依赖**：T101
  - **设计引用**：plan.md:A5 技术风险与消解策略（RISK-002：升级失败导致数据丢失）
  - **步骤**：
    - 1) 创建迁移目录：`migration/`
    - 2) 创建 Migration 1→2 示例（如需要）：`Migration1To2.kt`
    - 3) 实现迁移逻辑：新增列、修改列、数据转换
    - 4) 在 `AppDatabase` 中注册 Migration
    - 5) 实现迁移前备份机制（迁移前备份数据库文件）
  - **验证**：
    - [ ] Migration 类可编译通过
    - [ ] 迁移逻辑正确（数据不丢失）
    - [ ] 迁移前备份机制工作正常
  - **产物**：`database/migration/Migration1To2.kt`、`database/AppDatabase.kt`（修改）

- [ ] T501 [ST-005] 实现数据库版本检查和升级逻辑（路径：`app/src/main/java/com/jacky/verity/data/database/DatabaseInitializer.kt`）
  - **依赖**：T500
  - **设计引用**：plan.md:FR-006（数据库版本升级和数据迁移）
  - **步骤**：
    - 1) 在 `DatabaseInitializer` 中添加版本检查逻辑
    - 2) 检测数据库当前版本，与目标版本对比
    - 3) 如果版本不一致，执行迁移（调用 Room Migration）
    - 4) 迁移失败时回滚（恢复备份文件）
    - 5) 记录迁移事件日志（符合 NFR-OBS-001）
  - **验证**：
    - [ ] 版本检查正确工作
    - [ ] 迁移成功时数据完整
    - [ ] 迁移失败时可回滚
    - [ ] 迁移事件正确记录日志
  - **产物**：`database/DatabaseInitializer.kt`（修改）

- [ ] T502 [ST-005] 迁移测试和验证（路径：`app/src/androidTest/java/com/jacky/verity/data/database/`）
  - **依赖**：T501
  - **设计引用**：plan.md:NFR-REL-003（升级成功率 ≥ 99%）
  - **步骤**：
    - 1) 创建迁移测试：`DatabaseMigrationTest.kt`
    - 2) 测试正常迁移场景（v1 → v2）
    - 3) 测试迁移失败回滚场景
    - 4) 验证迁移后数据完整性
  - **验证**：
    - [ ] 迁移测试通过
    - [ ] 迁移成功率 ≥ 99%
    - [ ] 迁移失败时可正确回滚
  - **产物**：`androidTest/java/com/jacky/verity/data/database/DatabaseMigrationTest.kt`

**检查点**：至此，Story ST-005 应具备完整功能且可独立测试（数据库版本升级和迁移机制就绪）

---

## 阶段 8：Story ST-006 - 数据备份导出（类型：Functional）

**目标**：用户能够成功导出数据备份文件，文件包含所有学习数据，备份文件格式正确

**验证方式（高层）**：备份文件成功导出；文件包含所有数据；导出时间 ≤ 5 秒（1000 条记录）（FR-004, NFR-PERF-003）

### ST-006 任务

- [ ] T600 [ST-006] 创建备份服务接口（路径：`app/src/main/java/com/jacky/verity/data/backup/BackupService.kt`）
  - **依赖**：T305
  - **设计引用**：plan.md:A3.2 模块拆分与职责（BackupService 模块）
  - **步骤**：
    - 1) 创建 `BackupService` 接口
    - 2) 定义方法：`exportBackup(filePath: String): Result<BackupResult, BackupError>`
    - 3) 定义备份数据结构（JSON 格式）
    - 4) 定义备份文件版本标识
  - **验证**：
    - [ ] 接口定义清晰
    - [ ] 备份数据结构完整（包含所有实体）
  - **产物**：`backup/BackupService.kt`、`backup/BackupData.kt`（数据类）

- [ ] T601 [ST-006] 实现备份导出逻辑（路径：`app/src/main/java/com/jacky/verity/data/backup/BackupServiceImpl.kt`）
  - **依赖**：T600
  - **设计引用**：plan.md:A3.2 模块拆分与职责（BackupService）、plan.md:A5 技术风险与消解策略（RISK-003：存储空间不足）
  - **步骤**：
    - 1) 实现 `BackupServiceImpl` 类
    - 2) 从 Repository 查询所有数据（用户账户、学习记录、学习进度、学习统计）
    - 3) 将数据序列化为 JSON 格式（使用 Gson 或 kotlinx.serialization）
    - 4) 写入备份文件（使用文件系统 API，应用私有目录或外部存储）
    - 5) 实现存储空间检查（导出前检查可用空间）
    - 6) 实现备份文件完整性校验（生成校验和）
    - 7) 使用协程和 Dispatchers.IO
    - 8) 错误处理：返回 Result<BackupResult, BackupError>
  - **验证**：
    - [ ] 备份文件成功导出
    - [ ] 文件包含所有学习数据
    - [ ] 文件格式正确（JSON）
    - [ ] 存储空间不足时正确提示错误
    - [ ] 备份文件完整性校验通过
  - **产物**：`backup/BackupServiceImpl.kt`

- [ ] T602 [ST-006] 实现备份导出 UseCase（路径：`app/src/main/java/com/jacky/verity/domain/usecase/ExportBackupUseCase.kt`）
  - **依赖**：T601
  - **设计引用**：plan.md:A3.2 模块拆分与职责（UseCase 层）
  - **步骤**：
    - 1) 创建 `ExportBackupUseCase` 类
    - 2) 调用 BackupService 导出备份
    - 3) 实现业务逻辑验证（文件路径有效性、存储空间检查）
    - 4) 返回 Result<BackupResult, BackupError>
  - **验证**：
    - [ ] UseCase 逻辑正确
    - [ ] 业务规则验证正确
  - **产物**：`domain/usecase/ExportBackupUseCase.kt`

- [ ] T603 [ST-006] 性能验证：备份导出性能测试（路径：`app/src/androidTest/java/com/jacky/verity/data/backup/`）
  - **依赖**：T602
  - **设计引用**：plan.md:NFR-PERF-003（备份导出时间 ≤ 5 秒）
  - **步骤**：
    - 1) 创建备份性能测试：`BackupPerformanceTest.kt`
    - 2) 测试 1000 条学习记录导出耗时
    - 3) 验证导出时间 ≤ 5 秒
    - 4) 验证备份文件完整性
  - **验证**：
    - [ ] 1000 条记录导出时间 ≤ 5 秒（NFR-PERF-003）
    - [ ] 备份文件完整性校验通过
    - [ ] 备份文件包含所有数据
  - **产物**：`androidTest/java/com/jacky/verity/data/backup/BackupPerformanceTest.kt`

- [ ] T604 [ST-006] 记录备份事件日志（路径：`app/src/main/java/com/jacky/verity/data/backup/BackupServiceImpl.kt`）
  - **依赖**：T601
  - **设计引用**：plan.md:NFR-OBS-003（记录备份事件）
  - **步骤**：
    - 1) 在备份导出时记录事件日志（备份文件大小、记录数、耗时、成功/失败）
    - 2) 使用结构化日志格式
    - 3) 记录到日志工具类
  - **验证**：
    - [ ] 备份事件正确记录
    - [ ] 日志包含所有必要字段（文件大小、记录数、耗时）
  - **产物**：`backup/BackupServiceImpl.kt`（修改）

**检查点**：至此，Story ST-006 应具备完整功能且可独立测试（数据备份导出功能完成，性能符合要求）

---

## 阶段 9：Story ST-007 - 数据备份恢复（类型：Functional）

**目标**：用户能够从备份文件恢复数据，恢复后数据完整且正确

**验证方式（高层）**：备份文件能够成功恢复；恢复后数据完整；恢复时间 ≤ 10 秒（FR-005, NFR-PERF-003, NFR-REL-002）

### ST-007 任务

- [ ] T700 [ST-007] 实现备份文件解析和验证（路径：`app/src/main/java/com/jacky/verity/data/backup/BackupServiceImpl.kt`）
  - **依赖**：T600
  - **设计引用**：plan.md:A5 技术风险与消解策略（RISK-005：备份文件格式错误）
  - **步骤**：
    - 1) 实现备份文件读取逻辑
    - 2) 解析 JSON 格式备份文件
    - 3) 验证备份文件格式（版本检查、结构验证）
    - 4) 验证备份文件完整性（校验和验证）
    - 5) 错误处理：文件格式错误、文件损坏、版本不兼容
  - **验证**：
    - [ ] 备份文件正确解析
    - [ ] 格式验证正确工作
    - [ ] 完整性校验正确工作
    - [ ] 错误场景正确处理
  - **产物**：`backup/BackupServiceImpl.kt`（修改）

- [ ] T701 [ST-007] 实现备份恢复逻辑（路径：`app/src/main/java/com/jacky/verity/data/backup/BackupServiceImpl.kt`）
  - **依赖**：T700
  - **设计引用**：plan.md:A3.2 模块拆分与职责（BackupService）、plan.md:A5 技术风险与消解策略（RISK-001：数据恢复失败）
  - **步骤**：
    - 1) 实现 `importBackup(filePath: String): Result<ImportResult, BackupError>` 方法
    - 2) 解析备份文件数据
    - 3) 使用数据库事务恢复数据（确保原子性）
    - 4) 恢复顺序：用户账户 → 学习记录 → 学习进度 → 学习统计
    - 5) 实现数据冲突处理（合并/覆盖策略，由用户选择）
    - 6) 恢复失败时回滚事务（数据不丢失）
    - 7) 使用协程和 Dispatchers.IO
    - 8) 错误处理：返回 Result<ImportResult, BackupError>
  - **验证**：
    - [ ] 备份文件能够成功恢复
    - [ ] 恢复后数据完整且正确
    - [ ] 恢复失败时事务回滚（数据不丢失）
    - [ ] 数据冲突正确处理
  - **产物**：`backup/BackupServiceImpl.kt`（修改）

- [ ] T702 [ST-007] 实现备份恢复 UseCase（路径：`app/src/main/java/com/jacky/verity/domain/usecase/ImportBackupUseCase.kt`）
  - **依赖**：T701
  - **设计引用**：plan.md:A3.2 模块拆分与职责（UseCase 层）
  - **步骤**：
    - 1) 创建 `ImportBackupUseCase` 类
    - 2) 调用 BackupService 导入备份
    - 3) 实现业务逻辑验证（文件路径有效性、文件格式检查）
    - 4) 返回 Result<ImportResult, BackupError>
  - **验证**：
    - [ ] UseCase 逻辑正确
    - [ ] 业务规则验证正确
  - **产物**：`domain/usecase/ImportBackupUseCase.kt`

- [ ] T703 [ST-007] 性能验证：备份恢复性能测试（路径：`app/src/androidTest/java/com/jacky/verity/data/backup/BackupPerformanceTest.kt`）
  - **依赖**：T702
  - **设计引用**：plan.md:NFR-PERF-003（恢复时间 ≤ 10 秒）、NFR-REL-002（恢复成功率 ≥ 99%）
  - **步骤**：
    - 1) 更新备份性能测试：测试恢复性能
    - 2) 测试 1000 条学习记录恢复耗时
    - 3) 验证恢复时间 ≤ 10 秒
    - 4) 验证恢复成功率 ≥ 99%
    - 5) 验证恢复后数据完整性
  - **验证**：
    - [ ] 1000 条记录恢复时间 ≤ 10 秒（NFR-PERF-003）
    - [ ] 恢复成功率 ≥ 99%（NFR-REL-002）
    - [ ] 恢复后数据完整且正确
  - **产物**：`androidTest/java/com/jacky/verity/data/backup/BackupPerformanceTest.kt`（修改）

- [ ] T704 [ST-007] 记录恢复事件日志（路径：`app/src/main/java/com/jacky/verity/data/backup/BackupServiceImpl.kt`）
  - **依赖**：T701
  - **设计引用**：plan.md:NFR-OBS-003（记录恢复事件、数据恢复前后对比）
  - **步骤**：
    - 1) 在备份恢复时记录事件日志（备份文件大小、记录数、耗时、成功/失败）
    - 2) 记录恢复前后的数据量对比（记录数、数据大小）
    - 3) 使用结构化日志格式
  - **验证**：
    - [ ] 恢复事件正确记录
    - [ ] 日志包含所有必要字段（文件大小、记录数、耗时、数据量对比）
  - **产物**：`backup/BackupServiceImpl.kt`（修改）

**检查点**：至此，Story ST-007 应具备完整功能且可独立测试（数据备份恢复功能完成，性能符合要求）

---

## 阶段 10：Story ST-008 - 错误处理和用户提示（类型：Functional）

**目标**：所有数据库操作失败场景都有明确的错误提示，用户能够理解问题原因和解决方法

**验证方式（高层）**：所有错误场景都有明确的错误提示；错误信息包含解决建议；错误日志正确记录（FR-008, NFR-OBS-001, NFR-OBS-002）

### ST-008 任务

- [ ] T800 [ST-008] 完善错误类型定义（路径：`app/src/main/java/com/jacky/verity/data/error/`）
  - **依赖**：T020
  - **设计引用**：plan.md:B2 架构细化（错误处理规范）
  - **步骤**：
    - 1) 完善 `DatabaseError`：添加所有数据库错误场景（存储空间不足、数据库损坏、查询超时、写入失败等）
    - 2) 完善 `BackupError`：添加所有备份错误场景（文件格式错误、文件损坏、存储空间不足等）
    - 3) 为每个错误类型添加用户友好的错误消息和解决建议
    - 4) 实现错误转换逻辑（Error → 用户提示字符串）
  - **验证**：
    - [ ] 所有错误场景都有对应的错误类型
    - [ ] 错误消息清晰明确，包含解决建议
  - **产物**：`error/DatabaseError.kt`（修改）、`error/BackupError.kt`（修改）

- [ ] T801 [ST-008] 实现错误日志记录（路径：`app/src/main/java/com/jacky/verity/util/Logger.kt`）
  - **依赖**：T800
  - **设计引用**：plan.md:NFR-OBS-002（错误日志记录）
  - **步骤**：
    - 1) 完善日志工具类：实现错误日志记录方法
    - 2) 记录错误类型、SQL 语句（如适用）、错误详情、堆栈信息
    - 3) 使用结构化日志格式
    - 4) 敏感信息脱敏（不记录用户数据内容）
  - **验证**：
    - [ ] 错误日志正确记录
    - [ ] 日志包含所有必要字段（错误类型、详情、堆栈）
    - [ ] 敏感信息已脱敏
  - **产物**：`util/Logger.kt`（修改）

- [ ] T802 [ST-008] 实现错误处理和用户提示集成（路径：`app/src/main/java/com/jacky/verity/data/repository/`、`app/src/main/java/com/jacky/verity/domain/usecase/`）
  - **依赖**：T801
  - **设计引用**：plan.md:FR-008（错误信息提示）、plan.md:NFR-PERF-004（失败降级策略）
  - **步骤**：
    - 1) 在 Repository 中统一错误处理：捕获异常，转换为 DatabaseError/BackupError
    - 2) 在 UseCase 中统一错误处理：将错误转换为用户友好的提示
    - 3) 实现降级策略：查询失败时返回空结果或缓存数据，写入失败时提示用户并阻止操作
    - 4) 确保所有数据库操作失败场景都有错误处理
  - **验证**：
    - [ ] 所有错误场景都有错误处理
    - [ ] 错误提示清晰明确，包含解决建议
    - [ ] 降级策略正确工作
  - **产物**：`repository/` 相关文件（修改）、`domain/usecase/` 相关文件（修改）

- [ ] T803 [ST-008] 错误处理测试和验证（路径：`app/src/test/java/com/jacky/verity/data/`）
  - **依赖**：T802
  - **设计引用**：plan.md:FR-008（错误信息提示）
  - **步骤**：
    - 1) 创建错误处理测试：`ErrorHandlingTest.kt`
    - 2) 测试各种错误场景（存储空间不足、数据库损坏、查询超时、文件格式错误等）
    - 3) 验证错误提示正确显示
    - 4) 验证错误日志正确记录
  - **验证**：
    - [ ] 所有错误场景测试通过
    - [ ] 错误提示符合要求（清晰、包含解决建议）
    - [ ] 错误日志正确记录
  - **产物**：`test/java/com/jacky/verity/data/ErrorHandlingTest.kt`

**检查点**：至此，Story ST-008 应具备完整功能且可独立测试（错误处理和用户提示功能完成）

---

## 依赖关系与执行顺序

### 阶段依赖

- **环境搭建（阶段 1）**：无依赖——可立即启动
- **核心基础（阶段 2）**：依赖环境搭建完成——阻塞所有用户故事
- **用户故事（阶段 3+）**：均依赖核心基础阶段完成
    - ST-001（阶段 3）：无 Story 依赖，可立即启动
    - ST-002（阶段 4）：依赖 ST-001
    - ST-003（阶段 5）：依赖 ST-001，可与 ST-002 并行（但需先完成 ST-001）
    - ST-004（阶段 6）：依赖 ST-003
    - ST-005（阶段 7）：依赖 ST-001，可与 ST-002/ST-003 并行
    - ST-006（阶段 8）：依赖 ST-003，可与 ST-007 并行
    - ST-007（阶段 9）：依赖 ST-003、ST-006（用于测试），可与 ST-006 并行
    - ST-008（阶段 10）：依赖 ST-003，可与 ST-006/ST-007 并行
- **优化完善（最终阶段）**：依赖所有目标用户故事完成

### Story 依赖

- **ST-001**：依赖阶段 2 完成
- **ST-002**：依赖 ST-001
- **ST-003**：依赖 ST-001
- **ST-004**：依赖 ST-003
- **ST-005**：依赖 ST-001
- **ST-006**：依赖 ST-003
- **ST-007**：依赖 ST-003、ST-006（用于测试）
- **ST-008**：依赖 ST-003

### 单 Story 内部顺序

- 测试用例（如有）必须先编写并确保执行失败后，再开展实现工作
- Entity/DAO 层开发先于 Repository 层
- Repository 层开发先于 UseCase 层
- 核心功能实现先于集成工作
- 性能验证任务在功能实现完成后执行
- 本故事完成后，再推进下一优先级故事

### 并行执行场景

- 所有标记 [P] 的环境搭建任务可并行
- 所有标记 [P] 的核心基础任务可并行（阶段 2 内）
- 核心基础阶段完成后，ST-001 可立即启动
- ST-001 完成后，ST-002 和 ST-003 可并行启动
- ST-003 完成后，ST-004、ST-006、ST-007、ST-008 可并行启动（ST-004 依赖 ST-003，但可与 ST-006/ST-007/ST-008 并行）
- 单用户故事下所有标记 [P] 的 Entity 创建任务可并行（如 ST-003 的 T300、T301、T302）
- 不同团队成员可并行开发不同用户故事

---

## 并行示例：Story ST-003

```bash
# 批量启动 ST-003 的可并行任务：
任务："[ST-003] 创建学习记录 Entity，路径：entity/LearningRecordEntity.kt"
任务："[ST-003] 创建学习进度 Entity，路径：entity/LearningProgressEntity.kt"
任务："[ST-003] 创建学习统计 Entity，路径：entity/LearningStatisticsEntity.kt"
```

---

## 落地策略

### 先完成 MVP（优先完成关键 Story 集合）

1. 完成阶段 1：环境搭建
2. 完成阶段 2：核心基础（关键——阻塞所有故事）
3. 完成阶段 3：Story ST-001（数据库基础设施）
4. 完成阶段 4：Story ST-002（用户账户管理）
5. 完成阶段 5：Story ST-003（学习数据持久化存储）
6. **暂停并验证**：独立验证 ST-001、ST-002、ST-003
7. 如就绪，进行部署/演示（MVP！）

### 增量交付

1. 完成环境搭建 + 核心基础 → 基础层就绪
2. 新增 ST-001 → 独立验证 → 数据库基础设施就绪
3. 新增 ST-002 → 独立验证 → 用户账户管理就绪
4. 新增 ST-003 → 独立验证 → 数据持久化就绪（MVP！）
5. 新增 ST-004 → 独立验证 → 查询性能优化
6. 新增 ST-005 → 独立验证 → 数据库迁移机制
7. 新增 ST-006 → 独立验证 → 数据备份导出
8. 新增 ST-007 → 独立验证 → 数据备份恢复
9. 新增 ST-008 → 独立验证 → 错误处理完善
10. 每个故事均需在不破坏已有故事的前提下新增价值

### 团队并行策略

多开发者协作场景：

1. 团队共同完成环境搭建 + 核心基础
2. 核心基础完成后：
    - 开发者 A：负责 ST-001（数据库基础设施）
3. ST-001 完成后：
    - 开发者 A：负责 ST-002（用户账户管理）
    - 开发者 B：负责 ST-003（学习数据持久化存储）
4. ST-003 完成后：
    - 开发者 A：负责 ST-004（查询优化）
    - 开发者 B：负责 ST-006（备份导出）
    - 开发者 C：负责 ST-007（备份恢复）
    - 开发者 D：负责 ST-008（错误处理）
5. 各 Story 独立完成并集成

---

## 任务汇总

- **任务总数**：约 50 个任务
- **各 Story 对应的任务数量**：
  - ST-001：3 个任务
  - ST-002：5 个任务
  - ST-003：8 个任务
  - ST-004：4 个任务
  - ST-005：3 个任务
  - ST-006：5 个任务
  - ST-007：5 个任务
  - ST-008：4 个任务
- **识别出的可并行执行机会**：
  - 阶段 1：T012 可并行
  - 阶段 2：T021 可并行
  - ST-003：T300、T301、T302 可并行（Entity 创建）
- **每个 Story 的验证方式摘要（含指标阈值）**：
  - ST-001：数据库初始化耗时 ≤ 500ms
  - ST-002：用户账户自动创建，ID 唯一且稳定
  - ST-003：查询 p95 ≤ 100ms，写入 p95 ≤ 50ms
  - ST-004：查询 p95 ≤ 100ms（10 万条），内存 ≤ 25MB
  - ST-005：迁移成功率 ≥ 99%
  - ST-006：导出时间 ≤ 5 秒（1000 条）
  - ST-007：恢复时间 ≤ 10 秒，成功率 ≥ 99%
  - ST-008：所有错误场景都有明确提示
- **建议的 MVP 范围**：ST-001、ST-002、ST-003（数据库基础设施 + 用户账户 + 数据持久化）

---

## 备注

- [P] 标记的任务 = 涉及不同文件，无依赖关系
- [ST-xxx] 标签将任务关联至 Plan 的 Story，便于追溯
- 每个 Story 需可独立完成、独立验证
- 实现前验证测试用例执行失败（如适用）
- 完成单个任务或逻辑分组后提交代码
- 可在任意检查点暂停，独立验证对应故事
- 避免：模糊的任务描述、同一文件冲突、破坏独立性的跨故事依赖
- 所有性能验证任务需在真实设备上运行（InstrumentedTest）
- 所有 NFR 指标必须在验证任务中明确测量和验证
