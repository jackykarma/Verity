# Tasks：用户账户与数据管理

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

- **移动端**：`app/src/main/java/com/jacky/verity/`
- **测试代码**：`app/src/test/java/com/jacky/verity/` 或 `app/src/androidTest/java/com/jacky/verity/`
- **构建配置**：`app/build.gradle.kts`、`gradle/libs.versions.toml`

---

## 阶段 0：准备（可选但建议）

**目标**：对齐版本、冻结设计输入，避免 Implement 期返工

- [ ] T001 在 `specs/epics/EPIC-001-word-memory-app/features/FEAT-005-user-account-data/` 中核对 `spec.md`、`plan.md` 的 Version 字段一致性并补齐变更记录
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

- [ ] T010 按照 plan.md 的"结构决策"创建项目目录结构（路径：`app/src/main/java/com/jacky/verity/data/`、`app/src/main/java/com/jacky/verity/domain/`）
  - **依赖**：T001
  - **步骤**：
    - 1) 创建 `data/database/`、`data/database/dao/`、`data/database/entity/`、`data/database/migration/` 目录
    - 2) 创建 `data/repository/`、`data/manager/` 目录
    - 3) 创建 `domain/usecase/account/`、`domain/usecase/learning/`、`domain/usecase/backup/` 目录
    - 4) 创建 `ui/data/` 目录（可选）
    - 5) 确保与现有模块边界一致
  - **验证**：
    - [ ] 目录结构与 plan.md B7 一致
    - [ ] 所有目录已创建
  - **产物**：相关目录结构

- [ ] T011 初始化构建与依赖（路径：`app/build.gradle.kts`、`gradle/libs.versions.toml`）
  - **依赖**：T010
  - **步骤**：
    - 1) 在 `gradle/libs.versions.toml` 中添加 Room 库版本（room = "2.6.1" 或最新稳定版）
    - 2) 在 `app/build.gradle.kts` 中添加 Room 依赖（room-runtime、room-ktx、room-compiler）
    - 3) 添加 Kotlinx Serialization 依赖（用于 JSON 序列化）
    - 4) 添加 kapt 插件（如果使用 Kotlin 1.9+ 则使用 ksp）
    - 5) 配置 Room 编译选项（如需）
  - **验证**：
    - [ ] `./gradlew build` 能够成功编译（无依赖错误）
    - [ ] Room 库能够正确导入
  - **产物**：`app/build.gradle.kts`、`gradle/libs.versions.toml`

- [ ] T012 [P] 配置代码检查与格式化工具（路径：`.editorconfig`、`app/build.gradle.kts`）
  - **依赖**：T011
  - **步骤**：
    - 1) 确保项目已有 Kotlin Lint 或 Detekt 配置
    - 2) 配置代码格式化规则（Kotlin 风格）
    - 3) 添加代码检查任务到构建流程
  - **验证**：
    - [ ] `./gradlew lint` 或 `./gradlew detekt` 命令可运行
    - [ ] 代码格式化规则生效
  - **产物**：`.editorconfig`、相关配置文件

---

## 阶段 2：核心基础（阻塞性前置条件，阻塞所有 Story）

**目标**：所有 Story 实现前必须完成的核心基础设施搭建

**⚠️ 关键**：此阶段完成前，任何 Story 相关工作均不可启动

- [ ] T020 搭建公共错误处理框架（路径：`app/src/main/java/com/jacky/verity/data/error/DatabaseError.kt`）
  - **依赖**：T012
  - **步骤**：
    - 1) 创建 `DatabaseError` Sealed Class（包含 InitializationError、MigrationError、CorruptionError、OperationError）
    - 2) 创建 `BackupError` Sealed Class（包含 ExportError、ImportError、FormatError、CorruptionError）
    - 3) 创建统一错误处理扩展函数
  - **验证**：
    - [ ] 错误类型定义完整，符合 Plan-B B2 错误处理规范
    - [ ] 错误类型能够正确序列化（用于日志记录）
  - **产物**：错误处理类文件

- [ ] T021 [P] 搭建日志和可观测性框架（路径：`app/src/main/java/com/jacky/verity/data/observability/Logger.kt`）
  - **依赖**：T020
  - **步骤**：
    - 1) 创建结构化日志接口/类
    - 2) 实现日志记录方法（info、error、warn、debug）
    - 3) 配置日志格式（时间戳、级别、模块、消息、错误详情）
    - 4) 实现敏感信息脱敏（不记录用户学习数据内容）
  - **验证**：
    - [ ] 日志能够正确记录结构化信息
    - [ ] 敏感信息已脱敏
    - [ ] 日志格式符合 Plan-B B2 要求
  - **产物**：日志框架代码

**检查点**：基础层就绪——Story 实现可并行启动（ST-001 必须先完成）

---

## 阶段 3：Story ST-001 - 数据库初始化和版本管理（类型：Infrastructure）

**目标**：数据库能够自动初始化，支持版本升级和数据迁移，初始化时间 <100ms

**验证方式（高层）**：数据库能够成功初始化，版本升级能够正确执行，迁移失败能够回滚；使用单元测试验证初始化逻辑和迁移逻辑

**覆盖 FR/NFR**：FR-006；FR-007；NFR-PERF-001；NFR-REL-001；NFR-REL-003；NFR-OBS-001

### ST-001 任务

- [ ] T100 [P] [ST-001] 创建数据库实体类（路径：`app/src/main/java/com/jacky/verity/data/database/entity/UserAccount.kt`）
  - **依赖**：T020
  - **步骤**：
    - 1) 创建 `UserAccount` Entity 类（@Entity 注解）
    - 2) 定义字段：userId（PRIMARY KEY, TEXT）、createdAt（INTEGER）、lastActiveAt（INTEGER）
    - 3) 添加 Room 注解（@PrimaryKey、@ColumnInfo）
    - 4) 实现 data class
  - **验证**：
    - [ ] 实体类编译通过
    - [ ] 字段类型和约束符合 plan.md B3.2 表结构定义
  - **产物**：`UserAccount.kt`

