# Tasks：时间轴列表浏览

**Epic**：EPIC-004 - Android 端相册 App 一期
**Feature ID**：FEAT-001
**Feature Version**：v0.1.2（来自 `spec.md`）
**Plan Version**：v0.1.6（来自 `plan.md`）
**Tasks Version**：v0.1.0
**输入**：来自 `Feature 目录/` 的设计文档（`spec.md`、`plan.md`）

> 规则：
> - Task 只能拆解与执行 Plan 的既定 Story；**禁止**在 tasks.md 里改写 Plan 的技术决策或新增未决策的方案。
> - 每个 Task 必须包含：执行步骤、依赖关系（顺序/并行）、验证方式（可执行/可量化）。
> - 设计引用指向 plan.md 对应章节。

## Task 行格式（首行必须严格遵循）

```text
- [ ] T001 [P?] [ST-xxx] <带路径的任务标题>
```

- **复选框**：必须以 `- [ ]` 开头（完成后改为 `- [x]`）
- **任务 ID**：T001、T002…（全局递增）
- **[P]**：可并行执行（不改同一文件，且无依赖）
- **[ST-xxx]**：必须绑定到 Plan 中的 Story ID
- **路径**：必须写出影响的关键文件路径（真实路径）

## 路径约定（按 plan.md 结构决策）

- **feature-gallery 模块**：`feature-gallery/src/main/java/com/jacky/verity/gallery/`
- **包结构**：timeline/、data/、domain/（按 plan B7 源代码结构）
- **宿主**：`app/` 已有，需添加 feature-gallery 依赖

---

## 阶段 0：准备（版本/输入冻结）

**目标**：对齐版本、冻结设计输入，避免 Implement 期返工

- [ ] T001 在 `specs/epics/EPIC-004-android-gallery/features/FEAT-001-timeline-list/` 中核对 `spec.md`、`plan.md` 的 Version 字段一致性并补齐变更记录
  - **依赖**：无
  - **设计引用**：N/A
  - **步骤**：
    - 1) 确认 `Feature Version`（v0.1.2）、`Plan Version`（v0.1.6）已填写
    - 2) 确认 Plan 的 Story Breakdown 已完成（ST-001～ST-005）
  - **验证**：
    - [ ] tasks.md 中 `Plan Version` 与 plan.md 一致
  - **产物**：`spec.md`、`plan.md`、`tasks.md`

---

## 阶段 1：环境搭建（共享基础设施）

**目标**：项目初始化与 feature-gallery 模块基础结构搭建

- [ ] T010 按照 plan.md B7 创建 feature-gallery 模块目录结构（路径：`feature-gallery/`、`feature-gallery/src/main/java/com/jacky/verity/gallery/`）
  - **依赖**：T001
  - **设计引用**：plan.md:B7:源代码结构
  - **步骤**：
    - 1) 创建 `feature-gallery/` 模块根目录
    - 2) 创建 `feature-gallery/src/main/java/com/jacky/verity/gallery/timeline/`、`data/`、`domain/` 包目录
    - 3) 确保与 plan B7 结构一致
  - **验证**：
    - [ ] 目录结构与 plan.md B7 一致
  - **产物**：`feature-gallery/` 目录树

- [ ] T011 在 `feature-gallery/build.gradle.kts` 中配置 Kotlin、Compose、Paging3、Coil 等依赖；在 `settings.gradle.kts` 中 include feature-gallery；在 `app/build.gradle.kts` 中添加 implementation(project(":feature-gallery"))
  - **依赖**：T010
  - **设计引用**：plan.md:A1:技术方案选型（Paging 3、Coil）
  - **步骤**：
    - 1) 创建 `feature-gallery/build.gradle.kts`，配置 android library、compose、paging、coil 等
    - 2) 在 `settings.gradle.kts` 添加 `include(":feature-gallery")`
    - 3) 在 `app/build.gradle.kts` 添加 `implementation(project(":feature-gallery"))`
  - **验证**：
    - [ ] `./gradlew :feature-gallery:compileDebugKotlin` 通过
  - **产物**：`feature-gallery/build.gradle.kts`、`settings.gradle.kts`、`app/build.gradle.kts`

