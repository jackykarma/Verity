# Tasks：学习界面与交互

**Epic**：EPIC-001 - 无痛记忆单词神器APP  
**Feature ID**：FEAT-003  
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

- **移动端**：`app/src/main/java/com/jacky/verity/feature/learning/`

---

## 阶段 0：准备（可选但建议）

**目标**：对齐版本、冻结设计输入，避免 Implement 期返工

- [ ] T001 在 `specs/epics/EPIC-001-word-memory-app/features/FEAT-003-learning-ui/` 中核对 `spec.md`、`plan.md` 的 Version 字段一致性并补齐变更记录
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

- [ ] T010 按照 plan.md 的“结构决策”创建项目目录结构（路径：`app/src/main/java/com/jacky/verity/feature/learning/`）
  - **依赖**：T001
  - **步骤**：
    - 1) 创建 `feature/learning/ui/` 目录（Compose screens）
    - 2) 创建 `feature/learning/vm/` 目录（ViewModel + UiState）
    - 3) 创建 `feature/learning/domain/` 目录（UseCases）
    - 4) 创建 `feature/learning/data/` 目录（Repositories adapters）
    - 5) 确保与现有模块边界一致
  - **验证**：
    - [ ] 目录结构与 plan.md B7 一致
    - [ ] 所有目录已创建
  - **产物**：相关目录结构

- [ ] T011 初始化构建与依赖（路径：`app/build.gradle.kts`）
  - **依赖**：T010
  - **步骤**：
    - 1) 确认 Navigation Compose 依赖已添加（若采用）
    - 2) 确认 Coil Compose 依赖已添加（图片加载，若采用）
    - 3) 确认 Lifecycle/ViewModel 依赖已存在
    - 4) 确认 Kotlin Coroutines 依赖已存在
  - **验证**：
    - [ ] 基础构建可通过（`./gradlew build`）
    - [ ] 所有依赖版本兼容
  - **产物**：`build.gradle.kts`

- [ ] T012 [P] 配置代码检查与格式化工具（路径：`.editorconfig`、`ktlint.yml` 等）
  - **依赖**：T011
  - **步骤**：
    - 1) 配置 Kotlin 代码格式化规则
    - 2) 配置 Compose 代码检查规则
  - **验证**：
    - [ ] lint/format 命令可运行
    - [ ] 代码风格检查通过
  - **产物**：配置文件

---

## 阶段 2：核心基础（阻塞性前置条件，阻塞所有 Story）

**目标**：所有 Story 实现前必须完成的核心基础设施搭建

**⚠️ 关键**：此阶段完成前，任何 Story 相关工作均不可启动

- [ ] T020 在 `app/src/main/java/com/jacky/verity/feature/learning/domain/model/` 中创建核心数据模型（StudyTask.kt、LearningSession.kt、CardViewState.kt、UserRating.kt）
  - **依赖**：T012
  - **步骤**：
    - 1) 创建 `StudyTask` data class（wordId、taskType、priority/序号）
    - 2) 创建 `LearningSession` data class（sessionType、startTime、endTime、completedCount、taskSetRef）
    - 3) 创建 `CardViewState` data class（isAnswerRevealed、currentTaskIndex、submitState）
    - 4) 创建 `UserRating` enum（认识/不认识/跳过）
    - 5) 创建 `SessionType` enum（学习/复习）
    - 6) 创建 `SubmitState` sealed class（Idle、Loading、Failed、Success）
  - **验证**：
    - [ ] 数据模型与 plan.md A3.4 一致
    - [ ] 所有字段类型正确
    - [ ] 状态机定义清晰
  - **产物**：`StudyTask.kt`、`LearningSession.kt`、`CardViewState.kt`、`UserRating.kt`、`SessionType.kt`、`SubmitState.kt`

- [ ] T021 [P] 在 `app/src/main/java/com/jacky/verity/feature/learning/data/repository/` 中创建 Repository 接口（StudyTaskRepository.kt、WordRepository.kt、MediaRepository.kt）
  - **依赖**：T020
  - **步骤**：
    - 1) 定义 `StudyTaskRepository` 接口：`startSession`、`getCurrentTask`、`submitRating`（suspend 函数，返回 Result）
    - 2) 定义 `WordRepository` 接口：`getWordCard`（wordId → WordCardModel）
    - 3) 定义 `MediaRepository` 接口：`hasPronunciation`、`playPronunciation`（返回 Result）
    - 4) 定义错误类型：`retryable` vs `notRetryable`（sealed class）
  - **验证**：
    - [ ] 接口定义与 plan.md B4.2 一致
    - [ ] 错误语义清晰（可重试/不可重试）
    - [ ] 幂等约束明确
  - **产物**：`StudyTaskRepository.kt`、`WordRepository.kt`、`MediaRepository.kt`、`LearningError.kt`

