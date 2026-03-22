# Feature 规格说明：HDR 图片显示

**Epic**：EPIC-001 - Android 媒体浏览 SDK
**Feature 类型**：Product Feature
**Feature ID**：FEAT-005
**Feature Version**：v0.1.0
**EPIC 分支**：`epic/EPIC-001-media-viewer-sdk`
**Feature 目录**：`specs/epics/EPIC-001-media-viewer-sdk/features/FEAT-005-hdr-display/`
**创建时间**：2026-03-22
**状态**：草稿

## 背景与价值 *（必填）*

- **背景**：移动设备硬件持续演进，Android 14（API 34）引入原生 Ultra HDR 渲染支持，现代旗舰机型已普遍配备 HDR 显示屏。当前 SDK 的图片浏览路径统一走 SDR 渲染，无法利用设备的高动态范围显示能力，导致含 HDR 元数据的 HEIF/JPEG 图片亮度和色域被压缩，视觉表现与原片存在差距。
- **目标**：在支持 HDR 的设备上，当图片文件携带 Gainmap / Ultra HDR 元数据时，SDK 自动选择 HDR 渲染路径，将亮度和色域还原至超出 SDR 范围的真实水平；在不支持 HDR 的设备或 OS 版本上，无感知���降级为 SDR 渲染，保证功能稳定、不崩溃。
- **价值**：高端机用户可直接感知图片色彩和明暗层次的显著提升，带来更接近拍摄原片的视觉体验；低端机和旧版本 OS 用户则维持现有体验不变，无任何负面感知。SDK 接入方无需自行处理兼容性分支逻辑。
- **范围（In Scope）**：
  1. 图片 HDR 元数据检测：检测 HEIF 和 JPEG 文件是否携带 Gainmap 或 Ultra HDR 元数据
  2. 设备及窗口 HDR 显示能力检测：检测当前设备是否支持 HLG、HDR10 或 Dolby Vision，以及当前窗口是否处于 HDR 模式
  3. 双重条件（图片含 HDR 元数据 + 设备支持 HDR + OS ≥ API 34）均满足时，使用 Android Ultra HDR API 进行 HDR 渲染
  4. 任一条件不满足时，自动降级为 SDR 渲染路径，不抛出异常、不输出错误日志
  5. 向接入方暴露配置接口，允许接入方在运行时强制禁用 HDR 渲染（以配置项实现，UI 由接入方自行构建）
- **范围外（Out of Scope）**：
  - 视频 HDR 渲染（超出本 SDK 范围）
  - HDR 开关的接入方 UI 实现（接入方自行实现，SDK 仅提供配置接口）
  - Gainmap 与 Ultra HDR 渲染算法的内部选择逻辑（技术方案阶段确定）
  - 对 AVIF、WebP 等格式的 HDR 元数据解析（当前仅覆盖 HEIF/JPEG）

## 依赖关系 *（必填）*

- **上游依赖**：
  - **FEAT-001（图片解码管线基础）**：本 Feature 的 HDR 元数据检测和 HDR 渲染路径建立在 FEAT-001 提供的图片解码管线之上；接入契约为 FEAT-001 向外暴露的解码结果对象（含文件格式、Bitmap 及元数据容器）。
  - **系统 API：Android Ultra HDR API（API 34+）**：`android.graphics.ImageDecoder` 及 `android.graphics.gainmap.GainmapRenderer`（或等效 API），仅在 API 34+ 设备可用。
  - **系统 API：`Display.getHdrCapabilities()`**：用于查询当前显示器支持的 HDR 类型（HLG、HDR10、Dolby Vision），Android 7.0（API 24）起可用。
- **下游影响**：
  - FEAT-001 的图片解码流程需确保 HDR 元数据在解码结果中可被读取（若当前实现丢弃元数据，需扩展）。
  - 接入方的图片浏览 Activity/Fragment 若设置了窗口 HDR 模式，需与本 Feature 的能力检测结果保持一致。
- **外部依赖故障模式**：
  - Ultra HDR API 在部分 API 34 设备上可能存在厂商定制问题导致渲染失败 → SDK 须捕获异常并降级 SDR，记录 warn 级日志。
  - `Display.getHdrCapabilities()` 返回空集合或 null → 视为不支持 HDR，静默降级 SDR。

