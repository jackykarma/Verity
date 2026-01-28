## Speckit 最佳实践使用指南（Verity 仓库）

本指南提供一套在本仓库中使用 Speckit 的**端到端最佳实践**：从 EPIC/Feature 的需求沉淀，到 EPIC 级 UX/UI 设计输入，再到 Feature 的 Plan/Tasks 冻结与实现；并覆盖需求/交互/视觉/技术方案变更时的**CR（Change Request）闭环**。

> 相关参考：
> - 分支与目录实践：`docs/custom-spec-dev-in-one-epic-branch.md`
> - 工作流治理与变更判定：`docs/speckit-workflow-governance.md`
> - Plan 演进式约束（章程）：`.specify/memory/constitution.md`
> - 模板集合：`.specify/templates/`

---

## 1. 核心理念（先统一口径）

### 1.1 单一事实源（Source of Truth）

- **需求事实源**：`spec.md`（范围 In/Out、FR/NFR、AC、边界与异常）
- **体验呈现事实源**：`ux-design.md`（EPIC 级：信息架构、交互规则/状态、视觉规范、动效清单、设计稿索引）
- **技术决策事实源**：`plan.md`（边界/契约/失败策略/NFR预算与测量/风险回滚/Story）
- **执行事实源**：`tasks.md`（把 Story 拆成可执行步骤与验证清单）

> 经验法则：凡是“可验收/可测试”的变化，最终必须落到 `spec.md` 或 `plan.md`，不能只停留在口头或实现代码里。

### 1.2 变更治理：先影响分析，再增量更新

不追求“一键自动改完所有下游产物”，而是追求：
- **自动/快速产出影响分析**
- **按清单对受影响范围增量更新**
- **可审计、可回滚、可追溯**

变更统一入口：CR 模板 `.specify/templates/change-request-template.md`。

---

## 2. 角色分工（避免设计分叉）

- **产品（PM）**：范围与验收目标；确认 Feature 的 AC
- **设计（UX/UI）**：EPIC 级 `ux-design.md` 与设计稿索引；输出动效清单/说明；提供变更说明
- **SE/TL（方案负责人）**：维护 `plan.md`/`tasks.md`；变更影响分析与下游更新；冻结输入
- **开发（Dev）**：在 Story 分支按 `tasks.md` 实现与验证；实现期不得偷改 spec/plan

---

## 3. 目录与分支模型（推荐）

### 3.1 分支模型

- **EPIC 分支（集成分支）**：`epic/EPIC-xxx-...`
  - 文档与集成主线，所有 PR 回该分支
- **Story 分支（开发者分支）**：`story/ST-xxx-...`
  - 从 EPIC 分支拉出，开发完成 PR 回 EPIC 分支

### 3.2 目录结构（推荐）

EPIC 根目录：

```text
specs/epics/EPIC-xxx-.../
├── epic.md
├── ux-design.md          # EPIC 级交互/视觉/动效 + 设计稿索引
├── design/               # 可选：截图/HTML 等设计稿文件
├── (已移除) epic-full-design.md   # 该能力已从 speckit 流程中移除
└── features/
    └── FEAT-xxx-.../
        ├── spec.md
        ├── plan.md
        └── tasks.md
```

---

## 4. 环境变量与“选中当前 Feature”

### 4.1 Feature 级命令依赖 `SPECIFY_FEATURE`

在 PowerShell 中（每个终端会话都要设置一次）：

```powershell
# Feature 级命令（plan、tasks、implement 等）
$env:SPECIFY_FEATURE="epics/EPIC-001-xxx/features/FEAT-001-yyy"
```

### 4.2 EPIC 级命令可用 `SPECIFY_EPIC`

```powershell
$env:SPECIFY_EPIC="EPIC-001-xxx"   # 或 EPIC-001，用于匹配 specs/epics/EPIC-001-xxx
```

> 注意：写错 `SPECIFY_FEATURE` 是最常见事故源，会导致产物写入错误目录。

---

## 5. 端到端主线流程（从 0 到 1）

