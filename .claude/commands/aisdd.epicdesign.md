---
description: "**EPIC 级**软件设计说明书。在 EPIC 级技术约束就绪（`epic-plan.md` **或** 单 Feature EPIC 下唯一 Feature 的 `plan.md`）及各 Feature 轻量 `plan.md` 完成后运行；基于 epic.md、上述约束文档、各 feature spec/plan 及**现有工程代码**，按章节范围参数分阶段产出详细设计（0 层/1 层架构、关键设计含完整类图/时序、接口字段、表结构、Story 拆解、L2 详细设计）。供人类评审与后续 tasks/implement 阶段 AI 编码引用。"
handoffs:
  - label: 对抗性挑战（多 Feature 推荐）
    agent: aisdd.challenge
    prompt: epicdesign 完成（至少 story 阶段）后，运行 /aisdd.challenge design 对设计进行对抗性质量挑战（多 Feature EPIC 强烈推荐）
    send: false
  - label: EPIC 级跨 Feature 分析（建议在 featuretasks 前）
    agent: aisdd.epicanalyze
    prompt: 运行跨 Feature 一致性与质量分析
    send: false
  - label: 生成任务（Story → Task）
    agent: aisdd.featuretasks
    prompt: 将设计说明书中的 Story 拆解为可执行 tasks.md
    send: true
  - label: 补充需求或澄清
    agent: aisdd.clarify
    prompt: 需补充设计边界或约束时，澄清后可再运行 epicdesign 或直接说明要更新的章节/参数由 AI 做增量更新
    send: false
---

## 用户输入

```text
$ARGUMENTS
```

在继续操作前，你**必须**参考用户输入（若不为空）。可用于：**EPIC 标识**（如 `EPIC-002`）、**章节范围参数**（见下表）、或补充设计侧重范围。

**当参数为 `-h` 时**：仅输出下方「参数说明」帮助信息，不执行任何文件操作。

## 前置条件

各 Feature 的 `plan.md` 应已完成；多 Feature EPIC 时须具备 `epic-plan.md` 或满足 `SINGLE_FEATURE_WITHOUT_EPIC_PLAN_OK`。可选先运行 `/aisdd.challenge plan`。

## 设计阶段分步逻辑（先想清楚 → 按 Story 切片）

设计说明书按 `key → nfr → story → l2` 分阶段推进，每一步的**定位与粒度**递进如下：

| 阶段 | 定位 | 核心问题 | 图表粒度 |
|------|------|----------|----------|
| **`key`**（§七） | **方案论证** — 把重难点的设计策略与决策逻辑想清楚 | 这个方案行不行？方向对不对？ | **类图（全量签名）+ 时序（全分支）**：KD 内图表已是完整编码级，不再由 §八 补全 |
| **`nfr`**（§八~§十一） | **设计产出验证** — 量化评估方案是否满足 NFR 目标 | 性能/内存/安全等指标达标吗？ | — |
| **`story`**（§十二） | **Story 拆解** — 将设计方案拆为可独立交付的 Story | 怎么拆才能独立开发、独立验收？ | — |
| **`l2`**（§十三） | **Story 级落码设计** — 按 Story 切片，继承 KD 并补充该 Story 的完整详细类图/时序 | 拿到这份文档能不能直接写这个 Story 的代码，且不会偏离 KD？ | 单 Story 涉及的**完整**类图/时序（局部但详尽）；复杂 Story 必做，简单 Story 可仅写概要 |

**§七 → §十三 的演进关系**：§七 以长文论证方案可行性，图表是「证据」——KD 内关键类图含全量公共方法签名，核心调用链时序图穷举全异常分支；§十三 L2 在 §七 基础上**按 Story 切片**，为每个 Story 提供落码级指导。二者**范围递减、精度递增**。若 L2 涉及 KD 已定义的关键能力、核心类、接口契约、状态流转、异常策略或跨模块协作，必须继承 KD 决策并只做 Story 级细化，禁止脱离 KD 另起一套技术方案。

## 章节范围参数（分阶段输出）

通过参数控制本次调用产出的章节范围，建议按从粗到细的顺序逐步推进：

