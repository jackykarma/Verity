---
description: 基于 Feature 描述创建 Feature 文档目录并生成 spec.md；内置交互式需求澄清（默认单 Feature 生成后执行，--skip-clarify 跳过，--clarify 仅澄清已有 spec）。支持 --batch 批量并行生成。
handoffs:
  - label: 对抗性评审（多 Feature 推荐）
    agent: aisdd.challenge
    prompt: 所有 Feature spec 生成后，运行 /aisdd.challenge spec 对 spec 进行对抗性质量挑战（多 Feature EPIC 强烈推荐）
    send: false
  - label: 交互与视觉设计（可选）
    agent: aisdd.featureuidesign
    prompt: 本 Feature spec 完成后，若 UX/视觉稿已就绪，运行 /aisdd.featureuidesign（解析本 Feature 设计稿，产出 ux-design.md）；设计稿未就绪可跳过
    send: false
  - label: 代码调研（Brownfield）
    agent: aisdd.featureresearch
    prompt: spec（及可选 ux-design）完成后，若本 Feature 有存量代码，运行 /aisdd.featureresearch（熟悉代码并为 epicdesign 提供设计参考）；纯 Greenfield 可跳过
    send: false
  - label: EPIC 技术规格书
    agent: aisdd.techspec
    prompt: 全部 Feature 的 spec、可选 ux-design 与 research 就绪后，运行 /aisdd.techspec "EPIC-xxx"
    send: false
---

## 用户输入

```text
$ARGUMENTS
```

在继续操作前，你**必须**参考用户输入（若不为空）。

**模式判断（最先执行）**：

- 若 `$ARGUMENTS` 包含 `--batch`、`-batch` 或 `--all`：进入**批量模式**，执行 §批量模式执行步骤
- 若 `$ARGUMENTS` 含 `--clarify` / `-clarify` 且**无**新 Feature 描述（或仅为 `FEAT-xxx` 标识）：进入**澄清模式**，对已有 `spec.md` 执行 §需求澄清（内置）
- 否则：进入**单 Feature 模式**（默认），`$ARGUMENTS` 为单个 Feature 的描述；生成 spec 后**默认进入** §需求澄清，除非含 `--skip-clarify` / `-skip-clarify`

---

## 批量模式执行步骤（`--batch` / `--all`）

> **适用场景**：EPIC 已完成 Feature 拆分（`epic.md` 已填充），需要一次性为所有 Feature 并行生成 `spec.md`，而非逐个手动触发。
> **不适用场景**：单个 Feature 需要精细定制，或当前 EPIC 尚未做 Feature 拆分。

### B-1. 加载 EPIC 上下文与 Feature 列表

定位 EPIC 路径（从 `$ARGUMENTS` 中提取 EPIC 标识，或通过环境变量 `SPECIFY_EPIC` 推导）：

```powershell
.specify/scripts/powershell/get-epic-paths.ps1 -EpicId "EPIC-xxx" -Json
```

解析 `EPIC_DIR`，读取 `epic.md`，**从 Feature 拆分列表章节**提取所有 Feature 的：

| 字段 | 说明 |
|------|------|
| Feature 名称/描述 | 用于传入 `create-new-feature.ps1` |
| In Scope / Out of Scope | 范围边界，写入 spec.md §背景与价值 |
| 依赖 | 写入 spec.md §依赖关系 |
| Feature 类型 | Product / Capability |
| 验收意图 | 辅助生成 FR/NFR 初稿 |

若 `epic.md` 尚未填充 Feature 拆分内容，**立即终止**并提示：「请先运行 `/aisdd.epicspec` 完成 Feature 拆分后再使用 --batch 模式。」

### B-2. 阶段一：顺序创建所有 Feature 目录

> **必须顺序执行**：`create-new-feature.ps1` 负责分配 Feature ID（FEAT-001、FEAT-002……），并发调用会产生 ID 冲突。

对每个 Feature，**依次**运行：

```powershell
.specify/scripts/powershell/create-new-feature.ps1 -Json "<Feature 描述>"
```

收集每个 Feature 的解析结果，构建 `features[]` 数组：

```
features[]:
  - FEATURE_ID, FEATURE_KEY, FEATURE_DIR, SPEC_FILE, FEATURE_NUM
  - 原始描述（from epic.md）
  - In/Out Scope, 依赖, Feature 类型, 验收意图
```

若某个 Feature 目录**已存在**（非首次运行），跳过创建步骤，直接记录其路径，并在 B-3 前向用户提示将覆盖已有 spec.md。

