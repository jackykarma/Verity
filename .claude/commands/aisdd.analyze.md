---
description: "【可选】一致性与质量分析（只读，非阻塞）。scope=feature / epic / epic pre-tasks；不 gate featuretasks 或 implement。"
handoffs:
  - label: 修复 EPIC 级发现
    agent: aisdd.cr
    prompt: 根据 epic 分析报告中的 CRITICAL/HIGH 项发起变更请求并更新下游产物
    send: false
---

## 用户输入

```text
$ARGUMENTS
```

在继续操作前，你**必须**参考用户输入（若不为空）。

## 可选性（强制）

- **全流程可选**：`feature` / `epic` / `epic pre-tasks` **均不是** `featuretasks`、`implement` 或 EPIC 交付的**必经步骤**。
- **不阻塞实现**：用户**未运行**本命令也可直接 `/aisdd.implement`；不得以「未 analyze」为由拒绝进入实现。
- **报告不自动拦截**：即使存在 CRITICAL，也仅**建议**修复；是否继续 implement 由用户决定（须在报告末尾确认）。
- **裁剪**：单 Feature EPIC、Fast Track（≤3 人天）可**跳过全部** analyze；多 Feature 仅在团队需要加严质量时选用。

## 分析范围（scope）

| scope | 用法示例 | 分析对象 | 典型时机 |
|-------|----------|----------|----------|
| **feature**（默认） | `/aisdd.analyze`、`/aisdd.analyze FEAT-001` | 当前 Feature 的 `spec.md`、`tech-spec.md`、`tasks.md` | **可选**；若运行，宜在 `tasks.md` 就绪后、`implement` 前 |
| **epic** | `/aisdd.analyze epic`、`/aisdd.analyze EPIC-002` | `epic.md`、`tech-spec.md`、`epic-design.md`、子设计文件、各 Feature 的 spec/plan/tasks/l2 | **可选**；多 Feature 时可在全部 `tasks.md` 完成后做全量复核 |
| **epic pre-tasks** | `/aisdd.analyze epic pre-tasks` | 同上，但**不要求**各 Feature 已有 `tasks.md` | **可选**；`epicdesign` 后、`featuretasks` 前 |

**判定规则**（按优先级）：

1. 含 `pre-tasks`（与 `epic` 联用）→ epic 模式且不校验 tasks
2. 含 `epic` 或匹配 `EPIC-\d+` → epic 模式
3. 否则 → **feature** 模式（沿用 `check-prerequisites.ps1` 解析的当前 Feature）

**与 `/aisdd.challenge` 的区别**：`challenge` 为对抗性挑漏洞；`analyze` 为工件间映射、术语、契约与章程的一致性检查。

## 操作约束（共用）

**严格只读**：不修改任何文件。输出结构化 Markdown 报告（不写入文件）。整改方案须用户明确批准后再由其他命令执行。

**章程权威性**：`.specify/memory/constitution.md` **不可协商**；违反 MUST 一律 **CRITICAL**。

---

## Feature 范围（scope = feature）

### 运行本命令时的输入要求（非流程门禁）

用户**选择运行** feature 分析时，须已有完整 `tasks.md`（通常由 `/aisdd.featuretasks` 产出）；缺失则终止并提示先补 tasks——**这不表示** workflow 必须先跑 analyze。

### 1. 初始化

从仓库根运行：

```powershell
.specify/scripts/powershell/check-prerequisites.ps1 -Json -RequireTasks -IncludeTasks
```

解析 `FEATURE_DIR`、`FEATURE_SPEC`、`IMPL_PLAN`、`TASKS`。任一缺失则终止并提示补全前置命令。

### 2. 加载工件（渐进式披露）

- **spec.md**：概述、FR/NFR、AC、完整场景矩阵（若有）
- **tech-spec.md**：EPIC 与各 Feature 技术规约
- **tasks.md**：Task ID、描述、阶段、[P]、设计引用、[ST-xxx]
- **constitution.md**

### 3. 语义模型（内部）

需求清单、任务覆盖映射、章程规则集（输出中不粘贴原文）。

### 4. 检测（最多 50 条发现）

| 类别 | 内容 |
|------|------|
| A 重复项 | 近似重复 FR/表述 |
| B 模糊性 | 不可量化形容词、未解决占位符 |
| C 描述不充分 | 无对象的需求、AC 不对齐、任务引用未定义组件 |
| D 章程一致性 | 违反 MUST、缺失强制章节 |
| E 覆盖缺口 | 无任务的需求、无需求映射的任务、NFR 无任务体现 |
| F 不一致性 | 术语漂移、实体矛盾、任务顺序矛盾、技术栈冲突 |

