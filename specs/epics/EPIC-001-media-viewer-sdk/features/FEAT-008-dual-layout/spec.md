# Feature 规格说明：双形态动态布局切换

**Epic**：EPIC-001 - Android 媒体浏览 SDK
**Feature 类型**：Product Feature
**Feature ID**：FEAT-008
**Feature Version**：v0.1.0
**EPIC 分支**：`epic/EPIC-001-media-viewer-sdk`
**Feature 目录**：`specs/epics/EPIC-001-media-viewer-sdk/features/FEAT-008-dual-layout/`
**创建时间**：2026-03-22
**状态**：草稿

---

## 背景与价值

- **背景**：接入方希望为媒体浏览场景提供"展示态"与"浏览态"两种排版形态——展示态在图片/视频周边展示接入方自定义的装饰区域（边框、文字、贴图等），浏览态则隐藏装饰、媒体内容扩展至整个 Item 容器。当前 SDK 无形态切换能力，接入方只能在应用层手动操控布局，切换时无平滑过渡动画，体验粗糙。
- **目标**：SDK 提供标准化的双形态切换驱动接口，自动完成媒体区域的位置/尺寸插值动画（类 Shared Element Transition），接入方无需自行计算 Rect 差异或处理手势锁定逻辑。
- **价值**：
  - 用户：形态切换有仪式感与沉浸感，媒体内容无跳变，体验流畅。
  - 接入方：以单次 API 调用驱动完整切换流程，极大降低接入复杂度。
  - SDK：形态切换逻辑内聚于 SDK，减少接入方重复实现带来的碎片化问题。
- **范围（In Scope）**：
  - `switchLayout(mode: LayoutMode)` API，触发展示态 ↔ 浏览态切换。
  - SDK 自动计算媒体区域 Rect 差异（位置 + 尺寸），执行插值过渡动画。
  - 动画时长可配置，SDK 提供合理默认值。
  - 切换期间手势（缩放/平移/旋转）全部禁用，动画结束后自动恢复。
  - 动画不可打断：动画进行中再次调用 `switchLayout` 时忽略，当前动画继续至完成。
  - 切换到浏览态时，图片缩放状态重置为 1×（fit-screen）。
  - 不同 Item 可独立处于不同形态，互不影响。
  - 未声明媒体区域时，SDK 降级为无动画直接切换，不崩溃。
  - `onLayoutSwitchComplete` 回调，动画结束后触发。
  - 媒体区域声明方式（具体接口）留技术方案确定（O-025 待确认）。
- **范围外（Out of Scope）**：
  - 周边装饰的具体淡入/淡出效果（SDK 提供驱动接口，接入方可自行实现）。
  - 媒体区域声明的具体接口实现细节（留技术方案阶段确定）。

---

## 依赖关系

- **上游依赖**：
  - **FEAT-002**（Pager Item 容器生命周期）：切换动画绑定于 Item 容器视图树，需要容器生命周期稳定；依赖 FEAT-002 提供 Item 挂载/卸载事件，用于动画安全取消。
  - **FEAT-001**（图片浏览缩放状态管理）：切换到浏览态完成后须重置缩放状态为 1×，依赖 FEAT-001 提供缩放状态的读取与同步重置接口。
  - **O-025（待确认）**：媒体区域声明接口的技术方案，本 Feature 的动画起点/终点 Rect 计算依赖该接口的设计结果。
- **下游影响**：
  - 接入方在 `onLayoutSwitchComplete` 回调中执行的自定义装饰动画。
  - 任何订阅 Item 形态状态的接入方逻辑（如底部工具栏显隐、标题栏收起）。
- **外部依赖故障模式**：
  - FEAT-001 缩放重置接口不可用 → 切换到浏览态时缩放状态可能残留，作为已知限制记录，不阻塞本 Feature 交付；在 Plan 阶段协商接口形式。
  - O-025 接口未确认 → 媒体区域声明降级为无动画直接切换（FR-008 覆盖此场景）。
  - FEAT-002 Item 容器在动画中途销毁 → SDK 监听生命周期事件，安全取消动画（NFR-REL-001 覆盖此场景）。

