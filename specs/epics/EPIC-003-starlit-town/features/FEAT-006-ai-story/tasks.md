---
description: "Story → Task 落地任务清单：AI 小故事（日记式）"
---

# Tasks：AI 小故事（日记式）

**Epic**：EPIC-003 - 星光小镇（Starlit Town）
**Feature ID**：FEAT-006
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

- [ ] T001 在 `specs/epics/EPIC-003-starlit-town/features/FEAT-006-ai-story/` 中核对 `spec.md`、`plan.md` 的 Version 一致性并补齐变更记录
  - **依赖**：无
  - **设计引用**：N/A
  - **步骤**：1) 确认 Feature/Plan Version 一致 2) 确认 Story Breakdown（ST-001～ST-004）已完成
  - **验证**：[ ] tasks.md 中 Plan Version 与 plan.md 一致
  - **产物**：spec.md、plan.md、tasks.md

---

## 阶段 1：环境搭建

- [ ] T010 创建故事模块目录（路径：`starlit-town/js/story/`、`starlit-town/js/story/templates/`）
  - **依赖**：T001
  - **设计引用**：plan.md:B7:源代码结构
  - **步骤**：1) 创建 story/ 与 templates/ 2) 与 FEAT-001/003/005 的 starlit-town 结构一致
  - **验证**：[ ] 目录与 plan B7 一致
  - **产物**：starlit-town/js/story/、templates/

- [ ] T011 确认 FEAT-003、FEAT-005 契约就绪（路径：`starlit-town/js/town-life/`、`starlit-town/js/relations/`）
  - **依赖**：T010
  - **设计引用**：plan.md:B4.2:本 Feature 依赖的外部接口
  - **步骤**：1) 确认 FEAT-003 getDailySummarySnapshot()、FEAT-005 getRelationSummary() 或等价接口可调用 2) DailySummary、RelationState 结构与 B4.2 一致
  - **验证**：[ ] 可调用并获取输入结构
  - **产物**：无

---

## 阶段 2：核心基础

- [ ] T020 校准与 FEAT-003/005 的输入契约（路径：`starlit-town/js/story/`）
  - **依赖**：T011
  - **设计引用**：plan.md:B2:架构细化；B4.2
  - **步骤**：1) 确认表示层不直连 FEAT-003/005 或 AI；业务层通过 StoryController 统一拉取 2) 超时 5 秒、敏感词+模板兜底
  - **验证**：[ ] 与 Plan-B 约束一致
  - **产物**：无

**检查点**：可启动 Story 实现

---

## 阶段 3：Story ST-001 - 输入契约与当日数据聚合（Infrastructure）

**目标**：对接 FEAT-003 getDailySummarySnapshot()、FEAT-005 getRelationSummary() 或约定键；DailySummary 结构与 B4.2 一致。可获取当日事件与关系摘要，作为故事输入。

**验证方式**：契约调用与数据结构单元测试；NFR-REL-001。

### ST-001 任务

- [ ] T030 [ST-001] 实现当日数据聚合层（路径：`starlit-town/js/story/input-aggregator.js` 或 StoryController 内）
  - **依赖**：T020
  - **设计引用**：plan.md:B4.2；L2_story_detail_design.md:ST-001:功能设计
  - **步骤**：1) 调用 FEAT-003 getDailySummarySnapshot()、FEAT-005 getRelationSummary() 2) 组装 DailySummary（date, events, moodId, relationSummary）；依赖不可用时返回空或默认结构
  - **验证**：[ ] 契约调用与 DailySummary 结构测试通过；无依赖时兜底不崩溃
  - **产物**：输入聚合逻辑

**检查点**：ST-001 完成——故事输入可获取

---

## 阶段 4：Story ST-002 - TemplateEngine 与模板库（Design-Enabler）

