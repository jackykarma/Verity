---
description: "阶段审批关卡：在关键阶段转换前执行人工审批，记录评审结论、冻结产物状态，确保 AI 后续阶段在已审批的基线上执行。支持 spec-ready / plan-ready / design-ready / tasks-ready / implement-done 五个关卡。"
handoffs:
  - label: 进入下一阶段
    agent: aisdd.plan
    prompt: 关卡通过后，进入下一阶段
    send: false
---

## 用户输入

```text
$ARGUMENTS
```

在继续操作前，你**必须**参考用户输入（若不为空）。`$ARGUMENTS` 须包含：**关卡类型**（见下表）及可选的**评审结论/备注**。

## 关卡类型

| 关卡 | 检查时机 | 前置产物 | 冻结对象 | 放行的下一步 |
|------|----------|----------|----------|-------------|
| **spec-ready** | 所有 Feature spec + clarify 完成后 | 各 `spec.md` | spec.md（状态→就绪） | epicuidesign / epicplan |
| **plan-ready** | epicplan + 各 Feature plan 完成后 | `epic-plan.md`、各 `plan.md` | epic-plan.md、plan.md | epicdesign |
| **design-ready** | EPIC 软件设计说明书完成后 | `epic-design.md`（及 `story_detail_design.md`） | epic-design.md | tasks |
| **tasks-ready** | tasks 生成 + analyze 通过后 | 各 `tasks.md` | tasks.md | implement |
| **implement-done** | implement 完成 + verify 通过后 | 代码 + verify 报告 | — | 发布/合并 |

## 大纲

目标：在关键阶段转换前执行**人工审批关卡**（Gate Review），检查前置产物完整性，记录评审结论，将产物状态标记为「已冻结」，确保 AI 后续阶段在**已审批的基线**上执行。

**核心原则**：
- 关卡是**人工主导**的决策点，AI 辅助检查但**不代替**人工判断
- 评审结论**必须由人工确认**后才能标记通过
- 冻结后的产物在后续阶段中为只读；若需变更须说明变更范围，由 AI 做增量更新，变更完成后建议重新运行关卡

## 执行步骤

### 1. 解析关卡类型与 EPIC 上下文

从 `$ARGUMENTS` 中提取关卡类型（`spec-ready` / `plan-ready` / `design-ready` / `tasks-ready` / `implement-done`）。

定位 EPIC 路径：
- 若 `$ARGUMENTS` 含 EPIC 标识（如 `EPIC-002`）：运行 `.specify/scripts/powershell/get-epic-paths.ps1 -EpicId "EPIC-002" -Json`
- 否则通过 `SPECIFY_EPIC` 或当前 Feature 上下文推导

### 2. 前置产物完整性检查

根据关卡类型，检查对应产物是否存在且版本一致：

#### spec-ready
- [ ] 所有 Feature 目录下 `spec.md` 存在
- [ ] spec.md 状态为「就绪（可进入 Plan）」或「待澄清」已解决
- [ ] spec.md 中无未解决的 `[需澄清]` 标记（或仅剩低影响项）
- [ ] 各 spec.md 的 Epic 字段与 epic.md 一致

#### plan-ready
- [ ] `epic-plan.md` 存在且版本已填写
- [ ] 所有 Feature 的 `plan.md` 存在
- [ ] 各 plan.md 的「Plan 前置检查」章节已通过
- [ ] 各 plan.md 的 Feature Version 与对应 spec.md 一致
- [ ] 若 `ux-design.md` 存在，plan 中已引用其约束

#### design-ready
- [ ] `epic-design.md` 存在且版本已填写
- [ ] §1（0 层架构）、§2（1 层架构）、§4（全景类图/时序）、§5（Story 拆解）已完成
- [ ] 各 Feature 的 `story_detail_design.md` 存在（若有 L2 设计）
- [ ] Story 拆解的 FR/NFR 覆盖矩阵（§5.4）无遗漏
- [ ] 设计说明书 Version 已填写

