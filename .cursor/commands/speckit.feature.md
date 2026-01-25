---
description: 基于 Feature 描述在当前 EPIC 下创建 Feature 文档目录并生成 spec.md（本工作流 Feature 不创建 git 分支），供 /speckit.plan → /speckit.tasks → /speckit.fulldesign → /speckit.implement 使用。
handoffs:
  - label: 澄清规格说明要求
    agent: speckit.clarify
    prompt: 澄清规格说明的相关要求
    send: true
  - label: 交互与视觉设计（EPIC 级）
    agent: speckit.epicuidesign
    prompt: 若尚未为 EPIC 做 epic uidesign，可运行 /speckit.epicuidesign "EPIC-xxx"（须在所有 Feature 的 spec 输出之后，从整个需求整体设计）；建议在任意 Feature 的 plan 之前完成
    send: false
  - label: 制定技术方案
    agent: speckit.plan
    prompt: 为该规格说明制定方案（由 SE/TL 在 EPIC 分支产出与维护）。我正在基于……进行开发
---

## 用户输入

```text
$ARGUMENTS
```

在继续操作前，你**必须**参考用户输入（若不为空）。此处输入为**单个 Feature** 的描述（不是 EPIC）。

## 大纲

目标：在当前 EPIC（`specs/epics/<EPIC>/`）下创建一个 Feature 文档目录（`features/FEAT-xxx-.../`），并生成 `spec.md`（包含 Epic/Feature/FR-NFR/依赖/边界/版本等）。

执行步骤：

1. **为 Feature 生成简洁短名称**（2-4 个词）：
   - 动作-名词优先，保留缩写（OAuth2/API/JWT）

2. **运行创建脚本**：从仓库根目录执行：

```powershell
.specify/scripts/powershell/create-new-feature.ps1 -Json "$ARGUMENTS"
```

解析 JSON 输出获取：
- `EPIC_DIR_NAME`
- `FEATURE_ID`
- `FEATURE_KEY`（相对 `specs/` 的路径：`epics/<EPIC>/features/<FEAT>`）
- `FEATURE_DIR`（绝对路径）
- `SPEC_FILE`
- `FEATURE_NUM`

3. **加载模板**：读取 `.specify/templates/spec-template.md`，按模板结构写入 `SPEC_FILE`。

4. **Feature 规格填写规则（必须）**：
- 必须填写 `Epic`（例如 `EPIC-001 - xxx`），若未知写 `TODO(Epic)` 并交由 `/speckit.clarify` 补齐
- Feature Version 初始为 `v0.1.0`
- FR 必须可测试
- NFR 必须覆盖至少：性能/功耗/内存/安全隐私/可观测性/可靠性（可少量 `[需澄清]`，但不得缺失整类）
- AC（验收标准）必须引用 FR/NFR ID

5. **质量检查清单**：在 `FEATURE_DIR/checklists/requirements.md` 生成需求质量清单（与 Feature 模板结构一致）。

6. **完成报告**：输出 Feature Key、spec.md 路径、检查清单路径，并提示下一步：
- `/speckit.clarify`（建议先做）
- 若**尚未**为 EPIC 做 epic uidesign：**`/speckit.epicuidesign "EPIC-xxx"`**（须在所有 Feature 的 spec 输出之后，见工作流 5.3）再做 `/speckit.plan`；或直接 `/speckit.plan`（plan 会引用 EPIC 级 ux-design，若存在）

