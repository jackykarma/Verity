---
description: "执行实施计划，处理并执行 tasks.md 中定义的所有任务（开发者在 Story 分支执行；严格遵循 EPIC 分支冻结的 spec/plan/epic-design/tasks）"
handoffs:
  - label: 实现验证
    agent: speckit.verify
    prompt: 验证代码实现是否符合设计方案
    send: true
  - label: 完成审批关卡
    agent: speckit.gate
    prompt: implement-done 关卡
    send: false
---

## 用户输入

```text
$ARGUMENTS
```

在继续操作前，你**必须**考虑用户输入（若不为空）。

## 大纲

1. 从代码库根目录运行 `.specify/scripts/powershell/check-prerequisites.ps1 -Json -RequireTasks -IncludeTasks`，并解析 FEATURE_DIR（功能目录）和 AVAILABLE_DOCS（可用文档）列表。所有路径必须为绝对路径。

2. **检查检查清单状态**（若 FEATURE_DIR/checklists/ 目录存在）：
    - 扫描 checklists/ 目录下的所有检查清单文件
    - 对每个检查清单，统计总项数、已完成项数、未完成项数
    - 计算整体状态：
        - **通过**：所有检查清单的未完成项数均为 0
        - **未通过**：至少有一个检查清单存在未完成项

    - **若存在未完成的检查清单**：
        - 展示包含未完成项数的表格
        - **默认停止执行**
        - 仅当用户在 `$ARGUMENTS` 中**显式**包含"继续/强制/force"时，才允许继续

    - **若所有检查清单均已完成**：自动进入步骤 3

3. 加载并分析实施上下文：
    - **必填**：读取 tasks.md 获取完整任务列表和执行计划
    - **必填**：读取 plan.md 获取**技术规约与实现约束**
    - **必填**：读取 **EPIC 软件设计说明书**（`epic-design.md`）获取**架构设计、全景类图、关键时序、Story 拆解**——这是代码实现的**架构事实源**
    - **必填**：读取各 Feature 的 **`story_detail_design.md`** 获取 **Story L2 详细设计（类图、时序图、触发条件）**——这是代码实现的**详细设计事实源**
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

4. **项目配置验证**：
    - **必填**：根据实际项目配置创建/验证忽略文件（ignore files）：

   **检测与创建逻辑**：
    - 执行 `git rev-parse --git-dir 2>/dev/null` 判断是否为 git 仓库
    - 检查是否存在 Dockerfile* → 创建/验证 .dockerignore
    - 检查是否存在 .eslintrc* → 创建/验证 .eslintignore
    - 检查是否存在 eslint.config.* → 确保 ignores 条目
    - 检查是否存在 .prettierrc* → 创建/验证 .prettierignore
    - 检查是否存在 .npmrc 或 package.json → 若涉及发布，创建/验证 .npmignore

   **若忽略文件已存在**：验证其包含核心匹配规则，仅追加缺失的关键规则
   **若忽略文件缺失**：根据检测到的技术栈，创建包含完整匹配规则集的忽略文件

   **按技术栈划分的通用匹配规则**（来自 plan.md 中的技术栈）：
    - **Node.js/JavaScript/TypeScript**：`node_modules/`、`dist/`、`build/`、`*.log`、`.env*`
    - **Python**：`__pycache__/`、`*.pyc`、`.venv/`、`venv/`、`dist/`、`*.egg-info/`
    - **Java**：`target/`、`*.class`、`*.jar`、`.gradle/`、`build/`
    - **Kotlin**：`build/`、`out/`、`.gradle/`、`.idea/`、`*.class`、`*.jar`、`*.iml`、`*.log`、`.env*`
    - **Go**：`*.exe`、`*.test`、`vendor/`、`*.out`
    - **Rust**：`target/`、`debug/`、`release/`、`*.rs.bk`
    - **通用规则**：`.DS_Store`、`Thumbs.db`、`*.tmp`、`*.swp`、`.vscode/`、`.idea/`

5. 解析 tasks.md 结构并提取以下信息：
    - **任务阶段**：搭建（Setup）、测试（Tests）、核心开发（Core）、集成（Integration）、优化（Polish）
    - **任务依赖**：顺序执行 vs 并行执行规则
    - **任务详情**：ID、描述、文件路径、并行标记 [P]
    - **设计引用**：每个 Task 关联的 epic-design.md 章节

6. 按照任务计划执行实施流程：
    - **分阶段执行**：完成一个阶段后再进入下一个阶段
    - **遵循依赖关系**：顺序任务按序执行，并行任务 [P] 可同时执行
    - **引用设计**：实现每个 Task 时，先读取其**设计引用**指向的 `epic-design.md` 章节（架构图、全景类图/时序）或 `story_detail_design.md` 的对应 ST-xxx（L2 类图、时序图），确保实现与设计一致
    - **基于文件的协调规则**：影响同一文件的任务必须顺序执行
    - **验证检查点**：每个阶段完成后执行验证项

7. 实施执行规则：
    - **搭建优先**：初始化项目结构、依赖项、配置项
    - **先测后码**（若适用）：先完成测试任务
    - **核心开发**：实现模型、服务、CLI 命令、接口端点
    - **集成工作**：数据库连接、中间件、日志
    - **优化与验证**：性能优化、文档完善

8. 进度跟踪与错误处理：
    - 每个任务完成后汇报进度
    - 若任一非并行任务执行失败，终止整体执行
    - 对于并行任务 [P]，继续执行成功的任务，上报失败的任务
    - **重要**：任务完成后，务必在 tasks 文件中将对应任务标记为 [x]

9. 完成验证：
    - 验证所有必填任务均已完成
    - 检查已实现功能是否匹配 `spec.md` 的 FR/NFR/AC
    - 确认实施过程符合 `plan.md` 的技术规约与 `epic-design.md` 的设计方案
    - 输出最终状态，汇总已完成的工作

10. **关卡检查提示**：
    - 若 `EPIC_DIR/gate-log.md` 存在且 `tasks-ready` 关卡**未通过**：输出警告（非阻塞，由用户决定是否继续）
    - 完成后提示下一步：运行 `/speckit.verify` 进行独立验证 → `/speckit.gate implement-done` 通过完成关卡

注：本命令假定 tasks.md 中存在完整的任务拆分。若任务不完整或缺失，建议先运行 `/speckit.tasks` 重新生成任务列表。
