# Tasks：学习界面与交互

**Epic**：EPIC-001 - 无痛记忆单词神器APP  
**Feature ID**：FEAT-003  
**Feature Version**：v0.1.0（来自 `spec.md`）  
**Plan Version**：v0.2.0（来自 `plan.md`）  
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

- **项目结构**：`app/src/main/java/com/jacky/verity/feature/learning/`
  - `ui/`：Compose screens
  - `vm/`：ViewModel + UiState
  - `domain/`：UseCases
  - `data/`：Repositories adapters（接口 + 实现）

---

## 阶段 0：准备（可选但建议）

**目标**：对齐版本、冻结设计输入，避免 Implement 期返工

- [ ] T001 在 `specs/epics/EPIC-001-word-memory-app/features/FEAT-003-learning-ui/` 中核对 `spec.md`、`plan.md` 的 Version 字段一致性并补齐变更记录
  - **依赖**：无
  - **步骤**：
    - 1) 确认 `Feature Version` 为 v0.1.0（spec.md）
    - 2) 确认 `Plan Version` 为 v0.2.0（plan.md）
    - 3) 确认 Plan 的 Story Breakdown 已完成（ST-001 至 ST-008）
  - **验证**：
    - [ ] tasks.md 中 `Plan Version` 与 plan.md 一致（v0.2.0）
  - **产物**：`spec.md`、`plan.md`、`tasks.md`

---

## 阶段 1：环境搭建（共享基础设施）

**目标**：项目初始化与基础结构搭建

- [ ] T010 按照 plan.md 的"结构决策"创建项目目录结构（路径：`app/src/main/java/com/jacky/verity/feature/learning/`）
  - **依赖**：T001
  - **设计引用**：`plan.md:B7. 源代码结构`
  - **步骤**：
    - 1) 创建 `ui/` 目录（Compose screens）
    - 2) 创建 `vm/` 目录（ViewModel + UiState）
    - 3) 创建 `domain/` 目录（UseCases）
    - 4) 创建 `data/` 目录（Repositories adapters）
  - **验证**：
    - [ ] 目录结构与 plan.md:B7 一致
  - **产物**：`app/src/main/java/com/jacky/verity/feature/learning/ui/`、`vm/`、`domain/`、`data/`

- [ ] T011 初始化构建与依赖（路径：`app/build.gradle.kts`）
  - **依赖**：T010
  - **设计引用**：`plan.md:B1. 技术背景`
  - **步骤**：
    - 1) 添加 Jetpack Compose 依赖（若未添加）
    - 2) 添加 AndroidX Lifecycle/ViewModel 依赖
    - 3) 添加 Kotlin Coroutines 依赖
    - 4) 添加 Navigation Compose 依赖（若采用）
    - 5) 添加 Coil Compose 依赖（图片加载，plan.md A1 决策）
  - **验证**：
    - [ ] `./gradlew build` 可通过（本地构建命令）
  - **产物**：`app/build.gradle.kts`

- [ ] T012 [P] 配置代码检查与格式化工具（路径：`.editorconfig`、`detekt.yml` 等）
  - **依赖**：T011
  - **步骤**：
    - 1) 配置 Kotlin 代码风格（4 空格缩进等）
    - 2) 配置 lint 规则（如适用）
  - **验证**：
    - [ ] lint/format 命令可运行
  - **产物**：配置文件

---

## 阶段 2：核心基础（阻塞性前置条件，阻塞所有 Story）

**目标**：所有用户故事实现前必须完成的核心基础设施搭建

**⚠️ 关键**：此阶段完成前，任何用户故事相关工作均不可启动

- [ ] T020 搭建公共基础设施：定义 Result 类型与错误封装（路径：`app/src/main/java/com/jacky/verity/feature/learning/data/common/Result.kt`）
  - **依赖**：T012
  - **设计引用**：`plan.md:A3.3 模块协作与通信方式`、`plan.md:A3.4:UseCase:UML类图`
  - **步骤**：
    - 1) 定义 `sealed class Result<T>`
    - 2) 定义 `data class Success<T>` 和 `sealed class Failure`
    - 3) 定义 `RetryableFailure` 和 `NonRetryableFailure`（plan.md A3.4:UseCase）
  - **验证**：
    - [ ] 单元测试：Result 类型可正确封装成功/失败状态
    - [ ] 与 Plan-B:B2 错误处理规范一致
  - **产物**：`app/src/main/java/com/jacky/verity/feature/learning/data/common/Result.kt`

- [ ] T021 [P] 搭建公共基础设施：定义核心数据模型（路径：`app/src/main/java/com/jacky/verity/feature/learning/data/model/`）
  - **依赖**：T020
  - **设计引用**：`plan.md:A3.4:ViewModel:UML类图`、`spec.md:核心实体`
  - **步骤**：
    - 1) 定义 `SessionType`（学习/复习）enum
    - 2) 定义 `UserRating`（认识/不认识/跳过）enum
    - 3) 定义 `StudyTask` data class（wordId、taskId、taskKind）
    - 4) 定义 `WordCardModel` data class（wordId、word、phonetic、definition、examples、imageRef、hasPronunciation）
  - **验证**：
    - [ ] 数据模型与 spec.md:核心实体 和 plan.md 定义一致
  - **产物**：`app/src/main/java/com/jacky/verity/feature/learning/data/model/StudyTask.kt`、`WordCardModel.kt`、`SessionType.kt`、`UserRating.kt`

- [ ] T022 [P] 搭建接口桩：定义 Repository 接口（路径：`app/src/main/java/com/jacky/verity/feature/learning/data/repository/`）
  - **依赖**：T021
  - **设计引用**：`plan.md:A3.4:StudyTaskRepository:UML类图`、`plan.md:A3.4:WordRepository:UML类图`、`plan.md:A3.4:MediaRepository:UML类图`
  - **步骤**：
    - 1) 定义 `StudyTaskRepository` 接口（startSession、getCurrentTask、submitRating）
    - 2) 定义 `WordRepository` 接口（getWordCard）
    - 3) 定义 `MediaRepository` 接口（hasPronunciation、playPronunciation）
    - 4) 创建接口桩实现（FakeStudyTaskRepository、FakeWordRepository、FakeMediaRepository）用于测试
  - **验证**：
    - [ ] 接口签名与 plan.md A3.4 模块设计一致
    - [ ] 接口桩可编译通过
  - **产物**：`app/src/main/java/com/jacky/verity/feature/learning/data/repository/StudyTaskRepository.kt`、`WordRepository.kt`、`MediaRepository.kt` 及对应 Fake 实现

**检查点**：基础层就绪——用户故事实现可并行启动

---

## 阶段 3：Story ST-001 - 学习入口与导航骨架（类型：Design-Enabler）

**目标**：建立学习入口页/会话页/完成页的导航与路由，提供开始学习/复习入口与返回路径

**验证方式（高层）**：手工走通导航；UI 测试验证 back stack 与退出确认

**覆盖 FR/NFR**：FR-001、FR-007、FR-008

### ST-001 任务

- [ ] T100 [P] [ST-001] 创建 Navigation Compose 路由定义（路径：`app/src/main/java/com/jacky/verity/feature/learning/ui/navigation/LearningNavGraph.kt`）
  - **依赖**：T022
  - **设计引用**：`plan.md:A1. 技术选型`（导航实现决策：Navigation Compose）
  - **步骤**：
    - 1) 定义路由：`learning_entry`、`learning_session`、`learning_done`
    - 2) 创建 NavGraph，连接三个路由
    - 3) 配置参数传递（sessionType 等）
  - **验证**：
    - [ ] 导航图可编译通过
    - [ ] 可在三个路由间切换
  - **产物**：`app/src/main/java/com/jacky/verity/feature/learning/ui/navigation/LearningNavGraph.kt`

