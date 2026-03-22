# Feature 规格说明：Demo App

**Epic**：EPIC-001 - Android 媒体浏览 SDK
**Feature 类型**：Product Feature
**Feature ID**：FEAT-010
**Feature Version**：v0.1.0
**EPIC 分支**：`epic/EPIC-001-media-viewer-sdk`
**Feature 目录**：`specs/epics/EPIC-001-media-viewer-sdk/features/FEAT-010-demo-app/`
**创建时间**：2026-03-22
**状态**：草稿

## 背景与价值 *（必填）*

- **背景**：Android 媒体浏览 SDK（EPIC-001）提供了图片浏览、视频播放、实况图、HDR、GIF、沉浸式模式、幻灯片、双形态布局等丰富能力（FEAT-001 ~ FEAT-009）。SDK 接入方在正式集成前需要一个可运行的参考实现，以直观了解各功能场景的效果和标准接入姿势，降低接入学习成本。
- **目标**：提供一个涵盖全部 14 个演示场景（D-001 ~ D-014）的独立 Demo Android 应用，作为 SDK 功能验收的可执行参考，同时作为接入文档的配套代码示例。
- **价值**：SDK 接入方可通过直接运行 Demo App 快速理解各功能场景的效果与标准接入姿势；验收团队可通过 Demo App 对 SDK 全部核心功能进行端到端验证；Demo App 代码可直接复用为接入文档代码示例，减少文档维护成本。
- **范围（In Scope）**：
  - Demo App 作为独立 Android 模块与 SDK 一同提交，不打包进 SDK 产物
  - 覆盖 D-001 ~ D-014 全部 14 个演示场景，每个场景有独立入口和注释说明
  - Demo App 代码展示 SDK 的标准接入姿势，可作为接入文档代码示例参考
  - 测试素材（图片/视频/实况图）随代码提交，或在 README 中说明获取方式
  - 仅 View 体系实现（Android View / Fragment / Activity），不使用 Jetpack Compose
- **范围外（Out of Scope）**：
  - Jetpack Compose 接入方式（已确认仅交付 View 体系）
  - 正式上线发布（Demo App 仅用于演示和验收，不发布至应用市场）
  - 自动化 UI 测试（Demo App 验收以人工操作为主）
  - 多语言/国际化（Demo App 仅需中文或英文说明即可）

## 依赖关系 *（必填）*

- **上游依赖**：
  - FEAT-001（图片浏览核心）：D-001、D-002、D-009 场景的基础能力
  - FEAT-002（媒体 Pager）：D-003、D-005 ~ D-008、D-011 ~ D-013 场景的基础能力
  - FEAT-003（视频 Item）：D-003 场景
  - FEAT-004（实况图 Item）：D-004 场景
  - FEAT-005（HDR 显示）：D-009 场景
  - FEAT-006（沉浸式与 Indicator）：D-011、D-014 场景
  - FEAT-007（幻灯片）：D-012 场景
  - FEAT-008（双形态布局）：D-013 场景
  - FEAT-009（事件回调）：各场景的交互反馈
  - **所有 FEAT-001 ~ FEAT-009 全部完成后，FEAT-010 才可开始实现**
- **下游影响**：
  - Demo App 是 EPIC-001 的最终验收载体，所有 FEAT 的集成质量将在此体现
  - Demo App 代码将作为 SDK 接入文档的代码示例来源
- **外部依赖故障模式**：
  - 测试素材（超大图、HDR 图、GIF、实况图、视频）缺失或格式不符 → Demo App 对应场景无法演示，需在 README 中说明素材获取方式或提供占位提示
  - FEAT-001 ~ FEAT-009 任一 Feature 存在阻断性 Bug → Demo App 对应场景无法通过验收，需等待上游修复

## 验收与场景 *（必填）*

> 说明：本节用于"可测试"的需求验收；**不等同于技术 Story**（技术 Story 在 Plan 阶段拆分）。

### 核心用户旅程（���选但强烈建议）

#### 旅程 1 - 接入方浏览演示场景列表并验证功能

