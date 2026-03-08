# 需求开发流程总览（Workflow Overview）

> **定位**：端到端流程速查，展示各产物的产出顺序、输入输出、事实源归属与裁剪规则。详细治理规则见 `constitution.md`。

---

## 一、端到端流程图

```mermaid
%%{init: {'theme': 'base', 'themeVariables': { 'primaryColor': '#E3F2FD', 'primaryTextColor': '#212121', 'primaryBorderColor': '#1976D2', 'lineColor': '#546E7A'}}}%%
flowchart TD
    Start([需求输入]) --> EpicMd["epic.md<br/>EPIC 规格说明"]
    EpicMd --> SpecMd["各 Feature spec.md<br/>Feature 规格说明"]
    SpecMd --> EpicPlan["epic-plan.md<br/>EPIC 技术规约"]
    SpecMd --> UxDesign["ux-design.md<br/>UX 设计"]
    EpicPlan --> PlanMd["各 Feature plan.md 初版<br/>Feature 技术规约"]
    UxDesign -.-> PlanMd
    PlanMd --> EpicDesign["epic-design.md<br/>EPIC 软件设计说明书"]
    UxDesign -.-> EpicDesign
    EpicDesign --> StoryDesign["story_detail_design.md<br/>L2 Story 详细设计"]
    EpicDesign --> Backfill["回填 plan.md 索引表<br/>回填 spec.md 追溯表"]
    StoryDesign --> TasksMd["tasks.md<br/>Task 拆解"]
    Backfill --> TasksMd
    TasksMd --> Implement["Implement<br/>代码实现"]
    Implement --> Verify["Verify<br/>实现↔设计一致性验证"]
    Verify --> Done([交付])

    style Start fill:#E8F5E9,stroke:#388E3C
    style Done fill:#E8F5E9,stroke:#388E3C
    style Backfill fill:#FFF3E0,stroke:#F57C00
    style EpicMd fill:#E3F2FD,stroke:#1976D2
    style SpecMd fill:#E3F2FD,stroke:#1976D2
    style EpicPlan fill:#E3F2FD,stroke:#1976D2
    style UxDesign fill:#E3F2FD,stroke:#1976D2
    style PlanMd fill:#E3F2FD,stroke:#1976D2
    style EpicDesign fill:#E3F2FD,stroke:#1976D2
    style StoryDesign fill:#E3F2FD,stroke:#1976D2
    style TasksMd fill:#E3F2FD,stroke:#1976D2
```

**说明**：实线箭头表示顺序依赖，虚线箭头表示可选输入。`ux-design.md` 与 `epic-plan.md` 可并行产出（均依赖所有 `spec.md` 完成）。

---

## 二、各阶段产出物与事实源

| 阶段 | 产出物 | 事实源归属 | 输入 | 关卡 |
|------|--------|-----------|------|------|
| **EPIC 规格** | `epic.md` | 需求边界与 Feature 拆分 | 需求描述 | — |
| **Feature 规格** | 各 `spec.md` | 需求事实源（FR/NFR/AC） | `epic.md` | Spec Ready |
| **EPIC 技术规约** | `epic-plan.md` | EPIC 技术规约事实源 | `epic.md`、各 `spec.md` | — |
| **UX 设计** | `ux-design.md` | 体验呈现事实源 | `epic.md`、各 `spec.md` | — |
| **Feature 技术规约** | 各 `plan.md`（初版） | Feature 技术规约事实源 | `spec.md`、`epic-plan.md`、`ux-design.md`（可选） | Plan Ready |
| **EPIC 设计说明书** | `epic-design.md` | 架构与设计事实源 | `epic.md`、`epic-plan.md`、各 `spec.md`、各 `plan.md`、`ux-design.md`（可选） | Design Ready |
| **L2 详细设计** | 各 `story_detail_design.md` | 落码级设计事实源 | `epic-design.md` | — |
| **回填** | 各 `plan.md` Story 索引表、各 `spec.md` 需求追溯表 | — | `epic-design.md` §十二 | — |
| **Task 拆解** | 各 `tasks.md` | 执行事实源 | `plan.md`、`epic-design.md`、`story_detail_design.md` | — |
| **实现** | 代码 | — | `tasks.md` | Implement Ready |
| **验证** | 验证报告 | 实现↔设计一致性事实源 | 代码、设计文档 | Verify Pass |
| **审批记录** | `gate-log.md` | 审批事实源 | 各关卡评审结果 | — |

