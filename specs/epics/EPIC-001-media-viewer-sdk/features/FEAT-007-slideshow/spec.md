# Feature 规格说明：幻灯片自动播放

**Epic**：EPIC-001 - Android 媒体浏览 SDK
**Feature 类型**：Product Feature
**Feature ID**：FEAT-007
**Feature Version**：v0.1.0
**EPIC 分支**：`epic/EPIC-001-media-viewer-sdk`
**Feature 目录**：`specs/epics/EPIC-001-media-viewer-sdk/features/FEAT-007-slideshow/`
**创建时间**：2026-03-22
**状态**：草稿

## 背景与价值 *（必填）*

- **背景**：媒体浏览 SDK 当前仅支持用户手动翻页浏览图片/视频列表。在展览、演示、数字标牌等场景下，接入方需要媒体列表能按固定节奏自动循环播放，无需人工干预。现有 SDK 不具备定时翻页与进度可视化能力，导致接入方需要在外部自行实现计时逻辑，且无法与 Indicator 同步，体验割裂。
- **目标**：在 SDK 层封装幻灯片自动播放能力，提供 `startSlideshow(intervalMs)` / `stopSlideshow()` 两个公开 API，驱动 Pager 自动翻页，并向 Indicator 实时推送当前页进度值（0.0~1.0），同时正确处理用户手动干预��的暂停与恢复。
- **价值**：
  - 接入方无需自行实现计时器与状态机，降低集成成本。
  - Indicator 进度可视化提升展演场景的观看体验。
  - 手动操作后自动暂停、空闲后自动恢复，保障用户意图与自动化流程的平衡。
- **范围（In Scope）**：
  - `startSlideshow(intervalMs: Long)` 开启幻灯片模式
  - `stopSlideshow()` 彻底停止（不再自动恢复，需重新调用 `startSlideshow`）
  - SDK 按 `intervalMs` 自动翻到下一页；到达最后一页后循环回第一页继续
  - Indicator 当前页单元进度值（0.0~1.0）随时间实时推进（从空到满，表示当前页剩余停留时长）
  - 用户手动翻页时，SDK 暂停自动播放，Indicator 进度冻结在暂停时刻
  - 用户停止操作达到空闲超时时长（`resumeDelayMs`，默认 10000 ms，可配置）后，从当前页继续自动播放
  - 恢复后 Indicator 从冻结位置续播，不重置为 0
  - 视频 Item 页按固定 `intervalMs` 翻页，不等视频播完
  - `intervalMs` 由接入方配置；`resumeDelayMs` 默认 10000 ms，可配置

- **范围外（Out of Scope）**：
  - Indicator 的渲染实现（由 FEAT-006 负责，本 Feature 仅向 FEAT-006 的 IndicatorAdapter 推送进度值）
  - Pager 翻页动画效果（由 FEAT-002 负责）
  - 后台/前台切换时的幻灯片行为（本期不覆盖，视为扩展场景）
  - 播放列表的编辑、排序或过滤

## 依赖关系 *（必填）*

- **上游依赖**：
  - `FEAT-002`（Media Pager）：幻灯片自动翻页依赖 Pager 提供的翻页控制 API（如 `scrollToPage(index)`），以及当前页变化的回调/事件，用于检测用户手动翻页行为。
  - `FEAT-006`（Immersive Indicator）：幻灯片需通过 IndicatorAdapter 的进度推送接口将当前页进度值（0.0~1.0）实时传递给 Indicator 渲染层。

- **下游影响**：
  - 接入方（宿主 App）：可通过 `startSlideshow` / `stopSlideshow` API 控制自动播放生命周期。
  - Indicator 展示层（FEAT-006）：接收本 Feature 推送的进度值并渲染倒计时效果。

- **外部依赖故障模式**：
  - 若 FEAT-002 的翻页 API 不可用或返回失败，幻灯片翻页操作应记录错误日志，不崩溃，下一个计时周期重试。
  - 若 FEAT-006 的 IndicatorAdapter 进度推送接口未注册（为 null），进度更新调用应静默忽略（空安全调用），不影响幻灯片计时主流程。

> 说明：本 Feature 依赖 FEAT-002（翻页控制接口）与 FEAT-006（IndicatorAdapter 进度推送接口）两个 Capability/Platform Feature，接入契约为 SDK 内部接口（Kotlin interface），在 Plan 阶段明确具体接口签名。

## 验收与场景 *（必填）*

> 说明：本节用于"可测试"的需求验收；**不等同于技术 Story**（技术 Story 在 Plan 阶段拆分）。

### 核心用户旅程

#### 旅程 1 - 开启幻灯片自动播放

