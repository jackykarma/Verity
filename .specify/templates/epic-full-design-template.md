---
description: "EPIC Full Design 技术方案模板（跨 Feature 一致性检查与冲突汇总）"
---

# EPIC Full Design：[EPIC 名称]

**EPIC ID**：EPIC-[编号]
**EPIC Version**：v0.1.0
**EPIC Full Design Version**：v0.1.0
**日期**：[YYYY-MM-DD]

**输入工件**：
- `specs/epics/<EPIC-xxx-...>/epic.md`（EPIC 总览）
- 各 Feature 的 `spec.md` / `plan.md` / `tasks.md`（按实际存在）

> Agent 规则（强制）：
> - 本文档**只做跨 Feature 的一致性检查与冲突汇总**，不得新增技术决策。
> - 若发现冲突或缺口，只能标注 `TODO(Clarify)` 并指向应修改的 Feature/Plan。
> - 详细设计内容在各 Feature 的 `plan.md` 中，本文档只做引用和一致性对比。
>
> **图表规范**：所有 Mermaid 图表必须遵循 `.cursor/rules/mermaid-style-guide.mdc` 中定义的 Material Design 配色方案。

## 变更记录（增量变更）

| 版本 | 日期 | 变更摘要 | 影响 Feature | 是否需要回滚设计 |
|---|---|---|---|---|
| v0.1.0 | [YYYY-MM-DD] | 初始版本 |  | 否 |

## 1. EPIC 总览（来自 epic.md）

- **背景/目标/价值**：
- **范围 In/Out**：
- **约束与假设**：
- **整体 FR/NFR（EPIC Level）**：
- **通用能力（Capability）**：

> 详细内容参见 `epic.md`

## 2. 外部依赖一致性（跨 Feature）

> 目的：汇总各 Feature 对外部系统的依赖，检查通信方式、故障策略是否一致。

### 2.1 外部系统与依赖汇总

| 外部系统/依赖 | 类型 | 涉及 Feature | 通信方式 | 故障模式 | 我方策略 | 差异/冲突点 | 引用来源 |
|---|---|---|---|---|---|---|---|
|  |  |  |  |  |  |  | FEAT-xxx plan.md:A2.2 |

### 2.2 通信策略一致性问题

| 策略项 | 涉及 Feature | Feature A 策略 | Feature B 策略 | 不一致点 | 处理建议 |
|---|---|---|---|---|---|
| 超时/重试 |  |  |  |  |  |
| 限流/降级 |  |  |  |  |  |
| 错误处理 |  |  |  |  |  |

## 3. 模块与契约一致性（跨 Feature，核心）

> 目的：从 EPIC 视角建立模块目录与映射，检查跨 Feature 的接口/契约/数据模型是否一致。

### 3.1 EPIC 模块目录（Catalog）

| EPIC 模块 | 职责边界 | 涉及 Feature | 提供的接口（引用） | 依赖的接口（引用） | 差异/冲突点 | 引用来源 |
|---|---|---|---|---|---|---|
| [EPIC 模块A] |  | FEAT-xxx, FEAT-yyy | FEAT-xxx plan.md:B4.1 | FEAT-yyy plan.md:B4.2 |  | epic.md + FEAT-xxx plan |

### 3.2 EPIC 模块 ↔ Feature 模块映射

| EPIC 模块 | 来源 Feature | Feature 模块（来自 plan.md:A3.1） | 关系类型 | 引用来源 | 备注/差异 |
|---|---|---|---|---|---|
| [EPIC 模块A] | FEAT-xxx | [模块名] | Owned-by | FEAT-xxx plan.md:A3.1 |  |

### 3.3 接口协议一致性问题

| 模块/能力 | 涉及 Feature | 接口/契约（引用） | 版本/兼容策略 | 不一致点 | 风险 | 处理建议 |
|---|---|---|---|---|---|---|
|  |  |  |  |  |  |  |

### 3.4 数据模型一致性问题

| 数据实体/表/存储键 | 涉及 Feature | 物理结构（引用） | 迁移策略（引用） | 不一致点 | 风险 | 处理建议 |
|---|---|---|---|---|---|---|
|  |  |  |  |  |  |  |

### 3.5 外部依赖契约一致性问题

| 依赖项 | 涉及 Feature | 调用级契约（引用） | 超时/重试策略 | 降级策略 | 不一致点 | 风险 |
|---|---|---|---|---|---|---|
|  |  |  |  |  |  |  |

## 4. Feature → Story 追溯汇总

### 4.1 Feature 列表与状态（来自 epic.md Feature Registry）

| Feature | 分支 | Feature Version | Plan Version | Tasks Version | 状态 |
|---|---|---|---|---|---|
|  |  |  |  |  |  |

### 4.2 追溯矩阵（EPIC-FR/NFR → Feature → Story）

| EPIC FR/NFR | Feature | Feature FR/NFR | Story | 验证方式 | 备注 |
|---|---|---|---|---|---|
| EPIC-NFR-PERF-001 |  | NFR-PERF-001 | ST-??? |  |  |

## 5. 风险与一致性问题汇总

> 本节汇总所有跨 Feature 的风险与一致性问题，便于评审与跟踪。

### 5.1 一致性问题清单

| 问题ID | 类型 | 涉及 Feature | 问题描述 | 风险等级 | 处理建议 | 状态 |
|---|---|---|---|---|---|---|
| EPIC-ISS-001 | 接口不一致 |  |  | High/Med/Low |  | Open/Resolved |

### 5.2 风险清单

- **跨 Feature 冲突**：TODO(Clarify)
- **接口/数据模型不一致**：TODO(Clarify)
- **NFR 预算冲突（性能/功耗/内存）**：TODO(Clarify)

## 6. 执行指引

- 每个 Feature 按各自 `plan.md` 和 `tasks.md` 执行
- 任何跨 Feature 变更必须先更新对应 Feature 的 plan/spec，并运行 `/speckit.epicsync` 更新总览
- 一致性问题需在对应 Feature 的 plan.md 中修复后，更新本文档状态