- [ ] T101 [P] [ST-001] 创建数据库实体类（路径：`app/src/main/java/com/jacky/verity/data/database/entity/LearningRecord.kt`）
  - **依赖**：T020
  - **步骤**：
    - 1) 创建 `LearningRecord` Entity 类
    - 2) 定义字段：recordId（PRIMARY KEY）、userId（FOREIGN KEY）、wordId、learningTime、result、reviewInterval
    - 3) 添加外键约束（@ForeignKey）
    - 4) 添加索引（@Index 在 userId、wordId、learningTime 上）
  - **验证**：
    - [ ] 实体类编译通过
    - [ ] 外键约束正确定义
    - [ ] 索引已添加
  - **产物**：`LearningRecord.kt`

- [ ] T102 [P] [ST-001] 创建数据库实体类（路径：`app/src/main/java/com/jacky/verity/data/database/entity/LearningProgress.kt`）
  - **依赖**：T020
  - **步骤**：
    - 1) 创建 `LearningProgress` Entity 类
    - 2) 定义字段：progressId（PRIMARY KEY）、userId（UNIQUE, FOREIGN KEY）、totalLearningDays、totalWordsLearned、currentWordsCount、lastLearningTime
    - 3) 添加唯一约束（@Index unique = true）
  - **验证**：
    - [ ] 实体类编译通过
    - [ ] 唯一约束正确定义
  - **产物**：`LearningProgress.kt`

- [ ] T103 [P] [ST-001] 创建数据库实体类（路径：`app/src/main/java/com/jacky/verity/data/database/entity/LearningStatistics.kt`）
  - **依赖**：T020
  - **步骤**：
    - 1) 创建 `LearningStatistics` Entity 类
    - 2) 定义字段：statisticsId（PRIMARY KEY）、userId（FOREIGN KEY）、statisticsDate、wordsLearned、accuracy、learningDuration
    - 3) 添加索引（@Index 在 userId、statisticsDate 上）
  - **验证**：
    - [ ] 实体类编译通过
    - [ ] 索引已添加
  - **产物**：`LearningStatistics.kt`

- [ ] T104 [P] [ST-001] 创建数据库实体类（路径：`app/src/main/java/com/jacky/verity/data/database/entity/DataBackup.kt`）
  - **依赖**：T020
  - **步骤**：
    - 1) 创建 `DataBackup` Entity 类
    - 2) 定义字段：backupId（PRIMARY KEY）、backupTime、filePath、fileSize、recordCount
    - 3) 添加索引（@Index 在 backupTime 上）
  - **验证**：
    - [ ] 实体类编译通过
    - [ ] 索引已添加
  - **产物**：`DataBackup.kt`

- [ ] T105 [ST-001] 创建 Room 数据库定义（路径：`app/src/main/java/com/jacky/verity/data/database/AppDatabase.kt`）
  - **依赖**：T100、T101、T102、T103、T104
  - **步骤**：
    - 1) 创建 `AppDatabase` 抽象类（继承 RoomDatabase）
    - 2) 使用 @Database 注解（entities 列表、version = 1、exportSchema = true）
    - 3) 定义抽象 DAO 方法（UserAccountDao、LearningRecordDao 等，先留空）
    - 4) 实现单例模式（getInstance 方法）
  - **验证**：
    - [ ] 数据库类编译通过
    - [ ] 所有实体已包含在 entities 列表中
    - [ ] 版本号设置为 1
  - **产物**：`AppDatabase.kt`

- [ ] T106 [ST-001] 创建数据库管理器（路径：`app/src/main/java/com/jacky/verity/data/manager/DatabaseManager.kt`）
  - **依赖**：T105、T021
  - **步骤**：
    - 1) 创建 `DatabaseManager` 类
    - 2) 实现 `initializeDatabase(context: Context): Result<AppDatabase>` 方法
    - 3) 实现数据库初始化逻辑（创建或打开数据库）
    - 4) 实现版本检测逻辑（Room 自动处理）
    - 5) 实现数据库损坏检测（try-catch 处理 SQLiteException）
    - 6) 添加日志记录（初始化成功/失败、版本、耗时）
  - **验证**：
    - [ ] 数据库能够成功初始化（新数据库）
    - [ ] 初始化时间 <100ms（NFR-PERF-001）
    - [ ] 日志正确记录初始化事件
    - [ ] 损坏检测能够正确识别损坏的数据库
  - **产物**：`DatabaseManager.kt`

- [ ] T107 [ST-001] 实现数据库迁移框架（路径：`app/src/main/java/com/jacky/verity/data/database/migration/MigrationV1ToV2.kt`）
  - **依赖**：T105、T021
  - **步骤**：
    - 1) 创建 `MigrationV1ToV2` 类（实现 Migration 接口）
    - 2) 实现 migrate 方法（示例迁移，当前版本为 1，此文件为模板）
    - 3) 实现迁移失败回滚逻辑（try-catch，记录错误日志）
    - 4) 添加日志记录（迁移开始、完成、失败）
  - **验证**：
    - [ ] 迁移类能够编译通过
    - [ ] 迁移失败时能够正确回滚
    - [ ] 日志正确记录迁移事件
  - **产物**：`MigrationV1ToV2.kt`（模板文件）

- [ ] T108 [ST-001] 编写数据库初始化单元测试（路径：`app/src/test/java/com/jacky/verity/data/manager/DatabaseManagerTest.kt`）
  - **依赖**：T106
  - **步骤**：
    - 1) 创建测试类 `DatabaseManagerTest`
    - 2) 编写测试：数据库不存在时创建新数据库
    - 3) 编写测试：数据库已存在时打开数据库
    - 4) 编写测试：数据库损坏时检测并返回错误
    - 5) 编写测试：初始化性能（<100ms）
  - **验证**：
    - [ ] 所有测试通过
    - [ ] 测试覆盖初始化流程的正常和异常场景
  - **产物**：`DatabaseManagerTest.kt`