**创建完成后**，向用户显示 Feature 目录清单并等待确认：

```
已准备 N 个 Feature 目录：
  ✅ FEAT-001 - [名称]  →  [FEATURE_DIR]（新建）
  ✅ FEAT-002 - [名称]  →  [FEATURE_DIR]（新建）
  ⚠️  FEAT-003 - [名称]  →  [FEATURE_DIR]（已存在，将覆盖 spec.md）

继续并行生成所有 spec.md？[Y/n]
```

若用户选择 n，终止并提示改用单 Feature 模式逐个生成。

### B-3. 阶段二：并行生成所有 Feature 的 spec.md

> **可并行**：各 Feature 的 spec.md 写入各自独立目录，无写冲突。

**优先使用 Agent 工具并行执行**：为每个 Feature 同时启动一个独立子 Agent，各子 Agent 的任务：

```
你是专注于单一 Feature 规格生成的子 Agent，只做一件事：生成指定 Feature 的 spec.md。

EPIC 上下文：
  EPIC_DIR: [路径]
  epic.md 摘要: [EPIC 目标 + 跨 Feature 关注点（若有技术策略也摘录）]

你负责的 Feature：
  FEATURE_ID:   [FEAT-xxx]
  FEATURE_DIR:  [绝对路径]
  SPEC_FILE:    [绝对路径]
  Feature 描述: [从 epic.md 提取]
  In Scope:     [...]
  Out of Scope: [...]
  依赖:         [...]
  Feature 类型: Product / Capability
  验收意图:     [...]

执行步骤：
1. 读取 .specify/templates/spec-template.md
2. 按模板填充 SPEC_FILE（规则见下方）
3. 返回：{ feature_id, spec_file, status: "ok"|"error"|"blocked", summary: "一句话摘要", purity_issues: [{text, category, suggested_target}] }

规格填写规则：
- Epic 字段：[EPIC_ID - EPIC 名称]
- Feature Version：v0.1.0
- FR 必须可测试，每条 FR 有对应 AC
- NFR 覆盖：性能/功耗/内存/安全隐私/可观测性/可靠性
- AC 必须引用 FR/NFR ID
- 完整场景矩阵须覆盖 7 类场景，不适用的标注 N/A；每条场景关联 FR/NFR ID + 优先级（P0/P1/P2）
- 遵循 .specify/memory/constitution.md 的 MUST 条款
- **写入前纯净度自检（强制）**：写入 SPEC_FILE 前，按本命令 §「spec / 技术细节边界守护」8 类清单扫描每条 FR/NFR/AC/场景；命中污染时**不得直接写入**，须在返回中设置 status: "blocked"，并在 purity_issues 列出原文、命中类别与建议归属（tech-spec.md / epic-design.md / database-design.md 等）；改写为业务语言且无技术词汇后方可写入
- **epic.md 技术词汇剥离**：若 epic.md「验收意图/拆分动机」含技术词汇，写入 spec 前须改写为业务语言，不得原样搬运
```

**降级方案**（若 Agent 工具不可用）：按 features[] 数组顺序生成每个 Feature 的 spec.md，逻辑与子 Agent 任务一致。

收集所有子 Agent 返回结果；失败的 Feature 记录错误原因，不阻塞其他 Feature 的生成。

### B-4. 阶段三：跨 Feature 一致性快速检查

所有 spec.md 生成完成后，执行**轻量一致性检查**（补充批量生成特有的同步问题，不替代 `/aisdd.challenge spec` 的深度检查）：

| 检查项 | 说明 | 级别 |
|--------|------|------|
| **术语同步** | FR/场景中的业务术语在多个 spec 中命名是否一致 | WARN |
| **NFR 对齐** | 各 Feature 的 NFR 是否与 epic.md 声明的跨 Feature 关注点对齐 | WARN |
| **范围重叠** | 不同 Feature 的 In Scope 是否出现重叠（同一能力被多个 Feature 声明） | BLOCK |
| **Capability 引用方向** | Capability Feature 是否被正确的 Product Feature 引用（方向不能反） | WARN |
| **依赖链完整性** | Feature A 依赖 Feature B，Feature B 的 spec 中是否有对应的接口/能力声明 | WARN |
| **技术污染** | 各 spec.md 是否命中 8 类技术污染清单（含子 Agent 返回的 blocked/purity_issues）；命中则不得进入下一阶段直至用户确认改写/移出 | BLOCK |

