---
description: 将当前 Feature 的状态/版本/关键链接增量同步回其所属 EPIC 总览（epic.md），以保持 EPIC 统一视图。
---

## 用户输入

```text
$ARGUMENTS
```

在继续操作前，你**必须**参考用户输入（若不为空）。用户输入用于指定“同步范围/备注”（例如只同步版本，或仅更新某一行备注）。

## 大纲

目标：基于当前 Feature 工件（`spec.md`、`plan.md`、`tasks.md`），增量更新其所属 EPIC 的 `epic.md` 中的 **Feature Registry（自动同步区）**。

约束（强制）：
- **增量更新**：仅更新对应 Feature 的那一行（或新增一行），不得重写 EPIC 其他章节。
- **不改设计**：本命令只做状态/链接/版本同步，不新增技术决策。

## 执行步骤

1. **定位 Feature 上下文**：从代码库根目录运行 `.specify/scripts/powershell/check-prerequisites.ps1 -Json -PathsOnly`，解析路径：
   - `FEATURE_DIR`、`FEATURE_SPEC`、`IMPL_PLAN`、`TASKS`
   - 若 `FEATURE_SPEC` 不存在：终止并提示先运行 `/speckit.feature`

2. **从 Feature spec.md 读取 Epic 信息**：
   - 解析 `spec.md` 顶部的 `**Epic**：EPIC-xxx - ...`，提取 `EPIC-xxx`
   - 若缺失：终止并提示先补齐 Epic 字段（可用 `/speckit.clarify`）

3. **定位 EPIC 总览文档**：
   - 在 `specs/epics/` 下查找以 `EPIC-xxx-` 开头的目录，并定位其中 `epic.md`
   - 若未找到：终止并提示先运行 `/speckit.specify` 创建 EPIC

4. **同步内容（仅一行）**：
   - Feature 名称（来自 spec.md 标题）
   - 分支名（来自当前分支/FEATURE_DIR）
   - Feature/Plan/Tasks 的 Version（从各文档头部字段读取；缺失则写 N/A）
   - 状态推断：
     - Spec Ready / Plan Ready / Tasks Ready / In Implement / Done（按文件存在性与 Version 填充情况推断）
   - 更新 `epic.md` 中 `BEGIN_FEATURE_REGISTRY` 与 `END_FEATURE_REGISTRY` 标记内的表格：
     - 若该分支行已存在：更新版本/状态/链接
     - 若不存在：新增一行
   - 若 `$ARGUMENTS` 提供备注：写入“备注”列（不覆盖已有备注，除非明确要求覆盖）

5. **写回 epic.md**（仅修改 Feature Registry 区块）。

6. **完成报告**：
   - 输出 epic.md 路径
   - 输出同步的分支与状态

> 说明：如需无模型方式同步，可直接运行脚本：
>
> ```powershell
> .specify/scripts/powershell/sync-epic-overview.ps1 -Notes "$ARGUMENTS"
> ```

