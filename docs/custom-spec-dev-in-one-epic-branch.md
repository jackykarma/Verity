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

- 路径：`specs/epics/EPIC-001-xxx/epic.md`
- 内容必须包含：
  - **Feature 列表**
  - **通用能力（跨 Feature Capability）**
  - **整体 EPIC-FR / EPIC-NFR（端到端预算/约束/统一口径）**
  - **Feature Registry（自动同步区）**：汇总各 Feature 的版本/状态/链接

### 3.2 Feature 文档目录（Feature 粒度产物）

> 重要：在本工作流中 **Feature 不对应独立 git 分支**，而对应 EPIC 分支下的一个文档目录。

- 路径：`specs/epics/EPIC-001-xxx/features/FEAT-001-yyy/`
- 典型文件：
  - `spec.md`：Feature 规格（含 Epic/Feature 元信息、FR/NFR、验收与边界）
  - `plan.md`：工程级 Plan（Plan-A/Plan-B + Story Breakdown）
  - `tasks.md`：按 Story（ST-xxx）拆解的可执行任务
  - `full-design.md`：Feature 级 Full Design（整合 spec/plan/tasks）

### 3.3 EPIC 级 Full Design（全局技术方案）

- 路径：`specs/epics/EPIC-001-xxx/epic-full-design.md`
- 作用：
  - 汇总多个 Feature 的 Story/Task/风险/一致性问题
  - 为整个 EPIC 提供统一指导（不新增决策，只整合与暴露冲突点）

---

## 4. 关键机制：SPECIFY_FEATURE（决定当前操作的 Feature）

Spec-Kit 用环境变量 `SPECIFY_FEATURE` 指定“当前要操作的 Feature 目录”（相对 `specs/`）：

- 示例：`epics/EPIC-001-xxx/features/FEAT-001-yyy`

它会影响这些命令把产物写到哪里：

- `/speckit.clarify`
- `/speckit.plan`
- `/speckit.tasks`
- `/speckit.fulldesign`
- `/speckit.implement`
- `/speckit.epicsync`

### PowerShell 设置方式（每个终端会话都要设置）

```powershell
$env:SPECIFY_FEATURE="epics/EPIC-001-xxx/features/FEAT-001-yyy"
```

> 注意：`SPECIFY_FEATURE` 对“当前终端会话”有效。换终端或重开终端会丢，需要重新设置。

---

## 5. 端到端流程（怎么跑）

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

### 5.3 方案产出（SE/TL，在 EPIC 分支）

> 说明：你们公司约定 Feature 的方案设计与任务拆解由架构师/SE（或 TL）负责，因此 **plan/tasks 只允许由 SE/TL 在 EPIC 分支产出与维护**，避免设计分叉。

0) 在 EPIC 分支确保已选定目标 Feature：设置 `SPECIFY_FEATURE` 指向对应 Feature 目录  
1) （可选）运行 `/speckit.clarify`：用于补齐 spec 的关键澄清项（由 SE/TL 决定是否需要）  
2) 运行 `/speckit.plan`：生成 `plan.md`（Plan-A/Plan-B + Story Breakdown：ST-xxx；可在 Plan 中补齐 Story 二层详细设计用于指导落码）  
3) 运行 `/speckit.tasks`：生成 `tasks.md`（按 ST-xxx 拆为可执行 Task；若 Plan 含二层设计，Task 需引用对应设计入口）  
4) （可选）运行 `/speckit.fulldesign`：生成 Feature 级 `full-design.md`（只整合，不新增决策）  
5) （建议）运行 `/speckit.epicsync "<备注>"`：把该 Feature 的版本/状态同步回 `epic.md` Registry

产物经评审后合入 EPIC 分支，作为后续实现的权威输入。

### 5.4 开发者领取 Story 并实现（Story 分支）

1) 开发者从 EPIC 分支拉 Story 分支  
2) 在自己的终端设置 `SPECIFY_FEATURE` 指向自己负责的 Feature  
3) 以 `tasks.md` 为唯一执行清单：运行 `/speckit.implement` 按任务实现与验证  
4) 完成后 PR 回 EPIC 分支（代码 + 任务完成标记）

> 重要：开发者**不运行** `/speckit.plan` 与 `/speckit.tasks`，也不在实现期擅自改写 plan/spec。若发现必须变更，走“变更管理流程”。

### 5.5 同步 EPIC 总览（建议每次 Feature 有进展就跑）

在更新了 Feature 的 `spec/plan/tasks/full-design` 后运行：

- `/speckit.epicsync "<备注>"`

效果：

- 增量更新 `epic.md` 的 Feature Registry 区块（版本/状态/链接），保持 EPIC 统一视图。

### 5.6 生成 EPIC 级整体技术方案（Story 拆完后）

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

### 6.1 需求变更（Scope/FR/NFR/AC）发生在 Feature 层

触发场景：
- 新增/删除/修改 FR
- NFR 预算调整（性能/功耗/内存）
- 验收标准 AC 变更
- 边界/异常场景变更

推荐流程（职责分工）：

