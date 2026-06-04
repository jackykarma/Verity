# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 仓库定位

**Verity** 是一套文档优先的 AI 辅助软件设计开发工作流工具集（AISDD）。本仓库**本身不是 Android 应用代码**，而是用于治理 Android 项目设计与开发流程的工作流工具、模板与脚本集合。

所服务的 Android 项目技术栈（来源：`.specify/memory/constitution.md`）：
- **语言**：Kotlin
- **UI 框架**：Jetpack Compose
- **构建**：Gradle（Kotlin DSL）
- **最低支持**：Android 8.0（API 24）
- **目标版本**：Android 15（API 35）
- **架构**：UI / Domain / Data 分层；Hilt DI；Room

## 目录结构

```
.specify/
  memory/constitution.md        # 核心章程（AI 行为约束规则）
  templates/                    # 所有工作流产物的文档模板
  scripts/powershell/           # EPIC/Feature 管理 PowerShell 脚本
docs/aisdd/workflow-overview.md # 端到端流程总览（首先阅读此文件）
.claude/
  commands/aisdd.*.md           # 各工作流阶段的 AI 斜杠命令
  rules/                        # 规则文件（.mdc），供命令主动读取
.cursor/
  commands/aisdd.*.md           # Cursor 斜杠命令（同步自 .claude/commands/）
  rules/                        # Cursor 规则（.mdc），始终应用
docs/
  template/                     # 提交信息、PRD、技术文档模板
  diagram-specification/        # Mermaid 配色参考
specs/epics/                    # （生成）EPIC 文档目录
```

## 关键脚本

所有 PowerShell 脚本位于 `.specify/scripts/powershell/`，需要 `pwsh`（PowerShell 7+）或 `powershell`（PowerShell 5）：

```powershell
# 创建新 EPIC（新建分支 + 目录 + epic.md 模板）
pwsh -NoProfile -File .\.specify\scripts\powershell\create-new-epic.ps1 -Json -ShortName "<short-name>" "<EPIC 描述>"

# 在当前分支上创建（不新建 git 分支）
pwsh -NoProfile -File .\.specify\scripts\powershell\create-new-epic.ps1 -Json -UseCurrentBranch -ShortName "<short-name>" "<EPIC 描述>"

# 解析 EPIC 路径（epicuidesign、techspec、epicdesign 阶段使用）
pwsh -NoProfile -File .\.specify\scripts\powershell\get-epic-paths.ps1 -EpicId EPIC-001 -Json
```

## AISDD 工作流命令

以下斜杠命令定义于 `.claude/commands/aisdd.*.md`，驱动完整文档生命周期：

| 命令 | 产出物 | 说明 |
|------|--------|------|
| `/aisdd.research` | `research/codebase-*-<date>.md`（可选） | **前置代码考古**：只记录存量代码事实快照；不做方案决策；techspec/design/CR **不回写** |
| `/aisdd.epicspec` | `epic.md` | EPIC 入口，运行 `create-new-epic.ps1` |
| `/aisdd.featurespec` | 各 Feature `spec.md` | FR / NFR / AC |
| `/aisdd.techspec` | `tech-spec.md` | **EPIC 唯一技术规格书**（合并原 epic-plan + 各 Feature plan） |
| `/aisdd.epicuidesign` | `ux-design.md` | 可选，与 techspec 并行 |
| `/aisdd.epicdesign` | `epic-design.md`、`key-func-design/KD_*_*.md`、`nfr.md`、`interface-design.md`、`database-design.md`、`analytics-tracking.md`、各 `features/*/l2_design/ST-xxx_*.md` | 分阶段（范围递减、精度递增）：**`key`**（§七）论证方案可行性，KD 内类图须含全量公共方法签名、时序须穷举全异常分支 → **`nfr`**（§八~§十一）量化验证 → **`story`**（§十二）拆解 → **`l2`**（§十三）Story 级落码设计（§八~§十一 正文在三份独立 md 中，`epic-design.md` 仅引用） |
| `/aisdd.featuretasks` | 各 Feature `tasks.md` | 内置 FR/NFR → Story → Task 追溯矩阵，不反向改写冻结 spec/tech-spec |
| `/aisdd.implement` | 代码 | 按 Task 逐个执行 |
| `/aisdd.cr` | CR 文件 + 下游产物更新 | 变更请求 |
| `/aisdd.challenge` | 挑战报告（不写入文件） | 阶段转换前可选：spec / techspec / design |
| `/aisdd.analyze` | 分析报告（不写入文件，**可选、非阻塞**） | **feature** / **epic** / **epic pre-tasks**；不 gate `implement` |