- [ ] T022 [P] 在 `app/src/main/java/com/jacky/verity/feature/learning/domain/usecase/` 中创建 UseCase 接口骨架（StartSessionUseCase.kt、GetNextTaskUseCase.kt、SubmitRatingUseCase.kt、ResumeSessionUseCase.kt、PlayPronunciationUseCase.kt）
  - **依赖**：T021
  - **步骤**：
    - 1) 创建 UseCase 接口骨架（suspend 函数签名）
    - 2) 定义输入/输出类型
    - 3) 标注依赖的 Repository
  - **验证**：
    - [ ] UseCase 接口与 plan.md A3.2 一致
    - [ ] 所有 UseCase 已定义
  - **产物**：UseCase 接口文件

- [ ] T023 在 `app/src/main/java/com/jacky/verity/feature/learning/vm/` 中创建 ViewModel 骨架与 UiState（LearningSessionViewModel.kt、LearningUiState.kt）
  - **依赖**：T022
  - **步骤**：
    - 1) 创建 `LearningUiState` data class（sessionType、progress、currentTask、card、isAnswerRevealed、submitState）
    - 2) 创建 `LearningSessionViewModel` 骨架（StateFlow<UiState>、事件处理函数签名）
    - 3) 集成 `SavedStateHandle`（用于状态恢复）
  - **验证**：
    - [ ] UiState 与 plan.md A3.4 一致
    - [ ] ViewModel 骨架完整
  - **产物**：`LearningSessionViewModel.kt`、`LearningUiState.kt`

**检查点**：基础层就绪——数据模型、Repository 接口、UseCase 骨架、ViewModel 骨架已就绪，Story 实现可启动

---

## 阶段 3：Story ST-001 - 学习入口与导航骨架（类型：Design-Enabler）

**目标**：可从入口进入会话并正常返回；完成页可展示并回到入口

**验证方式（高层）**：手工走通导航；UI 测试验证 back stack 与退出确认

**覆盖 FR/NFR**：FR-001、FR-007、FR-008

- [ ] T100 [P] [ST-001] 在 `app/src/main/java/com/jacky/verity/feature/learning/ui/navigation/` 中创建 Navigation 路由定义（LearningNavigation.kt）
  - **依赖**：T023
  - **步骤**：
    - 1) 定义路由：入口页（`learning_entry`）、会话页（`learning_session`）、完成页（`learning_done`）
    - 2) 配置 Navigation Compose graph
    - 3) 定义参数传递（sessionType、sessionId 等）
  - **验证**：
    - [ ] 路由定义完整
    - [ ] 参数传递正确
  - **产物**：`LearningNavigation.kt`

- [ ] T101 [ST-001] 在 `app/src/main/java/com/jacky/verity/feature/learning/ui/entry/` 中创建学习入口页（LearningEntryScreen.kt）
  - **依赖**：T100
  - **步骤**：
    - 1) 创建 Compose Screen：开始学习/开始复习按钮
    - 2) 检查词库是否已选择（未选择则引导去 FEAT-001）
    - 3) 导航到会话页
  - **验证**：
    - [ ] 入口页 UI 正常显示
    - [ ] 按钮点击可导航
    - [ ] 未选择词库时显示引导
  - **产物**：`LearningEntryScreen.kt`

- [ ] T102 [ST-001] 在 `app/src/main/java/com/jacky/verity/feature/learning/ui/done/` 中创建完成页（LearningDoneScreen.kt）
  - **依赖**：T100
  - **步骤**：
    - 1) 创建 Compose Screen：显示完成数、用时（可选）
    - 2) 提供“返回”按钮
    - 3) 提供“再学一组”按钮（可选）
  - **验证**：
    - [ ] 完成页 UI 正常显示
    - [ ] 返回按钮可导航回入口
  - **产物**：`LearningDoneScreen.kt`

