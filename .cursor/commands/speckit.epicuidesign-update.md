---
description: 对 **EPIC 根** 下 ux-design.md（epicuidesign 产出；及设计稿索引：Figma/截图/design/ HTML）做增量更新；按「实际影响」评估：若影响某 Feature 的 spec 范围则 handoff feature-update，若影响视觉设计则写回 ux-design.md；两者可同时发生。上述任一导致某 Feature 的 plan 输入变化时，handoff plan-update（对**受影响的 Feature** 设 SPECIFY_FEATURE 后执行），再 handoff tasks。
handoffs:
  - label: 更新 spec（当评估为影响某 Feature 的 spec 范围时）
    agent: speckit.feature-update
    prompt: 范围：XXX（因 epic uidesign 交互/视觉 变更），级联 plan；对受影响的 Feature 设置 SPECIFY_FEATURE 后执行
    send: false
  - label: 更新 plan（仅视觉/ux 影响 plan 或需补充 ux-derived 的 plan 范围时）
    agent: speckit.plan-update
    prompt: 范围：A2 架构、A3 内部设计、Story Breakdown（因 epic uidesign 视觉/交互 变更）；对受影响的 Feature 设置 SPECIFY_FEATURE 后执行
    send: false
  - label: 生成任务（plan 已或即将更新时）
    agent: speckit.tasks
    prompt: 将 Plan 的 Story Breakdown 拆解为可执行 tasks.md
    send: true
---

## 用户输入

```text
$ARGUMENTS
```

在继续操作前，你**必须**参考用户输入（若不为空）。`$ARGUMENTS` 为**必填**，用于：**EPIC 标识**（如 `EPIC-002`，用于定位 EPIC；当 `SPECIFY_EPIC` 已设时可合并到后续）**及**「本次更新范围」。格式如「EPIC-002 本次更新范围：交互规则、加载态」或「本次更新范围：视觉：按钮动效、design 索引」（当 SPECIFY_EPIC 已设时）。

## 大纲

目标：对 **EPIC 根** 下 `ux-design.md` 做**增量更新**，仅重写 `$ARGUMENTS` 指定范围对应的章节，其余保留；在「变更记录」中**追加一行**。按**实际影响**评估：若影响**某 Feature** 的 spec 范围则 handoff `/speckit.feature-update`（对**受影响的 Feature** 设 `SPECIFY_FEATURE` 后执行，可级联 plan）；若影响视觉设计则写回 ux-design.md（及设计稿索引）；**两者可同时发生**。上述任一导致**某 Feature** 的 plan 的 A2/A3/Story 等变化时，handoff `/speckit.plan-update`（对受影响 Feature 设 `SPECIFY_FEATURE`），再 handoff `/speckit.tasks`。

执行步骤：

### 1. 环境与路径

从仓库根运行（通过 `SPECIFY_EPIC` 或 `$ARGUMENTS` 中的 EPIC 标识，如 `EPIC-002`）：

```powershell
.specify/scripts/powershell/get-epic-paths.ps1 -EpicId "EPIC-002" -Json
```

解析 JSON 得到 `EPIC_DIR`、`EPIC_UX_DESIGN`、`EPIC_DESIGN_DIR`。若 `EPIC_UX_DESIGN`（ux-design.md）**不存在**：**终止**并提示先运行 `/speckit.epicuidesign`。

### 2. 解析 `$ARGUMENTS`

确定本次要重写的 **ux-design 章节**（信息架构、交互说明、视觉规范、设计稿索引等，可按 Feature 分节），与 [ux-design-template.md](.specify/templates/ux-design-template.md) 对应；并从 $ARGUMENTS 中分离「本次更新范围」。

### 3. 加载上下文

- 读取 `EPIC_UX_DESIGN`（ux-design.md）、`.specify/templates/ux-design-template.md`；必要时 `epic.md`、相关 `features/*/spec.md`。

### 4. 影响评估（必须显式写出结论）

- **是否影响某 Feature 的 spec**：本次交互规则/状态/反馈、视觉动效等是否改变某 Feature 的 FR、NFR、验收标准、验收与场景、边界与异常。若是 → 记「影响 spec」及**受影响的 Feature 列表**，并推导建议的 feature-update 范围。
- **是否影响视觉设计**：布局、组件、动效、design 索引是否需改。若是 → 记「影响视觉」，需写回 ux-design.md（及设计稿索引表）。

### 5. 更新 ux-design.md

- 仅重写 `$ARGUMENTS` 指定范围对应的章节，其余原文保留。
- 在「变更记录」中**追加一行**；更新文档头部 `**ux-design Version**`（Patch：仅格式/索引；Minor：交互/视觉规范、设计稿索引）。

### 6. design/ 与设计稿索引

- 若影响视觉且 `$ARGUMENTS` 涉及设计稿索引：更新 ux-design.md 中的「设计稿索引」表（新增/修正**形式**：Figma/截图/HTML，及**路径或链接**；可含「所属 Feature」列）。
- 不在本命令内自动生成或覆写 `design/` 下文件（HTML、截图等）内容。

### 7. 级联与 handoff

- **若「影响某 Feature 的 spec」**：在完成报告中输出建议命令，例如：对**受影响的 Feature** 设置 `SPECIFY_FEATURE` 后  
  `/speckit.feature-update 范围：FR 与 NFR、验收标准（因 epic uidesign 交互/视觉 变更）`  
  并 级联 plan；若有多个 Feature 受影响，逐一对该 Feature 执行。

- **若「影响视觉」且某 Feature 的 plan 的 A2/A3/Story 等会变**：在完成报告中输出建议命令，例如：对**受影响的 Feature** 设置 `SPECIFY_FEATURE` 后  
  `/speckit.plan-update 范围：A2 架构、A3 内部设计、Story Breakdown（因 epic uidesign 视觉/交互 变更）`。  
  若同时「影响 spec」且用户已跑 feature-update 级联 plan，仍可再跑 plan-update 以补齐 ux-derived 范围；**顺序：先 feature-update，再 plan-update**。

- **当 plan 已更新**（不论通过 feature-update 级联或 plan-update）：建议对受影响 Feature 运行 `/speckit.tasks` 重新生成 tasks。

### 8. 完成报告

输出：

- `ux-design.md` 路径（EPIC 根）
- ux-design Version（更新后）
- 本次更新范围摘要
- 影响评估结论：影响哪些 Feature 的 spec / 影响视觉 / 两者
- 上述 handoff 及推荐执行顺序（含对**受影响的 Feature** 设置 `SPECIFY_FEATURE`）

## 与现有命令的关系

- **`/speckit.epicuidesign`**：从无到有产出 **EPIC 根** 下 ux-design.md 与 design/；**须在所有 Feature 的 spec 输出之后**运行。epicuidesign-update 只做**增量更新**。
- **`/speckit.feature-update`**：epicuidesign-update 在「影响某 Feature 的 spec」时 handoff  thereto，由用户对**受影响的 Feature** 设 `SPECIFY_FEATURE` 后执行；可 级联 plan。
- **`/speckit.plan-update`**：epicuidesign-update 在「仅视觉/ux 影响某 Feature 的 plan」或需补充 ux-derived 的 plan 范围时 handoff  thereto；对**受影响的 Feature** 设 `SPECIFY_FEATURE` 后按用户给出的 plan 范围直接更新。
