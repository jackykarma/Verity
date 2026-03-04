---
description: "EPIC 级跨 Feature 一致性与质量分析。在 EPIC 软件设计说明书及各 Feature tasks.md 产出后运行，检测跨 Feature 的术语漂移、接口契约冲突、NFR 预算超支、共享能力不一致、Story 依赖完整性等问题。严格只读，不修改任何文件。"
handoffs:
  - label: 更新 EPIC 技术规约
    agent: speckit.epicplan-update
    prompt: 修复 EPIC 级技术规约中发现的问题
    send: false
  - label: 更新 EPIC 设计说明书
    agent: speckit.epicdesign-update
    prompt: 修复设计说明书中发现的跨 Feature 问题
    send: false
  - label: 更新 Feature plan
    agent: speckit.plan-update
    prompt: 修复某 Feature plan 中发现的问题
    send: false
---

## 用户输入

```text
$ARGUMENTS
```

在继续操作前，你**必须**参考用户输入（若不为空）。可用于：**EPIC 标识**（如 `EPIC-002`）、侧重分析范围（如 `仅 NFR 预算`、`仅接口契约`）。

## 目标

在 EPIC 级别执行**跨 Feature 的一致性与质量分析**，检测各 Feature 的 spec/plan/tasks/story_detail_design 之间以及与 EPIC 级产物（epic.md、epic-plan.md、epic-design.md）之间的不一致、冲突、缺口问题。

**与 `/speckit.analyze` 的区别**：
- `/speckit.analyze`：单 Feature 内的 spec↔plan↔tasks 一致性
- `/speckit.epicanalyze`：EPIC 级跨 Feature + EPIC 产物之间的一致性

## 操作约束

**严格只读**：不修改任何文件。输出结构化的分析报告。

**章程权威性**：`.specify/memory/constitution.md` 在分析范围内**不可协商**，违规自动 CRITICAL。

## 执行步骤

### 1. 定位 EPIC 上下文

从仓库根运行：

```powershell
.specify/scripts/powershell/get-epic-paths.ps1 -EpicId "EPIC-xxx" -Json
```

解析 `EPIC_DIR`。遍历 `EPIC_DIR/features/` 获取所有 Feature 目录。

### 2. 加载 EPIC 级产物

- `epic.md`：范围、Feature 拆分、通用能力、跨 Feature 技术策略、整体 FR/NFR、EPIC 验收
- `epic-plan.md`：技术栈、分层约束、NFR 预算框架、共享能力识别
- `epic-design.md`：0/1 层架构、全景类图/时序、Story 拆解、L2 索引
- `ux-design.md`（若存在）：信息架构、交互说明、设计稿索引
- `gate-log.md`（若存在）：审批关卡记录
- `.specify/memory/constitution.md`

### 3. 加载各 Feature 产物

对每个 Feature 目录，加载（按存在性渐进）：
- `spec.md`：FR/NFR/AC/依赖/核心实体
- `plan.md`：技术规约/接口契约/数据模型/Story 索引表
- `tasks.md`：Task 清单/设计引用
- `story_detail_design.md`：L2 详细设计

### 4. 检测环节

聚焦高价值的跨 Feature 发现。总计最多 60 条发现；其余汇总。

#### A. 术语一致性

- 跨 Feature 的同一概念是否使用不同术语（如 Feature A 称"用户配置"，Feature B 称"用户设置"）
- 与 epic.md/epic-plan.md 中术语是否一致
- 核心实体命名是否跨 Feature 统一

#### B. 接口契约兼容性

- 共享能力的 Owner Feature 在 plan.md §5.1 定义的接口，与消费方 Feature 在 plan.md §5.2 引用的接口是否一致
- 错误码/错误类型体系是否跨 Feature 统一（与 epic-plan §4 对齐）
- 数据模型字段命名/类型是否跨 Feature 一致

#### C. NFR 预算一致性

- 各 Feature spec.md 的 NFR 指标之和是否超出 epic-plan.md §7 的 EPIC 级预算上限
- 性能、功耗、内存预算是否有 Feature 未明确分配
- epic.md EPIC-NFR 与各 Feature NFR 是否对齐

#### D. 共享能力完整性