- [ ] T101 [ST-001] 创建学习入口页 UI（路径：`app/src/main/java/com/jacky/verity/feature/learning/ui/entry/LearningEntryScreen.kt`）
  - **依赖**：T100
  - **设计引用**：`plan.md:A3.4:UI:UML类图`
  - **步骤**：
    - 1) 创建 `LearningEntryScreen` Composable
    - 2) 添加"开始学习"按钮（导航到 `learning_session`，传递 sessionType=LEARNING）
    - 3) 添加"开始复习"按钮（导航到 `learning_session`，传递 sessionType=REVIEW）
    - 4) 实现基本 UI 布局与样式
  - **验证**：
    - [ ] 手工验证：点击按钮可导航到会话页
    - [ ] UI 测试：验证按钮可点击并触发导航
  - **产物**：`app/src/main/java/com/jacky/verity/feature/learning/ui/entry/LearningEntryScreen.kt`

- [ ] T102 [ST-001] 创建学习会话页 UI 骨架（路径：`app/src/main/java/com/jacky/verity/feature/learning/ui/session/LearningSessionScreen.kt`）
  - **依赖**：T101
  - **设计引用**：`plan.md:A3.4:UI:UML类图`
  - **步骤**：
    - 1) 创建 `LearningSessionScreen` Composable（暂时为空实现或占位内容）
    - 2) 在 Navigation 中注册该路由
  - **验证**：
    - [ ] 从入口页可导航到会话页
    - [ ] 可正常返回（back stack 正确）
  - **产物**：`app/src/main/java/com/jacky/verity/feature/learning/ui/session/LearningSessionScreen.kt`

- [ ] T103 [ST-001] 创建完成页 UI（路径：`app/src/main/java/com/jacky/verity/feature/learning/ui/done/LearningDoneScreen.kt`）
  - **依赖**：T102
  - **设计引用**：`plan.md:A3.4:UI:UML类图`、`spec.md:FR-007`
  - **步骤**：
    - 1) 创建 `LearningDoneScreen` Composable
    - 2) 展示完成信息（本轮完成数、可选：用时）
    - 3) 添加"返回"按钮（导航回入口页）
    - 4) 添加"再学一组"按钮（可选，重新开始会话）
  - **验证**：
    - [ ] 手工验证：完成页可正常展示
    - [ ] 点击返回可回到入口页
    - [ ] UI 测试：验证按钮可点击
  - **产物**：`app/src/main/java/com/jacky/verity/feature/learning/ui/done/LearningDoneScreen.kt`

- [ ] T104 [ST-001] 实现返回确认对话框（路径：`app/src/main/java/com/jacky/verity/feature/learning/ui/session/LearningSessionScreen.kt`）
  - **依赖**：T102
  - **设计引用**：`plan.md:A3.4:ViewModel:UML类图`、`spec.md:FR-008`
  - **步骤**：
    - 1) 在 `LearningSessionScreen` 中处理返回事件
    - 2) 显示退出确认对话框
    - 3) 用户选择"继续学习"或"退出"
    - 4) "退出"时保存进度并返回上一页
  - **验证**：
    - [ ] 手工验证：在学习会话中按返回键，弹出确认对话框
    - [ ] 选择"继续学习"：留在当前页
    - [ ] 选择"退出"：返回入口页
    - [ ] UI 测试：验证对话框显示与按钮行为
  - **产物**：`app/src/main/java/com/jacky/verity/feature/learning/ui/session/LearningSessionScreen.kt`

**检查点**：至此，用户故事 1 应具备完整导航功能且可独立测试

---

## 阶段 4：Story ST-002 - 卡片展示与答案显示（基础交互）（类型：Functional）

**目标**：实现会话页卡片 UI，默认隐藏答案，支持显示答案/翻转

**验证方式（高层）**：UI 测试：进入后默认隐藏；点击后显示

**覆盖 FR/NFR**：FR-002

### ST-002 任务

- [ ] T200 [ST-002] 创建 LearningSessionViewModel 骨架（路径：`app/src/main/java/com/jacky/verity/feature/learning/vm/LearningSessionViewModel.kt`）
  - **依赖**：T022（Repository 接口）
  - **设计引用**：`plan.md:A3.4:ViewModel:UML类图`、`plan.md:A3.4:ViewModel:时序-成功`
  - **步骤**：
    - 1) 创建 `LearningSessionViewModel` 类（继承 `ViewModel`）
    - 2) 定义 `LearningUiState` sealed class（Loading、Content、Error、Empty、Done）
    - 3) 定义 `StateFlow<LearningUiState> uiState`
    - 4) 实现基本事件处理函数骨架（onRevealAnswer、onRate 等，暂时为空实现）
  - **验证**：
    - [ ] ViewModel 可编译通过
    - [ ] 可创建 ViewModel 实例
  - **产物**：`app/src/main/java/com/jacky/verity/feature/learning/vm/LearningSessionViewModel.kt`、`LearningUiState.kt`

- [ ] T201 [ST-002] 实现显示答案状态管理（路径：`app/src/main/java/com/jacky/verity/feature/learning/vm/LearningSessionViewModel.kt`）
  - **依赖**：T200
  - **设计引用**：`plan.md:A3.4:ViewModel:UML类图`（isAnswerRevealed 状态）、`plan.md:A3.4:ViewModel:时序-成功`
  - **步骤**：
    - 1) 在 `UiStateContent` 中添加 `isAnswerRevealed: Boolean` 字段
    - 2) 实现 `onRevealAnswer()` 函数：更新 `isAnswerRevealed = true`
    - 3) 初始化状态时 `isAnswerRevealed = false`（默认隐藏答案）
  - **验证**：
    - [ ] 单元测试：初始状态 `isAnswerRevealed = false`
    - [ ] 单元测试：调用 `onRevealAnswer()` 后 `isAnswerRevealed = true`
  - **产物**：`app/src/main/java/com/jacky/verity/feature/learning/vm/LearningSessionViewModel.kt`

- [ ] T202 [ST-002] 创建单词卡片 UI 组件（路径：`app/src/main/java/com/jacky/verity/feature/learning/ui/session/CardComposable.kt`）
  - **依赖**：T201
  - **设计引用**：`plan.md:A3.4:UI:UML类图`、`plan.md:A3.4:UI:时序-成功`
  - **步骤**：
    - 1) 创建 `CardComposable` Composable 函数
    - 2) 显示单词（word）、音标（phonetic）
    - 3) 根据 `isAnswerRevealed` 状态条件显示释义（definition）
    - 4) 添加"显示答案"按钮（当答案隐藏时）
    - 5) 实现基本 UI 布局与样式（卡片式设计）
  - **验证**：
    - [ ] UI 测试：进入会话页，卡片默认隐藏答案
    - [ ] UI 测试：点击"显示答案"按钮，答案区域显示
    - [ ] 手工验证：UI 布局美观，符合设计规范
  - **产物**：`app/src/main/java/com/jacky/verity/feature/learning/ui/session/CardComposable.kt`

