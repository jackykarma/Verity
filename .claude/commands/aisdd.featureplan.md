---
description: "生成 Feature 轻量技术规约（增量约束/能力边界/数据与 NFR 硬约束/待确认项），在 epic-plan.md 的 EPIC 级约束下编写。系统设计（架构图、类图、时序、Story 拆解、L2 设计、接口字段、表结构）在 /aisdd.epicdesign 阶段产出。支持 --batch 模式从已有 spec.md 并行生成所有 Feature 的 plan.md。"
handoffs:
  - label: 对抗性挑战（多 Feature 推荐）
    agent: aisdd.challenge
    prompt: 所有 Feature plan 生成后，运行 /aisdd.challenge plan 对 plan 进行对抗性质量挑战（多 Feature EPIC 强烈推荐）
    send: false
  - label: 审批关卡（plan-ready，在所有 Feature plan 完成后）
    agent: aisdd.gate
    prompt: plan-ready 关卡——冻结 epic-plan 与各 plan 后进入设计说明书阶段
    send: false
  - label: 输出 EPIC 软件设计说明书
    agent: aisdd.epicdesign
    prompt: 各 Feature plan 完成后，产出 EPIC 软件设计说明书（含架构图、Story 拆解）+ 各 Feature 的 l2_design/ST-xxx_*.md（L2 设计）
    send: true
  - label: 创建检查清单
    agent: aisdd.checklist
    prompt: 为以下领域创建检查清单……
    send: false
---

## 用户输入

```text
$ARGUMENTS
```

在继续操作前，你**必须**参考用户输入内容（若不为空）。

**模式判断（最先执行）**：

- 若 `$ARGUMENTS` 包含 `--batch`、`-batch` 或 `--all`：进入**批量模式**，执行 §批量模式执行步骤
- 否则：进入**单 Feature 模式**（默认），执行 §单 Feature 模式执行步骤

---

## 进入本阶段前（Gate 提醒）

在执行下方步骤**之前**，你**必须**：

1. **提醒用户**核对 EPIC 根 `gate-log.md`（若存在）中 **spec-ready** 是否已通过（各 Feature `spec.md` 已冻结或可进入 Plan）。
2. **多 Feature EPIC**：还须提醒确认已具备 `epic-plan.md`（或用户已选择单 Feature 合并路径且 `get-epic-paths.ps1 -Json` 将来可满足 `SINGLE_FEATURE_WITHOUT_EPIC_PLAN_OK`）。
3. 若 **spec-ready** 未通过或用户未确认，须**再次提示**先运行 `/aisdd.gate spec-ready`（及按需 `/aisdd.epicplan`）；仅当用户在 `$ARGUMENTS` 中**显式声明**跳过 gate 时，可记录风险后继续。

**本命令对应的准入关卡**：**spec-ready**（技术规约编写的前置关卡）。

---

## 批量模式执行步骤（`--batch` / `--all`）

> **适用场景**：所有 Feature 的 `spec.md` 已就绪，需要一次性为所有 Feature 并行生成 `plan.md`。
> **与 featurespec --batch 的关键区别**：无需顺序创建目录（目录已由 featurespec 创建），可**完全并行**从第一步开始。

### B-1. 加载 EPIC 上下文与共享约束

定位 EPIC 路径（从 `$ARGUMENTS` 中提取 EPIC 标识，或通过 `SPECIFY_EPIC` 推导）：

```powershell
.specify/scripts/powershell/get-epic-paths.ps1 -EpicId "EPIC-xxx" -Json
```

解析 `EPIC_DIR`，遍历 `EPIC_DIR/features/` 获取所有 Feature 目录，验证每个 Feature 下 `spec.md` 存在。若某 Feature 缺少 `spec.md`，将其标记为跳过并提示用户先运行 `/aisdd.featurespec`。

**加载共享文档（一次性，所有子 Agent 共用）**：

