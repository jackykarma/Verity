---
description: "执行实施计划，处理 tasks.md 中的 Task（在 EPIC 分支上实施；严格遵循已冻结的 spec/tech-spec/epic-design/tasks）。支持全量、按 ST-xxx Story 或按 Txxx Task 指定范围执行。"
---

## 用户输入

```text
$ARGUMENTS
```

在继续操作前，你**必须**解析用户输入（若不为空），确定**执行范围**（见下文「范围参数」）。

## 范围参数

| 参数 | 行为 | 执行集合 |
|------|------|----------|
| **无参数** / **`all`** | **全量**：执行 `tasks.md` 中全部未完成 Task | 所有 `- [ ]` Task（按阶段与依赖顺序） |
| **`ST-xxx`**（可多个，空格或逗号分隔） | **Story 范围**：执行指定 Story 的未完成 Task | 目标 Story 的 Task + **依赖闭包**（见下文） |
| **`Txxx`**（可多个，空格或逗号分隔，如 `T101`） | **Task 范围**：执行指定 Task | 目标 Task + **依赖闭包**（见下文） |
| **`-h`** | 仅输出参数帮助 | 不执行代码 |

**示例**：

```text
/aisdd.implement
/aisdd.implement all
/aisdd.implement ST-401
/aisdd.implement ST-401 ST-402
/aisdd.implement T011
/aisdd.implement T011 T012 T013
/aisdd.implement -h
```

**`-h` 帮助输出**：当且仅当参数为 `-h` 时，输出上方「范围参数」表格、示例与「依赖闭包规则」摘要作为帮助，不执行代码。

**参数互斥**：`all` 与 `ST-xxx` / `Txxx` 不可混用；`ST-xxx` 与 `Txxx` 不可混用（一次只选 Story 或 Task 维度）。

**不支持 `--force`**：已标记 `[x]` 的 Task 跳过，不重做。

## 依赖闭包规则

从 `tasks.md` 解析每个 Task 的 **依赖** 字段（`T???` 或「无」），构建执行集合：

1. **起始集**：
   - 全量：所有 `- [ ]` Task
   - Story：所有带 `[ST-xxx]` 且 `- [ ]` 的 Task（`ST-xxx` 在参数列表中）
   - Task：参数中的 `Txxx` 且 `- [ ]` 的 Task
2. **扩展**：对起始集中每个 Task，将其依赖的 `T???` 若仍为 `- [ ]`，加入执行集；递归直至闭包稳定
3. **跳过**：已为 `- [x]` 的 Task 不加入执行集（依赖已满足）
4. **排序**：按 `tasks.md` 阶段顺序 + Task ID 顺序 + 依赖拓扑排序执行；影响同一文件的任务须顺序执行

**Story 模式额外规则**：

- 若目标 Story 在 `tasks.md` 中**无 Task**，终止并提示先运行 `/aisdd.featuretasks ST-xxx`
- 闭包可能包含阶段 0～2 或其他 Story 的 Task（当目标 Task 依赖它们时）
- 完成验证时：以目标 Story 的检查点/验证方式为范围，不要求其他 Story 已完成

**Task 模式额外规则**：

- 若指定 `Txxx` 不存在或已为 `[x]`，在报告中说明并跳过/终止（全部无效则终止）
- 完成验证时：仅验证本次执行集内 Task 的验证项

## 前置条件

| 模式 | 前置条件 |
|------|----------|
| **全量** | 本 Feature 的 `tasks.md` 已生成（建议全部 Story 均有 Task） |
| **Story** | `tasks.md` 中目标 Story 已有 Task |
| **Task** | `tasks.md` 中存在目标 `Txxx` |

**不要求**事先运行 `/aisdd.analyze`（可选、非阻塞；未运行不得作为拒绝实现的理由）。

## 大纲

1. 从代码库根目录运行 `.specify/scripts/powershell/check-prerequisites.ps1 -Json -RequireTasks -IncludeTasks`，并解析 FEATURE_DIR（功能目录）和 AVAILABLE_DOCS（可用文档）列表。所有路径必须为绝对路径。

2. **解析范围参数**：从 `$ARGUMENTS` 解析：
   - `-h` → 仅输出上方帮助，终止
   - 无参数 / `all` → **全量模式**
   - 一个或多个 `ST-xxx` → **Story 模式**；校验 Story 在 `tasks.md` 中有 Task
   - 一个或多个 `Txxx` → **Task 模式**；校验 Task ID 存在于 `tasks.md`
   - 互斥校验失败则终止

3. **构建执行集**：读取 `tasks.md`，按「依赖闭包规则」生成本次待执行 Task 列表；在报告开头输出：
   - 执行模式（全量 / Story / Task）
   - 目标 ST-xxx 或 Txxx
   - 执行集 Task 列表（含因依赖闭包纳入的 Task）
   - 已跳过（`- [x]`）的 Task 数量