- [ ] T103 [ST-001] 在 `app/src/main/java/com/jacky/verity/feature/learning/ui/session/` 中创建会话页骨架（LearningSessionScreen.kt，仅导航与返回确认）
  - **依赖**：T101、T102
  - **步骤**：
    - 1) 创建 Compose Screen 骨架（占位内容）
    - 2) 实现返回按钮与退出确认对话框
    - 3) 集成 Navigation 返回逻辑
  - **验证**：
    - [ ] 返回确认对话框正常显示
    - [ ] 退出确认后保存进度并返回
  - **产物**：`LearningSessionScreen.kt`

**检查点**：至此，Story ST-001 导航骨架应完整，可走通入口→会话→完成→返回流程

---

## 阶段 4：Story ST-002 - 卡片展示与答案显示（类型：Functional）

**目标**：展示当前单词卡片；答案默认隐藏；显示答案后展示释义与扩展区域占位

**验证方式（高层）**：UI 测试：进入后默认隐藏；点击后显示

**覆盖 FR/NFR**：FR-002

- [ ] T200 [P] [ST-002] 在 `app/src/main/java/com/jacky/verity/feature/learning/data/repository/` 中创建 WordRepository 实现（FakeWordRepository.kt，用于开发阶段）
  - **依赖**：T021
  - **步骤**：
    - 1) 实现 `WordRepository` 接口（Fake 实现）
    - 2) 返回 mock 的 `WordCardModel`（拼写、音标、释义、例句、图片引用）
    - 3) 支持模拟字段缺失场景
  - **验证**：
    - [ ] Fake 实现返回正确数据
    - [ ] 字段缺失场景可模拟
  - **产物**：`FakeWordRepository.kt`

- [ ] T201 [ST-002] 在 `app/src/main/java/com/jacky/verity/feature/learning/ui/session/card/` 中创建单词卡片组件（WordCard.kt）
  - **依赖**：T200
  - **步骤**：
    - 1) 创建 Compose 组件：显示单词拼写、音标
    - 2) 实现答案区域（默认隐藏，点击后显示释义）
    - 3) 实现扩展区域占位（图片/例句，待 ST-005/ST-007 完善）
    - 4) 支持可访问性（TalkBack 可聚焦）
  - **验证**：
    - [ ] 卡片 UI 正常显示
    - [ ] 答案默认隐藏
    - [ ] 点击后显示答案
    - [ ] TalkBack 可聚焦
  - **产物**：`WordCard.kt`

- [ ] T202 [ST-002] 在 `app/src/main/java/com/jacky/verity/feature/learning/vm/` 中实现 ViewModel 的卡片展示逻辑（LearningSessionViewModel.kt）
  - **依赖**：T201
  - **步骤**：
    - 1) 实现 `onRevealAnswer()` 事件处理（更新 `isAnswerRevealed`）
    - 2) 实现 `getWordCard` 调用（通过 UseCase）
    - 3) 更新 UiState 的 `card` 字段
  - **验证**：
    - [ ] 显示答案事件正常触发
    - [ ] UiState 更新正确
  - **产物**：`LearningSessionViewModel.kt`

**检查点**：至此，Story ST-002 应完整，卡片可展示且答案可显示/隐藏

---

## 阶段 5：Story ST-003 - 提交反馈管线（类型：Functional）

**目标**：提交一致性与可恢复，严格满足 FR-006

**验证方式（高层）**：模拟失败/超时；验证不跳题且可重试；验证进度更新

**覆盖 FR/NFR**：FR-003、FR-004、FR-006、NFR-REL-001

- [ ] T300 [P] [ST-003] 在 `app/src/main/java/com/jacky/verity/feature/learning/data/repository/` 中创建 StudyTaskRepository 实现（FakeStudyTaskRepository.kt，用于开发阶段）
  - **依赖**：T021
  - **步骤**：
    - 1) 实现 `StudyTaskRepository` 接口（Fake 实现）
    - 2) 支持模拟提交成功/失败/超时场景
    - 3) 实现错误分类（retryable vs notRetryable）
    - 4) 实现幂等去重（基于 sessionId + taskId + rating）
  - **验证**：
    - [ ] Fake 实现支持各种场景
    - [ ] 错误分类正确
    - [ ] 幂等去重生效
  - **产物**：`FakeStudyTaskRepository.kt`

- [ ] T301 [ST-003] 在 `app/src/main/java/com/jacky/verity/feature/learning/domain/usecase/` 中实现 SubmitRatingUseCase（SubmitRatingUseCase.kt）
  - **依赖**：T300
  - **步骤**：
    - 1) 实现提交反馈逻辑（调用 Repository）
    - 2) 处理错误分类（可重试/不可重试）
    - 3) 返回 Result<StudyTask?>（下一题，若无则 null）
  - **验证**：
    - [ ] 提交逻辑正确
    - [ ] 错误处理正确
  - **产物**：`SubmitRatingUseCase.kt`