- **描述**：SDK 接入方（或验收工程师）在 Android 设备上安装 Demo App，从场景列表主界面选择任一演示场景，进入对应演示页面，操作并验证该场景的功能效果符合预期。
- **成功信号**：接入方无需阅读文档即可找到并体验所有 14 个演示场景，每个场景功能可正常操作且不崩溃。
- **验收场景**：
  1. **前提** Demo App 已安装在 Android 8.0（API 26）及以上设备，**当** 打开 App 进入主界面，**则** 显示 D-001 ~ D-014 的场景列表，每个场景有名称和简要说明。
  2. **前提** 主界面已显示场景列表，**当** 点击任一场景入口，**则** 进入对应演示页面，该场景的核心功能可正常操作（如 D-001 可缩放/平移/翻页，D-003 可播放视频等）。
  3. **前提** 某个演示场景页面已打开，**当** 按下返回键，**则** 返回场景列表主界面，无崩溃、无状态残留。

#### 旅程 2 - 接入方参考代码学习 SDK 接入姿势

- **描述**：SDK 接入工程师阅读 Demo App 源代码，参考特定场景（如 D-005 自定义布局）的实现代码，了解如何正确使用 SDK API 完成接入。
- **成功信号**：工程师无需额外咨询，仅通过阅读 Demo App 代码和注释，即可理解该场景的 SDK 接入步骤和关键 API 用法。
- **验收场景**：
  1. **前提** 工程师查看任一场景的 Activity/Fragment 源代码，**当** 阅读代码注释，**则** 注释清晰说明该场景演示的 SDK 能力、关键 API 调用点及参数含义。
  2. **前提** 工程师需要了解自定义布局接入方式（D-005 ~ D-008），**当** 查看对应 Demo 代码，**则** 代码结构清晰展示 SDK 自定义布局扩展点的使用方式，无冗余或误导性代码。

### 边界与异常场景（必填）

- 测试素材缺失（如超大图、HDR 图、GIF、实况图、视频文件未提交）→ 对应场景应显示占位提示（如"素材未找到，请参考 README 获取测试素材"），不崩溃
- 设备 API Level < 26（Android 8.0 以下）→ Demo App 不支持，安装时由系统拦截；若安装成功应在启动时提示"不支持该 Android 版本"并退出
- D-009（HDR 图片）在不支持 HDR 显示的设备上运行 → 降级展示 SDR 效果，页面有文字说明"当前设备不支持 HDR 显示，展示 SDR 效果"
- D-002（超大图）在低内存设备上加载 → 分块加载机制生效，不触发 OOM，允许加载速度较慢但不崩溃
- D-003 视频 Item 在无声音权限或静音模式下 → 视频静音播放，不崩溃，不弹出权限申请弹窗
- 从后台切回 Demo App 时视频/GIF 场景 → 恢复播放状态，不崩溃，不出现黑屏

## FR / NFR *（必填）*

### FR（Functional Requirements）

> 规则：每条 FR 必须**可测试**，避免"提升体验/更快/更稳定"这类不可验证表述。

