# Feature 规格说明：SDK 事件回调系统

**Epic**：EPIC-001 - Android 媒体浏览 SDK
**Feature 类型**：Capability Feature
**Feature ID**：FEAT-009
**Feature Version**：v0.1.0
**EPIC 分支**：`epic/EPIC-001-media-viewer-sdk`
**Feature 目录**：`specs/epics/EPIC-001-media-viewer-sdk/features/FEAT-009-event-callbacks/`
**创建时间**：2026-03-22
**状态**：草稿

## 背景与价值 *（必填）*

- **背景**：媒体浏览 SDK 内部存在大量关键状态变化（翻页完成、图片分级加载进度、视频首帧就绪、视频播放状态切换），接入方无法感知这些事件，导致外部 Indicator、页码显示无法同步更新，视频黑屏（首帧未就绪时过早渲染）等过渡体验问题难以规避。
- **目标**：定义并交付一套标准回调接口契约与发布机制，使接入方能够通过统一的监听器接口感知 SDK 内部所有关键状态变化，驱动自定义 UI 并消除黑屏等体验缺陷。
- **价值**：
  - 接入方可精确控制外部 Indicator、页码、菜单等与翻页状态的同步；
  - 接入方可基于 `onThumbnailLoaded` / `onHighResLoaded` 时机管理自定义 placeholder，实现图片平滑显示；
  - 接入方可基于 `onVideoFirstFrameReady` 触发视频画面展示，彻底消除黑屏；
  - 回调接��与 SDK 核心解耦，接入方零注册时 SDK 不受影响。
- **范围（In Scope）**：
  - 定义 `MediaViewerListener` 接口（含全部 8 个回调方法）；
  - 定义 SDK 侧的回调发布机制（线程调度到主线程、空注册保护）；
  - 定义图片 Item 的分级加载回调时序（placeholder → 缩略图 → 高清图）；
  - 定义视频 Item 的防黑屏回调时序（placeholder/封面 → 首帧就绪）；
  - 定义 `onPageScrolled` 的高频回调保护约束（回调本身不允许阻塞主线程）。
- **范围外（Out of Scope）**：
  - 各回调事件的实际触发逻辑（由 FEAT-002 翻页、FEAT-003 视频播放等 Feature 负责实现，本 Feature 只定义接口契约和发布机制）；
  - 回调数据的持久化、统计或埋点上报；
  - 接入方侧的 UI 实现（Indicator、播放控制栏等）。

## 依赖关系 *（必填）*

- **上游依赖**：
  - `FEAT-002（媒体翻页器）`：提供翻页完成事件（`onPageChanged`）和翻页拖动事件（`onPageScrolled`）的原始触发时机；
  - `FEAT-003（视频 Item）`：提供视频首帧解码完成、播放状态变化、音量变化事件的原始触发时机；
  - `FEAT-001（图片浏览核心）`：提供缩略图/高清图加载完成事件的原始触发时机。
- **下游影响**：
  - 所有接入方自定义 UI 联动（Indicator、页码、菜单）依赖本 Feature 定义的回调接口；
  - FEAT-010（Demo App）将通过本 Feature 接口演示防黑屏和 UI 联动能力。
- **外部依赖故障模式**：
  - FEAT-002 翻页事件未触发 → `onPageChanged` / `onPageScrolled` 不会发出，接入方 Indicator 不更新（业务降级，非崩溃）；
  - FEAT-003 视频解码异常 → `onVideoFirstFrameReady` 不触发，SDK 持续显示封面图，接入方通过 `onLoadError` 获知失败。

> 本 Feature 本身为横切 Capability Feature，定义接口契约；业务触发逻辑分散于 FEAT-001 / FEAT-002 / FEAT-003，接入契约为 `MediaViewerListener` 接口。

## 验��与场景 *（必填）*

> 说明：本节用于"可测试"的需求验收；不等同于技术 Story（技术 Story 在 Plan 阶段拆分）。