> 说明（重要）：本 Feature 依赖 FEAT-001 的缩放重置能力，建议确认 FEAT-001 spec 已包含对应接口契约，避免在实现阶段出现接口缺口。

---

## 验收与场景

> 说明：本节用于"可测试"的需求验收；**不等同于技术 Story**（技术 Story 在 Plan 阶段拆分）。

### 核心用户旅程

#### 旅程 1 - 展示态切换至浏览态

- **描述**：用户正在查看带有装饰区域的图片（展示态），点击进入沉浸浏览，装饰区域收起，图片扩展至全 Item 并重置缩放。
- **成功信号**：动画流畅完成后，媒体内容占满整个 Item 容器，缩放比例为 1×，装饰区域不可见，`onLayoutSwitchComplete` 回调被触发且携带正确的结果信息。
- **验收场景**：
  1. **前提** Item 处于展示态（Layout A），媒体区域已声明，**当** 调用 `switchLayout(LayoutMode.BROWSE)`，**则** SDK 启动位置/尺寸插值动画，媒体内容从展示态 Rect 平滑过渡到全 Item Rect，动画期间手势无响应，动画完成后图片缩放重置为 1×，`onLayoutSwitchComplete` 被调用，携带 `targetMode=BROWSE`、实际耗时、`isDegraded=false`。
  2. **前提** Item 处于展示态，切换动画正在进行中，**当** 再次调用 `switchLayout(LayoutMode.BROWSE)`，**则** 第二次调用被忽略，当前动画继续至完成，不崩溃，不出现状态跳变，最终仍触发一次 `onLayoutSwitchComplete`。

#### 旅程 2 - 浏览态回切至展示态

- **描述**：用户已处于浏览态（全屏媒体），退出沉浸浏览，媒体内容缩回原展示位置，装饰区域重新可见，手势恢复正常。
- **成功信号**：动画流畅完成后，媒体内容回到展示态 Rect，装饰区域恢复可见，`onLayoutSwitchComplete` 回调被触发，手势恢复响应。
- **验收场景**：
  1. **前提** Item 处于浏览态（Layout B），**当** 调用 `switchLayout(LayoutMode.DISPLAY)`，**则** SDK 启动插值动画，媒体内容从全 Item Rect 平滑收缩回展示态 Rect，动画期间手势无响应，动画完成后手势恢复，`onLayoutSwitchComplete` 被调用，携带 `targetMode=DISPLAY`。
  2. **前提** 用户在浏览态对图片执行了缩放操作（当前缩放比例 > 1×），**当** 调用 `switchLayout(LayoutMode.DISPLAY)` 后再调用 `switchLayout(LayoutMode.BROWSE)` 再次切回浏览态，**则** 第二次进入浏览态完成后，图片缩放比例仍重置为 1×（fit-screen），与进入浏览态前的缩放状态无关。

### 边界与异常场景

- **未声明媒体区域** → SDK 无法获取起点/终点 Rect，降级为无动画直接切换（布局状态立即更新），不崩溃，`onLayoutSwitchComplete` 仍然触发（`isDegraded=true`，`durationMs=0`）。
- **动画进行中再次调用 `switchLayout`** → 第二次调用被忽略，当前动画继续至完成，不产生状态叠加或崩溃，日志输出 "ignored: animation in progress"。
- **切换目标与当前形态相同**（如当前已是浏览态，再次调用 `switchLayout(LayoutMode.BROWSE)`） → 调用被静默忽略，不启动动画，不触发 `onLayoutSwitchComplete`，日志输出 "ignored: already in target mode"。
- **多 Item 并发切换** → 各 Item 形态状态独立管理，A 页切换动画不影响 B 页的形态或手势状态。
- **切换动画进行中 Item 被销毁（如用户快速翻页导致 Item 离屏销毁）** → SDK 监听 `onDetachedFromWindow`，安全取消动画，释放 View 引用，不崩溃，不触发 `onLayoutSwitchComplete`（或触发时确保幂等）。
- **动画时长配置为 0** → 等同于直接切换（无动画），`onLayoutSwitchComplete` 同步触发，`isDegraded=false`（非降级，是有效配置）。
- **切换到浏览态后用户立即执行手势** → 动画期间手势被禁用，用户输入丢弃；动画完成后（含时长为 0 的场景）手势立即恢复响应。

