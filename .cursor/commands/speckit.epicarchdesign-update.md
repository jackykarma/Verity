---
description: 对 **EPIC 根** 下 epic-arch.md 做增量更新；仅重写 $ARGUMENTS 指定范围对应的章节，其余保留；在「变更记录」中追加一行。若变更影响某 Feature 的 plan（A2/A3.1 或技术约束），handoff plan-update（对受影响的 Feature 设 SPECIFY_FEATURE 后执行）。
handoffs:
  - label: 更新 plan（当架构/约束变更影响某 Feature 时）
    agent: speckit.plan-update
    prompt: 范围：A2 架构、A3.1 第一层框架、Plan-B 技术规约（因 epic-arch 变更）；对受影响的 Feature 设置 SPECIFY_FEATURE 后执行
    send: false
---

## 用户输入

```text
$ARGUMENTS
```

在继续操作前，你**必须**参考用户输入（若不为空）。`$ARGUMENTS` 为**必填**，用于：**EPIC 标识**（当 `SPECIFY_EPIC` 未设时）**及**「本次更新范围」。格式如「EPIC-002 本次更新范围：0 层架构图、技术约束」或「本次更新范围：1 层架构、规范与约束」。

## 大纲

目标：对 **EPIC 根** 下 `epic-arch.md` 做**增量更新**，仅重写 `$ARGUMENTS` 指定范围对应的章节，其余保留；在「变更记录」中**追加一行**。若变更导致某 Feature 的 plan 的 A2/A3.1/Plan-B 受影响，在完成报告中建议对**受影响的 Feature** 设 `SPECIFY_FEATURE` 后执行 `/speckit.plan-update`。

执行步骤：

1. **环境与路径**：从仓库根运行 `.specify/scripts/powershell/get-epic-paths.ps1 -EpicId "EPIC-xxx" -Json`（或使用 `SPECIFY_EPIC`），解析得到 `EPIC_DIR`、`EPIC_ARCH`。若 `EPIC_ARCH`（epic-arch.md）**不存在**：**终止**并提示先运行 `/speckit.epicarchdesign`。

2. **解析 `$ARGUMENTS`**：确定本次要重写的 **epic-arch 章节**（0 层架构、1 层架构、规范与约束、与跨 Feature 技术策略的对应等），与 `.specify/templates/epic-arch-template.md` 对应。

3. **加载上下文**：读取 `EPIC_ARCH`、`epic.md`、constitution、epic-arch-template；必要时各 feature spec 与现有代码。

4. **更新 epic-arch.md**：仅重写指定范围对应章节，其余原文保留；在「变更记录」中**追加一行**；更新文档头部 `**epic-arch Version**`（Patch/Minor）。

5. **与 epic.md 的「跨 Feature 技术策略」同步**：若本次变更涉及共享能力或技术约束，提示或补充更新 epic.md 对应节。

6. **完成报告**：输出 epic-arch.md 路径、本次更新范围、是否建议对受影响 Feature 执行 plan-update 及推荐命令。

## 与现有命令的关系

- **`/speckit.epicarchdesign`**：从无到有产出 EPIC 根下 epic-arch.md；须在所有 Feature 的 spec 输出之后运行。epicarchdesign-update 只做**增量更新**。
- **`/speckit.plan-update`**：当 epic-arch 变更影响某 Feature 的 A2/A3.1/Plan-B 时，对受影响 Feature 设 `SPECIFY_FEATURE` 后执行。
