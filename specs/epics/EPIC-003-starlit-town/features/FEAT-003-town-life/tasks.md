---
description: "Story → Task 落地任务清单：小镇生活系统"
---

# Tasks：小镇生活系统

**Epic**：EPIC-003 - 星光小镇（Starlit Town）
**Feature ID**：FEAT-003
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

- [ ] T001 在 `specs/epics/EPIC-003-starlit-town/features/FEAT-003-town-life/` 中核对 `spec.md`、`plan.md` 的 Version 一致性并补齐变更记录
  - **依赖**：无
  - **设计引用**：N/A
  - **步骤**：1) 确认 Feature/Plan Version 一致 2) 确认 Story Breakdown（ST-001～ST-004）已完成
  - **验证**：[ ] tasks.md 中 Plan Version 与 plan.md 一致
  - **产物**：spec.md、plan.md、tasks.md

---

## 阶段 1：环境搭建

- [ ] T010 创建小镇生活模块目录（路径：`starlit-town/js/town-life/`、`starlit-town/js/town-life/scenes/`）
  - **依赖**：T001
  - **设计引用**：plan.md:B7:源代码结构
  - **步骤**：1) 创建 town-life/ 与 scenes/ 2) 与 FEAT-001/002 的 starlit-town 结构一致
  - **验证**：[ ] 目录与 plan B7 一致
  - **产物**：starlit-town/js/town-life/、scenes/

- [ ] T011 确认 FEAT-001 StorageService 与 GameStateManager 可用（路径：`starlit-town/js/storage/`、`starlit-town/js/game/`）
  - **依赖**：T010
  - **设计引用**：plan.md:依赖的共享能力
  - **步骤**：1) 确认 FEAT-001 存储与阶段推进接口可调用 2) 无代码变更
  - **验证**：[ ] 可调用 get/set、阶段推进
  - **产物**：无

---

## 阶段 2：核心基础

- [ ] T020 校准与 FEAT-001/002 的契约与分层（路径：`starlit-town/js/town-life/`）
  - **依赖**：T011
  - **设计引用**：plan.md:B2:架构细化
  - **步骤**：1) 确认表示层不直连存储；业务层通过 FEAT-001 StorageService 读写 2) 存储键命名空间 starlit.townLife.*
  - **验证**：[ ] 与 Plan-B 约束一致
  - **产物**：无

**检查点**：可启动 Story 实现

---

## 阶段 3：Story ST-001 - 存储键与每日快照结构（Infrastructure）

**目标**：本 Feature 存储键命名空间与 DailyEvent、DailySummarySnapshot 结构（B3）；与 FEAT-001 无冲突，与 FEAT-006 契约对齐。键/结构可读写；getDailySummarySnapshot() 可产出供 FEAT-006。

**验证方式**：存储读写与快照结构单元测试；NFR-REL-001。

### ST-001 任务

- [ ] T030 [P] [ST-001] 定义 B3 存储键常量与 DailyEvent/DailySummarySnapshot 结构（路径：`starlit-town/js/town-life/storage-keys.js` 或等效）
  - **依赖**：T020
  - **设计引用**：plan.md:B3.2:物理数据结构；L2_story_detail_design.md:ST-001:功能设计
  - **步骤**：1) 定义 starlit.townLife.morning、activities、dailyEvents、dailySummary 键 2) 定义 DailyEvent、DailySummarySnapshot 字段（与 B3、FEAT-006 契约一致）
  - **验证**：[ ] 键与结构符合 B3；快照字段与 FEAT-006 输入一致
  - **产物**：storage-keys.js 或数据模型文件

- [ ] T031 [ST-001] 实现快照生成逻辑（路径：`starlit-town/js/town-life/snapshot.js` 或 TownLifeController 内）
  - **依赖**：T030
  - **设计引用**：L2_story_detail_design.md:ST-001:功能设计:触发条件与系统响应
  - **步骤**：1) 从存储读取当日 events、morning（moodId）等 2) 组装 DailySummarySnapshot（date、events、moodId）
  - **验证**：[ ] 单元测试：set 后 get 一致；快照结构可被 FEAT-006 消费
  - **产物**：快照生成函数/模块

**检查点**：ST-001 完成——键与快照结构可用

---

## 阶段 4：Story ST-002 - EventEngine 与 TownLifeController（Design-Enabler）