---

## FR / NFR

### FR（Functional Requirements）

> 规则：每条 FR 必须**可测试**，避免"提升体验/更快/更稳定"这类不可验证表述。

- **FR-001**：接入方必须能够调用 `switchLayout(mode: LayoutMode)` 触发当前 Item 在展示态（Layout A）与浏览态（Layout B）之间的切换。
- **FR-002**：SDK 必须自动计算媒体区域从当前形态 Rect 到目标形态 Rect 的位置和尺寸差异，并对媒体内容区域执行插值动画；动画过程中媒体内容不得出现位置或尺寸跳变。
- **FR-003**：切换动画的时长必须支持通过配置项（`LayoutSwitchConfig.durationMs`）自定义，SDK 须提供合理的默认时长。
- **FR-004**：切换动画执行期间，SDK 必须禁用当前 Item 的所有手势（缩放/平移/旋转）；动画完成后必须立即恢复手势响应。
- **FR-005**：动画执行期间若再次调用 `switchLayout`，SDK 必须忽略该调用，当前动画继续至完成，不崩溃，不产生状态叠加。
- **FR-006**：切换至浏览态（Layout B）完成后，SDK 必须将当前 Item 的图片缩放状态重置为 1×（fit-screen），与切换前的缩放状态无关。
- **FR-007**：不同 Item 的形态状态必须独立管理，一个 Item 的切换动画不得影响其他 Item 的形态或手势状态。
- **FR-008**：当接入方未声明媒体区域时，SDK 必须降级为无动画直接切换，不抛出异常，不崩溃；`onLayoutSwitchComplete` 仍须触发，且 `isDegraded=true`。
- **FR-009**：动画完成后，SDK 必须触发 `onLayoutSwitchComplete` 回调，回调须携带：目标形态（`targetMode: LayoutMode`）、实际动画耗时（`durationMs: Int`，单位 ms）、是否为降级无动画切换（`isDegraded: Boolean`）。
- **FR-010**：切换目标与当前形态相同时，SDK 必须静默忽略该调用，不启动动画，不触发 `onLayoutSwitchComplete`。

### NFR（Non-Functional Requirements）

> 规则：每条 NFR 必须**量化**并附带验收方式；细化评估在 Plan 阶段完成。

#### 性能（Performance）

- **NFR-PERF-001**：双形态切换动画在主流中端设备（高通 660 及以上 / 搭载 Vulkan 的中端机）上帧率不低于 60fps，动画期间不出现连续两帧以上的掉帧（Jank）。验收方式：通过 Perfetto / systrace 采集切换动画区间帧时间，P95 帧时间 ≤ 16.7ms。
- **NFR-PERF-002**：`switchLayout` 调用到动画第一帧渲染（首次 `onDraw`）的延迟不超过 16ms（1 帧）。验收方式：埋点记录调用时间戳与首帧 `onDraw` 时间戳，差值 ≤ 16ms，压测 100 次取 P95。

#### 功耗（Power）

- **NFR-POWER-001**：单次完整切换动画（默认时长，预估约 300ms）产生的额外 CPU/GPU 功耗，在连续 100 次切换压测场景（测试设备充满电后进行）下，电量消耗增量不超过 0.5mAh。验收方式：Battery Historian 测量压测前后电量差值。