- [ ] T203 [ST-002] 集成 ViewModel 与 UI（路径：`app/src/main/java/com/jacky/verity/feature/learning/ui/session/LearningSessionScreen.kt`）
  - **依赖**：T202
  - **设计引用**：`plan.md:A3.4:UI:时序-成功`
  - **步骤**：
    - 1) 在 `LearningSessionScreen` 中创建 `LearningSessionViewModel` 实例
    - 2) 使用 `collectAsStateWithLifecycle` 观察 `uiState`
    - 3) 根据 `uiState` 显示对应 UI（Loading、Content、Error、Empty）
    - 4) 在 Content 状态下显示 `CardComposable`，传递 `isAnswerRevealed` 状态
    - 5) 连接"显示答案"按钮点击事件到 `viewModel.onRevealAnswer()`
  - **验证**：
    - [ ] UI 测试：完整流程：进入会话页 → 看到卡片（答案隐藏）→ 点击显示答案 → 答案显示
    - [ ] 手工验证：状态更新流畅，无卡顿
  - **产物**：`app/src/main/java/com/jacky/verity/feature/learning/ui/session/LearningSessionScreen.kt`

- [ ] T204 [ST-002] 实现扩展信息展示区域占位（路径：`app/src/main/java/com/jacky/verity/feature/learning/ui/session/CardComposable.kt`）
  - **依赖**：T203
  - **设计引用**：`plan.md:A3.4:UI:UML类图`、`spec.md:FR-010`
  - **步骤**：
    - 1) 在答案显示区域添加例句（examples）展示区域（当有数据时）
    - 2) 添加图片展示占位区域（当有 imageRef 时，暂时显示占位符）
    - 3) 当数据缺失时不显示占位内容（符合 FR-010）
  - **验证**：
    - [ ] UI 测试：有扩展信息时显示，无扩展信息时不显示占位
    - [ ] 手工验证：布局合理，不占用过多空间
  - **产物**：`app/src/main/java/com/jacky/verity/feature/learning/ui/session/CardComposable.kt`

**检查点**：至此，用户故事 2 应具备完整卡片展示功能且可独立测试

---

## 阶段 5：Story ST-003 - 提交反馈管线（按钮 + 防重复 + 失败重试）（类型：Functional）

**目标**：提交一致性与可恢复，严格满足 FR-006

**验证方式（高层）**：模拟失败/超时；验证不跳题且可重试；验证进度更新

**覆盖 FR/NFR**：FR-003、FR-004、FR-006、NFR-REL-001

### ST-003 任务

- [ ] T300 [ST-003] 实现 StartSessionUseCase（路径：`app/src/main/java/com/jacky/verity/feature/learning/domain/StartSessionUseCase.kt`）
  - **依赖**：T022（Repository 接口）
  - **设计引用**：`plan.md:A3.4:UseCase:UML类图`、`plan.md:A3.4:UseCase:时序-成功`
  - **步骤**：
    - 1) 创建 `StartSessionUseCase` 类
    - 2) 实现 `invoke(type: SessionType, limit: Int): Result<SessionData>`
    - 3) 调用 `StudyTaskRepository.startSession()` 获取任务列表
    - 4) 调用 `StudyTaskRepository.getCurrentTask()` 获取当前任务
    - 5) 调用 `WordRepository.getWordCard()` 获取卡片数据
    - 6) 封装错误为 `RetryableFailure` 或 `NonRetryableFailure`（plan.md A3.4:UseCase）
  - **验证**：
    - [ ] 单元测试：成功场景返回 `Result.success(SessionData)`
    - [ ] 单元测试：失败场景返回正确的 `Failure` 类型
  - **产物**：`app/src/main/java/com/jacky/verity/feature/learning/domain/StartSessionUseCase.kt`

- [ ] T301 [ST-003] 实现 SubmitRatingUseCase（路径：`app/src/main/java/com/jacky/verity/feature/learning/domain/SubmitRatingUseCase.kt`）
  - **依赖**：T300
  - **设计引用**：`plan.md:A3.4:UseCase:UML类图`、`plan.md:A3.4:UseCase:时序-异常`
  - **步骤**：
    - 1) 创建 `SubmitRatingUseCase` 类
    - 2) 实现 `invoke(sessionId: String, taskId: String, rating: UserRating): Result<StudyTask?>`
    - 3) 调用 `StudyTaskRepository.submitRating()` 提交反馈
    - 4) 处理超时错误（封装为 `RetryableFailure`）
    - 5) 处理数据错误（封装为 `NonRetryableFailure`）
  - **验证**：
    - [ ] 单元测试：成功场景返回下一题或 `null`（完成）
    - [ ] 单元测试：超时错误返回 `RetryableFailure`
    - [ ] 单元测试：数据错误返回 `NonRetryableFailure`
  - **产物**：`app/src/main/java/com/jacky/verity/feature/learning/domain/SubmitRatingUseCase.kt`

- [ ] T302 [ST-003] 实现 StudyTaskRepository 并发保护（路径：`app/src/main/java/com/jacky/verity/feature/learning/data/repository/StudyTaskRepositoryImpl.kt`）
  - **依赖**：T301
  - **设计引用**：`plan.md:A3.4:StudyTaskRepository:UML类图`、`plan.md:A3.4:StudyTaskRepository:时序-异常`、`plan.md:A3.4:StudyTaskRepository:异常清单`
  - **步骤**：
    - 1) 创建 `StudyTaskRepositoryImpl` 实现类
    - 2) 添加 `pendingSubmits: MutableMap<String, Job>` 用于去重
    - 3) 实现 `checkAndLockTask(taskId: String): Boolean` 检查并锁定任务
    - 4) 在 `submitRating()` 中检查重复提交（EX-REPO-001）
    - 5) 实现超时处理（3s，EX-REPO-002）
    - 6) 实现错误分类（可重试/不可重试）
  - **验证**：
    - [ ] 单元测试：重复提交返回 `DuplicateSubmitError`
    - [ ] 单元测试：超时返回 `RetryableError`
    - [ ] 集成测试：并发提交同一 taskId 时只有一次成功
  - **产物**：`app/src/main/java/com/jacky/verity/feature/learning/data/repository/StudyTaskRepositoryImpl.kt`

- [ ] T303 [ST-003] 实现 ViewModel 并发保护与状态管理（路径：`app/src/main/java/com/jacky/verity/feature/learning/vm/LearningSessionViewModel.kt`）
  - **依赖**：T302
  - **设计引用**：`plan.md:A3.4:ViewModel:UML类图`、`plan.md:A3.4:ViewModel:时序-异常`、`plan.md:A3.4:ViewModel:异常清单`
  - **步骤**：
    - 1) 添加 `submitMutex: Mutex` 用于并发保护
    - 2) 实现 `onRate(rating: UserRating)`：使用 Mutex 保护提交过程（EX-VM-001）
    - 3) 更新 `submitState`（Idle → Loading → Success/Failed）
    - 4) 处理提交失败：停留当前题，显示错误状态（EX-VM-002、EX-VM-003）
    - 5) 实现 `onRetrySubmit()` 重试逻辑
  - **验证**：
    - [ ] 单元测试：快速连点 `onRate()` 时，只有第一次提交生效
    - [ ] 单元测试：提交失败时 `submitState = Failed(retryable)`
    - [ ] 单元测试：重试时调用 UseCase
  - **产物**：`app/src/main/java/com/jacky/verity/feature/learning/vm/LearningSessionViewModel.kt`

- [ ] T304 [ST-003] 实现提交反馈按钮 UI（路径：`app/src/main/java/com/jacky/verity/feature/learning/ui/session/LearningSessionScreen.kt`）
  - **依赖**：T303
  - **设计引用**：`plan.md:A3.4:UI:时序-成功`、`spec.md:FR-003`
  - **步骤**：
    - 1) 添加三个按钮："认识"、"不认识"、"跳过"（UserRating 枚举值）
    - 2) 根据 `submitState` 禁用/启用按钮（Loading 时禁用，符合 FR-006）
    - 3) 按钮点击时调用 `viewModel.onRate(rating)`
    - 4) 显示加载状态（提交中指示器）
  - **验证**：
    - [ ] UI 测试：答案显示后可点击反馈按钮
    - [ ] UI 测试：提交中按钮禁用
    - [ ] UI 测试：提交成功后按钮恢复可用
  - **产物**：`app/src/main/java/com/jacky/verity/feature/learning/ui/session/LearningSessionScreen.kt`

