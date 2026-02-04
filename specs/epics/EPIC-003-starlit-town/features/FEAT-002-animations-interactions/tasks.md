---
description: "Story → Task 落地任务清单：动效与交互体验能力"
---

# Tasks：动效与交互体验能力

**Epic**：EPIC-003 - 星光小镇（Starlit Town）
**Feature ID**：FEAT-002
**Feature Version**：v0.1.0（来自 `spec.md`）
**Plan Version**：v0.1.0（来自 `plan.md`）
**Tasks Version**：v0.1.0
**输入**：来自 `Feature 目录/` 的设计文档（`spec.md`、`plan.md`、`L2_story_detail_design.md`）

> 规则：
> - Task 只能拆解与执行 Plan 的既定 Story；**禁止**在 tasks.md 里改写 Plan 的技术决策。
> - 每个 Task 必须包含：执行步骤、依赖关系、验证方式；提供**设计引用**（指向 plan 或 L2 对应 ST-xxx）。

## Task 行格式（首行必须严格遵循）

```text
- [ ] T001 [P?] [ST-xxx] <带路径的任务标题>
```

---

## 阶段 0：准备

**目标**：对齐版本、冻结设计输入

- [ ] T001 在 `specs/epics/EPIC-003-starlit-town/features/FEAT-002-animations-interactions/` 中核对 `spec.md`、`plan.md` 的 Version 字段一致性并补齐变更记录
  - **依赖**：无
  - **设计引用**：N/A
  - **步骤**：
    - 1) 确认 Feature Version、Plan Version 已填写且一致（v0.1.0）
    - 2) 确认 Plan 的 Story Breakdown 已完成（ST-001、ST-002、ST-003）
  - **验证**：
    - [ ] tasks.md 中 Plan Version 与 plan.md 一致
  - **产物**：`spec.md`、`plan.md`、`tasks.md`

---

## 阶段 1：环境搭建

**目标**：本 Feature 动效模块目录与 FEAT-001 项目结构对齐

- [ ] T010 创建动效模块目录（路径：`starlit-town/js/animations/`）
  - **依赖**：T001
  - **设计引用**：plan.md:B7:源代码结构
  - **步骤**：
    - 1) 在 starlit-town/js/ 下创建 animations/ 目录
    - 2) 确保与 FEAT-001 的 starlit-town 结构一致
  - **验证**：
    - [ ] 目录存在且与 plan B7 一致
  - **产物**：`starlit-town/js/animations/`

- [ ] T011 确认 design-system.css 位置（路径：`starlit-town/css/design-system.css`）
  - **依赖**：T010
  - **设计引用**：plan.md:B7；L2_story_detail_design.md:ST-001:功能设计
  - **步骤**：
    - 1) 若 FEAT-001 已创建 starlit-town/css/，则在本 Feature 中引用或创建 design-system.css
    - 2) 与 EPIC design/ 或 ux-design 对齐
  - **验证**：
    - [ ] design-system.css 可被本 Feature 动效变量使用
  - **产物**：`starlit-town/css/design-system.css`（或占位）

---

## 阶段 2：核心基础

**目标**：无独立阻塞性基础设施；依赖 FEAT-001 入口/场景骨架，本阶段为检查点

- [ ] T020 确认 FEAT-001 入口与场景骨架可用（路径：`starlit-town/js/entry/`、`starlit-town/js/map/`）
  - **依赖**：T011
  - **设计引用**：plan.md:前置检查:依赖的共享能力
  - **步骤**：
    - 1) 确认 FEAT-001 的 EntryView/MapView 及场景容器可挂载动效
    - 2) 无代码变更，仅依赖就绪检查
  - **验证**：
    - [ ] FEAT-001 已完成或占位可挂载
  - **产物**：无

**检查点**：可启动 Story 实现

---

## 阶段 3：Story ST-001 - 动效规范与资源（类型：Infrastructure）

**目标**：动效规范文档与 design-system.css 变量（时长、缓动、可爱风）；动效相关资源体积 ≤500KB。各 Feature 可引用统一规范；资源预算达标。

**验证方式（高层）**：资源体积测量 ≤500KB；规范文档可读；NFR-PERF-002。

### ST-001 任务

