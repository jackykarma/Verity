---
description: 对当前 Feature 的 plan.md 做增量更新；plan 范围由 spec 变更推导（传 spec 范围）或纯方案变更时由 $ARGUMENTS 指定（传 plan 范围），其余保留；在「变更记录」中追加一行。
handoffs:
  - label: 生成任务（Story → Task）
    agent: speckit.tasks
    prompt: 将 Plan 的 Story Breakdown 拆解为可执行 tasks.md
    send: true
  - label: 同步 EPIC 总览（可选）
    agent: speckit.epicsync
    prompt: 将本 Feature 的 plan 进展同步到 EPIC 总览
    send: false
  - label: 创建检查清单
    agent: speckit.checklist
    prompt: 为以下领域创建检查清单……
    send: false
---

## 用户输入

```text
$ARGUMENTS
```

在继续操作前，你**必须**参考用户输入（若不为空）。`$ARGUMENTS` 为**必填**。**plan 的更新范围由「spec 变更」推导，或由「纯 plan 变更」时人工指定**，不得要求用户凭空枚举 plan 章节。

### 两种用法

| 触发场景 | `$ARGUMENTS` 传什么 | 如何确定要改的 plan 章节 |
|----------|---------------------|--------------------------|
| **spec 已变更**（如 feature-update 未级联后的补跑） | **spec 范围**：`FR 与 NFR`、`验收标准`、`边界与异常场景`、`依赖关系`、`核心实体`、`假设与约束`、`需求追溯`；或「因 spec 的 FR、NFR 变更」等 | 按**保守映射**（见下）从 spec 范围**推导**受影响的 plan 章节，**不需**用户列举 A4、A5、A6 等 |
| **纯技术方案变更**（架构、风险、选型等，**无 spec 变更**） | **plan 范围**：`A1 技术选型`、`A2 架构`、`A4 风险`、`Story Breakdown` 等 | 因无 spec 可推导，按用户指定的 plan 范围更新 |
| **epic uidesign 已变更**（仅视觉/ux 影响 plan，或需补充 ux-derived 的 plan 范围） | **plan 范围**：例如 `A2 架构、A3 内部设计、Story Breakdown（因 epic uidesign 视觉/交互 变更）` | 按用户给出的 plan 范围直接更新（与「纯技术方案变更」相同） |

示例（spec 范围，由命令推导 plan 章节）：
- `范围：FR 与 NFR`
- `范围：验收标准`
- `因 spec 的 FR、NFR、验收标准变更`

示例（plan 范围，纯方案变更时人工指定）：
- `A1 技术选型`、`A2 架构`、`A4 风险`、`A5 边界与异常`、`Story Breakdown`

## 大纲

目标：对当前 Feature 的 `plan.md` 做**增量更新**，仅重写/重算**由 spec 变更推导或（纯方案变更时）由 $ARGUMENTS 指定**的 plan 章节，其余原文保留；在「变更记录（增量变更）」表中**追加一行**。

强制约束：
- **增量规则**：仅重写/重算步骤 3 确定的 plan 章节，禁止全量重写。
- **变更记录**：在「变更记录（增量变更）」表**追加一行**；该表已存在于 [plan-template.md](.specify/templates/plan-template.md)，直接追加。
- **版本**：在变更记录中更新文档头部 `**Plan Version**`（如 v0.1.0 → v0.2.0）。规则：凡涉及 FR/NFR/AC/设计决策的为 **Minor**；纯澄清/格式为 **Patch**。

## 执行步骤

### 1. 环境与路径

从仓库根运行：

```powershell
.specify/scripts/powershell/check-prerequisites.ps1 -Json
```

- 若脚本**退出非零**：终止并提示先运行 `/speckit.plan`（脚本会输出 plan.md 不存在的错误信息）。
- 若脚本**成功**：解析 JSON 得到 `FEATURE_DIR`；令 `IMPL_PLAN` = `FEATURE_DIR`/plan.md，`FEATURE_SPEC` = `FEATURE_DIR`/spec.md。

（若使用 `-Json -PathsOnly`，可直接解析 `IMPL_PLAN`、`FEATURE_SPEC`、`FEATURE_DIR`，但需自行校验 `IMPL_PLAN` 所指文件存在；不存在则终止并提示先运行 `/speckit.plan`。）

### 2. 加载上下文