- [ ] T305 [ST-003] 实现失败重试 UI（路径：`app/src/main/java/com/jacky/verity/feature/learning/ui/session/LearningSessionScreen.kt`）
  - **依赖**：T304
  - **设计引用**：`plan.md:A3.4:ViewModel:时序-异常`、`spec.md:FR-006`
  - **步骤**：
    - 1) 当 `submitState = Failed(retryable=true)` 时显示重试按钮
    - 2) 显示错误提示文案（"提交失败，请重试"）
    - 3) 重试按钮点击时调用 `viewModel.onRetrySubmit()`
    - 4) 验证停留在当前题（不自动跳题，符合 FR-006）
  - **验证**：
    - [ ] UI 测试：提交失败时显示重试按钮
    - [ ] UI 测试：点击重试后重新提交
    - [ ] 集成测试：失败后停留在当前题，不跳题
  - **产物**：`app/src/main/java/com/jacky/verity/feature/learning/ui/session/LearningSessionScreen.kt`

- [ ] T306 [ST-003] 实现切题与进度更新（路径：`app/src/main/java/com/jacky/verity/feature/learning/vm/LearningSessionViewModel.kt`）
  - **依赖**：T305
  - **设计引用**：`plan.md:A3.4:ViewModel:时序-成功`、`spec.md:FR-004`
  - **步骤**：
    - 1) 提交成功后调用 `GetNextTaskUseCase` 获取下一题
    - 2) 更新 `currentTask` 和 `card`
    - 3) 重置 `isAnswerRevealed = false`
    - 4) 更新进度信息（done/total/remaining）
    - 5) 若无下一题，切换到完成状态（Done）
  - **验证**：
    - [ ] 单元测试：提交成功后更新到下一题
    - [ ] 单元测试：进度正确更新（done +1）
    - [ ] UI 测试：提交成功后自动切换到下一题（答案隐藏）
    - [ ] 集成测试：最后一题完成后进入完成页
  - **产物**：`app/src/main/java/com/jacky/verity/feature/learning/vm/LearningSessionViewModel.kt`、`app/src/main/java/com/jacky/verity/feature/learning/domain/GetNextTaskUseCase.kt`

- [ ] T307 [ST-003] 实现进度显示 UI（路径：`app/src/main/java/com/jacky/verity/feature/learning/ui/session/LearningSessionScreen.kt`）
  - **依赖**：T306
  - **设计引用**：`plan.md:A3.4:ViewModel:UML类图`（progress 状态）、`spec.md:FR-004`
  - **步骤**：
    - 1) 在会话页顶部显示进度信息（已完成/总数）
    - 2) 可选：显示进度条
    - 3) 从 `uiState` 的 `progress` 字段读取并显示
  - **验证**：
    - [ ] UI 测试：进入会话页显示初始进度（0/总数）
    - [ ] UI 测试：提交成功后进度更新（1/总数）
    - [ ] 手工验证：进度显示清晰易读
  - **产物**：`app/src/main/java/com/jacky/verity/feature/learning/ui/session/LearningSessionScreen.kt`

**检查点**：至此，用户故事 3 应具备完整提交反馈功能且可独立测试

---

## 阶段 6：Story ST-004 - 手势交互与一致性（类型：Functional）

**目标**：手势与按钮结果一致，且不会引入重复提交/误触不可控

**验证方式（高层）**：手势触发与按钮触发的结果一致；可在无障碍场景下弱化手势

**覆盖 FR/NFR**：FR-005

### ST-004 任务

- [ ] T400 [ST-004] 实现手势检测器（路径：`app/src/main/java/com/jacky/verity/feature/learning/ui/session/GestureHandler.kt`）
  - **依赖**：T307
  - **设计引用**：`plan.md:A1. 技术选型`（手势实现：Modifier.pointerInput）、`plan.md:A3.4:UI:UML类图`
  - **步骤**：
    - 1) 创建 `GestureHandler` 工具类
    - 2) 实现左右滑动手势检测（`Modifier.pointerInput` + gesture detector）
    - 3) 左滑动 → 认识（KNOWN），右滑动 → 不认识（UNKNOWN）
    - 4) 返回手势检测结果回调
  - **验证**：
    - [ ] 单元测试：手势检测器可识别左右滑动
    - [ ] UI 测试：手势可触发
  - **产物**：`app/src/main/java/com/jacky/verity/feature/learning/ui/session/GestureHandler.kt`

- [ ] T401 [ST-004] 集成手势到会话页（路径：`app/src/main/java/com/jacky/verity/feature/learning/ui/session/LearningSessionScreen.kt`）
  - **依赖**：T400
  - **设计引用**：`plan.md:A3.4:ViewModel:UML类图`（onSwipeGesture 事件）、`plan.md:A3.4:ViewModel:时序-异常`（并发保护）
  - **步骤**：
    - 1) 在 `CardComposable` 上添加手势检测 Modifier
    - 2) 手势触发时调用 `viewModel.onSwipeGesture(action)`（复用 `onRate()` 逻辑）
    - 3) 验证手势与按钮复用同一提交管线（避免双实现口径漂移，plan.md 概述）
  - **验证**：
    - [ ] UI 测试：左滑动触发"认识"反馈
    - [ ] UI 测试：右滑动触发"不认识"反馈
    - [ ] 集成测试：手势提交与按钮提交结果一致（同一 taskId 仅提交一次）
  - **产物**：`app/src/main/java/com/jacky/verity/feature/learning/ui/session/LearningSessionScreen.kt`

- [ ] T402 [ST-004] 实现 ViewModel 手势事件处理（路径：`app/src/main/java/com/jacky/verity/feature/learning/vm/LearningSessionViewModel.kt`）
  - **依赖**：T401
  - **设计引用**：`plan.md:A3.4:ViewModel:UML类图`、`plan.md:A3.4:ViewModel:时序-异常`（并发保护覆盖手势）
  - **步骤**：
    - 1) 实现 `onSwipeGesture(action: SwipeAction)` 函数
    - 2) 将手势 action 映射为 `UserRating`（左滑动 → KNOWN，右滑动 → UNKNOWN）
    - 3) 调用 `onRate(rating)`（复用提交逻辑，确保并发保护生效）
  - **验证**：
    - [ ] 单元测试：手势事件正确映射为 UserRating
    - [ ] 单元测试：手势提交受 Mutex 保护（与按钮提交互斥）
  - **产物**：`app/src/main/java/com/jacky/verity/feature/learning/vm/LearningSessionViewModel.kt`

- [ ] T403 [ST-004] 实现手势误触保护（路径：`app/src/main/java/com/jacky/verity/feature/learning/ui/session/GestureHandler.kt`）
  - **依赖**：T402
  - **设计引用**：`plan.md:A6. 边界 & 异常场景枚举`（用户行为：快速连点/误触）
  - **步骤**：
    - 1) 添加手势阈值（最小滑动距离、最小速度）
    - 2) 防止误触（短距离滑动不触发）
    - 3) 可选：添加手势动画反馈（视觉提示）
  - **验证**：
    - [ ] UI 测试：短距离滑动不触发反馈
    - [ ] UI 测试：正常滑动距离/速度可触发
    - [ ] 手工验证：手势操作流畅，无误触
  - **产物**：`app/src/main/java/com/jacky/verity/feature/learning/ui/session/GestureHandler.kt`

