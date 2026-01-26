---
description: "EPIC 规格说明模板（输入为大需求容器，输出 Feature 列表与边界）"
---

# EPIC 规格说明：[EPIC 名称]

**EPIC ID**：EPIC-[编号]
**EPIC Version**：v0.1.0
**创建时间**：[YYYY-MM-DD]
**状态**：草稿 / 待澄清 / 就绪（可拆分 Feature） / 冻结（执行中）
**输入**：`"$ARGUMENTS"`

## 背景、目标与价值 *（必填）*

- **背景**：[为什么要做？]
- **目标**：[EPIC 级目标（业务/用户/平台）]
- **价值**：[预期收益与影响面]
- **产品竞争力**：[差异化优势/用户体验亮点/市场定位/商业模式创新]
- **技术竞争力**：[技术壁垒/架构先进性/性能优势/创新算法/专利潜力]
- **成功标准（EPIC Level）**：[可量化成功指标，避免实现细节]

## 范围 *（必填）*

- **In Scope**：[EPIC 明确包含的内容]
- **Out of Scope**：[EPIC 明确排除的内容]
- **上项范围**：
  - 地区：[国内/海外/全球，具体市场]
  - 销售渠道：[内销/外销/全渠道]
  - 设备类型：[手机/平板/折叠屏/穿戴/IoT]
  - 机型定位：[旗舰/高端/中端/低端/全系列]
  - OS 版本：[Android 版本要求，如 Android 12+/API Level 31+]
  - 保密等级：[公开/内部/机密/绝密]
- **上项节奏**：[分批上项计划/灰度策略/全量时间点]

## 约束与假设 *（必填）*

- **约束**：[平台/版本/合规/组织/依赖等]
- **假设**：[若假设不成立的影响与应对]

## 依赖关系 *（必填）*

- **上游依赖**：[系统/团队/资源/时间]
- **下游影响**：[受影响模块/用户/流程]
- **外部依赖故障模式**：[不可用/超时/限流/返回不一致]

## EPIC 级风险与里程碑（可选但建议）

### 风险

| 风险ID | 风险描述 | 触发条件 | 影响范围 | 严重度 | 缓解策略 |
|---|---|---|---|---|---|
| EPIC-RISK-001 |  |  |  | High/Med/Low |  |

### 里程碑

| 里程碑 | 交付物 | 进入条件 | 完成条件 |
|---|---|---|---|
| M1 | Feature 列表就绪 | EPIC 澄清完成 | Feature 列表评审通过 |

## Feature 拆分（EPIC → Feature）*（必填）*

> 规则：
> - 每个 Feature 必须可独立交付（Product / Platform-Capability）。
> - FR/NFR 属于 Feature，不属于 EPIC；EPIC 只提供边界与方向。
> - 本节输出用于后续逐个运行 `/speckit.feature` 创建 Feature 文档目录与 spec.md（本工作流不为 Feature 创建 git 分支）。

### Feature 列表（候选）

| Feature 名称 | Feature 类型 | 业务/技术价值 | 主要用户/场景 | 依赖 | 关键 NFR 关注点 | 优先级 |
|---|---|---|---|---|---|---|
| [Feature A] | Product / Platform |  |  |  | 性能/功耗/内存/安全/可观测性 | P1/P2/P3 |

### Feature 边界说明（每个 Feature 必填）

#### Feature A - [名称]

- **类型**：Product / Platform/Capability
- **范围（In/Out）**：
- **依赖**：
- **验收意图**：[高层验收意图；FR/NFR 在 Feature spec 里细化]
- **拆分动机**：[为何单独交付？]
- **建议下一步**：运行 `/speckit.feature`，输入：`[一句话 Feature 描述]`

## 通用能力（跨 Feature Capability）*（必填，若存在）*

> 说明：这里用于记录**跨 Feature 的平台能力/设计决策/通用组件**，避免分散在各 Feature spec 中。
> - 可以作为“Capability Feature”出现在 Feature 列表中，但其设计建议优先集中在本节。
> - 具体实现仍可拆成一个或多个 Feature/Story/Task，由 Feature 工件承载。
>
> 强制做法（必须遵守）：
> - **埋点/可观测性**：若 EPIC 存在“产品埋点 + 技术埋点”要求，必须单独创建一个 **Capability Feature**（例如 `数据能力：埋点与可观测性规范与SDK`），统一事件口径/字段/隐私策略/采样与落库/告警等。
> - **动效/交互体验**：若存在大量“特殊动效/交互规范”，必须单独创建一个 **Capability Feature**（例如 `体验能力：动效与交互组件库`），统一动效资产、组件、性能预算与验收方式。
> - **算法能力**：**每一个算法能力/模型**必须单独创建一个 **Capability Feature**（例如 `算法能力：XXX模型端侧推理与SDK`）。该 Feature 必须覆盖：模型产物提供、推理部署（端侧/服务端）、工程化封装（SDK/接口）、评估与回退策略。