#### 内存（Memory）

- **NFR-MEM-001**：切换动画完成后，SDK 不得持有任何 `View`、`Bitmap` 或 `Animator` 对象的强引用，不产生内存泄漏。验收方式：LeakCanary 在 100 次切换压测后无新增泄漏报告；Android Profiler 确认 `Animator` 对象在动画结束后可被 GC。
- **NFR-MEM-002**：单次切换动画执行期间，SDK 自身引入的额外堆内存增量不超过 2MB（不含接入方装饰视图占用的内存）。验收方式：Android Profiler 在动画区间采样堆内存，峰值增量 ≤ 2MB。

#### 安全与隐私（Security/Privacy）

- **NFR-SEC-001**：切换动画涉及的媒体内容（图片像素/视频帧）不得被写入磁盘，不得通过 IPC 传递至其他进程。SDK 仅在内存中操作 `View`/`Rect` 数据，不持久化任何媒体像素数据。验收方式：代码审查确认无文件写入或跨进程传输路径。

#### 可观测性（Observability）

- **NFR-OBS-001**：SDK 在以下场景必须输出 Debug 级日志（标签：`MediaViewerSDK/LayoutSwitch`）：
  - 切换被触发：记录 `itemId`、`targetMode`、当前形态。
  - 动画开始：记录实际起点 Rect、终点 Rect。
  - 动画结束：记录实际耗时（ms）、是否降级。
  - 调用被忽略：记录忽略原因（"animation in progress" / "already in target mode"）。
  - 降级触发：记录降级原因（"media region not declared"）。
- **NFR-OBS-002**：`onLayoutSwitchComplete` 回调须携带完整的 `LayoutSwitchResult`，包含：`targetMode: LayoutMode`、`durationMs: Int`（实际耗时，ms）、`isDegraded: Boolean`（是否降级无动画切换）。

#### 可靠性（Reliability）

- **NFR-REL-001**：当 Item 在动画进行中被销毁（`onDetachedFromWindow` 或宿主 `onDestroy`），SDK 必须安全取消动画，释放所有持有的 View 引用，不崩溃，不产生 `onLayoutSwitchComplete` 的悬空回调。验收方式：在动画进行中强制销毁 Item，重复 50 次，无 ANR/Crash，LeakCanary 无泄漏。
- **NFR-REL-002**：在连续快速调用 `switchLayout` 100 次的压测场景下，SDK 不崩溃，最终形态与最后一次完整动画结束后的预期形态一致。验收方式：自动化压测脚本执行 100 次随机切换，验证最终状态正确且无 Crash。

---

## 验收标准（Feature Level）

- **AC-062**：调用 `switchLayout(LayoutMode.BROWSE)` 后，当前 Item 从展示态切换为浏览态；调用 `switchLayout(LayoutMode.DISPLAY)` 后，从浏览态切换回展示态。（对应 FR-001）
- **AC-063**：切换过程中，媒体内容在旧形态 Rect 与新形态 Rect 之间平滑过渡，目视无位置或尺寸跳变。（对应 FR-002）
- **AC-064**：从浏览态切回展示态，动画完成后媒体内容位于展示态原始 Rect，目视与展示态初始位置完全重合。（对应 FR-002）
- **AC-065**：多个 Item 并存时，各 Item 的形态状态独立，A 页处于展示态不影响 B 页处于浏览态，反之亦然。（对应 FR-007）
- **AC-066**：接入方未声明媒体区域时，调用 `switchLayout` 不崩溃，布局状态直接切换（无动画），`onLayoutSwitchComplete` 仍被触发且携带 `isDegraded=true`。（对应 FR-008）
- **AC-081**：切换动画执行期间，对当前 Item 施加缩放/平移/旋转手势，手势不响应，媒体内容不发生偏移或缩放变化。（对应 FR-004）
- **AC-082**：切换动画执行中，再次调用 `switchLayout`，该调用被忽略，当前动画继续至完成，不崩溃，不出现两段动画叠加。（对应 FR-005）
- **AC-083**：切换到浏览态动画完成后，图片缩放比例为 1×（fit-screen），与切换前的缩放状态无关。（对应 FR-006）
- **AC-084**：动画完成后，`onLayoutSwitchComplete` 被调用，回调携带 `targetMode`、实际动画耗时（`durationMs`）和是否降级标记（`isDegraded`）。（对应 FR-009，NFR-OBS-002）
- **AC-085**：切换动画在主流中端设备上 Perfetto 采样 P95 帧时间 ≤ 16.7ms，无连续两帧以上掉帧。（对应 NFR-PERF-001）
- **AC-086**：100 次切换压测后，LeakCanary 无新增内存泄漏报告，Android Profiler 确认 Animator 对象可被 GC。（对应 NFR-MEM-001）
- **AC-087**：调用目标形态与当前形态相同时，调用被静默忽略，不启动动画，不触发 `onLayoutSwitchComplete`。（对应 FR-010）