> 说明：HDR 渲染能力属于本 Feature 自身能力范围，无需拆分为独立 Capability Feature。接入方通过 SDK 配置接口控制 HDR 开关，不直接依赖系统 API。

## 验收与场景 *（必填）*

> 说明：本节用于"可测试"的需求验收；**不等同于技术 Story**（技术 Story 在 Plan 阶段拆分）。

### 核心用户旅程

#### 旅程 1 - 支持 HDR 的设备上浏览含 HDR 元数据的图片

- **描述**：用户在一台运行 Android 14+、具备 HDR 显示屏的设备上，用 SDK 集成的图片浏览器打开一张含 Gainmap 的 HEIF 图片或含 Ultra HDR 元数据的 JPEG 图片，图片以 HDR 效果呈现，亮度和色彩明显优于同等 SDR 渲染。
- **成功信号**：图片渲染完成后，高光区域亮度超出 SDR 白点（可通过屏幕参考或仪器测量验证），用户无需做任何额外操作。
- **验收场景**：
  1. **前提** 设备为 API 34+、显示屏支持 HDR10 或 HLG，且 HDR 功能未被接入方禁用；**当** 打开一张携带 Gainmap 元数据的 HEIF 文件；**则** SDK 选择 HDR 渲染路径，图片以超出 SDR 范围的亮度和色域呈现，可通过截图与 SDR 渲染结果的像素值比对确认亮度差异（AC-020）。
  2. **前提** 同上；**当** 打开一张携带 Ultra HDR 元数据的 JPEG 文件；**则** 同上，HDR 效果可观测，且应用不崩溃、无异常日志（AC-020）。
  3. **前提** 设备为 API 34+、HDR 显示屏支持；**当** 接入方在运行时通过 SDK 配置接口将 HDR 渲染禁用；**则** 同一张含 HDR 元数据的图片改走 SDR 渲染路径，图片正常显示（FR-005, AC-022）。

#### 旅程 2 - 不支持 HDR 的设备上浏览同一图片（SDR 降级）

- **描述**：用户在一台运行 Android 13 或更低版本、或 HDR 显示屏未启用的设备上，用 SDK 打开同一张含 HDR 元数据的图片，图片以 SDR 效果正常显示，用户无感知功能差异，应用不崩溃。
- **成功信号**：图片正常渲染，应用运行稳定，无崩溃、无异常弹窗、无错误提示。
- **验收场景**：
  1. **前提** 设备 API < 34（如 API 33）；**当** 打开含 HDR 元数据的 HEIF 或 JPEG 图片；**则** SDK 检测到 OS 版本不足，静默降级 SDR 渲染，图片正常显示，logcat 无 ERROR 级别日志（AC-021）。
  2. **前提** 设备 API 34+，但 `Display.getHdrCapabilities()` 返回空集合（不支持 HDR 显示）；**当** 打开含 HDR 元数据的图片；**则** SDK 静默降级 SDR 渲染，图片正常显示（AC-021）。
  3. **前提** 任意设备；**当** 打开不含 HDR 元数据的普通 JPEG/HEIF 图片；**则** SDK 走 SDR 渲染路径，图片正常显示，性能与 FEAT-001 基线一致（FR-001）。

### 边界与异常场景（必填）

- **API < 34 设备调用 Ultra HDR API** → SDK 在版本检测阶段提前分支，不调用相关 API，静默走 SDR 路径；不抛出 `NoSuchMethodError` 或 `ClassNotFoundException`。
- **图片含 HDR 元数据、设备支持 HDR，但 Ultra HDR API 返回渲染异常** → SDK 捕获异常，降级 SDR 渲染，记录 warn 级日志（含图片路径和异常摘要），不向接入方传播异常。
- **图片不含 HDR 元数据（普通 SDR 图片）** → 无论设备是否支持 HDR，均走 SDR 渲染路径，不影响性能基线。
- **图片含 HDR 元数据，但设备显示器仅支持 SDR** → 静默降级 SDR 渲染，不报错，用户无感知。
- **HDR 渲染过程中 Activity 生命周期变化（旋转/进入后台）** → HDR 渲染任务随视图生命周期取消，重建后重新发起检测与渲染，不出现内存泄漏或重复渲染。
- **接入方在图片切换（ViewPager 滑动）时频繁触发 HDR 检测** → 检测结果在同一 Display 会话内缓存（设备能力），避免每张图片都重复查询 Display 能力；图片元数据检测仅在解码阶段执行一次。