### 核心用户旅程

#### 旅程 1 - 图片浏览防黑屏机制（分级加载感知）

- **描述**：接入方打开 SDK 浏览图片列表，SDK 按 placeholder → 缩略图 → 高清图顺序加载；接入方通过回调在正确时机隐藏 placeholder、触发 UI 联动，用户全程看到渐进式图片显示，无闪白/黑屏。
- **成功信号**：缩略图回调在缩略图可见后触发，高清图回调在高清图替换后触发，两者顺序不颠倒，接入方能基于回调精确控制 placeholder 显示/隐藏。
- **验收场景**：
  1. **前提** SDK 展示图片列表且接入方注册了 `MediaViewerListener`，**当** position=2 的缩略图解码完成并显示，**则** `onThumbnailLoaded(2)` 在主线程触发，此时高清图尚未替换（`onHighResLoaded` 尚未触发）。
  2. **前提** 同上，**当** position=2 的高清图解码完成并替换缩略图，**则** `onHighResLoaded(2)` 在主线程触发，触发时高清图已在 View 上呈现。
  3. **前提** SDK 处于预加载场景（当前页为 position=3），**当** position=4 的缩略图预加载完成，**则** `onThumbnailLoaded(4)` 可正常触发（非当前页也可回调）。

#### 旅程 2 - 视频播放防黑屏机制（首帧感知）

- **描述**：接入方打开 SDK 展示视频 Item，SDK 在视频首帧解码完成前持续显示封面图；接入方在 `onVideoFirstFrameReady` 触发后执行画面切换，用户看不到任何黑屏过渡。
- **成功信号**：`onVideoFirstFrameReady` 触发前封面图始终可见（无黑屏帧），触发后接入方可安全展示视频画面；播放/暂停/结束状态通过 `onVideoPlaybackStateChanged` 准确反映。
- **验收场景**：
  1. **前提** SDK 展示视频 Item 且视频正在解码首帧，**当** 首帧解码完成，**则** `onVideoFirstFrameReady(position)` 在主线程触发，此前 SDK 侧封面图未被移除（可通过截帧/UI 树验证无黑帧）。
  2. **前提** 视频正在播放，**当** 用户触发暂停，**则** `onVideoPlaybackStateChanged(position, PAUSED)` 在主线程触发。
  3. **前提** 视频正在播放，**当** 播放自然结束，**则** `onVideoPlaybackStateChanged(position, ENDED)` 在主线程触发。
  4. **前提** 接入方调整视频音量或切换静音，**当** 音量/静音状态变化，**则** `onVideoVolumeChanged(position, volume, muted)` 在主线程触发，参数值与实际状态一致。

### 边界与异常场景（必填）

- **接入方不注册任何回调** → SDK 内部回调发布逻辑安全跳过，不报 NullPointerException，不崩溃，功能正常（FR-009 / NFR-REL-001）。
- **快速连续翻页导致 `onPageScrolled` 高频触发**（单次拖动可触发数十次/秒）→ SDK 按每帧如实回调，接入方回调实现需自行保证轻量；SDK 不做节流，但 spec 约束接入方不得在 `onPageScrolled` 内执行耗时操作（NFR-PERF-001）。
- **接入方在回调内抛出未捕获异常** → SDK 侧在分发每个回调时包裹 try-catch，单个回调异常不影响后续回调发布，异常记录至 SDK 内部日志（NFR-REL-002）。
- **回调接口持有 Activity 引用** → 若接入方将 Activity 直接传入监听器并在 Activity 销毁后未取消注册，存在内存泄漏风险；SDK 文档应明确说明应使用弱引用或在 `onDestroy` 前取消注册（NFR-MEM-001）。
- **视频解码失败，`onVideoFirstFrameReady` 永不触发** → SDK 通过 `onLoadError(position, error)` 通知接入方，接入方可据此移除封面图并显示错误态；SDK 不会因超时无首帧而自动移除封面图（NFR-REL-003）。
- **同一 position 多次快速切换缩略图/高清图加载状态**（如网络抖动导致重加载）→ 每次成功解码完成均触发对应回调，接入方收到的回调顺序与实际加载顺序一致（FR-002 / FR-003）。