| 参数 | 对应章节 | 产出文件 | 内容 |
|------|----------|----------|------|
| **无参数**（默认） | §1~§6 填充；§7~§13 占位 | `epic-design.md`（完整章节骨架） | 首次调用：建立完整 §1~§13 骨架 + 填充§1~§6（架构 + 技术风险与边界场景），其余占位 |
| **arch** | §1~§6 | `epic-design.md` §1~§6 | 重新生成零层/一层架构（覆盖已有） |
| **key** | §7 | `key-func-design/KD_*_*.md` + `epic-design.md` §7 | **按需产出**：仅当存在关键疑难点、跨 Feature 核心方案、公共接口/状态机/并发/持久化等高风险设计时生成 KD；无此类风险时在 §7 标注 N/A，不创建 KD 文件。若生成 KD，**不**产出根目录 `key-func-design.md`；每 KD 一文件，命名 `KD_${三位序号}_${slug}.md`；§7.1 清单含层级/前置 KD/路径（DAG、无环）；§7.2 逐文件引用；KD 内类图须含全量公共方法签名，时序须穷举全异常分支；跨 KD / 跨 Feature 流程在相关 KD 中互链说明 |
| **nfr** | §8~§11 | **`nfr.md`** + **`interface-design.md`** + **`database-design.md`** + **`analytics-tracking.md`** + `epic-design.md` §8~§11 | **按需产出**：仅当 EPIC 涉及量化 NFR、外部接口、数据库/持久化或埋点时生成对应子文件；不适用时在 `epic-design.md` §8～§11 标注 N/A 与原因。适用时：**§8 正文**→ EPIC 根 **`nfr.md`**（模板 `nfr-template.md`）；**§9～§11 正文**→ 分别为 **`interface-design.md`**、`database-design.md`、`analytics-tracking.md`（模板 `epic-design-interface-template.md`、`epic-design-database-template.md`、`epic-design-analytics-tracking-template.md`）；`epic-design.md` §8～§11 **仅摘要 + 链接**对应子文件；建议在 `key` 完成后、`story` 前执行 |
| **story** | §12 | `epic-design.md` §12 | 拆解策略说明、Story 列表（含预估工作量）、依赖关系图、FR/NFR 覆盖矩阵、工作量汇总；须通过模板 §12.3 Story 自检清单 |
| **l2** | §13 | 各 `features/FEAT-xxx/l2_design/ST-xxx_<slug>.md`（按需） + `epic-design.md` §13（索引、关联 KD、前置依赖、依赖总览） | **复杂/高风险 Story 必做独立 L2**；简单 Story 可不创建独立 L2 文件，在 §13 索引中标注「由 `tasks.md` 设计引用与 DoD 承接」，并说明无需独立类图/时序的原因。生成 L2 时须先判定并继承关联 KD，再维护 §13.1/§13.2 与各文件首部「L2 依赖与引用」一致；可限定范围：`l2 FEAT-001` 或 `l2 ST-001` |
| **all** | §1~§13 全量 | 上述所有适用文件（含按需 L2） | 高风险 EPIC 或上下文充裕时一次性产出适用章节；依次执行 arch → key → nfr → story → l2，并对不适用子文件标注 N/A 而非强制创建 |
| **-h** | — | — | 仅输出参数帮助，不产出任何文件 |

**推荐顺序**：（无参数）→ arch → key → nfr → story → l2

**`-h` 帮助输出**（当且仅当参数为 `-h` 时输出，不执行写入）：

```
/aisdd.epicdesign 参数说明：

  (无参数)   首次调用，建立 epic-design.md 完整章节骨架 + 填充 §1~§6（架构 + 技术风险与边界场景），§7~§13 占位
  arch       重新生成零层/一层架构（§1~§6）
  key        按需产出关键设计（§7）→ key-func-design/KD_*_*.md（不产出根目录 key-func-design.md）；无关键疑难点时 §7 标注 N/A；更新 epic-design.md §7.1 清单与 §7.2 引用；KD 撰稿遵循 key-func-design-kd-template.md；**KD 内类图须含全量公共方法签名，时序须穷举全异常分支**
  nfr        按需产出 nfr.md（§8 全文）+ interface-design.md + database-design.md + analytics-tracking.md；
             epic-design.md §8～§11 均为摘要 + 链接（不粘贴子文件正文）
             建议在 key 完成后、story 前执行
  story      产出 Story 拆解（§12）
  l2         按需产出 L2 详细设计（§13）→ 复杂/高风险 Story 生成 l2_design/ST-xxx_<slug>.md；简单 Story 可仅在 epic-design §13.1/13.2 标注由 tasks.md DoD 承接
             若 Story 涉及 KD 关键设计，必须继承对应 KD 的核心类、接口契约、状态流转、异常策略和协作链，不得另起技术方案
             可指定范围：l2 FEAT-001 或 l2 ST-001
  all        一次性产出全部适用章节 §1~§13（含按需 l2），适用于高风险 EPIC 或上下文充裕时
             依次执行：arch → key → nfr → story → l2
  -h         显示本帮助信息

推荐顺序：(默认) → arch → key → nfr → story → l2
```