- [ ] T030 [P] [ST-001] 编写动效规范文档（路径：`specs/epics/EPIC-003-starlit-town/design/css/design-system.css` 或 `FEAT-002` 下 doc）
  - **依赖**：T020
  - **设计引用**：L2_story_detail_design.md:ST-001:功能设计
  - **步骤**：
    - 1) 定义点击反馈时长 ≤300ms、过渡动效 ≤500ms、缓动函数、可爱风原则（圆角、柔和色彩、轻微弹性缓动）
    - 2) 与 ux-design 或 EPIC design 对齐
  - **验证**：
    - [ ] 规范文档可被 ST-002/ST-003 引用
  - **产物**：动效规范文档

- [ ] T031 [P] [ST-001] 在 design-system.css 中定义动效变量（路径：`starlit-town/css/design-system.css`）
  - **依赖**：T020
  - **设计引用**：L2_story_detail_design.md:ST-001:功能设计；plan A8.2
  - **步骤**：
    - 1) 定义 `--anim-duration-click`（≤300ms）、`--anim-duration-transition`（≤500ms）、`--anim-easing` 等变量
    - 2) 实现时引用变量而非魔数
  - **验证**：
    - [ ] 变量可被 animations 模块引用
  - **产物**：`starlit-town/css/design-system.css` 动效变量

- [ ] T032 [ST-001] 整理动效资源清单并控制体积 ≤500KB（路径：`starlit-town/css/`、`starlit-town/assets/` 动效相关）
  - **依赖**：T030、T031
  - **设计引用**：plan A8.2；NFR-PERF-002
  - **步骤**：
    - 1) 列出动效相关 CSS/JS/雪碧图；非首屏可懒加载
    - 2) 构建或打包后测量总体积 ≤500KB
  - **验证**：
    - [ ] 动效资源总体积 ≤500KB
  - **产物**：资源清单、占位/示例资源（可选）

**检查点**：ST-001 完成——规范与资源预算达标

---

## 阶段 4：Story ST-002 - FeedbackConfigService 与 AnimationQueue（类型：Design-Enabler）

**目标**：FeedbackConfigService（getConfig、降级 3 级 full/reduced/off）；AnimationQueue 串行执行；降级时静默不抛错。配置可读、队列不堆叠、异常不阻塞。

**验证方式（高层）**：单元测试队列串行与降级路径（level === 'off' 时不触发动效）；NFR-REL-001。

### ST-002 任务

- [ ] T040 [P] [ST-002] 实现 FeedbackConfig 与 FeedbackConfigService（路径：`starlit-town/js/animations/FeedbackConfigService.js`）
  - **依赖**：T032
  - **设计引用**：L2_story_detail_design.md:ST-002:功能设计:类图；plan A3.2.1
  - **步骤**：
    - 1) 定义 FeedbackConfig（enabled、level: 'full'|'reduced'|'off'）
    - 2) 实现 getConfig() 返回当前配置；可静态配置或运行时检测，不抛错
  - **验证**：
    - [ ] getConfig() 可读；level === 'off' 时调用方不触发动效
  - **产物**：`starlit-town/js/animations/FeedbackConfigService.js`

- [ ] T041 [P] [ST-002] 实现 AnimationQueue（路径：`starlit-town/js/animations/AnimationQueue.js`）
  - **依赖**：T032
  - **设计引用**：plan.md:A3.3:AnimationQueue；L2_story_detail_design.md:ST-002:功能设计
  - **步骤**：
    - 1) 实现 enqueue(task: () => Promise<void>): void；FIFO 队列
    - 2) 内部 run() 串行执行，单次仅一个 task 运行；task 内异常 catch 后静默
  - **验证**：
    - [ ] 单元测试：连续 enqueue 多个任务，串行执行、不堆叠
  - **产物**：`starlit-town/js/animations/AnimationQueue.js`

- [ ] T042 [ST-002] 集成 FeedbackConfigService 与 AnimationQueue 并验证降级路径（路径：`starlit-town/js/animations/`）
  - **依赖**：T040、T041
  - **设计引用**：L2_story_detail_design.md:ST-002:功能设计:失败处理与边界
  - **步骤**：
    - 1) 确保组件通过 getConfig() 与 enqueue() 协作
    - 2) 验证 level === 'off' 时不触发动效；队列异常不阻塞
  - **验证**：
    - [ ] 降级路径与 NFR-REL-001 一致
  - **产物**：集成验证（单元或手测）

**检查点**：ST-002 完成——配置与队列可用

---

## 阶段 5：Story ST-003 - ClickFeedbackComponent 与 TransitionComponent（类型：Functional）