**目标**：模板库（无活动/有场景/有事件/有互动等）；模板选择逻辑与 DailySummary 匹配；50–150 字日记式输出；敏感词过滤与兜底。无 AI 或降级时 100% 可输出合规故事。

**验证方式**：模板选择与输出、敏感词兜底测试；NFR-REL-001、NFR-SEC-001。

### ST-002 任务

- [ ] T040 [P] [ST-002] 定义模板库与选择条件（路径：`starlit-town/js/story/templates/`）
  - **依赖**：T030
  - **设计引用**：plan.md:A3.3:TemplateEngine；L2_story_detail_design.md:ST-002:功能设计:类图
  - **步骤**：1) 模板按条件（无活动、有场景、有事件、有互动等）与 DailySummary 匹配 2) 每模板 50–150 字日记式；占位符（日期、事件摘要、关系摘要） 3) 默认「今天休息了一下」等
  - **验证**：[ ] 各条件可匹配到模板；输出字数在 50–150
  - **产物**：starlit-town/js/story/templates/ 模板配置或模块

- [ ] T041 [ST-002] 实现 TemplateEngine（路径：`starlit-town/js/story/TemplateEngine.js`）
  - **依赖**：T040
  - **设计引用**：L2_story_detail_design.md:ST-002:功能设计:时序图
  - **步骤**：1) selectAndFill(summary): 按 summary 匹配模板、填充占位符、输出字符串 2) 无匹配时使用默认模板
  - **验证**：[ ] 单元测试：不同 summary 产出对应故事文本
  - **产物**：starlit-town/js/story/TemplateEngine.js

- [ ] T042 [ST-002] 实现敏感词过滤与模板兜底（路径：`starlit-town/js/story/content-filter.js` 或 TemplateEngine 内）
  - **依赖**：T041
  - **设计引用**：plan A4 RISK-002；NFR-SEC-001
  - **步骤**：1) 输出前敏感词过滤；不通过则替换为安全兜底句或换用保守模板 2) 不向用户展示不当内容
  - **验证**：[ ] 敏感词兜底测试通过；儿童合规
  - **产物**：敏感词过滤与兜底逻辑

**检查点**：ST-002 完成——模板路径 100% 可用

---

## 阶段 5：Story ST-003 - StoryController 与 AIClient（可选）（Design-Enabler）

**目标**：StoryController 协调输入、调用 TemplateEngine 或 AIClient；超时 5 秒降级模板；AIClient 可选（外部 AI），失败即走模板。入口可触发生成；AI 故障时 100% 降级，不空白不崩溃。

**验证方式**：超时与降级路径测试；日志/埋点；NFR-PERF-001、NFR-REL-001、NFR-OBS-001。

### ST-003 任务

- [ ] T050 [P] [ST-003] 实现 AIClient（可选）（路径：`starlit-town/js/story/AIClient.js`）
  - **依赖**：T042
  - **设计引用**：plan.md:A3.3:AIClient；plan A8
  - **步骤**：1) generate(summary): 调用外部 AI API；超时 5 秒；失败返回 failure 由 StoryController 走模板 2) 最小化上报数据，符合隐私与儿童合规
  - **验证**：[ ] 超时 5 秒后返回 failure；不阻塞主流程
  - **产物**：starlit-town/js/story/AIClient.js（可选）

- [ ] T051 [ST-003] 实现 StoryController（路径：`starlit-town/js/story/StoryController.js`）
  - **依赖**：T042、T050
  - **设计引用**：plan.md:A3.2.2:SEQ-001、SEQ-002；L2_story_detail_design.md:ST-003（若存在）
  - **步骤**：1) getStory(): 拉取 DailySummary（ST-001 聚合）；若使用 AI 则调用 AIClient.generate，成功且合规则敏感词过滤后返回，超时/失败/不合规则 TemplateEngine.selectAndFill 降级 2) 仅模板模式：直接 TemplateEngine.selectAndFill 3) 100% 返回 StoryOutput（content 50–150 字、source、generatedAt）；入口响应 ≤500ms（不含 AI 等待时）
  - **验证**：[ ] AI 不可用/超时/限流时 100% 模板；内容不合规时过滤+兜底；NFR-OBS-001 可日志
  - **产物**：starlit-town/js/story/StoryController.js