**主 Agent 对子 Agent 返回的处理**：
- 若某 Feature 的 `status` 为 `blocked` 或 `purity_issues` 非空：汇总污染条目，按 §「spec / 技术细节边界守护」block_ask 格式向用户展示，待用户四选一（改写/移出/保留并说明/拆分）后再写入或重跑该 Feature 子 Agent
- 批量生成完成报告中须单独列出「纯净度拦截」Feature 及待处理条目

输出简要检查结果（不超过 20 条），格式：

```markdown
### 批量生成后一致性检查

| ID | 级别 | 涉及 Feature | 问题 | 建议 |
|----|------|-------------|------|------|
```

> 此为轻量快速版，完整对抗性检查（三视角、深度挑战）请运行 `/aisdd.challenge spec`。

### B-5. 完成报告

```markdown
## 批量生成完成报告

**EPIC**：EPIC-xxx - [名称]
**生成日期**：YYYY-MM-DD
**Feature 数量**：N 个（成功 X / 失败 Y）

### 生成结果

| Feature | 状态 | spec.md | 摘要 |
|---------|------|---------|------|
| FEAT-001 | ✅ | [路径] | [一句话] |
| FEAT-002 | ✅ | [路径] | [一句话] |

### 一致性检查摘要

- BLOCK: X 条（须修复后进入下一阶段）
- WARN: X 条（建议评估）

### 下一步建议

1. **（推荐）** `/aisdd.challenge spec` — 三视角对抗性质量评审，多 Feature EPIC 强烈推荐
2. 需澄清具体 Feature 细节：`/aisdd.featurespec --clarify`（逐个运行，对已有 spec）
3. 调研存量代码（**仅 Brownfield**）：`/aisdd.featureresearch`（弄清**技术实现流程与原理**，默认写入 `research/`）；**纯 Greenfield 跳过**
4. 若 UX/视觉稿已就绪：`/aisdd.featureuidesign`（本 Feature）
5. 全部 Feature spec / ux / research（推荐）确认无误后：`/aisdd.techspec`
```

---

## 需求澄清（内置）

> **定位**：检测并减少 spec 中的模糊点，将澄清内容直接记录到 `spec.md`。**只讨论需求**，不讨论技术方案（技术选型在 `/aisdd.techspec` / `/aisdd.epicdesign` 阶段）。

**触发方式**：
- 单 Feature 模式：spec 生成后**默认自动进入**（`--skip-clarify` 跳过）
- 澄清模式：`/aisdd.featurespec --clarify` 或 `/aisdd.featurespec --clarify FEAT-001`（仅澄清，不重新生成 spec）
- 批量模式：不自动澄清；对各 Feature 单独运行 `--clarify`

**边界（必须遵守）**：
- 只问需求侧：做什么、谁用、验收标准、范围、边界、异常、合规约束
- **禁止**技术选型、架构、实现方式、技术栈类问题

**执行步骤**：

1. 运行 `check-prerequisites.ps1 -Json -PathsOnly`，解析 `FEATURE_DIR`、`FEATURE_SPEC`；spec 缺失则终止
2. 按分类体系扫描模糊点（功能范围、领域模型、交互流程、NFR、集成依赖、边缘场景、术语、验收可测试性等），标记 Clear / Partial / Missing
3. 生成优先级队列（**最多 5 个问题**），**每次仅提一个问题**；选择题须给出推荐选项及理由
4. **顺序提问循环**：用户回答后整合至 spec；用户回复「完成」「停止」或达 5 问上限时结束
5. **每次整合前纯净度自检**（8 类污染清单，见 §spec / 技术细节边界守护）；命中则 block_ask，不得直接写入
6. 在 spec 中维护 `## 澄清内容` → `### 会话 YYYY-MM-DD` 记录问答；同步更新 FR/NFR/AC/场景等对应章节
7. **完成报告**：已解答问题数、涉及章节、覆盖度汇总（已解决/已推迟/清晰/未解决）、建议下一步

**行为规则**：
- 无核心模糊点 → 「未检测到需正式澄清的核心模糊点。」并建议继续推进
- 禁止超过 5 个问题（单题追问不计入新问题）
- 后续需求变更：直接说明更新范围，由 AI 更新 spec 并在变更记录留痕（不必重跑完整澄清）

---

## 单 Feature 模式执行步骤（默认）

`$ARGUMENTS` 为**单个 Feature** 的描述（不是 EPIC）。

### 1. 为 Feature 生成简洁短名称

