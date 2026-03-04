---
description: "**EPIC 级**软件设计说明书。在 epic-plan.md 及各 Feature plan.md 完成后运行；基于 epic.md、epic-plan.md、各 feature spec/plan 及**现有工程代码**，产出 EPIC 级设计说明书（0 层/1 层架构图、全景类图与关键时序、Story 拆解、L2 详细设计）。供人类评审与后续 tasks/implement 阶段 AI 编码引用。"
handoffs:
  - label: 生成任务（Story → Task）
    agent: speckit.tasks
    prompt: 将设计说明书中的 Story 拆解为可执行 tasks.md
    send: true
  - label: 补充需求或澄清
    agent: speckit.clarify
    prompt: 需补充设计边界或约束时，澄清后可再运行 epicdesign-update
    send: false
---

## 用户输入

```text
$ARGUMENTS
```

在继续操作前，你**必须**参考用户输入（若不为空）。可用于：**EPIC 标识**（如 `EPIC-002`）、**设计深度**（`--depth=lite|standard|deep`，默认 standard）、或补充设计侧重范围。

## 设计深度说明

| 深度 | 参数 | 输出内容 | 适用场景 |
|------|------|----------|----------|
| **Lite** | `--depth=lite` | §1-§2（0 层/1 层架构）+ §4（全景类图/时序）+ §5（Story 拆解） | 小改动/低风险 |
| **Standard**（默认） | `--depth=standard` 或不指定 | Lite + §3（关键功能与疑难设计）+ §6 L2 概要 | 中等复杂度 |
| **Deep** | `--depth=deep` | Standard + §6 所有 Story 的完整 L2 详细设计（类图/时序/触发条件） | 高风险/高不确定性 |

## 大纲

目标：在 **EPIC 根**（或指定输出位置）产出 **EPIC 软件设计说明书**，作为面向人类评审与后续 Task/Implement 阶段 AI 编码引用的设计方案文档。与各 Feature 的 `plan.md`（技术规约）共同约束 tasks.md 与代码实现。

**前置条件**：
- `epic-plan.md` 已产出（/speckit.epicplan）
- 至少一个 Feature 的 `plan.md` 已产出（/speckit.plan）
- 须遵循 `.specify/memory/constitution.md` 的演进式设计原则

执行步骤：

1. **环境与路径**：从仓库根运行：

```powershell
.specify/scripts/powershell/get-epic-paths.ps1 -EpicId "EPIC-002" -Json
```

解析 JSON 得到 `EPIC_DIR`、`EPIC_PLAN`。若 `EPIC_PLAN` 不存在：**终止**并提示先运行 `/speckit.epicplan`。

2. **解析深度参数**：从 `$ARGUMENTS` 中解析 `--depth=xxx`，若未指定则默认 `standard`。

3. **加载上下文**：
   - 读取 `EPIC_DIR/epic.md`（范围、Feature 拆分、通用能力、EPIC-FR/NFR）
   - 读取 `EPIC_DIR/epic-plan.md`（技术规约与约束）
   - 读取各 `EPIC_DIR/features/*/spec.md`（FR/NFR、依赖）
   - 读取各 `EPIC_DIR/features/*/plan.md`（技术规约与实现约束）
   - 若 `UX_DESIGN` 存在：读取 ux-design.md，提取信息架构、交互规则、设计稿索引
   - 读取 `.specify/memory/constitution.md`
   - 读取 `.specify/templates/epic-design-doc-template.md`（作为结构与输出格式）
   - 读取 `.cursor/rules/specify-diagram-requirements.mdc`，确保图表基于本工程实际架构
   - **分析现有工程代码**：架构分层、模块划分、包组织、现有框架

4. **根据深度填充设计说明书**：

   #### Lite（基础架构 + Story 拆解）
   - **§1 0 层架构**：EPIC 与外部/现有工程边界（架构图 + 外部依赖清单）
   - **§2 1 层架构**：分层与模块职责（架构图 + 组件清单）
   - **§4 全景类图与关键时序**：全景类图 + 关键时序图（正常+异常）
   - **§5 Story 拆解**：Story 列表 + 依赖关系图 + FR/NFR 覆盖矩阵

   #### Standard（默认：+ 疑难设计 + L2 概要）
   在 Lite 基础上追加：
   - **§3 关键功能与疑难功能设计**
   - **§6 L2 详细设计**（每个 Story 的概要：需求/DoD + 简要功能设计说明）

   #### Deep（+ 完整 L2）
   在 Standard 基础上：
   - **§6 L2 详细设计** 补齐所有 Story 的完整类图、时序图、触发条件与系统响应（可写在本文档内或引用 story_detail_design.md）

5. **写入设计说明书**：输出到 `EPIC_DIR/epic-design.md`（或按项目约定的路径）。

6. **更新各 Feature plan.md 的 Story 索引表**：若各 Feature 的 plan.md 中有 Story 索引表，提示更新以对齐本设计说明书中的 Story 拆解。

7. **完成报告**：输出设计说明书路径、当前深度、已生成的章节，并提示下一步：
   - Lite 完成后：提示 `/speckit.epicdesign --depth=standard` 或 `/speckit.tasks`
   - Standard 完成后：提示 `/speckit.epicdesign --depth=deep` 或 `/speckit.tasks`
   - Deep 完成后：提示 `/speckit.tasks`

核心规则：
- 所有图表必须使用 **Mermaid 格式**，遵循 `.cursor/rules/mermaid-style-guide.mdc`
- 图表内容须基于本工程**实际架构与真实代码**，遵循 `.cursor/rules/specify-diagram-requirements.mdc`
- 设计说明书是 tasks.md 与 implement 阶段的**设计事实源**，与 plan.md 的技术规约共同约束实现
