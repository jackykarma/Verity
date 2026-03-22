# AISDD 设计阐述

**AI-Assisted Software Design and Development（AI 辅助软件设计开发工作流）**

---

## 一、设计背景与核心问题

### 1.1 工程现实的悖论

在大型 Android 工程中，AI 辅助编程存在一个根本性矛盾：

- **AI 的倾向**：从零开始设计"理想化"方案，忽略历史代码和技术债
- **工程的现实**：系统已有大量存量代码、既定架构、技术选型和兼容性约束

未加约束的 AI 参与往往产生三类问题：
1. **理想化文档**——写出与现有代码脱节的设计方案，根本无法落地
2. **口头约定**——需求、架构、验收标准仅停留在对话中，无法追溯
3. **设计漂移**——需求、设计、任务、代码四者各说各话，互相矛盾

### 1.2 AISDD 的核心命题

> **让 AI 成为受约束的技术助理，而非无约束的架构颠覆者。**

AISDD 的设计哲学：**文档优先（Documentation First）**——在写一行代码之前，先把"需要什么""为什么这样设计""怎么验收"用结构化文档固化，AI 在文档约束下工作，人类在关键节点做判断。

---

## 二、整体设计思路

### 2.1 三层分离原则

AISDD 将软件开发过程严格分离为三个关注域：

```
需求域（What）    →  spec.md / ux-design.md
技术域（How）     →  epic-plan.md / plan.md / epic-design.md
执行域（Do）      →  tasks.md / 代码
```

每个域有且只有一个**事实源（Source of Truth）**，任何下游产物只能在上游产物约束下产出，不得反向修改。

### 2.2 工作流阶段概览

```
EPIC 入口          需求层              技术层              执行层
──────────────     ──────────────      ──────────────      ──────────────
epicspec           featurespec         epicplan            featuretasks
  ↓                  ↓                   ↓                   ↓
epic.md            spec.md           epic-plan.md         tasks.md
  ↓                  ↓                   ↓                   ↓
[Feature 拆分]     [FR/NFR/AC]       featureplan          implement
                      ↓                   ↓                   ↓
                  clarify             plan.md              代码
                  challenge           epicdesign
                      ↓                   ↓
                  gate               epic-design.md
                  spec-ready         key-func-design.md
                                     key-diagram.md
                                     story_detail_design.md
                                          ↓
                                     gate plan-ready
                                     gate design-ready
                                          ↓
                                     epicanalyze / verify
```

---

## 三、核心设计原则

### 3.1 演进式设计（Evolution, Not Rebuild）

这是整个系统最重要的约束，写入了 `constitution.md`（章程）：

**AI 必须**：
- 在现有 Android 工程代码基础上做扩展/适配/复用
- 先做差距分析（Gap Analysis）：每条 FR/NFR 映射到现有模块，明确"可复用 / 需扩展 / 需新增"

**AI 禁止**：
- 提出整体架构重写方案
- 建议替换核心技术体系（Compose / Hilt / Room 等）
- 输出脱离现有代码结构的"理想化设计图"
- 使用"如果从零开始……"的表述

这个约束来自于工程现实：存量系统演进远比 Greenfield 项目复杂，历史包袱、兼容性、迁移成本都是真实约束。

### 3.2 单一事实源分层治理

```
文档层级          事实源归属
────────────      ──────────────────────────────────
spec.md         → 需求：FR/NFR/AC/范围边界
ux-design.md    → 体验：交互规则/视觉规范/设计稿索引
epic-plan.md    → EPIC 级技术约束：全局技术栈/分层规则/NFR 预算
plan.md         → Feature 级技术规约：接口契约/数据模型/实现约束
epic-design.md  → 架构与设计：0/1 层架构/全景类图/时序/Story 拆解
tasks.md        → 执行：可操作 Task，含设计追溯
gate-log.md     → 审批：各阶段关卡评审记录
```

**关键规则**：下游只能读取上游，不能在 Implement 阶段修改 plan.md，不能在 plan 阶段修改 spec.md。如需变更必须通过 CR（变更请求）流程。

### 3.3 人工关卡（Gate）机制