**检查点**：至此，用户故事 4 应具备完整手势交互功能且可独立测试

---

## 阶段 7：Story ST-005 - 发音入口与播放接入（降级不阻断）（类型：Functional）

**目标**：播放失败不影响学习主流程；资源释放正确

**验证方式（高层）**：播放成功/失败/切后台停止；功耗 profiler 对比验证无异常唤醒

**覆盖 FR/NFR**：FR-009、NFR-POWER-001

### ST-005 任务

- [ ] T500 [ST-005] 实现 MediaRepository 接口实现（路径：`app/src/main/java/com/jacky/verity/feature/learning/data/repository/MediaRepositoryImpl.kt`）
  - **依赖**：T022（MediaRepository 接口）
  - **设计引用**：`plan.md:A3.4:MediaRepository:UML类图`、`plan.md:A3.4:MediaRepository:时序-异常`、`plan.md:A3.4:MediaRepository:异常清单`
  - **步骤**：
    - 1) 创建 `MediaRepositoryImpl` 实现类
    - 2) 实现 `hasPronunciation(wordId: String): Boolean`（调用 FEAT-006 接口桩）
    - 3) 实现 `playPronunciation(wordId: String): Result<Unit>`（调用 FEAT-006 播放器）
    - 4) 处理资源不存在错误（EX-MEDIA-001：返回 `ResourceNotFound`）
    - 5) 处理播放失败错误（EX-MEDIA-002：返回 `PlaybackError`，静默失败）
    - 6) 实现超时处理（1s，EX-MEDIA-003）
  - **验证**：
    - [ ] 单元测试：资源不存在返回 `ResourceNotFound`
    - [ ] 单元测试：播放失败返回错误但不抛异常
  - **产物**：`app/src/main/java/com/jacky/verity/feature/learning/data/repository/MediaRepositoryImpl.kt`

- [ ] T501 [ST-005] 实现 PlayPronunciationUseCase（路径：`app/src/main/java/com/jacky/verity/feature/learning/domain/PlayPronunciationUseCase.kt`）
  - **依赖**：T500
  - **设计引用**：`plan.md:A3.4:UseCase:UML类图`、`plan.md:A3.4:MediaRepository:时序-成功`
  - **步骤**：
    - 1) 创建 `PlayPronunciationUseCase` 类
    - 2) 实现 `invoke(wordId: String): Result<Unit>`
    - 3) 调用 `MediaRepository.playPronunciation()`
    - 4) 错误处理：播放失败不影响学习流程（返回 Result，不抛异常）
  - **验证**：
    - [ ] 单元测试：播放成功返回 `Result.success(Unit)`
    - [ ] 单元测试：播放失败返回 `Result.failure`，但不影响调用方
  - **产物**：`app/src/main/java/com/jacky/verity/feature/learning/domain/PlayPronunciationUseCase.kt`

- [ ] T502 [ST-005] 实现发音按钮 UI（路径：`app/src/main/java/com/jacky/verity/feature/learning/ui/session/CardComposable.kt`）
  - **依赖**：T501
  - **设计引用**：`plan.md:A3.4:UI:UML类图`、`spec.md:FR-009`
  - **步骤**：
    - 1) 在卡片上添加"播放发音"按钮/图标
    - 2) 根据 `hasPronunciation` 状态显示/隐藏/置灰按钮（FR-009）
    - 3) 无资源时置灰并显示提示（"无发音资源"）
    - 4) 按钮点击时调用 ViewModel 播放发音
  - **验证**：
    - [ ] UI 测试：有发音资源时按钮可用
    - [ ] UI 测试：无发音资源时按钮置灰
    - [ ] UI 测试：点击按钮触发播放
  - **产物**：`app/src/main/java/com/jacky/verity/feature/learning/ui/session/CardComposable.kt`

- [ ] T503 [ST-005] 实现 ViewModel 播放发音处理（路径：`app/src/main/java/com/jacky/verity/feature/learning/vm/LearningSessionViewModel.kt`）
  - **依赖**：T502
  - **设计引用**：`plan.md:A3.4:ViewModel:UML类图`（onPlayPronunciation 事件）、`plan.md:A6. 边界 & 异常场景枚举`（生命周期）
  - **步骤**：
    - 1) 实现 `onPlayPronunciation()` 函数
    - 2) 调用 `PlayPronunciationUseCase`
    - 3) 处理播放失败（静默失败，不阻断学习流程，符合 plan.md A3.4:MediaRepository 设计）
  - **验证**：
    - [ ] 单元测试：播放发音调用 UseCase
    - [ ] 单元测试：播放失败不影响当前学习状态
  - **产物**：`app/src/main/java/com/jacky/verity/feature/learning/vm/LearningSessionViewModel.kt`

- [ ] T504 [ST-005] 实现生命周期资源释放（路径：`app/src/main/java/com/jacky/verity/feature/learning/vm/LearningSessionViewModel.kt`）
  - **依赖**：T503
  - **设计引用**：`plan.md:A3.4:MediaRepository:异常清单`（EX-MEDIA-002、EX-MEDIA-003）、`plan.md:A6. 边界 & 异常场景枚举`（生命周期）、`plan.md:A5. 技术风险与消解策略`（RISK-004）
  - **步骤**：
    - 1) 在 ViewModel 的 `onCleared()` 中停止播放（若正在播放）
    - 2) 在 UI 的 `DisposableEffect` 中处理切后台停止播放
    - 3) 处理音频焦点丢失（通过 FEAT-006 播放器接口）
  - **验证**：
    - [ ] 集成测试：切后台时停止播放
    - [ ] 集成测试：退出会话页时释放资源
    - [ ] 功耗测试：使用 Android Studio Energy Profiler 验证无异常唤醒（NFR-POWER-001：≤ 5mAh/天）
  - **产物**：`app/src/main/java/com/jacky/verity/feature/learning/vm/LearningSessionViewModel.kt`

**检查点**：至此，用户故事 5 应具备完整发音播放功能且可独立测试

---

## 阶段 8：Story ST-006 - 中断与恢复（旋转/后台/进程回收）（类型：Infrastructure）

**目标**：满足"不回退超过 1 题"的恢复策略

**验证方式（高层）**：旋转/后台/进程回收后恢复；monkey 测试

**覆盖 FR/NFR**：FR-008、NFR-REL-002

### ST-006 任务

- [ ] T600 [ST-006] 实现 SavedStateHandle 状态保存（路径：`app/src/main/java/com/jacky/verity/feature/learning/vm/LearningSessionViewModel.kt`）
  - **依赖**：T307
  - **设计引用**：`plan.md:A3.4:ViewModel:UML类图`（SavedStateHandle）、`plan.md:A3.4:ViewModel:时序-成功`、`plan.md:A6. 边界 & 异常场景枚举`（生命周期）
  - **步骤**：
    - 1) ViewModel 构造函数接收 `SavedStateHandle` 参数
    - 2) 保存 `currentTaskId` 到 SavedStateHandle
    - 3) 保存 `isAnswerRevealed` 到 SavedStateHandle
    - 4) 恢复时从 SavedStateHandle 读取状态
  - **验证**：
    - [ ] 单元测试：状态保存到 SavedStateHandle
    - [ ] 单元测试：恢复时从 SavedStateHandle 读取
  - **产物**：`app/src/main/java/com/jacky/verity/feature/learning/vm/LearningSessionViewModel.kt`