**目标**：EventEngine 小事件规则（每日 2–3 个）；TownLifeController 协调早上/场景活动/总结入口；与存储集成。小事件可触发；早上流程与晚上总结入口可调用；FEAT-004/006 占位契约。

**验证方式**：规则与快照逻辑测试；FEAT-004/006 占位契约；NFR-OBS-001。

### ST-002 任务

- [ ] T040 [ST-002] 实现 EventEngine（路径：`starlit-town/js/town-life/EventEngine.js`）
  - **依赖**：T031
  - **设计引用**：plan.md:A3.3:EventEngine；L2_story_detail_design.md:ST-002:功能设计:类图
  - **步骤**：1) 实现 checkEvents(activity, time)、getTriggeredToday() 2) 规则：场景活动+时间，今日已触发数 < 3 时随机触发 3) 读写存储键 starlit.townLife.dailyEvents
  - **验证**：[ ] 每日 2–3 个小事件可触发；存储失败时当次会话有效
  - **产物**：starlit-town/js/town-life/EventEngine.js

- [ ] T041 [ST-002] 实现 TownLifeController（路径：`starlit-town/js/town-life/TownLifeController.js`）
  - **依赖**：T040
  - **设计引用**：plan.md:A3.2.1:TownLifeController；L2_story_detail_design.md:ST-002:功能设计
  - **步骤**：1) 实现 completeMorning(moodId)、reportActivity(sceneId, activityType)、getDailyEvents()、getDailySummarySnapshot()、navigateToStory() 2) 与 StorageService、EventEngine、FEAT-001 GameStateManager（阶段推进）集成 3) 存储失败提示，当次会话有效
  - **验证**：[ ] 早上流程可完成并推进至白天；快照可产出；navigateToStory 可导航至 FEAT-006 或占位
  - **产物**：starlit-town/js/town-life/TownLifeController.js

- [ ] T042 [ST-002] 实现 FEAT-004/FEAT-006 占位契约（路径：`starlit-town/js/town-life/`、B4.2 约定）
  - **依赖**：T041
  - **设计引用**：plan.md:B4.2:本 Feature 依赖的外部接口；A4 RISK-001
  - **步骤**：1) 早上选衣：调用 FEAT-004 接口或占位（按钮/简单选择）完成流程 2) 晚上总结：getDailySummarySnapshot 与 navigateToStory 与 FEAT-006 契约对齐；未就绪时简单摘要占位
  - **验证**：[ ] 占位可完成验收；B4.2 契约可对接
  - **产物**：占位 UI 或接口约定文档

**检查点**：ST-002 完成——业务层可用，占位就绪

---

## 阶段 5：Story ST-003 - MorningView 与场景视图（Functional）

**目标**：MorningView（选衣+小心情，调用 FEAT-004 或占位）；SceneViews（家/学校/公园/商店/森林）与活动入口；与 FEAT-001 阶段推进协同。用户可完成早上选衣与小心情并进入白天；可进入各场景并看到对应内容与活动。

**验证方式**：E2E/手动：早上流程与场景进入；NFR-PERF-001 场景内活动响应 ≤500ms。

### ST-003 任务

- [ ] T050 [ST-003] 实现 MorningView（路径：`starlit-town/js/town-life/MorningView.js`）
  - **依赖**：T042
  - **设计引用**：plan.md:A3.1.2.1:MorningView；A3.2.2 SEQ-001
  - **步骤**：1) 渲染选衣与小心情（3–5 种预设）；选衣调用 FEAT-004 或占位 2) 完成后调用 TownLifeController.completeMorning(moodId)，推进至白天并进入地图
  - **验证**：[ ] 用户可完成选衣与小心情并进入白天；存储失败时仍可进入并提示
  - **产物**：starlit-town/js/town-life/MorningView.js

- [ ] T051 [ST-003] 实现各场景视图与活动入口（路径：`starlit-town/js/town-life/scenes/`）
  - **依赖**：T042
  - **设计引用**：plan.md:A3.2.1:SceneViews；spec FR-002、FR-003
  - **步骤**：1) 家（卧室/衣柜/宠物角）、学校、公园、商店、神秘森林各场景视图 2) 活动入口调用 reportActivity(sceneId, activityType)；与 FEAT-001 MapView/场景切换协同
  - **验证**：[ ] 用户可进入各场景并看到内容与活动；响应 ≤500ms
  - **产物**：starlit-town/js/town-life/scenes/ 下各场景模块

