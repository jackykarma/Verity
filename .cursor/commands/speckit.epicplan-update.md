---
description: "对 **EPIC 根** 下 epic-plan.md 做增量更新；仅重写 $ARGUMENTS 指定范围对应的章节，其余保留；在「变更记录」中追加一行。若变更影响某 Feature 的 plan（技术规约），handoff plan-update。"
handoffs:
  - label: 更新 Feature plan（当 EPIC 规约变更影响某 Feature 时）
    agent: speckit.plan-update
    prompt: 范围：技术规约（因 epic-plan 变更）；对受影响的 Feature 设置 SPECIFY_FEATURE 后执行
    send: false
---

## 用户输入

```text
$ARGUMENTS
```

在继续操作前，你**必须**参考用户输入（若不为空）。`$ARGUMENTS` 为**必填**，用于：**EPIC 标识**（当 `SPECIFY_EPIC` 未设时）**及**「本次更新范围」。格式如「EPIC-002 本次更新范围：分层约束、NFR 预算」或「本次更新范围：错误处理规范、接口原则」。

## 大纲

目标：对 **EPIC 根** 下 `epic-plan.md` 做**增量更新**，仅重写 `$ARGUMENTS` 指定范围对应的章节，其余保留；在「变更记录」中**追加一行**。若变更导致某 Feature 的 plan（技术规约）受影响，在完成报告中建议对**受影响的 Feature** 设 `SPECIFY_FEATURE` 后执行 `/speckit.plan-update`。

执行步骤：

1. **环境与路径**：从仓库根运行 `.specify/scripts/powershell/get-epic-paths.ps1 -EpicId "EPIC-xxx" -Json`（或使用 `SPECIFY_EPIC`），解析得到 `EPIC_DIR`、`EPIC_PLAN`。若 `EPIC_PLAN`（epic-plan.md）**不存在**：**终止**并提示先运行 `/speckit.epicplan`。

2. **解析 `$ARGUMENTS`**：确定本次要重写的 **epic-plan 章节**（技术栈、分层约束、线程模型、错误处理、数据约束、接口原则、NFR 预算、共享能力、日志、安全等），与 `.specify/templates/epic-plan-template.md` 对应。

3. **加载上下文**：读取 `EPIC_PLAN`、`epic.md`、constitution、epic-plan-template；必要时各 feature spec 与现有代码。

4. **更新 epic-plan.md**：仅重写指定范围对应章节，其余原文保留；在「变更记录」中**追加一行**；更新文档头部 `**epic-plan Version**`（Patch/Minor）。

5. **与 epic.md 的「跨 Feature 技术策略」同步**：若本次变更涉及共享能力或技术约束，提示或补充更新 epic.md 对应节。

6. **完成报告**：输出 epic-plan.md 路径、本次更新范围、是否建议对受影响 Feature 执行 plan-update 及推荐命令。

## 与现有命令的关系

- **`/speckit.epicplan`**：从无到有产出 EPIC 根下 epic-plan.md；须在所有 Feature 的 spec 输出之后运行。epicplan-update 只做**增量更新**。
- **`/speckit.plan-update`**：当 epic-plan 变更影响某 Feature 的技术规约时，对受影响 Feature 设 `SPECIFY_FEATURE` 后执行。