**小改动快速通道**（预估 ≤3 人天）：精简 `tech-spec.md`、可跳过 `ux-design.md` 与各 Feature `l2_design/` 下 L2 正文；`epic-design.md` 仅写 Story 拆解 + 关键类图。

## 分支策略

- 每个 EPIC 一个分支：`epic/EPIC-xxx-short-name`（由 `create-new-epic.ps1` 创建）
- **不为 Feature 单独创建分支**——Feature 是文档组织单位
- 所有 spec/tech-spec/tasks/代码均在 EPIC 分支上进行；完成后合并回 `main`

## 提交信息格式

中文 Conventional Commits + Emoji（详见 `docs/template/commit-message-template.md`）：

```
<类型>(<范围>): <简短描述，不超过 50 字>

- 变更点 1
- 变更点 2

Closes #<issue>
```

常用类型：`feat ✨`、`fix 🐛`、`docs 📝`、`refactor ♻️`、`chore 🔧`

Windows 下避免中文乱码：将提交信息保存为 UTF-8 文件，再用 `git commit -F .git-msg.txt` 提交。

## 图表规范

所有 Mermaid 图表必须使用 `.claude/rules/mermaid-style-guide.mdc` 中定义的 Material Design 配色。标准 init 块：

```
%%{init: {'theme': 'base', 'themeVariables': { 'primaryColor': '#E3F2FD', 'primaryTextColor': '#1565C0', 'primaryBorderColor': '#1976D2', 'lineColor': '#546E7A'}}}%%
```

禁止使用 PlantUML 及其他图表格式。

### 时序图文字说明（通用强制规则）

**适用范围**：本项目所有文档中出现的时序图，包括但不限于 AISDD 设计文档、技术实现文档、功能文档、需求文档等。

每张 `sequenceDiagram` 代码块**紧下方**必须有独立文字说明（标题统一为「协作者与过程说明」），内容须覆盖：

1. **触发与入口**：谁、在什么条件下发起交互
2. **协作链与职责**：沿调用方向说明每一跳「谁调用谁、为了什么、输入/输出语义」
3. **工作过程与数据流**：中间状态如何变化（内存/缓存/持久化/网络等）；关键业务决策在何处做出
4. **分支与异常**：图中每个 `alt/else`（及重要的 `opt/loop`）分别说明：进入条件、各分支的差异行为、最终对调用方可见的结果
5. **结束条件**：正常结束与各类异常结束分别是什么

**禁止**：仅用一句话概括、只列 participant 名单、或与图中消息逐条机械重复而无解释。文字说明须达到**未读图也能理解主干协作与分支差异**的程度。

## 核心设计原则（constitution.md）

在为本项目产出任何设计文档时：

1. **演进式设计**——在现有 Android 代码基础上扩展/适配，禁止提出整体重写或架构替换方案
2. **差距分析优先**——设计前须将每条 FR/NFR 映射到现有模块，明确可复用、需扩展、需新增的边界
3. **最小改动原则**——优先最小改动满足需求；若必须增加复杂度，须在 `plan.md §复杂度跟踪` 中说明理由
4. **模板结构保护**——禁止在输出文档中随意增删模板章节；收到"更新 XX 章节"指令时，只修改该章节（精准更新）
5. **禁止过程性产物**——文档是最终交付物，不得输出"分析过程"、"设计思路"等过程性章节

## 文档事实源

| 文档 | 事实源归属 |
|------|-----------|
| `spec.md` | 需求：FR / NFR / AC / 范围边界 / 完整场景矩阵（设计走查与验证追溯基线） |
| `ux-design.md` | 体验呈现：交互规则、视觉规范、设计稿索引 |
| `tech-spec.md` | EPIC 唯一技术规约：第一部分 EPIC 公共约束 + 第二部分各 Feature 增量规约 |
| `epic-design.md` | 架构与设计总览：0/1 层；§7.1 KD 清单与依赖、§7.2 引用；§8/§14 索引；§9 摘要并链至 `nfr.md`；§10～§12 摘要并链至 `interface-design.md` / `database-design.md` / `analytics-tracking.md` |
| `key-func-design/KD_*_*.md` | §七各 KD 详细设计（核心方案、流程图、核心时序） |
| `nfr.md` | §九技术评估（设计产出验证，9.1～9.7 量化全文） |
| `features/*/l2_design/ST-xxx_*.md` | L2 落码级详细设计（复杂/高风险 Story 按需一文件） |
| `tasks.md` | 执行：可操作 Task，含 spec/设计追溯 |
