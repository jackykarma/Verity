---
description: "执行实施计划，处理并执行 tasks.md 中定义的所有任务（开发者在 Story 分支执行；严格遵循 EPIC 分支冻结的 spec/plan/epic-design/tasks）"
handoffs:
  - label: 实现验证
    agent: aisdd.verify
    prompt: 验证代码实现是否符合设计方案
    send: true
---

## 用户输入

```text
$ARGUMENTS
```

在继续操作前，你**必须**考虑用户输入（若不为空）。

## 前置条件

各 Feature 的 `tasks.md` 应已完成。建议先运行 `/aisdd.analyze` 做一致性检查（非阻塞，用户可跳过）。

## 大纲

1. 从代码库根目录运行 `.specify/scripts/powershell/check-prerequisites.ps1 -Json -RequireTasks -IncludeTasks`，并解析 FEATURE_DIR（功能目录）和 AVAILABLE_DOCS（可用文档）列表。所有路径必须为绝对路径。

2. 加载并分析实施上下文：
    - **必填**：读取 tasks.md 获取完整任务列表和执行计划
    - **必填**：读取 plan.md 获取**技术规格**（约束/契约/边界）
    - **必填**：读取 **EPIC 软件设计说明书**（`epic-design.md`）获取**架构设计、全景类图、关键时序、Story 拆解**——这是代码实现的**架构事实源**
    - **必填**：读取各 Feature **`l2_design/ST-xxx_*.md`** 获取 **Story L2 详细设计（类图、时序图、触发条件）**——这是代码实现的**详细设计事实源**
    - **必填**：读取 spec.md 获取 FR/NFR 与验收边界
    - **若存在**：读取 epic-plan.md 获取 EPIC 级技术约束
    - **若存在**：读取 data-model.md 获取实体及关系
    - **若存在**：读取 contracts/ 目录获取 API 规范
    - **若存在**：读取 research.md 获取技术决策
    - **若存在**：读取 quickstart.md 获取集成场景

   **强制约束（不可越权）**：
    - Implement 阶段 **不得**擅自改写 `plan.md` 的技术规约、`epic-design.md` 的架构与 Story 设计，也不得改写 `spec.md` 的 FR/NFR/AC。
    - 若发现设计缺口或必须变更：停止 Implement，提交变更提案（PR/Issue/评论；建议使用 `.specify/templates/change-request-template.md` 作为 CR 模板），由 SE/TL 在 EPIC 分支先更新设计文档，再继续。
    - 代码实现应遵循 **epic-design.md 中的架构图、类图、时序图**，与 **plan.md 的技术规约** 共同指导实现，允许在细节上做必要调整但不得偏离整体设计方向。

3. 解析 tasks.md 结构并提取以下信息：
    - **任务阶段**：搭建（Setup）、测试（Tests）、核心开发（Core）、集成（Integration）、优化（Polish）
    - **任务依赖**：顺序执行 vs 并行执行规则
    - **任务详情**：ID、描述、文件路径、并行标记 [P]
    - **设计引用**：每个 Task 关联的 epic-design.md 章节

4. 按照任务计划执行实施流程：
    - **分阶段执行**：完成一个阶段后再进入下一个阶段
    - **遵循依赖关系**：顺序任务按序执行，并行任务 [P] 可同时执行
    - **引用设计**：实现每个 Task 时，先读取其**设计引用**指向的 `epic-design.md` 章节（架构图、全景类图/时序）或 `l2_design/ST-xxx_<slug>.md`（L2 类图、时序图），确保实现与设计一致
    - **基于文件的协调规则**：影响同一文件的任务必须顺序执行
    - **验证检查点**：每个阶段完成后执行验证项

5. 实施执行规则：
    - **搭建优先**：初始化项目结构、依赖项、配置项
    - **先测后码**（若适用）：先完成测试任务
    - **核心开发**：实现模型、服务、CLI 命令、接口端点
    - **集成工作**：数据库连接、中间件、日志
    - **优化与验证**：性能优化、文档完善

6. 进度跟踪与错误处理：
    - 每个任务完成后汇报进度
    - 若任一非并行任务执行失败，终止整体执行
    - 对于并行任务 [P]，继续执行成功的任务，上报失败的任务
    - **重要**：任务完成后，务必在 tasks 文件中将对应任务标记为 [x]

7. 完成验证：
    - 验证所有必填任务均已完成
    - 检查已实现功能是否匹配 `spec.md` 的 FR/NFR/AC
    - 确认实施过程符合 `plan.md` 的技术规约与 `epic-design.md` 的设计方案
    - 输出最终状态，汇总已完成的工作

8. **完成提示**：
    - 完成后提示下一步：运行 `/aisdd.verify`（建议 `--save`）进行实现↔设计一致性验证，通过后合并/发布

注：本命令假定 tasks.md 中存在完整的任务拆分。若任务不完整或缺失，建议先运行 `/aisdd.featuretasks` 重新生成任务列表。
