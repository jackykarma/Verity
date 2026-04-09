---
description: "实现验证：在 implement 完成（全部或按阶段）后运行，独立验证代码实现是否符合 spec 的 FR/NFR/AC、plan 的技术规约、epic-design 的架构设计与 各 Feature `l2_design/ST-xxx_*.md` 的 L2 详细设计。支持三级验证模式（Story 级 / Feature 级 / EPIC 级），EPIC 级使用并行子 Agent ���速。严格只读（不修改设计文档），但会标记 tasks.md 中的验证结果。"
handoffs:
  - label: 提交变更请求（发现偏离时）
    agent: aisdd.cr
    prompt: 实现偏离设计时，可说明要更新的 plan/design 范围由 AI 更新，或提交 CR
    send: false
  - label: 通过审批关卡
    agent: aisdd.gate
    prompt: implement-done 关卡——验证通过后合并/发布
    send: true
---

## 用户输入

```text
$ARGUMENTS
```

在继续操作前，你**必须**参考用户输入（若不为空）。

**参数解析（最先执行）**：

| 参数格式 | 验证层级 | 说明 |
|---------|----------|------|
| `story ST-001` | **L1 Story 级** | 验证单个 Story |
| `story ST-001,ST-002` | **L1 Story 级** | 验证多个 Story |
| `feat FEAT-001` | **L2 Feature 级** | 验证单个 Feature 的全部 Story |
| `feat FEAT-001,FEAT-002` | **L2 Feature 级** | 验证多个 Feature |
| 无参数 / `epic` | **L3 EPIC 级** | 全量验证（默认） |
| `--quick` | 附加标志 | 快速模式：跳过架构维度，仅验证接口 + 行为（加速 30%～50%） |
| `--save` | 附加标志 | 将报告写入文件（`EPIC_DIR/verify-report-<YYYYMMDD>.md`） |

示例：`/aisdd.verify story ST-001`、`/aisdd.verify feat FEAT-001 --quick`、`/aisdd.verify --save`

---

## 进入本阶段前（Gate 提醒）

在执行下方步骤**之前**，你**必须**：

1. **提醒用户**核对：进入 **implement** 前应已通过 **tasks-ready**（见 `gate-log.md`）；若缺失记录，须提示补跑 `/aisdd.gate tasks-ready` 或说明本次验证为阶段性抽检。
2. **验证完成后**，须**提醒**用户：在结论可接受时运行 `/aisdd.gate implement-done` 关闭实现阶段关卡。

**本命令关联的关卡**：**tasks-ready**（实现前基线）→ 验证 → **implement-done**（通过后合并/发布）。

---

## 目标

在 `/aisdd.implement` 执行完毕（全部或部分阶段）后，**独立验证**代码实现是否与设计方案一致。这是一个**独立于实现者的验证视角**，避免实现过程中的"自我确认偏差"。

**与 implement 步骤 9 的区别**：
- implement 步骤 9 是实现者自验（同一 AI 上下文）
- verify 是独立验证（新的上下文，重新读取设计文档与代码，逐项对照）

---

## 三级验证模式

### L1 Story 级（快速增量）

> **适用时机**：完成一个或几个 Story 的实现后，立即做增量验证，不必等到全部完成。

- **验证维度**：接口契约 + 行为一致性 + FR/NFR 覆盖（该 Story 涉及的 FR）
- **跳过维度**：全量架构扫描（代价高、L2/L3 统一处理）
- **加载范围**：仅该 Story 的 `l2_design/ST-xxx_<slug>.md`、相关 `plan.md` 章节
- **输出**：轻量 Story 验证卡（pass/fail + 偏离摘要）
- **适合场景**：边实现边验证，发现问题早修早止

### L2 Feature 级（完整单 Feature）

> **适用时机**：一个 Feature 的全部 Story 实现完成后，做 Feature 级全维度验证。

- **验证维度**：全部 5 个维度（架构 + 接口 + 行为 + FR/NFR + 技术规约）
- **加载范围**：该 Feature 的全部设计文档
- **输出**：Feature 验证报告（含 FR/NFR 覆盖矩阵）
- **适合场景**：Feature 交付前的完整质量门控

### L3 EPIC 级（全量并行，默认）

> **适用时机**：所有 Feature 实现完成，做 EPIC 级全量验证后再申请 gate implement-done。