## 产出文件组

| 文件 | 对应章节 | 内容 |
|------|----------|------|
| `epic-design.md` | §1~§6、§7 清单与引用、§8~§11 摘要+四子文件链接、§12、§13 索引 | 设计总览；**§7.1** 为 KD 权威清单（含依赖） |
| `key-func-design/KD_*_*.md` | §七（详细） | 每关键设计一篇；**核心方案**、方案流程图、**关键类图**（全量公共方法签名）、核心调用链时序图（穷举全异常分支）；文首「依赖的其他 KD」须与 §7.1 一致 |
| `nfr.md` | §八（详细） | 技术评估量化全文（8.1～8.7），模板 `nfr-template.md` |
| `interface-design.md` | §九（详细） | 对外/外部接口（9.1～9.3），模板 `epic-design-interface-template.md` |
| `database-design.md` | §十（详细） | 库表与数据策略（10.1～10.4），模板 `epic-design-database-template.md` |
| `analytics-tracking.md` | §十一（详细） | 埋点事件与字段（11.1～11.2），模板 `epic-design-analytics-tracking-template.md` |
| `features/FEAT-xxx/l2_design/ST-xxx_*.md` | §十三 | 各 Story 落码级 L2 详细设计（每 ST 独立文件）；涉及 KD 时须继承 KD 并在文件首部列出关联 KD |

## 大纲

目标：在 **EPIC 根**产出 **EPIC 软件设计说明书**及配套子文件，作为面向人类评审与后续 Task/Implement 阶段 AI 编码引用的设计方案文档。与各 Feature 的 `plan.md`（技术规约）共同约束 tasks.md 与代码实现。文档结构**从整体到局部**，通过参数控制每次输出的章节范围。

**前置条件**：
- **EPIC 级技术约束**满足以下**之一**：
  - `epic-plan.md` 已产出（`/aisdd.epicplan`），或
  - **单 Feature EPIC**：`features/` 下**仅有一个** Feature 子目录，且该目录下 `plan.md` 已产出（EPIC 级约束已按章程合并进该 `plan.md`，可省略 `epic-plan.md`）
- 各 Feature 的 `plan.md` 已产出（单 Feature 时即上述唯一 `plan.md`）
- 须遵循 `.specify/memory/constitution.md` 的演进式设计原则

执行步骤：

1. **环境与路径**：从仓库根运行：

```powershell
.specify/scripts/powershell/get-epic-paths.ps1 -EpicId "EPIC-002" -Json
```

解析 JSON 得到 `EPIC_DIR`、`EPIC_PLAN`、`HAS_EPIC_PLAN`、`SINGLE_FEATURE_WITHOUT_EPIC_PLAN_OK`、`SOLE_FEATURE_PLAN`、`EPIC_CONSTRAINT_SOURCE`。

- **放行条件**：`HAS_EPIC_PLAN -eq true` **或** `SINGLE_FEATURE_WITHOUT_EPIC_PLAN_OK -eq true`。
- 若两者均不满足：**终止**并提示先运行 `/aisdd.epicplan`（多 Feature 时）或先完成唯一 Feature 的 `/aisdd.featureplan`（单 Feature 时）。
- **读取 EPIC 级技术约束时**：若 `HAS_EPIC_PLAN` 为 true，以 `EPIC_PLAN`（`epic-plan.md`）为准；否则以 `EPIC_CONSTRAINT_SOURCE`（即唯一 Feature 的 `plan.md`）作为 EPIC 级技术约束输入。
- 若用户输入为 `-h`：**仅输出上方参数说明**，终止，不读写文件。

2. **解析章节范围参数**：从 `$ARGUMENTS` 中解析参数（无参数 | arch | key | nfr | story | l2 [范围] | all | -h）。无参数时视为首次调用（默认行为）。