## FR / NFR *（必填）*

### FR（Functional Requirements）

- **FR-001**：系统必须在图片解码阶段检测文件是否携带 Gainmap 或 Ultra HDR 元数据，并将检测结果（布尔值及元数据类型）附加到解码结果对象中，供渲染路径决策使用。检测结果可通过单元测试对已知含 HDR 元数据的测试图片集验证。
- **FR-002**：系统必须在首次渲染前查询当前 `Display` 的 HDR 能力（`HdrCapabilities`），并将查询结果（支持的 HDR 类型集合）在同一 Display 会话内缓存；不支持 HDR 时，缓存"不支持"标记，避免重复 IPC 查询。
- **FR-003**：当且仅当以下三个条件全部满足时，系统必须选择 HDR 渲染路径：(1) 图片携带 Gainmap 或 Ultra HDR 元数据，(2) 当前设备 Display 支持至少一种 HDR 类型（HLG、HDR10 或 Dolby Vision），(3) 当前 Android OS 版本 ≥ API 34。任一条件不满足时，系统必须选择 SDR 渲染路径，且不抛出任何异常。
- **FR-004**：系统必须在 HDR 渲染路径因任何原因（API 异常、OOM、厂商定制问题）失败时，捕获异常并自动降级为 SDR 渲染路径，完成正常图片渲染。降级行为须记录 warn 级别日志（含图片标识和异常类型），不向接入方传播异常。
- **FR-005**：SDK 必须向接入方暴露布尔配置项 `hdrEnabled`（默认值 `true`），接入方可在 SDK 初始化或运行时修改此配置；当 `hdrEnabled = false` 时，系统跳过 HDR 能力检测，直接走 SDR 渲染路径，且此配置变更在下一次图片渲染时生效。

### NFR（Non-Functional Requirements）

> 规则：每条 NFR 必须**量化**并附带验收方式；细化评估在 Plan 阶段完成。

#### 性能（Performance）

- **NFR-PERF-001**：HDR 渲染路径下，已解码图片的首帧上屏时间（从 Bitmap 就绪到 View 完成绘制）p95 ≤ 100ms（在 Pixel 7 / API 34 参考机上测量）；SDR 降级路径的首帧上屏时间 p95 ≤ 80ms，与 FEAT-001 SDR 基线一致。验收方式：通过 Perfetto/FrameMetrics 在参考机上采集 50 次冷启动数据。
- **NFR-PERF-002**：HDR 能力检测（`Display.getHdrCapabilities()` 查询）在同一 Display 会话内仅执行一次，后续调用命中内存缓存，单次缓存读取耗时 ≤ 1ms。验收方式：通过日志计数或单元测试的 mock 验证调用次数。

#### 功耗（Power）

- **NFR-POWER-001**：以旗舰机（Pixel 8 / API 34）为参考，连续浏览 20 张含 HDR 元数据的图片（模拟 Top5% 高频浏览用户），HDR 渲染路径相对 SDR 路径的额外功耗增量 ≤ 15mAh/次连续浏览会话（10 分钟内）。验收方式：通过 Battery Historian 在充电断开状态下对比 HDR/SDR ��景的电量消耗差值。

#### 内存（Memory）

- **NFR-MEM-001**：单张图片在 HDR 渲染路径下，Gainmap 元数据和 HDR Bitmap 的峰值内存增量相对同分辨率 SDR Bitmap ≤ 100%（即最多翻倍，如 4K 图 SDR ~32MB，HDR ≤ 64MB）。View 离开屏幕后，HDR Bitmap 须在 `onDetachedFromWindow` 时释放，不得常驻内存。验收方式：通过 Android Studio Profiler 在参考机上采集渲染周期内的 heap 快照对比。