AISDD 不是纯 AI 自动化流水线。它在关键阶段转换点设置了人工审批关卡：

```
spec-ready    →  所有 spec.md 完成，冻结需求，进入技术规约
plan-ready    →  所有 plan.md 完成，冻结技术约束，进入设计说明书
design-ready  →  epic-design.md 完成，冻结设计，进入 tasks 拆解
tasks-ready   →  所有 tasks.md 完成，冻结任务，进入实现
implement-done→  代码完成，verify 通过，进入合并发布
```

每个关卡执行三个动作：
1. **检查**：验证前置产物完整性（结构化检查清单）
2. **记录**：人工给出通过/有条件通过/驳回的评审结论
3. **冻结**：将通过的产物状态标记为"已冻结"，后续阶段将其视为只读

这避免了"AI 一路跑到实现，发现需求根本没对齐"的典型失败模式。

---

## 四、各阶段详细设计

### 4.1 EPIC 规格（epicspec）

**输入**：自然语言的大需求描述
**产出**：`epic.md`（EPIC 容器 + Feature 拆分列表）

这个阶段的核心设计决策是：**把一个大需求拆成若干个可独立交付的 Feature**。

每个 Feature 必须：
- 有明确的 In Scope / Out of Scope 边界
- 有独立验收意图
- 有类型标注（Product Feature / Capability Feature）

自动化：通过 PowerShell 脚本 `create-new-epic.ps1` 创建 EPIC 目录和 Git 分支 `epic/EPIC-xxx-short-name`。

**重要设计决策**：Feature 不创建 Git 分支，Feature 只是文档组织单位（子目录），所有工作都在 EPIC 分支上进行。这简化了分支管理，避免了跨 Feature 代码合并的复杂性。

### 4.2 Feature 规格（featurespec）

**输入**：单个 Feature 的目标/范围/依赖描述
**产出**：`spec.md`（FR/NFR/AC）

spec.md 是整个工作流的**需求事实源**，它的设计要求极为严格：
- FR（功能需求）：必须可测试，每条 FR 有对应 AC
- NFR（非功能需求）：必须覆盖性能/功耗/内存/安全隐私/可观测性/可靠性
- AC（验收标准）：必须引用 FR/NFR ID，可量化可验证

**不允许**在 spec.md 中描述技术实现。面向业务相关方，而非开发人员。

支持 `--batch` 模式：从已填充 Feature 拆分列表的 epic.md 一次性并行生成所有 Feature 的 spec.md。

### 4.3 需求澄清（clarify）与对抗性挑战（challenge）

**澄清（clarify）**：AI 主动提问，消除 spec 中的模糊性和歧义，答案整合回 spec。不讨论技术方案，技术在 plan 阶段讨论。

**挑战（challenge）**：这是 AISDD 中最具创意的设计——从**三个独立对抗视角**对同一产物进行非破坏性质量挑战：
- **完整性视角**：遗漏了什么场景、边界、约束？
- **一致性视角**：各条需求之间是否矛盾？
- **可行性视角**：NFR 是否可达？范围是否合理？

challenge 在关键时机是强烈推荐的：多 Feature EPIC 的 spec 全部生成后、所有 plan 生成后、epicdesign 完成后。

### 4.4 UX 设计解析（epicuidesign）

**可选阶段**，在 spec-ready 之后、epicplan 之前运行。

输入可以是三种形式：
1. 设计图片（截图）
2. Pencil 设计文件（`.pen`）
3. Figma 链接

产出 `ux-design.md`：将视觉/交互稿解析为结构化的文本规范（信息架构、逐屏交互规则、视觉规范、设计稿索引），成为后续 plan 阶段的 UI 约束输入。

**无设计稿时**：进入兜底模式，AI 根据 spec 提出交互建议草案。

### 4.5 EPIC 技术规约（epicplan）

**输入**：所有 Feature 的 spec.md + 现有工程代码
**产出**：`epic-plan.md`（全局技术约束，不含架构图）

epic-plan.md 的核心内容：
- 全局技术栈约束（哪些库/框架/API 可用）
- 分层规则与模块约束（哪层调哪层，禁止跨层）
- 共享能力识别（哪些能力跨 Feature 复用，Owner 是谁）
- NFR 预算框架（全局内存/性能/启动时间上限，各 Feature 从这里分配）
- 统一错误码规范

