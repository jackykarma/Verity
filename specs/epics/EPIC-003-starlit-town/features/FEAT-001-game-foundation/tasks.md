---
description: "Story → Task 落地任务清单：游戏基础框架与地图"
---

# Tasks：游戏基础框架与地图

**Epic**：EPIC-003 - 星光小镇（Starlit Town）
**Feature ID**：FEAT-001
**Feature Version**：v0.1.0（来自 `spec.md`）
**Plan Version**：v0.1.0（来自 `plan.md`）
**Tasks Version**：v0.1.0
**输入**：来自 `Feature 目录/` 的设计文档（`spec.md`、`plan.md`、`L2_story_detail_design.md`）

> 规则：
> - Task 只能拆解与执行 Plan 的既定 Story；**禁止**在 tasks.md 里改写 Plan 的技术决策或新增未决策的方案。
> - 每个 Task 必须包含：执行步骤、依赖关系（顺序/并行）、验证方式（可执行/可量化）。
> - 每个 Task 提供**设计引用**（指向 plan.md 或 L2_story_detail_design.md 对应 ST-xxx 的小节/图表）。

## Task 行格式（首行必须严格遵循）

```text
- [ ] T001 [P?] [ST-xxx] <带路径的任务标题>
```

- **复选框**：必须以 `- [ ]` 开头（完成后改为 `- [x]`）
- **任务 ID**：T001、T002…（全局递增）
- **[P]**：可并行执行（不改同一文件，且无依赖）
- **[ST-xxx]**：Story 阶段必填
- **路径**：必须写出影响的关键文件路径（真实路径）

---

## 阶段 0：准备

**目标**：对齐版本、冻结设计输入，避免 Implement 期返工

- [ ] T001 在 `specs/epics/EPIC-003-starlit-town/features/FEAT-001-game-foundation/` 中核对 `spec.md`、`plan.md` 的 Version 字段一致性并补齐变更记录
  - **依赖**：无
  - **设计引用**：N/A
  - **步骤**：
    - 1) 确认 `Feature Version`、`Plan Version` 已填写且一致（v0.1.0）
    - 2) 确认 Plan 的 Story Breakdown 已完成（ST-001、ST-002、ST-003）
  - **验证**：
    - [ ] tasks.md 中 `Plan Version` 与 plan.md 一致
  - **产物**：`spec.md`、`plan.md`、`tasks.md`

---

## 阶段 1：环境搭建（共享基础设施）

**目标**：项目初始化与基础结构搭建，与 plan.md B7 一致

- [ ] T010 按照 plan.md B7 创建 Web 游戏目录结构（路径：`starlit-town/`、`starlit-town/js/`、`starlit-town/css/`、`starlit-town/assets/`）
  - **依赖**：T001
  - **设计引用**：plan.md:B7:源代码结构
  - **步骤**：
    - 1) 在仓库内创建 `starlit-town/` 及子目录 `js/`、`css/`、`assets/`
    - 2) 创建 `starlit-town/index.html` 作为游戏入口页
  - **验证**：
    - [ ] 目录结构与 plan.md B7 一致
  - **产物**：`starlit-town/` 目录及 index.html

- [ ] T011 初始化入口与模块占位（路径：`starlit-town/js/entry/`、`starlit-town/js/map/`、`starlit-town/js/game/`、`starlit-town/js/storage/`）
  - **依赖**：T010
  - **设计引用**：plan.md:B7:源代码结构
  - **步骤**：
    - 1) 创建 `js/entry/`、`js/map/`、`js/game/`、`js/storage/` 目录
    - 2) 确保 index.html 可引用 js 模块（ES 模块或脚本占位）
  - **验证**：
    - [ ] 本地可打开 index.html 或通过简单 HTTP 服务访问
  - **产物**：js 子目录结构

- [ ] T012 [P] 配置代码检查与格式化（路径：`.eslintrc.cjs` 或 `starlit-town/package.json`，若采用）
  - **依赖**：T011
  - **设计引用**：N/A
  - **步骤**：
    - 1) 按项目约定配置 ESLint/Prettier 或等效工具（可选）
    - 2) 确保与 EPIC 技术栈（ES6+、HTML5）一致
  - **验证**：
    - [ ] lint/format 命令可运行（若已配置）
  - **产物**：配置文件（可选）