**检查点**：至此，数据库初始化功能应具备完整功能且可独立测试

---

## 阶段 4：Story ST-002 - 用户账户管理（类型：Functional）

**目标**：用户账户能够自动创建，提供唯一用户 ID，支持账户信息查询和更新

**验证方式（高层）**：用户账户能够成功创建，用户 ID 唯一，账户信息能够查询和更新；使用单元测试和集成测试验证

**覆盖 FR/NFR**：FR-001；NFR-PERF-001；NFR-REL-001

### ST-002 任务

- [ ] T200 [ST-002] 创建用户账户 DAO（路径：`app/src/main/java/com/jacky/verity/data/database/dao/UserAccountDao.kt`）
  - **依赖**：T105
  - **步骤**：
    - 1) 创建 `UserAccountDao` 接口（@Dao 注解）
    - 2) 实现 `insertAccount(account: UserAccount)` 方法（@Insert）
    - 3) 实现 `getAccountById(userId: String): Flow<UserAccount?>` 方法（@Query）
    - 4) 实现 `updateAccount(account: UserAccount)` 方法（@Update）
    - 5) 实现 `getCurrentAccount(): Flow<UserAccount?>` 方法（查询第一个账户，单用户场景）
  - **验证**：
    - [ ] DAO 方法编译通过
    - [ ] SQL 查询语法正确（Room 编译时验证）
  - **产物**：`UserAccountDao.kt`

- [ ] T201 [ST-002] 在 AppDatabase 中注册 UserAccountDao（路径：`app/src/main/java/com/jacky/verity/data/database/AppDatabase.kt`）
  - **依赖**：T200
  - **步骤**：
    - 1) 在 `AppDatabase` 中添加 `abstract fun userAccountDao(): UserAccountDao` 方法
  - **验证**：
    - [ ] 数据库编译通过
    - [ ] DAO 能够通过数据库实例访问
  - **产物**：更新的 `AppDatabase.kt`

- [ ] T202 [ST-002] 创建用户账户 Repository（路径：`app/src/main/java/com/jacky/verity/data/repository/UserAccountRepository.kt`）
  - **依赖**：T201
  - **步骤**：
    - 1) 创建 `UserAccountRepository` 类
    - 2) 实现 `createAccount(): Result<UserAccount>` 方法（生成 UUID，创建账户）
    - 3) 实现 `getCurrentAccount(): Flow<UserAccount?>` 方法（调用 DAO）
    - 4) 实现 `updateAccount(account: UserAccount): Result<Unit>` 方法（更新最后活跃时间）
    - 5) 添加错误处理（DatabaseError）
  - **验证**：
    - [ ] Repository 方法能够正确调用 DAO
    - [ ] 错误处理正确
  - **产物**：`UserAccountRepository.kt`

- [ ] T203 [ST-002] 创建创建账户 UseCase（路径：`app/src/main/java/com/jacky/verity/domain/usecase/account/CreateAccountUseCase.kt`）
  - **依赖**：T202
  - **步骤**：
    - 1) 创建 `CreateAccountUseCase` 类
    - 2) 实现 `invoke(): Flow<Result<UserAccount>>` 方法
    - 3) 检查账户是否已存在，如果不存在则创建
    - 4) 调用 Repository 创建账户
  - **验证**：
    - [ ] UseCase 能够正确调用 Repository
    - [ ] 账户创建逻辑正确
  - **产物**：`CreateAccountUseCase.kt`

- [ ] T204 [ST-002] 编写用户账户管理单元测试（路径：`app/src/test/java/com/jacky/verity/data/repository/UserAccountRepositoryTest.kt`）
  - **依赖**：T202
  - **步骤**：
    - 1) 创建测试类（使用 Room.inMemoryDatabaseBuilder 创建内存数据库）
    - 2) 编写测试：创建账户成功
    - 3) 编写测试：用户 ID 唯一性
    - 4) 编写测试：查询账户
    - 5) 编写测试：更新账户
  - **验证**：
    - [ ] 所有测试通过
    - [ ] 测试覆盖 FR-001 的所有场景
  - **产物**：`UserAccountRepositoryTest.kt`

**检查点**：至此，用户账户管理功能应具备完整功能且可独立测试

---

## 阶段 5：Story ST-003 - 学习数据持久化（类型：Functional）

**目标**：学习数据能够正确存储和查询，支持条件查询，查询性能符合要求

**验证方式（高层）**：学习数据能够正确存储和查询，查询性能符合要求（单表查询 p95 ≤100ms），数据一致性保证；使用单元测试、集成测试和性能测试验证

**覆盖 FR/NFR**：FR-002；FR-003；NFR-PERF-001；NFR-PERF-002；NFR-REL-001；NFR-OBS-001

### ST-003 任务

- [ ] T300 [P] [ST-003] 创建学习记录 DAO（路径：`app/src/main/java/com/jacky/verity/data/database/dao/LearningRecordDao.kt`）
  - **依赖**：T105
  - **步骤**：
    - 1) 创建 `LearningRecordDao` 接口
    - 2) 实现 `insertRecord(record: LearningRecord)` 方法（@Insert）
    - 3) 实现 `insertRecords(records: List<LearningRecord>)` 方法（批量插入，@Transaction）
    - 4) 实现 `getRecordsByUserId(userId: String): Flow<List<LearningRecord>>` 方法（@Query）
    - 5) 实现 `getRecordsByDateRange(userId: String, startDate: Long, endDate: Long): Flow<List<LearningRecord>>` 方法
    - 6) 实现 `getRecordsByWordId(userId: String, wordId: String): Flow<List<LearningRecord>>` 方法
    - 7) 实现 `updateRecord(record: LearningRecord)` 方法（@Update）
  - **验证**：
    - [ ] DAO 方法编译通过
    - [ ] SQL 查询正确使用索引
  - **产物**：`LearningRecordDao.kt`

