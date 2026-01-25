---
description: 基于已存在的 spec/plan/tasks 等工件，生成或增量更新 Full Design 全量技术方案文档（不新增技术决策）。
---

## 用户输入

```text
$ARGUMENTS
```

在继续操作前，你**必须**参考用户输入（若不为空）。用户输入用于描述“本次更新范围”（例如只更新某个 Feature/Story/Task 或某些章节）。

## 大纲

目标：在 `FEATURE_DIR` 下生成/更新 `full-design.md`，作为开发评审与执行的**权威整合文档**。

关键约束（强制）：

- **只能整合现有产物**：不得生成新的技术决策、不得在本文档中引入未在 `spec.md` / `plan.md` / `tasks.md` 中出现的方案。
- **支持增量变更**：若 `full-design.md` 已存在，只允许更新与 `$ARGUMENTS` 指定范围相关的章节；必须在“变更记录”里记录版本与影响范围。
- **默认触发时机**：通常在 `/speckit.plan` 完成后，由开发者手动运行本命令；`tasks.md` 可选（若还未生成则先留空 Task 映射）。

## 执行步骤

1. **环境准备**：从代码库根目录运行一次 `.specify/scripts/powershell/check-prerequisites.ps1 -Json`，解析返回的 JSON 获取：
   - `FEATURE_DIR`、`AVAILABLE_DOCS`、`UX_DESIGN`、`DESIGN_DIR`（`UX_DESIGN` 在 EPIC 工作流下为 **EPIC 级** ux-design.md 路径）
   - 绝对路径推导：`SPEC` = FEATURE_DIR/spec.md，`PLAN` = FEATURE_DIR/plan.md，`TASKS` = FEATURE_DIR/tasks.md（可选），`FULL_DESIGN` = FEATURE_DIR/full-design.md（生成目标）
   - 若 `spec.md` 或 `plan.md` 缺失：终止并提示先运行 `/speckit.feature` 或 `/speckit.plan`。

2. **加载上下文（渐进式披露）**：
   - 必读：`spec.md`、`plan.md`
   - 可选：`tasks.md`（若存在）、**`UX_DESIGN`**（若存在：在 EPIC 工作流下为 EPIC 级 ux-design.md）、`research.md`、`data-model.md`、`contracts/`、`quickstart.md`
   - 只加载生成 Full Design 所需的最少上下文；避免把整份文件全文搬运进输出。
   - 若加载了 `ux-design.md`（从 `UX_DESIGN` 路径）：在 Full Design 的「背景与范围」或单独小节中，可增加对 ux-design 的索引（页面/流程、设计稿形式与路径或 Figma 链接），**只做引用与追溯，不做 ux 决策**。

3. **加载模板**：读取 `.specify/templates/full-design-template.md`，并按模板结构生成文档。

4. **生成/更新策略**：
   - **若 `full-design.md` 不存在**：创建初版 `v0.1.0`，并填充模板各章节（以引用与整合为主）。
   - **若 `full-design.md` 已存在**：
     - 仅更新 `$ARGUMENTS` 指定范围相关章节（例如 ST-002、某个风险、某个评估结果）
     - 禁止全量重写；保留未受影响章节的原文
     - 版本升级规则：
       - Patch：仅补充澄清/引用/错别字/格式等非语义变更
       - Minor：新增 Story/大段新增章节内容，但不改变既有决策
       - Major：改变或推翻既有决策（原则上本命令不应执行；应先更新 plan/spec 并走增量变更流程）
     - 在“变更记录”追加一行：版本、日期、变更范围、摘要、影响模块、是否需回滚设计

5. **一致性校验（写入前）**：
   - Full Design 的 Epic/Feature/Version 字段与 `spec.md` / `plan.md` 保持一致
   - 模块级 UML 总览（若模板包含）：
     - 模块/组件清单必须与 `plan.md:A3.1 组件清单与职责` 一致
     - Full Design 可提供索引与按模块汇总展示；模块 UML 图的权威内容在 `plan.md:A3.4`（仅复制/引用，不新增决策）
   - Plan-A ↔ Plan-B 一致性：
     - `plan.md:Plan-B:B0` 的互校必须通过；若不通过必须指回 plan 补齐/修订（Full Design 不得自行补决策）
  - 追溯矩阵：
    - FR/NFR（来自 spec）必须能映射到至少一个 Story（来自 plan）
    - 若 tasks.md 存在：Story 必须能映射到 Task；否则标注“待生成 tasks.md”
  - 技术图表格式：
    - **必须使用 PlantUML**（与项目章程 `.specify/memory/constitution.md` 保持一致）
    - Full Design 中出现的图表只能**复用/整合** plan.md 已存在的 PlantUML（可复制粘贴），不得凭空新增流程/模块/边界决策

6. **写入文件**：将结果写入 `FEATURE_DIR/full-design.md`。

7. **完成报告**：
   - 输出 `full-design.md` 路径
   - 输出 Full Design Version
   - 输出本次更新范围摘要（来自 `$ARGUMENTS`）

