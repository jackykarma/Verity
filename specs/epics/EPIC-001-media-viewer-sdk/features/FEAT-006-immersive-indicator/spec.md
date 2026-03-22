# Feature 规格说明：沉浸式体验与 Indicator

**Epic**：EPIC-001 - Android 媒体浏览 SDK
**Feature 类型**：Product Feature
**Feature ID**：FEAT-006
**Feature Version**：v0.1.0
**EPIC 分支**：`epic/EPIC-001-media-viewer-sdk`
**Feature 目录**：`specs/epics/EPIC-001-media-viewer-sdk/features/FEAT-006-immersive-indicator/`
**创建时间**：2026-03-22
**状态**：草稿
**输入**：用户描述：`"沉浸式体验与 Indicator"`

---

## 背景与价值

- **背景**：媒体浏览场景中，系统状态栏和导航栏会压缩可视区域，内容无法延伸至全面屏边缘；同时在多 Item 场景下用户缺乏直观的页面位置感知手段，默认位置指示器样式也难以满足不同接入方的设计语言需求。
- **目标**：让 SDK 容器内容延伸至系统栏下方（edge-to-edge），向接入方透传 insets 数值；提供可扩展的 Indicator 机制，支持默认样式与完全自定义替换；通过单击回调将系统栏显隐控制权下放给接入方。
- **价值**：用户获得沉浸式全面屏浏览体验；接入方无需深入系统 API 即可感知 insets 变化；Indicator 的开放扩展使接入方的设计系统可无缝嵌入 SDK，降低集成成本。
- **范围（In Scope）**：
  - SDK 容器支持 edge-to-edge 布局，内容延伸至状态栏和导航栏下方（宿主 Activity 已启用 edge-to-edge 为前提）
  - SDK 向接入方透传当前系统栏 WindowInsets 数值
  - 单击 Item 非媒体交互区域触发 `onTapOutsideMedia` 回调；媒体手势（缩放/平移/旋转）及长按实况图不触发
  - SDK 不直接操作系统栏显隐，仅提供回调；系统栏控制权归属接入方
  - SDK 提供默认横线样式 Indicator，当前页高亮，默认底部距屏幕底部 24dp
  - 接入方可注册自定义 `IndicatorAdapter` 完全替换默认样式
  - SDK 在翻页与幻灯片进度变化时回调 `IndicatorAdapter`
  - Indicator 支持进度显示（0.0～1.0）
  - `setIndicatorVisible(Boolean)` 控制 Indicator 整体显隐
  - Indicator 支持脱离 SDK 容器独立放置
- **范围外（Out of Scope）**：
  - 系统栏（状态栏/导航栏）的显隐操作（由接入方通过 `WindowInsetsController` 执行，SDK 仅提供回调）
  - 菜单 UI 实现（由接入方实现）
  - 幻灯片计时逻辑（归属 FEAT-007，由 FEAT-007 向本 Feature Indicator 推送进度）

---

## 依赖关系

- **上游依赖**：
  - **FEAT-002**（Media Pager）：Indicator 需要翻页事件（当前页索引、总页数）；翻页事件由 FEAT-002 内部回调接口提供，本 Feature 不重复定义翻页逻辑
  - **FEAT-007**（幻灯片，间接依赖）：幻灯片进度由 FEAT-007 负责计时并推送至本 Feature `IndicatorAdapter.onProgressChanged`
  - 宿主 Activity 需已通过 `WindowCompat.setDecorFitsSystemWindows(window, false)` 或等效方式启用 edge-to-edge，SDK 内容延伸功能才能生效
- **下游影响**：
  - **FEAT-007**（幻灯片）：依赖本 Feature 的 `IndicatorAdapter` 接口接收进度回调，驱动自定义进度条 UI
  - **FEAT-009**（事件回调）：`onTapOutsideMedia` 属于 SDK 回调体系，需与 FEAT-009 统一接口命名与交付时机
  - 接入方 Activity/Fragment：接收 insets 回调后需自行调整菜单、Indicator 等 UI 元素的布局边距
- **外部依赖故障模式**：
  - 宿主 Activity 未启用 edge-to-edge：SDK 容器内容不延伸至系统栏下方，表现为普通布局；SDK 不崩溃，功能退化为非沉浸模式，insets 回调仍传递（值为系统默认或 0）
  - WindowInsets 回调在特定厂商 ROM 上返回不一致数值：接入方 UI 位置可能偏移，属接入方兜底范畴；SDK 透传原始系统值，不做修正