- [ ] T012 [P] 配置代码检查与格式化（路径：`build.gradle.kts`、`feature-gallery/build.gradle.kts` 或根目录 `ktlint`/`detekt` 配置）
  - **依赖**：T011
  - **设计引用**：N/A
  - **步骤**：
    - 1) 按项目既有规范配置 ktlint 或 detekt
    - 2) 确保 feature-gallery 纳入检查范围
  - **验证**：
    - [ ] `./gradlew lint` 或等价命令可运行
  - **产物**：配置文件

---

## 阶段 2：核心基础（阻塞性前置条件）

**目标**：所有 Story 实现前必须完成的基础设施，按 Plan-B 架构约束

- [ ] T020 搭建公共基础设施：在 `feature-gallery/` 内建立 DDD 分层边界与依赖方向（domain 不依赖 data/ui；data 实现 domain 接口）；配置 Dispatchers.IO 与错误类型（TimelineError sealed 类）
  - **依赖**：T012
  - **设计引用**：plan.md:A3.1.1:分层架构、A0.3:DDD 与 7 大原则
  - **步骤**：
    - 1) 在 `feature-gallery/.../domain/` 定义 TimelineError（PermissionDenied、MediaStoreUnavailable、Unknown）
    - 2) 确认各层依赖方向符合 plan 约束
  - **验证**：
    - [ ] domain 层无 Android/data 依赖
    - [ ] 与 Plan-B 分层约束一致
  - **产物**：`domain/TimelineError.kt`、分层结构

**检查点**：基础层就绪——Story 实现可启动

---

## 阶段 3：Story ST-001 - 数据库与媒体库数据访问基础设施（类型：Infrastructure）

**目标**：MediaRepository.getMediaPager 可返回 Flow<PagingData<MediaItem>>，供 UI 消费

**验证方式**：单元测试 MediaStoreDataSource.load；集成测试 Repository 返回有效 PagingData；NFR-REL-001 权限拒绝时降级

- [ ] T030 [P] [ST-001] 在 `feature-gallery/.../domain/MediaItem.kt` 中创建 MediaItem 实体（id, contentUri, dateTaken, mimeType 等，不可变 data class）
  - **依赖**：T020
  - **设计引用**：plan.md:A0.1:MediaItem、A3.1.2.1:组件清单
  - **步骤**：
    - 1) 定义 MediaItem data class，含 plan 约定字段
    - 2) 确保不可变
  - **验证**：
    - [ ] 编译通过
  - **产物**：`domain/MediaItem.kt`

- [ ] T031 [P] [ST-001] 在 `feature-gallery/.../domain/MediaRepository.kt` 中定义 MediaRepository 接口（getMediaPager(viewMode, filter): Flow<PagingData<MediaItem>>）
  - **依赖**：T020
  - **设计引用**：plan.md:B4.1:MediaRepository 接口、A3.1.2.1
  - **步骤**：
    - 1) 定义接口方法签名
    - 2) 按 plan 不暴露 DataSource
  - **验证**：
    - [ ] 接口与 plan B4.1 一致
  - **产物**：`domain/MediaRepository.kt`

- [ ] T032 [ST-001] 在 `feature-gallery/.../data/MediaStoreDataSource.kt` 中实现 MediaStore ContentResolver 封装，支持 query、投影、排序、分页参数
  - **依赖**：T030、T031
  - **设计引用**：plan.md:A3.1.2.2:时序图、A3.1.2.1:MediaStoreDataSource
  - **步骤**：
    - 1) 实现 load 方法，查询 MediaStore
    - 2) 处理 READ_MEDIA_IMAGES 权限拒绝（SecurityException → 降级）
    - 3) 支持 viewMode、filter 条件
  - **验证**：
    - [ ] 单元测试 MediaStoreDataSource.load（可用 Robolectric 或 ContentProvider mock）
  - **产物**：`data/MediaStoreDataSource.kt`

