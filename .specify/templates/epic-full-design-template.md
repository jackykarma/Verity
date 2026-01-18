---
description: "EPIC Full Design 技术方案模板（整合多个 Feature 的 Plan/Story/Task，统一指导）"
---

# EPIC Full Design：[EPIC 名称]

**EPIC ID**：EPIC-[编号]
**EPIC Version**：v0.1.0
**EPIC Full Design Version**：v0.1.0
**日期**：[YYYY-MM-DD]

**输入工件**：
- `specs/epics/<EPIC-xxx-...>/epic.md`（EPIC 总览）
- 各 Feature 的 `spec.md` / `plan.md` / `tasks.md` / `full-design.md`（按实际存在）

> Agent 规则（强制）：
> - 本文档只做**跨 Feature 的整合与一致性呈现**，不得新增新的技术决策。
> - 若发现冲突或缺口，只能标注 `TODO(Clarify)` 并指向应修改的 Feature/Plan。

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

## 2. 0 层架构概览（EPIC 级）

> 说明：基于各 Feature 的 plan.md 进行汇总，若存在差异必须显式指出来源差异，不得强行统一。

```mermaid
flowchart LR
  %% TODO(Clarify): 若各 Feature 的 0 层图不一致，需先在对应 plan.md 对齐
```

## 3. Feature → Story → Task 汇总追溯

### 3.1 Feature 列表与状态（来自 epic.md Feature Registry）

| Feature | 分支 | Feature Version | Plan Version | Tasks Version | 状态 |
|---|---|---|---|---|---|
|  |  |  |  |  |  |

### 3.2 Story 汇总（跨 Feature）

| Feature | Story ID | 类型 | 目标 | 覆盖 FR/NFR | 依赖 | 关键风险 |
|---|---|---|---|---|---|---|
|  | ST-001 |  |  |  |  |  |

### 3.3 追溯矩阵（EPIC-FR/NFR → Feature-FR/NFR → Story → Task）

| EPIC FR/NFR | Feature | Feature FR/NFR | Story | Task | 验证方式 | 备注 |
|---|---|---|---|---|---|---|
| EPIC-NFR-PERF-001 |  | NFR-PERF-001 | ST-??? | T??? |  |  |

## 4. 跨 Feature 通用能力设计（来自 epic.md + 各 Feature plan）

| 能力 | 设计要点（引用来源） | 关键接口/契约（引用来源） | 风险 | 影响 Feature |
|---|---|---|---|---|
|  |  |  |  |  |

## 5. 风险与一致性问题（汇总）

- **跨 Feature 冲突**：TODO(Clarify)
- **接口/数据模型不一致**：TODO(Clarify)
- **NFR 预算冲突（性能/功耗/内存）**：TODO(Clarify)

## 6. 执行指引（不新增 Task）

- 每个 Feature 按各自 `tasks.md` 执行
- 任何跨 Feature 变更必须先更新对应 Feature 的 plan/spec，并运行 `/speckit.epicsync` 更新总览

