---
description: 根据自然语言的需求描述创建或更新 EPIC 规格说明（EPIC 容器 + Feature 拆分列表）。Feature 的文档目录与 spec.md 请使用 /aisdd.featurespec 单独创建。
handoffs: 
  - label: 创建 Feature（逐个）
    agent: aisdd.featurespec
    prompt: 为某个 Feature 创建文档目录与 spec.md。Feature 描述如下……
    send: false
---

## 用户输入

```text
$ARGUMENTS
```

在继续操作前，你**必须**参考用户输入（若不为空）。

## 大纲

用户在触发消息中 `/aisdd.epicspec` 后输入的文本**即为 EPIC 描述**（大需求/主题）。该 EPIC 可能拆解为多个可独立交付的 Feature。即使下方出现字面量 `$ARGUMENTS`，也需假定该对话中始终可获取此描述。除非用户提交的指令为空，否则请勿要求用户重复描述。

根据该功能描述，执行以下操作：

### 1) 创建 EPIC 文档目录与 epic.md

- **是否新建 Git 分支**（由 `$ARGUMENTS` 决定）：
  - **默认**：创建 EPIC 目录并 **新建并切换** 到分支 `epic/EPIC-###-<short-name>`（与原先行为一致）。
  - **保持在当前分支**：若用户在指令中显式包含以下任一标记，则脚本须加 **`-UseCurrentBranch`**，**不**执行 `git checkout -b`，仅在当前 HEAD 上创建 `specs/epics/...` 与 `epic.md`：
    - `-UseCurrentBranch`、`--use-current-branch`
    - 中文：`在当前分支`、`不新建分支`、`保留当前分支`
- **优先**：从仓库根目录执行脚本（输出 JSON）：
  - **默认（新建 epic 分支）**：  
    `pwsh -NoProfile -File .\.specify\scripts\powershell\create-new-epic.ps1 -Json -ShortName "<short-name>" "<EPIC 描述>"`
  - **当前分支**：  
    `pwsh -NoProfile -File .\.specify\scripts\powershell\create-new-epic.ps1 -Json -UseCurrentBranch -ShortName "<short-name>" "<EPIC 描述>"`  
  其中 `<short-name>` 为英文短名（如 `android-gallery`），用于目录名（及默认模式下的分支名）；`<EPIC 描述>` 可与用户输入一致（调用脚本时去掉上述分支开关字样，仅保留描述正文）。若环境仅支持 PowerShell 5，使用 `powershell -NoProfile -File ...`，且**不要**使用 `&&` 连接命令，应分两步：先 `cd` 到仓库根，再执行脚本。
  - 解析 JSON 输出得到：`EPIC_ID`、`EPIC_BRANCH`（当前分支模式下为当前分支名）、`USE_CURRENT_BRANCH`、`EPIC_DIR`、`EPIC_FILE`。
- **脚本失败时（如中文/编码导致执行失败）**：
  - 手动创建目录 `specs/epics/EPIC-001-<short-name>/` 与 `epic.md`（见步骤 2、3）。
  - **Git 分支**：若用户要求默认流程，在仓库根执行 `git checkout -b epic/EPIC-001-<short-name>`；若用户已选择「当前分支」模式，**不要**新建分支，并在完成报告中说明「已在当前分支创建 EPIC 目录」。

### 2) 加载 EPIC 模板并写入 epic.md

- 加载 `.specify/templates/epic-template.md`
- 按模板结构将 EPIC 信息写入 `EPIC_FILE`（不得切换为 Feature 视角写 FR/NFR）

### 3) 在 EPIC 文档中完成 Feature 拆分（必填）

对 EPIC 做 Feature 拆分，输出：
- Feature 列表（每项必须可独立交付，并包含 Feature ID、状态）
- 每个 Feature 的边界（目标、In/Out、依赖、验收意图、拆分动机）
- Feature 类型标注：Product / Capability
- 若存在跨 Feature 共享关注点，补充 Capability 决策与轻量技术策略登记

