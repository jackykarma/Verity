---
description: 对当前 Feature 的 spec.md 做增量更新，仅重写 $ARGUMENTS 指定范围的章节，其余保留；可按需求变更范围可选级联更新 plan.md。
handoffs:
  - label: 生成任务（已级联 plan 时）
    agent: speckit.tasks
    prompt: 将 Plan 的 Story Breakdown 拆解为可执行 tasks.md
    send: true
  - label: 同步 EPIC 总览
    agent: speckit.epicsync
    prompt: 将本 Feature 的 spec/plan 进展同步到 EPIC 总览
    send: false
  - label: 制定/更新技术方案（未级联且 spec 变更影响设计时）
    agent: speckit.plan-update
    prompt: 根据 spec 的 [变更范围] 更新 plan.md 的 [受影响的 plan 范围]
    send: false
---

## 用户输入

```text
$ARGUMENTS
```

在继续操作前，你**必须**参考用户输入（若不为空）。`$ARGUMENTS` 为**必填**，用于指定「本次更新范围」。

示例：
- `FR 与 NFR`
- `NFR 性能`
- `验收标准`
- `边界与异常场景`
- `依赖关系`
- `背景与价值`
- `核心实体`
- `假设与约束`
- `元信息`（Epic、Feature 类型、Version、状态、范围 In/Out 等）
- `需求追溯`

关闭级联时，可在 `$ARGUMENTS` 中加入：`不级联 plan`、`仅 spec`、`no-cascade`。

## 大纲

目标：对当前 Feature 的 `spec.md` 做**增量更新**，仅重写/重算 `$ARGUMENTS` 指定范围对应的章节，其余原文保留；在「变更记录」中**追加一行**。根据需求变更范围，可**可选级联**更新 `plan.md`（见「可选级联」节）。

**定位与使用场景**：
- **feature-update**：用于 **主动需求变更**，可在 **任何时候** 执行（spec 生成后、plan 之后、implement 期间均可）
- **适用场景**：PRD 变更、需求调整、FR/NFR 修正、边界重新定义
- **执行方式**：用户主动指定更新范围（如"FR 与 NFR"、"边界与异常场景"）
- **变更追溯**：在「变更记录（增量变更）」表中 **追加一行**，记录版本、变更范围、影响
- **级联能力**：可选自动级联更新 plan.md（根据影响映射表推导）

**与 clarify 的区别**：
- clarify 是"首次交互式澄清"（AI 提问，plan 之前），feature-update 是"主动需求变更"（用户指定范围，任何时候）
- clarify 不维护变更记录表，feature-update 维护
- clarify 无级联能力，feature-update 可级联 plan

强制约束：
- **增量规则**：仅重写/重算指定范围对应的章节，禁止全量重写。
- **变更记录**：在「变更记录（增量变更）」表**追加一行**；若表不存在则先创建再追加。
- **版本**：在变更记录中更新文档头部 `**Feature Version**`（如 v0.1.0 → v0.2.0）。规则：凡涉及 FR/NFR/AC/设计决策的为 **Minor**；纯澄清/格式为 **Patch**。

## 执行步骤

### 1. 定位 Feature 上下文

从仓库根运行：

```powershell
.specify/scripts/powershell/check-prerequisites.ps1 -Json -PathsOnly
```

解析 `FEATURE_DIR`、`FEATURE_SPEC`（即 `spec.md`）、`IMPL_PLAN`（即 `plan.md`，级联时使用）。若 `FEATURE_SPEC` 不存在：**终止**并提示先运行 `/speckit.feature`。

### 2. 加载上下文

- 读取 `spec.md`、`.specify/templates/spec-template.md`（用于章节标题与「变更记录」结构）。

### 3. 确定可更新范围

与 [spec-template.md](.specify/templates/spec-template.md) 对应，可更新章节包括：

| 可更新范围 | 对应 spec-template 章节 |
|-----------|-------------------------|
| 元信息 | 头部：Epic、Feature 类型、Feature ID、Feature Version、创建时间、状态、输入 |
| 背景与价值 | `## 背景与价值` |
| 依赖关系 | `## 依赖关系` |
| 验收与场景 | `## 验收与场景`（核心用户旅程、边界与异常场景） |
| FR | `## FR / NFR` → `### FR（Functional Requirements）` |
| NFR | `## FR / NFR` → `### NFR`（可细到 性能、功耗、内存、安全与隐私、可观测性、可靠性） |
| 验收标准 | `## 验收标准（Feature Level）` |
| 核心实体 | `## 核心实体` |
| 假设与约束 | `## 假设与约束` |
| 需求追溯 | `## 需求追溯` |

- **变更记录**：仅**追加**一行，不作为「范围」重写。

### 4. 变更记录节（若不存在则创建）

- 若 `spec.md` 中**不存在**「变更记录（增量变更）」节：在「需求追溯」**之后**，按 spec-template 格式插入「变更记录（增量变更）」节与表头，再追加一行。
- 表列：`版本 | 日期 | 变更范围 | 变更摘要 | 影响 | 是否需要回滚`。
- 若已存在：直接追加。

### 5. 生成/重算

- 仅对 `$ARGUMENTS` 指定范围对应的章节重写；须符合 spec 的填写规则（FR 可测、NFR 量化等）。
- 其余章节原文保留。

### 6. 写回

- 将结果写回 `FEATURE_SPEC`（即 `spec.md`）。

