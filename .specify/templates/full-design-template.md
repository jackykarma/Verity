---
description: "Full Design 技术方案文档模板（整合 Plan + Story + Task，供评审与执行）"
---

# Full Design：[Feature 名称]

**Epic**：EPIC-[编号] - [名称]
**Feature ID**：FEAT-[编号或沿用分支号，例如 001]
**Feature Version**：v0.1.0
**Plan Version**：v0.1.0
**Tasks Version**：v0.1.0（若 tasks.md 尚未生成，标注为 N/A）
**Full Design Version**：v0.1.0

**分支**：`[###-feature-short-name]`
**日期**：[YYYY-MM-DD]
**输入工件**：
- `spec.md`
- `plan.md`
- `tasks.md`（可选）
- `research.md` / `data-model.md` / `contracts/` / `quickstart.md`（按实际存在）

> Agent 规则（强制）：
> - 本文档**只能整合现有产物**（spec/plan/tasks 等），**不得新增技术决策**。
> - 若遇到决策缺口，只能标注为 `TODO(Clarify): ...` 并指向应补齐的来源文档/章节。
> - 本文档用于评审与执行：层次必须清晰、结构化、可追溯。

## 变更记录（增量变更）

| 版本 | 日期 | 变更范围（Feature/Story/Task） | 变更摘要 | 影响模块 | 是否需要回滚设计 |
|---|---|---|---|---|---|
| v0.1.0 | [YYYY-MM-DD] | Feature | 初始版本 |  | 否 |

## 1. 背景与范围（来自 spec.md）

- **背景**：
- **目标**：
- **价值**：
- **In Scope**：
- **Out of Scope**：
- **依赖关系**：

## 2. 0 层架构概览（来自 plan.md）

```mermaid
flowchart LR
  %% 直接复用 plan.md 的 0 层图；不得引入新模块决策
```

## 3. 1 层模块设计（来自 plan.md）

| 模块 | 职责 | 输入/输出 | 依赖 | 约束 |
|---|---|---|---|---|
|  |  |  |  |  |

## 4. 关键流程（正常 + 异常）（来自 plan.md）

### 4.1 正常流程

```mermaid
sequenceDiagram
  %% 复用 plan.md 内容
```

### 4.2 异常流程

```mermaid
flowchart TD
  %% 复用 plan.md 内容
```

## 5. Feature → Story → Task 追溯关系

> 规则：
> - Feature 层：FR/NFR（来自 spec.md）
> - Story 层：ST-xxx（来自 plan.md 的 Story Breakdown）
> - Task 层：Txxx（来自 tasks.md；若缺失则先留空并标注“待生成”）

### 5.1 Story 列表（来自 plan.md）

| Story ID | 类型 | 目标 | 覆盖 FR/NFR | 依赖 | 关键风险 |
|---|---|---|---|---|---|
| ST-001 |  |  |  |  |  |

### 5.2 追溯矩阵（FR/NFR → Story → Task）

| FR/NFR ID | Story ID | Task ID | 验证方式（来自 tasks.md） | 备注 |
|---|---|---|---|---|
| FR-001 | ST-001 | T??? | [待 tasks.md] |  |

## 6. 技术风险与消解策略（来自 plan.md）

| 风险ID | 风险描述 | 触发条件 | 影响范围 | 严重度 | 消解策略 | 对应 Story/Task |
|---|---|---|---|---|---|---|
| RISK-001 |  |  |  |  |  |  |

## 7. 异常 & 边界场景梳理（来自 spec.md + plan.md）

- **数据边界**：
- **状态边界**：
- **生命周期**：
- **并发**：
- **用户行为**：

## 8. 埋点/可观测性设计（来自 spec.md NFR-OBS + plan.md 约束）

> 注意：只整合既有要求；不要新增指标口径或埋点策略决策。

| 事件/指标 | 触发点 | 字段 | 采样/频率 | 用途 | 关联 FR/NFR |
|---|---|---|---|---|---|
|  |  |  |  |  |  |

## 9. 算法 / 性能 / 功耗 / 内存评估结果（来自 plan.md）

### 9.1 算法评估

- **目标**：
- **指标**：
- **验收标准**：
- **测试方法**：

### 9.2 性能评估

- **前台**：
- **后台**：
- **阈值与验收**：
- **降级策略**：

### 9.3 功耗评估

- **Top5% 用户模型**：
- **预估增量**：
- **验收上限**：
- **降级策略**：

### 9.4 内存评估

- **峰值/平均增量**：
- **生命周期**：
- **验收标准**：

## 10. 执行说明（只引用 tasks.md，不新增 Task）

- **执行入口**：`tasks.md`
- **验证入口**：各 Task 的验证清单 + Plan 的验收指标
- **禁止事项**：Implement 期不得修改 Plan 设计；变更走增量变更流程并提升版本