- [ ] T033 [ST-001] 在 `feature-gallery/.../data/MediaRepositoryImpl.kt` 中实现 MediaRepository，组合 MediaStoreDataSource，使用 Paging 3 返回 Flow<PagingData<MediaItem>>
  - **依赖**：T032、T031
  - **设计引用**：plan.md:A3.1.2.2:时序图、A1:Paging 3
  - **步骤**：
    - 1) 实现 getMediaPager，委托 DataSource
    - 2) 配置 PagingSource、Pager
    - 3) 异常映射为 TimelineError
  - **验证**：
    - [ ] 集成测试：Repository 返回有效 PagingData
    - [ ] 无权限时返回 Error 态，不崩溃（NFR-REL-001）
  - **产物**：`data/MediaRepositoryImpl.kt`

**检查点**：ST-001 完成，MediaRepository 可用

---

## 阶段 4：Story ST-002 - TimelineViewModel 与 MVI 状态管理（类型：Functional）

**目标**：StateFlow 正确输出 state；视图切换有自然过渡且焦点保持

**验证方式**：单元测试 reduce 逻辑；集成测试视图切换焦点保持；NFR-PERF-003

- [ ] T040 [P] [ST-002] 在 `feature-gallery/.../domain/MediaViewerContext.kt` 中定义 MediaViewerContext 值对象（itemList, currentIndex, source）
  - **依赖**：T033
  - **设计引用**：plan.md:B4.1:MediaViewerContext 契约
  - **步骤**：
    - 1) 定义 data class，不可变
    - 2) source 为 "timeline"/"album"/"search"
  - **验证**：
    - [ ] 与 plan B4.1 契约一致
  - **产物**：`domain/MediaViewerContext.kt`

- [ ] T041 [P] [ST-002] 在 `feature-gallery/.../timeline/TimelineIntent.kt` 中定义 sealed TimelineIntent（LoadTimeline、ChangeViewMode、ChangeFilter、OnPhotoClick、OnThumbDrag）
  - **依赖**：T020
  - **设计引用**：plan.md:A3.2.2:TimelineIntent
  - **步骤**：
    - 1) 按 plan 定义各 Intent
  - **验证**：
    - [ ] 编译通过
  - **产物**：`timeline/TimelineIntent.kt`

- [ ] T042 [P] [ST-002] 在 `feature-gallery/.../timeline/TimelineUiState.kt` 中定义 TimelineUiState（items, viewMode, filter, showPermissionPrompt, dateLabelForThumb, focusedItemIndex 等）
  - **依赖**：T020
  - **设计引用**：plan.md:A3.2.2:TimelineUiState
  - **步骤**：
    - 1) 定义 data class，含视图切换焦点保持所需字段
  - **验证**：
    - [ ] 与 plan 一致
  - **产物**：`timeline/TimelineUiState.kt`

- [ ] T043 [ST-002] 在 `feature-gallery/.../timeline/TimelineViewModel.kt` 中实现 TimelineViewModel：处理 LoadTimeline、ChangeViewMode、ChangeFilter、OnPhotoClick、OnThumbDrag；实现 recordFocusedItem、scrollToFocusedItemInNewViewMode 以支持视图切换焦点保持
  - **依赖**：T041、T042、T033、T040
  - **设计引用**：plan.md:A3.2.1:流程 2、A3.2.2:TimelineViewModel、ST-002 描述
  - **步骤**：
    - 1) 注入 MediaRepository
    - 2) 实现 MVI reduce 逻辑
    - 3) 视图切换时记录 focusedItem，切换后定位并 animateScrollToItem
  - **验证**：
    - [ ] 单元测试 reduce 逻辑
    - [ ] 集成测试：切换日/月/年视图后视觉焦点保持（NFR-PERF-003）
  - **产物**：`timeline/TimelineViewModel.kt`