---

## 阶段 2：核心基础（阻塞性前置条件）

**目标**：环境就绪，阻塞所有 Story 的前置完成

**关键**：此阶段完成前，任何用户故事相关工作均不可启动

- [ ] T020 校准公共基础设施与 Plan-B 架构约束（路径：`starlit-town/js/`）
  - **依赖**：T012
  - **设计引用**：plan.md:B2:架构细化
  - **步骤**：
    - 1) 确认分层约束：表示层不直连存储；业务层不依赖表示层；数据层不依赖业务层
    - 2) 确认错误处理规范：StorageError 与用户提示策略
  - **验证**：
    - [ ] 与 Plan-B B2 约束一致（分层/错误处理/日志规范）
  - **产物**：无代码变更，检查点通过

**检查点**：基础层就绪——用户故事实现可启动

---

## 阶段 3：Story ST-001 - 存储抽象与键约定（类型：Infrastructure）

**目标**：实现 StorageService 接口及 IndexedDBAdapter、LocalStorageFallback；约定键名与 GameState 结构（B3），供本 Feature 与下游 Feature 使用。get/set/isAvailable 可用；IndexedDB 不可用时降级到 localStorage 或提示。

**验证方式（高层）**：单元测试存储读写与降级路径；浏览器环境可测；NFR-REL-001、NFR-OBS-001。

### ST-001 任务

- [ ] T030 [P] [ST-001] 定义 StorageService 接口与 StorageError 类型（路径：`starlit-town/js/storage/StorageService.js` 或等效）
  - **依赖**：T020
  - **设计引用**：L2_story_detail_design.md:ST-001:功能设计:类图
  - **步骤**：
    - 1) 定义 StorageService 接口：get(key)、set(key, value)、isAvailable()
    - 2) 定义 StorageError（Unavailable、QuotaExceeded、Unknown）
  - **验证**：
    - [ ] 接口与 plan B4.1、L2 ST-001 一致
  - **产物**：`starlit-town/js/storage/StorageService.js`（或接口定义文件）

- [ ] T031 [P] [ST-001] 实现 IndexedDBAdapter（路径：`starlit-town/js/storage/IndexedDBAdapter.js`）
  - **依赖**：T030
  - **设计引用**：L2_story_detail_design.md:ST-001:功能设计:时序图
  - **步骤**：
    - 1) 实现 get/set/isAvailable；单库单对象库，key 字符串、value 可序列化对象
    - 2) isAvailable 检测 indexedDB 存在及 open 尝试
    - 3) 失败时 reject(StorageError)
  - **验证**：
    - [ ] 单元测试：get 空键返回 null、set 后 get 一致；IndexedDB 不可用时 isAvailable 为 false
  - **产物**：`starlit-town/js/storage/IndexedDBAdapter.js`

- [ ] T032 [P] [ST-001] 实现 LocalStorageFallback（路径：`starlit-town/js/storage/LocalStorageFallback.js`）
  - **依赖**：T030
  - **设计引用**：L2_story_detail_design.md:ST-001:功能设计:异常矩阵
  - **步骤**：
    - 1) 实现 get/set（JSON 序列化）、isAvailable（检测 localStorage 存在且可写）
    - 2) 失败时 reject(StorageError)
  - **验证**：
    - [ ] 降级路径可测；QuotaExceeded 时 reject
  - **产物**：`starlit-town/js/storage/LocalStorageFallback.js`

- [ ] T033 [ST-001] 实现存储工厂与 B3 键约定（路径：`starlit-town/js/storage/index.js`、plan B3 键 `starlit.gameState`）
  - **依赖**：T031、T032
  - **设计引用**：plan.md:B3.2:物理数据结构
  - **步骤**：
    - 1) 工厂或启动时检测 IndexedDB 可用性，返回 IndexedDBAdapter 或 LocalStorageFallback
    - 2) 导出 GAME_STATE_KEY（`starlit.gameState`）及 GameState 结构约定
  - **验证**：
    - [ ] 存储读写与降级路径单元测试通过；NFR-OBS-001 读写失败可打点/日志
  - **产物**：`starlit-town/js/storage/index.js`、键与结构约定