> 本 Feature 依赖 FEAT-002 提供翻页事件能力，接入契约为 FEAT-002 内部翻页回调接口；本 Feature 不重复定义翻页逻辑。

---

## 验收与场景

> 本节描述可测试的功能验收场景，技术 Story 在 Plan 阶段拆分。

### 核心用户旅程

#### 旅程 1 - 沉浸模式切换（点击区域触发菜单显隐）

- **描述**：用户在浏览媒体时，点击 Item 内非媒体区域（如背景、边框），接入方接收 `onTapOutsideMedia` 回调并切换菜单及系统栏的显隐状态，媒体内容全程延伸至系统栏下方无黑边。
- **成功信号**：用户点击后菜单切换显隐，系统栏切换显隐，内容区域无黑边跳变；媒体缩放/平移等手势不触发菜单。
- **验收场景**：
  1. **前提** 宿主 Activity 已启用 edge-to-edge，SDK 容器处于显示状态，**当** 用户进入媒体浏览页，**则** 媒体内容延伸至状态栏和导航栏下方，无黑边（AC-049）。
  2. **前提** 媒体处于正常浏览状态（未放大），**当** 用户单击 Item 背景区域，**则** `onTapOutsideMedia` 回调被触发恰好 1 次（AC-050）。
  3. **前提** 用户对图片执行双指缩放手势，**当** 手势结束，**则** `onTapOutsideMedia` 未被触发（AC-050）。
  4. **前提** 用户长按实况图（Live Photo）触发实况播放，**当** 长按期间，**则** `onTapOutsideMedia` 未被触发（AC-050）。
  5. **前提** SDK 已正确处理 WindowInsets，**当** 系统栏显隐状态切换，**则** SDK 回调中 insets 数值实时更新，接入方可据此重新调整 UI 位置（AC-052）。

#### 旅程 2 - Indicator 翻页同步与幻灯片进度

- **描述**：用户在多图媒体列表中左右翻页，底部 Indicator 同步高亮当前页对应单元；幻灯片自动播放时，当前单元显示时间进度填充动画；接入方可注册自定义 `IndicatorAdapter` 完全接管 Indicator 样式。
- **成功信号**：翻页后正确的 Indicator 单元被激活高亮；幻灯片模式下进度填充动画流畅无卡顿；注册自定义 `IndicatorAdapter` 后默认 Indicator 消失，自定义视图接管全部更新。
- **验收场景**：
  1. **前提** SDK 默认 Indicator 可见，共有 5 个 Item，**当** 用户翻到第 3 页，**则** 第 3 个 Indicator 单元高亮，其余不高亮（AC-053、AC-054）。
  2. **前提** 幻灯片自动播放模式激活，**当** 当前 Item 播放进度从 0 推进到 1，**则** Indicator 当前单元显示对应进度填充，帧率 ≥ 60fps（AC-055、NFR-PERF-001）。
  3. **前提** 接入方已注册自定义 `IndicatorAdapter`，**当** SDK 初始化完成，**则** 默认 Indicator 不显示，自定义 Adapter 接收翻页与进度回调，参数正确（AC-056）。
  4. **前提** Indicator 处于可见状态，**当** 接入方调用 `setIndicatorVisible(false)`，**则** Indicator 立即隐藏；调用 `setIndicatorVisible(true)` 后恢复显示（AC-051、AC-057）。
  5. **前提** 接入方将自定义 Indicator View 放置于 SDK 容器外部任意布局位置，**当** 翻页或进度变化，**则** 外部 Indicator View 通过 Adapter 回调正确驱动更新（FR-009）。

### 边界与异常场景

- **宿主 Activity 未启用 edge-to-edge**：SDK 容器内容不延伸至系统栏下方，呈现为普通非沉浸布局；SDK 不崩溃、不抛出异常，仅功能退化；insets 回调仍正常传递（值为系统默认）。
- **未注册 `onTapOutsideMedia` 回调**：用户点击非媒体区域时，SDK 内部不报错，不触发任何默认行为；接入方不注册即表示不关心该事件。
- **未注册自定义 `IndicatorAdapter`**：SDK 显示默认横线样式 Indicator，所有回调逻辑由 SDK 内部处理，接入方无需任何配置。
- **Item 数量为 1**：Indicator 渲染单个单元（或自定义 Adapter 接收 `itemCount=1` 回调），不崩溃。
- **Item 数量为 0**：Indicator 不显示任何单元，`setIndicatorVisible` 调用不崩溃。
- **幻灯片进度回调线程**：`IndicatorAdapter` 的所有回调方法须在主线程（UI 线程）执行，确保接入方可在回调中直接操作 View。
- **快速连续翻页（手势未完全稳定）**：Indicator 状态跟随最终落页更新，不出现闪烁或残留高亮。
- **Activity 旋转/配置变更**：edge-to-edge 状态和 insets 回调在重建后自动恢复；Indicator 当前页索引跟随 SDK 内部状态恢复机制保持正确，不出现页码错位或 Indicator 消失。