3. **加载上下文**（执行产出前）：
   - 读取 `EPIC_DIR/epic.md`
   - 读取 EPIC 级技术约束：**若存在** `epic-plan.md` 则读取之；**若单 Feature 省略 epic-plan**（`SINGLE_FEATURE_WITHOUT_EPIC_PLAN_OK`）则**必须**读取 `SOLE_FEATURE_PLAN` 指向的 `plan.md`，将其中的 EPIC 级约束与 Feature 规约一并作为技术约束输入
   - 读取各 `EPIC_DIR/features/*/spec.md`（含「完整场景矩阵」，P0 场景须在设计中可追溯）、轻量 `plan.md`（只作为约束与设计输入清单，不将 plan 当作详细设计事实源）
   - 若存在：读取 `EPIC_DIR/ux-design.md`
   - 若 `EPIC_DIR/research/` 存在且非空：扫描调研报告作为**参考性补充信息**——了解 API 限制、库评估、风险等技术背景；调研报告**不是约束源或结论**，设计仍须独立完整分析并做出自己的设计决策
   - 读取 `.specify/memory/constitution.md`
   - 读取 `.specify/templates/epic-design-doc-template.md`、`key-func-design-kd-template.md`、`nfr-template.md`、`epic-design-interface-template.md`、`epic-design-database-template.md`、`epic-design-analytics-tracking-template.md`、`story_detail_design_template.md`
   - 读取 `.claude/rules/specify-diagram-requirements.mdc`、`.claude/rules/mermaid-style-guide.mdc`
   - **分析现有工程代码**：架构分层、模块划分、包组织、现有框架

4. **根据参数产出**：
   - **无参数**：生成/更新 `epic-design.md`，含完整 §1~§13 骨架；§1~§6 填充内容，§7~§13 占位（提示运行对应参数产出）。
   - **arch**：重写 `epic-design.md` 的 §1~§6。
   - **key**：先判断是否存在关键疑难点、跨 Feature 核心方案、公共接口/状态机/并发/持久化等高风险设计；若不存在，在 `epic-design.md` §7 标注 N/A 与原因，不创建 KD 文件。若适用，确保存在目录 `EPIC_DIR/key-func-design/`；按 `key-func-design-kd-template.md` 为每个 KD 产出 **`key-func-design/KD_001_<slug>.md`** 等（命名 `KD_${三位序号}_${slug}.md`）；更新 `epic-design.md` **§7.1**（清单：层级/类型、前置 KD、路径、关联）和 **§7.2**（逐文件链接）。**禁止**创建 EPIC 根目录 `key-func-design.md`，**不再**单独产出流程图集。KD 类图须含**全量公共方法签名**，时序须**穷举全异常分支**；跨 KD / 跨 Feature 流程在相关 KD 中互链说明。
   - **nfr**：先判断 §8～§11 各子文件是否适用；不适用时只在 `epic-design.md` 对应章节标注 N/A 与原因，不创建空子文件。适用时，按 `nfr-template.md` 产出/更新 **`EPIC_DIR/nfr.md`**（含 §8.1～§8.7 全文）；按需分别按 `epic-design-interface-template.md`、`epic-design-database-template.md`、`epic-design-analytics-tracking-template.md` 产出/更新 **`EPIC_DIR/interface-design.md`**、**`database-design.md`**、**`analytics-tracking.md`**（各子节如不适用须标注 N/A 并简述原因）；最后更新 `epic-design.md` **§8～§11** 为摘要 + 链接或 N/A 说明（**禁止**在 `epic-design.md` 内重复粘贴上述子文件正文）。
   - **story**：按模板「§12.1 拆解策略（拆解维度 → 反模式筛查）→ §12.2 拆分约束（拆分首看改动路径独立性与技术边界，工作量仅为参考信号：典型 2～5 人天，>7 人天检查是否可拆，<1 人天检查是否可合并）→ §12.3 Story 自检清单（9 项全部通过）」依序完成，产出 `epic-design.md` 的 §12（拆解策略说明、Story 列表含预估工作量、依赖图、FR/NFR 覆盖矩阵、工作量汇总）。
   - **l2**：
     - **前置：KD 关联与继承检查**（每个 Story 生成 L2 前必须执行）：
       1. 读取 `epic-design.md` §7.1/§7.2 与所有相关 `key-func-design/KD_*_*.md`
       2. 判断本 Story 是否涉及 KD 已定义的关键能力、核心类、接口契约、状态流转、异常策略、并发/持久化策略或跨模块协作；若涉及，必须在 `epic-design.md` §13.1「关联 KD」和 L2 文件首部「L2 依赖与引用」中列出对应 KD
       3. L2 的类图、时序图与功能设计必须沿用关联 KD 中的核心类/接口、依赖方向、调用职责、成功/失败语义和关键约束；只允许补充 Story 专属触发、局部方法、字段转换、UI 响应和边界分支
       4. 若发现需要改变 KD 已定方案，**停止生成冲突 L2**，先更新对应 KD 或记录设计变更后再继续；禁止在 L2 中绕开 KD 另写一套技术方案
     - **前置：类名存在性检查**（每个 Story 生成类图前必须执行）：
       1. 按 `plan.md` 的项目结构扫描工程代码，定位本 Story 涉及的相关模块/包
       2. 列出本 Story 类图将使用的全部核心类，区分两类：
          - **现有类**（代码中已存在）：必须使用代码中的真实完整类名，不得改名或使用示例类名
          - **新增类**（设计新增，代码中尚不存在）：在类图中该类旁注明 `// 新增类：[一句话说明新增理由]`
       3. 若无法确认某类是否存在，在类图旁标注 `// 待确认：[类名]`，由人工评审时核实
     - 完成 KD 关联与类名检查后，判断 Story 是否需要独立 L2：涉及新增核心类、跨模块协作、复杂状态/并发/持久化、关键异常分支或高风险 NFR 的 Story 必须生成；简单 Story 可不创建独立 L2 文件，在 `epic-design.md` **§13.1 索引**标注「由 `tasks.md` 设计引用与 DoD 承接」及原因。
     - 对需独立 L2 的 Story，在各 Feature **`l2_design/`** 下按 ST 产出/更新 **`ST-xxx_<slug>.md`**（模板 `story_detail_design_template.md`），并更新 `epic-design.md` **§13.1 索引（含关联 KD、前置依赖列、L2 状态）与 §13.2 依赖总览**；若带范围则仅处理指定 FEAT 或 ST。
   - **all**：依次执行 arch → key → nfr → story → l2 的完整产出（含 l2）；适用于小 EPIC 或上下文充裕时一次性产出全部章节。