- [ ] T301 [P] [ST-003] 创建学习进度 DAO（路径：`app/src/main/java/com/jacky/verity/data/database/dao/LearningProgressDao.kt`）
  - **依赖**：T105
  - **步骤**：
    - 1) 创建 `LearningProgressDao` 接口
    - 2) 实现 `insertProgress(progress: LearningProgress)` 方法（@Insert onConflict = OnConflictStrategy.REPLACE）
    - 3) 实现 `getProgressByUserId(userId: String): Flow<LearningProgress?>` 方法
    - 4) 实现 `updateProgress(progress: LearningProgress)` 方法（@Update）
  - **验证**：
    - [ ] DAO 方法编译通过
  - **产物**：`LearningProgressDao.kt`

- [ ] T302 [P] [ST-003] 创建学习统计 DAO（路径：`app/src/main/java/com/jacky/verity/data/database/dao/LearningStatisticsDao.kt`）
  - **依赖**：T105
  - **步骤**：
    - 1) 创建 `LearningStatisticsDao` 接口
    - 2) 实现 `insertStatistics(statistics: LearningStatistics)` 方法（@Insert）
    - 3) 实现 `getStatisticsByUserId(userId: String): Flow<List<LearningStatistics>>` 方法
    - 4) 实现 `getStatisticsByDateRange(userId: String, startDate: Long, endDate: Long): Flow<List<LearningStatistics>>` 方法
    - 5) 实现 `getLatestStatistics(userId: String): Flow<LearningStatistics?>` 方法
  - **验证**：
    - [ ] DAO 方法编译通过
    - [ ] SQL 查询正确使用索引
  - **产物**：`LearningStatisticsDao.kt`

- [ ] T303 [ST-003] 在 AppDatabase 中注册所有 DAO（路径：`app/src/main/java/com/jacky/verity/data/database/AppDatabase.kt`）
  - **依赖**：T300、T301、T302
  - **步骤**：
    - 1) 添加 `abstract fun learningRecordDao(): LearningRecordDao`
    - 2) 添加 `abstract fun learningProgressDao(): LearningProgressDao`
    - 3) 添加 `abstract fun learningStatisticsDao(): LearningStatisticsDao`
  - **验证**：
    - [ ] 数据库编译通过
  - **产物**：更新的 `AppDatabase.kt`

- [ ] T304 [ST-003] 创建学习数据 Repository（路径：`app/src/main/java/com/jacky/verity/data/repository/LearningDataRepository.kt`）
  - **依赖**：T303
  - **步骤**：
    - 1) 创建 `LearningDataRepository` 类
    - 2) 实现 `saveLearningRecord(record: LearningRecord): Result<Unit>` 方法
    - 3) 实现 `saveLearningRecords(records: List<LearningRecord>): Result<Unit>` 方法（批量保存，使用事务）
    - 4) 实现 `getLearningRecords(userId: String, startDate: Long?, endDate: Long?): Flow<List<LearningRecord>>` 方法
    - 5) 实现 `updateLearningProgress(progress: LearningProgress): Result<Unit>` 方法
    - 6) 实现 `getLearningProgress(userId: String): Flow<LearningProgress?>` 方法
    - 7) 实现 `saveLearningStatistics(statistics: LearningStatistics): Result<Unit>` 方法
    - 8) 实现 `getLearningStatistics(userId: String, startDate: Long?, endDate: Long?): Flow<List<LearningStatistics>>` 方法
    - 9) 添加错误处理和日志记录
  - **验证**：
    - [ ] Repository 方法能够正确调用 DAO
    - [ ] 批量操作使用事务
    - [ ] 错误处理正确
  - **产物**：`LearningDataRepository.kt`

- [ ] T305 [ST-003] 创建保存学习数据 UseCase（路径：`app/src/main/java/com/jacky/verity/domain/usecase/learning/SaveLearningDataUseCase.kt`）
  - **依赖**：T304
  - **步骤**：
    - 1) 创建 `SaveLearningDataUseCase` 类
    - 2) 实现保存学习记录逻辑
    - 3) 实现更新学习进度逻辑
    - 4) 实现保存学习统计逻辑
    - 5) 使用事务确保数据一致性
  - **验证**：
    - [ ] UseCase 能够正确调用 Repository
    - [ ] 事务使用正确
  - **产物**：`SaveLearningDataUseCase.kt`

- [ ] T306 [ST-003] 创建查询学习数据 UseCase（路径：`app/src/main/java/com/jacky/verity/domain/usecase/learning/QueryLearningDataUseCase.kt`）
  - **依赖**：T304
  - **步骤**：
    - 1) 创建 `QueryLearningDataUseCase` 类
    - 2) 实现查询学习记录逻辑（支持条件查询）
    - 3) 实现查询学习进度逻辑
    - 4) 实现查询学习统计逻辑
  - **验证**：
    - [ ] UseCase 能够正确调用 Repository
  - **产物**：`QueryLearningDataUseCase.kt`

- [ ] T307 [ST-003] 编写学习数据持久化单元测试（路径：`app/src/test/java/com/jacky/verity/data/repository/LearningDataRepositoryTest.kt`）
  - **依赖**：T304
  - **步骤**：
    - 1) 创建测试类（使用内存数据库）
    - 2) 编写测试：保存学习记录成功
    - 3) 编写测试：批量保存学习记录
    - 4) 编写测试：按条件查询学习记录
    - 5) 编写测试：更新学习进度
    - 6) 编写测试：保存和查询学习统计
    - 7) 编写测试：数据一致性（事务测试）
  - **验证**：
    - [ ] 所有测试通过
    - [ ] 测试覆盖 FR-002、FR-003 的所有场景
  - **产物**：`LearningDataRepositoryTest.kt`

