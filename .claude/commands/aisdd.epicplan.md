---
description: "**EPIC 级**轻量技术规约与约束。仅在多 Feature 且存在跨 Feature 技术约束时运行；基于 epic.md 与各 feature spec.md 及现有工程代码，产出 EPIC 根下的 epic-plan.md（公共约束、共享能力 Owner、Feature plan 裁剪策略）。NFR 量化评估在 /aisdd.epicdesign nfr 产出 nfr.md。不含架构图、类图、时序、接口字段、表结构或 Story 拆解，这些在 /aisdd.epicdesign 阶段产出。"
handoffs:
  - label: 制定 Feature 轻量技术规约
    agent: aisdd.featureplan
    prompt: 完成 EPIC Plan 后，基于 epic-plan 约束制定各 Feature 的 plan
    send: true
  - label: 输出 EPIC 软件设计说明书
    agent: aisdd.epicdesign
    prompt: 完成 EPIC Plan 及各 Feature plan 后，产出 EPIC 软件设计说明书（含 0 层/1 层架构、类图、时序、Story 拆解）
    send: false
  - label: 补充需求或澄清
    agent: aisdd.clarify
    prompt: 需补充技术边界或约束时，澄清后可再运行 epicplan；若 epic-plan.md 已存在可直接说明更新范围由 AI 做增量更新
    send: false
---

## 用户输入

```text
$ARGUMENTS
```

在继续操作前，你**必须**参考用户输入（若不为空）。可用于：**EPIC 标识**（如 `EPIC-002`，用于定位 EPIC 目录；当 `SPECIFY_EPIC` 已设时可空）、或补充规约侧重范围。

## 前置条件

各 Feature 的 `spec.md` 应已完成（状态建议为「就绪（可进入 Plan）」）。可选先运行 `/aisdd.challenge spec`（多 Feature EPIC 推荐）。

## 大纲

目标：在 **EPIC 根**（`specs/epics/<EPIC-xxx>/`）下产出 `epic-plan.md`，为**各 Feature 的 plan** 提供**EPIC 级公共约束**。内容为轻量文字规约（技术栈锁定、跨 Feature 边界、统一运行时约束、数据原则、共享能力 Owner、Feature plan 裁剪策略），**不含 NFR 预算**（见 `nfr.md`）、**不含接口/契约原则**（见 `interface-design.md`）、**不含 0/1 层架构图、类图、时序、方法签名、表结构或 Story 拆解**（这些在 `/aisdd.epicdesign` 阶段产出）。

**裁剪规则**：单 Feature EPIC 可省略 `epic-plan.md`，将必要 EPIC 级约束合并到唯一 Feature 的 `plan.md`；纯修复/≤3 人天小改动可跳过本命令。

**须在 epic.md 已存在、EPIC 根下 epic-plan.md 尚不存在时运行**；若已存在，可直接说明要更新的章节或范围，由 AI 做增量更新。

**前置条件**：须在**所有 Feature 的 spec 均已输出**之后执行，以保证规约设计输入完整（epic 目标 + 各 feature 需求）。须遵循 `.specify/memory/constitution.md` 的演进式设计原则。

**与 epicuidesign 的关系**：`/aisdd.epicuidesign` 是**可选**步骤（并非所有 EPIC 在技术方案阶段都具备完整 UX/视觉稿）。若 EPIC 根下已存在 `ux-design.md`，本命令**应读取**其交互规则与视觉约束，以校准 UX 相关的技术规约（如动效性能预算、UI 线程约束等）。推荐顺序：epicuidesign（若有） → epicplan → 各 Feature plan。

执行步骤：

1. **环境与路径**：从仓库根目录运行（通过 `SPECIFY_EPIC` 或 `$ARGUMENTS` 中的 EPIC 标识定位 EPIC，如 `EPIC-002`）：

```powershell
.specify/scripts/powershell/get-epic-paths.ps1 -EpicId "EPIC-002" -Json
```

解析 JSON 得到 `EPIC_DIR`、`EPIC_PLAN`（epic-plan.md 路径）。若 `EpicId` 未提供且 `$env:SPECIFY_EPIC` 未设：**终止**并提示「请设置 SPECIFY_EPIC 或在 $ARGUMENTS 中提供 EPIC 标识，如 EPIC-002」。若 `EPIC_PLAN`（epic-plan.md）**已存在**：**终止**并提示「请直接说明要更新的章节或范围，由 AI 做增量更新」。

2. **前置条件检查（所有 Feature spec 已就绪）**：遍历 `EPIC_DIR/features/` 下每个**子目录**，若某子目录存在且其中**无 `spec.md`**，则**终止**并提示：「须在**所有** Feature 的 spec 输出后再运行 /aisdd.epicplan。以下 Feature 目录尚未具备 spec：\[列出缺 spec 的目录名\]。」

3. **加载上下文**：
   - 读取 `EPIC_DIR/epic.md`（范围、Feature 拆分、跨 Feature 关注点与 Capability 决策、跨 Feature 技术策略、EPIC 完成条件）
   - 读取各 `EPIC_DIR/features/*/spec.md`（FR/NFR、依赖）
   - 读取 `.specify/memory/constitution.md`（MUST/SHOULD 约束）
   - 读取 `.specify/templates/epic-plan-template.md`（作为结构与输出格式）
   - 若 `EPIC_DIR/ux-design.md` 存在：读取其交互规则与视觉约束，用于校准 UX 相关技术规约（如动效性能预算、UI 线程约束、组件复杂度等）
   - 若 `EPIC_DIR/research/` 存在且非空：可读 `/aisdd.research --save` 的**代码事实快照**，辅助理解调研当时的存量模块；**不得**把调研报告当作约束或决策依据；**不得**因本 EPIC 的 plan/design/CR 变更而去更新 `research/` 下已有文件；plan 须独立完整分析并做出自己的技术决策
   - **分析现有工程代码**：架构分层、模块划分、包组织、现有框架，确保规约与现有工程一致

4. **填充 epic-plan.md**：按 **epic.md、各 feature spec、constitution、现有代码**，填充 epic-plan-template 各章节，写入 `EPIC_PLAN`。必须包含：
   - **EPIC 级公共约束**（只写跨 Feature 或实现期不可擅改的约束）
   - **跨 Feature 边界与依赖规则**（不画架构图，不列组件清单）
   - **统一运行时约束**（线程/错误/日志/安全原则）
   - **数据与存储总约束**（SoR、缓存、迁移原则，不写表结构）
   - **跨 Feature 共享能力识别**（Owner、消费方、后续详细设计位置）
   - **Feature Plan 裁剪规则**（每个 Feature 用 Lite 还是 Standard，必填重点是什么）
   - **变更记录**：初版写入一条

5. **与 epic.md 的「跨 Feature 技术策略」对齐**：epic-plan 中的共享能力、技术约束应与 epic.md 的轻量登记一致，并将详细约束补齐到 epic-plan；若 epic.md 该节尚为占位，可根据 epic-plan 输出建议其内容。

6. **完成报告**：输出 epic-plan.md 路径（EPIC 根），并提示下一步：对各 Feature 设置 `SPECIFY_FEATURE` 后运行 `/aisdd.featureplan`（plan 将读取 EPIC_PLAN 并在其约束下编写）。