- **验证维度**：全部 5 个维度 + 跨 Feature 架构一致性
- **加载范围**：所有设计文档
- **执行策略**：**优先使用 Agent 工具并行**，为每个 Feature 启动独立子 Agent
- **输出**：EPIC 验证报告（含各 Feature 摘要 + 跨 Feature 一致性）
- **适合场景**：合并主分支前的最终质量门

---

## 操作约束

- **设计文档只读**：不修改 spec/plan/epic-design/l2_design（各 ST 文件）的内容
- **可标记 tasks.md**：在 tasks.md 中对已验证的 Task 追加验证结论标注
- **发现偏离时**：输出偏离报告，建议提交 CR 或回退实现，**不自动修改代码**
- **`--save` 时写报告**：写入 `EPIC_DIR/verify-report-<YYYYMMDD>.md`，格式同输出报告

---

## 执行步骤

### 1. 环境搭建与参数解析

从代码库根目录运行：

```powershell
.specify/scripts/powershell/get-epic-paths.ps1 -EpicId "EPIC-xxx" -Json
```

解析 `EPIC_DIR`、`HAS_EPIC_PLAN`、`EPIC_PLAN`、Feature 列表。

**确定验证层级与范围**：

- 从 `$ARGUMENTS` 中提取：层级关键字（`story` / `feat` / `epic` / 无）、范围标识（`ST-xxx` / `FEAT-xxx`）、标志（`--quick` / `--save`）
- **L1**：解析 Story ID 列表，定位其所属 Feature 与 `l2_design/ST-xxx_*.md`
- **L2**：解析 Feature ID 列表，遍历各 Feature 下 tasks.md 中所有 Story
- **L3**：遍历所有 Feature（`EPIC_DIR/features/*/`），收集全量 Story 列表

**快速模式**（`--quick`）：标记跳过架构一致性维度与技术规约遵从维度。

### 2. 加载设计基线

根据验证层级按需加载（不加载无关文档）：

| 文档 | L1 Story 级 | L2 Feature 级 | L3 EPIC 级 |
|------|-------------|---------------|------------|
| `l2_design/ST-xxx_*.md`（目标 Story） | ✅ | ✅ | ✅ |
| `plan.md`（目标 Feature） | ✅（相关章节）| ✅ | ✅ |
| `spec.md`（目标 Feature） | ✅（目标 FR/NFR） | ✅ | ✅ |
| `epic-design.md`（架构章节） | ❌（跳过） | ✅ | ✅ |
| `epic-plan.md` | ❌ | ✅（若存在） | ✅（若存在） |
| 其他 Feature 的设计文档 | ❌ | ❌ | ✅ |

### 3A. L1 Story 级验证

对每个目标 Story（ST-xxx）：

**3A-1 接口契约验证**
- 读取该 Story 的 `l2_design/ST-xxx_*.md` 中涉及的类图与接口定义
- 定位代码中对应的类/函数，对比方法签名（参数类型、返回类型、可见性）
- 检查数据模型字段是否与 plan.md §三 的定义一致

**3A-2 行为一致性验证**
- 读取该 Story 的 `l2_design/ST-xxx_*.md` 的时序图与触发条件表格
- 追踪代码中的核心调用链，对照时序图每一跳
- 检查 `alt/else` 分支是否均有对应实现

**3A-3 FR 覆盖验证（轻量）**
- 仅验证该 Story 的 FR/AC 覆盖（从 spec.md 中按 Story 映射关系过滤）
- 对无代码对应的 FR 标记「⚠️ 未发现实现」

**3A-4 输出 Story 验证卡**

```markdown
#### ST-xxx 验证卡（L1 Story 级）

- **接口契约**：✅/❌ [一句说明]
- **行为一致性**：✅/❌ [一句说明]
- **FR 覆盖**：✅/⚠️/❌ [覆盖 X/Y 条 FR]
- **结论**：通过 / 有偏离（偏离 ID：V-xxx）
```

### 3B. L2 Feature 级验证

对目标 Feature（FEAT-xxx）的全部 Story，先执行 3A 的全部检查，**另加**：

**3B-1 架构一致性验证**（除非 `--quick`）
- 代码的包/模块结构是否与 `epic-design.md` §2（1 层架构）一致
- 类的分层是否符合 `plan.md` §二 的依赖方向
- 全景类图（`key-diagram-epic.md`）与各 Feature `key-diagram.md` 中定义的类是否均已实现
- 代码中新增但设计未定义的**核心类**是否有说明（辅助类可豁免）