**单 Feature EPIC 快速通道**：可省略 epic-plan.md，将 EPIC 级约束合并写入唯一 Feature 的 plan.md。

### 4.6 Feature 技术规约（featureplan）

**输入**：spec.md + epic-plan.md + ux-design.md + 现有工程代码
**产出**：`plan.md`（Feature 级技术规约与实现约束）

plan.md 的七个章节：
```
§一  设计说明书 ↔ 技术规约一致性互校
§二  技术背景（差距分析：可复用/需扩展/需新增）
§三  架构约束与演进规则（在 epic-plan §2 分层内）
§四  数据模型与状态管理
§五  接口与契约规范（Owner/Consumer 接口定义）
§六  合规性检查
§七  项目结构（本 Feature 文档目录）
```

**差距分析**是这个阶段最重要的输出：明确每条需求对应的现有模块现状 → 目标状态，这直接约束了后续的架构设计和 Story 拆解。

### 4.7 EPIC 软件设计说明书（epicdesign）

这是整个工作流中技术深度最高的阶段，分阶段渐进产出：

```
参数          产出内容                              文件
────────      ──────────────────────────────────   ──────────────────────
(无参数)      完整章节骨架 + §1~§2 填充             epic-design.md
arch          0 层/1 层架构图（覆盖已有）           epic-design.md §1~§2
key           关键疑难点核心方案+流程图+时序图       key-func-design.md
diagram       全景骨架类图                          key-diagram.md
diagram FEAT  Feature 子类图+完整时序图             key-diagram.md
story         Story 列表+依赖关系图+FR/NFR 矩阵    epic-design.md §5
l2            Story 落码级 L2 详细设计             story_detail_design.md
```

**推荐顺序**：(默认) → key → diagram → diagram FEAT-001 → … → story → l2

**关键设计约束**：
- 所有图表使用 Mermaid，遵循 Material Design 配色（`#E3F2FD` 蓝色系为主调）
- 图表内容必须基于本工程**实际架构与真实代码**，不能是教科书式示意图
- L2 详细设计统一分文件，epic-design.md 的 §6 仅为索引表——避免主文档过大，支持 Feature 级独立评审

**设计分级**（根据 EPIC 复杂度裁剪）：
- **Lite**：适合小改动，覆盖 0/1 层架构 + 关键类图 + Story 拆解
- **Standard**：默认，Lite + 关键功能疑难设计 + 各 Story 概要
- **Deep**：高风险 EPIC，所有 Story 完整 L2 设计

### 4.8 任务拆解（featuretasks）

**输入**：epic-design.md + story_detail_design.md + plan.md + spec.md
**产出**：`tasks.md`（可执行 Task，含设计追溯）

tasks.md 的设计要求：
- 每个 Task 必须包含**设计引用**（指向 epic-design.md 哪个章节或 story_detail_design.md 的哪个 ST-xxx）
- Story 覆盖率 100%（所有 ST-xxx 均有对应 Task）
- 同时回填 spec.md 的需求追溯表（FR/NFR → Task 的可追溯链路）

### 4.9 实现（implement）

**输入**：tasks.md + epic-design.md + story_detail_design.md + plan.md + spec.md
**代码输出**

实现阶段的核心约束：
- 每个 Task 执行前，必须先读取其设计引用指向的章节，确保实现与设计一致
- **不得**在此阶段修改 plan.md、epic-design.md、spec.md
- 发现设计缺口时：停止实现，提交 CR（变更请求），由 SE/TL 在 EPIC 分支先更新设计文档

### 4.10 验证（verify）

实现完成后的独立验证，检查代码实现是否符合：
- spec.md 的 FR/NFR/AC
- plan.md 的技术规约
- epic-design.md 的架构设计
- story_detail_design.md 的 L2 详细设计

支持三级验证模式：Story 级 / Feature 级 / EPIC 级（EPIC 级使用并行子 Agent 加速）。

严格只读——verify 不修改任何设计文档，只标记 tasks.md 中的验证结果。

