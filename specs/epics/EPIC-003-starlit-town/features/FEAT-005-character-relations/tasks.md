---
description: "Story → Task 落地任务清单：角色关系系统"
---

# Tasks：角色关系系统

**Epic**：EPIC-003 - 星光小镇（Starlit Town）
**Feature ID**：FEAT-005
**Feature Version**：v0.1.0（来自 `spec.md`）
**Plan Version**：v0.1.0（来自 `plan.md`）
**Tasks Version**：v0.1.0
**输入**：来自 `Feature 目录/` 的设计文档（`spec.md`、`plan.md`、`L2_story_detail_design.md`）

> 规则：Task 只能拆解与执行 Plan 的既定 Story；禁止改写 Plan 技术决策。每个 Task 须含设计引用、步骤、验证、产物。

## Task 行格式

```text
- [ ] T001 [P?] [ST-xxx] <带路径的任务标题>
```

---

## 阶段 0：准备

- [ ] T001 在 `specs/epics/EPIC-003-starlit-town/features/FEAT-005-character-relations/` 中核对 `spec.md`、`plan.md` 的 Version 一致性并补齐变更记录
  - **依赖**：无
  - **设计引用**：N/A
  - **步骤**：1) 确认 Feature/Plan Version 一致 2) 确认 Story Breakdown（ST-001～ST-003）已完成
  - **验证**：[ ] tasks.md 中 Plan Version 与 plan.md 一致
  - **产物**：spec.md、plan.md、tasks.md

---

## 阶段 1：环境搭建

- [ ] T010 创建角色关系模块目录（路径：`starlit-town/js/relations/`、`starlit-town/js/relations/presets/`）
  - **依赖**：T001
  - **设计引用**：plan.md:B7:源代码结构
  - **步骤**：1) 创建 relations/ 与 presets/ 2) 与 FEAT-001/002/003 的 starlit-town 结构一致
  - **验证**：[ ] 目录与 plan B7 一致
  - **产物**：starlit-town/js/relations/、presets/

- [ ] T011 确认 FEAT-001 StorageService、FEAT-003 场景挂载点可用（路径：`starlit-town/js/storage/`、`starlit-town/js/town-life/scenes/`）
  - **依赖**：T010
  - **设计引用**：plan.md:依赖的共享能力
  - **步骤**：1) 确认 StorageService get/set 可调用 2) 确认 FEAT-003 学校/公园等场景内 NPC 挂载点或入口存在
  - **验证**：[ ] 存储与场景可对接
  - **产物**：无

---

## 阶段 2：核心基础

- [ ] T020 校准与 FEAT-001/003 的契约与分层（路径：`starlit-town/js/relations/`）
  - **依赖**：T011
  - **设计引用**：plan.md:B2:架构细化
  - **步骤**：1) 确认表示层不直连存储；业务层通过 FEAT-001 StorageService 读写 2) 存储键命名空间 starlit.relations.*；与 FEAT-006 getRelationSummary 契约对齐
  - **验证**：[ ] 与 Plan-B 约束一致
  - **产物**：无

**检查点**：可启动 Story 实现

---

## 阶段 3：Story ST-001 - 存储键与记忆数据模型（Infrastructure）

**目标**：互动记忆与关系状态的存储键与结构（B3）；20 条/7 天、同类型覆盖策略；与 FEAT-001 命名空间一致。可读写、可恢复；getRelationSummary() 可产出供 FEAT-006。

**验证方式**：存储与摘要结构单元测试；NFR-REL-001。

### ST-001 任务

- [ ] T030 [ST-001] 定义 B3 存储键与 InteractionMemory/RelationState 结构（路径：`starlit-town/js/relations/storage-keys.js` 或数据模型文件）
  - **依赖**：T020
  - **设计引用**：plan.md:B3.2:物理数据结构；L2_story_detail_design.md:ST-001:功能设计
  - **步骤**：1) 定义 starlit.relations.memories、starlit.relations.summary 键 2) 定义 InteractionMemory（npcId, interactionType, occurredAt, emotionTag）、RelationState（memoriesByNpc, summaryByNpc）；每 NPC 最多 20 条、7 天外剔除；同类型覆盖策略
  - **验证**：[ ] 键与结构符合 B3；摘要结构可供 FEAT-006 消费
  - **产物**：storage-keys.js 或数据模型文件

- [ ] T031 [ST-001] 实现记忆更新与清理逻辑（路径：`starlit-town/js/relations/memory-store.js` 或 RelationController 内）
  - **依赖**：T030
  - **设计引用**：L2_story_detail_design.md:ST-001:功能设计:触发条件与系统响应
  - **步骤**：1) 同类型覆盖：同一会话内同类型互动最近一次覆盖 2) 清理：每 NPC 超 20 条或超 7 天剔除 3) 读写 StorageService 按 B3 键
  - **验证**：[ ] 单元测试：同类型覆盖与 20 条/7 天逻辑正确
  - **产物**：记忆更新与清理逻辑

**检查点**：ST-001 完成——存储键与记忆模型可用

---

## 阶段 4：Story ST-002 - RelationController 与 FeedbackSelector（Design-Enabler）

**目标**：RelationController 协调互动记录、记忆读写、getRelationSummary；FeedbackSelector 按 NPC/性格/互动历史选取预设文案。互动可记录；“记得我”反馈可区分性格；与 FEAT-006 契约就绪。