> 默认顺序是线性的，但允许“按风险回环”（clarify↔设计↔plan↔tasks），前提是遵守 SoT 与版本记录。

### 5.1 EPIC：Specify（大需求容器）

目标：产出 `epic.md`，并完成 Feature 拆分与 EPIC 级约束。

- `/speckit.specify "<EPIC 需求描述>"`

在 `epic.md` 中补齐：
- Feature 列表（每个 Feature 可独立交付）
- 通用能力（如埋点/动效组件库/算法 SDK 等：建议作为 Capability Feature）
- EPIC 级 FR/NFR 与端到端验收（预算/阈值）

### 5.2 Feature：Specify（逐个）

目标：每个 Feature 产出 `spec.md`，把“要什么/如何验收”写清楚。

- `/speckit.feature "<单个 Feature 描述>"`
- （可选）`/speckit.clarify` 补齐关键澄清点

### 5.3 EPIC：UX/UI 设计输入（整体）

目标：在 EPIC 根产出 `ux-design.md`（以及可选 `design/`），保证跨 Feature 一致性。

- `/speckit.epicuidesign "EPIC-xxx"`（须在**所有** Feature `spec.md` 输出之后、任意 Feature `plan` 之前）

### 5.4 EPIC：技术策略规划（新增，必须）

> **目的**：在各 Feature 开始 plan 之前，识别跨 Feature 的共享技术能力，避免重复设计。

目标：在 `epic.md` 中填写"跨 Feature 技术策略"章节。

在 `epic.md` 的"跨 Feature 技术策略"中补齐：
- **共享能力识别**：识别多个 Feature 都可能用到的技术组件（如 UI 框架、数据层、网络层）
- **Owner Feature**：明确每个共享能力由哪个 Feature 负责设计
- **Plan 执行顺序**：根据依赖关系确定 Feature plan 的先后顺序
- **技术约束**：定义跨 Feature 必须遵守的技术约束

**硬规则**：
- 后续每个 Feature plan **必须先阅读此章节**
- Owner Feature 必须**先完成 plan**，消费方 Feature 才能开始
- 若发现新的共享需求，必须**先更新 epic.md**，再继续 Feature plan

### 5.5 Feature：Plan（按依赖顺序执行，SE/TL 在 EPIC 分支执行）

目标：产出 `plan.md`（工程级蓝图 + Story Breakdown），并冻结关键决策。

- `/speckit.plan`

**前置检查（必须）**：
- 在开始 plan 之前，必须完成 `plan.md` 中的"Plan 前置检查"章节
- 确认已阅读 `epic.md` 的"跨 Feature 技术策略"
- 若依赖其他 Feature 的共享能力，确认 Owner Feature 的 plan 已完成

#### Plan Level 选择（务必填写）

`plan-template.md` 头部要求填写：
- **Lite**：小改动/低风险（无新契约、无持久化迁移、无复杂动效/并发）
- **Standard**：默认
- **Deep**：新契约/迁移/复杂动效与性能预算/并发竞态/灰度回滚等高风险

**如何指定 Plan Level**：

方式 1：命令参数

```
/speckit.plan --level=Lite
/speckit.plan --level=Standard
/speckit.plan --level=Deep
```

方式 2：自然语言

```
请用 Plan-Lite 级别生成方案
这是个简单改动，用 Lite 级别即可
需要 Deep 级别的详细设计
```

方式 3：不指定时，AI 会根据风险因素自动评估（新契约/持久化迁移/复杂动效/并发竞态/灰度回滚）。

#### 可选章节的补充（评审通过后按需）

以下章节为可选，在 A2/A3.0-A3.3 基础方案评审通过后按需补充：

**A3.4 组件详细设计**（Standard 可选，Deep 必须）：

```
请补充 A3.4 组件详细设计
补充 [组件名] 的详细设计
```

何时需要：组件内部逻辑复杂（多状态机/多策略/复杂校验）、有独立异常处理体系、Plan Level = Deep。

**L2 Story 详细设计**（Standard 可选，Deep 必须）：