### 7. 可选级联：根据需求变更范围判断对 plan 的影响，自动执行 plan 增量更新

#### 7.1 是否级联

- **默认级联**：当本次 spec 的「更新范围」与下表「影响设计」有交集时，在同一命令内继续执行 plan 的增量更新。
- **关闭级联**：若 `$ARGUMENTS` 中含「不级联 plan」「仅 spec」「no-cascade」等明确表述，则只更新 spec，不执行 plan 增量更新。
- **不级联**：当本次 spec 范围仅涉及「元信息（仅状态、Version）」「背景与价值（仅叙述、未改范围/约束）」且未涉及「影响设计」时，不触发 plan 更新。

#### 7.2 「影响设计」的 spec 范围

| spec 范围 | 影响设计 |
|-----------|----------|
| FR、NFR、验收标准、验收与场景、边界与异常场景、依赖关系、核心实体、假设与约束、需求追溯（若涉及 Story 增删或映射变化） | 是 |
| 元信息（仅状态、Version、输入） | 否 |
| 背景与价值（仅叙述、未改范围 In/Out 或约束） | 否 |

#### 7.3 保守映射：需求变更范围 → 受影响的 plan 范围

由本次 **spec 更新范围** 推导 **受影响的 plan 章节**；**凡受影响的都必须纳入**，不得漏掉。

| 本次 feature-update 的 spec 范围 | 受影响的 plan 范围 |
|----------------------------------|---------------------|
| FR、NFR、验收标准、验收与场景 | 概述、A4 技术风险与消解策略、A5 边界与异常场景枚举、A6 算法评估、A7 功耗评估、A8 性能评估、A9 内存评估、Story Breakdown |
| 边界与异常场景 | A4、A5、Story Breakdown（若涉及新/删 Story 或验收变化） |
| 依赖关系 | A2 Feature 全景架构（尤 A2.2 外部依赖、A2.3 通信与交互约束）、A3 若涉及对外模块/接口 |
| 核心实体 | A0 领域概念、A3 Feature 内部设计、B3 数据模型 |
| 假设与约束 | A4、Plan-B（B2 架构细化、B5 合规性检查等） |
| 需求追溯（Story 增删或映射变化） | Story Breakdown（Story 列表、Feature→Story 覆盖矩阵） |

若一次 feature-update 涉及多个 spec 范围，取**并集**：所有被映射到的 plan 章节均纳入本次 plan 增量更新。

#### 7.4 级联时的执行流程（在步骤 6 写回 spec 之后执行）

1. **判断是否级联**：若 `$ARGUMENTS` 含「不级联 plan」「仅 spec」「no-cascade」→ 跳过。否则，若本次 spec 更新范围与 7.2 中「影响设计」集合有交集 → 继续；无交集则跳过。
2. **若 plan.md 不存在**：提示「plan 不存在，请先运行 /speckit.plan」后跳过级联，仅完成 spec 的完成报告。
3. **推导 plan 范围**：按 7.3 的保守映射，从「本次 spec 更新范围」得到需更新的 plan 章节集合；**受影响的部分都必须包含**。若 `$ARGUMENTS` 中显式给出「级联 plan 范围：A4,A5」等，则优先采用，不再按映射推导。
4. **执行 plan 增量更新**：与 `/speckit.plan-update` 相同逻辑——使用步骤 1 已解析的 `IMPL_PLAN`、`FEATURE_SPEC`、`FEATURE_DIR`；读取 plan.md、spec.md、`.specify/memory/constitution.md`、`.specify/templates/plan-template.md`；**仅**重算/重写 7.3 确定的 plan 范围；在 plan 的「变更记录」追加一行（摘要可注明「由 feature-update 级联，因 spec 的 XX 变更」）；写回 plan.md。
5. **完成报告**：若已级联，同时输出 plan 路径、Plan Version、本次 plan 更新范围（即「对方案影响的范围」）。

### 8. 完成报告

输出：
- `spec.md` 路径
- Feature Version（更新后）
- 本次更新范围摘要

若已级联 plan：同时输出 `plan.md` 路径、Plan Version、本次 plan 更新范围。

## 与现有命令的关系

- **`/speckit.feature`**：创建 Feature 和 spec.md；feature-update 只做**增量更新**，不创建。
- **`/speckit.clarify`**：澄清问答，按问题答案写入 spec，一般不维护变更记录。
- **`/speckit.feature-update`**：按「范围 + 变更意图」做增量，并在变更记录中留痕；可按需级联 plan。
- **`/speckit.plan`**：从无到有生成 plan；feature-update 级联时调用的是 **plan 增量更新** 逻辑（与 `/speckit.plan-update` 一致），仅重写受影响的 plan 章节。
- **`/speckit.plan-update`**：独立对 plan.md 做增量更新；feature-update 在级联时**内嵌**相同逻辑，无需用户单独跑 plan-update（除非用户用「不级联 plan」关闭了级联）。

## 与 clarify 的区分

- **`/speckit.clarify`**：首次交互式澄清（plan 之前），AI 提问，不维护变更记录表，无级联能力。
- **`/speckit.feature-update`**：主动需求变更（任何时候），用户指定范围，维护变更记录表，可级联 plan。

**使用流程建议**：
1. spec 初次生成后 → 运行 `/speckit.clarify` 填补模糊点
2. plan/tasks/implement 期间需求变更 → 运行 `/speckit.feature-update` 指定范围更新