- [ ] T302 [ST-003] 在 `app/src/main/java/com/jacky/verity/feature/learning/ui/session/` 中实现反馈按钮 UI（LearningSessionScreen.kt）
  - **依赖**：T301
  - **步骤**：
    - 1) 添加“认识/不认识/跳过”三个按钮
    - 2) 按钮点击触发 `onRate(rating)`
    - 3) 提交中显示加载态并禁用按钮
    - 4) 失败显示错误提示与重试按钮
  - **验证**：
    - [ ] 按钮 UI 正常显示
    - [ ] 提交中状态正确
    - [ ] 失败可重试
  - **产物**：`LearningSessionScreen.kt`

- [ ] T303 [ST-003] 在 `app/src/main/java/com/jacky/verity/feature/learning/vm/` 中实现 ViewModel 的提交逻辑与并发保护（LearningSessionViewModel.kt）
  - **依赖**：T302
  - **步骤**：
    - 1) 实现 `onRate(rating)` 事件处理
    - 2) 实现并发保护（Mutex/原子状态，确保同一题仅 1 次提交）
    - 3) 提交成功：更新进度、切题、重置答案状态
    - 4) 提交失败：停留当前题、显示错误、允许重试
  - **验证**：
    - [ ] 提交成功切题正确
    - [ ] 提交失败不跳题
    - [ ] 并发保护生效（快速连点不重复提交）
    - [ ] 进度更新正确
  - **产物**：`LearningSessionViewModel.kt`

- [ ] T304 [ST-003] 在 `app/src/main/java/com/jacky/verity/feature/learning/domain/usecase/` 中实现 GetNextTaskUseCase（GetNextTaskUseCase.kt）
  - **依赖**：T303
  - **步骤**：
    - 1) 实现获取下一题逻辑（调用 Repository）
    - 2) 处理空任务场景（返回 null）
    - 3) 处理失败场景（返回错误 Result）
  - **验证**：
    - [ ] 获取下一题逻辑正确
    - [ ] 空任务处理正确
  - **产物**：`GetNextTaskUseCase.kt`

**检查点**：至此，Story ST-003 应完整，提交反馈管线可正常工作，满足防重复提交与失败重试要求

---

## 阶段 6：Story ST-004 - 手势交互与一致性（类型：Functional）

**目标**：手势与按钮结果一致，且不会引入重复提交/误触不可控

**验证方式（高层）**：手势触发与按钮触发的结果一致；可在无障碍场景下弱化手势

**覆盖 FR/NFR**：FR-005

- [ ] T400 [ST-004] 在 `app/src/main/java/com/jacky/verity/feature/learning/ui/session/card/` 中实现手势检测（WordCard.kt）
  - **依赖**：T303
  - **步骤**：
    - 1) 使用 `Modifier.pointerInput` 实现左右滑动手势检测
    - 2) 左滑触发“认识”，右滑触发“不认识”
    - 3) 手势触发调用与按钮相同的 `onRate(rating)` 事件
    - 4) 支持可访问性模式下弱化手势（检测 TalkBack 是否启用）
  - **验证**：
    - [ ] 手势检测正常
    - [ ] 手势与按钮结果一致
    - [ ] 可访问性模式下手势弱化
  - **产物**：`WordCard.kt`

- [ ] T401 [ST-004] 验证手势与按钮的一致性（手动测试）
  - **依赖**：T400
  - **步骤**：
    - 1) 测试手势触发与按钮触发的结果一致
    - 2) 测试手势不会导致重复提交
    - 3) 测试误触场景（轻微滑动不触发）
  - **验证**：
    - [ ] 手势与按钮结果一致
    - [ ] 无重复提交
    - [ ] 误触控制合理
  - **产物**：测试报告

**检查点**：至此，Story ST-004 应完整，手势交互与按钮一致

---

## 阶段 7：Story ST-005 - 发音入口与播放接入（类型：Functional）

**目标**：播放失败不影响学习主流程；资源释放正确

**验证方式（高层）**：播放成功/失败/切后台停止；功耗 profiler 对比验证无异常唤醒

**覆盖 FR/NFR**：FR-009、NFR-POWER-001