### 能力清单

| 能力名称 | 类型（Design/Enabler/Infrastructure/Optimization） | 作用范围（哪些 Feature） | 交付物形态（SDK/资源包/配置/模型/服务） | 关键接口/契约 | 关键约束（含隐私/性能预算） | 状态 |
|---|---|---|---|---|---|---|
| [能力1] |  |  |  |  |  | 规划中/进行中/已完成 |

### 能力 → Capability Feature 映射（建议）

> 说明：当某能力需要“可独立交付 + 可版本化 + 可复用 + 可验收”，应升级为 Capability Feature，并在此登记，避免业务 Feature 里重复实现。

| 能力名称 | 建议 Capability Feature（名称/ID） | 原因（复用/一致性/验收/风险） | 依赖它的业务 Feature |
|---|---|---|---|
| 埋点/可观测性 | FEAT-??? | 统一口径与隐私合规；避免多处重复埋点 | FEAT-??? |
| 动效合集/交互规范 | FEAT-??? | 资产复用；性能预算统一；验收一致 | FEAT-??? |
| 算法能力：[模型A] | FEAT-??? | 模型/推理/SDK 需版本化；回退策略统一 | FEAT-??? |

## 跨 Feature 技术策略（在任意 Feature plan 之前完成）*（必填）*

> **目的**：在各 Feature 开始 plan 设计之前，识别跨 Feature 的共享技术能力，避免重复设计，统一技术口径。
>
> **时机**：在所有 Feature `spec.md` 完成之后、任意 Feature `plan.md` 开始之前填写。
>
> **强制规则**：
> - 后续每个 Feature 在开始 plan 之前，**必须先阅读本章节**
> - 若 Feature plan 中需要设计的组件已在此登记为"由其他 Feature 提供"，则**必须复用**，不得另起炉灶
> - 若发现新的共享需求，必须**先更新本章节**，再继续 Feature plan

### 共享能力识别（跨 Feature 技术组件）

> 识别多个 Feature 都可能用到的技术组件/框架/基础设施，明确由哪个 Feature 负责设计（Owner）。

| 共享能力名称 | 类型 | 涉及 Feature | Owner Feature | 消费方 Feature | 设计状态 | 备注 |
|---|---|---|---|---|---|---|
| [例如：UI 基础框架] | Infrastructure | A, B, C | FEAT-001 | FEAT-002, FEAT-003 | 待设计 | 主题、布局、导航 |
| [例如：数据持久层] | Infrastructure | A, B | FEAT-001 | FEAT-002 | 待设计 | Room + 迁移策略 |
| [例如：网络层封装] | Infrastructure | B, C | FEAT-002 | FEAT-003 | 待设计 | Retrofit + 错误处理 |
| [例如：通用错误处理] | Enabler | All | FEAT-001 | All | 待设计 | 统一错误码 + 用户提示 |

> 类型说明：
> - **Infrastructure**：基础设施（UI框架、数据层、网络层、存储层等）
> - **Enabler**：使能组件（错误处理、日志、配置、权限等）
> - **Capability**：业务能力（应作为独立 Capability Feature，见"通用能力"章节）

### Feature Plan 执行顺序（基于依赖关系）

> 根据共享能力的依赖关系，确定 Feature plan 的执行顺序。Owner Feature 必须先完成 plan。

| 顺序 | Feature | 原因 | 依赖（需要先完成 plan 的 Feature） | 提供的共享能力 |
|---|---|---|---|---|
| 1 | FEAT-001 | 设计基础设施（UI/Data/错误处理） | 无 | UI框架, 数据层, 错误处理 |
| 2 | FEAT-002 | 设计网络层 | FEAT-001（UI框架） | 网络层 |
| 3 | FEAT-003 | 纯业务，依赖基础设施 | FEAT-001, FEAT-002 | 无 |

### 技术约束（所有 Feature plan 必须遵守）

> 在此定义跨 Feature 的技术约束，后续 Feature plan 不得违反。