- **开发者**：发现变更需求 → 停止继续实现 → 提交变更提案（PR/Issue/评论，包含证据与影响范围）
- **SE/TL**：在 EPIC 分支更新 spec/plan/tasks（版本递增）→ 同步 EPIC 总览与 EPIC Full Design

推荐重跑链路（由 SE/TL 在 EPIC 分支执行）：

1) 更新对应 Feature 的 `spec.md`
   - 记录变更点（建议在 spec/plan 的“变更记录”里补一行）
2) 若变更影响设计：更新 `plan.md`
   - 特别是 Plan-A 的风险与各类评估（算法/功耗/性能/内存）阈值与验收方法
3) 重新运行 `/speckit.tasks`
   - 让 tasks.md 与最新 Story Breakdown/NFR 验收对齐
4) 重新运行 `/speckit.fulldesign`（Feature 级）
   - 保证 full-design.md 只整合最新产物
5) 运行 `/speckit.epicsync "<备注：xxx变更>"` 同步到 EPIC 总览
6) 如该变更影响跨 Feature 或整体预算：再运行 `/speckit.epicfulldesign "EPIC-xxx"` 更新 EPIC 全局方案

### 6.2 技术方案变更（Plan 决策变化、架构变化）

触发场景：
- 技术选型变化、架构边界调整、关键流程变化
- 风险策略调整
- 性能/功耗/内存评估模型与阈值变化

推荐流程（由 SE/TL 在 EPIC 分支执行）：

1) **先改 plan.md**（Plan-A/Plan-B），并在 Plan 的变更记录中写清“为什么变更”
2) 若 Story 拆分受影响：更新 Story Breakdown（ST-xxx）
3) 重新运行 `/speckit.tasks`（Tasks 必须严格来源于 Story）
4) 重新运行 `/speckit.fulldesign`（Feature 级方案重新整合）
5) `/speckit.epicsync` 同步状态与版本到 epic.md
6) 如为通用能力/跨 Feature 决策：更新 epic.md 的“通用能力/整体 FR-NFR”，并运行 `/speckit.epicfulldesign`

### 6.3 仅 Task 级变更（执行顺序/步骤/验证方式更细化）

触发场景：
- tasks.md 的步骤更细化
- 补充验证方式、补充文件路径
- 不改变 plan.md 的技术决策、不改变 Story 边界

推荐流程（由 SE/TL 在 EPIC 分支执行）：

1) 更新 `tasks.md`（或重新运行 `/speckit.tasks`）
2) 如需要：重新运行 `/speckit.fulldesign`（让 Full Design 的追溯矩阵与验证方式更新）
3) `/speckit.epicsync "<备注：仅task细化>"` 更新 EPIC Registry

### 6.4 Implement 阶段发现必须变更（“做不下去/指标过不去/方案不成立”）

这是最关键的治理点：**不得在实现中偷偷改设计**。

处理流程（建议在 PR/Issue 中显式标注为设计变更；由 SE/TL 最终决策并落地）：

1) 开发者停止继续实现（避免在错误设计上扩大投入）
2) 开发者提交变更提案（PR/Issue/评论），明确：
   - 变更原因（事实/数据/复现）
   - 影响范围（哪些 Feature/Story/Task）
   - 是否需要回滚（如果上线/已合入）
3) SE/TL 更新 `spec.md` / `plan.md` 明确变更点（必要时更新 Story Breakdown）
4) SE/TL 重新运行 `/speckit.tasks`
5) SE/TL 重新运行 `/speckit.fulldesign`
6) SE/TL 运行 `/speckit.epicsync` 同步到 EPIC 总览
7) 若为跨 Feature 影响：SE/TL 运行 `/speckit.epicfulldesign`

### 6.5 EPIC 层变更（整体目标/整体 NFR 预算/通用能力调整）

触发场景：
- EPIC 范围变化、里程碑变化
- 端到端预算调整（例如功耗上限、性能预算）
- 通用能力设计调整（会影响多个 Feature）

推荐流程（由 SE/TL 在 EPIC 分支执行）：

1) 更新 `epic.md`（整体 FR/NFR、通用能力、Feature 拆分、里程碑/风险）
2) 对受影响的 Feature：
   - 更新各自 `spec.md`（继承 EPIC 约束）
   - 更新 `plan.md`（若设计/预算/接口受影响）
   - 重新 `/speckit.tasks`（必要时）
   - 重新 `/speckit.fulldesign`（必要时）
   - 对每个 Feature 跑一次 `/speckit.epicsync`（或在合并后统一跑）
3) 最后运行 `/speckit.epicfulldesign` 生成新的 EPIC 全局方案

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

- `/speckit.plan`
- `/speckit.tasks`
- （可选）`/speckit.fulldesign`
- `/speckit.epicsync "计划与任务已冻结，进入实现"`

### 开发者：在 Story 分支实现（不跑 plan/tasks）

开发者在自己的 Story 分支，只做：

- `/speckit.implement`

### 生成 EPIC 全局方案（SE/TL 在 EPIC 分支）

- `/speckit.epicfulldesign "EPIC-001"`