- [ ] T500 [P] [ST-005] 在 `app/src/main/java/com/jacky/verity/feature/learning/data/repository/` 中创建 MediaRepository 实现（FakeMediaRepository.kt，用于开发阶段）
  - **依赖**：T021
  - **步骤**：
    - 1) 实现 `MediaRepository` 接口（Fake 实现）
    - 2) 支持模拟有/无发音资源场景
    - 3) 支持模拟播放成功/失败场景
  - **验证**：
    - [ ] Fake 实现支持各种场景
  - **产物**：`FakeMediaRepository.kt`

- [ ] T501 [ST-005] 在 `app/src/main/java/com/jacky/verity/feature/learning/domain/usecase/` 中实现 PlayPronunciationUseCase（PlayPronunciationUseCase.kt）
  - **依赖**：T500
  - **步骤**：
    - 1) 实现播放发音逻辑（调用 MediaRepository）
    - 2) 处理播放失败（不阻断学习主流程）
    - 3) 返回 Result<Unit>
  - **验证**：
    - [ ] 播放逻辑正确
    - [ ] 失败处理正确
  - **产物**：`PlayPronunciationUseCase.kt`

- [ ] T502 [ST-005] 在 `app/src/main/java/com/jacky/verity/feature/learning/ui/session/card/` 中实现发音入口 UI（WordCard.kt）
  - **依赖**：T501
  - **步骤**：
    - 1) 添加发音按钮（仅在 `hasPronunciation` 为 true 时显示）
    - 2) 无资源时隐藏或置灰并提示
    - 3) 播放中显示加载态
    - 4) 播放失败显示错误提示（不阻断学习）
  - **验证**：
    - [ ] 发音入口 UI 正常显示
    - [ ] 无资源时正确隐藏/置灰
    - [ ] 播放失败不阻断学习
  - **产物**：`WordCard.kt`

- [ ] T503 [ST-005] 在 `app/src/main/java/com/jacky/verity/feature/learning/vm/` 中实现 ViewModel 的播放逻辑与生命周期处理（LearningSessionViewModel.kt）
  - **依赖**：T502
  - **步骤**：
    - 1) 实现 `onPlayPronunciation()` 事件处理
    - 2) 在 `onStop`/`onPause` 时停止播放（释放资源）
    - 3) 处理音频焦点丢失（停止播放）
  - **验证**：
    - [ ] 播放逻辑正确
    - [ ] 生命周期处理正确（切后台停止播放）
    - [ ] 音频焦点处理正确
    - [ ] 功耗 profiler 验证无异常唤醒
  - **产物**：`LearningSessionViewModel.kt`

**检查点**：至此，Story ST-005 应完整，发音入口可正常工作，播放失败不影响学习主流程

---

## 阶段 8：Story ST-006 - 中断与恢复（类型：Infrastructure）

**目标**：满足“不回退超过 1 题”的恢复策略

**验证方式（高层）**：旋转/后台/进程回收后恢复；monkey 测试

**覆盖 FR/NFR**：FR-008、NFR-REL-002

- [ ] T600 [ST-006] 在 `app/src/main/java/com/jacky/verity/feature/learning/vm/` 中实现状态保存与恢复（LearningSessionViewModel.kt）
  - **依赖**：T303
  - **步骤**：
    - 1) 使用 `SavedStateHandle` 保存关键状态（currentTaskId、isAnswerRevealed、sessionId）
    - 2) 在 `init` 中恢复状态
    - 3) 使用 `rememberSaveable` 保存 UI 状态（Compose 侧）
  - **验证**：
    - [ ] 状态保存正确
    - [ ] 状态恢复正确
  - **产物**：`LearningSessionViewModel.kt`

- [ ] T601 [ST-006] 在 `app/src/main/java/com/jacky/verity/feature/learning/domain/usecase/` 中实现 ResumeSessionUseCase（ResumeSessionUseCase.kt）
  - **依赖**：T600
  - **步骤**：
    - 1) 实现恢复会话逻辑（从算法引擎获取当前任务）
    - 2) 处理恢复失败场景（使用默认参数或提示用户）
  - **验证**：
    - [ ] 恢复逻辑正确
    - [ ] 失败处理正确
  - **产物**：`ResumeSessionUseCase.kt`