- **描述**：接入方调用 `startSlideshow(intervalMs)` 后，SDK 开始按指定间隔自动翻页浏览媒体列表，Indicator 实时显示每页的剩余停留进度，到达最后一页后循环回第一页。
- **成功信号**：用户无需任何操作，媒体列表按节奏自动循环播放，Indicator 进度随时间从 0 推进到 1 后跳至下一页并重置。
- **验收场景**：
  1. **前提** SDK 已初始化，媒体列表含 3 张图片，**当** 调用 `startSlideshow(3000)`，**则** 每 3 秒自动翻到下一页，第 3 页翻完后回到第 1 页，持续循环。
  2. **前提** 幻灯片播放中（第 2 页），**当** 等待约 1500 ms，**则** Indicator 当前页进度值约为 0.5（误差在可接受范围内）。
  3. **前提** 幻灯片播放中，**当** 到达最后一页的 `intervalMs` 计时结束，**则** 自动翻回第 1 页，Indicator 进度重置为 0 并重新推进。

#### 旅程 2 - 手动翻页后暂停与自动恢复

- **描述**：幻灯片播放过程中，用户手动滑动翻页，SDK 检测到用户干预后暂停自动播放并冻结 Indicator 进度，用户停止操作达到 `resumeDelayMs` 后，SDK 从当前页续播，Indicator 从冻结进度位置继续计时。
- **成功信号**：用户手动翻页后 Indicator 进度停止推进，等待 `resumeDelayMs` 后自动恢复播放，进度从暂停点继续而非从 0 重新开始。
- **验收场景**：
  1. **前提** `startSlideshow(5000)` 播放中，第 1 页进度约 0.4（约 2 秒已过），**当** 用户手动滑动到第 2 页，**则** 自动播放暂停，Indicator 进度冻结在第 2 页的 0.0（新页刚到达时的初始值）。
  2. **前提** 自动播放已暂停（进度冻结），**当** 用户停止操作超过 `resumeDelayMs`（默认 10000 ms），**则** SDK 从当前页继续播放，Indicator 从冻结进度值继续推进。
  3. **前提** 自动播放已暂停，**当** 用户在 `resumeDelayMs` 内再次手动翻页，**则** 空闲计时重新开始，以最后一次手动操作时刻为基准重新等待 `resumeDelayMs`。
  4. **前提** 幻灯片播放中，**当** 调用 `stopSlideshow()`，**则** 自动播放立即停止，Indicator 进度冻结，即使等待超过 `resumeDelayMs` 也不自动恢复。

### 边界与异常场景（必填）

- **空列表（0 个 Item）**：调用 `startSlideshow` 时列表为空 → SDK 不启动计时器，静默返回，不崩溃；调用 `stopSlideshow` 同样静默返回。
- **单 Item 列表**：调用 `startSlideshow` → 每隔 `intervalMs` "翻页"到同一页（即页面不变），Indicator 进度正常从 0 推进到 1 后重置循环；不崩溃。
- **`intervalMs` 极小值（如 0 或 < 最小保护阈值）**：SDK 应将 `intervalMs` 强制提升到最小保护值（最小值由 Plan 阶段技术方案确定，建议 500 ms），并通过日志警告记录实际采用的值；不崩溃，不产生死循环或无限翻页。
- **`stopSlideshow()` 后再调用 `startSlideshow(intervalMs)`**：SDK 应以新参数重新启动幻灯片，进度从当前页的 0 开始重新计时；不产生多个计时器并发运行的问题（旧计时器须在 `stopSlideshow` 时完全取消）。
- **重复调用 `startSlideshow(intervalMs)`（未先 `stopSlideshow`）**：SDK 应先停止当前计时器，再以新参数重新启动，不产生计时器泄漏；以新 `intervalMs` 生效，进度从当前页的 0 重新开始。
- **生命周期/页面销毁**：宿主 Activity/Fragment 销毁时，若未调用 `stopSlideshow`，计时器必须在 `onDestroy` 或 SDK 生命周期回调中自动释放，不持有 Activity 引用，不造成内存泄漏。
- **视频 Item 页**：当前页为视频时，不等视频播完，按 `intervalMs` 到时间即翻页；视频播放状态不影响幻灯片计时逻辑。

## FR / NFR *（必填）*

### FR（Functional Requirements）

