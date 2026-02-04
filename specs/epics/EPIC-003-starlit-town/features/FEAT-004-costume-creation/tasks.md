---
description: "Story → Task 落地任务清单：装扮与创造系统"
---

# Tasks：装扮与创造系统

**Epic**：EPIC-003 - 星光小镇（Starlit Town）
**Feature ID**：FEAT-004
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

- [ ] T001 在 `specs/epics/EPIC-003-starlit-town/features/FEAT-004-costume-creation/` 中核对 `spec.md`、`plan.md` 的 Version 一致性并补齐变更记录
  - **依赖**：无
  - **设计引用**：N/A
  - **步骤**：1) 确认 Feature/Plan Version 一致 2) 确认 Story Breakdown（ST-001～ST-004）已完成
  - **验证**：[ ] tasks.md 中 Plan Version 与 plan.md 一致
  - **产物**：spec.md、plan.md、tasks.md

---

## 阶段 1：环境搭建

- [ ] T010 创建装扮模块目录（路径：`starlit-town/js/costume/`、`starlit-town/js/costume/validation/`）
  - **依赖**：T001
  - **设计引用**：plan.md:B7:源代码结构
  - **步骤**：1) 创建 costume/ 与 validation/ 2) 与 FEAT-001/002 的 starlit-town 结构一致
  - **验证**：[ ] 目录与 plan B7 一致
  - **产物**：starlit-town/js/costume/、validation/

- [ ] T011 确认 FEAT-001 StorageService 可用（路径：`starlit-town/js/storage/`）
  - **依赖**：T010
  - **设计引用**：plan.md:依赖的共享能力
  - **步骤**：1) 确认 FEAT-001 StorageService get/set 可调用 2) 键命名空间不冲突
  - **验证**：[ ] 可调用 get/set
  - **产物**：无

---

## 阶段 2：核心基础

- [ ] T020 校准与 FEAT-001 的契约与分层（路径：`starlit-town/js/costume/`）
  - **依赖**：T011
  - **设计引用**：plan.md:B2:架构细化
  - **步骤**：1) 确认表示层不直连存储；业务层通过 FEAT-001 StorageService 读写 2) 存储键命名空间 starlit.costume.*
  - **验证**：[ ] 与 Plan-B 约束一致
  - **产物**：无

**检查点**：可启动 Story 实现

---

## 阶段 3：Story ST-001 - 存储键与数据模型（Infrastructure）

**目标**：装扮、房间墙纸、宠物名、裙子设计的存储键与结构（B3）；与 FEAT-001 命名空间约定一致。可读写、可恢复。

**验证方式**：存储读写与结构单元测试；NFR-REL-001。

### ST-001 任务

- [ ] T030 [P] [ST-001] 定义 B3 存储键与 Outfit/RoomStyle/Pet/DressDesign 结构（路径：`starlit-town/js/costume/storage-keys.js` 或数据模型文件）
  - **依赖**：T020
  - **设计引用**：plan.md:B3.2:物理数据结构；L2_story_detail_design.md:ST-001:功能设计
  - **步骤**：1) 定义 starlit.costume.outfit、roomStyle、pet、dressDesign 键 2) 定义 Outfit（hairId, dressId, shoesId, bagId, styleTag）、RoomStyle（wallpaperId）、Pet（name, assetRef）、DressDesign（stickers ≤10）
  - **验证**：[ ] 键与结构符合 B3；单元测试 set 后 get 一致
  - **产物**：storage-keys.js 或数据模型文件

**检查点**：ST-001 完成——键与数据模型可用

---

## 阶段 4：Story ST-002 - CostumeController 与 Validator（Design-Enabler）

**目标**：CostumeController 协调换装/墙纸/宠物/裙子；Validator 敏感词与长度校验；与存储集成。业务逻辑集中；命名合规（≤10 字、敏感词过滤）；NFR-SEC-001。

**验证方式**：单元测试校验与存储集成；B4.1 接口。

### ST-002 任务

- [ ] T040 [P] [ST-002] 实现 Validator（路径：`starlit-town/js/costume/validation/Validator.js`）
  - **依赖**：T030
  - **设计引用**：plan.md:A3.3:Validator；L2_story_detail_design.md:ST-002:功能设计:类图
  - **步骤**：1) 实现 validatePetName(name)：长度 ≤10 字、敏感词过滤 2) 返回 ValidationResult(valid, message)；违规则 valid: false 并提示重填或默认名
  - **验证**：[ ] 超长与敏感词返回 invalid；合规返回 valid
  - **产物**：starlit-town/js/costume/validation/Validator.js

- [ ] T041 [ST-002] 实现 CostumeController（路径：`starlit-town/js/costume/CostumeController.js`）
  - **依赖**：T030、T040
  - **设计引用**：plan.md:A3.2.1:CostumeController；L2_story_detail_design.md:ST-002:功能设计:时序图
  - **步骤**：1) 实现 getOutfit/setOutfit、getRoomStyle/setRoomStyle、getPet/setPetName/savePet、getDressDesign/updateDressDesign/applyDressDesignToOutfit 2) setPetName 先 Validator 校验再 savePet；setOutfit 等更新内存后 set 存储，失败提示「本次未保存」 3) 贴纸 ≤10 张校验
  - **验证**：[ ] 存储集成与降级提示；命名合规与 NFR-SEC-001
  - **产物**：starlit-town/js/costume/CostumeController.js

