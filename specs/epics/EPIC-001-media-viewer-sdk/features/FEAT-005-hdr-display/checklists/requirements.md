# 需求质量检查清单：HDR 图片显示

**用途**：对 FEAT-005 spec.md 进行需求质量自检，确认规格文档在进入 Plan 阶段前满足最低质量门控要求
**创建时间**：2026-03-22
**功能**：[spec.md](../spec.md)

**说明**：本检查清单根据 FEAT-005 HDR 图片显示的具体需求内容生成，覆盖需求完整性、可测试性、边界覆盖、依赖明确性、NFR 量化、实体定义及假设约束等维度。

---

## 一、背景与价值完整性

- [ ] CHK001 背景说明了当前 SDK 无 HDR 渲染路径的痛点，且引用了具体 API 版本（Android 14 / API 34）
- [ ] CHK002 目标描述同时覆盖了"HDR 设备体验提升"和"非 HDR 设备无感知降级"两个方向
- [ ] CHK003 In Scope 列出了 5 项具体能力点，每一项均可独立判断是否完成
- [ ] CHK004 Out of Scope 明确排除了视频 HDR、接入方 UI 实现和非 HEIF/JPEG 格式，避免范围漂移
- [ ] CHK005 用户价值描述区分了"高端机用户"和"低端机/旧版用户"两类人群的不同收益

---

## 二、依赖关系明确性

- [ ] CHK006 上游依赖 FEAT-001 已明确接入契约（解��结果对象含文件格式、Bitmap 及元数据容器）
- [ ] CHK007 上游依赖的系统 API（Ultra HDR API、`Display.getHdrCapabilities()`）已列出具体 API 版本门槛
- [ ] CHK008 下游影响已说明对 FEAT-001 解码流程的潜在扩展需求（元数据字段扩展）
- [ ] CHK009 外部依赖故障模式覆盖了两种：Ultra HDR API 厂商实现异常、`getHdrCapabilities()` 返回空
- [ ] CHK010 依赖故障的期望处理行为（降级 SDR + warn 日志）在故障模式描述中已明确

---

## 三、用户旅程覆盖

- [ ] CHK011 旅程 1（HDR 设备正常显示）包含 3 个验收场景，覆盖 HEIF 含 HDR、JPEG 含 HDR、接入方禁用 HDR 三种子情况
- [ ] CHK012 旅程 2（非 HDR 设备 SDR 降级）包含 3 个验收场景，覆盖 API < 34、设备不支持 HDR、图片不含 HDR 元数据三种子情况
- [ ] CHK013 每个验收场景均使用"前提 / 当 / 则"结构，表述完整可执行
- [ ] CHK014 旅程 1 的成功信号包含可测量的技术指标（高光亮度超出 SDR 白点，可通过像素值比对验证）

---

## 四、边界与异常场景覆盖

- [ ] CHK015 覆盖了 API < 34 设备调用 Ultra HDR API 的场景，期望行为为版本检测提前分支、不触发 `NoSuchMethodError`
- [ ] CHK016 覆盖了 Ultra HDR API 运行时抛出异常的场景，期望行为为捕获 + 降级 SDR + warn 日志
- [ ] CHK017 覆盖了图片不含 HDR 元数据（普通 SDR 图片）的场景，期望行为为直接走 SDR 路径不影响性能
- [ ] CHK018 覆盖了设备支持 HDR 但图片不含 HDR 元数据的场景（HDR 检测为 false → SDR 路径）
- [ ] CHK019 覆盖了 Activity 生命周期变化（旋转/后台）期间 HDR 渲染的处理，期望行为包括取消任务和避免内存泄漏
- [ ] CHK020 覆盖了多图片快速切换（ViewPager 滑动）时的 HDR 能力检测重复调用问题，期望行为为结果缓存

---

## 五、FR 可测试性

- [ ] CHK021 FR-001（HDR 元数据检测）可通过已知含 HDR 元数据的测试图片集的单元测试验证
- [ ] CHK022 FR-002（设备 HDR 能力查询与缓存）可通过 mock `Display.getHdrCapabilities()` 验证调用次数 = 1
- [ ] CHK023 FR-003（三条件渲染路径决策）的三个条件每一个均可独立通过测试参数化验证（8 种组合全覆盖）
- [ ] CHK024 FR-004（异常降级 SDR）可通过 mock 注入异常验证降级行为和 warn 日志输出
- [ ] CHK025 FR-005（`hdrEnabled` 配置接口）可通过 SDK 配置 `false` 后验证渲染路径切换为 SDR

---

## 六、NFR 量化与验收方式

