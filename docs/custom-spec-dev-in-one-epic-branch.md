## Spec-Kit 使用说明：一个 EPIC 一个开发分支（公司工作流对齐）

本文档描述在本仓库中使用 Spec-Kit 的推荐方式，使其完全贴合你们公司现有的研发流程：

- **为每个 EPIC 创建一个集成开发分支**（EPIC 分支）
- **拆分 Feature / Story** 并分配给开发者
- 开发者从 EPIC 分支拉 **Story 分支** 开发
- 开发完成后 **PR 回 EPIC 分支** 集成（最终 EPIC 分支再合入 main）
- 通过 **EPIC 总览** 与 **EPIC Full Design** 保持端到端统一视图

> 备注：仓库中还存在旧版文档 `docs/custom-spec-dev-in-multi-feature-branch.md`（多 Feature 分支模式），本文档以“单 EPIC 分支模式”为准。

---

## 1. 核心概念与层级

- **EPIC**：大需求容器，包含多个 Feature  
- **Feature**：可交付单元（用户功能 / 平台能力），包含 FR/NFR  
- **FR/NFR**：Feature 的功能与非功能需求（性能/功耗/内存/安全/可观测性…）  
- **Story（ST-xxx）**：Feature 的可开发最小单元（Plan 阶段拆分）  
- **Task（Txxx）**：Story 的执行单元（Tasks 阶段拆分，Implement 执行）  
- **ux-design / UI 设计稿**：**EPIC 级**交互与视觉设计产出；**ux-design.md**（信息架构、交互说明、视觉规范、设计稿索引，按 Feature 分节）+ **设计稿**（形式可为 **Figma 链接**、**截图** `design/*.png`、**本地 HTML** `design/*.html`）。**必须从整个 EPIC 需求整体看待与设计**，而非针对单个 Feature，以保证导航、风格与跨 Feature 交互一致。  
- **Full Design（Full Technical Design）**：整合 Plan + Story + Task 的技术方案文档（只整合现有产物，不新增决策）

---

## 2. 分支模型（必须遵守）

### 2.1 EPIC 分支（集成分支）

- **命名建议**：`epic/EPIC-001-xxx`
- **作用**：
  - 本 EPIC 的“集成主线”
  - 所有人 PR 的目标分支
  - EPIC 总览文档与各 Feature 文档的权威来源（统一可见、可评审、可生成整体方案）

### 2.2 Story 分支（开发者分支）

- **命名建议**：`story/ST-012-xxx`（或公司既有命名）
- **来源**：从 EPIC 分支拉出
- **合入**：开发完成后 PR 回 EPIC 分支（而不是直接 PR 到 main）

---

## 3. 文档与目录结构（推荐）

### 3.1 EPIC 总览（统一视图）

