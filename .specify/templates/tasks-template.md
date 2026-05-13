---
description: "Story → Task 落地任务清单模板"
---

# Tasks：[Feature 名称]

**Epic**：EPIC-[编号] - [名称]
**Feature ID**：FEAT-[编号，例如 001]
**Feature Version**：v0.1.0（来自 `spec.md`）
**Plan Version**：v0.1.0（来自 `plan.md`）
**Tasks Version**：v0.1.0
**输入**：来自 `Feature 目录/` 的设计文档（`spec.md`、`plan.md` 以及可选工件）

> 规则：
> - Task 只能拆解与执行 **EPIC 软件设计说明书** 与 **plan.md** 中既定的 Story；**禁止**在 tasks.md 里改写技术决策或新增未决策的方案。
> - 每个 Task 必须包含：执行步骤、依赖关系（顺序/并行）、验证方式（可执行/可量化）。
> - 每个 Task 必须提供**设计引用**：指向 EPIC 软件设计说明书（或各 Feature 的 `l2_design/ST-xxx_<slug>.md`）中对应 ST-xxx 的小节/类图/时序图。

## Task 行格式（首行必须严格遵循）

```text
- [ ] T001 [P?] [ST-001] <带路径的任务标题>
```

- **复选框**：必须以 `- [ ]` 开头（完成后改为 `- [x]`）
- **任务 ID**：T001、T002…（全局递增）
- **[P]**：可并行执行（不改同一文件，且无依赖）
- **[ST-xxx]**：必须绑定到 `epic-design.md` §十二中的 Story ID
- **路径**：必须写出影响的关键文件路径（真实路径）

### Task 详细信息（紧随首行的子项）

- **依赖**：T???（无则写“无”）
- **设计引用**：
  - 架构级：`epic-design.md:§一～§六 架构与边界`
  - 关键设计级（若有）：`key-func-design/KD_001_<slug>.md:关键类图/核心调用链时序图`
  - Story 级（复杂/高风险 Story）：`l2_design/ST-xxx_<slug>.md:功能设计:类图/时序图`
  - 简单 Story 无独立 L2 时：引用 `epic-design.md:§十三 L2 索引` 中的承接说明，并在本 Task 的 DoD 写清验证条件
- **步骤**：
  - 1) …
  - 2) …
- **验证**：
  - [ ] 单元/集成/手动验证步骤（可执行）
  - [ ] 指标（如 p95、mAh、内存 MB）与阈值（如适用）
- **产物**：涉及的文件/文档/脚本

## 路径约定（按 plan.md 的结构决策为准）

- **Android 移动端**（默认）：
  - 源码：`app/src/main/java/[包路径]/`（按分层组织：`ui/`、`domain/`、`data/`）
  - 单元测试：`app/src/test/java/[包路径]/`
  - 仪器测试：`app/src/androidTest/java/[包路径]/`
  - 资源：`app/src/main/res/`
- **多模块项目**：按 `:feature:xxx`、`:core:data` 等模块名替换 `app/`
- **其他项目类型**：按实际工程结构

<!--
============================================================================
重要提示：以下内容为示例，用于说明格式与逻辑。

/aisdd.featuretasks 命令必须基于以下内容替换为实际任务：
- epic-design.md §十二 Story 拆解（ST-xxx）
- spec.md 的 FR/NFR（用于验证与追溯）
- （可选）data-model.md、contracts/、research.md、quickstart.md

任务必须按 Story（ST-xxx）组织，确保每个 Story：
- 可独立实现
- 可独立验证（验收方式明确）
- 明确与 FR/NFR 的追溯关系

生成的 tasks.md 文件中请勿保留这些示例任务。
============================================================================
-->

## 阶段 0：准备（可选但建议）

**目标**：对齐版本、冻结设计输入，避免 Implement 期返工

- [ ] T001 在 `specs/[###-feature-short-name]/` 中核对 `spec.md`、`plan.md`、EPIC 软件设计说明书（若存在）的 Version 字段一致性，并在本 `tasks.md` 中记录输入基线
  - **依赖**：无
  - **步骤**：
    - 1) 确认 `Feature Version`、`Plan Version` 已填写
    - 2) 确认 EPIC 软件设计说明书中的 Story 拆解已完成（ST-xxx）
  - **验证**：
    - [ ] tasks.md 中 `Plan Version` 与 plan.md 一致
  - **产物**：`spec.md`、`plan.md`、`tasks.md`