#### 安全与隐私（Security/Privacy）

- **NFR-SEC-001**：SDK 对图片文件的访问仅限只读操作，HDR 元数据检测过程中不修改、不复制、不缓存原始文件字节到持久化存储。检测结果仅保存在内存中，随组件生命周期销毁。验收方式：代码审查确认无文件写入操作；静态分析工具（lint/detekt）无文件写入告警。

#### 可观测性（Observability）

- **NFR-OBS-001**：SDK 须在以下关键节点输出结构化日志（Tag 统一为 `MediaViewerSDK-HDR`）：
  - **DEBUG**：每次图片 HDR 元数据检测结果（图片 URI hash + 元数据类型 + 是否含 HDR）
  - **DEBUG**：每次设备 HDR 能力查询结果（支持的 HDR 类型列表，仅首次查询时输出）
  - **INFO**：最终渲染路径决策（HDR 或 SDR，含决策原因）
  - **WARN**：HDR 渲染失败并降级 SDR 的事件（含异常类型摘要，不含完整堆栈以控制日志量）
  - 日志须支持通过 `hdrEnabled` 配置控制 DEBUG 级别输出的开关（默认关闭，避免生产环境日志洪泛）。验收方式：对照场景逐条验证 logcat 输出。

#### 可靠性（Reliability）

- **NFR-REL-001**：HDR 功能的 SDR 降级路径须覆盖所有已知故障场景（OS 版本不足、设备不支持、API 异常、OOM），降级成功率 = 100%（即：在任何不支持或异常场景下，图片均可正常渲染，不崩溃）。验收方式：设计覆盖各降级分支的 Robolectric 单元测试，CI 通过率 100%。
- **NFR-REL-002**：HDR 渲染路径不得引入新的 ANR 风险。所有 HDR 元数据检测与渲染操作须在非主线程（协程 IO/Default Dispatcher）执行，主线程仅负责 Bitmap 上屏。验收方式：通过 StrictMode 在 Debug 构建中运行，无主线程 IO 违规告警。

## 验收标准（Feature Level）*（必填）*

- **AC-020**：在 Android 14+（API 34）、HDR 显示屏支持（HDR10 或 HLG）的参考设备上，打开携带 Gainmap 或 Ultra HDR 元数据的 HEIF/JPEG 图片，渲染结果的高光区域亮度（通过渲染 Bitmap 的像素最大亮度值或设备亮度输出测量）超出 SDR 白点，且图片正常显示、应用不崩溃。（覆盖 FR-001, FR-002, FR-003）
- **AC-021**：在 Android 13 及以下（API < 34）设备，或 HDR 显示能力为空（`HdrCapabilities` 返回空集合）的设备上，打开任意含 HDR 元数据的图片，图片以 SDR 效果正常显示，应用不崩溃，logcat 无 ERROR 级日志，且用户无感知功能缺失。（覆盖 FR-003, FR-004, NFR-REL-001）
- **AC-022**：当接入方通过 SDK 配置接口将 `hdrEnabled` 设置为 `false` 时，在支持 HDR 的设备上打开含 HDR 元数据的图片，SDK 跳过 HDR 检测与渲染路径，图片以 SDR 效果正常显示。（覆盖 FR-005）
- **AC-023**：HDR 渲染路径因异常失败时（通过 mock 注入异常），SDK 捕获异常、降级 SDR、图片正常显示，logcat 输出 WARN 级日志，不向接入方传播异常。（覆盖 FR-004, NFR-REL-001）
- **AC-024**：在参考机（Pixel 7 / API 34）上，HDR 渲染首帧上屏时间 p95 ≤ 100ms；SDR 降级首帧上屏时间 p95 ≤ 80ms。（覆盖 NFR-PERF-001）
- **AC-025**：HDR Bitmap 在视图离开屏幕（`onDetachedFromWindow`）后，通过 Profiler heap 快照确认内存已释放，无 HDR Bitmap 内存泄漏。（覆盖 NFR-MEM-001）

## 核心实体（如涉及数据则必填）