---

## FR / NFR

### FR（Functional Requirements）

- **FR-001**：SDK 容器必须支持 edge-to-edge 布局，当宿主 Activity 已启用 `WindowCompat.setDecorFitsSystemWindows(window, false)` 时，SDK 容器内的媒体内容必须延伸至状态栏和导航栏下方，无黑边遮挡。
- **FR-002**：当系统栏 WindowInsets 发生变化时，SDK 必须通过回调接口向接入方透传最新的 insets 数值（top/bottom/left/right 像素值），接入方可据此动态调整菜单、Indicator 等 UI 元素的位置。
- **FR-003**：当用户单击 Item 内的非媒体交互区域（背景、边框等空白区域）时，SDK 必须触发 `onTapOutsideMedia` 回调，且每次有效单击触发且仅触发 1 次。
- **FR-004**：媒体手势操作（缩放、平移、旋转）期间，SDK 必须不触发 `onTapOutsideMedia` 回调；长按实况图触发实况播放期间同样不触发。
- **FR-005**：SDK 不得自行调用 `WindowInsetsController` 操作系统栏显隐，系统栏控制权完全归属接入方；SDK 仅提供 `onTapOutsideMedia` 回调作为触发时机。
- **FR-006**：SDK 必须提供默认 Indicator，样式为多单元横排横线，当前激活页对应单元高亮显示，默认放置于 SDK 容器底部，距屏幕底部 24dp；Item 总数变化时单元数量自动同步。
- **FR-007**：SDK 必须提供 `IndicatorAdapter` 接口，接入方注册后，默认 Indicator 样式必须被完全替换；SDK 通过该接口回调翻页事件（当前页索引、总页数）和幻灯片进度（0.0～1.0）。
- **FR-008**：SDK 必须在翻页时于主线程回调 `IndicatorAdapter.onPageChanged(currentIndex: Int, itemCount: Int)`，在幻灯片进度变化时于主线程回调 `IndicatorAdapter.onProgressChanged(progress: Float)`。
- **FR-009**：Indicator 必须支持脱离 SDK 容器独立放置：接入方可将自定义 Indicator View 放置于任意外部布局位置，通过 `IndicatorAdapter` 回调驱动更新，SDK 不强制要求 Indicator 在容器内部。
- **FR-010**：SDK 必须提供 `setIndicatorVisible(visible: Boolean)` 方法，调用 `false` 后 Indicator（含默认与自定义）整体立即隐藏，调用 `true` 后立即恢复显示，多次调用不崩溃。
- **FR-011**：Indicator 必须支持进度显示（0.0～1.0），在幻灯片自动播放场景下，当前页单元需随进度推进显示填充动画；进度值由 FEAT-007 通过 `IndicatorAdapter.onProgressChanged` 推送。

### NFR（Non-Functional Requirements）

#### 性能（Performance）

- **NFR-PERF-001**：Indicator 进度填充动画帧率必须 ≥ 60fps（在测试机正常负载下）；Android 11 及以上设备可自适应达到 90/120fps；验收方式：使用 Android Profiler 或 Perfetto 采集帧间隔，确认 p99 帧耗时 ≤ 16.6ms（60fps 基准）。
- **NFR-PERF-002**：`onTapOutsideMedia` 回调从用户手势抬起（ACTION_UP）到回调触发的端到端延迟 p95 ≤ 50ms；验收方式：埋点计时或 Systrace 测量手势事件到回调触发间隔。

#### 功耗（Power）

- **NFR-POWER-001**：Indicator 进度动画由 FEAT-007 推送驱动，SDK 不额外启动独立计时器或 Coroutine 循环；非幻灯片场景下 Indicator 无持续后台任务，本 Feature 额外功耗增量为 0；验收方式：Battery Historian 确认无额外 WakeLock 或持续 CPU 唤醒。

#### 内存（Memory）