- **FR-001**（D-001 普通图片浏览）：Demo App 必须提供 D-001 演示场景入口，加载不少于 3 张 JPEG/PNG/WebP 格式图片，用户能够对图片执行双指缩放（最大不低于 4x）、单指平移、双击恢复原始大小、左右翻页操作，且操作流畅无卡顿。
- **FR-002**（D-002 超大图浏览）：Demo App 必须提供 D-002 演示场景入口，加载不低于 5000万像素（建议 2 亿像素级）的超大图，采用分块加载策略，用户缩放到高倍率时能看到高清细节（非模糊缩放），整个加载过程不触发 OOM 崩溃。
- **FR-003**（D-003 图片+视频混合列表）：Demo App 必须提供 D-003 演示场景入口，同一 Pager 中混合图片 Item 和视频 Item，用户翻页后视频 Item 自动开始播放，图片 Item 正常展示，翻离视频 Item 后��频自动暂停。
- **FR-004**（D-004 实况图 Item）：Demo App 必须提供 D-004 演示场景入口，列表中含实况图 Item，用户长按实况图时触发动效播放（帧动画或短视频），松手后恢复静态封面。
- **FR-005**（D-005 自定义布局——图片+周边内容）：Demo App 必须提供 D-005 演示场景入口，Item 内图片四周有可见边框，图片外侧有文字或小图，图片上方叠加贴图层，上述自定义布局元素随 SDK Pager 翻页和缩放保持正确的相对位置。
- **FR-006**（D-006 自定义布局——图片+模糊背景）：Demo App 必须提供 D-006 演示场景入口，Item 内图片区域之外（上下或四周）填充模糊背景（使用图片本身内容模糊处理），模糊背景与图片之间无明显拼接缝。
- **FR-007**（D-007 自定义布局——无图片 Item）：Demo App 必须提供 D-007 演示场景入口，列表中某些 Item 完全不加载图片，展示地图视图或纯自定义 View，与图片 Item 混排翻页正常。
- **FR-008**（D-008 同一列表各页独立布局）：Demo App 必须提供 D-008 演示场景入口，列表中每个 Item 使用不同的自定义布局（至少 3 种不同布局），翻页切换时各 Item 布局独立正确渲染，互不干扰。
- **FR-009**（D-009 HDR 图片浏览）：Demo App 必须提供 D-009 演示场景入口，加载 HDR 图片，在支持 HDR 显示的设备上展示 HDR 效果，并在页面内提供 HDR/SDR 对比按钮或说明；在不支持 HDR 设备上显示 SDR 效果并给出文字说明。
- **FR-010**（D-010 GIF 动图浏览）：Demo App 必须提供 D-010 演示场景入口，加载不少于 1 个 GIF 动图，GIF 按原始帧率自动循环播放，用户可对 GIF 执行缩放和平移操作。
- **FR-011**（D-011 沉浸式模式切换）：Demo App 必须提供 D-011 演示场景入口，点击图片非操作区域可切换沉浸式状态：进入沉浸式时状态栏、Indicator 和菜单隐藏，退出时恢复显示，切换过程有平滑动画。
- **FR-012**（D-012 幻灯片自动播放）：Demo App 必须提供 D-012 演示场景入口，提供开启/关闭幻灯片（Slideshow）的控件，开启后列表以固定间隔自动翻页，Indicator 实时显示当前页进度，到达末页后循环回到首页。
- **FR-013**（D-013 双形态布局切换）：Demo App 必须提供 D-013 演示场景入口，演示展示态（图片+边框+文字）和浏览态（纯图片全屏）之间的切换，切换过程有动画过渡，两种形态下图片内容保持一致无闪烁。
- **FR-014**（D-014 自定义 Indicator）：Demo App 必须提供 D-014 演示场景入口，使用自定义 IndicatorAdapter 替换默认 Indicator 样式（例如使用数字页码或自定义图��代替默认圆点），自定义 Indicator 随翻页正确更新。
- **FR-015**（主界面场景列表）：Demo App 必须在启动后显示包含 D-001 ~ D-014 全部 14 个场景入口的列表界面，每个入口显示场景编号、名称和一句话简介，点击后进入对应演示页面。
- **FR-016**（代码注释）：每个演示场景对应的 Activity/Fragment 源码中，必须包含说明该场景演示目的、关键 SDK API 调用点的代码注释。

### NFR（Non-Functional Requirements）

> 规则：每条 NFR 必须**量化**并附带验收方式；细化评估在 Plan 阶段完成。

#### 性能（Performance）

- **NFR-PERF-001**：Demo App 冷启动至场景列表主界面显示完成，在 Android 8.0（API 26）中低端设备（3GB RAM）上 p90 ≤ 3s；验收方式：手动计时 5 次取 p90，或使用 `adb shell am start -W` 测量 TotalTime。
- **NFR-PERF-002**：从场景列表点击任意场景入口，至对应演示页面完成首帧渲染（图片/视频首帧可见），在 Android 8.0 中低端设备上 p90 ≤ 2s（超大图 D-002 场景除外，该场景允许首帧渲染 ≤ 5s）；验收方式：手动观测，超大图场景有分块加载进度提示。
- **NFR-PERF-003**：D-001 普通图片浏览场景下连续缩放/平移操作，帧率不低于 30fps（不出现明显丢帧卡顿）；验收方式：手动操作目视判断，或使用 GPU Profiler 抓帧验证。

#### 功耗（Power）