---

## 三、分支策略

- 每个 EPIC 创建一个 `epic/EPIC-xxx-short-name` 分支（由 `create-new-epic.ps1` 自动创建）
- **不为 Feature 单独创建分支**——Feature 是文档组织单位（目录），而非分支单位
- 所有 Feature 的 spec/plan/tasks/代码实现均在 EPIC 分支上进行
- Story/Task 的增量提交均在 EPIC 分支上，按 Task 或逻辑分组粒度提交
- EPIC 完成后合并回主分支

详见 `constitution.md` §七.1。

---

## 四、小 EPIC 快速通道（Fast Track）

为避免小改动承担过重的文档负担，提供以下裁剪规则：

### 4.1 单 Feature EPIC（EPIC 仅含一个 Feature）

| 产物 | 裁剪规则 | 预估文档量 |
|------|----------|-----------|
| `epic-plan.md` | **可省略**，其内容合并到 `plan.md`（在 plan 中增加"EPIC 级约束"章节） | 节省 ~140 行 |
| `epic-design.md` | 仅需 **Lite** 级：§一～§五 + §十二 Story 拆解 + §十三 L2 索引；§六～§十一 按需裁剪（无风险则 N/A） | ~500 行（vs 完整 1400+） |
| `key-func-design.md` | 无疑难点/亮点可省略，在 epic-design.md §六标注「本 EPIC 无关键疑难点/亮点，省略」 | 可省 ~100 行 |
| `key-diagram.md` | 仅需骨架类图 + 1 个 Feature 子类图 + 1 张关键时序图 | ~80 行（vs 完整 185+） |
| `story_detail_design.md` | 视复杂度，简单 Story 可仅写概要（需求+DoD，功能设计部分省略类图/时序图） | ~30 行/Story |

### 4.2 纯修复/小改动（预估 ≤ 3 人天）

| 产物 | 裁剪规则 | 预估文档量 |
|------|----------|-----------|
| `epic-plan.md` | **可跳过** | 0 |
| `ux-design.md` | **可跳过** | 0 |
| `epic-design.md` | 可精简为仅含 **Story 拆解 + 关键类图**（§一～§四简写 + §十二 + 跳过其余） | ~200 行 |
| `key-func-design.md` | **可跳过** | 0 |
| `key-diagram.md` | 仅需关键变更涉及的类图片段 | ~50 行 |
| `story_detail_design.md` | **可跳过** | 0 |
| Gate 评审 | Gate 0~4 可合并为一轮快速评审，Gate 5~6 按需 | — |

### 4.3 各档位预估总文档量（参考）

| 档位 | 适用场景 | Feature 数 | 预估总文档量 | 典型编写时间 |
|------|----------|-----------|-------------|-------------|
| **快速通道** | 纯修复/≤3人天 | 1 | ~600-800 行 | 0.5-1 天 |
| **单 Feature Lite** | 单 Feature EPIC | 1 | ~1200-1500 行 | 1-2 天 |
| **Standard** | 多 Feature/中等风险 | 2-3 | ~3000-4000 行 | 2-4 天 |
| **Deep** | 高风险/高不确定性 | 3+ | ~5000+ 行 | 3-5 天 |

> **选择原则**：文档量应与 EPIC 风险和复杂度匹配。若写文档的时间超过实际编码时间的 50%，说明选择了过重的档位。

### 判断流程