4. 加载并分析实施上下文：
    - **必填**：读取 tasks.md（完整文件 + 本次执行集）
    - **必填**：读取 EPIC 根 `tech-spec.md`（第一部分 EPIC 公共约束 + 本 Feature 第二节）获取技术规约（约束/能力边界/数据与 NFR 硬约束）
    - **必填**：读取 **EPIC 软件设计说明书**（`epic-design.md`）获取**架构设计、全景类图、关键时序、Story 拆解**——这是代码实现的**架构事实源**
    - **必填**：读取本 Feature **`l2_design/ST-xxx_*.md`**（执行集涉及的 Story；若有）获取 **Story L2 详细设计**——这是代码实现的**详细设计事实源**
    - **必填**：读取 spec.md 获取 FR/NFR 与验收边界
    - **若存在**：读取 EPIC 根 `ux-design.md`、`nfr.md`、`interface-design.md`、`database-design.md`、`analytics-tracking.md` 获取体验与专项设计约束
    - **若存在**：读取 `research/codebase-*.md` 辅助理解存量代码（只读事实快照，非约束源、非技术决策依据）

   **强制约束（不可越权）**：
    - Implement 阶段 **不得**擅自改写 `tech-spec.md` 的技术规约、`epic-design.md` 的架构与 Story 设计，也不得改写 `spec.md` 的 FR/NFR/AC。
    - 若发现设计缺口或必须变更：停止 Implement，提交变更提案（PR/Issue/评论；建议使用 `.specify/templates/change-request-template.md` 作为 CR 模板），由 SE/TL 在 EPIC 分支先更新设计文档，再继续。
    - 代码实现应遵循 **epic-design.md 中的架构图、类图、时序图**，与 **`tech-spec.md` 的技术规约** 共同指导实现，允许在细节上做必要调整但不得偏离整体设计方向。

5. 解析 tasks.md 结构并提取以下信息（**限执行集**）：
    - **任务阶段**：搭建（Setup）、测试（Tests）、核心开发（Core）、集成（Integration）、优化（Polish）
    - **任务依赖**：顺序执行 vs 并行执行规则
    - **任务详情**：ID、描述、文件路径、并行标记 [P]、`[ST-xxx]`
    - **设计引用**：每个 Task 关联的 epic-design.md 章节或 L2 文件

6. 按照任务计划执行实施流程（**仅执行集内 Task**）：
    - **分阶段执行**：完成一个阶段后再进入下一个阶段（跳过执行集外的阶段内容，但保留阶段 0～2 若其在闭包内）
    - **遵循依赖关系**：顺序任务按序执行，并行任务 [P] 可同时执行
    - **引用设计**：实现每个 Task 时，先读取其**设计引用**指向的 `epic-design.md` 章节（架构图、全景类图/时序）或 `l2_design/ST-xxx_<slug>.md`（L2 类图、时序图），确保实现与设计一致
    - **基于文件的协调规则**：影响同一文件的任务必须顺序执行
    - **验证检查点**：每个阶段完成后执行验证项；Story 模式在目标 Story 检查点停止并汇报

7. 实施执行规则：
    - **搭建优先**：初始化项目结构、依赖项、配置项
    - **先测后码**（若适用）：先完成测试任务
    - **核心开发**：实现模型、服务、CLI 命令、接口端点
    - **集成工作**：数据库连接、中间件、日志
    - **优化与验证**：性能优化、文档完善

8. 进度跟踪与错误处理：
    - 每个任务完成后汇报进度
    - 若任一非并行任务执行失败，终止**本次执行集**的剩余 Task（不自动继续执行集外 Task）
    - 对于并行任务 [P]，继续执行成功的任务，上报失败的任务
    - **重要**：任务完成后，务必在 tasks 文件中将对应任务标记为 `[x]`

9. 完成验证（**按执行范围**）：
    - **全量**：验证所有必填 Task 均已完成；检查功能是否匹配 `spec.md` FR/NFR/AC
    - **Story**：验证目标 Story 检查点与 Task 验证项；说明闭包内非目标 Story Task 若被一并执行的原因
    - **Task**：验证指定 Task 及其验证项
    - 确认实施过程符合 `tech-spec.md` 与 `epic-design.md` / L2 设计
    - 输出最终状态，汇总本次已完成的工作与仍为 `- [ ]` 的 Task

10. **完成提示**：
    - 完成后对照 `spec.md` FR/NFR/AC、`tech-spec.md` 约束与 `epic-design.md` / L2 设计完成实现自检
    - **Story / Task 模式**：提示可对下一 Story 运行 `/aisdd.implement ST-xxx`，或继续指定 Task
    - **全量且全部 [x]**：通过即可合并/发布
    - 若发现实现与设计偏离：走 `/aisdd.cr` 更新设计或修复代码，勿在 implement 阶段擅自改写冻结的 spec/tech-spec/design

若目标 Story 的 Task 缺失，对该 Story 运行 `/aisdd.featuretasks ST-xxx`；若需整份重建 Task 列表，运行 `/aisdd.featuretasks all`。