5. **子文件引用规则**：§7 详细在 `key-func-design/KD_*_*.md`，**清单与引用在 `epic-design.md` §7.1/§7.2**；§8 详细在 **`nfr.md`**；§9～§11 详细分别在 **`interface-design.md`**、**`database-design.md`**、**`analytics-tracking.md`**；`epic-design.md` §8～§11 仅摘要 + 链接；§13 L2 正文在各 Feature `l2_design/ST-xxx_<slug>.md`，**索引与依赖总览在 `epic-design.md` §13.1/§13.2**。

6. **完成报告**：输出本次产出的文件路径、对应章节，并提示下一步：
   - 默认/arch 完成 → 提示继续 `key`
   - key 完成 → 提示继续 `nfr`
   - nfr 完成 → 提示继续 `story`
   - story 完成 → 提示继续 `l2`
   - l2 完成 → 提示：**`/aisdd.challenge design`**（多 Feature EPIC 强烈推荐）→ `/aisdd.epicanalyze` → `/aisdd.featuretasks`（在 `tasks.md` 内生成 FR/NFR → Story → Task 追溯矩阵）

核心规则：
- 产出各 `key-func-design/KD_*_*.md` 时须遵循 `key-func-design-kd-template.md`：各 KD 的**方案流程图须直接画在该 KD 文件内**；跨 KD / 跨 Feature 流程在相关 KD 中互链说明；**须含「关键类图」**（全量公共方法签名）及**核心调用链时序图**（穷举全异常分支），且时序图 participant 与类图一致；**核心方案**为清晰连贯正文，覆盖技术点与**全链路**，链上**每一环如何达成**写清，并与类图/流程图/时序图一致；**§7.1 与文首「依赖的其他 KD」须一致**，依赖须为 DAG、无循环
- 所有图表必须使用 **Mermaid 格式**，遵循 `.claude/rules/mermaid-style-guide.mdc`
- 图表内容须基于本工程**实际架构与真实代码**，遵循 `.claude/rules/specify-diagram-requirements.mdc`
- 设计说明书是 tasks.md 与 implement 阶段的**设计事实源**，与 plan.md 的技术规约共同约束实现
- **L2 按需分文件并继承 KD**：`epic-design.md` §13 为索引、关联 KD、L2 状态与依赖总览；复杂/高风险 Story 的正文在各 Feature 的 `l2_design/ST-xxx_<slug>.md` 中，简单 Story 可由 `tasks.md` 的设计引用与 DoD 承接。凡涉及 KD 的 L2 必须继承 KD 关键方案，只能细化 Story 局部落码细节，不得与 KD 冲突或另起方案
- **章节骨架先行**：首次（无参数）调用必须输出完整 §1~§13 骨架，未填充章节保留占位提示；后续调用仅更新指定章节