- [ ] T308 [ST-003] 编写性能测试（路径：`app/src/androidTest/java/com/jacky/verity/data/repository/LearningDataRepositoryPerformanceTest.kt`）
  - **依赖**：T307
  - **步骤**：
    - 1) 创建性能测试类
    - 2) 编写测试：单表查询性能（p95 ≤100ms，NFR-PERF-001）
    - 3) 编写测试：单条记录插入性能（p95 ≤50ms，NFR-PERF-002）
    - 4) 编写测试：批量插入性能（100 条记录 ≤1 秒，NFR-PERF-001）
    - 5) 编写测试：批量更新性能（50 条记录 p95 ≤500ms，NFR-PERF-002）
  - **验证**：
    - [ ] 性能测试通过（所有指标符合 NFR 要求）
  - **产物**：`LearningDataRepositoryPerformanceTest.kt`

**检查点**：至此，学习数据持久化功能应具备完整功能且可独立测试，性能指标符合要求

---

## 阶段 6：Story ST-004 - 数据备份导出和恢复（类型：Functional）

**目标**：能够导出完整数据备份，能够从备份文件恢复数据，备份恢复成功率 ≥99%

**验证方式（高层）**：备份文件能够成功导出和恢复，数据完整性保证，备份恢复性能符合要求（导出 1000 条记录 ≤5 秒，恢复 ≤10 秒）；使用集成测试和性能测试验证

**覆盖 FR/NFR**：FR-004；FR-005；NFR-PERF-003；NFR-REL-002；NFR-OBS-003

### ST-004 任务

- [ ] T400 [ST-004] 创建数据备份 DAO（路径：`app/src/main/java/com/jacky/verity/data/database/dao/DataBackupDao.kt`）
  - **依赖**：T105
  - **步骤**：
    - 1) 创建 `DataBackupDao` 接口
    - 2) 实现 `insertBackup(backup: DataBackup)` 方法（@Insert）
    - 3) 实现 `getBackups(): Flow<List<DataBackup>>` 方法（按时间排序）
    - 4) 实现 `getBackupById(backupId: String): Flow<DataBackup?>` 方法
    - 5) 实现 `deleteBackup(backupId: String)` 方法（@Query DELETE）
  - **验证**：
    - [ ] DAO 方法编译通过
  - **产物**：`DataBackupDao.kt`

- [ ] T401 [ST-004] 在 AppDatabase 中注册 DataBackupDao（路径：`app/src/main/java/com/jacky/verity/data/database/AppDatabase.kt`）
  - **依赖**：T400
  - **步骤**：
    - 1) 添加 `abstract fun dataBackupDao(): DataBackupDao`
  - **验证**：
    - [ ] 数据库编译通过
  - **产物**：更新的 `AppDatabase.kt`

- [ ] T402 [ST-004] 创建备份数据模型（路径：`app/src/main/java/com/jacky/verity/data/backup/BackupData.kt`）
  - **依赖**：T020
  - **步骤**：
    - 1) 创建 `BackupData` data class（用于 JSON 序列化）
    - 2) 包含所有表的数据：用户账户、学习记录、学习进度、学习统计、数据备份元数据
    - 3) 添加 @Serializable 注解（Kotlinx Serialization）
  - **验证**：
    - [ ] 数据类能够正确序列化为 JSON
    - [ ] 数据类能够正确反序列化
  - **产物**：`BackupData.kt`

- [ ] T403 [ST-004] 创建备份 Repository（路径：`app/src/main/java/com/jacky/verity/data/repository/BackupRepository.kt`）
  - **依赖**：T303、T401、T402、T021
  - **步骤**：
    - 1) 创建 `BackupRepository` 类
    - 2) 实现 `exportBackup(filePath: String, onProgress: (Int) -> Unit): Result<DataBackup>` 方法
      - 查询所有表数据
      - 序列化为 JSON（Kotlinx Serialization）
      - 写入文件
      - 计算文件哈希（SHA-256）
      - 保存备份元数据到数据库
      - 记录进度（onProgress 回调）
      - 记录日志
    - 3) 实现 `importBackup(filePath: String, onProgress: (Int) -> Unit): Result<Unit>` 方法
      - 读取 JSON 文件
      - 验证文件完整性（哈希校验）
      - 解析 JSON 数据
      - 使用事务批量插入数据
      - 验证数据完整性（对比记录数）
      - 记录进度和日志
    - 4) 实现 `validateBackupFile(filePath: String): Result<BackupMetadata>` 方法
    - 5) 添加错误处理（BackupError）
  - **验证**：
    - [ ] Repository 方法能够正确执行
    - [ ] JSON 序列化/反序列化正确
    - [ ] 文件哈希计算正确
    - [ ] 事务使用正确
  - **产物**：`BackupRepository.kt`

- [ ] T404 [ST-004] 创建导出备份 UseCase（路径：`app/src/main/java/com/jacky/verity/domain/usecase/backup/ExportBackupUseCase.kt`）
  - **依赖**：T403
  - **步骤**：
    - 1) 创建 `ExportBackupUseCase` 类
    - 2) 实现导出备份逻辑
    - 3) 处理进度回调
    - 4) 错误处理
  - **验证**：
    - [ ] UseCase 能够正确调用 Repository
  - **产物**：`ExportBackupUseCase.kt`