- [ ] T601 [ST-006] 实现旋转屏幕状态恢复（路径：`app/src/main/java/com/jacky/verity/feature/learning/ui/session/LearningSessionScreen.kt`）
  - **依赖**：T600
  - **设计引用**：`plan.md:A3.4:ViewModel:时序-成功`、`spec.md:FR-008`
  - **步骤**：
    - 1) 使用 `rememberSaveable` 保存 UI 相关状态（若需要）
    - 2) 旋转时 ViewModel 状态通过 SavedStateHandle 自动恢复
    - 3) 恢复后重新加载当前任务数据（从算法引擎获取，确保一致性）
  - **验证**：
    - [ ] 集成测试：旋转屏幕后保持当前题目
    - [ ] 集成测试：旋转屏幕后保持答案显示状态
    - [ ] 手工验证：旋转后 UI 正常显示
  - **产物**：`app/src/main/java/com/jacky/verity/feature/learning/ui/session/LearningSessionScreen.kt`

- [ ] T602 [ST-006] 实现切后台状态恢复（路径：`app/src/main/java/com/jacky/verity/feature/learning/vm/LearningSessionViewModel.kt`）
  - **依赖**：T601
  - **设计引用**：`plan.md:A3.4:ViewModel:异常清单`（EX-VM-006）、`plan.md:A6. 边界 & 异常场景枚举`（生命周期）、`spec.md:FR-008`
  - **步骤**：
    - 1) 在 `onStart()` 生命周期中恢复状态
    - 2) 从 SavedStateHandle 恢复 `currentTaskId`
    - 3) 若状态损坏（EX-VM-006），从算法引擎重新获取当前任务
    - 4) 验证恢复后的题目与进度一致性（不回退超过 1 题，NFR-REL-002）
  - **验证**：
    - [ ] 集成测试：切后台再回到前台，保持当前题目
    - [ ] 集成测试：切后台后答案显示状态保持
    - [ ] 集成测试：状态损坏时从引擎恢复（不回退超过 1 题）
  - **产物**：`app/src/main/java/com/jacky/verity/feature/learning/vm/LearningSessionViewModel.kt`

- [ ] T603 [ST-006] 实现进程回收恢复策略（路径：`app/src/main/java/com/jacky/verity/feature/learning/vm/LearningSessionViewModel.kt`）
  - **依赖**：T602
  - **设计引用**：`plan.md:A3.4:ViewModel:异常清单`（EX-VM-006）、`plan.md:A5. 技术风险与消解策略`（RISK-003）、`spec.md:NFR-REL-002`
  - **步骤**：
    - 1) 进程回收后，从 SavedStateHandle 恢复 `currentTaskId`
    - 2) 调用 `GetNextTaskUseCase` 从算法引擎获取当前任务（权威来源）
    - 3) 若无法恢复，至少恢复到同一题目或下一题（不回退超过 1 题）
    - 4) 记录恢复事件（用于可观测性）
  - **验证**：
    - [ ] 集成测试：进程回收后恢复到当前题目
    - [ ] 集成测试：无法恢复时至少恢复到同一题目（不回退超过 1 题）
    - [ ] Monkey 测试：长时间运行后恢复状态正确
  - **产物**：`app/src/main/java/com/jacky/verity/feature/learning/vm/LearningSessionViewModel.kt`

**检查点**：至此，用户故事 6 应具备完整状态恢复功能且可独立测试

---

## 阶段 9：Story ST-007 - 性能与内存预算落地（图片/重组/长帧）（类型：Optimization）

**目标**：满足 NFR-PERF 与 NFR-MEM 门槛

**验证方式（高层）**：Frame metrics 长帧占比与 profiler 峰值内存验证

**覆盖 FR/NFR**：NFR-PERF-001、NFR-PERF-002、NFR-MEM-001

### ST-007 任务

- [ ] T700 [ST-007] 集成 Coil 图片加载库（路径：`app/build.gradle.kts`、`app/src/main/java/com/jacky/verity/feature/learning/ui/session/CardComposable.kt`）
  - **依赖**：T204（扩展信息展示）
  - **设计引用**：`plan.md:A1. 技术选型`（图片加载：Coil Compose）、`plan.md:A10. 内存评估`（峰值内存 ≤ 30MB）
  - **步骤**：
    - 1) 添加 Coil Compose 依赖（若未添加）
    - 2) 在 `CardComposable` 中使用 `AsyncImage` 组件加载图片
    - 3) 配置图片采样策略（限制最大解码尺寸，防止 OOM）
    - 4) 使用占位图（placeholder）提升体验
  - **验证**：
    - [ ] 手工验证：图片可正常加载显示
    - [ ] 内存测试：使用 Android Studio Memory Profiler 验证峰值内存 ≤ 30MB（NFR-MEM-001）
  - **产物**：`app/src/main/java/com/jacky/verity/feature/learning/ui/session/CardComposable.kt`

- [ ] T701 [ST-007] 优化 Compose 重组性能（路径：`app/src/main/java/com/jacky/verity/feature/learning/ui/session/CardComposable.kt`、`LearningSessionScreen.kt`）
  - **依赖**：T700
  - **设计引用**：`plan.md:A9. 性能评估`（长帧占比 ≤ 1%）、`plan.md:A5. 技术风险与消解策略`（RISK-001）
  - **步骤**：
    - 1) 使用 `remember` 缓存计算结果
    - 2) 使用 `derivedStateOf` 减少不必要的重组
    - 3) 拆分 Composable 函数，减少重组范围
    - 4) 避免在 Composable 中进行重计算
  - **验证**：
    - [ ] 性能测试：使用 Frame metrics / JankStats 统计长帧占比 ≤ 1%（NFR-PERF-002）
    - [ ] 手工验证：连续学习 30 题无明显卡顿
  - **产物**：`app/src/main/java/com/jacky/verity/feature/learning/ui/session/CardComposable.kt`、`LearningSessionScreen.kt`

- [ ] T702 [ST-007] 优化首帧与切题性能（路径：`app/src/main/java/com/jacky/verity/feature/learning/vm/LearningSessionViewModel.kt`）
  - **依赖**：T701
  - **设计引用**：`plan.md:A9. 性能评估`（首帧 p95 ≤ 500ms、切题 p95 ≤ 100ms）、`plan.md:A3.3 模块协作与通信方式`（线程模型）
  - **步骤**：
    - 1) 确保取题、提交在 IO 线程执行（不阻塞主线程）
    - 2) 预加载下一题数据（可选，降低切题延迟）
    - 3) 优化图片加载时机（延迟加载，不阻塞首帧）
  - **验证**：
    - [ ] 性能测试：进入学习界面首帧 p95 ≤ 500ms（NFR-PERF-001）
    - [ ] 性能测试：切题 UI 更新时间 p95 ≤ 100ms（NFR-PERF-001）
    - [ ] 使用 Android Studio Profiler 验证主线程无阻塞
  - **产物**：`app/src/main/java/com/jacky/verity/feature/learning/vm/LearningSessionViewModel.kt`

- [ ] T703 [ST-007] 实现资源释放策略（路径：`app/src/main/java/com/jacky/verity/feature/learning/ui/session/LearningSessionScreen.kt`）
  - **依赖**：T702
  - **设计引用**：`plan.md:A10. 内存评估`（生命周期：离开会话页释放）、`plan.md:A5. 技术风险与消解策略`（RISK-001）
  - **步骤**：
    - 1) 在 `DisposableEffect` 中释放图片资源（Coil 自动管理，但确保不持有引用）
    - 2) 离开会话页时清理缓存（仅缓存当前/下一张卡片）
    - 3) 释放音频播放器引用（T504 已实现）
  - **验证**：
    - [ ] 内存测试：离开会话页后内存回落（无泄漏）
    - [ ] 使用 Memory Profiler 验证无持续增长
  - **产物**：`app/src/main/java/com/jacky/verity/feature/learning/ui/session/LearningSessionScreen.kt`