- **NFR-MEM-001**：默认 Indicator View 的内存占用增量 ≤ 2MB（含 View 树、绘制缓存）；`IndicatorAdapter` 注册后 SDK 持有弱引用，Activity 销毁时自动解除，不造成内存泄漏；验收方式：LeakCanary 验证无泄漏，Android Profiler Heap Dump 确认增量在阈值内。

#### 安全与隐私（Security/Privacy）

- **NFR-SEC-001**：SDK 不读取、不上报接入方菜单 UI 的任何内容或布局信息；透传给接入方的 insets 数值仅为只读系统数值，SDK 不修改原始值，不缓存接入方传入的任何 View 引用超出其生命周期范围。
- **NFR-SEC-002**：`IndicatorAdapter` 回调不携带任何用户隐私数据（仅页码索引 Int 和 0.0～1.0 进度浮点数），接入方无需申请任何额外系统权限即可使用本 Feature 全部功能。

#### 可观测性（Observability）

- **NFR-OBS-001**：SDK 必须在以下场景输出 Debug 级别日志（TAG 统一为 `MediaViewer-Indicator`）：`IndicatorAdapter` 注册/注销事件、`setIndicatorVisible` 调用、insets 数值每次变化（仅 Debug 构建输出 insets 变化日志）。
- **NFR-OBS-002**：`onTapOutsideMedia` 每次触发时必须输出 Debug 日志，注明触发坐标（x, y）及当前页索引，便于接入方排查误触问题；正式发布构建（Release）同样保留该日志（非敏感数据）。

#### 可靠性（Reliability）

- **NFR-REL-001**：edge-to-edge 适配必须在 Android 8.0（API 26）及以上所有系统版本正确工作；API 26～28 使用 `WindowInsetsCompat`（Jetpack AndroidX）实现，不因 API 版本差异崩溃；验收方式：在 API 26 模拟器及真机上运行验收场景 AC-049、AC-052。
- **NFR-REL-002**：`IndicatorAdapter` 回调执行时，若接入方侧抛出异常，SDK 必须在 try-catch 中捕获并以 Error 级别日志记录，不允许因接入方回调异常导致 SDK 内部崩溃（防御性调用）。
- **NFR-REL-003**：Activity 旋转等配置变更后，Indicator 当前页索引、可见状态必须正确恢复，不出现页码错位或 Indicator 消失；验收方式：在浏览第 N 页时旋转屏幕，确认 Indicator 仍高亮第 N 个单元。

---

## 验收标准（Feature Level）

- **AC-049**：（引用 FR-001）在宿主 Activity 已启用 edge-to-edge 的前提下，SDK 容器内媒体内容延伸至状态栏和导航栏下方，视觉上无黑边遮挡区域；在 API 26 及以上系统均可验证通过。
- **AC-050**：（引用 FR-003、FR-004）单击 Item 非媒体区域时 `onTapOutsideMedia` 触发且仅触发 1 次；执行缩放/平移/旋转手势及长按实况图期间，`onTapOutsideMedia` 不触发。
- **AC-051**：（引用 FR-010）调用 `setIndicatorVisible(false)` 后，Indicator（默认或自定义）从界面上立即消失；调用 `setIndicatorVisible(true)` 后立即恢复显示；多次重复调用不崩溃。
- **AC-052**：（引用 FR-002）系统栏 insets 发生变化时，接入方注册的回调收到最新 insets 数值（top/bottom/left/right 像素值），数值与系统实际 insets 一致；在系统栏显隐切换时回调被触发。
- **AC-053**：（引用 FR-006）SDK 默认 Indicator 渲染 N 个单元（N = Item 总数），各单元横向排列，默认位置底部距屏幕底部 24dp；当前页单元高亮，其余单元为非激活样式。
- **AC-054**：（引用 FR-007、FR-008）翻到第 N 页时，`IndicatorAdapter.onPageChanged(currentIndex = N-1, itemCount)` 被回调，第 N 个 Indicator 单元进入激活高亮状态；回调在主线程执行。
- **AC-055**：（引用 FR-011、NFR-PERF-001）幻灯片模式下，当前 Item 播放进度从 0.0 推进至 1.0 过程中，Indicator 当前单元显示连续填充动画，帧率 ≥ 60fps，无跳帧或卡顿。
- **AC-056**：（引用 FR-007）接入方注册自定义 `IndicatorAdapter` 后，SDK 默认横线 Indicator 不显示；翻页及幻灯片进度变化时，自定义 Adapter 的对应回调方法被调用，参数（currentIndex、itemCount、progress）正确。
- **AC-057**：（引用 FR-010）`setIndicatorVisible(Boolean)` 方法可被多次调用，每次调用后 Indicator 可见状态立即与参数一致，不受调用顺序或调用次数影响，不崩溃。