---

## 核心实体

- **LayoutMode**：枚举，定义两种形态：`DISPLAY`（展示态，Layout A，含装饰区域）、`BROWSE`（浏览态，Layout B，纯媒体全铺）。是 `switchLayout` API 的入参，也是 `LayoutSwitchResult` 的字段。
- **MediaRegionDescriptor**：描述接入方声明的媒体内容区域，核心属性为媒体区域在展示态下相对于 Item 容器的 Rect（位置 + 尺寸）。具体数据结构及声明方式留技术方案确定（O-025 待确认）。SDK 在切换时读取此描述以确定动画起点 Rect。
- **LayoutSwitchConfig**：切换行为配置实体，核心属性：`durationMs: Int`（动画时长，默认值 TBD）、`interpolator`（插值器类型，默认建议 FastOutSlowIn）。由接入方在初始化 SDK 时或 per-Item 传入。
- **LayoutSwitchResult**：`onLayoutSwitchComplete` 回调携带的结果对象，核心属性：`targetMode: LayoutMode`、`durationMs: Int`（实际耗时，ms）、`isDegraded: Boolean`（是否为降级无动画切换）。

---

## 假设与约束

- **假设**：
  - 媒体区域声明接口（O-025）可在 `switchLayout` 调用时同步提供精确的 View Rect 坐标。若 O-025 提供异步结果，本 Feature 需在 Plan 阶段增加等待逻辑或调整为降级策略，可能影响 FR-002 和 AC-063。
  - FEAT-001 缩放状态重置接口为同步调用，可在动画完成回调中安全调用。若 FEAT-001 提供的是异步重置，则 AC-083 可能存在单帧缩放状态残留闪烁，需在 Plan 阶段协商接口形式。
  - 接入方在 `onLayoutSwitchComplete` 回调中执行的装饰动画不会反向影响 SDK 管理的媒体区域布局；若接入方在回调中立即触发布局重算，以接入方行为为准，SDK 不做拦截。
- **约束**：
  - 最低支持 Android 8.0（API 24）；动画实现须兼容 API 24+，不得使用 API 26+ 独有的动画 API（实现前需确认所用 API Level）。
  - 动画实现必须基于 Android 原生 Animator 体系（`ValueAnimator` / `ObjectAnimator` / `AnimatorSet`），不引入第三方动画库，避免增加 SDK 体积和依赖冲突风险。
  - 本 Feature 不管理周边装饰视图的显隐逻辑；接入方须在 `onLayoutSwitchComplete` 回调（或自行监听形态状态变化）后自行控制装饰视图。

---

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

---

## 变更记录（增量变更）

| 版本 | 日期 | 变更范围 | 变更摘要 | 影响 | 是否需要回滚 |
|---|---|---|---|---|---|
| v0.1.0 | 2026-03-22 | 全部 | 初稿创建 | 无 | 否 |