- [ ] T704 [ST-007] 建立性能验收脚本（路径：`scripts/performance/validate_performance.kt` 或测试脚本）
  - **依赖**：T703
  - **设计引用**：`plan.md:A9. 性能评估`（验收指标 & 测试方法）
  - **步骤**：
    - 1) 编写 Frame metrics 采集脚本
    - 2) 编写内存峰值采集脚本
    - 3) 编写首帧/切题时间采集脚本
    - 4) 设置阈值验证（NFR-PERF-001、NFR-PERF-002、NFR-MEM-001）
  - **验证**：
    - [ ] 脚本可运行并采集指标
    - [ ] 指标符合 NFR 阈值
  - **产物**：性能测试脚本

**检查点**：至此，用户故事 7 应满足性能与内存预算且可独立测试

---

## 阶段 10：Story ST-008 - 可观测性与隐私关卡（事件口径 + 脱敏）（类型：Infrastructure）

**目标**：满足 NFR-OBS 与 NFR-SEC；为后续统计/游戏化复用事件口径

**验证方式（高层）**：审查事件字段；单测验证脱敏；手工验证关键路径都有事件

**覆盖 FR/NFR**：NFR-OBS-001、NFR-OBS-002、NFR-SEC-001

### ST-008 任务

- [ ] T800 [ST-008] 定义事件模型与字段白名单（路径：`app/src/main/java/com/jacky/verity/feature/learning/data/observability/LearningEvent.kt`）
  - **依赖**：T022
  - **设计引用**：`plan.md:A3.4:EventRepository:UML类图`、`plan.md:A3.4:EventRepository:异常清单`（EX-EVENT-001）、`plan.md:B2. 架构细化`（日志与可观测性规范）
  - **步骤**：
    - 1) 定义 `LearningEvent` sealed class（EnterSessionEvent、ExitSessionEvent、RevealAnswerEvent、SubmitRatingEvent 等）
    - 2) 定义字段白名单：`sessionType`、`wordId`、`taskId`、`rating`、`elapsedMs`、`errorType`、`retryCount`
    - 3) 禁止字段：释义/例句正文、图片 URL（若包含敏感信息）
    - 4) 实现事件序列化（仅序列化白名单字段）
  - **验证**：
    - [ ] 单元测试：事件序列化只包含白名单字段
    - [ ] 单元测试：包含禁止字段时拒绝记录（EX-EVENT-001）
  - **产物**：`app/src/main/java/com/jacky/verity/feature/learning/data/observability/LearningEvent.kt`

- [ ] T801 [ST-008] 实现 EventRepository（路径：`app/src/main/java/com/jacky/verity/feature/learning/data/repository/EventRepository.kt`、`EventRepositoryImpl.kt`）
  - **依赖**：T800
  - **设计引用**：`plan.md:A3.4:EventRepository:UML类图`、`plan.md:A3.4:EventRepository:时序-异常`、`plan.md:A3.4:EventRepository:异常清单`
  - **步骤**：
    - 1) 定义 `EventRepository` 接口（`logEvent(event: LearningEvent)`）
    - 2) 实现 `EventRepositoryImpl`：字段白名单校验（EX-EVENT-001）
    - 3) 实现事件记录（静默失败，不影响业务，EX-EVENT-002）
    - 4) 可选：实现事件采样策略
  - **验证**：
    - [ ] 单元测试：字段校验正确（禁止字段被拒绝）
    - [ ] 单元测试：记录失败不影响业务逻辑
  - **产物**：`app/src/main/java/com/jacky/verity/feature/learning/data/repository/EventRepository.kt`、`EventRepositoryImpl.kt`

- [ ] T802 [ST-008] 在 ViewModel 中集成事件记录（路径：`app/src/main/java/com/jacky/verity/feature/learning/vm/LearningSessionViewModel.kt`）
  - **依赖**：T801
  - **设计引用**：`plan.md:A3.4:ViewModel:UML类图`（EventRepository 依赖）、`plan.md:A3.4:ViewModel:时序-成功`、`spec.md:NFR-OBS-001`
  - **步骤**：
    - 1) ViewModel 构造函数接收 `EventRepository` 参数
    - 2) 在 `onStartSession()` 时记录 `EnterSessionEvent`（NFR-OBS-001）
    - 3) 在 `onRevealAnswer()` 时记录 `RevealAnswerEvent`
    - 4) 在 `onRate()` 提交时记录 `SubmitRatingEvent`（包含耗时、结果枚举）
    - 5) 在提交失败时记录失败事件（含错误类型，NFR-OBS-001、NFR-OBS-002）
    - 6) 在完成时记录 `ExitSessionEvent`（包含耗时）
  - **验证**：
    - [ ] 单元测试：关键路径都记录事件
    - [ ] 单元测试：事件字段符合白名单
  - **产物**：`app/src/main/java/com/jacky/verity/feature/learning/vm/LearningSessionViewModel.kt`

- [ ] T803 [ST-008] 实现错误定位字段（路径：`app/src/main/java/com/jacky/verity/feature/learning/data/observability/LearningEvent.kt`）
  - **依赖**：T802
  - **设计引用**：`plan.md:A3.4:EventRepository:UML类图`、`spec.md:NFR-OBS-002`
  - **步骤**：
    - 1) 在失败事件中包含：`sessionType`、`currentTaskIndex`、`libraryId`（不含敏感内容）
    - 2) 在崩溃/关键错误时记录上下文信息（NFR-OBS-002）
    - 3) 确保不记录可还原的完整内容文本
  - **验证**：
    - [ ] 单元测试：错误事件包含定位字段
    - [ ] 单元测试：不包含禁止字段（释义正文）
  - **产物**：`app/src/main/java/com/jacky/verity/feature/learning/data/observability/LearningEvent.kt`

- [ ] T804 [ST-008] 建立隐私合规审查测试（路径：`app/src/test/java/com/jacky/verity/feature/learning/observability/EventPrivacyTest.kt`）
  - **依赖**：T803
  - **设计引用**：`plan.md:A3.4:EventRepository:异常清单`（EX-EVENT-001）、`plan.md:B5. 合规性检查`、`spec.md:NFR-SEC-001`
  - **步骤**：
    - 1) 编写单元测试：验证事件不包含释义正文
    - 2) 编写单元测试：验证字段白名单校验生效
    - 3) 编写集成测试：模拟关键路径，验证所有事件符合隐私要求
  - **验证**：
    - [ ] 单元测试：事件脱敏测试通过
    - [ ] 集成测试：关键路径事件审查通过
  - **产物**：`app/src/test/java/com/jacky/verity/feature/learning/observability/EventPrivacyTest.kt`

**检查点**：至此，用户故事 8 应具备完整可观测性功能且符合隐私要求

---

## 依赖关系与执行顺序

### 阶段依赖

- **环境搭建（阶段 1）**：无依赖——可立即启动
- **核心基础（阶段 2）**：依赖环境搭建完成——阻塞所有用户故事
- **用户故事（阶段 3-10）**：均依赖核心基础阶段完成
    - ST-001（阶段 3）：可独立启动，与 ST-002/003 可并行
    - ST-002（阶段 4）：可独立启动，与 ST-001/003 可并行
    - ST-003（阶段 5）：依赖 ST-002（会话页 UI 骨架），与 ST-002 可并行
    - ST-004（阶段 6）：依赖 ST-003（提交管线）
    - ST-005（阶段 7）：可独立启动，与 ST-002 可并行
    - ST-006（阶段 8）：依赖 ST-003（基础会话与提交）
    - ST-007（阶段 9）：依赖 ST-002（卡片 UI），可在 UI 初版后并行优化
    - ST-008（阶段 10）：依赖 ST-001/002/003（需要埋点点位），可并行
