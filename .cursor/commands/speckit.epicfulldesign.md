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
   - 从 `epic.md` 的 Feature Registry 区块读取 Feature 分支列表
   - 对每个分支目录（`specs/<branch>/`）加载可用工件：`spec.md`、`plan.md`、`tasks.md`、`full-design.md`

3. **加载模板**：读取 `.specify/templates/epic-full-design-template.md`

4. **生成/更新 EPIC Full Design**：
   - 将 EPIC 总览、整体 FR/NFR、通用能力整理为统一章节
   - 汇总各 Feature 的 Story（plan.md 的 Story Breakdown）与 Task（tasks.md）
   - 对跨 Feature 冲突与缺口标注 `TODO(Clarify)` 并指向来源文档

5. **写入**：保存到 `specs/epics/<EPIC-xxx-...>/epic-full-design.md`

6. **完成报告**：输出文件路径与版本号

