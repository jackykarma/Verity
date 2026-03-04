---
description: "**EPIC 级**技术规约与约束。须在**所有 Feature 的 spec 均已输出**之后运行；基于 epic.md 与各 feature spec.md 及**现有工程代码**，产出 EPIC 根下的 epic-plan.md（全局技术约束与规约，不含 0 层/1 层架构图）。各 Feature 的 plan 必须在其约束下编写。0 层/1 层架构图在后续 /speckit.epicdesign 阶段产出。"
handoffs:
  - label: 制定 Feature 技术规约
    agent: speckit.plan
    prompt: 完成 EPIC Plan 后，基于 epic-plan 约束制定各 Feature 的 plan
    send: true
  - label: 输出 EPIC 软件设计说明书
    agent: speckit.epicdesign
    prompt: 完成 EPIC Plan 及各 Feature plan 后，产出 EPIC 软件设计说明书（含 0 层/1 层架构、类图、时序、Story 拆解）
    send: false
  - label: 补充需求或澄清
    agent: speckit.clarify
    prompt: 需补充技术边界或约束时，澄清后可再运行 epicplan 或 epicplan-update
    send: false
---

## 用户输入

```text
$ARGUMENTS
```

在继续操作前，你**必须**参考用户输入（若不为空）。可用于：**EPIC 标识**（如 `EPIC-002`，用于定位 EPIC 目录；当 `SPECIFY_EPIC` 已设时可空）、或补充规约侧重范围。

## 大纲

目标：在 **EPIC 根**（`specs/epics/<EPIC-xxx>/`）下产出 `epic-plan.md`，为**各 Feature 的 plan** 提供**EPIC 级技术约束与规约**。内容为纯文字约束（技术栈、分层、线程、错误处理、数据、接口、NFR 预算、共享能力等），**不含 0 层/1 层架构图**（架构图在 `/speckit.epicdesign` 阶段产出）。

**须在 epic.md 已存在、EPIC 根下 epic-plan.md 尚不存在时运行**；若已存在，请改用 `/speckit.epicplan-update`。

**前置条件**：须在**所有 Feature 的 spec 均已输出**之后执行，以保证规约设计输入完整（epic 目标 + 各 feature 需求）。须遵循 `.specify/memory/constitution.md` 的演进式设计原则。

执行步骤：

1. **环境与路径**：从仓库根目录运行（通过 `SPECIFY_EPIC` 或 `$ARGUMENTS` 中的 EPIC 标识定位 EPIC，如 `EPIC-002`）：

```powershell
.specify/scripts/powershell/get-epic-paths.ps1 -EpicId "EPIC-002" -Json
```

解析 JSON 得到 `EPIC_DIR`、`EPIC_PLAN`（epic-plan.md 路径）。若 `EpicId` 未提供且 `$env:SPECIFY_EPIC` 未设：**终止**并提示「请设置 SPECIFY_EPIC 或在 $ARGUMENTS 中提供 EPIC 标识，如 EPIC-002」。若 `EPIC_PLAN`（epic-plan.md）**已存在**：**终止**并提示「请使用 /speckit.epicplan-update 做增量更新」。

2. **前置条件检查（所有 Feature spec 已就绪）**：遍历 `EPIC_DIR/features/` 下每个**子目录**，若某子目录存在且其中**无 `spec.md`**，则**终止**并提示：「须在**所有** Feature 的 spec 输出后再运行 /speckit.epicplan。以下 Feature 目录尚未具备 spec：\[列出缺 spec 的目录名\]。」

3. **加载上下文**：
   - 读取 `EPIC_DIR/epic.md`（范围、Feature 拆分、通用能力、跨 Feature 技术策略、EPIC-FR/NFR）
   - 读取各 `EPIC_DIR/features/*/spec.md`（FR/NFR、依赖、核心实体）
   - 读取 `.specify/memory/constitution.md`（MUST/SHOULD 约束）
   - 读取 `.specify/templates/epic-plan-template.md`（作为结构与输出格式）
   - **分析现有工程代码**：架构分层、模块划分、包组织、现有框架，确保规约与现有工程一致

4. **填充 epic-plan.md**：按 **epic.md、各 feature spec、constitution、现有代码**，填充 epic-plan-template 各章节，写入 `EPIC_PLAN`。必须包含：
   - **技术栈与工程约束**（全局锁定）
   - **分层与模块约束**（架构原则，依赖方向，模块边界）
   - **线程与并发模型**
   - **错误处理规范**
   - **数据与存储约束**（SoR、缓存、迁移）
   - **接口与契约原则**
   - **NFR 预算框架**（性能/功耗/内存/安全，各 Feature 分配）
   - **跨 Feature 共享能力识别**（与 epic.md 对齐）
   - **日志与可观测性**
   - **安全与合规约束**（如适用）
   - **变更记录**：初版写入一条

5. **与 epic.md 的「跨 Feature 技术策略」对齐**：epic-plan 中的共享能力、技术约束应与 epic.md 的「跨 Feature 技术策略」一致；若 epic.md 该节尚为占位，可根据 epic-plan 输出建议其内容。

6. **完成报告**：输出 epic-plan.md 路径（EPIC 根），并提示下一步：对各 Feature 设置 `SPECIFY_FEATURE` 后运行 `/speckit.plan`（plan 将读取 EPIC_PLAN 并在其约束下编写）。