- [ ] T052 [ST-003] 实现 B4.2 与 FEAT-003/005 调用（路径：`starlit-town/js/story/StoryController.js`）
  - **依赖**：T051
  - **设计引用**：plan.md:B4.2
  - **步骤**：1) 在 getStory 内调用 FEAT-003 getDailySummarySnapshot、FEAT-005 getRelationSummary 获取输入 2) 与 ST-001 聚合一致
  - **验证**：[ ] 契约调用正确；无依赖时默认输入不崩溃
  - **产物**：B4.2 契约实现

**检查点**：ST-003 完成——故事生成与降级可用

---

## 阶段 6：Story ST-004 - 今天的故事视图（Functional）

**目标**：故事展示视图（日记式、50–150 字）；由 FEAT-003 总结入口进入；与 StoryController 绑定；加载态与错误态。用户可在晚上进入并看到故事；响应 ≤500ms；AI 故障时仍见模板故事。

**验证方式**：E2E/手动：入口→故事展示；降级场景；NFR-PERF-001、NFR-MEM-001。

### ST-004 任务

- [ ] T060 [ST-004] 实现 StoryView（路径：`starlit-town/js/story/StoryView.js`）
  - **依赖**：T052
  - **设计引用**：plan.md:A3.1.2.1:StoryView
  - **步骤**：1) 展示「今天的故事」日记式文案；调用 StoryController.getStory() 获取 StoryOutput 2) 加载态与错误态（降级时仍展示模板，不暴露异常）
  - **验证**：[ ] 用户可见故事；入口响应 ≤500ms（不含 AI 等待）；AI 故障时见模板
  - **产物**：starlit-town/js/story/StoryView.js

- [ ] T061 [ST-004] 与 FEAT-003 总结入口衔接（路径：`starlit-town/js/town-life/SummaryEntryView.js`、`starlit-town/js/story/`）
  - **依赖**：T060
  - **设计引用**：plan.md:B4.2:FEAT-003；A2.1.1
  - **步骤**：1) FEAT-003 navigateToStory 导航至本 Feature 的 StoryView；或 StoryView 拉取快照 2) 当次可展示，不强制持久化历史
  - **验证**：[ ] AC-001～AC-006 验收通过；NFR-MEM-001 内存可控
  - **产物**：与 FEAT-003 入口衔接

**检查点**：ST-004 完成——今天的故事可展示

---

## 依赖关系与执行顺序

### 阶段依赖

- 阶段 0 → 1 → 2 → 3（ST-001）→ 4（ST-002）→ 5（ST-003）→ 6（ST-004）

### Story 依赖

- ST-001 依赖阶段 2；依赖 FEAT-003、FEAT-005 契约
- ST-002 依赖 ST-001
- ST-003 依赖 ST-002
- ST-004 依赖 ST-003

### 并行执行场景

- ST-002：T040 与 T041 可部分并行（T041 依赖 T040 模板结构）
- ST-003：T050（AIClient）可选，与 T051 可部分并行

---

## 落地策略

### MVP

1. 阶段 0+1+2 + ST-001 + ST-002 → 输入与模板就绪；可仅模板出故事
2. ST-003（含可选 AIClient）→ 生成与降级完整
3. ST-004 → 用户可进入并看到故事

### 增量交付

- 先模板路径验收，再可选接入 AI；每 Story 独立验证

---

## 备注

- 路径与 plan B7 一致；禁止改写 Plan
- [ST-xxx] 关联 Plan Story；[P] 表示可并行
- AI 为可选；超时 5 秒与 100% 模板降级为硬性要求