- **NFR-POWER-001**：Demo App 在非视频/GIF 播放状态下静止停留 1 分钟，前台功耗增量不超过普通 Android 应用基准（约 30mAh/h）；验收方式：Battery Historian 或目视判断设备发热，验收场景为 D-001 静止停留。
- **NFR-POWER-002**：D-003（视频播放）场景连续播放 5 分钟，设备无异常发热（不超过 45°C 机身温度）；验收方式：目视或温度检测 App。

#### 内存（Memory）

- **NFR-MEM-001**：Demo App 在 D-001 场景浏览 10 张图片后，Java 堆内存增量不超过 50MB（相比启动基线）；验收方式：Android Studio Memory Profiler 抓取堆快照对比。
- **NFR-MEM-002**：D-002 超大图场景加载并缩放操作后，不触发 OOM（OutOfMemoryError），允许使用 BitmapRegionDecoder 分块加载策略；验收方式：Logcat 无 OOM 错误，操作过程无崩溃。
- **NFR-MEM-003**：Demo App 在 D-001 ~ D-014 任意场景中，退出该场景并返回主界面后，内存应回收至接近启动基线（允许 ±20MB 偏差）；验收方式：Memory Profiler 对比进入/退出场景前后堆大小。

#### 安全与隐私（Security/Privacy）

- **NFR-SEC-001**：Demo App 仅使用本地测试素材（随代码提交或说明本地获取方式），不向任何外部服务器上传用户数据或设备信息；验收方式：Charles/Wireshark 抓包，确认无外网请求；或代码审查确认无网络权限调用。
- **NFR-SEC-002**：Demo App 不申请 READ_EXTERNAL_STORAGE、CAMERA、RECORD_AUDIO、LOCATION 等敏感权限（视频播放仅需 INTERNET 权限可选，但 Demo 使用本地素材时不需要）；验收方式：查看 AndroidManifest.xml 权限列表。

#### 可观测性（Observability）

- **NFR-OBS-001**：每个演示场景在进入时向 Logcat 输出场景编号和名称的 Info 级别日志（如 `DemoApp D-001: 普通图片浏览场景已启动`），便于验收时追踪操作路径；验收方式：adb logcat 过滤 `DemoApp` tag 确认输出。
- **NFR-OBS-002**：Demo App 发生任何未捕获异常（崩溃）时，Logcat 中应有完整的 Stack Trace；验收方式：触发边界场景（如素材缺失）时，检查 Logcat 是否有清晰错误信息而非静默失败。

#### 可靠性（Reliability）

- **NFR-REL-001**：D-001 ~ D-014 全部 14 个演示场景，在正常测试素材齐备的情况下，操作核心交互路径（见各 FR 描述）不触发 Force Close（崩溃）；验收方式：逐一执行各场景的核心操作路径，Logcat 无 FATAL EXCEPTION。
- **NFR-REL-002**：Demo App 在 Android 8.0（API 26）、Android 10（API 29）、Android 12（API 31）、Android 14（API 34）四个代表性版本上均可正常安装运行，所有场景无系统兼容性崩溃；验收方式：多版本模拟器或真机冒烟测试。
- **NFR-REL-003**：Demo App 可独立编译运行，不依赖特殊环境配置（如内部 Maven 仓库、VPN 等）；验收方式：在全新 Android Studio 环境下 clone 代码后直接 Build & Run 成功。

## 验收标准（Feature Level）*（必填）*

- **AC-046**：无需额外配置即可在 Android 8.0（API 26）及以上设备上安装运行 Demo App（引用 NFR-REL-003）
- **AC-047**：D-001 ~ D-014 所有 14 个演示场景均可在 Demo App 中操作验证，每个场景的核心交互路径不崩溃（引用 FR-001 ~ FR-014、NFR-REL-001）
- **AC-048**：Demo App 代码结构清晰，每个场景有对应的入口 Activity/Fragment 和代码注释（引用 FR-015、FR-016）
- **AC-049**：Demo App 冷启动至主界面时间 p90 ≤ 3s（中低端设备），各场景首帧渲染 p90 ≤ 2s（D-002 超大图 ≤ 5s）（引用 NFR-PERF-001、NFR-PERF-002）
- **AC-050**：Demo App 不向外部服务器上传数据，不申请敏感权限（引用 NFR-SEC-001、NFR-SEC-002）
- **AC-051**：测试素材缺失时，Demo App 对应场景显示占位提示而非崩溃（引用边界场景定义）
- **AC-052**：Demo App 在 Android 8.0、10、12、14 四个版本上均可正常安装运行（引用 NFR-REL-002）