（2-4 个词）：
- 动作-名词优先，保留缩写（OAuth2/API/JWT）

### 2. 运行创建脚本

从仓库根目录执行：

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

### 3. 加载模板

读取 `.specify/templates/spec-template.md`，按模板结构写入 `SPEC_FILE`。

### 4. Feature 规格填写规则（必须）

- 必须填写 `Epic`（例如 `EPIC-001 - xxx`），若未知写 `TODO(Epic)` 并在 §需求澄清 中补齐
- Feature Version 初始为 `v0.1.0`
- FR 必须可测试
- NFR 必须覆盖至少：性能/功耗/内存/安全隐私/可观测性/可靠性（可少量 `[需澄清]`，但不得缺失整类）
- AC（验收标准）必须引用 FR/NFR ID
- **完整场景矩阵**须覆盖 7 类场景（正常/替代/边界值/异常错误/并发竞态/生命周期/跨 Feature 集成），不适用的类别标注 `N/A` 及理由；每条场景须关联 FR/NFR ID 并标注优先级（P0/P1/P2）

### 5. 需求澄清（默认执行，除非 `--skip-clarify`）

spec 写入完成后，**立即执行** §需求澄清（内置）。用户已明确 `--skip-clarify` 时跳过，并在完成报告中提示后续可运行 `/aisdd.featurespec --clarify`。

### 6. 完成报告

输出 Feature Key、spec.md 路径、澄清摘要（若已执行），并提示下一步：

- 若跳过澄清：可运行 `/aisdd.featurespec --clarify` 补做
- 若 UX/视觉稿已就绪：**`/aisdd.featureuidesign`**（本 Feature，可选）；无稿可跳过
- **Brownfield**：**`/aisdd.featureresearch`**（熟悉存量代码，并为 epicdesign 提供设计参考；默认写入 `features/FEAT-xxx/research/`）
- **纯 Greenfield**：**跳过** featureresearch（无存量代码可调研）；可用 `/aisdd.featureresearch --skip` 显式声明
- 若尚未做 EPIC 技术规约：**`/aisdd.techspec "EPIC-xxx"`**（须在所有 Feature 的 spec 及推荐 research 就绪后）
- techspec 会读取各 Feature 的 `ux-design.md`（若存在）
- 若这是**最后一个** Feature 且 EPIC 有多个 Feature：**建议先运行 `/aisdd.challenge spec`**，再进入 `/aisdd.techspec`

---

## 通用指南

### 快速指南

- 聚焦用户**需要什么**以及**为什么需要**。
- 避免描述**如何**实现（不提及技术栈、API、代码结构）。
- 面向业务相关方编写，而非开发人员。
- 请勿在规格说明中嵌入检查清单；需求质量评审使用 `/aisdd.challenge spec`（多 Feature 推荐）或本命令 `--clarify` 模式。

### 章节要求

- **必填章节**：每个功能都必须完成
- **可选章节**：仅在与功能相关时包含
- 若某章节不适用，直接删除（勿保留为 "不适用"）

### spec / ux-design 边界守护（必须）

> **识别特征详表（权威）**：`.cursor/rules/aisdd-document-boundaries.mdc` **Part B**（§B.2 三维度划分、§B.3 异常与状态重叠地带、§B.4 实操判断清单）。

写入 `spec.md` 时，**必须检查**每条内容是否越界进入 ux 事实源：**交互形态**（控件/手势/动画/反馈形式）、**视觉细节**（色值/间距/圆角/字号/动效参数）、**布局结构**、**状态视觉表现**（「长什么样」而非「何时进入/退出」）均归 `ux-design.md`。命中时**禁止直接写入**，按 block_ask 向用户列出条目并三选一：（a）移入 ux-design 待写清单（推荐）；（b）确认保留并说明理由；（c）拆分——行为部分留 spec，呈现部分移 ux-design。

**异常/状态的正确写法**：只写「系统必须……」级别的行为结果与量化指标。
- ✅「网络失败时系统须提示错误并提供重试能力；已加载数据不丢失」
- ❌「网络失败时显示错误插画 + 重试按钮（FilledButton），背景 #FFEBEE」← 属于 ux-design

### spec / 技术细节边界守护（必须）

> **识别特征详表（权威）**：`.cursor/rules/aisdd-document-boundaries.mdc` **Part A**（§A.2 污染识别清单、§A.3 判断分界点、§A.4 NFR 特殊处理）。写入 `specs/**` 文件时该规则会自动附加，本节不重复详表。