**3B-2 技术规约遵从验证**（除非 `--quick`）
- 线程/并发模型：IO 操作是否在 `Dispatchers.IO`，UI 回调是否在主线程
- 日志与可观测性：关键链路是否有 log 打点
- 命名规范：是否与架构模块划分一致

**3B-3 NFR 量化评估**
- 对 spec.md NFR 中可静态评估的项（如 Room 查询是否加索引、是否有���存泄漏风险）进行代码层扫描
- 运行时 NFR（如响应时间、启动时间）标记为「⚠️ 需运行时验证」

### 3C. L3 EPIC 级验证（并行子 Agent）

> **优先使用 Agent 工具并行执行**：为每个 Feature 启动独立子 Agent 执行 L2 验证，主 Agent 汇总结果并执行跨 Feature 检查。

**每个子 Agent 任务描述模板**：

```
你是专注于单一 Feature 验证的子 Agent，只做一件事：验证 FEAT-xxx 的实现是否符合设计。

验证目标：
  FEATURE_ID:  [FEAT-xxx]
  FEATURE_DIR: [绝对路径]
  验证模式:    L2 Feature 级（含架构维度）
  快速模式:    [true/false]（是否跳过架构 + 技术规约）

输入文档（已由主 Agent 提供路径，请读取）：
  spec.md:                [路径]
  plan.md:                [路径]
  epic-design.md（架构）: [路径]
  l2_design/ST-xxx_<slug>.md: [路径（各 Story）]
  tasks.md:               [路径]
  epic-plan.md:           [路径（若存在）]

执行：按 L2 Feature 级验证步骤（3A + 3B）逐 Story 验证。

返回：
{
  feature_id: "FEAT-xxx",
  stories_verified: N,
  deviations: [{ id, story, dimension, severity, expected, actual, suggestion }],
  fr_nfr_matrix: [{ id, story, code_status, conclusion }],
  overall: "pass" | "pass_with_warn" | "fail"
}
```

**降级方案**（若 Agent 工具不可用）：按 Feature 依次执行 L2 验证，逻辑与子 Agent 任务一致。

**主 Agent 汇总后执行跨 Feature 检查**：

| 检查项 | 说明 | 级别 |
|--------|------|------|
| **跨 Feature 架构依赖方向** | Consumer Feature 代码是否通过正确接口调用 Owner Feature，无直接 impl 依赖 | BLOCK |
| **共享模块单一实现** | 是否有多个 Feature 各自实现同一能力（而非引用同一模块） | WARN |
| **数据模型跨 Feature 一致性** | 同名 Entity 在多 Feature 代码中字段是否一致 | WARN |
| **错误码唯一性** | 跨 Feature 是否有重复错误码 | WARN |

### 4. 生成验证报告

输出 Markdown 格式报告（若含 `--save` 则同时写入文件）：

```markdown
## 实现验证报告

**EPIC**：EPIC-xxx - [名称]
**验证日期**：YYYY-MM-DD
**验证层级**：L1 Story 级 / L2 Feature 级 / L3 EPIC 级
**验证范围**：全量 / ST-001,ST-002 / FEAT-001
**快速模式**：是 / 否
**Task 总数**：X（已验证 Y / 跳过 Z）

---

### 验证摘要

| 验证维度 | 通过 | 偏离 | 未验证 | 通过率 |
|----------|------|------|--------|--------|
| 架构一致性 | X | Y | Z | % |
| 接口契约 | X | Y | Z | % |
| 行为一致性 | X | Y | Z | % |
| FR/NFR 覆盖 | X | Y | Z | % |
| 技术规约遵从 | X | Y | Z | % |
| **合计** | X | Y | Z | **%** |

---

### 偏离清单（按严重程度排序）

| ID | Story | Feature | 验证维度 | 严重程度 | 设计期望 | 实际实现 | 建议操作 |
|----|-------|---------|----------|----------|----------|----------|----------|
| V001 | ST-001 | FEAT-001 | 接口契约 | 阻塞 | plan.md:§四 ... | 实际代码 ... | 修改代码 / 提交 CR |

---

### Feature 级验证摘要（L3 专属）

| Feature | Story 数 | 偏离数 | BLOCK | WARN | 整体结论 |
|---------|---------|--------|-------|------|----------|
| FEAT-001 | X | Y | 0 | 2 | ⚠️ 有警告 |
| FEAT-002 | X | 0 | 0 | 0 | ✅ 通过 |

---

### Story 级验证详情

#### ST-001：[标题]（FEAT-xxx）

- **架构**：✅/❌/⏭️（快速模式跳过）[说明]
- **接口**：✅/❌ [说明]
- **行为**：✅/❌ [说明]
- **FR/NFR**：✅/❌/⚠️ [说明]
- **技术规约**：✅/❌/⏭️（快速模式跳过）[说明]
- **整体结论**：通过 / 有偏离待修复（V001, V002）

---

### FR/NFR 覆盖矩阵

| FR/NFR ID | 所属 Feature | 覆盖 Story | 代码实现状态 | 验证结论 |
|-----------|-------------|-----------|-------------|----------|
| FR-001 | FEAT-001 | ST-001 | 已实现 | ✅ |
| NFR-PERF-001 | FEAT-002 | ST-003 | 未可静态验证 | ⚠️ 需运行时验证 |

---

### 综合评级

| 评级 | 条件 |
|------|------|
| ✅ 可进入 gate implement-done | 0 BLOCK，WARN ≤ 3 |
| ⚠️ 建议修复后进入 gate | 0 BLOCK，WARN > 3 |
| ❌ 存在阻塞偏离 | BLOCK ≥ 1 |

**本次评级**：[✅ / ⚠️ / ❌] — [一句话说明]
```