| 文档 | 路径 | 用途 |
|------|------|------|
| `epic-plan.md` | `EPIC_DIR/epic-plan.md`（若存在） | EPIC 级技术约束与规约，各 Feature plan 不得违反 |
| `ux-design.md` | `EPIC_DIR/ux-design.md`（若存在） | 交互规则与视觉规范，作为 plan 的 UI 约束输入 |
| `constitution.md` | `.specify/memory/constitution.md` | MUST 条款约束 |
| `plan-template.md` | `.specify/templates/plan-template.md` | 输出模板与章节结构 |

**从 epic.md Feature 拆分列表**提取各 Feature 的依赖关系，构建依赖图，判断是否存在跨 Feature 能力依赖（即 Feature A 的 plan 需消费 Feature B 的能力边界）。

### B-2. 依赖感知的并行策略

根据 Feature 间依赖关系，选择执行策略：

**情况 A：无跨 Feature 接口依赖**（各 Feature 独立）

→ 所有 Feature 完全并行生成，进入 B-3。

**情况 B：存在 Owner-Consumer 依赖**（如 Capability Feature 被 Product Feature 消费）

→ 采用两波并行：

```
第一波（并行）：生成所有 Capability Feature 的 plan.md（Owner 先完成）
第二波（并行）：生成所有 Product Feature 的 plan.md（Consumer 可读取 Owner 能力边界）
```

向用户说明执行策略选择原因后继续。

> 注：若 epic.md 中依赖关系不明确，默认按情况 A（完全并行）处理，由 B-4 的能力边界检查捕获不一致。

### B-3. 完全并行生成所有 Feature 的 plan.md

**优先使用 Agent 工具并行执行**：为每个 Feature 同时启动一个独立子 Agent。

每个子 Agent 的任务描述模板：

```
你是专注于单一 Feature 轻量技术规约生成的子 Agent，只做一件事：生成指定 Feature 的 plan.md。

共享 EPIC 约束（只读）：
  epic-plan.md 摘要: [EPIC 级技术约束：技术栈/分层规则/NFR 预算框架/共享能力识别/错误码规范]
  ux-design.md 摘要: [与本 Feature 相关的交互规则与视觉规范（按 Feature 过滤）]
  constitution MUST 条款: [演进式设计/差距分析/最小改动/模板保护]

你负责的 Feature：
  FEATURE_ID:   [FEAT-xxx]
  FEATURE_DIR:  [绝对路径]
  SPEC_FILE:    [绝对路径]（已存在，请读取）
  PLAN_FILE:    [FEATURE_DIR/plan.md]（输出目标）
  Feature 类型: Product / Capability
  依赖的 Owner Feature（若有）: [FEAT-yyy 的能力边界摘要，由主 Agent 注入]

执行步骤：
1. 读取 SPEC_FILE（提取 FR/NFR/AC/依赖/核心实体）
2. 读取 .specify/templates/plan-template.md
3. 读取现有工程代码中与本 Feature 相关的模块（差距分析：可复用/需扩展/需新增）
4. 按模板填充 PLAN_FILE（规则见下方）
5. 返回：{ feature_id, plan_file, plan_version, status, ability_boundaries: [...], nfr_allocations: {...} }

plan.md 填写规则：
- Plan Version: v0.1.0
- 必须在 epic-plan.md 约束下展开，不得违反 EPIC 规约
- Plan 前置检查：验证 EPIC 级规约遵从、共享能力依赖、是否适用 Lite 填法
- §一 规约摘要：Feature 目标、适用档位、EPIC 约束来源、现有代码边界、关键技术决策
- §二 Feature 增量约束：只写相对 epic-plan 或现有工程默认规则的增量
- §三 能力边界与外部依赖：只写能力级承诺与调用约束，不写方法签名/DTO 字段
- §四 数据、NFR 与安全硬约束：只写 SoR、生命周期、规模、NFR、安全等约束，不写表结构/字段/索引
- §五 Design 输入清单：列出后续 epicdesign 必须展开的设计点，不在 plan 阶段提前设计
- §六 待确认问题：记录影响设计或实现的未决事项
- 禁止在 plan.md 中输出架构图、类图、时序图、流程图、Story 拆解、L2 设计、接口方法签名、数据库表字段、埋点字段
```