`spec.md` 是**纯粹的产品规格**，只写「系统必须做什么」与可测试的需求；**禁止**任何技术实现细节。写入前**必须逐条扫描** 8 类技术污染特征，命中即按 block_ask 流程拦截：

**8 类污染清单**：① 类名/接口名（`*ViewModel`/`*Repository` 等）② 框架/库名（Hilt/Room/Compose 等）③ 数据存储细节（DAO/表名/字段/SQL）④ API/接口细节（URL 路径/HTTP 方法/DTO 字段）⑤ 代码结构（包路径/文件路径/代码片段/函数签名）⑥ 线程/并发原语（`Dispatchers.*`/`Mutex` 等）⑦ 设计模式实现（代码语义层表述）⑧ 埋点字段（事件名/参数 key/SDK 名）。各类别的正确归属（tech-spec / epic-design / database-design / interface-design / analytics-tracking）见上述规则 §A.2。

**判断分界点**：「删掉这条后，'系统必须做什么 + 在什么前提下 + 达到什么可验收结果' 是否仍完整？」仍完整 → 技术细节，删除或改写；不完整 → 需求，改写为业务语言后保留。
**NFR 例外**：量化指标本身（如 `p95 ≤ 300ms`、`日均功耗增量 ≤ 5mAh`）合法；「用 xxx 库实现 xxx 优化」属污染。

**拦截后的提示格式**：

```
⚠️ 边界检查：以下内容疑似属于 tech-spec.md / epic-design.md 而非 spec.md：

1. [具体条目，原文引用] → 命中类别：[...] → 建议归入 [...]

请确认：
(a) 改写为业务语言后留在 spec.md（推荐）
(b) 移出 spec.md，记入待写清单交由 tech-spec / epic-design 处理
(c) 确认保留原文（需说明理由）
(d) 拆分：业务部分留 spec，技术部分移入下游
```

**正反例**（速查）：

- ❌「使用 Room 数据库缓存最近 100 张照片」→ ✅「系统须本地缓存最近 100 张照片，支持离线浏览；缓存命中率 ≥ 95%」
- ❌「`PhotoRepository` 须提供 `loadRecent(limit: Int)` 接口」→ ✅「系统须支持按数量批量加载最近照片，并在新照片入库时通知订阅方」

### AI 生成规则

基于用户提示创建规格说明时：

1. **合理推测**：结合上下文、行业标准和通用模式填补信息空白
2. **记录假设**：在"假设"章节记录所使用的合理默认值
3. **限制澄清次数**：最多使用 3 个 `[需澄清]` 标记——仅用于以下关键决策：
    - 对功能范围或用户体验有重大影响
    - 存在多种合理且影响不同的解读方式
    - 无任何合理默认值可参考
4. **澄清优先级**：范围 > 安全/隐私 > 用户体验 > 技术细节
5. **以测试视角思考**：任何模糊的需求都应判定为"不可测试、有歧义"（不符合检查清单要求）
6. **常见需澄清场景**（仅在无合理默认值时）：
    - 功能范围和边界（包含/排除特定用例）
    - 用户类型和权限（若存在多种冲突解读）
    - 安全/合规要求（涉及法律/财务重大影响时）

**合理默认值示例**（无需询问）：

- 数据留存：所属领域的行业通用做法
- 性能指标：除非特别说明，否则采用标准移动应用的预期值（启动/响应/滚动流畅度）
- 错误处理：用户友好的提示信息及适当的降级方案
- 运行时权限：按需最小化申请；被拒绝时提供可用的降级体验
- 离线与弱网：除非特别说明，默认要求已加载内容可用、操作可重试

### 成功标准编写指南

成功标准必须满足：

1. **可衡量**：包含具体指标（时间、百分比、数量、速率）
2. **与技术无关**：不提及框架、语言、数据库或工具
3. **以用户为中心**：从用户/业务视角描述结果，而非系统内部逻辑
4. **可验证**：无需了解实现细节即可测试/验证

**正面示例**：

- "用户可在 3 分钟内完成结账流程"
- "系统支持 10,000 个并发用户"
- "95% 的搜索请求可在 1 秒内返回结果"

**反面示例**（聚焦实现细节）：

- "API 响应时间低于 200 毫秒"（过于技术化，应改为"用户可即时看到结果"）
- "数据库可处理 1000 TPS"（实现细节，应改为面向用户的指标）
- "Compose 组件渲染高效"（框架相关）