### 5. 偏离分类与建议

对每个偏离项分类：

- **代码偏离（应修复代码）**：实现未遵循设计，设计是正确的 → 建议修改代码以匹配设计
- **设计缺口（应补充设计）**：实现中发现设计遗漏，实现是合理的 → 建议提交 CR，补充对应 `l2_design/ST-xxx_*.md` 或 plan.md
- **设计与实现均需调整**：双方都有问题 → 建议提交 CR，同时更新设计与代码
- **可接受偏差**：细节不同但不影响功能正确性 → 记录为已知偏差，无需修改

### 6. 标记 tasks.md 验证结果

对 tasks.md 中已验证的 Task，在其验证子项中追加结论：

```markdown
- **验证**：
  - [x] 接口契约：通过
  - [x] 行为一致性：通过
  - [ ] 架构一致性：偏离（V001）
  - [x] FR/NFR 覆盖：通过（3/3 FR）
```

### 7. 完成报告

输出：
- 整体通过率与综合评级
- 阻塞性偏离数量（BLOCK）
- 建议下一步：
  - 若无阻塞性偏离 → `/aisdd.gate implement-done`
  - 若有阻塞性偏离 → 修复后重新运行 `/aisdd.verify [原范围]`（增量重验）
  - 若有设计缺口 → 使用 `/aisdd.cr` 提交变更，更新设计后重新验证
  - 若使用了 `--save` → 提示报告已写入 `verify-report-<date>.md`

---

## 验证原则

- **设计为准**：除非发现设计明显有误，否则以设计文档为判定基准
- **不越权**：verify 不修改设计文档，只报告偏离
- **可重复**：相同输入应产出一致结论
- **分层验证**：架构 → 接口 → 行为 → FR/NFR → 技术规约，由粗到细
- **实事求是**：对无法静态验证的项（如运行时性能）标记为「需运行时验证」，不做推测
- **增量友好**：L1 Story 级验证可在实现过程中随时运行，不必等全量完成

---

## 推荐执行模式

**边实现边验证（推荐）**：

```
实现 ST-001 → /aisdd.verify story ST-001
实现 ST-002 → /aisdd.verify story ST-002
……
FEAT-001 全部 Story 完成 → /aisdd.verify feat FEAT-001
所有 Feature 完成 → /aisdd.verify --save → /aisdd.gate implement-done
```

**快速通道（小 EPIC / 单 Feature）**：

```
全部实现完成 → /aisdd.verify --quick --save → /aisdd.gate implement-done
```

---

## 与现有命令的关系

| 命令 | 职责 | 与 verify 的关系 |
|------|------|-----------------|
| `/aisdd.implement` | 执行实现 | verify 在 implement 完成后运行 |
| `/aisdd.analyze` | 分析 spec↔plan↔tasks 文档一致性 | verify 分析代码↔设计一致性 |
| `/aisdd.challenge design` | 对抗性挑战设计质量 | verify 之前的设计阶段质量门 |
| `/aisdd.gate implement-done` | verify 通过后可运行 implement-done 关卡 | verify 是其前置 |
| `/aisdd.cr` | 变更请求 | verify 发现偏离时触发 CR 流程 |