---

## 五、文档模板体系

AISDD 的所有产物文档都有对应的强制模板（位于 `.specify/templates/`）：

```
spec-template.md              → spec.md
epic-plan-template.md         → epic-plan.md
plan-template.md              → plan.md
epic-design-doc-template.md   → epic-design.md
key-func-design-template.md   → key-func-design.md
key-diagram-template.md       → key-diagram.md
story_detail_design_template.md → story_detail_design.md
tasks-template.md             → tasks.md
gate-log-template.md          → gate-log.md
ux-design-template.md         → ux-design.md
change-request-template.md    → CR 文件
```

**模板结构保护原则**（写入 constitution.md）：模板章节结构视为固定契约，AI 不得随意增删章节，不得借"更新某章节"之机扩散修改其他章节。

---

## 六、质量保障机制

AISDD 内建了多层质量保障：

### 6.1 跨 Feature 一致性分析

**`/aisdd.epicanalyze`**：EPIC 级跨 Feature 一致性分析，检测：
- 术语漂移（同一概念在不同 Feature 中命名不一致）
- 接口契约冲突（Owner 定义的接口与 Consumer 引用不匹配）
- NFR 预算超支（各 Feature 分配总和超过 EPIC 上限）
- 共享能力不一致（同一能力被多个 Feature 各自实现）
- Story 依赖完整性（依赖的 Story 是否存在）

### 6.2 对抗性挑战

**`/aisdd.challenge`**：在三个可选时机运行（`spec` / `plan` / `design`），从完整性、一致性、可行性三个独立视角识别漏洞和风险。与 analyze 的区别：analyze 侧重跨 Feature 横向一致性，challenge 侧重单一产物的深度质量。

### 6.3 人工关卡

五个关卡（spec-ready / plan-ready / design-ready / tasks-ready / implement-done）确保人类在关键决策点介入，AI 辅助检查但不代替人工判断。

---

## 七、变更管理（CR）

需求或技术方案变更时，通过 **`/aisdd.cr`** 处理：

1. 创建 CR 文件（基于 change-request-template.md）
2. AI 自动进行影响分析（影响哪些 Feature/Story/Task 与模块）
3. 生成下游更新清单
4. 按流程分步执行增量更新

**核心规则**：任何变更必须有"影响分析 → 增量更新"的闭环，不得只改代码不改文档。

---

## 八、分支与目录策略

```
Git 分支策略：
  epic/EPIC-001-short-name    ← 整个 EPIC 的工作分支
    ↓（完成后）
  main                         ← 合并目标

目录结构：
  specs/epics/
    EPIC-001-short-name/
      epic.md                   ← EPIC 容器
      epic-plan.md              ← EPIC 级技术约束
      epic-design.md            ← EPIC 软件设计说明书
      key-func-design.md        ← 关键功能疑难设计
      key-diagram.md            ← 全景类图与时序图
      ux-design.md              ← 设计稿解析（可选）
      gate-log.md               ← 关卡审批记录
      features/
        FEAT-001-xxx/
          spec.md               ← Feature 需求规格
          plan.md               ← Feature 技术规约
          tasks.md              ← 可执行任务
          story_detail_design.md← L2 详细设计
          checklists/           ← 检查清单
```

---

## 九、设计决策的几个关键取舍

### 9.1 为什么 Feature 不创建分支？

Feature 是文档组织单位，不是代码交付单位。多个 Feature 的代码往往相互依赖，强行分支会导致频繁合并冲突。EPIC 分支粒度是合理的，它既支持独立交付，又避免了过细分支的管理开销。

### 9.2 为什么强制 Mermaid 而不是 PlantUML？

- Mermaid 原生支持 Markdown 预览（GitHub / VSCode / Claude）
- 图表 as code，可以纳入 Git 版本控制，可以做 Diff
- 与 Cursor/Claude Code 编辑器兼容性最好

### 9.3 为什么有"快速通道"而不是一刀切？

AISDD 认识到过度设计本身就是一种浪费。对于单 Feature EPIC 或小改动（≤3 人天），强制走完整流程是不合理的。快速通道允许跳过 epic-plan.md、ux-design.md、story_detail_design.md 等产物，但不允许跳过人工关卡和 spec.md——需求明确性是不可妥协的底线。