**检查点**：ST-001 完成——存储抽象与键约定可用，下游可依赖

---

## 阶段 4：Story ST-002 - GameState 持久化与 GameStateManager（类型：Design-Enabler）

**目标**：GameState 数据模型与 GameStateManager 单例；loadOrNew、save、setScene、advancePhase 与 StorageService 集成；错误与提示策略。进度可保存与恢复；存储失败时提示且不阻塞。

**验证方式（高层）**：集成测试：保存后刷新恢复；QuotaExceeded 清理与重试；NFR-REL-001。

### ST-002 任务

- [ ] T040 [P] [ST-002] 定义 GameState 数据模型与 B3 结构（路径：`starlit-town/js/game/GameState.js`）
  - **依赖**：T033
  - **设计引用**：plan.md:B3.2:GameState 结构
  - **步骤**：
    - 1) 定义 GameState：currentDay（≥1）、currentSceneId（枚举）、dayPhase（枚举）
    - 2) 与 B3 结构一致
  - **验证**：
    - [ ] 结构与 plan B3 一致
  - **产物**：`starlit-town/js/game/GameState.js`

- [ ] T041 [ST-002] 实现 DayCycleController（路径：`starlit-town/js/game/DayCycleController.js`）
  - **依赖**：T040
  - **设计引用**：L2_story_detail_design.md:ST-002:功能设计:类图
  - **步骤**：
    - 1) 实现 canAdvance(phase)、nextPhase(phase)；规则 morning→daytime→evening
    - 2) 不可回退
  - **验证**：
    - [ ] 阶段推进规则与 plan A0、A5 一致
  - **产物**：`starlit-town/js/game/DayCycleController.js`

- [ ] T042 [ST-002] 实现 GameStateManager 单例（路径：`starlit-town/js/game/GameStateManager.js`）
  - **依赖**：T041、T033
  - **设计引用**：plan.md:A3.3:GameStateManager:组件类图；L2_story_detail_design.md:ST-002:功能设计:时序图
  - **步骤**：
    - 1) 实现 getState()、loadOrNew()、enterMap()、setScene(sceneId)、advancePhase()、save()
    - 2) loadOrNew：isAvailable→get(GAME_STATE_KEY)，有则恢复、无则默认；失败仍返回默认并可选提示
    - 3) setScene/advancePhase：更新内存 state 后 set(GAME_STATE_KEY, state)；失败时提示「进度无法保存」、不回滚内存
    - 4) 串行化或防抖 setScene/advancePhase，避免 RISK-003
  - **验证**：
    - [ ] 集成测试：保存后刷新再 loadOrNew 恢复一致；QuotaExceeded 清理后重试；存储不可用时可进入地图
  - **产物**：`starlit-town/js/game/GameStateManager.js`

**检查点**：ST-002 完成——进度可保存与恢复，入口与地图可调用

---

## 阶段 5：Story ST-003 - 入口与地图 UI（类型：Functional）

**目标**：EntryView（开始/继续）、MapView（地图与场景切换、日阶段展示）；与 GameStateManager/DayCycleController 绑定；首屏加载与场景切换性能达标。

**验证方式（高层）**：E2E 或手动：完整一日骨架；首屏 ≤3s、场景切换 ≤500ms（NFR-PERF-001）；单页内存增量 ≤100MB（NFR-MEM-001）。

### ST-003 任务

- [ ] T050 [ST-003] 实现 EntryView（路径：`starlit-town/js/entry/EntryView.js`）
  - **依赖**：T042
  - **设计引用**：L2_story_detail_design.md:ST-003:功能设计:类图
  - **步骤**：
    - 1) 实现 render()、onStartClick()、onContinueClick()
    - 2) 挂载时调用 GameStateManager.loadOrNew()，根据是否有进度显示「开始游戏」「继续游戏」
    - 3) 点击后 enterMap() 并导航到 MapView
  - **验证**：
    - [ ] 有/无进度时入口按钮正确；点击可进入地图
  - **产物**：`starlit-town/js/entry/EntryView.js`