- [ ] T042 [ST-002] 实现 B4.1 换装入口接口（路径：`starlit-town/js/costume/index.js` 或等效）
  - **依赖**：T041
  - **设计引用**：plan.md:B4.1:换装入口/界面
  - **步骤**：1) 供 FEAT-003 早上选衣调用：openOutfitForMorning() 或导航至 OutfitView，选衣完成后返回 2) 存储失败时仍可操作，提示保存失败
  - **验证**：[ ] FEAT-003 可调用或导航至换装
  - **产物**：B4.1 接口实现

**检查点**：ST-002 完成——业务层与校验可用

---

## 阶段 5：Story ST-003 - 换装与风格标签 UI（Functional）

**目标**：OutfitView（发型/裙子/鞋子/背包、风格标签）；与 CostumeController 绑定；即时视觉反馈。用户可完成换装并看到更新；风格标签可展示。

**验证方式**：E2E/手动换装与保存；NFR-PERF-001、NFR-MEM-001。

### ST-003 任务

- [ ] T050 [ST-003] 实现 OutfitView（路径：`starlit-town/js/costume/OutfitView.js`）
  - **依赖**：T042
  - **设计引用**：plan.md:A3.1.2.1:OutfitView；A3.2.2 SEQ-001
  - **步骤**：1) 渲染发型/裙子/鞋子/背包选择与风格标签（甜甜/酷酷/森林/星星单选） 2) 用户选择后调用 CostumeController.setOutfit(slot, value)，即时更新外观；未选品类用默认 3) 与 FEAT-002 动效可选集成
  - **验证**：[ ] 换装即时反馈；风格标签可展示；响应 ≤500ms
  - **产物**：starlit-town/js/costume/OutfitView.js

- [ ] T051 [ST-003] 将 OutfitView 挂载至家/商店场景或独立换装页（路径：`starlit-town/js/costume/`、FEAT-003 场景）
  - **依赖**：T050
  - **设计引用**：plan.md:B4.1
  - **步骤**：1) 供 FEAT-003 早上选衣与场景内换装入口使用 2) 保存与恢复符合 FR-006
  - **验证**：[ ] AC-001、AC-002、AC-006 验收通过
  - **产物**：挂载与集成

**检查点**：ST-003 完成——换装与风格 UI 可用

---

## 阶段 6：Story ST-004 - 房间墙纸、宠物命名、裙子设计 UI（Functional）

**目标**：RoomPetView（墙纸、宠物命名）；DressDesignView（贴纸式裙子设计并应用）；与 CostumeController 绑定。用户可更换墙纸、为宠物命名、设计裙子并看到效果；命名合规校验。

**验证方式**：墙纸/命名/贴纸操作与校验；NFR-PERF-001、NFR-SEC-001。

### ST-004 任务

- [ ] T060 [ST-004] 实现 RoomPetView（路径：`starlit-town/js/costume/RoomPetView.js`）
  - **依赖**：T042
  - **设计引用**：plan.md:A3.2.2:SEQ-002；A3.2.3:流程 1
  - **步骤**：1) 墙纸选择调用 setRoomStyle(wallpaperId)；即时效果并持久化 2) 宠物命名输入后调用 setPetName(name)；Validator 违规则提示重填或默认名；通过后 savePet()
  - **验证**：[ ] 墙纸可更换并持久化；命名 ≤10 字与敏感词过滤生效；存储失败提示「本次未保存」
  - **产物**：starlit-town/js/costume/RoomPetView.js

- [ ] T061 [ST-004] 实现 DressDesignView（路径：`starlit-town/js/costume/DressDesignView.js`）
  - **依赖**：T042
  - **设计引用**：plan.md:A3.1.2.1:DressDesignView；A3.2.2:SEQ-003
  - **步骤**：1) 贴纸式操作设计裙子，stickers ≤10 张；调用 updateDressDesign(stickers)、applyDressDesignToOutfit() 2) 资源加载失败时预设或占位，不崩溃
  - **验证**：[ ] 贴纸设计可应用至角色并可见；单件 ≤10 张贴纸；NFR-PERF-001 响应 ≤500ms
  - **产物**：starlit-town/js/costume/DressDesignView.js

- [ ] T062 [ST-004] 将 RoomPetView、DressDesignView 挂载至家场景（房间/宠物角/裙子设计入口）（路径：`starlit-town/js/town-life/scenes/` 或 costume 路由）
  - **依赖**：T060、T061
  - **设计引用**：plan.md:A3.1.2.1
  - **步骤**：1) 家场景中房间墙纸、宠物角、裙子设计入口挂载对应 View 2) 与 FEAT-002 动效可选集成
  - **验证**：[ ] AC-003、AC-004、AC-005、AC-007 验收通过
  - **产物**：挂载与集成

**检查点**：ST-004 完成——房间/宠物/裙子设计 UI 可用

---

## 依赖关系与执行顺序

### 阶段依赖

- 阶段 0 → 1 → 2 → 3（ST-001）→ 4（ST-002）→ 5（ST-003）、6（ST-004）
- ST-003 与 ST-004 均依赖 ST-002；可并行开发

### Story 依赖

- ST-001 依赖阶段 2
- ST-002 依赖 ST-001
- ST-003、ST-004 依赖 ST-002

### 并行执行场景

- ST-002：T040 与 T041 可部分并行（T041 依赖 T040 校验接口）
- ST-003 与 ST-004：可不同人并行

---

## 落地策略

### MVP

1. 阶段 0+1+2 + ST-001 + ST-002 → 业务层与存储就绪
2. ST-003（换装与风格）→ FEAT-003 早上选衣可对接
3. ST-004（房间/宠物/裙子）→ 完整装扮与创造

### 增量交付

- 每 Story 独立验证；B4.1 供 FEAT-003 消费

---

## 备注

- 路径与 plan B7 一致；禁止改写 Plan
- [ST-xxx] 关联 Plan Story；[P] 表示可并行