- **优化完善（阶段 7、9）**：可在对应 Story 完成后启动，不影响其他 Story

### Story 依赖

- **ST-001**：依赖阶段 2 完成
- **ST-002**：依赖阶段 2 完成（与 ST-001 可并行）
- **ST-003**：依赖 ST-002（会话页 UI 骨架），但可与 ST-002 并行开发
- **ST-004**：依赖 ST-003（提交管线）
- **ST-005**：依赖阶段 2 完成（与 ST-002 可并行）
- **ST-006**：依赖 ST-003（基础会话与提交）
- **ST-007**：依赖 ST-002（卡片 UI），可在 UI 初版后并行优化
- **ST-008**：依赖 ST-001/002/003（需要埋点点位），但可并行实现

### 单 Story 内部顺序

- 基础设施/接口定义先于实现
- 数据模型先于业务逻辑
- ViewModel 实现先于 UI 集成
- 核心功能实现先于集成工作
- 本故事完成后，再推进下一依赖故事

### 并行执行场景

- 所有标记 [P] 的环境搭建任务可并行
- 所有标记 [P] 的核心基础任务可并行（阶段 2 内）
- 核心基础阶段完成后，ST-001、ST-002、ST-005、ST-008 可并行启动
- ST-007 可在 ST-002 完成后并行优化
- 单用户故事下所有标记 [P] 的任务可并行
- 不同团队成员可并行开发不同用户故事

---

## 并行示例：Story ST-002

```bash
# 批量启动 ST-002 的可并行任务：
任务："T201 [ST-002] 实现显示答案状态管理，路径：vm/LearningSessionViewModel.kt"
任务："T202 [ST-002] 创建单词卡片 UI 组件，路径：ui/session/CardComposable.kt"
```

## 并行示例：Story ST-003

```bash
# 批量启动 ST-003 的可并行任务：
任务："T300 [ST-003] 实现 StartSessionUseCase，路径：domain/StartSessionUseCase.kt"
任务："T301 [ST-003] 实现 SubmitRatingUseCase，路径：domain/SubmitRatingUseCase.kt"
```

---

## 落地策略

### 先完成 MVP（优先完成关键 Story 集合）

1. 完成阶段 1：环境搭建
2. 完成阶段 2：核心基础（关键——阻塞所有故事）
3. 完成阶段 3：Story ST-001（导航骨架）
4. 完成阶段 4：Story ST-002（卡片展示）
5. 完成阶段 5：Story ST-003（提交反馈管线）
6. **暂停并验证**：独立验证 MVP 功能（ST-001、ST-002、ST-003）
7. 如就绪，进行部署/演示（MVP！）

### 增量交付

1. 完成环境搭建 + 核心基础 → 基础层就绪
2. 新增 ST-001 + ST-002 + ST-003 → 独立验证 → 部署/演示（MVP！）
3. 新增 ST-004 → 独立验证 → 部署/演示（手势增强）
4. 新增 ST-005 → 独立验证 → 部署/演示（发音功能）
5. 新增 ST-006 → 独立验证 → 部署/演示（状态恢复）
6. 新增 ST-007 → 独立验证 → 部署/演示（性能优化）
7. 新增 ST-008 → 独立验证 → 部署/演示（可观测性）
8. 每个故事均需在不破坏已有故事的前提下新增价值

### 团队并行策略

多开发者协作场景：

1. 团队共同完成环境搭建 + 核心基础
2. 核心基础完成后：
    - 开发者 A：负责 ST-001（导航）
    - 开发者 B：负责 ST-002（卡片 UI）
    - 开发者 C：负责 ST-005（发音）或 ST-008（可观测性）
3. ST-002 完成后：
    - 开发者 A：负责 ST-003（提交管线）
    - 开发者 B：负责 ST-007（性能优化，并行）
4. ST-003 完成后：
    - 开发者 A：负责 ST-004（手势）
    - 开发者 B：负责 ST-006（状态恢复）
5. 各 Story 独立完成并集成

---

## 任务汇总

### 任务统计

- **总任务数**：67 个任务
- **阶段 0（准备）**：1 个任务
- **阶段 1（环境搭建）**：3 个任务
- **阶段 2（核心基础）**：3 个任务
- **阶段 3（ST-001）**：5 个任务
- **阶段 4（ST-002）**：5 个任务
- **阶段 5（ST-003）**：8 个任务
- **阶段 6（ST-004）**：4 个任务
- **阶段 7（ST-005）**：5 个任务
- **阶段 8（ST-006）**：4 个任务
- **阶段 9（ST-007）**：5 个任务
- **阶段 10（ST-008）**：5 个任务

### Story 任务分布

- **ST-001**：5 个任务（导航骨架）
- **ST-002**：5 个任务（卡片展示）
- **ST-003**：8 个任务（提交反馈管线）
- **ST-004**：4 个任务（手势交互）
- **ST-005**：5 个任务（发音播放）
- **ST-006**：4 个任务（状态恢复）
- **ST-007**：5 个任务（性能优化）
- **ST-008**：5 个任务（可观测性）

### 可并行执行机会

- 阶段 1：T012 可并行
- 阶段 2：T021、T022 可并行
- ST-001：T100、T101 可并行（部分任务）
- ST-002：T201、T202 可并行（部分任务）
- ST-003：T300、T301 可并行（UseCase 实现）
- ST-007：可在 ST-002 完成后并行优化

### 验证方式摘要（含指标阈值）

- **ST-001**：手工验证导航、UI 测试 back stack
- **ST-002**：UI 测试答案显示/隐藏，手工验证布局
- **ST-003**：单元测试并发保护、集成测试不跳题、验证进度更新
- **ST-004**：UI 测试手势触发、集成测试一致性
- **ST-005**：集成测试播放/停止、功耗测试 ≤ 5mAh/天（NFR-POWER-001）
- **ST-006**：集成测试旋转/后台恢复、Monkey 测试、验证不回退超过 1 题（NFR-REL-002）
- **ST-007**：性能测试首帧 p95 ≤ 500ms、切题 p95 ≤ 100ms（NFR-PERF-001）、长帧占比 ≤ 1%（NFR-PERF-002）、内存峰值 ≤ 30MB（NFR-MEM-001）
- **ST-008**：单元测试事件脱敏、集成测试关键路径事件、隐私合规审查

### 建议的 MVP 范围

**MVP（最小可行产品）**：ST-001 + ST-002 + ST-003
- ST-001：基础导航（入口/会话/完成页）
- ST-002：卡片展示与答案显示
- ST-003：提交反馈管线（核心学习流程）

**MVP 验证标准**：
- 用户可进入学习会话
- 用户可查看单词卡片并显示答案
- 用户可提交反馈并进入下一题
- 核心学习流程完整可用

---

## 备注

- [P] 标记的任务 = 涉及不同文件，无依赖关系
- [ST-xxx] 标签将任务关联至 Plan 的 Story，便于追溯
- 每个 Story 需可独立完成、独立验证
- 实现前验证测试用例执行失败（若采用 TDD）
- 完成单个任务或逻辑分组后提交代码
- 可在任意检查点暂停，独立验证对应故事
- 避免：模糊的任务描述、同一文件冲突、破坏独立性的跨故事依赖
- **设计引用**：所有任务的设计引用均指向 plan.md A3.4 模块详细设计，确保实现与设计一致