```
请补充 ST-001 的 L2 详细设计
补充关键 Story 的详细设计
```

何时需要：Story 涉及复杂接口/数据契约、需明确并发/取消语义、Plan Level = Deep。

#### 更新已有章节（精准更新）

当需要修改方案的某个章节时：

```
更新 A3.2 全局类图
修改 A2 全景架构图
重写 Story Breakdown
```

注意：只会更新指定章节，不会扩散修改其他内容（遵循"精准更新原则"）。

### 5.6 Feature：Tasks（逐个，SE/TL 在 EPIC 分支执行）

目标：产出 `tasks.md`，把 Story 拆成可执行步骤与验证清单（含 NFR 阈值）。

- `/speckit.tasks`

### 5.7 Implement（开发者在 Story 分支执行）

目标：严格按 `tasks.md` 落码与验证。

- `/speckit.implement`

硬规则：
- Implement 阶段不得擅自改写 `spec.md`/`plan.md`
- 发现设计缺口或必须变更：停止实现 → 发起 CR → 由 SE/TL 在 EPIC 分支增量更新并提升版本 → 必要时重跑 tasks → 再继续实现

### 5.8 EPIC Sync / EPIC Full Design（可选）

- `/speckit.epicsync "<备注>"`（同步 Feature 状态到 epic.md Registry）

---

## 6. 关卡（Gates）：什么时候“可以进入下一阶段”

### 6.1 进入 Plan 前（Feature DoR）

- `spec.md`：范围/FR/NFR/AC/边界可测试且完整
- `ux-design.md`：该 Feature 的页面/流程/动效索引可追溯（若 EPIC 有 ux-design）
- 关键依赖与失败模式已列出
- **（新增）`epic.md` 的"跨 Feature 技术策略"已填写**：共享能力已识别、Owner 已明确、Plan 执行顺序已确定
- **（新增）前置 Feature 的 plan 已完成**：若本 Feature 依赖其他 Feature 的共享能力，Owner Feature 必须先完成 plan

### 6.2 进入 Implement 前（Design Freeze）

- `plan.md` 已评审通过，关键决策冻结（Plan Version 已记录，必要时写回滚策略）
- `tasks.md` 可执行（每个 Task 有步骤 + 验证 + 路径 + [ST-xxx] 绑定）
- 已运行 `/speckit.epicsync` 同步 Registry（建议）

---

## 7. 变更管理（CR 闭环）

### 7.1 统一入口：CR（Change Request）

模板：`.specify/templates/change-request-template.md`

CR 必须回答：
- 改了什么（What）
- 为什么（Why）
- 影响谁（Impact：EPIC/Feature/spec/ux/plan/story/tasks/模块/指标）
- 要更新哪些产物（Update checklist）
- 是否需要回滚（Rollback）

### 7.2 update 变更命令与 CR 的关系（先写 CR，再按清单执行）

- **CR**（`.specify/templates/change-request-template.md`）是“变更治理入口/记录模板”：把 **What/Why/Impact/Update checklist/Rollback** 写清楚。
- **`*-update` 命令**是“执行变更的工具”：按范围对文档做**增量更新**，并维护各自的 Version/变更记录。
- **二者关系**：CR 不替代任何命令；命令也不会自动生成/维护 CR。推荐顺序永远是：**先 CR → 再按清单跑 update 命令**。

> 关键点：EPIC 更新通常会要求部分 Feature 跟随更新，但不代表“必须先改 Feature 才能改 EPIC”。逻辑上是 **EPIC → Feature**：先把 EPIC 口径更新为上位约束，再对**受影响的 Feature**逐个落地更新。

常用命令分层（按职责划分）：