**降级方案**（若 Agent 工具不可用）：按依赖拓扑顺序（Owner 先）顺序生成每个 Feature 的 plan.md，逻辑与子 Agent 任务一致。

收集所有子 Agent 返回结果，汇总 `ability_boundaries` 和 `nfr_allocations` 供 B-4 使用。失败的 Feature 记录错误原因，不阻塞其他 Feature。

### B-4. 跨 Feature 能力边界与 NFR 预算检查

所有 plan.md 生成完成后，执行**跨 Feature 一致性快速检查**（比 featurespec 的检查更侧重技术层面）：

| 检查项 | 说明 | 级别 |
|--------|------|------|
| **能力边界对齐** | Capability Feature（Owner）§三声明的能力边界，与 Product Feature（Consumer）§三引用的依赖是否对齐（能力覆盖、约束规则一致） | BLOCK |
| **NFR 预算合计** | 各 Feature 的性能/内存/功耗 NFR 分配之和是否超出 epic-plan.md §六 的 EPIC 级预算上限 | BLOCK |
| **增量约束一致性** | 各 Feature §二 的增量约束是否与 epic-plan.md 的公共约束一致 | WARN |
| **共享能力重复设计** | 是否有多个 Feature 各自实现了相同能力（而非引用同一 Owner） | WARN |
| **数据 SoR 冲突** | 多个 Feature 是否对同一数据声明了不同权威来源或生命周期 | WARN |
| **错误处理原则统一** | 各 Feature 的错误/降级约束是否符合 epic-plan.md 统一原则 | WARN |

输出快速检查结果（不超过 20 条）：

```markdown
### 批量生成后能力边界与 NFR 检查

| ID | 级别 | 涉及 Feature | 问题 | 建议 |
|----|------|-------------|------|------|
```

> 此为快速检查，完整对抗性挑战（三视角深度检测）请运行 `/aisdd.challenge plan`。

### B-5. 完成报告

```markdown
## 批量生成完成报告

**EPIC**：EPIC-xxx - [名称]
**生成日期**：YYYY-MM-DD
**Feature 数量**：N 个（成功 X / 跳过 Y（缺 spec.md）/ 失败 Z）
**执行策略**：完全并行 / 两波并行（Owner→Consumer）

### 生成结果

| Feature | 类型 | 状态 | plan.md | Plan Version | 能力边界数 |
|---------|------|------|---------|-------------|-----------|
| FEAT-001 | Capability | ✅ | [路径] | v0.1.0 | 2 |
| FEAT-002 | Product | ✅ | [路径] | v0.1.0 | — |

### 能力边界与 NFR 检查摘要

- BLOCK: X 条（须修复后进入下一阶段）
- WARN: X 条（建议评估）

### NFR 预算概览

| NFR 维度 | EPIC 上限 | 各 Feature 分配总和 | 状态 |
|---------|---------|-----------------|------|
| 性能（启动时间/响应延迟）| ... | ... | ✅/⚠️/❌ |
| 内存 | ... | ... | ✅/⚠️/❌ |

### 下一步建议

1. **（推荐）** `/aisdd.challenge plan` — 三视角对抗性质量挑战，多 Feature EPIC 强烈推荐
2. 需深度跨 Feature 分析：`/aisdd.epicanalyze`
3. 所有 plan 确认无误后：`/aisdd.gate plan-ready`
```

---

## 单 Feature 模式执行步骤（默认）

目标：生成 `plan.md`（Feature 轻量技术规约）。

**plan.md 的定位**：Feature 轻量技术规约（增量约束/能力边界/数据与 NFR 硬约束/待确认项）。系统设计（架构图、类图、时序图、Story 拆解、L2 详细设计、接口字段、表结构、埋点字段）由后续 `/aisdd.epicdesign` 阶段在 EPIC 级统一产出。

**方案设计的输入（必须考虑）**：**spec 需求**（spec.md）与 **EPIC 级设计稿解析结果**（`specs/epics/<EPIC>/ux-design.md`，由 `/aisdd.epicuidesign` 从交互稿/视觉稿中提取的结构化交互逻辑与视觉规范）。若 epicuidesign 未执行则仅以 spec 为输入。