---

## 阶段 1：环境搭建（共享基础设施）

**目标**：项目初始化与基础结构搭建

- [ ] T010 按照 plan.md 的“结构决策”创建项目目录结构（路径：`[真实目录]`）
  - **依赖**：T001
  - **步骤**：
    - 1) 创建/调整目录
    - 2) 确保与现有模块边界一致
  - **验证**：
    - [ ] 目录结构与 plan.md 一致
  - **产物**：相关目录

- [ ] T011 初始化构建与依赖（路径：`[真实文件，如 build.gradle.kts / package.json]`）
  - **依赖**：T010
  - **步骤**：
    - 1) …
  - **验证**：
    - [ ] 基础构建可通过（本地构建/测试命令）
  - **产物**：构建文件

- [ ] T012 [P] 配置代码检查与格式化工具（路径：`[真实配置文件]`）
  - **依赖**：T011
  - **步骤**：
    - 1) …
  - **验证**：
    - [ ] lint/format 命令可运行
  - **产物**：配置文件

---

## 阶段 2：核心基础（阻塞性前置条件，阻塞所有 Story）

**目标**：所有 Story 实现前必须完成的核心基础设施搭建

**关键**：此阶段完成前，任何 Story 相关工作均不可启动

核心基础任务示例（可根据项目调整）：

- [ ] T020 搭建/校准公共基础设施（按 epic-plan 与 plan.md 的架构约束）
  - **依赖**：T012
  - **步骤**：
    - 1) …
  - **验证**：
    - [ ] 与 epic-plan 及 plan.md 约束一致（分层/错误处理/日志规范）
  - **产物**：基础设施代码

**检查点**：基础层就绪——Story 实现可并行启动

---

## 阶段 3：Story ST-001 - [标题]（类型：Functional/…）

**目标**：[来自 plan.md 的 ST-001 目标]

**验证方式（高层）**：[来自 plan.md；此处细化为可执行验证]

### ST-001 任务

- [ ] T100 [P] [ST-001] 编写/更新对应验证（路径：`[tests/... 或验证脚本]`）
  - **依赖**：T020
  - **步骤**：
    - 1) …
  - **验证**：
    - [ ] 该验证在实现前失败（如适用）
  - **产物**：测试/脚本

- [ ] T101 [ST-001] 实现核心能力（路径：`[src/... 实际文件]`）
  - **依赖**：T100
  - **步骤**：
    - 1) …
  - **验证**：
    - [ ] 对应验证通过
    - [ ] 相关 NFR 指标未超阈值（如适用）
  - **产物**：实现代码

**检查点**：至此，ST-001 应具备完整功能且可独立测试

---

## 阶段 4：Story ST-002 - [标题]（类型：…）

**目标**：[该故事交付能力的简要描述]

**独立测试方式**：[验证该故事独立可用的方法]

### ST-002 测试（可选——仅在要求测试时添加）

- [ ] T200 [P] [ST-002] ViewModel 单元测试，路径：`app/src/test/java/[包路径]/[Feature]ViewModelTest.kt`
- [ ] T201 [P] [ST-002] Repository 集成测试，路径：`app/src/androidTest/java/[包路径]/[Feature]RepositoryTest.kt`

### ST-002 实现

- [ ] T202 [P] [ST-002] 创建 [实体] Entity/DTO，路径：`app/src/main/java/[包路径]/data/model/[Entity].kt`
- [ ] T203 [ST-002] 实现 Repository，路径：`app/src/main/java/[包路径]/data/repository/[Feature]Repository.kt`
- [ ] T204 [ST-002] 实现 ViewModel，路径：`app/src/main/java/[包路径]/ui/[feature]/[Feature]ViewModel.kt`
- [ ] T205 [ST-002] 与 ST-001 的组件集成（如有需要）

**检查点**：至此，ST-001 和 ST-002 均应能独立运行

---

## 阶段 5：Story ST-003 - [标题]（类型：…）

**目标**：[该故事交付能力的简要描述]

**独立测试方式**：[验证该故事独立可用的方法]