### 9.4 为什么用 `constitution.md` 而非硬编码约束？

章程作为独立文件有两个好处：
1. 版本可演进——可以修订章程，比修改每个命令脚本灵活
2. 可被审计——每次设计前，AI 读取章程，违反章程的行为有据可查

---

## 十、总结：AISDD 的本质

AISDD 本质上是一套**约束驱动的 AI 工作流**，它的设计解决了三个根本问题：

| 问题 | AISDD 的解法 |
|------|-------------|
| AI 输出脱离现实 | Constitution 约束 + 差距分析前置 + 基于真实代码设计 |
| 知识只在对话中，不可追溯 | 强制产物文档化 + 单一事实源分层治理 |
| AI 一路跑，人类被动接受 | 五个人工关卡 + 冻结机制 + 任何变更走 CR 流程 |

它不是要取代工程师的判断，而是给工程师一个**结构化的协作框架**——AI 负责生成和检查，人类负责审批和决策，文档作为两者之间的契约。

---

## 十一、AISDD 评价：优势、局限与适用边界

### 11.1 核心优势

#### A. 解决了 AI 辅助开发最致命的漂移问题

传统 AI 辅助开发的最大风险是"对话驱动"：每次对话上下文不同，AI 输出不一致，随着迭代积累，需求、设计、代码三者越来越背离。AISDD 通过强制文档化和单一事实源机制，从根本上切断了这种漂移路径。

每个阶段的产物都是明确的文件，下游阶段只能依赖上游文件，不能依赖"上次 AI 说的"。这是 AISDD 最有价值的设计决策。

#### B. 关卡机制将人的判断嵌入正确位置

软件工程中有大量决策是 AI 不适合独立做的：需求是否覆盖了所有场景？技术约束是否可以接受？设计分级是 Lite 还是 Deep？AISDD 把这些决策通过 gate 机制交还给人类，而不是让 AI 一路自动化到底。

这个设计背后有清醒的认知：**AI 适合做生成和检查，不适合做最终判断**。

#### C. Constitution 机制使约束可版本化、可审计

把核心约束（演进式设计、差距分析优先、最小改动）写进 `constitution.md` 而非硬编码进每个命令，这让约束体系本身是可演进的。不同项目可以定制自己的章程，而不必修改工作流命令。

#### D. 分阶段产出避免一次性上下文爆炸

`/aisdd.epicdesign` 的参数化分阶段设计（arch → key → diagram → story → l2）是务实的工程选择。一次性让 AI 产出完整的 EPIC 设计说明书往往质量很差，分阶段则允许在每个层次充分聚焦，人类也可以在每个节点介入修正方向。

#### E. 支持快速通道，不强迫过度设计

承认不同规模 EPIC 需要不同深度的设计文档，是 AISDD 有别于很多"方法论工具"的务实之处。小改动（≤3 人天）走精简路径，大 EPIC 走完整路径，这与真实工程节奏吻合。

---

### 11.2 局限与挑战

#### A. 前期投入成本较高，短期 ROI 不明显

AISDD 的完整流程（epicspec → featurespec → clarify → epicplan → featureplan → epicdesign → featuretasks → implement → verify）对于中小型功能来说文档开销可能显著超过开发本身。

**典型场景**：一个只需 1 天开发的 bugfix，如果严格走流程，文档工作可能需要半天。这在时间压力下会形成阻力，导致团队倾向于绕过流程。

#### B. 对 AI 能力有较高依赖，质量天花板受制于模型

AISDD 的产出质量上限取决于 AI 对现有代码的理解深度。在大型 Android 工程中，模块间耦合复杂，AI 可能：
- 误判现有模块的边界
- 遗漏隐式依赖
- 在差距分析中产生错误的"可复用"判断

这些错误如果不被人类在关卡处捕获，会向下游传播并被放大。

#### C. 文档一致性维护是持续负担