### 5. 严重程度

CRITICAL / HIGH / MEDIUM / LOW（章程违规、缺失核心工件、无覆盖需求 → CRITICAL）。

### 6. 报告格式

```markdown
## Feature 规格分析报告

**Feature**：FEAT-xxx
**EPIC**：（若可知）

| ID | 类别 | 严重程度 | 位置 | 摘要 | 建议 |
|----|------|----------|------|------|------|

**覆盖情况汇总** | **章程问题** | **未映射任务** | **指标**（需求数、任务数、覆盖率等）
```

### 7. 后续行动

- CRITICAL → **建议**修复；用户明确接受风险时可继续 `/aisdd.implement`（报告须记录该决定）
- 多 Feature EPIC → **可选**再运行 `/aisdd.analyze epic`；**不得**暗示为 implement 前置必做

---

## EPIC 范围（scope = epic）

### 前置条件

- `epic-design.md` 应已产出（至少 **story** 阶段）
- **默认**：各 Feature 已有 `tasks.md` 时做含 Task 的全量检测
- **`pre-tasks`**：仅要求各 Feature 有 `spec.md`、`tech-spec.md`（及已产出的设计子文件）

### 1. 定位 EPIC

```powershell
.specify/scripts/powershell/get-epic-paths.ps1 -EpicId "EPIC-xxx" -Json
```

解析 `EPIC_DIR`，遍历 `features/*/。

### 2. 加载 EPIC 级产物

`epic.md`、`tech-spec.md`（或单 Feature 时合并 plan）、`epic-design.md`、`nfr.md`、`interface-design.md`、`database-design.md`、`analytics-tracking.md`、`ux-design.md`（按存在性）、`constitution.md`。

### 3. 加载各 Feature 产物

对每个 Feature：`spec.md`、`tech-spec.md`、`tasks.md`（非 pre-tasks 且存在时）、`l2_design/ST-xxx_*.md`（若有）。

### 4. 检测（最多 60 条发现）

| 类别 | 内容 |
|------|------|
| A 术语一致性 | 跨 Feature / 与 tech-spec 术语统一 |
| B 接口契约 | Owner plan §三 与消费方引用、错误码体系 |
| C NFR 量化 | spec NFR ↔ `nfr.md` 评估结论 |
| D 共享能力 | epic.md 技术策略 ↔ tech-spec 第一部分 ↔ Owner/Consumer Feature 节 |
| E Story 与覆盖 | FR/NFR 覆盖矩阵、Story 依赖无环、ST 与 tasks/l2 一致 |
| F 架构一致性 | 分层约束、模块归属、类图与 L2 一致 |
| G 版本与变更 | Version 对齐、变更记录是否级联 |
| H 章程合规 | Plan 前置检查、MUST 违规 |

**pre-tasks 模式**：跳过 E 中与 `tasks.md` 强相关的行（标注 N/A：tasks 未生成）。

### 5. 报告格式

```markdown
## EPIC 跨 Feature 分析报告

**EPIC**：EPIC-xxx - [名称]
**模式**：全量 / pre-tasks
**产物覆盖**：epic.md ✅ | tech-spec.md ✅/❌ | …

| ID | 类别 | 严重程度 | 涉及 Feature | 位置 | 摘要 | 建议 |

### NFR 验证汇总（spec ↔ nfr.md）
### 共享能力覆盖
### Story 覆盖矩阵（跨 Feature）
### 指标 + EPIC 健康度（A～F）
```

### 6. 后续行动

- CRITICAL → **建议**修复项及命令（`/aisdd.cr` 等）；**不阻塞** implement
- 单 Feature EPIC → 注明可跳过 epic 分析

---

## 可选参考顺序（多 Feature EPIC，质量加码时用）

```text
/aisdd.epicdesign 完成
  → /aisdd.featuretasks（各 Feature）     ← 必经
  → /aisdd.implement                    ← 必经（analyze 可全程跳过）

可选插入（任意一步均可省略）：
  /aisdd.analyze epic pre-tasks
  /aisdd.analyze epic
  /aisdd.analyze（各 Feature）
```

## 操作原则

- 高价值、低 token；发现表行数上限见各 scope
- 无问题时输出成功摘要与覆盖统计
- 禁止虚构缺失章节

## 上下文

$ARGUMENTS