- [ ] CHK026 NFR-PERF-001 已量化 HDR 首帧 p95 ≤ 100ms、SDR p95 ≤ 80ms，并指定参考机型和测量工具（Perfetto/FrameMetrics）
- [ ] CHK027 NFR-PERF-002 已量化 HDR 能力缓存查询耗时 ≤ 1ms，并给出验收方式（调用次数 mock 验证）
- [ ] CHK028 NFR-POWER-001 已量化额外功耗增量 ≤ 15mAh/10min、指定参考机型（Pixel 8）和测量工具（Battery Historian）
- [ ] CHK029 NFR-MEM-001 已量化 HDR 内存峰值增量 ≤ 100%（相对 SDR Bitmap），并指定释放时机（`onDetachedFromWindow`）
- [ ] CHK030 NFR-SEC-001 明确了"只读"约束和"不持久化缓存"要求，验收方式为代码审查 + lint/detekt
- [ ] CHK031 NFR-OBS-001 定义了 4 个日志级别（DEBUG/INFO/WARN）的输出场景，且包含生产环境日志开关控制
- [ ] CHK032 NFR-REL-001 量化降级成功率为 100%，并指定 Robolectric 单元测试 CI 通过率 100% 作为验收
- [ ] CHK033 NFR-REL-002 明确了"不得引入 ANR"的约束，验收方式为 StrictMode 无主线程 IO 违规

---

## 七、验收��准（AC）完整性

- [ ] CHK034 AC-020 对应 EPIC 上下文中的 AC-020（HDR 效果可观测），已引用 FR-001, FR-002, FR-003
- [ ] CHK035 AC-021 对应 EPIC 上下文中的 AC-021（非 HDR 设备不崩溃），已引用 FR-003, FR-004, NFR-REL-001
- [ ] CHK036 AC-022 覆盖接入方禁用 HDR 配置场景，已引用 FR-005
- [ ] CHK037 AC-023 覆盖异常降级场景，已引用 FR-004, NFR-REL-001
- [ ] CHK038 AC-024 覆盖性能指标，已引用 NFR-PERF-001
- [ ] CHK039 AC-025 覆盖内存释放，已引用 NFR-MEM-001
- [ ] CHK040 所有 AC 均可通过自动化测试或可重复的手工测试步骤验证（无"主观判断"类 AC）

---

## 八、核心实体定义

- [ ] CHK041 `HdrImageMetadata` 实体定义了 3 个核心属性（`hasHdrMetadata`、`hdrType`、`sourceFormat`），属性类型和语义明确
- [ ] CHK042 `HdrRenderConfig` 实体定义了 `hdrEnabled` 配置项及默认值，关系说明了配置变更的生效时机
- [ ] CHK043 两个实体均未包含实现细节（无类名、无方法签名、无具体数据结构），仅描述业务语义和关系

---

## 九、假设与约束完整性

- [ ] CHK044 假设 1（Ultra HDR API 可正常调用）已说明不成立时的降级兜底方式（FR-004）
- [ ] CHK045 假设 2（宿主 Activity 已启用 HDR 窗口模式）已说明 SDK 文档须明确此前提
- [ ] CHK046 假设 3（FEAT-001 支持扩展 HDR 元数据字段）已说明不满足时的协商途径（Plan 阶段协商）
- [ ] CHK047 约束明确了 API 34 版本门槛，且说明了低版本的处理策略（一律 SDR，不崩溃）
- [ ] CHK048 约束明确了格式范围（仅 HEIF/JPEG），且排除了 AVIF/WebP 等格式
- [ ] CHK049 约束明确了编译期防护方式（`@RequiresApi(34)` 或 `Build.VERSION.SDK_INT` 守卫）
- [ ] CHK050 约束明确了架构约束（不得绕过 FEAT-001 自行实现解码）

---

## 十、需求遗漏风险确认

- [ ] CHK051 已确认：本 Feature 无需定义埋点/上报口径（HDR 功能不涉及用户行为数据采集）
- [ ] CHK052 已确认：本 Feature 无 A/B 实验需求（HDR 自动降级由设备能力决定，无需 A/B 分流）
- [ ] CHK053 已确认：HDR 渲染与图片缩放/手势操作（FEAT-001/FEAT-002）的交互场景无额外需求（HDR 渲染结果与 SDR 同等对待，手势逻辑不变）
- [ ] CHK054 已确认：SDK 升级时 `hdrEnabled` 配置接口需向后兼容（默认值 `true` 保证升级不影响现有接入方行为）

---

## 注意事项

- 完成检查项后请标记为：`[x]`
- 若某检查项不适用，请标记为：`[~]` 并在旁边说明原因
- 发现问题请直接在 spec.md 对应章节修订，修订后重新执行本清单
- 检查项按 CHK 编号顺序排列，便于在 gate-log 中引用
