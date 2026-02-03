---
description: **EPIC 级**技术架构设计。须在**所有 Feature 的 spec 均已输出**之后运行；基于 epic.md 与各 feature spec.md 及**现有工程代码**，产出 EPIC 根下的 epic-arch.md（0 层/1 层架构、规范约束）。各 Feature 的 plan 必须在其约束下做 A2/A3.1，保证基于整个 EPIC 全局、系统考虑。插入在 specify→plan 之间，可与 epicuidesign 并行或先后执行。
handoffs:
  - label: 制定技术方案
    agent: speckit.plan
    prompt: 完成 epic arch design 后，基于 spec、EPIC 级 epic-arch 与 ux-design 制定技术方案
    send: true
  - label: 补充需求或澄清
    agent: speckit.clarify
    prompt: 需补充技术边界或约束时，澄清后可再运行 epicarchdesign 或 epicarchdesign-update
    send: false
---

## 用户输入

```text
$ARGUMENTS
```

在继续操作前，你**必须**参考用户输入（若不为空）。可用于：**EPIC 标识**（如 `EPIC-002`，用于定位 EPIC 目录；当 `SPECIFY_EPIC` 已设时可空）、或补充架构侧重范围。

## 大纲

目标：在 **EPIC 根**（`specs/epics/<EPIC-xxx>/`）下产出 `epic-arch.md`，为**各 Feature 的 plan** 提供**整体技术架构与规范约束**。**须从整个 EPIC 需求整体**看待与设计（0 层/1 层架构、模块边界、与现有工程衔接、技术约束），各 Feature 的 plan 的 A2（0 层）、A3.1（1 层）必须**继承**本架构，不得各自发明。

**须在 epic.md 已存在、EPIC 根下 epic-arch.md 尚不存在时运行**；若已存在，请改用 `/speckit.epicarchdesign-update`。

**前置条件**：须在**所有 Feature 的 spec 均已输出**之后执行，以保证架构设计输入完整（epic 目标 + 各 feature 需求）。须遵循 `.specify/memory/constitution.md` 的演进式设计原则（基于现有代码、差距分析、最小改动）。

执行步骤：

1. **环境与路径**：从仓库根目录运行（通过 `SPECIFY_EPIC` 或 `$ARGUMENTS` 中的 EPIC 标识定位 EPIC，如 `EPIC-002`）：

```powershell
.specify/scripts/powershell/get-epic-paths.ps1 -EpicId "EPIC-002" -Json
```

解析 JSON 得到 `EPIC_DIR`、`EPIC_ARCH`（epic-arch.md 路径）、`EPIC_UX_DESIGN`、`EPIC_DESIGN_DIR`。若 `EpicId` 未提供且 `$env:SPECIFY_EPIC` 未设：**终止**并提示「请设置 SPECIFY_EPIC 或在 $ARGUMENTS 中提供 EPIC 标识，如 EPIC-002」。若 `EPIC_ARCH`（epic-arch.md）**已存在**：**终止**并提示「请使用 /speckit.epicarchdesign-update 做增量更新」。

2. **前置条件检查（所有 Feature spec 已就绪）**：遍历 `EPIC_DIR/features/` 下每个**子目录**，若某子目录存在且其中**无 `spec.md`**，则**终止**并提示：「须在**所有** Feature 的 spec 输出后再运行 /speckit.epicarchdesign。以下 Feature 目录尚未具备 spec：\[列出缺 spec 的目录名\]。请对缺 spec 的 Feature 运行 /speckit.feature 或 /speckit.specify，待全部完成后再运行本命令。」

3. **加载上下文**：
   - 读取 `EPIC_DIR/epic.md`（范围、Feature 拆分、通用能力、跨 Feature 技术策略、EPIC-FR/NFR）
   - 读取各 `EPIC_DIR/features/*/spec.md`（FR/NFR、依赖、核心实体）
   - 读取 `.specify/memory/constitution.md`（MUST/SHOULD 约束，作为架构设计关卡）
   - 读取 `.specify/templates/epic-arch-template.md`（作为结构与输出格式）
   - **分析现有工程代码**：架构分层、模块划分、包组织、现有框架（如 Jetpack/Compose/Hilt），确保 0 层/1 层与现有工程衔接，遵循演进式设计

4. **填充 epic-arch.md**：按 **epic.md、各 feature spec、constitution、现有代码**，填充 epic-arch-template 各章节，写入 `EPIC_ARCH`。必须包含：
   - **0 层架构**：EPIC 与外部系统/现有工程的边界、主要子系统或模块划分（Mermaid 图，遵循 `.cursor/rules/mermaid-style-guide.mdc`）
   - **1 层架构**：各层/模块职责、依赖方向、与现有代码的衔接（Mermaid 图）
   - **规范与约束**：分层约定、接口/契约原则、技术栈与演进约束（与 constitution 对齐）；可与 epic.md 的「跨 Feature 技术策略」中「技术约束」对齐或细化
   - **变更记录**：初版写入一条

5. **与 epic.md 的「跨 Feature 技术策略」对齐**：epic-arch 中的模块边界、共享能力、技术约束应与 epic.md 的「跨 Feature 技术策略」一致；若 epic.md 该节尚为占位，可根据 epic-arch 输出建议其内容（或提示 SE/TL 后续同步）。

6. **完成报告**：输出 epic-arch.md 路径（EPIC 根），并提示下一步：对各 Feature 设置 `SPECIFY_FEATURE` 后运行 `/speckit.plan`（plan 将读取 EPIC_ARCH 并在其约束下做 A2/A3.1）。