## FR / NFR *（必填）*

### FR（Functional Requirements）

- **FR-001**：SDK 必须提供 `onPageChanged(from: Int, to: Int)` 回调，在翻页动画完成后（非拖动过程中）触发，`from` 为翻页前页码，`to` 为翻页后页码，值与实际页码一致。
- **FR-002**：SDK 必须提供 `onPageScrolled(position: Int, positionOffset: Float)` 回调，在翻页拖动过程中每帧触发，`positionOffset` 取值范围 [0.0, 1.0)。
- **FR-003**：SDK 必须提供 `onThumbnailLoaded(position: Int)` 回调，在指定 position 的缩略图解码完成并在 View 上呈现后触发；该回调可在非当前页触发（预加载场景）。
- **FR-004**：SDK 必须提供 `onHighResLoaded(position: Int)` 回调，在指定 position 的高清图解码完成并替换 View 上的缩略图后触发；在此回调触发前，View 上不得显示高清图内容。
- **FR-005**：SDK 必须提供 `onVideoFirstFrameReady(position: Int)` 回调，在视频 Item 的首帧解码完成且画面已就绪后触发；在此回调触发前，SDK 必须持续显示封面图（不得出现黑帧）。
- **FR-006**：SDK 必须提供 `onVideoPlaybackStateChanged(position: Int, state: VideoPlaybackState)` 回调，在视频播放状态发生变化时触发；`VideoPlaybackState` 枚举值至少包含：`PLAYING`、`PAUSED`、`ENDED`、`ERROR`。
- **FR-007**：SDK 必须提供 `onVideoVolumeChanged(position: Int, volume: Float, muted: Boolean)` 回调，在音量或静音状态变化时触发；`volume` 取值范围 [0.0, 1.0]，`muted` 反映当前静音状态。
- **FR-008**：SDK 必须提供 `onLoadError(position: Int, error: MediaLoadError)` 回调，在图片或视频资源加载失败时触发；`MediaLoadError` 需携带可识别的错误类型信息。
- **FR-009**：接入方不注册 `MediaViewerListener`（或注册为 null）时，SDK 正常运行，所有回调发布路径安全跳过，不抛出任何异常。
- **FR-010**：所有回调方法必须在 Android 主线程（UI Thread）执行；接入方在回调中可安全操作 UI 组件。

### NFR（Non-Functional Requirements）

#### 性能（Performance）

- **NFR-PERF-001**：`onPageScrolled` 回调每帧触发时，SDK 侧回调分发耗时（从事件产生到调用接入方回调）不得超过 1 ms（p99，通过 Systrace / Perfetto 验证），确保不加剧主线程 16 ms 帧预算压力；SDK 接口文档须明确说明接入方不得在此回调内执行耗时操作（如 I/O、复杂计算、跨进程调用）。
- **NFR-PERF-002**：`onPageChanged` 触发延迟（从翻页动画完成到回调执行）不得超过 16 ms（1 帧），通过仪器测试（Choreographer 帧时间戳对比）验证。

#### 功耗（Power）

- **NFR-POWER-001**：事件回调发布机制本身（线程切换、回调分发）不引入额外后台 WakeLock 或 Handler 持续轮询；所有调度基于事件驱动，无定时器或轮询结构。可通过 Battery Historian 验证无异常唤醒增量。

#### 内存（Memory）

- **NFR-MEM-001**：SDK 对 `MediaViewerListener` 的持有方式不得导致接入方 Activity/Fragment 泄漏；SDK 须通过弱引用（WeakReference）或等效生命周期感知机制持有监听器引用，并在 SDK 销毁时自动清除所有监听器引用。可通过 LeakCanary 旋转屏幕后验证无泄漏。
- **NFR-MEM-002**：回调接口定义本身（接口类 + 枚举）新增堆内存不超过 20 KB（DEX 大小增量），通过构建产物 APK Analyzer 验证。

