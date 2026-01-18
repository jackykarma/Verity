---
description: 基于 Feature 描述创建 Feature 分支与 Feature 规格说明（spec.md），供 /speckit.plan → /speckit.tasks → /speckit.fulldesign → /speckit.implement 使用。
handoffs:
  - label: 澄清规格说明要求
    agent: speckit.clarify
    prompt: 澄清规格说明的相关要求
    send: true
  - label: 制定技术方案
    agent: speckit.plan
    prompt: 为该规格说明制定方案。我正在基于……进行开发
---

## 用户输入

```text
$ARGUMENTS
```

在继续操作前，你**必须**参考用户输入（若不为空）。此处输入为**单个 Feature** 的描述（不是 EPIC）。

## 大纲

目标：创建并切换到一个 Feature 分支（`###-short-name`），并在 `specs/<branch>/spec.md` 生成 Feature 规格说明（包含 Epic/Feature/FR-NFR/依赖/边界/版本等）。

执行步骤：

1. **为分支生成简洁短名称**（2-4 个词）：
   - 动作-名词优先，保留缩写（OAuth2/API/JWT）

2. **运行创建脚本**：从仓库根目录执行：

```powershell
.specify/scripts/powershell/create-new-feature.ps1 -Json "$ARGUMENTS"
```

解析 JSON 输出获取：
- `BRANCH_NAME`
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

6. **完成报告**：输出分支名、spec.md 路径、检查清单路径，并提示下一步：
- `/speckit.clarify`（建议先做）
- `/speckit.plan`

