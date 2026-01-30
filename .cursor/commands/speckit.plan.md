---
description: 生成工程级 Plan（Plan-A/Plan-B + Story Breakdown），支持分阶段输出（Lite/Standard/Deep），包含工程决策、风险评估与算法/功耗/性能/内存量化验收指标（本工作流由 SE/TL 在 EPIC 分支产出与维护）。
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

## 分阶段输出说明

Plan 支持通过 `$ARGUMENTS` 指定输出阶段，**若不指定参数则默认使用 Lite**。

| 阶段 | 参数 | 输出内容 | 适用场景 |
|------|------|----------|----------|
| **Lite**（默认） | `--phase=lite` 或不指定 | A0、A1、A2、A3.1、A3.2、Story Breakdown、Plan-B | 小改动/低风险功能 |
| **Standard** | `--phase=standard` | A3.3（组件详细设计）、A4-A11（风险/边界/评估） | 中等复杂度功能 |
| **Deep** | `--phase=deep` | Story Detailed Design（L2 二层详细设计） | 新契约/迁移/高风险功能 |

**执行顺序**：Lite → Standard → Deep（每个阶段基于前一阶段的输出增量追加）

**用法示例**：
- `/speckit.plan` — 默认执行 Lite 阶段
- `/speckit.plan --phase=standard` — 执行 Standard 阶段（需先完成 Lite）
- `/speckit.plan --phase=deep` — 执行 Deep 阶段（需先完成 Standard）
- `/speckit.plan --phase=all` — 一次性执行所有阶段

### 各阶段输出范围详解

#### Lite 阶段（基础框架 + Story 拆分）

| 章节 | 内容 |
|------|------|
| **A0** | 领域概念（词汇表 + 概念关系图） |
| **A1** | 技术选型（候选方案对比 + 决策） |
| **A2** | Feature 全景架构（0 层框架图 + 外部依赖） |
| **A3.1** | 第一层：整体框架设计（内部框架图 + 组件清单 + 协作时序图） |
| **A3.2** | 第二层：Feature 全景（全景类图 + Feature 时序图集 + 流程图集） |
| **Plan-B** | 技术规约（B0-B7：技术背景、架构、数据模型、接口、合规、项目结构） |
| **Story Breakdown** | Story 列表 + 依赖关系 + FR/NFR 覆盖矩阵 |

#### Standard 阶段（组件详细设计 + 风险/评估）

| 章节 | 内容 |
|------|------|
| **A3.3** | 第三层：组件内部详细设计（复杂组件的类图/时序图/流程图/异常清单） |
| **A4** | 技术风险与消解策略 |
| **A5** | 边界 & 异常场景枚举（场景 → 应对措施对照表） |
| **A6** | 算法评估（如适用） |
| **A7** | 功耗评估 |
| **A8** | 性能评估 |
| **A9** | 内存评估 |
| **A10** | 安全评估（如适用） |
| **A11** | 兼容性评估 |

#### Deep 阶段（Story 级落码设计）

| 章节 | 内容 |
|------|------|
| **Story Detailed Design** | 每个 ST-xxx 的 L2 二层详细设计：目标/DoD、代码落点、核心接口/契约、类图、时序图、异常矩阵、并发/资源管理、测试设计 |

---

## 大纲

目标：生成 `plan.md`（工程级蓝图），**按指定阶段**输出内容：
- **Lite（默认）**：A0-A2、A3.1-A3.2、Plan-B、Story Breakdown
- **Standard**：A3.3（组件详细设计）、A4-A11（风险/边界/评估）
- **Deep**：Story Detailed Design（L2 二层详细设计）

**方案设计的输入（必须考虑）**：**spec 需求**（spec.md）与 **EPIC 级 epic uidesign**（`specs/epics/<EPIC>/ux-design.md` + Figma 链接 / `design/` 下截图或 HTML）。设计稿在 ux-design.md 的「设计稿索引」中登记，可含「所属 Feature」列。若 epic uidesign 未执行则仅以 spec 为输入。

建议：在 **EPIC 分支** 执行，并确保已通过 `SPECIFY_FEATURE` 选中目标 Feature（避免写入错误目录或造成设计分叉）。

执行步骤：

1. **环境搭建**：从代码库根目录运行 `.specify/scripts/powershell/setup-plan.ps1 -Json`，解析 JSON 得到：
   - `FEATURE_SPEC`（spec.md 路径）
   - `IMPL_PLAN`（plan.md 路径）
   - `SPECS_DIR`、`BRANCH`、`UX_DESIGN`、`DESIGN_DIR`（在 EPIC 工作流下为 **EPIC 级** ux-design 与 design/ 路径）
   - 对于参数中包含单引号（如 "I'm Groot"），使用转义语法：例如 'I'\''m Groot'（或尽可能使用双引号："I'm Groot"）。

2. **解析阶段参数**：
   - 从 `$ARGUMENTS` 中解析 `--phase=xxx`，若未指定则默认 `lite`
   - 有效值：`lite`、`standard`、`deep`、`all`
   - **阶段前置检查**：
     - `standard` 阶段：检查 plan.md 是否已包含 A3.2（Lite 阶段产出），若无则提示先执行 Lite
     - `deep` 阶段：检查 plan.md 是否已包含 A4-A11（Standard 阶段产出），若无则提示先执行 Standard