- [ ] T052 [ST-003] 将 MorningView 与 SceneViews 挂载至 FEAT-001 阶段与地图（路径：`starlit-town/js/map/`、`starlit-town/js/entry/` 或路由）
  - **依赖**：T050、T051
  - **设计引用**：plan.md:A3.1.2.2:组件协作时序图
  - **步骤**：1) 早上阶段显示 MorningView；白天阶段根据 currentSceneId 显示对应 SceneView 2) 与 FEAT-002 动效可选集成
  - **验证**：[ ] AC-001～AC-003 验收通过
  - **产物**：阶段与场景挂载集成

**检查点**：ST-003 完成——早上与场景可玩

---

## 阶段 6：Story ST-004 - SummaryEntryView 与小事件展示（Functional）

**目标**：晚上「今天的故事」入口（导航至 FEAT-006）；白天 2–3 小事件展示（弹窗/浮层）；与 TownLifeController、EventEngine 集成。

**验证方式**：小事件触发与展示；总结入口导航；NFR-PERF-001。

### ST-004 任务

- [ ] T060 [ST-004] 实现小事件展示 UI（路径：`starlit-town/js/town-life/DailyEventView.js` 或等效）
  - **依赖**：T042
  - **设计引用**：plan.md:A3.2.2:SEQ-002；spec FR-004
  - **步骤**：1) 当 EventEngine 触发小事件时，TownLifeController 通知 UI 展示弹窗/浮层 2) 展示 2–3 个小事件内容，不阻塞主线程
  - **验证**：[ ] 白天可触发并展示 2–3 个小事件
  - **产物**：小事件展示组件

- [ ] T061 [ST-004] 实现 SummaryEntryView 与晚上总结入口（路径：`starlit-town/js/town-life/SummaryEntryView.js`）
  - **依赖**：T042
  - **设计引用**：plan.md:A3.2.3:流程 2；B4.1 getDailySummarySnapshot
  - **步骤**：1) 仅晚上阶段显示「今天的故事」入口 2) 点击后 getDailySummarySnapshot() 并 navigateToStory() 传入快照或由 FEAT-006 拉取
  - **验证**：[ ] 晚上可进入总结入口；FEAT-006 未就绪时占位展示
  - **产物**：starlit-town/js/town-life/SummaryEntryView.js

- [ ] T062 [ST-004] 将 SummaryEntryView 与小事件 UI 集成至地图/阶段（路径：`starlit-town/js/town-life/`）
  - **依赖**：T060、T061
  - **设计引用**：plan.md:A3.1.2.1:SummaryEntryView
  - **步骤**：1) 晚上阶段在地图或主界面显示总结入口 2) 小事件在场景内或全局浮层展示
  - **验证**：[ ] AC-004、AC-005 验收通过
  - **产物**：集成完成

**检查点**：ST-004 完成——小事件与总结入口可用

---

## 依赖关系与执行顺序

### 阶段依赖

- 阶段 0 → 阶段 1 → 阶段 2 → 阶段 3（ST-001）→ 阶段 4（ST-002）→ 阶段 5（ST-003）、阶段 6（ST-004）
- ST-003 与 ST-004 均依赖 ST-002；ST-003 与 ST-004 之间无依赖，可并行开发

### Story 依赖

- ST-001 依赖阶段 2
- ST-002 依赖 ST-001
- ST-003、ST-004 依赖 ST-002

### 并行执行场景

- ST-001：T030 与 T031 可部分并行（T031 依赖 T030 结构）
- ST-003 与 ST-004：可不同人并行（均依赖 ST-002）

---

## 落地策略

### MVP

1. 阶段 0+1+2 + ST-001 + ST-002 → 业务层与存储就绪
2. ST-003（MorningView + 场景）→ 可玩主舞台
3. ST-004（小事件 + 总结入口）→ 一日闭环

### 增量交付

- 每 Story 独立验证；FEAT-004/006 未就绪时占位通过验收

---

## 备注

- 路径与 plan B7 一致；禁止改写 Plan
- [ST-xxx] 关联 Plan Story；[P] 表示可并行