#### 安全与隐私（Security/Privacy）

- **NFR-SEC-001**：回调参数（position、volume、state、error）不得包含用户个人信息（PII）；`MediaLoadError` 携带的错误信息仅反映技术错误类型（如网络错误、解码错误），不包含 URL 路径或用户标识。

#### 可观测性（Observability）

- **NFR-OBS-001**：SDK 内部每次回调发布时须输出 Debug 级别日志，格式为 `[MediaViewerSDK][Callback] {callbackName}(position={position}, ...)` ，便于接入方排查回调时机问题；日志在 Release 构建中可通过 SDK 配置关闭。
- **NFR-OBS-002**：接入方回调内抛出的异常须被 SDK 捕获并以 Warning 级别日志记录（含异常堆栈），格式为 `[MediaViewerSDK][Callback] Exception in {callbackName}: {stackTrace}`，不得静默吞掉。

#### 可靠性（Reliability）

- **NFR-REL-001**：接入方不注册回调（null 监听器）时，SDK 回调发布路径 100% 不崩溃；通过单元测试覆盖所有回调发布路径的 null 场景验证。
- **NFR-REL-002**：接入方在任意回调方法内抛出异常，不得导致 SDK 后续回调停止发布，不得影响 SDK 核心功能（翻页、播放）；通过集成测试模拟异常场景验证。
- **NFR-REL-003**：`onVideoFirstFrameReady` 未触发（视频解码失败）时，SDK 封面图保持显示状态直到 `onLoadError` 触发或接入方主动关闭 SDK；SDK 不自动移除封面图。

## 验收标准（Feature Level）*（必填）*

- **AC-074**：翻页动画完成后（非拖动中），`onPageChanged(from, to)` 在主线程触发，`from` 与 `to` 值与实际页码一致，误差为 0。（FR-001）
- **AC-075**：缩略图在 View 上呈现后，`onThumbnailLoaded(position)` 在主线程触发，`position` 与实际 Item 位置一致；非当前页预加载完成亦可触发。（FR-003）
- **AC-076**：高清图在 View 上替换缩略图后，`onHighResLoaded(position)` 在主线程触发；在此回调触发前，通过 UI Automator 截图验证 View 上未出现高清图内容。（FR-004）
- **AC-077**：视频首帧解码完成后，`onVideoFirstFrameReady(position)` 在主线程触发；从视频 Item 出现到首帧触发的全程帧截图序列中，不存在黑帧（通过自动化截帧测试验证）。（FR-005）
- **AC-078**：视频播放中触发暂停 → `onVideoPlaybackStateChanged(position, PAUSED)` 触发；恢复播放 → `PLAYING` 触发；自然结束 → `ENDED` 触发；解码/网络错误 → `ERROR` 触发。各状态回调在主线程触发，状态值与实际一致。（FR-006）
- **AC-079**：调整音量或切换静音时，`onVideoVolumeChanged(position, volume, muted)` 在主线程触发；`volume` 值在 [0.0, 1.0] 范围内，`muted` 与当前静音状态一致。（FR-007）
- **AC-080**：接入方完全不注册 `MediaViewerListener`（传入 null 或不调用注册方法），SDK 全功能正常运行（翻页、图片加载、视频播放），日志中无 NullPointerException。（FR-009、NFR-REL-001）
- **AC-081**：接入方在 `onPageScrolled` 回调内执行空操作时，Perfetto 采集的 SDK 回调分发耗时 p99 ≤ 1 ms，不引起 Choreographer 丢帧。（NFR-PERF-001）
- **AC-082**：LeakCanary 在 Activity 旋转 3 次后未报告与 `MediaViewerListener` 相关的内存泄漏。（NFR-MEM-001）
- **AC-083**：接入方在任意回调中抛出 RuntimeException，SDK 继续正常发布后续回调（通过集成测试验证），且异常信息出现在 SDK Warning 日志中。（NFR-REL-002、NFR-OBS-002）