```mermaid
%%{init: {'theme': 'base', 'themeVariables': { 'primaryColor': '#E3F2FD', 'primaryTextColor': '#212121', 'primaryBorderColor': '#1976D2', 'lineColor': '#546E7A'}}}%%
flowchart TD
    Check{EPIC 规模?}
    Check -->|"纯修复/≤3人天"| FastTrack["快速通道<br/>~600-800 行<br/>精简产出"]
    Check -->|单 Feature| SingleFeat["合并 epic-plan → plan<br/>Lite 级设计说明书<br/>~1200-1500 行"]
    Check -->|多 Feature / 中等风险| Standard["Standard 流程<br/>~3000-4000 行"]
    Check -->|多 Feature / 高风险| Deep["Deep 流程<br/>~5000+ 行"]

    style Check fill:#FFF3E0,stroke:#F57C00
    style FastTrack fill:#E8F5E9,stroke:#388E3C
    style SingleFeat fill:#E8F5E9,stroke:#388E3C
    style Standard fill:#E3F2FD,stroke:#1976D2
    style Deep fill:#E3F2FD,stroke:#1976D2
```

详见 `constitution.md` §八。

---

## 五、ux-design.md 产出时机

- **前置条件**：所有 Feature 的 `spec.md` 已完成
- **并行窗口**：与 `epic-plan.md` 并行产出，或在其之前完成
- **下游消费**：作为各 Feature `plan.md` 和 `epic-design.md` 的**可选输入**（UI/交互约束）
- **非技术 Feature 可跳过**：纯后台/数据/SDK 类 Feature 无需 `ux-design.md`

---

## 六、命令执行顺序

以下流程图展示各 `/aisdd.*` 命令的执行顺序与产出物。

```mermaid
%%{init: {'theme': 'base', 'themeVariables': { 'primaryColor': '#E3F2FD', 'primaryTextColor': '#212121', 'primaryBorderColor': '#1976D2', 'lineColor': '#546E7A'}}}%%
flowchart TD
    Step1["create-new-epic.ps1<br/>创建 EPIC 分支 + 目录"] --> Step2["/aisdd.specify<br/>产出 epic.md<br/>（EPIC 规格 + Feature 拆分）"]
    Step2 --> Step3["/aisdd.feature<br/>创建 Feature 目录 + 产出 spec.md<br/>（逐个 Feature 执行）"]
    Step3 --> Step4["/aisdd.epicplan<br/>产出 epic-plan.md"]
    Step3 --> Step5["/aisdd.epicuidesign<br/>产出 ux-design.md"]
    Step4 --> Step6["/aisdd.plan<br/>产出各 Feature plan.md 初版<br/>（按依赖顺序逐个执行）"]
    Step5 -.-> Step6
    Step6 --> Step7["/aisdd.epicdesign<br/>产出 epic-design.md<br/>+ key-func-design.md<br/>+ key-diagram.md<br/>+ story_detail_design.md"]
    Step7 --> Step8["/aisdd.backfill<br/>回填 plan.md Story 索引表<br/>回填 spec.md 需求追溯表<br/>回填 plan.md §一 互校"]
    Step8 --> Step9["/aisdd.tasks<br/>产出各 Feature tasks.md"]
    Step9 --> Step10["/aisdd.implement<br/>按 Task 逐个实现代码"]
    Step10 --> Step11["/aisdd.verify<br/>实现↔设计一致性验证"]
    Step11 --> Step12([交付 / 合并主分支])

    style Step1 fill:#E8F5E9,stroke:#388E3C
    style Step12 fill:#E8F5E9,stroke:#388E3C
    style Step8 fill:#FFF3E0,stroke:#F57C00
```