- **FR-001**：接入方必须能够调用 `startSlideshow(intervalMs: Long)` 开启幻灯片自动播放，SDK 须按 `intervalMs`（毫秒）间隔自动将 Pager 翻至下一页。
- **FR-002**：自动播放到达最后一页后，SDK 必须循环跳回第一页继续播放，不中断。
- **FR-003**：幻灯片播放期间，SDK 必须实时向 FEAT-006 IndicatorAdapter 推送当前页进度值（浮点数，范围 0.0~1.0），从 0.0（页面刚到达）到 1.0（即将翻页）单调递增。
- **FR-004**：SDK 必须能检测用户手动翻页行为；检测到手动翻页时，立即暂停自动播放，停止 Indicator 进度推进（进度冻结在当前值）。
- **FR-005**：用户停止手动操作达到 `resumeDelayMs`（默认 10000 ms，可由接入方配置）后，SDK 必须从当前页自动恢复幻灯片播放，Indicator 从冻结进度值续播，不重置为 0。
- **FR-006**：接入方必须能够调用 `stopSlideshow()` 彻底停止幻灯片播放；停止后即使超过 `resumeDelayMs` 也不自动恢复，须再次调用 `startSlideshow` 方可重启。
- **FR-007**：视频 Item 页按固定 `intervalMs` 翻页，不等待视频播放结束。
- **FR-008**：当 `intervalMs` 小于最小保护阈值时，SDK 必须将其提升至最小保护值并记录警告日志，不崩溃。
- **FR-009**：空列表或单 Item 列表调用 `startSlideshow` 时，SDK 必须以安全方式处理（空列表不启动计时，单 Item 正常循环），不崩溃。
- **FR-010**：重复调用 `startSlideshow`（未先 `stopSlideshow`）时，SDK 必须先取消当前计时器，再以新参数重启，保证同一时刻最多一个幻灯片计时器运行。

### NFR（Non-Functional Requirements）

> 规则：每条 NFR 必须**量化**并附带验收方式；细化评估在 Plan 阶段完成。

#### 性能（Performance）

- **NFR-PERF-001**：Indicator 进度推送的帧更新延迟（从实际时间点到进度值到达 IndicatorAdapter）p95 ≤ 16 ms（即不低于 60 fps 的推送频率），在 Android 8.0（API 24）及以上设备上满足此要求。验收方式：单元测试或 UI 测试中用 `SystemClock` 计时验证推送间隔分布。
- **NFR-PERF-002**：幻灯片翻页触发（从计时结束到 Pager 实际翻页）延迟 p95 ≤ 50 ms。验收方式：集成测试中测量 `intervalMs` 到翻页完成事件的时间差。

#### 功耗（Power）

- **NFR-POWER-001**：幻灯片计时器与进度推送逻辑运行于主线程或协程调度器（不创建额外后台线程），在前台播放期间不额外增加 CPU wakelock 或后台唤醒次数。验收方式：通过 Android Profiler 或 Battery Historian 观察幻灯片开启前后的 CPU wakelock 变化，不出现新增 wakelock。

#### 内存（Memory）

- **NFR-MEM-001**：幻灯片计时器对象不持有 Activity、Fragment 或 View 的强引用；宿主组件销毁后计时器自动���放，不造成内存泄漏。验收方式：在 LeakCanary 集成测试中，反复开启/关闭幻灯片并旋转屏幕，无 Activity/Fragment 泄漏报告。
- **NFR-MEM-002**：幻灯片功能引入的额外堆内存占用 ≤ 1 MB（不含媒体数据本身）。验收方式：Android Profiler 对比开启/关闭幻灯片的堆快照差值。

#### 安全与隐私（Security/Privacy）

- **NFR-SEC-001**：幻灯片功能不访问、不存储任何用户个人数据；`intervalMs`、`resumeDelayMs` 等配置参数仅在内存中使用，不持久化到磁盘或上报。验收方式：代码审查确认无文件写入、网络请求或 SharedPreferences 操作。

#### 可观测性（Observability）

- **NFR-OBS-001**：以下关键事件必须输出 Debug 级别日志（tag：`SlideshowController`）：`startSlideshow` 调用（记录 `intervalMs`、`resumeDelayMs`）、`stopSlideshow` 调用、自动翻页触发（记录目标页 index）、用户手动翻页检测（记录触发页 index）、暂停与恢复事件、`intervalMs` 被提升至最小值的警告（Warn 级别）。验收方式：运行集成测试并过滤 logcat，确认上述日志均可观察到。

#### 可靠性（Reliability）

- **NFR-REL-001**：幻灯片播放期间（包括循环跳回第一页、暂停恢复、空列表、单 Item 等边界场景）不得抛出未捕获异常（crash）。验收方式：覆盖所有边界场景的单元测试与集成测试全部通过，Monkey 测试 10 分钟无 crash。
- **NFR-REL-002**：暂停后恢复的 Indicator 进度值与暂停时冻结值之差绝对值 ≤ 0.02（即误差在 2% 以内），保证续播视觉连续性。验收方式：单元测试中模拟暂停与恢复，断言恢复后首帧推送的进度值满足偏差约束。

## 验收标准（Feature Level）*（必填）*