- 路径：`specs/epics/EPIC-001-xxx/`
- **epic.md**（必含）：Feature 列表、通用能力、整体 EPIC-FR / EPIC-NFR、Feature Registry（自动同步区）。
- **ux-design.md**（EPIC 级，建议）：整个 EPIC 的**整体**交互与视觉设计（信息架构、跨 Feature 导航与流程、统一交互/视觉规范、设计稿索引，可按 Feature 分节）；**须从整个需求看待与设计**，保证导航、风格与跨 Feature 交互一致。
- **design/**（可选）：EPIC 级设计稿（Figma 链接、截图、本地 HTML）；若仅用 Figma 链接可不创建；设计稿索引在 ux-design.md 中登记，可按 Feature 分子表或「所属 Feature」列区分。

### 3.2 Feature 文档目录（Feature 粒度产物）

> 重要：在本工作流中 **Feature 不对应独立 git 分支**，而对应 EPIC 分支下的一个文档目录。

- 路径：`specs/epics/EPIC-001-xxx/features/FEAT-001-yyy/`
- 典型文件：
  - `spec.md`：Feature 规格（含 Epic/Feature 元信息、FR/NFR、验收与边界）
  - `plan.md`：工程级 Plan（Plan-A/Plan-B + Story Breakdown）；输入为 **spec + EPIC 级 ux-design**（`specs/epics/<EPIC>/ux-design.md` 与 `design/`）
  - `tasks.md`：按 Story（ST-xxx）拆解的可执行任务
  - `full-design.md`：Feature 级 Full Design（整合 spec/plan/tasks，可引用 **EPIC 级** ux-design）
- 说明：**ux-design 与 design/ 置于 EPIC 根**，不在 Feature 目录下；各 Feature 的 plan/fulldesign 引用 EPIC 级 ux-design。

### 3.3 EPIC 级 Full Design（全局技术方案）

- 路径：`specs/epics/EPIC-001-xxx/epic-full-design.md`
- 作用：
  - 汇总多个 Feature 的 Story/Task/风险/一致性问题
  - 为整个 EPIC 提供统一指导（不新增决策，只整合与暴露冲突点）

---

## 4. 关键机制：SPECIFY_FEATURE 与 SPECIFY_EPIC

- **`SPECIFY_FEATURE`**：指定“当前要操作的 Feature 目录”（相对 `specs/`），示例：`epics/EPIC-001-xxx/features/FEAT-001-yyy`。影响：`/speckit.clarify`、`/speckit.plan`、`/speckit.tasks`、`/speckit.fulldesign`、`/speckit.implement`、`/speckit.epicsync`、`/speckit.feature-update`、`/speckit.plan-update`。

- **`SPECIFY_EPIC` 或 `$ARGUMENTS` 中的 EPIC 标识**：用于 **EPIC 级** 命令，**不依赖** `SPECIFY_FEATURE`。  
  - **`/speckit.epicuidesign`**：产出 **EPIC 根** 下的 `ux-design.md` 与 `design/`；**须在所有 Feature 的 spec 输出之后**运行；需通过 `SPECIFY_EPIC`（如 `EPIC-002-android-english-learning`）或 `$ARGUMENTS`（如 `EPIC-002`）指定 EPIC，定位 `specs/epics/<EPIC-xxx>/`。  
  - **`/speckit.epicuidesign-update`**：对 **EPIC 级** ux-design.md 做增量更新；同样通过 `SPECIFY_EPIC` 或 `$ARGUMENTS` 中的 EPIC 标识定位；按影响评估 handoff feature-update / plan-update / tasks（若影响多个 Feature，需对**受影响的 Feature** 逐次设置 `SPECIFY_FEATURE` 后执行）。

> **说明**：`/speckit.specify-update` 对 **epic.md** 做增量更新，通过 `$ARGUMENTS` 中的 EPIC 标识（如 `EPIC-001`）定位，不依赖 `SPECIFY_FEATURE`。

### PowerShell 设置方式（每个终端会话都要设置）

```powershell
# Feature 级命令（plan、tasks、implement 等）
$env:SPECIFY_FEATURE="epics/EPIC-001-xxx/features/FEAT-001-yyy"

# EPIC 级 epic uidesign（可选；也可在 /speckit.epicuidesign 的 $ARGUMENTS 中直接写 EPIC-001）
$env:SPECIFY_EPIC="EPIC-001-xxx"   # 或 EPIC-001，用于匹配 specs/epics/EPIC-001-xxx
```

> 注意：`SPECIFY_FEATURE`、`SPECIFY_EPIC` 对“当前终端会话”有效。换终端或重开终端会丢，需要重新设置。

---

## 5. 端到端流程（怎么跑）

整体顺序：**创建 EPIC** → **创建 Feature**（计划内的全部或分批，并完成**所有** Feature 的 spec）→ （可选）**澄清** → （建议）**epic uidesign**（**须在所有 Feature 的 spec 输出之后**，在任意 Feature 的 plan 之前）→ 各 Feature 的 **plan** → **tasks** → （可选）**fulldesign** → **实现**（Story 分支）→ **epicsync** / **epicfulldesign**。

### 5.1 创建 EPIC（由负责人执行）

在 main（或起始分支）运行：

- `/speckit.specify "<EPIC 需求描述>"`

结果：

- 创建并切换到 EPIC 分支（形如 `epic/EPIC-xxx-...`）
- 生成 `specs/epics/EPIC-xxx-.../epic.md`

接着在 `epic.md` 中补齐：

- Feature 拆分
- 通用能力（跨 Feature）
- 整体 EPIC-FR / EPIC-NFR

### 5.2 创建 Feature（在 EPIC 分支上）

在 EPIC 分支上逐个运行：

- `/speckit.feature "<单个 Feature 描述>"`

结果：

- 在 `specs/epics/<EPIC>/features/FEAT-xxx-.../` 创建 Feature 文档目录
- 生成该 Feature 的 `spec.md`
- 设置 `SPECIFY_FEATURE` 指向该 Feature 目录（当前终端会话）

下一步建议：先 `/speckit.clarify`（可选）；若**尚未**为 EPIC 做 epic uidesign，可运行 **`/speckit.epicuidesign "EPIC-xxx"`**（须在所有 Feature 的 spec 输出之后，见 5.3）；然后对该 Feature 运行 `/speckit.plan`，或直接 `/speckit.plan`（plan 会引用 EPIC 级 ux-design，若存在）。

### 5.3 交互与视觉设计（epic uidesign，**EPIC 级**，须在所有 Feature 的 spec 输出之后、在任意 Feature 的 plan 之前，可选但建议）

**原则**：ux-design 必须**从整个 EPIC 需求整体**看待与设计（导航、跨 Feature 流程、统一风格与交互），而非针对单个 Feature。**须在所有 Feature 的 spec 均已输出之后**运行，以产出完整的 EPIC 级交互与视觉设计稿。

在 **EPIC 分支**运行（**不需**设置 `SPECIFY_FEATURE`；需通过 `SPECIFY_EPIC` 或 `$ARGUMENTS` 指定 EPIC，如 `EPIC-002` 或 `EPIC-002-android-english-learning`）：

- `/speckit.epicuidesign "EPIC-002"` 或 `/speckit.epicuidesign`（当 `SPECIFY_EPIC` 已设时，`$ARGUMENTS` 可空或补充侧重范围）

结果：

- 产出 **`specs/epics/<EPIC-xxx>/ux-design.md`**（**整个 EPIC** 的信息架构、跨 Feature 导航与流程、统一交互/视觉规范、设计稿索引；可按 **Feature 分节** 或分表）
- 可选创建 **`specs/epics/<EPIC-xxx>/design/`** 与占位，以支持 Figma 链接、**截图**、**本地 HTML**
- **设计稿形式**：Figma 链接、`design/` 下截图或 HTML；在 ux-design.md 的「设计稿索引」中登记，可含「所属 Feature」列以区分

**输入**：`epic.md` 与各 `features/*/spec.md`（**须已全部就绪**），以保障整体交互与视觉一致。

若 ux-design.md 已存在，改用 `/speckit.epicuidesign-update "本次更新范围：…"` 做增量更新（同样按 EPIC 定位）。

### 5.4 方案产出（SE/TL，在 EPIC 分支）

> 说明：你们公司约定 Feature 的方案设计与任务拆解由架构师/SE（或 TL）负责，因此 **plan/tasks 只允许由 SE/TL 在 EPIC 分支产出与维护**，避免设计分叉。

**方案设计的输入**：**spec 需求** 与 **EPIC 级 epic uidesign**（`specs/epics/<EPIC>/ux-design.md` + Figma 链接 / `design/` 下截图或 HTML）；若 epic uidesign 未执行则仅以 spec 为输入。

0) 在 EPIC 分支确保已选定目标 Feature：设置 `SPECIFY_FEATURE` 指向对应 Feature 目录  
1) （可选）运行 `/speckit.clarify`：用于补齐 spec 的关键澄清项（由 SE/TL 决定是否需要）  
2) （建议）若**尚未**为 EPIC 做 epic uidesign：运行 **`/speckit.epicuidesign "EPIC-xxx"`**（须在所有 Feature 的 spec 输出之后，见 5.3）；产出 `specs/epics/<EPIC>/ux-design.md` 与 `design/`，为各 Feature 的 plan 提供**整体**交互与视觉输入  
3) 运行 `/speckit.plan`：生成 `plan.md`（Plan-A/Plan-B + Story Breakdown：ST-xxx）；**会考虑 spec 与 EPIC 级 ux-design（含设计稿）**  
4) 运行 `/speckit.tasks`：生成 `tasks.md`（按 ST-xxx 拆为可执行 Task）  
5) （可选）运行 `/speckit.fulldesign`：生成 Feature 级 `full-design.md`（只整合，不新增决策；可引用 **EPIC 级** ux-design）  
6) （建议）运行 `/speckit.epicsync "<备注>"`：把该 Feature 的版本/状态同步回 `epic.md` Registry

产物经评审后合入 EPIC 分支，作为后续实现的权威输入。

### 5.5 开发者领取 Story 并实现（Story 分支）

1) 开发者从 EPIC 分支拉 Story 分支  
2) 在自己的终端设置 `SPECIFY_FEATURE` 指向自己负责的 Feature  
3) 以 `tasks.md` 为唯一执行清单：运行 `/speckit.implement` 按任务实现与验证  
4) 完成后 PR 回 EPIC 分支（代码 + 任务完成标记）

> 重要：开发者**不运行** `/speckit.plan` 与 `/speckit.tasks`，也不在实现期擅自改写 plan/spec。若发现必须变更，走“变更管理流程”。

### 5.6 同步 EPIC 总览（建议每次 Feature 有进展就跑）

在更新了 Feature 的 `spec/ux-design/plan/tasks/full-design` 后运行：

- `/speckit.epicsync "<备注>"`

效果：

- 增量更新 `epic.md` 的 Feature Registry 区块（版本/状态/链接），保持 EPIC 统一视图。

### 5.7 生成 EPIC 级整体技术方案（Story 拆完后）

在 EPIC 分支运行：

- `/speckit.epicfulldesign "EPIC-001"`

产物：

- `specs/epics/<EPIC>/epic-full-design.md`

---

## 6. 变更管理：需求变更 / 技术方案变更时如何跑流程

下面按变更类型给出“最小重跑链路”。原则是：

- **尽量增量变更**：只改受影响 Feature/Story/Task
- **版本必须可追溯**：Feature/Plan/Tasks/Full Design（以及 EPIC 文档）都要记录版本与变更摘要
- **禁止 Implement 期偷改设计**：发现设计缺口必须先回到 spec/plan 变更，再重新生成 tasks/设计文档

**增量更新命令**（优先使用，避免全量重写）：

- **`/speckit.specify-update "EPIC-001 范围：…"`**：仅重写 epic.md 指定章节，不改 Feature Registry；用于 EPIC 层变更。
- **`/speckit.feature-update "范围：…"`**：仅重写当前 Feature 的 spec.md 指定章节；**默认级联**更新 plan.md（按需求变更推导受影响的 plan 范围）。关闭级联：在 `$ARGUMENTS` 中加入「不级联 plan」「仅 spec」或「no-cascade」。
- **`/speckit.epicuidesign-update "本次更新范围：…"`**：仅重写 **EPIC 根** 下 ux-design.md 的指定章节（通过 `SPECIFY_EPIC` 或 `$ARGUMENTS` 的 EPIC 标识定位）；按**实际影响**评估：若影响某 Feature 的 spec → handoff `/speckit.feature-update`（对**受影响的 Feature** 设置 `SPECIFY_FEATURE` 后执行，级联 plan）；若影响视觉且某 Feature 的 plan 的 A2/A3/Story 会变 → handoff `/speckit.plan-update 范围：A2、A3、Story Breakdown（因 epic uidesign 视觉/交互 变更）`（同样对受影响 Feature 设 `SPECIFY_FEATURE`）；然后 `/speckit.tasks`。设计稿索引支持 Figma/截图/HTML。
- **`/speckit.plan-update "范围：…"`**：仅重写当前 Feature 的 plan.md。当 **spec 已变更**且 feature-update 未级联时，传 **spec 范围**（如 `范围：FR 与 NFR`），plan-update 按映射**推导**受影响的 plan 章节；当 **纯技术方案变更**或 **epic uidesign 已变更**（仅视觉/ux 影响 plan）时，传 **plan 范围**（如 `A2 架构、A3、Story Breakdown（因 epic uidesign 视觉/交互 变更）`）。

### 6.1 需求变更（Scope/FR/NFR/AC）发生在 Feature 层

触发场景：
- 新增/删除/修改 FR
- NFR 预算调整（性能/功耗/内存）
- 验收标准 AC 变更
- 边界/异常场景变更

推荐流程（职责分工）：

- **开发者**：发现变更需求 → 停止继续实现 → 提交变更提案（PR/Issue/评论，包含证据与影响范围）
- **SE/TL**：在 EPIC 分支用**增量更新命令**更新 spec/plan/tasks（版本递增）→ 同步 EPIC 总览与 EPIC Full Design

推荐重跑链路（由 SE/TL 在 EPIC 分支执行）：

1) `/speckit.feature-update "范围：FR 与 NFR"`（或 `验收标准`、`边界与异常场景`、`依赖关系`、`核心实体`、`假设与约束` 等，按实际变更选）
   - **默认级联**：同一命令内会按需求变更范围推导受影响的 plan 章节并增量更新 plan.md；spec 与 plan 的「变更记录」自动追加。
   - **关闭级联**：若 `$ARGUMENTS` 含「不级联 plan」「仅 spec」或「no-cascade」，则只更新 spec；需再手动 `/speckit.plan-update "范围：FR 与 NFR"`（或与 feature-update 相同的 **spec 范围**），plan-update 将按 **spec 变更推导**受影响的 plan 章节并更新，后执行下列步骤。
2) `/speckit.tasks` — 让 tasks.md 与最新 Story Breakdown/NFR 验收对齐
3) `/speckit.fulldesign`（Feature 级）— 保证 full-design.md 只整合最新产物
4) `/speckit.epicsync "<备注：xxx变更>"`
5) 如该变更影响跨 Feature 或整体预算：`/speckit.epicfulldesign "EPIC-xxx"`

### 6.2 交互/视觉变更（epic uidesign：交互规则、视觉、设计稿）

触发场景：

- 交互规则/状态/反馈方式变更（如加载态、空态、确认步骤）
- 视觉、动效、布局、组件约定变更
- 设计稿形式或内容变更（Figma 链接、**EPIC 根**下 `design/` 的截图或 HTML）

**按影响评估**（可同时发生）：**影响某 Feature 的 spec**（如新增验收、改 FR/NFR）→ 需对该 Feature 更新 spec；**影响视觉设计**（布局、组件、design 索引）→ 需写回 **EPIC 级** ux-design；上述任一导致某 Feature 的 plan 的 A2/A3/Story 变化 → 需对该 Feature 做 plan-update，再 tasks。

推荐流程（由 SE/TL 或设计负责人在 EPIC 分支执行）：

1) `/speckit.epicuidesign-update "本次更新范围：交互规则、加载态"` 或 `"视觉：按钮动效、design 索引"` 等（通过 `SPECIFY_EPIC` 或 `$ARGUMENTS` 指定 EPIC）  
   - 命令会更新 **EPIC 根** 下 ux-design.md，并在完成报告中给出**影响评估**（影响哪些 Feature 的 spec / 影响视觉 / 两者）及 **handoff 建议**。
2) 若**影响某 Feature 的 spec**：对**受影响的 Feature** 设置 `SPECIFY_FEATURE` 后，按建议运行  
   `/speckit.feature-update 范围：FR 与 NFR、验收标准（因 epic uidesign 交互/视觉 变更）`  
   并 级联 plan；或按 epicuidesign-update 输出的具体范围调整。若有多个 Feature 受影响，逐一对该 Feature 执行。
3) 若**影响视觉**且某 Feature 的 plan 的 A2/A3/Story 会变：对**受影响的 Feature** 设置 `SPECIFY_FEATURE` 后，按建议运行  
   `/speckit.plan-update 范围：A2 架构、A3 内部设计、Story Breakdown（因 epic uidesign 视觉/交互 变更）`。  
   若已执行 2) 的 feature-update 级联 plan，仍可再跑 plan-update 以补齐 ux-derived 范围；**顺序：先 feature-update，再 plan-update**。
4) 对受影响的 Feature 运行 `/speckit.tasks` 重新生成 tasks
5) （可选）`/speckit.fulldesign`；（建议）`/speckit.epicsync "<备注：epic uidesign 变更>"`

### 6.3 技术方案变更（Plan 决策变化、架构变化）

触发场景：
- 技术选型变化、架构边界调整、关键流程变化
- 风险策略调整
- 性能/功耗/内存评估模型与阈值变化

推荐流程（由 SE/TL 在 EPIC 分支执行）：

1) `/speckit.plan-update "范围：…"` — **纯技术方案变更**时无 spec 变更，需传 **plan 范围**（如 `A1 技术选型`、`A2 架构`、`A4 风险`、`Story Breakdown` 等）；仅重写对应章节，在 Plan 的「变更记录」中自动追加一行。
2) `/speckit.tasks` — Tasks 必须严格来源于 Story
3) `/speckit.fulldesign`（Feature 级方案重新整合）
4) `/speckit.epicsync` 同步状态与版本到 epic.md
5) 如为通用能力/跨 Feature 决策：更新 epic.md 的“通用能力/整体 FR-NFR”（可用 `/speckit.specify-update "EPIC-001 范围：通用能力"` 等），并运行 `/speckit.epicfulldesign`

### 6.4 仅 Task 级变更（执行顺序/步骤/验证方式更细化）

触发场景：
- tasks.md 的步骤更细化
- 补充验证方式、补充文件路径
- 不改变 plan.md 的技术决策、不改变 Story 边界

推荐流程（由 SE/TL 在 EPIC 分支执行）：

1) 更新 `tasks.md`（或重新运行 `/speckit.tasks`）
2) 如需要：重新运行 `/speckit.fulldesign`（让 Full Design 的追溯矩阵与验证方式更新）
3) `/speckit.epicsync "<备注：仅task细化>"` 更新 EPIC Registry

### 6.5 Implement 阶段发现必须变更（“做不下去/指标过不去/方案不成立”）

这是最关键的治理点：**不得在实现中偷偷改设计**。

处理流程（建议在 PR/Issue 中显式标注为设计变更；由 SE/TL 最终决策并落地）：

1) 开发者停止继续实现（避免在错误设计上扩大投入）
2) 开发者提交变更提案（PR/Issue/评论），明确：
   - 变更原因（事实/数据/复现）
   - 影响范围（哪些 Feature/Story/Task）
   - 是否需要回滚（如果上线/已合入）
3) SE/TL 用增量更新命令明确变更点：**需求类**用 `/speckit.feature-update "范围：…"`（默认级联 plan）；若此前已仅更新 spec、未级联，则 `/speckit.plan-update "范围：FR 与 NFR"` 等 **spec 范围**，由命令推导 plan 范围。**纯方案类**用 `/speckit.plan-update "范围：A2 架构"` 等 **plan 范围**（无 spec 变更可推导）。
4) SE/TL 重新运行 `/speckit.tasks`
5) SE/TL 重新运行 `/speckit.fulldesign`
6) SE/TL 运行 `/speckit.epicsync` 同步到 EPIC 总览
7) 若为跨 Feature 影响：SE/TL 运行 `/speckit.epicfulldesign`

### 6.6 EPIC 层变更（整体目标/整体 NFR 预算/通用能力调整）

触发场景：
- EPIC 范围变化、里程碑变化
- 端到端预算调整（例如功耗上限、性能预算）
- 通用能力设计调整（会影响多个 Feature）

推荐流程（由 SE/TL 在 EPIC 分支执行）：

1) `/speckit.specify-update "EPIC-001 范围：…"` — 按实际变更指定范围，例如：`整体FR/NFR`、`Feature 拆分`、`通用能力`、`背景、目标与价值、范围`、`约束与假设`、`依赖关系`、`EPIC 级风险与里程碑`、`EPIC 验收` 等；仅重写 epic.md 对应章节，**不修改 Feature Registry**；变更记录自动追加。
2) 对受影响的 Feature（设置 `SPECIFY_FEATURE` 后依次）：
   - `/speckit.feature-update "范围：…"` 或 `/speckit.plan-update "范围：…"`（按 EPIC 约束的落点选）继承 EPIC 变更；
   - 重新 `/speckit.tasks`（必要时）；
   - 重新 `/speckit.fulldesign`（必要时）；
   - 对每个 Feature 跑一次 `/speckit.epicsync`（或在合并后统一跑）。
3) `/speckit.epicfulldesign "EPIC-xxx"` 生成新的 EPIC 全局方案

---

## 7. 常见问题（排查清单）

### 7.1 产物写到了错误目录

几乎都是 `SPECIFY_FEATURE` 没设或设错。请在当前终端确认：

```powershell
echo $env:SPECIFY_FEATURE
```

并重新设置后再跑命令。

### 7.2 在 story/* 分支运行 plan/tasks 报错“不在 feature 分支”

在本工作流中 **不要求** 当前 git 分支名为 `001-xxx`。

- 如果你是**开发者**：正常情况下你不需要运行 plan/tasks（只需按冻结的 `tasks.md` 运行 `/speckit.implement`）。
- 如果你是 **SE/TL**：建议在 **EPIC 分支** 运行 plan/tasks，并确保 `SPECIFY_FEATURE` 已设置为 `epics/<EPIC>/features/<FEAT>/`。

### 7.3 关于 epic uidesign 与 design/

- **ux-design 与 design/ 的位置**：**EPIC 根**（`specs/epics/<EPIC-xxx>/ux-design.md`、`specs/epics/<EPIC-xxx>/design/`），**不在**各 Feature 目录下。交互与视觉须从**整个 EPIC 需求**整体设计。
- **设计稿形式**：可选 **Figma 链接**、**截图**（.png/.jpg 放于 EPIC 根下 `design/`）、**本地 HTML**（`design/*.html`）；可组合使用；在 ux-design.md 的「设计稿索引」中可加「所属 Feature」列区分。
- **design/ 目录**：若仅用 Figma 链接，可不创建 `design/`；若使用截图或本地 HTML，需在 **EPIC 根** 下 `design/` 放置文件并在 ux-design.md 登记。
- **迁移**：若 EPIC 下已有** Feature 级** `ux-design.md` 或 `design/`（如旧流程遗留），可将内容合并入 **EPIC 根** 的 ux-design.md（按 Feature 分节），设计稿移入 EPIC 根 `design/` 并在索引加「所属 Feature」列，再删除 Feature 目录下 ux-design、design。

---

## 8. 最小示例（可复制）

### 创建 EPIC

- `/speckit.specify "EPIC：离线能力与数据同步体系（含功耗/性能预算）"`

### 创建两个 Feature

- `/speckit.feature "数据能力：统一本地存储层与同步引擎（Capability）"`
- `/speckit.feature "功能：离线浏览与操作队列（面向用户）"`

### SE/TL：在 EPIC 分支产出 plan/tasks

```powershell
$env:SPECIFY_FEATURE="epics/EPIC-001-xxx/features/FEAT-002-offline-queue"
```

SE/TL 在 EPIC 分支对该 Feature 依次：

- （建议）若**尚未**为 EPIC 做 epic uidesign：**`/speckit.epicuidesign "EPIC-001"`**（须在所有 Feature 的 spec 输出之后，**不需** `SPECIFY_FEATURE`；产出 `specs/epics/<EPIC>/ux-design.md` 与 `design/`）；设计稿可选用 Figma 链接、截图、本地 HTML
- `/speckit.plan` — 方案设计会考虑 spec 与 **EPIC 级** ux-design（含设计稿）
- `/speckit.tasks`
- （可选）`/speckit.fulldesign`
- `/speckit.epicsync "计划与任务已冻结，进入实现"`

### 开发者：在 Story 分支实现（不跑 plan/tasks）

开发者在自己的 Story 分支，只做：

- `/speckit.implement`

### 生成 EPIC 全局方案（SE/TL 在 EPIC 分支）

- `/speckit.epicfulldesign "EPIC-001"`