| 步骤 | 命令 | 产出物 | 执行次数 |
|------|------|--------|----------|
| 1 | `create-new-epic.ps1` | EPIC 分支 + EPIC 目录 + `epic.md`（空模板） | 每个 EPIC 一次 |
| 2 | `/aisdd.specify` | `epic.md`（填充内容：EPIC 规格 + Feature 拆分） | 每个 EPIC 一次 |
| 3 | `/aisdd.feature` | Feature 目录 + `spec.md`（填充内容） | 每个 Feature 一次 |
| 4 | `/aisdd.epicplan` | `epic-plan.md` | 每个 EPIC 一次 |
| 5 | `/aisdd.epicuidesign` | `ux-design.md` | 每个 EPIC 一次（可选，与步骤 4 并行） |
| 6 | `/aisdd.plan` | 各 Feature `plan.md` 初版 | 每个 Feature 一次（按依赖顺序） |
| 7 | `/aisdd.epicdesign` | `epic-design.md` + `key-func-design.md` + `key-diagram.md` + 各 `story_detail_design.md` | 每个 EPIC 一次（分 Gate 逐阶段） |
| 8 | `/aisdd.backfill` | `plan.md` Story 索引表 + `spec.md` 需求追溯表 + `plan.md` §一互校 | Gate 5 通过后一次 |
| 9 | `/aisdd.tasks` | 各 Feature `tasks.md` | 每个 Feature 一次 |
| 10 | `/aisdd.implement` | 代码 | 按 Task 逐个执行 |
| 11 | `/aisdd.verify` | 验证报告（模板：`verify-report-template.md`） | 按需 |

---

## 七、变更管理

任何变更通过 **Change Request（CR）** 发起，流程见 `change-request-template.md`。

核心规则：
- 变更须有影响分析 → 增量更新的闭环
- 只更新受影响的产物，不扩散修改（精准更新原则）
- 文档变更须更新 Version 与变更记录表

### 7.1 需求变更流程

> 适用场景：需求范围（Scope）、FR/NFR/AC、边界场景发生变化（来自 PM/用户反馈/评审结论等）。

```mermaid
%%{init: {'theme': 'base', 'themeVariables': { 'primaryColor': '#E3F2FD', 'primaryTextColor': '#212121', 'primaryBorderColor': '#1976D2', 'lineColor': '#546E7A'}}}%%
flowchart TD
    Trigger([需求变更触发]) --> CreateCR["创建 CR<br/>填写变更内容 + 原因"]
    CreateCR --> Impact["影响分析<br/>定位受影响的 Feature/FR/NFR/AC"]
    Impact --> Review{CR 评审}
    Review -->|不通过| Reject([驳回])
    Review -->|通过| UpdateSpec["更新 spec.md<br/>FR/NFR/AC/边界"]
    UpdateSpec --> CheckUX{涉及交互/视觉?}
    CheckUX -->|是| UpdateUX["更新 ux-design.md"]
    CheckUX -->|否| CheckPlan{涉及技术方案?}
    UpdateUX --> CheckPlan
    CheckPlan -->|是| UpdatePlan["更新 plan.md<br/>契约/预算/风险"]
    CheckPlan -->|否| CheckDesign{涉及架构/Story?}
    UpdatePlan --> CheckDesign
    CheckDesign -->|是| UpdateDesign["更新 epic-design.md<br/>Story 拆解/类图/时序"]
    CheckDesign -->|否| UpdateTasks["更新 tasks.md<br/>调整/新增/删除 Task"]
    UpdateDesign --> UpdateL2["更新 story_detail_design.md<br/>（如涉及 L2）"]
    UpdateL2 --> UpdateTasks
    UpdateTasks --> Continue([继续实现])

    style Trigger fill:#FFF3E0,stroke:#F57C00
    style Reject fill:#FFEBEE,stroke:#D32F2F
    style Continue fill:#E8F5E9,stroke:#388E3C
    style Review fill:#FFF3E0,stroke:#F57C00
    style CheckUX fill:#FFF3E0,stroke:#F57C00
    style CheckPlan fill:#FFF3E0,stroke:#F57C00
    style CheckDesign fill:#FFF3E0,stroke:#F57C00
```

**关键原则**：需求变更从 `spec.md` 出发，**自顶向下**逐层检查是否需要更新下游产物。只更新受影响范围，不扩散修改。

### 7.2 技术方案变更流程