- [ ] T405 [ST-004] 创建导入备份 UseCase（路径：`app/src/main/java/com/jacky/verity/domain/usecase/backup/ImportBackupUseCase.kt`）
  - **依赖**：T403
  - **步骤**：
    - 1) 创建 `ImportBackupUseCase` 类
    - 2) 实现导入备份逻辑
    - 3) 处理进度回调
    - 4) 错误处理（包括回滚）
  - **验证**：
    - [ ] UseCase 能够正确调用 Repository
  - **产物**：`ImportBackupUseCase.kt`

- [ ] T406 [ST-004] 编写备份导出和恢复集成测试（路径：`app/src/androidTest/java/com/jacky/verity/data/repository/BackupRepositoryTest.kt`）
  - **依赖**：T403
  - **步骤**：
    - 1) 创建测试类（使用真实文件系统）
    - 2) 编写测试：导出备份成功
    - 3) 编写测试：备份文件格式正确
    - 4) 编写测试：备份文件完整性校验
    - 5) 编写测试：导入备份成功
    - 6) 编写测试：导入后数据完整性
    - 7) 编写测试：导入失败回滚
    - 8) 编写测试：文件格式错误处理
  - **验证**：
    - [ ] 所有测试通过
    - [ ] 测试覆盖 FR-004、FR-005 的所有场景
    - [ ] 备份恢复成功率 ≥99%（NFR-REL-002）
  - **产物**：`BackupRepositoryTest.kt`

- [ ] T407 [ST-004] 编写备份性能测试（路径：`app/src/androidTest/java/com/jacky/verity/data/repository/BackupRepositoryPerformanceTest.kt`）
  - **依赖**：T406
  - **步骤**：
    - 1) 创建性能测试类
    - 2) 准备测试数据（1000 条学习记录）
    - 3) 编写测试：导出备份性能（≤5 秒，NFR-PERF-003）
    - 4) 编写测试：导入备份性能（≤10 秒，NFR-PERF-003）
  - **验证**：
    - [ ] 性能测试通过（所有指标符合 NFR 要求）
  - **产物**：`BackupRepositoryPerformanceTest.kt`

**检查点**：至此，数据备份导出和恢复功能应具备完整功能且可独立测试，性能指标符合要求

---

## 阶段 7：Story ST-005 - 错误处理和可观测性（类型：Infrastructure）

**目标**：所有数据库操作错误能够正确处理和记录，关键事件能够记录日志

**验证方式（高层）**：错误能够正确处理和记录，关键事件能够记录日志，日志格式统一；使用单元测试验证错误处理逻辑

**覆盖 FR/NFR**：FR-008；NFR-OBS-001；NFR-OBS-002；NFR-OBS-003

### ST-005 任务

- [ ] T500 [ST-005] 增强 Repository 错误处理（路径：`app/src/main/java/com/jacky/verity/data/repository/UserAccountRepository.kt`、`LearningDataRepository.kt`、`BackupRepository.kt`）
  - **依赖**：T202、T304、T403
  - **步骤**：
    - 1) 在所有 Repository 方法中添加 try-catch 错误处理
    - 2) 捕获 SQLiteException 并转换为 DatabaseError
    - 3) 捕获 IOException（备份操作）并转换为 BackupError
    - 4) 记录错误日志（错误类型、SQL 语句、错误详情、堆栈信息）
    - 5) 返回 Result 封装错误信息
  - **验证**：
    - [ ] 错误处理覆盖所有数据库操作
    - [ ] 错误日志格式统一（NFR-OBS-002）
    - [ ] 错误信息包含解决建议（FR-008）
  - **产物**：更新的 Repository 文件

- [ ] T501 [ST-005] 增强数据库操作事件日志记录（路径：`app/src/main/java/com/jacky/verity/data/repository/LearningDataRepository.kt`）
  - **依赖**：T304、T021
  - **步骤**：
    - 1) 在数据操作前后记录日志（操作类型、表名、记录数）
    - 2) 记录操作耗时
    - 3) 记录成功/失败状态
    - 4) 确保敏感信息脱敏（不记录学习数据内容）
  - **验证**：
    - [ ] 日志记录覆盖所有关键操作（NFR-OBS-001）
    - [ ] 日志格式统一
    - [ ] 敏感信息已脱敏
  - **产物**：更新的 Repository 文件

- [ ] T502 [ST-005] 增强数据库版本升级事件日志记录（路径：`app/src/main/java/com/jacky/verity/data/manager/DatabaseManager.kt`）
  - **依赖**：T106、T021
  - **步骤**：
    - 1) 在数据库迁移时记录日志（旧版本、新版本、迁移结果）
    - 2) 记录迁移耗时
    - 3) 记录迁移失败原因（如有）
  - **验证**：
    - [ ] 日志记录覆盖版本升级事件（NFR-OBS-001）
  - **产物**：更新的 `DatabaseManager.kt`

- [ ] T503 [ST-005] 增强备份恢复事件日志记录（路径：`app/src/main/java/com/jacky/verity/data/repository/BackupRepository.kt`）
  - **依赖**：T403、T021
  - **步骤**：
    - 1) 在备份导出/恢复时记录日志（文件大小、记录数、耗时、成功/失败）
    - 2) 记录数据恢复前后的数据量对比
  - **验证**：
    - [ ] 日志记录覆盖备份恢复事件（NFR-OBS-003）
  - **产物**：更新的 `BackupRepository.kt`

- [ ] T504 [ST-005] 编写错误处理单元测试（路径：`app/src/test/java/com/jacky/verity/data/repository/ErrorHandlingTest.kt`）
  - **依赖**：T500
  - **步骤**：
    - 1) 创建测试类
    - 2) 编写测试：数据库操作失败错误处理
    - 3) 编写测试：错误日志记录
    - 4) 编写测试：错误信息格式
  - **验证**：
    - [ ] 所有测试通过
    - [ ] 测试覆盖 FR-008 的所有场景
  - **产物**：`ErrorHandlingTest.kt`