- **AC-058**：（对应 FR-001）调用 `startSlideshow(intervalMs)` 后，Pager 在每 `intervalMs` ±50 ms 内自动翻到下一页，连续播放不中断。
- **AC-059**：（对应 FR-003）幻灯片播放期间，IndicatorAdapter 接收到的当前页进度值以 ≥ 60 次/秒的频率单调递增，从 0.0 到接近 1.0；翻页时进度��置为 0.0。
- **AC-060**：（对应 FR-004）用户手动翻页后，自动播放立即暂停，IndicatorAdapter 不再收到新的进度更新（进度冻结），持续时长直到空闲超时触发恢复。
- **AC-061**：（对应 FR-005）用户最后一次手动操作结束后等待 `resumeDelayMs`（默认 10000 ms），幻灯片从当前页自动恢复播放，IndicatorAdapter 恢复接收进度更新。
- **AC-067**：（对应 FR-005、NFR-REL-002）恢复后 IndicatorAdapter 收到的首帧进度值与暂停时冻结值之差绝对值 ≤ 0.02，不重置为 0。
- **AC-068**：（对应 FR-006）调用 `stopSlideshow()` 后，自动播放停止，等待超过 `resumeDelayMs` 也不自动恢复；再次调用 `startSlideshow` 方可重启。
- **AC-069**：（对应 FR-002）幻灯片播放到最后一页计时结束后，自动翻回第一页继续播放，不崩溃，循环次数不限。
- **AC-070**：（对应 FR-007）当前页为视频 Item 时，视频未播完时按 `intervalMs` 到时间即翻页，Indicator 进度正常推进。
- **AC-071**：（对应 FR-008）传入 `intervalMs` 小于最小保护阈值时，SDK 以最小保护值运行，logcat 中出现 Warn 级别日志，不崩溃。
- **AC-072**：（对应 FR-009）空列表调用 `startSlideshow` 不崩溃，不启动计时器；单 Item 列表正常循环播放，不崩溃。
- **AC-073**：（对应 FR-010、NFR-MEM-001）重复调用 `startSlideshow` 后，同一时刻仅有一个计时器运行；宿主 Activity 销毁后 LeakCanary 无泄漏报告。

## 核心实体（如涉及数据则必填）

- **SlideshowConfig**：幻灯片配置，核心属性：`intervalMs: Long`（翻页间隔，毫秒）、`resumeDelayMs: Long`（空闲恢复等待时长，默认 10000）；由接入方在调用 `startSlideshow` 时传入或通过 SDK 构建器配置。
- **SlideshowState**：幻灯片运行状态枚举，取值：`IDLE`（未启动）、`PLAYING`（自动播放中）、`PAUSED`（用户干预后暂停）、`STOPPED`（已彻底停止）；状态转换由 `startSlideshow`、`stopSlideshow`、手动翻页检测、空闲超时事件驱动。
- **PageProgress**：当前页进度快照，核心属性：`pageIndex: Int`（当前页索引）、`progress: Float`（0.0~1.0）、`frozenAt: Float?`（暂停时冻结的进度值��`null` 表示未暂停）；推送给 IndicatorAdapter 的数据载体。

## 假设与约束 *（必填）*

- **假设**：
  - FEAT-002 的 Pager 提供可调用的 `scrollToPage(index: Int)` 接口，且翻页操作在主线程安全执行；若接口变更，幻灯片翻页逻辑需同步更新。
  - FEAT-006 的 IndicatorAdapter 提供 `onProgressUpdate(pageIndex: Int, progress: Float)` 或等效接口；若接口未实现（返回 null），本 Feature 静默忽略进度推送，不崩溃。
  - 接入方在宿主组件的 `onDestroy` 前调用 `stopSlideshow()`，或 SDK 提供生命周期感知能力（LifecycleObserver）自动清理；若接入方未手动停止，SDK 须通过 LifecycleObserver 自动释放计时器。
  - `intervalMs` 最小保护阈值的具体数值（建议 500 ms）在 Plan 阶段技术方案确认后确定；若最终值与建议值不同，本 spec 中 NFR/AC 描述的"最小保护阈值"以 Plan 阶段确定值为准。

- **约束**：
  - 最低支持平台：Android 8.0（API 24）及以上。
  - 不依赖 Android 系统定时器以外的任何外部库实现计时（如无特殊需要，使用 Kotlin Coroutines `delay` 或 `Handler.postDelayed`，具体在 Plan 阶段确定）。
  - 幻灯片功能为 SDK 可选能力，接入方未调用 `startSlideshow` 时，SDK 不产生任何计时器或后台任务，零额外资源占用。
  - 本 Feature 不修改 FEAT-002 或 FEAT-006 的核心接口定义；若接口需要扩展，须通过 CR 流程评审。

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
| NFR-REL-001 | ST-??? | T??? |  |
| NFR-REL-002 | ST-??? | T??? |  |

## 变更记录（增量变更）

| 版本 | 日期 | 变更范围 | 变更摘要 | 影响 | 是否需要回滚 |
|---|---|---|---|---|---|
| v0.1.0 | 2026-03-22 | 全文 | 初稿创建 | 无 | 否 |