---

## 核心实体

- **IndicatorAdapter**：接入方自定义 Indicator 的扩展接口，核心方法包括 `onPageChanged(currentIndex: Int, itemCount: Int)` 和 `onProgressChanged(progress: Float)`；注册后 SDK 默认 Indicator 被完全禁用；SDK 持有弱引用，Activity 销毁时自动解除，不造成内存泄漏。
- **WindowInsets 透传回调**：SDK 向接入方暴露的只读 insets 数据封装，包含 top/bottom/left/right 像素值；在系统 `WindowInsetsCompat` 变化时由 SDK 更新并回调接入方；属性只读，SDK 不修改原始系统值。
- **TapOutsideMediaCallback**：`onTapOutsideMedia` 的回调接口，触发时携带点击坐标（x, y）及当前页索引；与媒体手势识别互斥，由 SDK 内部手势冲突仲裁逻辑决定是否触发，每次有效单击触发且仅触发 1 次。

---

## 假设与约束

- **假设**：
  - 宿主 Activity 在集成 SDK 时已自行启用 edge-to-edge（`WindowCompat.setDecorFitsSystemWindows`）；若未启用，SDK 的沉浸布局功能退化为普通布局，不影响其他 Feature 功能，不触发崩溃。
  - 接入方已按 FEAT-002 接入翻页事件体系；若 FEAT-002 未集成，`IndicatorAdapter.onPageChanged` 不会被触发，Indicator 不响应翻页。
  - 幻灯片进度由 FEAT-007 负责计时并推送；若 FEAT-007 未集成，`onProgressChanged` 不被调用，Indicator 退化为仅响应翻页的静态指示器，不影响其他功能。
- **约束**：
  - 最低支持 Android 8.0（API 26），edge-to-edge 及 insets 兼容层使用 `WindowInsetsCompat`（Jetpack AndroidX）实现，不使用 API 30 以上才有的 `WindowInsets.Type` 原生 API（须兼容封装）。
  - SDK 不依赖任何接入方具体 UI 框架，`IndicatorAdapter` 回调仅传递原始数据（页码 Int、进度 Float），不传递 View 实例，接入方自行驱动 UI 更新。
  - 所有 `IndicatorAdapter` 回调及 `onTapOutsideMedia` 回调均在主线程触发，接入方无需额外线程切换。

---

## 需求追溯（预留，Story 拆解后填写）

> 说明：此表由 `/aisdd.featuretasks` 执行时自动回填（数据来源：`epic-design.md` §十二 Story 拆解的 FR/NFR 覆盖矩阵），用于确保 FR/NFR 被 Story 覆盖；Implement 不得擅自改写 FR/NFR。

| FR/NFR ID | 计划覆盖的 Story ID（Plan） | 任务覆盖（Tasks） | 备注 |
|---|---|---|---|
| FR-001 | ST-??? | T??? |  |
| FR-002 | ST-??? | T??? |  |
| FR-003 | ST-??? | T??? |  |
| FR-004 | ST-??? | T??? |  |
| FR-005 | ST-??? | T??? |  |
| FR-006 | ST-??? | T??? |  |
| FR-007 | ST-??? | T??? |  |
| FR-008 | ST-??? | T??? |  |
| FR-009 | ST-??? | T??? |  |
| FR-010 | ST-??? | T??? |  |
| FR-011 | ST-??? | T??? |  |
| NFR-PERF-001 | ST-??? | T??? |  |
| NFR-PERF-002 | ST-??? | T??? |  |
| NFR-POWER-001 | ST-??? | T??? |  |
| NFR-MEM-001 | ST-??? | T??? |  |
| NFR-SEC-001 | ST-??? | T??? |  |
| NFR-SEC-002 | ST-??? | T??? |  |
| NFR-OBS-001 | ST-??? | T??? |  |
| NFR-OBS-002 | ST-??? | T??? |  |
| NFR-REL-001 | ST-??? | T??? |  |
| NFR-REL-002 | ST-??? | T??? |  |
| NFR-REL-003 | ST-??? | T??? |  |

---

## 变更记录（增量变更）

| 版本 | 日期 | 变更范围 | 变更摘要 | 影响 | 是否需要回滚 |
|---|---|---|---|---|---|
| v0.1.0 | 2026-03-22 | 全文 | 初始草稿创建 | 无 | 否 |