**检查点**：至此，错误处理和可观测性功能应具备完整功能且可独立测试

---

## 阶段 8：Story ST-006 - 存储空间管理和优化（类型：Optimization）

**目标**：存储空间不足时能够检测和提示，数据库性能优化，内存占用符合要求

**验证方式（高层）**：存储空间能够检测，数据库性能符合要求，内存占用符合要求（峰值 ≤25MB），功耗符合要求（每日增量 ≤10mAh）；使用性能测试和内存分析验证

**覆盖 FR/NFR**：NFR-PERF-001；NFR-PERF-002；NFR-MEM-001；NFR-MEM-002；NFR-POWER-001

### ST-006 任务

- [ ] T600 [ST-006] 实现存储空间检测工具（路径：`app/src/main/java/com/jacky/verity/data/util/StorageUtils.kt`）
  - **依赖**：T020
  - **步骤**：
    - 1) 创建 `StorageUtils` 工具类
    - 2) 实现 `checkAvailableSpace(context: Context): Long` 方法（检查可用存储空间）
    - 3) 实现 `isStorageSpaceSufficient(context: Context, requiredBytes: Long): Boolean` 方法
    - 4) 在数据库写入和备份操作前调用检测
  - **验证**：
    - [ ] 存储空间检测准确
    - [ ] 检测结果能够正确用于阻止操作
  - **产物**：`StorageUtils.kt`

- [ ] T601 [ST-006] 优化数据库查询性能（路径：`app/src/main/java/com/jacky/verity/data/database/dao/LearningRecordDao.kt`、`LearningStatisticsDao.kt`）
  - **依赖**：T300、T302
  - **步骤**：
    - 1) 检查所有查询是否使用索引
    - 2) 优化复杂查询（避免全表扫描）
    - 3) 添加缺失的索引（如需要）
    - 4) 使用 LIMIT 限制大查询结果
  - **验证**：
    - [ ] 查询性能测试通过（单表查询 p95 ≤100ms，NFR-PERF-001）
    - [ ] 多表关联查询 p95 ≤500ms（NFR-PERF-001）
  - **产物**：更新的 DAO 文件

- [ ] T602 [ST-006] 优化数据库批量操作性能（路径：`app/src/main/java/com/jacky/verity/data/repository/LearningDataRepository.kt`）
  - **依赖**：T304
  - **步骤**：
    - 1) 确保批量插入使用事务（@Transaction）
    - 2) 批量操作分批处理（每批 100 条）
    - 3) 优化批量更新逻辑
  - **验证**：
    - [ ] 批量插入性能测试通过（100 条记录 ≤1 秒，NFR-PERF-001）
    - [ ] 批量更新性能测试通过（50 条记录 p95 ≤500ms，NFR-PERF-002）
  - **产物**：更新的 Repository 文件

- [ ] T603 [ST-006] 优化内存使用（路径：`app/src/main/java/com/jacky/verity/data/repository/LearningDataRepository.kt`）
  - **依赖**：T304
  - **步骤**：
    - 1) 确保查询结果使用 Flow，避免一次性加载大量数据
    - 2) 及时释放查询结果（Flow 自动管理）
    - 3) 批量操作完成后释放临时内存
    - 4) 在应用退出时关闭数据库连接（DatabaseManager）
  - **验证**：
    - [ ] 内存分析显示峰值 ≤25MB（NFR-MEM-001、NFR-MEM-002）
    - [ ] 连接池内存占用 ≤5MB（NFR-MEM-001）
    - [ ] 查询结果缓存 ≤20MB（NFR-MEM-001）
  - **产物**：更新的 Repository 和 DatabaseManager 文件

- [ ] T604 [ST-006] 编写性能优化验证测试（路径：`app/src/androidTest/java/com/jacky/verity/data/repository/PerformanceOptimizationTest.kt`）
  - **依赖**：T601、T602、T603
  - **步骤**：
    - 1) 创建性能测试类
    - 2) 编写测试：查询性能（p50/p95/p99）
    - 3) 编写测试：写入性能（p50/p95/p99）
    - 4) 编写测试：内存占用（峰值、平均）
    - 5) 使用 Android Profiler 进行内存分析
  - **验证**：
    - [ ] 所有性能指标符合 NFR 要求
    - [ ] 内存占用符合要求（峰值 ≤25MB）
  - **产物**：`PerformanceOptimizationTest.kt`

**检查点**：至此，存储空间管理和优化功能应具备完整功能且可独立测试，所有性能指标符合要求

---

## 依赖关系与执行顺序

### 阶段依赖

- **环境搭建（阶段 1）**：无依赖——可立即启动
- **核心基础（阶段 2）**：依赖环境搭建完成——阻塞所有 Story
- **Story ST-001（阶段 3）**：依赖核心基础完成——阻塞其他 Story
- **Story ST-002（阶段 4）**：依赖 ST-001 完成
- **Story ST-003（阶段 5）**：依赖 ST-001、ST-002 完成
- **Story ST-004（阶段 6）**：依赖 ST-001、ST-003 完成
- **Story ST-005（阶段 7）**：依赖所有其他 Story（可在其他 Story 实现过程中并行开发错误处理框架）
- **Story ST-006（阶段 8）**：依赖 ST-001、ST-003 完成（可在数据持久化实现后优化）

### Story 依赖

- **ST-001**：依赖阶段 2 完成
- **ST-002**：依赖 ST-001 完成
- **ST-003**：依赖 ST-001、ST-002 完成
- **ST-004**：依赖 ST-001、ST-003 完成
- **ST-005**：依赖所有其他 Story（可并行开发）
- **ST-006**：依赖 ST-001、ST-003 完成（可在实现后优化）

### 单 Story 内部顺序

