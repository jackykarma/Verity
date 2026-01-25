---
description: 对 ux-design.md（及设计稿索引：Figma/截图/design/ HTML）做增量更新；按「实际影响」评估：若影响 spec 范围则 handoff feature-update，若影响视觉设计则写回 ux-design.md；两者可同时发生。上述任一导致 plan 输入变化时，handoff plan-update，再 handoff tasks。
handoffs:
  - label: 更新 spec（当评估为影响 spec 范围时）
    agent: speckit.feature-update
    prompt: 范围：XXX（因 uidesign 交互/视觉 变更），级联 plan
    send: false
  - label: 更新 plan（仅视觉/ux 影响 plan 或需补充 ux-derived 的 plan 范围时）
    agent: speckit.plan-update
    prompt: 范围：A2 架构、A3 内部设计、Story Breakdown（因 uidesign 视觉/交互 变更）
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

在继续操作前，你**必须**参考用户输入（若不为空）。`$ARGUMENTS` 为**必填**，用于指定「本次更新范围」。格式如「本次更新范围：交互规则、加载态」或「视觉：按钮动效、design 索引」等。

## 大纲

目标：对 `ux-design.md` 做**增量更新**，仅重写 `$ARGUMENTS` 指定范围对应的章节，其余保留；在「变更记录」中**追加一行**。按**实际影响**评估：若影响 spec 范围则 handoff `/speckit.feature-update`，若影响视觉设计则写回 ux-design.md（及设计稿索引）；**两者可同时发生**。上述任一导致 plan 的 A2/A3/Story 等变化时，handoff `/speckit.plan-update`，再 handoff `/speckit.tasks`。

执行步骤：

### 1. 环境与路径

从仓库根运行：

```powershell
.specify/scripts/powershell/check-prerequisites.ps1 -Json -PathsOnly
```

解析 JSON 得到 `FEATURE_DIR`、`FEATURE_SPEC`、`IMPL_PLAN`、`UX_DESIGN`、`DESIGN_DIR`。若 `UX_DESIGN`（ux-design.md）不存在：**终止**并提示先运行 `/speckit.uidesign`。

### 2. 解析 `$ARGUMENTS`

确定本次要重写的 **ux-design 章节**（信息架构、交互说明、视觉规范、设计稿索引等），与 [ux-design-template.md](.specify/templates/ux-design-template.md) 对应。

### 3. 加载上下文

- 读取 `ux-design.md`、`.specify/templates/ux-design-template.md`；必要时 `spec.md`。

### 4. 影响评估（必须显式写出结论）

- **是否影响 spec**：本次交互规则/状态/反馈、视觉动效等是否改变 FR、NFR、验收标准、验收与场景、边界与异常。若是 → 记「影响 spec」，并推导建议的 feature-update 范围（如 `FR 与 NFR`、`验收标准`）。
- **是否影响视觉设计**：布局、组件、动效、design 索引是否需改。若是 → 记「影响视觉」，需写回 ux-design.md（及设计稿索引表）。

### 5. 更新 ux-design.md

- 仅重写 `$ARGUMENTS` 指定范围对应的章节，其余原文保留。
- 在「变更记录」中**追加一行**；更新文档头部 `**ux-design Version**`（Patch：仅格式/索引；Minor：交互/视觉规范、设计稿索引）。

### 6. design/ 与设计稿索引

- 若影响视觉且 `$ARGUMENTS` 涉及设计稿索引：更新 ux-design.md 中的「设计稿索引」表（新增/修正**形式**：Figma/截图/HTML，及**路径或链接**：Figma URL、`design/xxx.png`、`design/xxx.html`）。
- 不在本命令内自动生成或覆写 `design/` 下文件（HTML、截图等）内容。

### 7. 级联与 handoff

- **若「影响 spec」**：在完成报告中输出建议命令，例如：  
  `/speckit.feature-update 范围：FR 与 NFR、验收标准（因 uidesign 交互/视觉 变更）`  
  并 级联 plan；用户执行后，feature-update 会更新 spec 与 plan 的 spec-derived 部分。

- **若「影响视觉」且 plan 的 A2/A3/Story 等会变**：在完成报告中输出建议命令，例如：  
  `/speckit.plan-update 范围：A2 架构、A3 内部设计、Story Breakdown（因 uidesign 视觉/交互 变更）`。  
  若同时「影响 spec」且用户已跑 feature-update 级联 plan，仍可再跑 plan-update 以补齐 ux-derived 范围；**顺序：先 feature-update，再 plan-update**。

- **当 plan 已更新**（不论通过 feature-update 级联或 plan-update）：建议运行 `/speckit.tasks` 重新生成 tasks。

### 8. 完成报告

输出：

- `ux-design.md` 路径
- ux-design Version（更新后）
- 本次更新范围摘要
- 影响评估结论：影响 spec / 影响视觉 / 两者
- 上述 handoff 及推荐执行顺序

## 与现有命令的关系

- **`/speckit.uidesign`**：从无到有产出 ux-design.md 与 design/；uidesign-update 只做**增量更新**。
- **`/speckit.feature-update`**：uidesign-update 在「影响 spec」时 handoff  thereto，由用户执行；可 级联 plan。
- **`/speckit.plan-update`**：uidesign-update 在「仅视觉/ux 影响 plan」或需补充 ux-derived 的 plan 范围时 handoff  thereto；按用户给出的 plan 范围直接更新。