### ST-003 测试（可选——仅在要求测试时添加）

- [ ] T300 [P] [ST-003] Screen/Composable UI 测试，路径：`app/src/androidTest/java/[包路径]/ui/[feature]/[Feature]ScreenTest.kt`
- [ ] T301 [P] [ST-003] UseCase 单元测试，路径：`app/src/test/java/[包路径]/domain/[Feature]UseCaseTest.kt`

### ST-003 实现

- [ ] T302 [P] [ST-003] 创建 [实体] Entity/DTO，路径：`app/src/main/java/[包路径]/data/model/[Entity].kt`
- [ ] T303 [ST-003] 实现 UseCase/业务逻辑，路径：`app/src/main/java/[包路径]/domain/[Feature]UseCase.kt`
- [ ] T304 [ST-003] 实现 Compose Screen，路径：`app/src/main/java/[包路径]/ui/[feature]/[Feature]Screen.kt`

**检查点**：所有 Story 至此应均可独立运行

---

[按需添加更多 Story 阶段，遵循相同格式]

---

## 依赖关系与执行顺序

### 阶段依赖

- **环境搭建（阶段 1）**：无依赖——可立即启动
- **核心基础（阶段 2）**：依赖环境搭建完成——阻塞所有 Story
- **Story（阶段 3+）**：均依赖核心基础阶段完成
    - 完成后，各 Story 可并行推进（如有资源）
    - 或按优先级顺序串行推进（P1 → P2 → P3）
- **优化完善（最终阶段）**：依赖所有目标 Story 完成

### Story 依赖

- **ST-001**：依赖阶段 2 完成
- **ST-002**：依赖 ST-001（若有）/阶段 2
- **ST-003**：依赖 …

### 单 Story 内部顺序

- 测试用例（如有）必须先编写并确保执行失败后，再开展实现工作
- 模型层开发先于服务层
- 服务层开发先于端点层
- 核心功能实现先于集成工作
- 本 Story 完成后，再推进下一优先级 Story

### 并行执行场景

- 所有标记 [P] 的环境搭建任务可并行
- 所有标记 [P] 的核心基础任务可并行（阶段 2 内）
- 核心基础阶段完成后，所有 Story 可并行启动（如团队容量允许）
- 单 Story 下所有标记 [P] 的测试任务可并行
- 单 Story 内标记 [P] 的模型开发任务可并行
- 不同团队成员可并行开发不同 Story

---

## 并行示例：Story ST-001

```bash
# 批量启动 ST-001 的可并行任务（示例）：
任务："[ST-001] 编写 ViewModel 单元测试，路径：app/src/test/java/.../FeatureViewModelTest.kt"
任务："[ST-001] 创建 Entity 数据模型，路径：app/src/main/java/.../data/model/Feature.kt"
```

---

## 落地策略

### 先完成 MVP（优先完成关键 Story 集合）

1. 完成阶段 1：环境搭建
2. 完成阶段 2：核心基础（关键——阻塞所有 Story）
3. 完成阶段 3：Story ST-001
4. **暂停并验证**：独立验证 ST-001
5. 如就绪，进行部署/演示

### 增量交付

1. 完成环境搭建 + 核心基础 → 基础层就绪
2. 新增 ST-001 → 独立验证 → 部署/演示（MVP！）
3. 新增 ST-002 → 独立验证 → 部署/演示
4. 新增 ST-003 → 独立验证 → 部署/演示
5. 每个 Story 均需在不破坏已有 Story 的前提下新增价值

### 团队并行策略

多开发者协作场景：

1. 团队共同完成环境搭建 + 核心基础
2. 核心基础完成后：
    - 开发者 A：负责 ST-001
    - 开发者 B：负责 ST-002
    - 开发者 C：负责 ST-003
3. 各 Story 独立完成后集成

---

## 备注

- [P] 标记的任务 = 涉及不同文件，无依赖关系
- [ST-xxx] 标签将任务关联至 `epic-design.md` §十二的 Story，便于追溯
- 每个 Story 需可独立完成、独立验证
- 实现前验证测试用例执行失败
- 完成单个任务或逻辑分组后提交代码
- 可在任意检查点暂停，独立验证对应 Story
- 避免：模糊的任务描述、同一文件冲突、破坏独立性的跨 Story 依赖