**检查点**：ST-002 完成，ViewModel 与 MediaViewerContext 可用

---

## 阶段 5：Story ST-003 - 时间轴列表 UI（类型：Functional）

**目标**：UI 渲染符合 ux-design；快滑条与日期显示符合规范

**验证方式**：UI 测试；快滑条交互、日期格式多语言验证；NFR-PERF-001

- [ ] T050 [ST-003] 在 `feature-gallery/.../timeline/TimelineScreen.kt` 中实现 TimelineScreen Compose UI：LazyVerticalGrid + 分组标题；日/月/年 SegmentedBar；多语言日期格式化（今天/昨天/完整日期、月、年）
  - **依赖**：T043
  - **设计引用**：plan.md:A3.2.1:流程 1、spec:日期显示与快滑条规范
  - **步骤**：
    - 1) 使用 LazyVerticalGrid 展示分组媒体项
    - 2) 日/月/年 Tab 切换
    - 3) 日期格式遵循 Locale（FR-007）
  - **验证**：
    - [ ] 切换系统语言/区域后日期格式正确
  - **产物**：`timeline/TimelineScreen.kt`

- [ ] T051 [ST-003] 在 `feature-gallery/.../timeline/` 中实现快滑条组件：thumb 位于列表右侧，左侧显示当前滑动位置对应行的日期气泡
  - **依赖**：T050
  - **设计引用**：plan.md:spec:快滑条规范、FR-004
  - **步骤**：
    - 1) 快滑条 thumb 右侧
    - 2) 左侧日期气泡，格式与当前 viewMode 一致
  - **验证**：
    - [ ] 快滑条交互与规范一致
  - **产物**：快滑条组件（可在 TimelineScreen 内或独立 Composable）

- [ ] T052 [ST-003] 在 TimelineScreen 中集成筛选入口与筛选条件 Chip
  - **依赖**：T050
  - **设计引用**：plan.md:FR-005
  - **步骤**：
    - 1) 筛选入口（如仅照片、按类型）
    - 2) 与 ViewModel filter 联动
  - **验证**：
    - [ ] 筛选后列表正确过滤
  - **产物**：`timeline/TimelineScreen.kt` 更新

**检查点**：ST-003 完成，时间轴列表 UI 可用

---

## 阶段 6：Story ST-004 - 缩图加载与即滑即现优化（类型：Optimization）

**目标**：缩图即滑即现，无白块

**验证方式**：滚动流畅度测试；内存 profiling；NFR-PERF-002、NFR-MEM-001

- [ ] T060 [ST-004] 在 `feature-gallery/` 中集成 Coil，在 TimelineScreen 网格项使用 AsyncImage + ContentUri 加载缩图
  - **依赖**：T052
  - **设计引用**：plan.md:A1:Coil、B4.2:Coil ImageLoader
  - **步骤**：
    - 1) 添加 Coil 依赖
    - 2) AsyncImage(contentUri)，placeholder 策略
  - **验证**：
    - [ ] 缩图可加载
  - **产物**：`timeline/TimelineScreen.kt`、Coil 配置

- [ ] T061 [ST-004] 调优 Paging pageSize、prefetchDistance；验证滚动无白块
  - **依赖**：T060
  - **设计引用**：plan.md:ST-004、NFR-PERF-002
  - **步骤**：
    - 1) 调整 Pager 参数
    - 2) 手动滚动验证无白块
  - **验证**：
    - [ ] 即滑即现，无白块
    - [ ] 内存 profiling 无异常增长（NFR-MEM-001）
  - **产物**：调优参数、验收记录

**检查点**：ST-004 完成，列表性能达标

---

## 阶段 7：Story ST-005 - 进入大图导航与 MediaViewerContext（类型：Functional）

**目标**：点击照片可进入大图

**验证方式**：端到端测试点击进入大图；FEAT-004 承接大图路由