- epic.md「跨 Feature 技术策略」与 epic-plan.md §8 的共享能力是否完全对齐
- Owner Feature 的 plan.md 是否已设计共享能力（状态=已设计）
- 消费方 Feature 的 plan.md 是否正确引用 Owner Feature 的接口
- 是否有重复设计（多个 Feature 各自实现了相同能力）

#### E. Story 依赖与覆盖完整性

- epic-design.md §5 的 Story 拆解与各 Feature plan.md 的 Story 索引表是否一致
- Story 间依赖关系是否有环
- FR/NFR 覆盖矩阵是否有遗漏（某 FR/NFR 无 Story 覆盖）
- 所有 Story 是否在 story_detail_design.md 中有对应 L2 设计
- tasks.md 中的 [ST-xxx] 标签是否与 epic-design.md 的 Story 拆解一致

#### F. 架构一致性

- 各 Feature plan.md §3 的架构约束是否与 epic-plan.md §2 一致
- 各 Feature plan.md §8 的源代码结构是否无冲突（如包名/模块名冲突）
- 全景类图中的类与各 story_detail_design.md 中的类是否一致
- 依赖方向是否符合 epic-plan.md §2 分层约束

#### G. 变更与审批一致性

- 各产物的版本号是否一致（spec Version ↔ plan 中引用的 Feature Version）
- 是否有产物变更后未更新下游（通过变更记录日期推断）
- gate-log.md 中关卡状态与当前产物版本是否匹配

#### H. 章程合规

- 各 Feature plan.md 是否通过了前置检查清单
- 是否存在违反 constitution MUST 条款的设计

### 5. 严重程度赋值

- **CRITICAL**：章程违规、接口契约冲突（阻塞集成）、NFR 预算超支、Story 覆盖遗漏
- **HIGH**：共享能力重复设计、术语严重漂移、架构依赖违规
- **MEDIUM**：版本不一致、变更未同步、L2 设计缺失
- **LOW**：轻微术语不一致、格式问题

### 6. 生成 EPIC 分析报告

输出 Markdown 报告（不写入文件）：

```markdown
## EPIC 跨 Feature 分析报告

**EPIC**：EPIC-xxx - [名称]
**分析日期**：YYYY-MM-DD
**Feature 数量**：X
**产物覆盖**：epic.md ✅ | epic-plan.md ✅/❌ | epic-design.md ✅/❌ | …

### 发现摘要

| ID | 类别 | 严重程度 | 涉及 Feature | 位置 | 摘要 | 建议 |
|----|------|----------|-------------|------|------|------|
| EA1 | 接口契约 | CRITICAL | FEAT-001, FEAT-002 | plan.md:§5 | ... | ... |

### NFR 预算汇总

| NFR 维度 | EPIC 上限 | Feature 分配总和 | 余量 | 状态 |
|----------|-----------|-----------------|------|------|
| 性能 | ... | ... | ... | ✅/⚠️/❌ |

### 共享能力覆盖

| 共享能力 | Owner | 消费方 | Owner 设计状态 | 消费方引用状态 | 问题 |
|----------|-------|--------|---------------|---------------|------|

### Story 覆盖矩阵（跨 Feature）

| FR/NFR ID | 覆盖 Story | 覆盖 Feature | 状态 |
|-----------|-----------|-------------|------|

### 指标

- Feature 总数 / 已分析数
- 总发现数（CRITICAL / HIGH / MEDIUM / LOW）
- NFR 预算使用率
- Story↔FR/NFR 覆盖率
- 共享能力一致性率
```

### 7. 后续行动建议

- 若存在 CRITICAL：列出必须在 `/speckit.implement` 前解决的问题及建议命令
- 若存在 HIGH：列出建议在 design-ready 关卡前解决的问题
- 给出 EPIC 整体健康度评分（A/B/C/D/F）

### 8. 提供整改建议

向用户询问：「是否需要我为排名前 N 的问题提供具体的整改编辑建议？」（**不自动执行**整改。）

## 与现有命令的关系

- **`/speckit.analyze`**：单 Feature 内的 spec↔plan↔tasks 分析（Feature 级质量关卡）
- **`/speckit.epicanalyze`**：EPIC 级跨 Feature 分析（EPIC 级质量关卡）
- **`/speckit.gate`**：审批关卡——建议在 `design-ready` 关卡前运行 epicanalyze
- 建议执行顺序：各 Feature `/speckit.analyze` → `/speckit.epicanalyze` → `/speckit.gate design-ready`