- [ ] T602 [ST-006] 验证旋转/后台/进程回收恢复（手动测试 + monkey 测试）
  - **依赖**：T601
  - **步骤**：
    - 1) 测试旋转屏幕后恢复（当前题 + 答案显示状态）
    - 2) 测试切后台后恢复
    - 3) 测试进程回收后恢复（至少恢复到同一题，不回退超过 1 题）
    - 4) 运行 monkey 测试验证稳定性
  - **验证**：
    - [ ] 旋转恢复正确
    - [ ] 后台恢复正确
    - [ ] 进程回收恢复正确（不回退超过 1 题）
    - [ ] monkey 测试通过
  - **产物**：测试报告

**检查点**：至此，Story ST-006 应完整，中断与恢复功能可正常工作

---

## 阶段 9：Story ST-007 - 性能与内存预算落地（类型：Optimization）

**目标**：满足 NFR-PERF 与 NFR-MEM 门槛

**验证方式（高层）**：Frame metrics 长帧占比与 profiler 峰值内存验证

**覆盖 FR/NFR**：NFR-PERF-001、NFR-PERF-002、NFR-MEM-001

- [ ] T700 [ST-007] 在 `app/src/main/java/com/jacky/verity/feature/learning/ui/session/` 中引入图片加载库（Coil Compose）并配置采样策略（LearningSessionScreen.kt）
  - **依赖**：T202
  - **步骤**：
    - 1) 添加 Coil Compose 依赖
    - 2) 配置图片采样策略（限制最大解码尺寸）
    - 3) 配置占位图与错误图
    - 4) 实现图片缓存策略
  - **验证**：
    - [ ] 图片加载正常
    - [ ] 采样策略生效
  - **产物**：`LearningSessionScreen.kt`、Coil 配置

- [ ] T701 [ST-007] 优化 Compose 重组与动画（LearningSessionScreen.kt、WordCard.kt）
  - **依赖**：T700
  - **步骤**：
    - 1) 使用 `remember` 缓存计算结果
    - 2) 使用 `derivedStateOf` 减少不必要的重组
    - 3) 优化动画性能（减少昂贵动画）
    - 4) 使用 `LazyColumn` 等高效组件（若适用）
  - **验证**：
    - [ ] 重组次数减少
    - [ ] 动画流畅
  - **产物**：优化后的 Compose 代码

- [ ] T702 [ST-007] 建立性能验收脚本/口径（路径：`scripts/performance/` 或测试代码）
  - **依赖**：T701
  - **步骤**：
    - 1) 使用 Frame metrics / JankStats 统计长帧占比
    - 2) 建立首帧时间测量脚本（p95 ≤ 500ms）
    - 3) 建立切题 UI 更新时间测量脚本（p95 ≤ 100ms）
    - 4) 建立连续学习 30 题长帧占比测量脚本（≤ 1%）
  - **验证**：
    - [ ] 性能验收脚本可运行
    - [ ] 指标阈值与 plan.md A9 一致
  - **产物**：性能验收脚本/测试代码

- [ ] T703 [ST-007] 建立内存验收脚本/口径（路径：`scripts/memory/` 或测试代码）
  - **依赖**：T701
  - **步骤**：
    - 1) 使用 Android Studio Memory profiler 测量峰值内存
    - 2) 建立会话页进入→切 30 题→退出内存测量脚本
    - 3) 验证峰值内存 ≤ 30MB（含图片）
    - 4) 验证退出后内存回落（无泄漏）
  - **验证**：
    - [ ] 内存验收脚本可运行
    - [ ] 指标阈值与 plan.md A10 一致
  - **产物**：内存验收脚本/测试代码

- [ ] T704 [ST-007] 执行性能与内存验收（手动验证）
  - **依赖**：T702、T703
  - **步骤**：
    - 1) 运行性能验收脚本，验证首帧/切题/长帧占比满足阈值
    - 2) 运行内存验收脚本，验证峰值内存满足阈值
    - 3) 使用 Android Studio profiler 手工验证
  - **验证**：
    - [ ] 首帧 p95 ≤ 500ms
    - [ ] 切题 p95 ≤ 100ms
    - [ ] 长帧占比 ≤ 1%
    - [ ] 峰值内存 ≤ 30MB
    - [ ] 退出后内存回落
  - **产物**：性能与内存验收报告

**检查点**：至此，Story ST-007 应完整，性能与内存预算已落地并验收

---

## 阶段 10：Story ST-008 - 可观测性与隐私关卡（类型：Infrastructure）

**目标**：满足 NFR-OBS 与 NFR-SEC；为后续统计/游戏化复用事件口径

**验证方式（高层）**：审查事件字段；单测验证脱敏；手工验证关键路径都有事件