**目标**：ClickFeedbackComponent（attach）；TransitionComponent（enter/leave）；与 AnimationQueue 集成；单次 ≤300ms、过渡 ≤500ms。业务方可挂载统一点击与过渡动效；性能达标。

**验证方式（高层）**：接入测试；单次反馈 ≤300ms、过渡 ≤500ms；NFR-PERF-001、NFR-MEM-001。

### ST-003 任务

- [ ] T050 [ST-003] 实现 ClickFeedbackComponent（路径：`starlit-town/js/animations/ClickFeedbackComponent.js`）
  - **依赖**：T042
  - **设计引用**：plan.md:A3.2.1:ClickFeedbackComponent；L2_story_detail_design.md:ST-003（若存在）
  - **步骤**：
    - 1) 实现 attach(element: HTMLElement): void；绑定点击并经由 AnimationQueue 触发动效
    - 2) 内部 getConfig()，level === 'off' 不触发动效；否则 enqueue(playClickFeedback)，应用 CSS/类名，单次 ≤300ms
  - **验证**：
    - [ ] 点击有统一反馈；连续点击队列串行；NFR-PERF-001 单次 ≤300ms
  - **产物**：`starlit-town/js/animations/ClickFeedbackComponent.js`

- [ ] T051 [ST-003] 实现 TransitionComponent（路径：`starlit-town/js/animations/TransitionComponent.js`）
  - **依赖**：T042
  - **设计引用**：plan.md:B4.1:TransitionComponent；plan A8.2
  - **步骤**：
    - 1) 实现 enter(element, spec?): Promise<void>、leave(element, spec?): Promise<void>
    - 2) 可选 spec 缺省时使用默认过渡（≤500ms）；经 AnimationQueue 执行；资源缺失时 resolve 且不应用动效
  - **验证**：
    - [ ] 过渡动效 ≤500ms；异常时降级不阻塞
  - **产物**：`starlit-town/js/animations/TransitionComponent.js`

- [ ] T052 [ST-003] 导出 B4.1 接口并与 FEAT-001 场景挂载点对接（路径：`starlit-town/js/animations/index.js`、FEAT-001 MapView/EntryView）
  - **依赖**：T050、T051
  - **设计引用**：plan.md:B4.1:本 Feature 对外提供的接口
  - **步骤**：
    - 1) 导出 ClickFeedbackComponent、TransitionComponent、FeedbackConfigService、AnimationSpec/FeedbackConfig
    - 2) 在 FEAT-001 入口/地图或占位页面上挂载点击反馈与过渡（可选示例）
  - **验证**：
    - [ ] 业务方可接入；AC-001～AC-006 验收通过；NFR-MEM-001 增量可控
  - **产物**：`starlit-town/js/animations/index.js`、挂载示例或文档

**检查点**：ST-003 完成——动效组件可用，性能与降级达标

---

## 依赖关系与执行顺序

### 阶段依赖

- **阶段 0**：无依赖
- **阶段 1**：依赖 T001
- **阶段 2**：依赖阶段 1；并依赖 FEAT-001 骨架
- **阶段 3（ST-001）**：依赖阶段 2
- **阶段 4（ST-002）**：依赖 ST-001
- **阶段 5（ST-003）**：依赖 ST-002

### Story 依赖

- **ST-001**：依赖阶段 2
- **ST-002**：依赖 ST-001
- **ST-003**：依赖 ST-002

### 并行执行场景

- ST-001：T030 与 T031 可并行
- ST-002：T040 与 T041 可并行

---

## 并行示例：Story ST-001 / ST-002

```text
# ST-001 可并行：
T030 [P] [ST-001] 编写动效规范文档
T031 [P] [ST-001] 在 design-system.css 中定义动效变量

# ST-002 可并行：
T040 [P] [ST-002] 实现 FeedbackConfigService，路径：starlit-town/js/animations/FeedbackConfigService.js
T041 [P] [ST-002] 实现 AnimationQueue，路径：starlit-town/js/animations/AnimationQueue.js
```

---

## 落地策略

### MVP

1. 阶段 0+1+2 → 环境与依赖就绪
2. ST-001 → 规范与资源预算
3. ST-002 → 配置与队列
4. ST-003 → 点击与过渡组件可接入

### 增量交付

- 每完成一个 Story 即可独立验证（规范→配置/队列→组件）
- 与 FEAT-003/004/005 对接时提供 B4.1 接口

---

## 备注

- 路径与 plan B7 一致；禁止改写 Plan 技术决策
- [P] 表示可并行；[ST-xxx] 关联 Plan Story