- **EPIC 需求文档（`epic.md`）**：`/speckit.specify-update "EPIC-xxx 范围：..."`
- **EPIC 交互/视觉（`ux-design.md`）**：`/speckit.epicuidesign-update "EPIC-xxx 本次更新范围：..."`
- **Feature 需求文档（`spec.md`）**：`/speckit.feature-update "范围：..."`（可选级联 plan）
- **Feature 技术方案（`plan.md`）**：`/speckit.plan-update "范围：..."`
- **Feature 任务（`tasks.md`）**：`/speckit.tasks`
- **EPIC Registry（自动同步区）**：`/speckit.epicsync "<备注>"`（specify-update 不修改 registry）

### 7.3 变更类型与更新链路（最小重跑）

#### A) 需求变更（Scope/FR/NFR/AC）

最小链路：
1. `spec.md`（`/speckit.feature-update "范围：..."`）
2. `plan.md`（默认级联；或 `/speckit.plan-update "范围：FR 与 NFR"`）
3. `tasks.md`（`/speckit.tasks`）
4. `/speckit.epicsync`

#### B) EPIC 需求/约束变更（`epic.md`：范围/拆分/通用能力/EPIC-NFR）

最小链路（按需增量，避免全量重跑）：

1. `epic.md`：`/speckit.specify-update "EPIC-xxx 范围：..."`
2. 对**受影响的 Feature**（逐个）：
   - `spec.md`：`/speckit.feature-update "范围：..."`（必要时级联 plan）
   - 若 Story/验证变化：`/speckit.tasks`
3. `/speckit.epicsync "<备注：EPIC 变更同步>"`

#### C) 交互变更（流程/状态/反馈）

先更新 EPIC `ux-design.md`：
- `/speckit.epicuidesign-update "本次更新范围：..."`（并输出影响评估）

然后按影响决定是否进入 `spec.md`：
- 改变可验收行为/边界/异常处理 → **必须更新 spec**
- 不改变验收口径的微交互 → 可不动 spec，但通常仍需要更新 plan/tasks

#### D) 视觉/动效变更

- 仅审美/一致性：更新 `ux-design.md` + `tasks.md` + code
- 引入硬性动效约束或显著性能风险：需要同步到 `spec.md`（AC 或 NFR）与 `plan.md`（预算/降级/回滚）

#### E) 技术方案变更（Plan 决策变化）

最小链路：
1. `/speckit.plan-update "范围：A2/A3/A4/..."`（提升 Plan Version）
2. `/speckit.tasks`
3. `/speckit.epicsync`

---

## 8. 版本与记录（强制）

- `spec.md`：Feature Version + 变更记录表
- `plan.md`：Plan Version + 变更记录表
- `tasks.md`：Tasks Version（建议按重大调整递增）
- `ux-design.md`：ux-design Version + 变更记录表

建议规则：
- 影响 FR/NFR/AC/设计决策 → Minor
- 仅格式/澄清/索引微调 → Patch

---

## 9. 常见问题与排查

- **产物写错目录**：检查 `echo $env:SPECIFY_FEATURE`
- **实现期发现做不下去**：不要硬扛；停下来发 CR，由 SE/TL 先修 plan/spec 再继续
- **小需求被 Plan 重装甲拖累**：在 `plan.md` 填 `Plan Level=Lite`，只补齐必要章节（仍要满足章程与验收）

## 10. 实施成本评估与分级落地（对比 vibe coding / 标准 Spec-Kit）

### 10.1 结论：成本更高，但不是“必须全量启用”
这套流程相对 **vibe coding** 和“标准 Spec-Kit”确实更重，原因是它引入了更强的治理与追溯。但它不应该被当作“每个需求都走全套”的瀑布流程，而应当是一个 **风险驱动的治理框架**：默认走最小集，风险高时再加严。

### 10.2 成本主要来自哪里（固定开销）
- **产物更多**：EPIC/Feature 的 `spec + ux-design + plan + tasks + registry`，以及版本/变更记录/追溯矩阵。
- **关卡更多**：DoR / Design Freeze / 变更闭环，会增加评审与同步成本。
- **变更更可审计**：CR（影响分析→更新清单→增量更新）替代“口头同步/直接改代码”。
- **Plan 更工程化**：对失败模式、NFR 预算、回滚/降级要求更明确（尤其在 Deep 级别）。