AISDD 建立了严格的文档层级，但文档之间的一致性维护是长期成本。随着需求变更，一个 FR 的修改可能需要同步更新：spec.md → plan.md → epic-design.md → story_detail_design.md → tasks.md。

虽然 `/aisdd.cr` 提供了 CR 流程，但每次变更的"影响分析 → 增量更新"闭环在实践中很容易被压缩省略，导致文档逐渐失真。

#### D. 对团队��养有要求，推广门槛不低

AISDD 隐含了一套对工程师角色的假设：SE/TL 负责 spec/plan/design，开发者执行 tasks，AI 辅助生成与检查。这需要团队对角色边界有共识，并愿意在文档质量上投入时间。

在"快速交付"文化主导的团队中，让所有人接受"写代码前先把文档写好"的习惯，需要较强的推动力和示范效应。

#### E. 批量模式下的并行质量存在风险

`featurespec --batch` 和 `featureplan --batch` 允许并行为多个 Feature 生成文档。虽然有跨 Feature 一致性检查，但并行生成天然会导致各 Feature 缺乏整体视角——每个子 Agent 只关注自己的 Feature，全局设计约束可能被各 Feature 独立解读出现差异。

`/aisdd.challenge` 和 `/aisdd.epicanalyze` 是补救手段，但依赖人类主动触发，不是自动的。

---

### 11.3 与其他方案的比较

| 维度 | 纯对话式 AI 开发 | 传统规范文档 | AISDD |
|------|----------------|-------------|-------|
| 需求可追溯性 | 差（只在对话历史） | 好（但手动维护） | 好（强制文档化） |
| 文档-代码一致性 | 差（无机制保障） | 差（经常脱节） | 中（有 verify，但仍需人工） |
| 上手成本 | 低 | 高 | 中高 |
| 适合规模 | 原型/个人项目 | 大型团队 | 中大型团队/存量系统演进 |
| AI 约束力度 | 无 | 无（AI 不参与） | 强（Constitution + Gate） |
| 变更响应速度 | 快但混乱 | 慢但有序 | 中（有 CR 流程，但有开销） |
| 过度设计风险 | 低 | 高 | 中（有快速通道缓解） |

---

### 11.4 最适用的场景

AISDD 在以下场景中价值最大：

**高价值场景：**
- **存量 Android 系统的功能演进**：需要约束 AI 不乱动现有架构，差距分析机制直接对准这个痛点
- **多人协作的中大型 EPIC**：文档作为协作契约，避免各自理解不同导致的返工
- **高风险/高不确定性功能**：需求不稳定时，强制澄清和关卡机制能在早期暴露问题，而不是在代码写完后才发现
- **新人快速上手**：完整的设计文档链（spec → plan → epic-design → tasks）是最好的上下文传递工具

**低价值场景：**
- 独立开发者的个人项目（文档开销不合算）
- 纯修复性工作（bugfix、hotfix）
- 需求极其明确且规模极小的功能（1-2 天开发量）
- Greenfield 项目初期（尚无存量代码，演进式设计约束意义有限）

---

### 11.5 综合评价

AISDD 是一个**理念清晰、机制完整**的 AI 辅助开发工作流。它最大的贡献在于将 AI 的角色清晰地界定为"受约束的技术助理"，而非"无边界的自动化引擎"，这是当前 AI 辅助工程实践中普遍缺失的认知。

它的设计决策大多经过了认真的工程权衡：快速通道承认了过度设计的代价，批量模式承认了效率需求，分阶段产出承认了上下文限制，Constitution 机制承认了约束需要版本化。

**主要风险在于执行层**：AISDD 假设团队愿意在文档质量上持续投入，假设人类会认真执行每一个关卡，假设 AI 对现有代码的理解是准确的。这三个假设在真实团队中都存在摩擦。

一个务实的使用建议是：**把 AISDD 当作一个可裁剪的框架，而非一个必须完整执行的流程。** 根据 EPIC 的规模和风险等级，有意识地选择使用哪些阶段和机制，而不是为了遵守流程而遵守流程。毕竟，AISDD 本身的 constitution.md 里写得很清楚：

> 能用最小改动满足需求的，不得引入"理想化的大方案"。

这句话同样适用于 AISDD 本身的使用方式。