#### tasks-ready
- [ ] 各 Feature 的 `tasks.md` 存在
- [ ] 每个 Task 包含设计引用
- [ ] Story 覆盖率 100%（所有 ST-xxx 均有对应 Task）
- [ ] 若已运行 `/aisdd.analyze`，无 CRITICAL 级问题

#### implement-done
- [ ] tasks.md 中所有 Task 标记为 `[x]`
- [ ] 若已运行 `/aisdd.verify`，验证报告无阻塞项
- [ ] 代码可构建通过

### 3. 输出检查报告

以结构化格式输出检查结果：

```markdown
## 关卡检查报告：[关卡类型]

**EPIC**：EPIC-xxx - [名称]
**检查日期**：YYYY-MM-DD
**检查项数**：X 项通过 / Y 项未通过 / Z 项不适用

### 检查结果

| # | 检查项 | 状态 | 说明 |
|---|--------|------|------|
| 1 | ... | ✅/❌/N/A | ... |

### 发现的问题（若有）

| 问题 | 严重程度 | 影响 | 建议操作 |
|------|----------|------|----------|
| ... | 阻塞/警告 | ... | ... |
```

### 4. 等待人工评审结论

向用户呈现检查报告后，**必须等待**用户给出评审结论：

- **通过**：所有检查项通过或剩余问题已确认可接受
- **有条件通过**：存在非阻塞性问题，附带待办清单，允许进入下一阶段但须在指定时间前解决
- **驳回**：存在阻塞性问题，须修复后重新提交关卡

若用户在 `$ARGUMENTS` 中已给出结论（如 `design-ready 通过`、`plan-ready 有条件通过：ST-003 L2 待补齐`），可直接使用。

### 5. 记录评审结论

在 **EPIC 根** 下创建或更新 `gate-log.md`（审批日志），追加一条记录：

```markdown
### [关卡类型] - YYYY-MM-DD

- **结论**：通过 / 有条件通过 / 驳回
- **评审人**：[用户提供或标注为 SE]
- **检查项**：X 通过 / Y 未通过 / Z N/A
- **条件/待办**：[若有条件通过，列出待办]
- **冻结产物**：[列出被冻结的文档路径及版本]
- **备注**：[用户补充的备注]
```

### 6. 冻结产物状态

若评审结论为「通过」或「有条件通过」：

- 在对应文档的头部元信息中，将**状态**更新为「冻结（已通过 [关卡类型] 关卡）」
- 记录冻结版本号

**冻结规则**：
- `spec-ready`：各 spec.md 状态 → `冻结（执行中）`
- `plan-ready`：各 plan.md 追加冻结标注；epic-plan.md 同理
- `design-ready`：epic-design.md 追加冻结标注
- `tasks-ready`：各 tasks.md 追加冻结标注
- `implement-done`：不冻结文档，仅记录完成

### 7. 完成报告

输出：
- 关卡类型与评审结论
- 冻结的产物清单（路径 + 版本）
- `gate-log.md` 路径
- **下一步建议**：

| 关卡 | 下一步 |
|------|--------|
| spec-ready | `/aisdd.epicuidesign`（可选）→ `/aisdd.epicplan` |
| plan-ready | `/aisdd.epicdesign` |
| design-ready | `/aisdd.tasks` |
| tasks-ready | `/aisdd.analyze`（若未运行）→ `/aisdd.implement` |
| implement-done | `/aisdd.verify`（若未运行）→ 合并/发布 |

## 与现有命令的关系

- **关卡是阶段间的卡点**：关卡不产出设计文档，只做检查、记录与冻结
- **冻结后变更**：冻结后的产物若需变更，须说明变更范围由 AI 做增量更新，变更完成后建议重新运行关卡
- **implement 阶段的强制约束**：`/aisdd.implement` 在步骤 3 中应检查 `gate-log.md` 中 `tasks-ready` 关卡是否已通过；若未通过则警告（非阻塞，由用户决定是否继续）