**覆盖 FR/NFR**：NFR-OBS-001、NFR-OBS-002、NFR-SEC-001

- [ ] T800 [P] [ST-008] 在 `app/src/main/java/com/jacky/verity/feature/learning/data/repository/` 中创建 EventRepository 接口与实现（EventRepository.kt、EventRepositoryImpl.kt）
  - **依赖**：T021
  - **步骤**：
    - 1) 定义 `EventRepository` 接口：`logEvent(eventName, fields)`
    - 2) 定义事件字段白名单（sessionType、wordId、taskId、rating、elapsedMs、errorType、retryCount）
    - 3) 实现字段脱敏逻辑（禁止记录释义/例句正文）
    - 4) 实现事件采样逻辑（可选）
  - **验证**：
    - [ ] 事件字段白名单正确
    - [ ] 脱敏逻辑正确
  - **产物**：`EventRepository.kt`、`EventRepositoryImpl.kt`

- [ ] T801 [ST-008] 在 `app/src/main/java/com/jacky/verity/feature/learning/vm/` 中实现关键事件记录（LearningSessionViewModel.kt）
  - **依赖**：T800
  - **步骤**：
    - 1) 记录“进入学习界面”事件（sessionType、wordId）
    - 2) 记录“显示答案”事件（wordId、elapsedMs）
    - 3) 记录“提交反馈”事件（wordId、rating、elapsedMs、retryCount）
    - 4) 记录“完成会话”事件（sessionType、completedCount、totalTime）
    - 5) 记录“提交失败”事件（wordId、errorType、retryable）
  - **验证**：
    - [ ] 所有关键事件已记录
    - [ ] 事件字段符合白名单
    - [ ] 无敏感内容文本
  - **产物**：`LearningSessionViewModel.kt`

- [ ] T802 [ST-008] 编写单测验证脱敏逻辑（路径：`app/src/test/java/com/jacky/verity/feature/learning/data/repository/EventRepositoryTest.kt`）
  - **依赖**：T801
  - **步骤**：
    - 1) 测试字段白名单验证（禁止记录非白名单字段）
    - 2) 测试脱敏逻辑（禁止记录释义/例句正文）
    - 3) 测试事件采样逻辑（若实现）
  - **验证**：
    - [ ] 单测通过
    - [ ] 脱敏逻辑正确
  - **产物**：`EventRepositoryTest.kt`

- [ ] T803 [ST-008] 手工验证关键路径都有事件（手动测试）
  - **依赖**：T802
  - **步骤**：
    - 1) 走通学习流程，检查所有关键路径都有事件记录
    - 2) 审查事件字段，确认无敏感内容
    - 3) 验证错误定位字段（sessionType、taskIndex、libraryId）可用
  - **验证**：
    - [ ] 所有关键路径都有事件
    - [ ] 事件字段无敏感内容
    - [ ] 错误定位字段可用
  - **产物**：事件验证报告

**检查点**：至此，Story ST-008 应完整，可观测性与隐私关卡已落地并验收

---

## 依赖关系与执行顺序

### 阶段依赖

- **环境搭建（阶段 1）**：无依赖——可立即启动
- **核心基础（阶段 2）**：依赖环境搭建完成——阻塞所有 Story
- **Story 阶段（阶段 3+）**：均依赖核心基础阶段完成
    - 完成后，部分 Story 可并行推进（ST-001、ST-002、ST-003、ST-005、ST-008 可并行）
    - 或按依赖顺序串行推进（ST-001/002/003 → ST-004 → ST-006 → ST-007）
- **优化完善（ST-007）**：可在 UI 初版后并行优化

### Story 依赖

- **ST-001**：依赖阶段 2 完成；可与 ST-002/003 并行
- **ST-002**：依赖阶段 2 完成；可与 ST-001/003/005 并行
- **ST-003**：依赖阶段 2 完成；可与 ST-001/002 并行；ST-004 依赖 ST-003
- **ST-004**：依赖 ST-003 完成
- **ST-005**：依赖阶段 2 完成；可与 ST-002 并行
- **ST-006**：依赖 ST-003 完成
- **ST-007**：依赖 ST-002 完成；可在 UI 初版后并行优化
- **ST-008**：依赖 ST-001/002/003 完成；可与 ST-001/002/003 并行（埋点可逐步添加）

### 单 Story 内部顺序

- 数据模型/接口定义先于实现
- Repository 接口先于实现
- UseCase 实现先于 ViewModel 集成
- ViewModel 集成先于 UI 集成
- UI 实现先于优化
- 验证任务（若有）必须先编写并确保执行失败后，再开展实现工作