**验证方式**：记忆读写与反馈选取逻辑测试；B4.1 契约；NFR-OBS-001。

### ST-002 任务

- [ ] T040 [P] [ST-002] 实现预设文案表与 FeedbackSelector（路径：`starlit-town/js/relations/presets/`、`starlit-town/js/relations/FeedbackSelector.js`）
  - **依赖**：T031
  - **设计引用**：plan.md:A3.2.1:FeedbackSelector；L2_story_detail_design.md:ST-002:功能设计:类图
  - **步骤**：1) 预设文案表按 (personalityType, interactionType, emotionTag, isFirstMeet) 等维度索引 2) select(npcId, memories)：无记忆或空则返回默认/初次见面文案；有记忆则返回「记得我」类文案；无数值好感
  - **验证**：[ ] 首次见面与再次见面反馈可区分；性格差异化（黏人/傲娇/温柔）
  - **产物**：starlit-town/js/relations/FeedbackSelector.js、presets/ 文案配置

- [ ] T041 [ST-002] 实现 RelationController（路径：`starlit-town/js/relations/RelationController.js`）
  - **依赖**：T031、T040
  - **设计引用**：plan.md:A3.2.1:RelationController；L2_story_detail_design.md:ST-002:功能设计:时序图
  - **步骤**：1) recordInteraction(npcId, type, emotionTag)：更新记忆（同类型覆盖、清理 20 条/7 天），set(RELATIONS_KEY)；失败时当次会话保留、可选提示 2) getFeedback(npcId)：读取该 NPC 记忆，损坏或空则默认反馈；否则 FeedbackSelector.select 3) getRelationSummary()：返回 RelationState 供 FEAT-006
  - **验证**：[ ] 互动可记录并持久化；记忆损坏时降级默认反馈不崩溃；B4.1 getRelationSummary 可用
  - **产物**：starlit-town/js/relations/RelationController.js

- [ ] T042 [ST-002] 实现 B4.1 getRelationSummary 与 FEAT-006 契约（路径：`starlit-town/js/relations/`）
  - **依赖**：T041
  - **设计引用**：plan.md:B4.1:getRelationSummary
  - **步骤**：1) getRelationSummary(): RelationState（memoriesByNpc、summaryByNpc 无数值） 2) 存储异常时返回空或默认摘要，不抛错
  - **验证**：[ ] FEAT-006 可消费 RelationState 结构
  - **产物**：B4.1 接口实现

**检查点**：ST-002 完成——业务层与反馈选取可用

---

## 阶段 5：Story ST-003 - NPCDialogueView 与场景集成（Functional）

**目标**：NPCDialogueView 展示对话与“记得我”反馈；与 FEAT-003 场景内 NPC 入口集成；与 RelationController 绑定。用户可与 NPC 互动并再次见面时看到差异化反馈。

**验证方式**：E2E/手动互动与再次见面反馈；NFR-PERF-001、NFR-MEM-001。

### ST-003 任务

- [ ] T050 [ST-003] 实现 NPCDialogueView（路径：`starlit-town/js/relations/NPCDialogueView.js`）
  - **依赖**：T042
  - **设计引用**：plan.md:A3.1.2.1:NPCDialogueView；A3.2.2:SEQ-002
  - **步骤**：1) 用户触发对话时调用 RelationController.getFeedback(npcId) 并展示文案 2) 用户互动（对话/帮助/一起玩）时调用 recordInteraction(npcId, type, emotionTag)；情绪标签（开心/感激/平静/期待）由交互上下文或简单选择传入
  - **验证**：[ ] 再次见面时反馈体现「记得我」；不同性格 NPC 反馈风格可区分；响应 ≤500ms
  - **产物**：starlit-town/js/relations/NPCDialogueView.js

- [ ] T051 [ST-003] 在 FEAT-003 学校/公园等场景内挂载 NPC 与对话入口（路径：`starlit-town/js/town-life/scenes/`、`starlit-town/js/relations/`）
  - **依赖**：T050
  - **设计引用**：plan.md:B4.2:FEAT-003 场景
  - **步骤**：1) 在对应场景视图内增加 NPC 与对话触发点 2) 绑定 NPCDialogueView 与 RelationController；可选 FEAT-002 动效
  - **验证**：[ ] AC-001～AC-006 验收通过；NFR-MEM-001 内存可控
  - **产物**：场景内 NPC 挂载与集成

**检查点**：ST-003 完成——NPC 对话与“记得我”可用

---

## 依赖关系与执行顺序

### 阶段依赖

- 阶段 0 → 1 → 2 → 3（ST-001）→ 4（ST-002）→ 5（ST-003）

### Story 依赖

- ST-001 依赖阶段 2
- ST-002 依赖 ST-001
- ST-003 依赖 ST-002

### 并行执行场景

- ST-002：T040 与 T041 可部分并行（T041 依赖 T040 的 FeedbackSelector）

---

## 落地策略

### MVP

1. 阶段 0+1+2 + ST-001 + ST-002 → 关系与记忆业务层就绪；FEAT-006 可消费 getRelationSummary
2. ST-003 → NPC 对话与“记得我”可玩

### 增量交付

- 每 Story 独立验证；B4.1 供 FEAT-006 消费

---

## 备注

- 路径与 plan B7 一致；禁止改写 Plan
- [ST-xxx] 关联 Plan Story；[P] 表示可并行