3. **加载上下文（只加载必要部分）**：
   - 读取 `FEATURE_SPEC`（提取：Epic/Feature 元信息、FR/NFR、验收与边界场景、依赖）——**spec 需求**为方案设计的主要输入。
   - 若 `UX_DESIGN` 存在（**EPIC 级** ux-design.md，在 EPIC 工作流下由 setup-plan 输出；若为旧版 Feature 级则路径同 FEATURE_DIR/ux-design.md）：读取 ux-design.md，提取**信息架构、跨 Feature 导航、交互规则与状态、视觉规范、设计稿索引**（可按所属 Feature 过滤与本 Feature 相关部分）；按设计稿索引**参考 UI 设计稿**——形式可为 **Figma 链接**、**`DESIGN_DIR` 下截图**、**`DESIGN_DIR` 下 HTML**，用于 A2 全景、A3 组件/协作、Story 的细化与命名；在 plan 中可引用 ux-design 的页面/组件 ID 及对应路径或 Figma 链接。
   - 读取 `.specify/memory/constitution.md`（提取 MUST/SHOULD 约束，作为 Plan 关卡）
   - 读取 `.specify/templates/plan-template.md`（作为结构与输出格式）
   - **注意**：模板中所有图表示例均使用 Mermaid 格式，生成文档时必须严格遵循 `.cursor/rules/mermaid-style-guide.mdc` 配色规范
   - 按 `.specify/templates/plan-template.md` 填写 `Plan Level`（Lite/Standard/Deep），并确保细化粒度与 Feature 风险匹配（避免小需求过度设计）

4. **根据阶段执行对应内容**：

   #### 4.1 Lite 阶段（默认）
   
   填充以下内容：
   - **Plan 前置检查**：依赖的共享能力、本 Feature 提供的共享能力
   - **概述**：核心需求 + 关键工程决策
   - **A0 领域概念**：词汇表 + 概念关系图
   - **A1 技术选型**：候选对比 + 决策理由（禁止空泛）
   - **A2 Feature 全景架构**：0 层框架图 + 外部依赖清单 + 通信约束
   - **A3.1 第一层设计**：内部框架图 + 组件清单与职责 + 组件协作时序图 + 关键设计决策
   - **A3.2 第二层设计**：全景类图 + Feature 时序图集 + Feature 流程图集
   - **Plan-B（B0-B7）**：技术背景、架构细化、数据模型、接口规范、合规性检查、项目结构
   - **Story Breakdown**：ST-xxx 列表 + 依赖关系图 + FR/NFR 覆盖矩阵 + 工作量汇总
   
   #### 4.2 Standard 阶段
   
   在 Lite 基础上追加：
   - **A3.3 第三层设计**（组件详细设计）：对需要细化的组件产出类图/时序图/流程图/异常清单
   - **A4 技术风险与消解策略**：风险表（绑定 Story/Task）
   - **A5 边界 & 异常场景枚举**：场景 → 应对措施对照表
   - **A6 算法评估**（如适用）：客观指标 + 主观指标 + 降级策略
   - **A7 功耗评估**：Top 5% 用户模型 + 场景评估 + 验收标准
   - **A8 性能评估**：测试基线 + 场景指标 + 降级策略
   - **A9 内存评估**：场景指标 + 增量分解 + 泄漏风险点
   - **A10 安全评估**（如适用）：数据安全 + 权限安全 + 合规性
   - **A11 兼容性评估**：系统版本 + 设备 + 屏幕 + 网络 + 数据库升级 + APK 版本升级
   
   #### 4.3 Deep 阶段
   
   在 Standard 基础上追加：
   - **Story Detailed Design（L2）**：对每个 ST-xxx 产出：
     - 目标 & DoD
     - 代码落点与边界
     - 核心接口与数据契约
     - 技术路径实现说明 + 类图 + 关键类职责
     - 时序图（含正常+异常）
     - 异常矩阵
     - 并发/生命周期/资源管理
     - 验证与测试设计

5. **写入 `IMPL_PLAN`**：
   - **Lite 阶段**：覆盖写入 plan.md
   - **Standard/Deep 阶段**：增量追加到 plan.md（保留已有内容）
   - 更新文档头部 `Plan Level` 为当前执行的最高阶段

6. **可选：更新 Agent 上下文**（若项目使用该能力）：
   - 运行 `.specify/scripts/powershell/update-agent-context.ps1 -AgentType cursor-agent`

7. **完成报告**：输出：
   - `plan.md` 路径
   - Plan Version
   - 当前执行的阶段
   - 已生成的章节清单
   - **下一步提示**：
     - Lite 完成后：提示 `/speckit.plan --phase=standard` 或 `/speckit.tasks`
     - Standard 完成后：提示 `/speckit.plan --phase=deep` 或 `/speckit.tasks`
     - Deep 完成后：提示 `/speckit.tasks`

核心规则：
- **文档格式要求（强制）**：所有技术图表必须使用 **Mermaid 格式**，遵循 `.cursor/rules/mermaid-style-guide.mdc` 中的 Material Design 配色方案，包括但不限于：
  - 类图（classDiagram）
  - 时序图（sequenceDiagram）
  - 流程图（flowchart）
  - 架构图（flowchart + subgraph）
- **分阶段执行规则**：
  - Standard 阶段必须在 Lite 完成后执行
  - Deep 阶段必须在 Standard 完成后执行
  - 使用 `--phase=all` 可一次性执行所有阶段
- 所有评估（算法/功耗/性能/内存）必须可量化且带验收指标与测试方法。
- 执行主体：**SE/TL（或架构师）**。开发者应将 `plan.md` 视为只读输入；如需变更必须提交变更提案（PR/Issue/评论；建议使用 `.specify/templates/change-request-template.md` 作为 CR 模板）并由 SE/TL 在 EPIC 分支落地后再继续实现。
- Plan 内容是 Implement 的唯一权威输入；Implement 期不得"边写边改设计"。