- 实体类开发先于 DAO 开发
- DAO 开发先于 Repository 开发
- Repository 开发先于 UseCase 开发
- 实现任务先于测试任务（如要求 TDD，则测试先于实现）
- 单元测试先于集成测试
- 功能测试先于性能测试

### 并行执行场景

- 所有标记 [P] 的环境搭建任务可并行（T012）
- 所有标记 [P] 的核心基础任务可并行（T020、T021）
- ST-001 中实体类创建任务可并行（T100、T101、T102、T103、T104）
- ST-003 中 DAO 创建任务可并行（T300、T301、T302）
- ST-005 可在其他 Story 实现过程中并行开发（T500-T504）
- ST-006 可在 ST-003 完成后并行优化（T600-T604）
- 不同团队成员可并行开发不同 Story（在满足依赖关系的前提下）

---

## 并行示例：Story ST-001

```bash
# 批量启动 ST-001 的可并行任务：
任务："T100 [P] [ST-001] 创建数据库实体类 UserAccount"
任务："T101 [P] [ST-001] 创建数据库实体类 LearningRecord"
任务："T102 [P] [ST-001] 创建数据库实体类 LearningProgress"
任务："T103 [P] [ST-001] 创建数据库实体类 LearningStatistics"
任务："T104 [P] [ST-001] 创建数据库实体类 DataBackup"
```

---

## 落地策略

### 先完成 MVP（优先完成关键 Story 集合）

1. 完成阶段 0：准备
2. 完成阶段 1：环境搭建
3. 完成阶段 2：核心基础（关键——阻塞所有 Story）
4. 完成阶段 3：Story ST-001（数据库初始化）——**MVP 核心基础设施**
5. **暂停并验证**：独立验证 ST-001
6. 如就绪，可开始其他 Story 的开发

### 增量交付

1. 完成环境搭建 + 核心基础 → 基础层就绪
2. 新增 ST-001 → 独立验证 → 数据库基础设施就绪
3. 新增 ST-002 → 独立验证 → 用户账户管理可用
4. 新增 ST-003 → 独立验证 → 学习数据持久化可用
5. 新增 ST-004 → 独立验证 → 数据备份恢复可用
6. 新增 ST-005 → 完善错误处理和可观测性
7. 新增 ST-006 → 性能优化和存储管理
8. 每个 Story 均需在不破坏已有 Story 的前提下新增价值

### 团队并行策略

多开发者协作场景：

1. 团队共同完成阶段 0-2（准备、环境搭建、核心基础）
2. 核心基础完成后：
   - 开发者 A：负责 ST-001（数据库初始化）
   - 开发者 B：准备 ST-002、ST-003 的设计
   - 开发者 C：准备 ST-005 的错误处理框架（可并行）
3. ST-001 完成后：
   - 开发者 A：负责 ST-002（用户账户管理）
   - 开发者 B：负责 ST-003（学习数据持久化）
   - 开发者 C：继续 ST-005（错误处理和可观测性）
4. ST-002、ST-003 完成后：
   - 开发者 A：负责 ST-004（数据备份恢复）
   - 开发者 B：负责 ST-006（性能优化）
   - 开发者 C：完善 ST-005

---

## 任务汇总

**任务总数**：61 个任务

**各 Story 对应的任务数量**：
- ST-001（数据库初始化和版本管理）：9 个任务（T100-T108）
- ST-002（用户账户管理）：5 个任务（T200-T204）
- ST-003（学习数据持久化）：9 个任务（T300-T308）
- ST-004（数据备份导出和恢复）：8 个任务（T400-T407）
- ST-005（错误处理和可观测性）：5 个任务（T500-T504）
- ST-006（存储空间管理和优化）：5 个任务（T600-T604）

**环境搭建和核心基础**：15 个任务（T001、T010-T012、T020-T021）

**识别出的可并行执行机会**：
- 阶段 1：T012 可并行
- 阶段 2：T020、T021 可并行
- ST-001：T100-T104 可并行（5 个实体类创建）
- ST-003：T300-T302 可并行（3 个 DAO 创建）
- ST-005：可在其他 Story 实现过程中并行开发
- ST-006：可在 ST-003 完成后并行优化

**每个 Story 的验证方式摘要（含指标阈值）**：
- **ST-001**：单元测试验证初始化逻辑；初始化时间 <100ms（NFR-PERF-001）
- **ST-002**：单元测试验证账户管理；用户 ID 唯一性验证
- **ST-003**：单元测试、集成测试、性能测试；单表查询 p95 ≤100ms、批量插入 ≤1 秒（NFR-PERF-001、NFR-PERF-002）
- **ST-004**：集成测试、性能测试；导出 1000 条记录 ≤5 秒、恢复 ≤10 秒、成功率 ≥99%（NFR-PERF-003、NFR-REL-002）
- **ST-005**：单元测试验证错误处理；日志格式统一验证
- **ST-006**：性能测试、内存分析；内存峰值 ≤25MB、每日功耗增量 ≤10mAh（NFR-MEM-001、NFR-MEM-002、NFR-POWER-001）

**建议的 MVP 范围**：
- 阶段 0-2：准备、环境搭建、核心基础
- ST-001：数据库初始化和版本管理（**MVP 核心基础设施**）

---

## 备注

- [P] 标记的任务 = 涉及不同文件，无依赖关系
- [ST-xxx] 标签将任务关联至 Plan 的 Story，便于追溯
- 每个 Story 需可独立完成、独立验证
- 实现前可编写测试用例（如要求 TDD）
- 完成单个任务或逻辑分组后提交代码
- 可在任意检查点暂停，独立验证对应 Story
- 避免：模糊的任务描述、同一文件冲突、破坏独立性的跨 Story 依赖
- 所有任务必须遵循 Plan 的技术决策，不得擅自改写
- 性能指标必须使用 Android Profiler 或性能测试工具验证
- 内存占用必须使用 Android Profiler 或 LeakCanary 验证