## 核心实体（如涉及数据则必填）

- **`MediaViewerListener`**：回调接口契约，包���全部 8 ��回调方法（`onPageChanged`、`onPageScrolled`、`onThumbnailLoaded`、`onHighResLoaded`、`onVideoFirstFrameReady`、`onVideoPlaybackStateChanged`、`onVideoVolumeChanged`、`onLoadError`）；所有方法均提供默认空实现，接入方可按需覆盖。
- **`VideoPlaybackState`**：枚举类型，定义视频播放状态集合；枚举值：`PLAYING`、`PAUSED`、`ENDED`、`ERROR`。
- **`MediaLoadError`**：错误描述实体，包含错误类型（枚举：`NETWORK_ERROR`、`DECODE_ERROR`、`SOURCE_NOT_FOUND`、`UNKNOWN`）；不包含 PII 信息。

## 假设与约束 *（必填）*

- **假设**：
  - FEAT-002 翻页器能够在翻页动画完成帧及每个滚动帧提供精确的 position / offset 数据；若无法提供，`onPageChanged` 触发时机可能不准确，需与 FEAT-002 负责方澄清接口。
  - FEAT-003 视频播放器能够在首帧解码完成时产生明确的生命周期回调（如 `MediaPlayer.OnVideoSizeChangedListener` 或 ExoPlayer 的 `onRenderedFirstFrame`）；若底层播放器不支持，`onVideoFirstFrameReady` 无法实现，需降级处理。
  - 接入方具备在 `onDestroy` 前取消注册监听器的能力（或 SDK 采用弱引用机制自动处理）；若接入方不配合，需由 SDK 弱引用机制兜底（NFR-MEM-001 强制约束）。
- **约束**：
  - 最低支持 Android 8.0（API 24），回调机制不得使用 API 24 以下的接口；
  - 所有回调必须在主线程（Android UI Thread）执行，不允许接入方在回调中直接做跨线程调用假设；
  - 回调接口设计遵循 Kotlin 接口规范，提供默认空实现（`fun onXxx(...) {}`），Java 接入方兼容；
  - `onPageScrolled` 在快速翻页时可能达到 60~120 次/秒（与屏幕刷新率一致），接口文档须明确说明性能约束。

## 需求追溯（预留，Story 拆解后填写）

> 说明：此表由 `/aisdd.featuretasks` 执行时自动回填（数据来源：`epic-design.md` §十三 Story 拆解的 FR/NFR 覆盖矩阵），用于确保 FR/NFR 被 Story 覆盖；Implement 不得擅自改写 FR/NFR。

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
| NFR-PERF-001 | ST-??? | T??? |  |
| NFR-PERF-002 | ST-??? | T??? |  |
| NFR-POWER-001 | ST-??? | T??? |  |
| NFR-MEM-001 | ST-??? | T??? |  |
| NFR-MEM-002 | ST-??? | T??? |  |
| NFR-SEC-001 | ST-??? | T??? |  |
| NFR-OBS-001 | ST-??? | T??? |  |
| NFR-OBS-002 | ST-??? | T??? |  |
| NFR-REL-001 | ST-??? | T??? |  |
| NFR-REL-002 | ST-??? | T??? |  |
| NFR-REL-003 | ST-??? | T??? |  |

## 变更记录（增量变更）

| 版本 | 日期 | 变更范围 | 变更���要 | 影响 | 是否需要回滚 |
|---|---|---|---|---|---|
| v0.1.0 | 2026-03-22 | 全文 | 初稿创建，定义全部 10 条 FR、11 条 NFR、10 条 AC | 无下游影响（初稿） | 否 |