### 4) 输出下一步指令（逐个 Feature 手动触发）

在命令输出中列出建议的下一步（不自动批量创建多个 Feature 文档目录）：
- 对每个 Feature 输出一条建议命令：`/aisdd.featurespec <Feature 目标；范围（In/Out）；依赖；关键 NFR 关注点>`

### 5) 完成报告

输出：
- EPIC ID
- epic.md 路径（`EPIC_FILE`）
- 拆分出的 Feature 数量

## 重要说明（避免流程混淆）

- `/aisdd.epicspec`：EPIC 入口（产出 epic.md + Feature 拆分列表）
- `/aisdd.featurespec`：Feature 入口（创建 Feature 文档目录 + 产出 spec.md；本工作流不为 Feature 创建 git 分支）

## 通用指南

### 快速指南

- 聚焦用户**需要什么**以及**为什么需要**。
- 避免描述**如何**实现（不提及技术栈、API、代码结构）。
- 面向业务相关方编写，而非开发人员。
- 请勿在规格说明中嵌入任何检查清单，检查清单需通过单独命令生成。

### epic.md 纯净度边界守护（必须）

> **识别特征详表（权威）**：`.cursor/rules/aisdd-document-boundaries.mdc` **Part A**（§A.2 八类污染识别清单与正确归属）。写入 `specs/**` 文件时该规则会自动附加，本节不重复详表。

`epic.md`（EPIC 规格 + Feature 拆分）与下游 `spec.md` 同属**产品规格事实源**，**禁止**含技术实现细节。写入 `epic.md` 与 Feature 拆分条目时，**必须逐条扫描** 8 类技术污染特征（① 类名/接口名 ② 框架/库名 ③ 数据存储细节 ④ API/接口细节 ⑤ 代码结构 ⑥ 线程/并发原语 ⑦ 设计模式实现 ⑧ 埋点字段），命中即按 block_ask 流程拦截。

**判断分界点**：「删掉这条后，EPIC 的业务范围与拆分逻辑是否仍完整？」仍完整 → 删除；不完整 → 改写为业务语言后保留。

**Feature 拆分条目的合法字段**：Feature 名称（业务语言）、Feature 类型（Product / Capability）、目标、In Scope / Out of Scope、依赖关系（Feature 间 / 外部团队）、验收意图、拆分动机。**禁止**在 Feature 条目里出现"该 Feature 将使用 xxx 框架/库/类实现"等技术决策——这些属于 EPIC 根 `tech-spec.md`（第二部分各 Feature 节）。

**拦截提示格式**：

```
⚠️ 边界检查：以下内容疑似属于 tech-spec.md / epic-design.md 而非 epic.md：

1. [原文条目] → 命中类别：[...] → 建议归入 [...]

请确认：
(a) 改写为业务语言后留在 epic.md（推荐）
(b) 移出 epic.md，记入待写清单交由 tech-spec / epic-design 处理
(c) 确认保留（需说明理由）
```

### 章节要求

- **必填章节**：每个功能都必须完成
- **可选章节**：仅在与功能相关时包含
- 若某章节不适用，直接删除（勿保留为 "不适用"）

### AI 生成规则与成功标准编写指南

与 Feature 级规则**一致**，见 `.cursor/commands/aisdd.featurespec.md` §通用指南 →「AI 生成规则」「成功标准编写指南」。要点速记：

- **合理推测、记录假设**；最多 3 个 `[需澄清]`，仅用于范围/安全隐私/用户体验级关键决策（优先级：范围 > 安全/隐私 > 用户体验 > 技术细节）
- 任何模糊需求按「不可测试、有歧义」处理
- 成功标准须**可衡量、与技术无关、以用户为中心、可验证**（如「用户可在 3 分钟内完成结账流程」；禁止「API 响应低于 200ms」这类实现侧表述）