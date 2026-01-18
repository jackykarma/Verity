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
- **成功标准（EPIC Level）**：[可量化成功指标，避免实现细节]

## 范围 *（必填）*

- **In Scope**：[EPIC 明确包含的内容]
- **Out of Scope**：[EPIC 明确排除的内容]

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
> 推荐做法（强烈建议）：
> - **埋点/可观测性**：若 EPIC 存在“产品埋点 + 技术埋点”要求，建议单独创建一个 **Capability Feature**（例如 `数据能力：埋点与可观测性规范与SDK`），统一事件口径/字段/隐私策略/采样与落库/告警等。
> - **动效/交互体验**：若存在大量“特殊动效/交互规范”，建议单独创建一个 **Capability Feature**（例如 `体验能力：动效与交互组件库`），统一动效资产、组件、性能预算与验收方式。
> - **算法能力**：建议**每一个算法能力/模型**单独创建一个 **Capability Feature**（例如 `算法能力：XXX模型端侧推理与SDK`）。该 Feature 必须覆盖：模型产物提供、推理部署（端侧/服务端）、工程化封装（SDK/接口）、评估与回退策略。

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

## Feature Registry（自动同步区）

> 说明：本区块由 `/speckit.epicsync` 自动增量更新，用于提供 EPIC 的统一视图。
> - 开发者可手工补充“备注”列，但不要修改表头与 `BEGIN/END` 标记。

<!-- BEGIN_FEATURE_REGISTRY -->
| Feature | 分支 | Feature Version | Plan Version | Tasks Version | Full Design | 状态 | 备注 |
|---|---|---|---|---|---|---|---|
| [Feature A] | 001-feature-a | v0.1.0 | v0.1.0 | v0.1.0 | full-design.md | Plan Ready |  |
<!-- END_FEATURE_REGISTRY -->

## 变更记录（增量变更）

| 版本 | 日期 | 变更摘要 | 影响 Feature | 是否需要回滚设计 |
|---|---|---|---|---|
| v0.1.0 | [YYYY-MM-DD] | 初始版本 |  | 否 |