- [ ] T051 [ST-003] 实现 MapView 与场景切换、阶段推进（路径：`starlit-town/js/map/MapView.js`）
  - **依赖**：T050
  - **设计引用**：L2_story_detail_design.md:ST-003:功能设计:时序图
  - **步骤**：
    - 1) 实现 render(state)、onSceneSelect(sceneId)、onAdvancePhase()
    - 2) 根据 getState() 的 currentSceneId、dayPhase 渲染地图与阶段
    - 3) onSceneSelect 调用 setScene；onAdvancePhase 调用 advancePhase()；防抖或串行化避免连点
  - **验证**：
    - [ ] 场景切换、阶段推进正确；首屏 ≤3s、切换 ≤500ms；NFR-MEM-001 内存可控
  - **产物**：`starlit-town/js/map/MapView.js`

- [ ] T052 [ST-003] 集成入口与地图至 index.html 并完成路由/视图切换（路径：`starlit-town/index.html`、`starlit-town/js/` 入口脚本）
  - **依赖**：T051
  - **设计引用**：plan.md:A3.1.2.2:组件协作时序图
  - **步骤**：
    - 1) index.html 加载后挂载 EntryView；enterMap 后切换为 MapView
    - 2) 加载动画或进度提示（FR 澄清）；资源控制满足首屏 ≤3s
  - **验证**：
    - [ ] 完整一日骨架可玩；AC-001～AC-006 验收通过
  - **产物**：`starlit-town/index.html`、入口与地图集成

**检查点**：ST-003 完成——用户可进入游戏、切换场景、推进阶段，性能达标

---

## 依赖关系与执行顺序

### 阶段依赖

- **阶段 0**：无依赖——可立即启动
- **阶段 1**：依赖 T001——环境搭建
- **阶段 2**：依赖阶段 1 完成——阻塞所有 Story
- **阶段 3（ST-001）**：依赖阶段 2 完成
- **阶段 4（ST-002）**：依赖 ST-001 完成
- **阶段 5（ST-003）**：依赖 ST-002 完成

### Story 依赖

- **ST-001**：依赖阶段 2 完成
- **ST-002**：依赖 ST-001
- **ST-003**：依赖 ST-002

### 单 Story 内部顺序

- ST-001：T030 → T031/T032 可并行 → T033
- ST-002：T040、T041 可并行 → T042
- ST-003：T050 → T051 → T052

### 并行执行场景

- T012 [P]：配置工具可与 T011 后并行
- ST-001：T030、T031、T032 中 T031 与 T032 可并行（不同文件）
- ST-002：T040 与 T041 可并行

---

## 并行示例：Story ST-001

```text
# 可并行（在 T030 完成后）：
T031 [P] [ST-001] 实现 IndexedDBAdapter，路径：starlit-town/js/storage/IndexedDBAdapter.js
T032 [P] [ST-001] 实现 LocalStorageFallback，路径：starlit-town/js/storage/LocalStorageFallback.js
```

---

## 落地策略

### 先完成 MVP（优先完成关键 Story 集合）

1. 完成阶段 0、1、2
2. 完成 ST-001（存储抽象）
3. 完成 ST-002（GameState 与 Manager）
4. 完成 ST-003（入口与地图 UI）
5. **暂停并验证**：完整一日骨架、首屏 ≤3s、切换 ≤500ms、存储恢复
6. 如就绪，可交付 EPIC 内其他 Feature 依赖本 Feature 的入口与存储

### 增量交付

1. 阶段 0+1+2 → 基础层就绪
2. ST-001 → 存储抽象可用，可单元验证
3. ST-002 → 进度可保存与恢复，可集成验证
4. ST-003 → 入口与地图可玩，可 E2E/手动验收

### 团队并行策略

- 阶段 0～2 共同完成
- ST-001 中 T031 与 T032 可不同人并行
- ST-002 中 T040 与 T041 可并行后汇合 T042

---

## 备注

- [P] 标记的任务 = 涉及不同文件，无依赖关系
- [ST-xxx] 标签将任务关联至 Plan 的 Story，便于追溯
- 每个 Story 需可独立完成、独立验证
- 实现时禁止改写 Plan 技术决策；路径与 plan B7 一致
