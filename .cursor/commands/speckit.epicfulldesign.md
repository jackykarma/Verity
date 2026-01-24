---
description: 基于 epic.md 与各 Feature 的 plan/tasks 等工件，生成 EPIC 级 Full Technical Design（统一指导，不新增技术决策）。
---

## 用户输入

```text
$ARGUMENTS
```

在继续操作前，你**必须**参考用户输入（若不为空）。用户输入用于指定 EPIC（例如 `EPIC-001`）以及本次生成/更新范围。

## 大纲

目标：生成/更新 `specs/epics/<EPIC-xxx-...>/epic-full-design.md`，为整个 EPIC 提供统一的技术指导文档。

强制约束：
- 只整合现有产物（epic.md + 各 Feature 的 spec/plan/tasks/full-design），不得新增新决策
- 支持增量更新（仅更新 `$ARGUMENTS` 指定范围，记录版本变更）

## 执行步骤

1. **定位 EPIC**：
   - 解析 `$ARGUMENTS` 提取 `EPIC-xxx`
   - 在 `specs/epics/` 下定位 `EPIC-xxx-*` 目录，读取 `epic.md`

2. **发现关联 Feature**：
   - 从 `epic.md` 的 Feature Registry 区块读取 Feature 目录列表（Feature Key，相对 `specs/`，例如 `epics/EPIC-001-xxx/features/FEAT-001-yyy`）
   - 对每个 Feature 目录（`specs/<FEATURE_KEY>/`）加载可用工件：`spec.md`、`plan.md`、`tasks.md`、`full-design.md`

3. **加载模板**：读取 `.specify/templates/epic-full-design-template.md`

4. **生成/更新 EPIC Full Design**：
   - 将 EPIC 总览、整体 FR/NFR、通用能力整理为统一章节
   - 汇总各 Feature 的 Story（plan.md 的 Story Breakdown）与 Task（tasks.md）
   - **EPIC 模块目录与映射（强制，若模板包含）**：
     - 从各 Feature 的 `plan.md:A3.1 组件清单与职责` 汇总 Feature 模块/组件清单（作为目录权威来源）
     - 形成 EPIC Module Catalog（EPIC 级能力/子系统视角），并输出 EPIC 模块 ↔ Feature 模块映射表
     - EPIC Full Design 只做归并/映射与暴露差异，不新增统一决策；冲突用 `TODO(Clarify)` 指向应修改的 Feature plan
   - **EPIC 级模块 UML 一致性视图（可选但建议，若模板包含）**：
     - 基于 EPIC Module Catalog/Mapping 与各 Feature 契约工件生成 EPIC 视角的“边界/契约级”类图与端到端时序图（成功/异常）
     - 若无法从现有工件推导（契约缺失/边界不清），必须标注 `TODO(Clarify)` 指向应补齐的 Feature plan（优先：A3.1/A3.2/A3.4/Plan-B:B0/B4）
   - Plan-A ↔ Plan-B 一致性（跨 Feature 检查）：
     - 每个 Feature 必须通过其 `plan.md:Plan-B:B0` 互校；若未通过必须在 EPIC Full Design 标注冲突并指回对应 Feature 修订
   - 对跨 Feature 冲突与缺口标注 `TODO(Clarify)` 并指向来源文档

5. **写入**：保存到 `specs/epics/<EPIC-xxx-...>/epic-full-design.md`

6. **完成报告**：输出文件路径与版本号