> 适用场景：技术选型不可行、性能/功耗评估超标、实现期发现设计缺陷、架构决策需调整。

```mermaid
%%{init: {'theme': 'base', 'themeVariables': { 'primaryColor': '#E3F2FD', 'primaryTextColor': '#212121', 'primaryBorderColor': '#1976D2', 'lineColor': '#546E7A'}}}%%
flowchart TD
    Trigger([方案变更触发]) --> CreateCR["创建 CR<br/>填写变更内容 + 原因 + 证据"]
    CreateCR --> Impact["影响分析<br/>定位受影响的模块/组件/接口"]
    Impact --> CheckNFR{NFR 目标需调整?}
    CheckNFR -->|是| NegotiateNFR["协商 NFR 变更<br/>更新 spec.md NFR"]
    CheckNFR -->|否| Review{CR 评审}
    NegotiateNFR --> Review
    Review -->|不通过| Reject([驳回])
    Review -->|通过| Scope{变更范围?}
    Scope -->|"EPIC 级<br/>（架构/分层/共享能力）"| UpdateEpicPlan["更新 epic-plan.md<br/>技术约束"]
    Scope -->|"Feature 级<br/>（接口/数据/实现）"| UpdatePlan["更新 plan.md<br/>技术规约"]
    UpdateEpicPlan --> UpdatePlan
    UpdatePlan --> UpdateDesign["更新 epic-design.md<br/>架构图/类图/时序图"]
    UpdateDesign --> UpdateL2["更新 story_detail_design.md"]
    UpdateL2 --> CheckStory{Story 拆解需调整?}
    CheckStory -->|是| UpdateStory["调整 Story 拆解<br/>回填 plan.md 索引 + spec.md 追溯"]
    CheckStory -->|否| UpdateTasks["更新 tasks.md<br/>调整受影响的 Task"]
    UpdateStory --> UpdateTasks
    UpdateTasks --> Continue([继续实现])

    style Trigger fill:#FFF3E0,stroke:#F57C00
    style Reject fill:#FFEBEE,stroke:#D32F2F
    style Continue fill:#E8F5E9,stroke:#388E3C
    style Review fill:#FFF3E0,stroke:#F57C00
    style CheckNFR fill:#FFF3E0,stroke:#F57C00
    style Scope fill:#FFF3E0,stroke:#F57C00
    style CheckStory fill:#FFF3E0,stroke:#F57C00
```

**关键原则**：
- 方案变更从 `plan.md` / `epic-plan.md` 出发，**自中间向两端**扩展——向上检查是否需要调整 NFR 目标（`spec.md`），向下更新设计说明书和 Task
- 若变更导致 NFR 超标，必须先与产品协商 NFR 目标调整（走 CR），再继续方案变更
- EPIC 级变更（架构/分层/共享能力）须先更新 `epic-plan.md`，再级联更新各 Feature 的 `plan.md`

### 7.3 变更影响速查表

| 变更类型 | 起点（事实源） | 可能影响的下游产物 |
|----------|---------------|-------------------|
| 需求范围/FR/AC | `spec.md` | `ux-design.md` → `plan.md` → `epic-design.md` → `story_detail_design.md` → `tasks.md` |
| NFR 指标调整 | `spec.md` | `plan.md`（预算） → `epic-design.md`（§八 评估） → `tasks.md`（验证阈值） |
| 交互/视觉/动效 | `ux-design.md` | `plan.md`（UI 约束） → `epic-design.md`（类图/时序） → `tasks.md` |
| EPIC 级技术约束 | `epic-plan.md` | 各 `plan.md` → `epic-design.md` → `story_detail_design.md` → `tasks.md` |
| Feature 级技术方案 | `plan.md` | `epic-design.md` → `story_detail_design.md` → `tasks.md` |
| Story 拆解调整 | `epic-design.md` §十二 | `story_detail_design.md` → `plan.md`（索引表） → `spec.md`（追溯表） → `tasks.md` |