- **HDR 图片元数据（HdrImageMetadata）**：表示从图片文件中检测到的 HDR 相关元数据。核心属性：`hasHdrMetadata: Boolean`（是否含 HDR 元数据）、`hdrType: HdrType`（枚举：NONE / GAINMAP / ULTRA_HDR）、`sourceFormat: ImageFormat`（HEIF / JPEG）。关系：属于解码结果对象的可选附加属性，由图片解码管线（FEAT-001）在解码阶段填充，供渲染路径决策读取。不包含具体算法参数（��技术方案确定）。

- **HDR 渲染路径配置（HdrRenderConfig）**：表示 SDK 级别的 HDR 渲染配置，由接入方在初始化时注入，支持运行时更新。核心属性：`hdrEnabled: Boolean`（是否允许 HDR 渲染，默认 `true`）。关系：作为 SDK 配置对象的子配置，渲染路径决策器在每次渲染前读取此配置；配置变更对下一次渲染立即生效。不包含渲染算法细节。

## 假设与约束 *（必填）*

- **假设**：
  - 假设 Android Ultra HDR API 在所有 API 34+ 设备上均可正常调用——若部分厂商实现存在缺陷导致 API 不可用，则通过 FR-004 的异常捕获与降级机制兜底，不影响用户正常使用。
  - 假设接入方的宿主 Activity 窗口已启用 HDR 渲染模式（`WindowInsetsController` 或 `Window.setColorMode()`）——若接入方未启用，则 SDK 的 HDR 渲染效果可能无法完整呈现；SDK 文档须在接入指南中明确说明此前提。
  - 假设 FEAT-001 的解码结果对象支持扩展 HDR 元数据字段——若 FEAT-001 当前实现不支持，则需在本 Feature Plan 阶段协商扩展契约。
- **约束**：
  - **平台版本**：HDR 渲染功能仅在 Android 14（API 34）及以上生效；低于 API 34 的设备一律走 SDR 渲染路径，不得因版本检测逻辑引入崩溃。
  - **格式范围**：当前仅支持 HEIF 和 JPEG 格式的 HDR 元数据检测，AVIF、WebP 等格式不在本期范围。
  - **系统 API 依赖**：HDR 渲染依赖 `android.graphics.gainmap` 包（API 34+ 可用），编译期需通过 `@RequiresApi(34)` 或 `Build.VERSION.SDK_INT` 守卫，防止低版本 APK 在运行时发生 `NoClassDefFoundError`。
  - **架构约束**：本 Feature 建立在 FEAT-001 图片解码管线之上，不得绕过 FEAT-001 自行实现图片解码逻辑。

## 需求追溯（预留，Story 拆解后填写）

> 说明：此表由 `/aisdd.featuretasks` 执行时自动回填（数据来源：`epic-design.md` §十二 Story 拆解的 FR/NFR 覆盖矩阵），用于确保 FR/NFR 被 Story 覆盖；Implement 不得擅自改写 FR/NFR。

| FR/NFR ID | 计划覆盖的 Story ID（Plan） | 任务覆盖（Tasks） | 备注 |
|---|---|---|---|
| FR-001 | ST-??? | T??? |  |
| FR-002 | ST-??? | T??? |  |
| FR-003 | ST-??? | T??? |  |
| FR-004 | ST-??? | T??? |  |
| FR-005 | ST-??? | T??? |  |
| NFR-PERF-001 | ST-??? | T??? |  |
| NFR-PERF-002 | ST-??? | T??? |  |
| NFR-POWER-001 | ST-??? | T??? |  |
| NFR-MEM-001 | ST-??? | T??? |  |
| NFR-SEC-001 | ST-??? | T??? |  |
| NFR-OBS-001 | ST-??? | T??? |  |
| NFR-REL-001 | ST-??? | T??? |  |
| NFR-REL-002 | ST-??? | T??? |  |

## 变更记录（增量变更）

| 版本 | 日期 | 变更范围 | 变更摘要 | 影响 | 是否需要回滚 |
|---|---|---|---|---|---|
| v0.1.0 | 2026-03-22 | 全文 | 初稿创建 | 无 | 否 |