### 10.3 和 vibe coding 的取舍
- **vibe coding 更优的场景**：
  - 单人探索/原型验证/一次性脚本
  - 低风险、低依赖、无需严格验收与回滚
- **vibe coding 的典型隐性成本**（在团队/存量/变更频繁时显著）：
  - 返工与范围漂移（没有 SoT 与追溯）
  - 口径争议（验收不清、交互/视觉与需求不一致）
  - 线上风险（缺少失败策略、NFR 预算、回滚预案）
- **你的流程的价值**：
  - 把后期不可控成本前移成“可审计的过程成本”，在多人协作与强约束场景下更划算。

### 10.4 和标准 Spec-Kit 的差异点（为什么会更重）
你的版本在标准 Spec-Kit 基础上加强了三件事：
- **EPIC 级 UX/UI 输入是一等公民**：保证跨 Feature 一致的导航/交互/视觉/动效口径。
- **CR 变更闭环**：变更先影响分析，再按清单增量更新下游产物，避免静默漂移。
- **Plan Level 分级**：允许小需求走 Lite，大需求走 Standard，高风险走 Deep（避免“一刀切重装甲”）。

### 10.5 什么时候“值得全量启用”，什么时候“应该降级”
**建议全量启用（至少 Standard）的典型条件**
- 多人并行开发（Story/Task 分配）
- 存量系统演进（必须尊重现有架构与技术债）
- 强 NFR：性能/功耗/内存/稳定性/合规
- 需求/交互/视觉变更频繁
- 需要灰度/回滚/可观测性闭环

**建议降级为 Lite 或 vibe coding 的条件**
- 单人、小功能、低风险改动
- 明确是探索/原型/一次性验证
- 无外部依赖、无持久化迁移、无复杂动效/并发风险

### 10.6 默认落地策略：三档路径（把复杂度“可控化”）
- **Lite（默认给小需求）**：
  - `spec(最小可测) → plan-lite(关键决策+风险/NFR最小集+Story) → tasks → implement`
- **Standard（默认给大多数需求）**：
  - 在 Lite 上补齐关键时序/类图、失败模式、风险与预算落点
- **Deep（少数高风险）**：
  - 新契约/迁移/复杂动效与性能预算/并发竞态/灰度回滚等触发
  - 只对关键组件与关键 Story 补齐（避免全量深挖）

> 建议规则：**默认 Lite/Standard**，Deep 必须有触发条件（可写入 CR 或 Plan 变更记录）。

### 10.7 “一页判定表”：如何快速决定用哪档
- 满足以下任一项 → 建议 **Deep**：
  - 新增/变更外部或跨模块契约（API/SDK/协议）
  - 新增持久化/迁移（Room/文件/KV schema）
  - 复杂动效 + 性能预算（列表高频刷新/重绘/低端机适配）
  - 并发/取消语义难点（竞态、重入、后台一致性）
  - 必须灰度/回滚（线上风险可见）
- 否则：
  - 小改动 → Lite
  - 常规 Feature → Standard

### 10.8 常见误区（会让流程“看起来很重”）
- **把流程当瀑布**：一次性写完所有文档才开始做；正确做法是“风险驱动回环”，但保持 SoT 与版本记录。
- **所有需求都强行 Deep**：导致文档负担过高；正确做法是分级启用。
- **变更不走 CR**：会导致下游遗漏更新；正确做法是最小 CR（影响分析+更新清单）也要有。
- **UX 变更只改设计稿不改约束**：复杂动效引入性能风险时必须补齐预算/降级/验收口径。

### 10.9 如何评估是否“回本”（建议观察的信号）
- **返工率**：因口径不清/变更遗漏导致的返工是否下降
- **线上风险**：P0/P1 缺陷、回滚次数是否下降
- **变更吞吐**：变更能否更快影响分析并稳定落地（而不是反复扯皮）
- **协作效率**：新人/跨人交接是否更顺畅（Story/Task 可追溯）

> 目标不是让文档更多，而是让“协作与变更的成本可控”。