- 读取 `plan.md`、`spec.md`、`.specify/memory/constitution.md`、`.specify/templates/plan-template.md`。
- 重写时仅处理**步骤 3 确定**的 plan 章节，其余原文保留。

### 3. 确定可更新范围（plan 章节）

先**解析 `$ARGUMENTS`**，再得到本次要重写的 **plan 章节集合**：

1. **若 `$ARGUMENTS` 为 spec 范围**（FR、NFR、验收标准、验收与场景、边界与异常场景、依赖关系、核心实体、假设与约束、需求追溯，或含「因 spec 的…」）：  
   按**保守映射**从 spec 范围推导受影响的 plan 章节，取**并集**（多 spec 范围时并集）。

   **保守映射：spec 范围 → 受影响的 plan 范围**（与 [speckit.feature-update](.cursor/commands/speckit.feature-update.md) 7.3 一致）

   | spec 范围 | 受影响的 plan 范围 |
   |-----------|---------------------|
   | FR、NFR、验收标准、验收与场景 | 概述、A4、A5、A6、A7、A8、A9、Story Breakdown |
   | 边界与异常场景 | A4、A5、Story Breakdown（若涉及新/删 Story 或验收变化） |
   | 依赖关系 | A2（尤 A2.2、A2.3）、A3 若涉及对外模块/接口 |
   | 核心实体 | A0、A3、B3 |
   | 假设与约束 | A4、Plan-B（B2、B5 等） |
   | 需求追溯（Story 增删或映射变化） | Story Breakdown |

2. **若 `$ARGUMENTS` 为 plan 范围**（A0、A1、A2、A3、A4、A5、A6、A7、A8、A9、Plan-B、B0–B7、Story Breakdown、概述 等），或含「因 uidesign」「因 epic uidesign」「因 uidesign 的…」：  
   直接以用户指定的 plan 章节为**可更新范围**；**不从 spec 推导**（与「纯技术方案变更」相同）。

**plan 章节与 plan-template 的对应**（用于写回时定位）：

| plan 范围 | 对应 plan-template 章节 |
|-----------|--------------------------|
| 概述 | `## 概述` |
| A0 | `### A0. 领域概念` |
| A1 | `### A1. 技术选型` |
| A2 | `### A2. Feature 全景架构` |
| A3 | `### A3. Feature 内部设计` |
| A4 | `### A4. 技术风险与消解策略` |
| A5 | `### A5. 边界 & 异常场景枚举` |
| A6 | `### A6. 算法评估` |
| A7 | `### A7. 功耗评估` |
| A8 | `### A8. 性能评估` |
| A9 | `### A9. 内存评估` |
| Plan-B | `## Plan-B` 或子节 `B0`–`B7` |
| Story Breakdown | `## Story Breakdown` |
| Story Detailed Design | `## Story Detailed Design`（按推导或指定是否涉及） |

- **变更记录**：仅**追加**一行，不作为「范围」重写。

### 4. 生成/重算

- 仅对**步骤 3 确定**的 plan 章节，基于 spec、constitution、plan 既有内容做重算或重写。
- 不得引入 plan/spec 中未出现或已推翻的决策。
- 图表须继续使用 **Mermaid**（遵循 `.cursor/rules/mermaid-style-guide.mdc` 中的 Material Design 配色规范），与 [speckit.plan.md](.cursor/commands/speckit.plan.md) 一致。

### 5. 变更记录

在 plan 的「变更记录（增量变更）」表**追加一行**。列包括：版本、日期、变更范围（Feature/Story/Task）、变更摘要、影响模块、是否需要回滚设计（与 plan-template 一致）。

### 6. 写回

仅替换受影响章节的原文，写回 `IMPL_PLAN`（即 plan.md）。

### 7. 完成报告

输出：
- `plan.md` 路径
- Plan Version（更新后）
- 本次更新范围摘要

## 与现有命令的关系

- **`/speckit.plan`**：从无到有生成 plan，或**全量覆盖** plan.md。
- **`/speckit.plan-update`**：在已有 plan 上**按范围增量**更新；范围由 **spec 变更推导**（传 spec 范围）或**纯方案变更时人工指定**（传 plan 范围）。
- **`/speckit.feature-update`**：当「默认级联」时，在同一命令内按 spec 变更推导 plan 范围并执行 plan 增量更新（与 plan-update 的推导逻辑一致）；用户关闭级联后，可单独运行 `/speckit.plan-update "范围：FR 与 NFR"` 等 **spec 范围**，由 plan-update 推导并更新。
