---
description: "对 EPIC 软件设计说明书做增量更新；仅重写 $ARGUMENTS 指定范围对应的章节，其余保留；在「变更记录」中追加一行。若变更影响 tasks.md，提示重新生成。"
handoffs:
  - label: 重新生成任务
    agent: speckit.tasks
    prompt: 设计说明书变更后，重新生成 tasks.md
    send: false
  - label: 更新 Feature plan（当设计变更影响技术规约时）
    agent: speckit.plan-update
    prompt: 范围：技术规约（因设计说明书变更）
    send: false
---

## 用户输入

```text
$ARGUMENTS
```

在继续操作前，你**必须**参考用户输入（若不为空）。`$ARGUMENTS` 为**必填**，用于：**EPIC 标识**（当 `SPECIFY_EPIC` 未设时）**及**「本次更新范围」。格式如「EPIC-002 本次更新范围：0 层架构、Story 拆解」或「本次更新范围：全景类图、ST-001 L2 设计」。

## 大纲

目标：对 EPIC 软件设计说明书做**增量更新**，仅重写 `$ARGUMENTS` 指定范围对应的章节，其余保留；在「变更记录」中**追加一行**。

执行步骤：

1. **环境与路径**：从仓库根运行 `.specify/scripts/powershell/get-epic-paths.ps1 -EpicId "EPIC-xxx" -Json`，解析得到 `EPIC_DIR`。设计说明书路径为 `EPIC_DIR/epic-design.md`。若设计说明书**不存在**：**终止**并提示先运行 `/speckit.epicdesign`。

2. **解析 `$ARGUMENTS`**：确定本次要重写的章节（0 层架构、1 层架构、关键功能设计、全景类图/时序、Story 拆解、L2 索引等），与 `.specify/templates/epic-design-doc-template.md` 对应。若涉及某个 ST-xxx 的 L2 设计，更新对应 Feature 的 `story_detail_design.md`（L2 详细设计统一在 story_detail_design.md 中，epic-design.md §6 仅为索引表）。

3. **加载上下文**：读取设计说明书、epic-plan.md、相关 feature spec/plan、constitution、设计说明书模板；必要时分析现有代码。

4. **更新设计说明书**：仅重写指定范围对应章节，其余原文保留；在「变更记录」中**追加一行**；更新文档头部版本号。

5. **完成报告**：输出设计说明书路径、本次更新范围、是否建议重新生成 tasks.md 或更新 Feature plan。

## 与现有命令的关系

- **`/speckit.epicdesign`**：从无到有产出 EPIC 软件设计说明书。epicdesign-update 只做**增量更新**。
- **`/speckit.tasks`**：设计说明书变更后可能需要重新生成 tasks。
- **`/speckit.plan-update`**：当设计变更涉及技术规约层面时，可能需要同步更新 Feature plan。