建议：在 **EPIC 分支** 执行，并确保已通过 `SPECIFY_FEATURE` 选中目标 Feature。

### 1. 环境搭建

从代码库根目录运行 `.specify/scripts/powershell/setup-plan.ps1 -Json`，解析 JSON 得到：
- `FEATURE_SPEC`（spec.md 路径）
- `IMPL_PLAN`（plan.md 路径）
- `SPECS_DIR`、`BRANCH`、`UX_DESIGN`、`DESIGN_DIR`
- `EPIC_PLAN`（在 EPIC 工作流下为 **EPIC 级** epic-plan.md 路径，若存在）

### 2. 加载上下文

- 读取 `FEATURE_SPEC`（提取：Epic/Feature 元信息、FR/NFR、验收与边界场景、依赖）——**spec 需求**为方案设计的主要输入。
- 若 `EPIC_PLAN` 存在（**EPIC 级** epic-plan.md）：读取 epic-plan.md，提取 **EPIC 级技术约束与规约**；技术规约须在其约束下展开，不得违反 EPIC 规约。
- 若 `UX_DESIGN` 存在：读取 ux-design.md（设计稿解析结果），提取信息架构、交互规则（含页面流转图、逐屏交互规则）、视觉规范（色板、布局标注、组件清单）、设计稿索引（按所属 Feature 过滤）；关注「遗漏与待确认」章节中与本 Feature 相关的未覆盖场景。
- 若 `EPIC_DIR/research/` 存在且非空：扫描与本 Feature 相关的调研报告（`/aisdd.research --save` 产出）作为**参考性补充信息**——了解 API 限制、库评估、风险等技术背景；调研报告**不是约束源或结论**，plan 仍须独立完整分析并做出自己的技术决策。
- 读取 `.specify/memory/constitution.md`（提取 MUST/SHOULD 约束，作为 Plan 关卡）
- 读取 `.specify/templates/plan-template.md`（作为结构与输出格式）
- 注意：plan.md 不产出图表；若发现需要类图、时序图、流程图或表结构，记录到“Design 输入清单”，交由 `/aisdd.epicdesign` 展开。

### 3. 填充 plan.md 内容

按 plan-template.md 模板填充以下内容：

- **Plan 前置检查**：验证 EPIC 级规约遵从、共享能力依赖
- **轻量技术规约**：
  - 一、规约摘要
  - 二、Feature 增量约束
  - 三、能力边界与外部依赖
  - 四、数据、NFR 与安全硬约束
  - 五、Design 输入清单
  - 六、待确认问题

### 4. 写入 `IMPL_PLAN`

覆盖写入 plan.md。

### 5. 可选：更新 Agent 上下文

（若项目使用该能力）：
- 运行 `.specify/scripts/powershell/update-agent-context.ps1 -AgentType cursor-agent`

### 6. 完成报告

输出：
- `plan.md` 路径
- Plan Version
- 已生成的章节清单
- **下一步提示**：若所有 Feature plan 已完成 → 建议运行 **`/aisdd.challenge plan`**（多 Feature EPIC 推荐）→ `/aisdd.gate plan-ready`（审批关卡）→ `/aisdd.epicdesign` 产出 EPIC 软件设计说明书（含架构图、Story 拆解）+ 各 Feature 的 `l2_design/ST-xxx_*.md`（L2 设计）

---

## 核心规则

- **Plan 禁止详细设计**：不得在 plan.md 中输出架构图、类图、时序图、流程图、Story 拆解、L2 设计、接口方法签名、数据库表字段、埋点字段；发现需要设计的内容写入“Design 输入清单”
- **EPIC 规约遵从**：plan.md 的技术规约不得违反 epic-plan.md 的约束
- **差距分析优先**（constitution 要求）：设计前须将每条 FR/NFR 映射到现有模块，明确可复用、需扩展、需新增的边界
- 执行主体：**SE/TL（或架构师）**。开发者应将 `plan.md` 视为只读输入；如需变更必须提交变更提案。
- Plan 的技术规约是后续 EPIC 设计说明书与 Implement 阶段的约束输入之一。
