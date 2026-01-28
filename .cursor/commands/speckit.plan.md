---
description: 生成工程级 Plan（Plan-A/Plan-B + Story Breakdown），包含工程决策、风险评估与算法/功耗/性能/内存量化验收指标（本工作流由 SE/TL 在 EPIC 分支产出与维护）。
handoffs:
  - label: 生成任务（Story → Task）
    agent: speckit.tasks
    prompt: 将 Plan 的 Story Breakdown 拆解为可执行 tasks.md
    send: true
  - label: 同步 EPIC 总览（可选）
    agent: speckit.epicsync
    prompt: 将本 Feature 的 plan 进展同步到 EPIC 总览
    send: false
  - label: 创建检查清单
    agent: speckit.checklist
    prompt: 为以下领域创建检查清单……
    send: false
---

## 用户输入

```text
$ARGUMENTS
```

在继续操作前，你**必须**参考用户输入内容（若不为空）。

## 大纲

目标：生成 `plan.md`（工程级蓝图），并在文档内完成：
- **Plan-A**：工程决策、模块架构、关键流程、风险与消解、边界/异常枚举、算法/功耗/性能/内存评估（必须量化 + 验收指标）。
- **Plan-B**：技术规约与实现约束（保留原 spec-kit 约定：技术背景字段、合规性检查、项目结构等）。
- **Story Breakdown**：把 Feature 拆为可开发的技术 Story（ST-xxx），并映射覆盖 FR/NFR。

**方案设计的输入（必须考虑）**：**spec 需求**（spec.md）与 **EPIC 级 epic uidesign**（`specs/epics/<EPIC>/ux-design.md` + Figma 链接 / `design/` 下截图或 HTML）。设计稿在 ux-design.md 的「设计稿索引」中登记，可含「所属 Feature」列。若 epic uidesign 未执行则仅以 spec 为输入。

建议：在 **EPIC 分支** 执行，并确保已通过 `SPECIFY_FEATURE` 选中目标 Feature（避免写入错误目录或造成设计分叉）。

执行步骤：

1. **环境搭建**：从代码库根目录运行 `.specify/scripts/powershell/setup-plan.ps1 -Json`，解析 JSON 得到：
   - `FEATURE_SPEC`（spec.md 路径）
   - `IMPL_PLAN`（plan.md 路径）
   - `SPECS_DIR`、`BRANCH`、`UX_DESIGN`、`DESIGN_DIR`（在 EPIC 工作流下为 **EPIC 级** ux-design 与 design/ 路径）
   - 对于参数中包含单引号（如 "I'm Groot"），使用转义语法：例如 'I'\''m Groot'（或尽可能使用双引号："I'm Groot"）。

2. **加载上下文（只加载必要部分）**：
   - 读取 `FEATURE_SPEC`（提取：Epic/Feature 元信息、FR/NFR、验收与边界场景、依赖）——**spec 需求**为方案设计的主要输入。
   - 若 `UX_DESIGN` 存在（**EPIC 级** ux-design.md，在 EPIC 工作流下由 setup-plan 输出；若为旧版 Feature 级则路径同 FEATURE_DIR/ux-design.md）：读取 ux-design.md，提取**信息架构、跨 Feature 导航、交互规则与状态、视觉规范、设计稿索引**（可按所属 Feature 过滤与本 Feature 相关部分）；按设计稿索引**参考 UI 设计稿**——形式可为 **Figma 链接**、**`DESIGN_DIR` 下截图**、**`DESIGN_DIR` 下 HTML**，用于 A2 全景、A3 组件/协作、Story 的细化与命名；在 plan 中可引用 ux-design 的页面/组件 ID 及对应路径或 Figma 链接。
   - 读取 `.specify/memory/constitution.md`（提取 MUST/SHOULD 约束，作为 Plan 关卡）
   - 读取 `.specify/templates/plan-template.md`（作为结构与输出格式）
   - **注意**：模板中所有图表示例均使用 PlantUML 格式，生成文档时必须严格遵循
   - 按 `.specify/templates/plan-template.md` 填写 `Plan Level`（Lite/Standard/Deep），并确保细化粒度与 Feature 风险匹配（避免小需求过度设计）

3. **填充 Plan-A（工程决策 & 风险评估）**：
   - **对齐要求**：架构、组件、流程、Story 须与 **spec 需求** 及 **EPIC 级 epic uidesign**（若存在：ux-design.md + Figma 链接 / `design/` 下截图或 HTML）对齐。
   - 技术选型：候选对比 + 决策理由（禁止空泛）
   - 模块级架构：0层概览 + 1层模块表（边界/职责/依赖/约束）
   - **模块级详细设计（强制）**：
     - 以 `plan.md:A3.1 组件清单与职责` 为准，`A3.4` 必须 1:1 覆盖所有组件/模块
     - 每个组件/模块必须输出：**类图（1 张）+ 时序图（同图含正常+异常，1 张）+ 流程图（同图含正常+异常，1 张）+ 关键异常清单表**
   - 关键流程：必须同时包含正常与异常流程（使用 PlantUML 流程图 + 易懂文字说明）
   - 风险：给出风险表（风险描述 + 触发条件 + 范围 + 消解策略 + 绑定到 Story/Task）
   - 边界/异常：枚举数据/状态/生命周期/并发/用户行为
   - **算法/功耗/性能/内存评估**：必须量化，并写明验收阈值与测试方法

4. **填充 Plan-B（技术规约 & 实现约束）**：
   - 保留并填写“技术背景”字段（必须保留英文 Key 以供工具链提取）
   - 架构细化、数据模型、接口规范/协议、合规性检查、项目结构

5. **Story Breakdown（Plan 阶段末尾）**：
   - 产出 ST-xxx（Functional / Design-Enabler / Infrastructure / Optimization）
   - 每个 Story 必须标注：覆盖 FR/NFR、依赖、并行性、是否关键风险、验收/验证方式（高层）
   - 输出 Feature → Story 覆盖矩阵（确保 FR/NFR 不遗漏）

6. **写入 `IMPL_PLAN`**：覆盖写入 plan.md（保持模板标题层级）。

7. **可选：更新 Agent 上下文**（若项目使用该能力）：
   - 运行 `.specify/scripts/powershell/update-agent-context.ps1 -AgentType cursor-agent`

8. **完成报告**：输出 `plan.md` 路径、Plan Version、已生成的 Story 数量，并提示下一步：
   - `/speckit.tasks` 生成 tasks.md

核心规则：
- **文档格式要求（强制）**：所有技术图表必须使用 **PlantUML 格式**（`@startuml` / `@enduml`，主题 `mars`），包括但不限于：
  - 类图（classDiagram）
  - 时序图（sequenceDiagram）
  - 流程图（activityDiagram）
  - 组件图（componentDiagram）
  - 部署图（deploymentDiagram）
  - 不得使用 Mermaid 或其他图表格式
- 所有评估（算法/功耗/性能/内存）必须可量化且带验收指标与测试方法。
- 执行主体：**SE/TL（或架构师）**。开发者应将 `plan.md` 视为只读输入；如需变更必须提交变更提案（PR/Issue/评论；建议使用 `.specify/templates/change-request-template.md` 作为 CR 模板）并由 SE/TL 在 EPIC 分支落地后再继续实现。
- Plan 内容是 Implement 的唯一权威输入；Implement 期不得“边写边改设计”。
```