- **UI 框架**：由 [Owner Feature] 设计后，其他 Feature 必须复用，不得另起炉灶
- **数据层**：统一使用 [技术选型]，迁移策略由 [Owner Feature] 定义
- **错误处理**：统一错误码体系，由 [Owner Feature] 设计
- **线程模型**：[统一约束，如：IO 操作统一使用 Dispatchers.IO]
- **依赖注入**：[统一约束，如：统一使用 Hilt]

### 技术策略变更记录

| 版本 | 日期 | 变更内容 | 影响 Feature | 变更原因 |
|---|---|---|---|---|
| v0.1.0 | [YYYY-MM-DD] | 初始版本 |  |  |

## 整体 FR / NFR（EPIC Level）*（必填）*

> 说明：
> - 这里记录 EPIC 级别的“整体需求/约束”，用于统一方向与验收口径（例如全链路性能、功耗上限、隐私合规）。
> - Feature 的 FR/NFR 仍在各自 `spec.md` 中详细化，但必须与本节保持一致，不得冲突。

### EPIC-FR（跨 Feature 的功能目标）

- **EPIC-FR-001**：[跨 Feature 的能力目标（用户可感知的端到端目标）]

### EPIC-NFR（跨 Feature 的非功能约束）

- **EPIC-NFR-PERF-001**：[端到端性能预算/阈值]
- **EPIC-NFR-POWER-001**：[端到端功耗预算/阈值]
- **EPIC-NFR-MEM-001**：[端到端内存预算/阈值]
- **EPIC-NFR-SEC-001**：[统一安全/隐私/合规约束]
- **EPIC-NFR-OBS-001**：[统一可观测性/埋点口径]

## EPIC 验收（端到端）*（必填）*

> 说明：
> - EPIC 验收关注**跨 Feature 的端到端场景**，而非单个 Feature 的功能验收（后者在 Feature spec 中定义）。
> - 验收标准必须与"成功标准"和"EPIC-FR/NFR"对应，形成闭环。

### 验收前置条件

- [ ] 所有 Feature 验收通过（参见 Feature Registry 状态）
- [ ] 跨 Feature 集成测试完成
- [ ] EPIC-NFR 指标采集就绪（性能/功耗/内存/安全）
- [ ] 上项范围内的机型/OS 版本覆盖验证

### 端到端验收场景

| 场景ID | 场景描述 | 涉及 Feature | 验收方法 | 通过准则 | 关联 EPIC-FR/NFR |
|---|---|---|---|---|---|
| E2E-001 | [用户核心路径场景] | FEAT-001, FEAT-002 | [手工/自动化/压测] | [量化指标] | EPIC-FR-001 |
| E2E-002 | [端到端性能场景] | 全部 | [性能测试] | [P50/P90/P99 指标] | EPIC-NFR-PERF-001 |
| E2E-003 | [端到端功耗场景] | 全部 | [功耗测试] | [mAh/场景] | EPIC-NFR-POWER-001 |

### 验收通过准则

- [ ] 所有 E2E 场景通过
- [ ] EPIC-NFR 指标全部达标
- [ ] 无 P0/P1 级遗留问题
- [ ] 上项范围内无兼容性阻塞
- [ ] 隐私/安全/合规审核通过

### 验收结论（执行时填写）

- **验收日期**：[YYYY-MM-DD]
- **验收结论**：通过 / 有条件通过 / 不通过
- **遗留问题**：[若有条件通过，列出遗留项及跟进计划]
- **签字确认**：[产品/技术/测试负责人]

## Feature Registry（自动同步区）

> 说明：本区块由 `/speckit.epicsync` 自动增量更新，用于提供 EPIC 的统一视图。
> - 开发者可手工补充“备注”列，但不要修改表头与 `BEGIN/END` 标记。

<!-- BEGIN_FEATURE_REGISTRY -->
| Feature | 分支 | Feature Version | Plan Version | Tasks Version | 状态 | 备注 |
|---|---|---|---|---|---|---|
| [Feature A] | 001-feature-a | v0.1.0 | v0.1.0 | v0.1.0 | Plan Ready |  |
<!-- END_FEATURE_REGISTRY -->

## 变更记录（增量变更）

| 版本 | 日期 | 变更摘要 | 影响 Feature | 是否需要回滚设计 |
|---|---|---|---|---|
| v0.1.0 | [YYYY-MM-DD] | 初始版本 |  | 否 |