- [ ] T070 [ST-005] 在 `feature-gallery/.../timeline/TimelineScreen.kt` 中实现点击照片：构建 MediaViewerContext(itemList, currentIndex, source="timeline")，导航至大图路由
  - **依赖**：T052、T043
  - **设计引用**：plan.md:B4.1:MediaViewerContext、A3.2.1:流程、ST-005
  - **步骤**：
    - 1) 点击时从 ViewModel 获取 itemList（LazyPagingItems.snapshot 或 ViewModel 维护）
    - 2) 构建 MediaViewerContext
    - 3) 调用导航（NavController 或回调至 app 层）
  - **验证**：
    - [ ] 点击照片可导航至大图路由（大图由 FEAT-004 实现，本 Feature 仅提供入口与 context）
  - **产物**：`timeline/TimelineScreen.kt`、导航集成

**检查点**：ST-005 完成，进入大图入口可用

---

## 阶段 8：优化与跨领域关注点

**目标**：NFR 验收、空态与权限引导

- [ ] T080 在 TimelineScreen 中实现空态（无照片）与权限引导（无权限时展示引导授权），不崩溃
  - **依赖**：T052
  - **设计引用**：plan.md:A3.2.1:流程 1、EX-001/EX-002、NFR-REL-001
  - **步骤**：
    - 1) State 无数据时显示空态
    - 2) State.showPermissionPrompt 时显示引导
  - **验证**：
    - [ ] 无权限/无数据时正确展示，不崩溃
  - **产物**：`timeline/TimelineScreen.kt` 更新

- [ ] T081 在 `app/` 或导航层注册 TimelineScreen 路由，并接入主导航（若 EPIC 已有主导航结构）
  - **依赖**：T070
  - **设计引用**：plan.md:B7、epic ux-design
  - **步骤**：
    - 1) 注册时间轴路由
    - 2) 与 app 主导航集成
  - **验证**：
    - [ ] 可从 app 进入时间轴列表
  - **产物**：`app/` 导航配置

---

## 依赖关系与执行顺序

### 阶段依赖

- **阶段 0**：无依赖
- **阶段 1**：依赖 T001
- **阶段 2**：依赖阶段 1
- **阶段 3（ST-001）**：依赖阶段 2
- **阶段 4（ST-002）**：依赖 ST-001
- **阶段 5（ST-003）**：依赖 ST-002
- **阶段 6（ST-004）**：依赖 ST-003
- **阶段 7（ST-005）**：依赖 ST-002、ST-003（可与 ST-004 并行）
- **阶段 8**：依赖 ST-003、ST-005

### Story 依赖

- **ST-001**：无
- **ST-002**：ST-001
- **ST-003**：ST-002
- **ST-004**：ST-003
- **ST-005**：ST-002、ST-003（可与 ST-004 并行）

### 并行执行场景

- T030、T031 可并行（ST-001 内）
- T040、T041、T042 可并行（ST-002 内）
- ST-005 可与 ST-004 并行（不同改动路径）

---

## 并行示例：Story ST-001

```text
可并行：T030 [ST-001] MediaItem.kt、T031 [ST-001] MediaRepository.kt
```

## 并行示例：Story ST-002

```text
可并行：T040 MediaViewerContext.kt、T041 TimelineIntent.kt、T042 TimelineUiState.kt
```

---

## 落地策略

### MVP 范围

1. 阶段 0～2：准备 + 环境搭建 + 核心基础
2. ST-001：MediaRepository 可用
3. ST-002：ViewModel 与 MVI
4. ST-003：时间轴列表 UI（最小可演示）

### 增量交付

1. ST-001 完成 → 数据层可复用（FEAT-002、003 依赖）
2. ST-002 + ST-003 完成 → 列表可浏览
3. ST-004 完成 → 性能达标
4. ST-005 完成 → 进入大图入口就绪

---

## 备注

- 每个 Task 含设计引用，指向 plan.md 对应章节
- ST-005 进入大图具体实现由 FEAT-004 承接
- MediaRepository、MediaViewerContext 为 FEAT-002、003、004 共享契约