### 并行执行场景

- 所有标记 [P] 的环境搭建任务可并行
- 所有标记 [P] 的核心基础任务可并行（阶段 2 内）
- 核心基础阶段完成后，ST-001、ST-002、ST-003、ST-005、ST-008 可并行启动（如团队容量允许）
- 单 Story 下所有标记 [P] 的任务可并行
- 不同团队成员可并行开发不同 Story

---

## 并行示例：Story ST-001

```bash
# 批量启动 ST-001 的可并行任务：
任务："T100 [P] [ST-001] 创建 Navigation 路由定义"
任务："T101 [ST-001] 创建学习入口页"
任务："T102 [ST-001] 创建完成页"
```

## 并行示例：Story ST-002

```bash
# 批量启动 ST-002 的可并行任务：
任务："T200 [P] [ST-002] 创建 WordRepository 实现（Fake）"
任务："T201 [ST-002] 创建单词卡片组件"
```

## 并行示例：Story ST-003

```bash
# 批量启动 ST-003 的可并行任务：
任务："T300 [P] [ST-003] 创建 StudyTaskRepository 实现（Fake）"
任务："T301 [ST-003] 实现 SubmitRatingUseCase"
任务："T304 [ST-003] 实现 GetNextTaskUseCase"
```

---

## 落地策略

### 先完成 MVP（优先完成关键 Story 集合）

1. 完成阶段 1：环境搭建
2. 完成阶段 2：核心基础（关键——阻塞所有 Story）
3. 完成阶段 3：Story ST-001（导航骨架）
4. 完成阶段 4：Story ST-002（卡片展示）
5. 完成阶段 5：Story ST-003（提交反馈）
6. **暂停并验证**：独立验证 ST-001/002/003 形成最小可用学习流程
7. 如就绪，进行部署/演示

### 增量交付

1. 完成环境搭建 + 核心基础 → 基础层就绪
2. 新增 ST-001/002/003 → 独立验证 → 部署/演示（MVP！）
3. 新增 ST-004 → 独立验证 → 部署/演示（手势增强）
4. 新增 ST-005 → 独立验证 → 部署/演示（发音功能）
5. 新增 ST-006 → 独立验证 → 部署/演示（恢复功能）
6. 新增 ST-007 → 独立验证 → 部署/演示（性能优化）
7. 新增 ST-008 → 独立验证 → 部署/演示（可观测性）
8. 每个 Story 均需在不破坏已有 Story 的前提下新增价值

### 团队并行策略

多开发者协作场景：

1. 团队共同完成环境搭建 + 核心基础
2. 核心基础完成后：
    - 开发者 A：负责 ST-001（导航骨架）
    - 开发者 B：负责 ST-002（卡片展示）
    - 开发者 C：负责 ST-003（提交反馈）
3. ST-001/002/003 完成后：
    - 开发者 A：负责 ST-004（手势交互）
    - 开发者 B：负责 ST-005（发音功能）
    - 开发者 C：负责 ST-006（恢复功能）
4. 最后阶段：
    - 开发者 A：负责 ST-007（性能优化）
    - 开发者 B：负责 ST-008（可观测性）
5. 各 Story 独立完成并集成

---

## 备注

- [P] 标记的任务 = 涉及不同文件，无依赖关系
- [ST-xxx] 标签将任务关联至 Plan 的 Story，便于追溯
- 每个 Story 需可独立完成、独立验证
- 实现前验证测试用例执行失败（若生成测试任务）
- 完成单个任务或逻辑分组后提交代码
- 可在任意检查点暂停，独立验证对应 Story
- 避免：模糊的任务描述、同一文件冲突、破坏独立性的跨 Story 依赖
- **重要**：所有任务必须严格遵循 Plan 的技术决策，不得擅自改写

---

## 任务汇总

- **任务总数**：约 50+ 个任务
- **Story 任务分布**：
  - ST-001：4 个任务
  - ST-002：3 个任务
  - ST-003：5 个任务
  - ST-004：2 个任务
  - ST-005：4 个任务
  - ST-006：3 个任务
  - ST-007：5 个任务
  - ST-008：4 个任务
- **可并行执行机会**：阶段 2 内多个任务可并行；ST-001/002/003/005/008 可并行启动
- **MVP 范围建议**：ST-001 + ST-002 + ST-003（形成最小可用学习流程）