## 核心实体（如涉及数据则必填）

- **DemoScenario（演示场景）**：Demo App 的核心组织单位，共 14 个（D-001 ~ D-014）。核心属性：场景编号（sceneId，如 D-001）、场景名称（name）、一句话简介（description）、入口组件（entryClass，指向对应 Activity/Fragment 类名）。关系：每个 DemoScenario 对应一个入口组件，入口组件使用 SDK 的一个或多个核心 API。
- **TestAsset（测试素材）**：每个演示场景所需的媒体文件。核心属性：素材类型（assetType，枚举：IMAGE_JPEG / IMAGE_PNG / IMAGE_WEBP / IMAGE_GIF / IMAGE_HDR / IMAGE_EXTRA_LARGE / VIDEO / LIVE_PHOTO）、文件路径（filePath，assets 目录内相对路径）、所属场景（sceneId）。关系：一个 DemoScenario 可关联多个 TestAsset；TestAsset 随代码提交或在 README 中说明获取方式。
- **SceneListItem（场景列表条目）**：主界面列表中每一行的展示数据。核心属性：场景编号、名称、简介���关系：由主界面 Activity 从 DemoScenario 定义列表构建，点击后启动对应 entryClass。

## 假设与约束 *（必填）*

- **假设**：
  - 所有 FEAT-001 ~ FEAT-009 在 FEAT-010 开始实现前已全部完成且 API 稳定；若假设不成立，Demo App 对应场景暂时使用占位实现，待上游 Feature 完成后补全。
  - 测试素材（尤其是 2 亿像素超大图、HDR 图、实况图）已准备就绪或有明确获取来源；若假设不成立，README 中说明素材获取方式，对应场景展示占位提示。
  - SDK 以本地模块依赖方式在 Demo App 中引用（非远程 Maven 依赖）；若改为远程依赖，需更新 Demo App 的 build.gradle 配置。
- **约束**：
  - 最低支持 Android 8.0（API 26）；API < 26 设备不支持
  - 仅 View 体系（Android View / Fragment / Activity），不使用 Jetpack Compose
  - Demo App 不发布至应用市场，不需要签名配置（使用 debug 签名即可）
  - 代码须通过 Kotlin 编写（与 SDK 主体语言一致）
  - Demo App 不属于 SDK 产物，不需要混淆（ProGuard/R8）

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
| FR-012 | ST-??? | T??? |  |
| FR-013 | ST-??? | T??? |  |
| FR-014 | ST-??? | T??? |  |
| FR-015 | ST-??? | T??? |  |
| FR-016 | ST-??? | T??? |  |
| NFR-PERF-001 | ST-??? | T??? |  |
| NFR-PERF-002 | ST-??? | T??? |  |
| NFR-PERF-003 | ST-??? | T??? |  |
| NFR-POWER-001 | ST-??? | T??? |  |
| NFR-POWER-002 | ST-??? | T??? |  |
| NFR-MEM-001 | ST-??? | T??? |  |
| NFR-MEM-002 | ST-??? | T??? |  |
| NFR-MEM-003 | ST-??? | T??? |  |
| NFR-SEC-001 | ST-??? | T??? |  |
| NFR-SEC-002 | ST-??? | T??? |  |
| NFR-OBS-001 | ST-??? | T??? |  |
| NFR-OBS-002 | ST-??? | T??? |  |
| NFR-REL-001 | ST-??? | T??? |  |
| NFR-REL-002 | ST-??? | T??? |  |
| NFR-REL-003 | ST-??? | T??? |  |

## 变更记录（增量变更）

| 版本 | 日期 | 变更范围 | 变更摘要 | 影响 | 是否需要回滚 |
|---|---|---|---|---|---|
| v0.1.0 | 2026-03-22 | 全文 | 初稿创建，覆盖 D-001 ~ D-014 全部演示场景 | 无（新建） | 否 |
