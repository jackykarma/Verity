---
description: 执行实施计划，处理并执行 tasks.md 中定义的所有任务
---

## 用户输入

```text
$ARGUMENTS
```

在继续操作前，你**必须**考虑用户输入（若不为空）。

## 大纲

1. 从代码库根目录运行 `.specify/scripts/powershell/check-prerequisites.ps1 -Json -RequireTasks -IncludeTasks`，并解析 FEATURE_DIR（功能目录）和 AVAILABLE_DOCS（可用文档）列表。所有路径必须为绝对路径。对于参数中包含单引号的情况（如 "I'm Groot"），使用转义语法：例如 'I'\''m Groot'（若可能，也可使用双引号："I'm Groot"）。

2. **检查检查清单状态**（若 FEATURE_DIR/checklists/ 目录存在）：
    - 扫描 checklists/ 目录下的所有检查清单文件
    - 对每个检查清单，统计：
        - 总项数：所有匹配 `- [ ]`、`- [X]` 或 `- [x]` 的行
        - 已完成项数：匹配 `- [X]` 或 `- [x]` 的行
        - 未完成项数：匹配 `- [ ]` 的行
    - 创建状态表格：

      ```text
      | 检查清单      | 总数 | 已完成 | 未完成 | 状态    |
      |---------------|------|--------|--------|---------|
      | ux.md         | 12   | 12     | 0      | ✓ 通过  |
      | test.md       | 8    | 5      | 3      | ✗ 未通过 |
      | security.md   | 6    | 6      | 0      | ✓ 通过  |
      ```

    - 计算整体状态：
        - **通过**：所有检查清单的未完成项数均为 0
        - **未通过**：至少有一个检查清单存在未完成项

    - **若存在未完成的检查清单**：
        - 展示包含未完成项数的表格
        - **停止执行**并询问："部分检查清单未完成。是否仍要继续执行实施流程？(是/否)"
        - 等待用户回复后再继续
        - 若用户回复“否”“等一等”“停止”，则终止执行
        - 若用户回复“是”“继续”“推进”，则进入步骤 3

    - **若所有检查清单均已完成**：
        - 展示所有检查清单通过的表格
        - 自动进入步骤 3

3. 加载并分析实施上下文：
    - **必填**：读取 tasks.md 获取完整任务列表和执行计划
    - **必填**：读取 plan.md 获取技术栈、架构和文件结构
    - **必填**：读取 spec.md 获取 FR/NFR 与验收边界（用于核对“完成条件”）
    - **若存在**：读取 data-model.md 获取实体及关系
    - **若存在**：读取 contracts/ 目录获取 API 规范和测试要求
    - **若存在**：读取 research.md 获取技术决策和约束条件
    - **若存在**：读取 quickstart.md 获取集成场景

   **强制约束（不可越权）**：
    - Implement 阶段 **不得**擅自改写 `plan.md` 的工程决策与 Story Breakdown，也不得改写 `spec.md` 的 FR/NFR/AC。
    - 若发现设计缺口或必须变更：停止 Implement，并要求先更新 plan/spec（走增量变更并提升 Version），再重新生成 tasks.md（必要时）后继续。

4. **项目配置验证**：
    - **必填**：根据实际项目配置创建/验证忽略文件（ignore files）：

   **检测与创建逻辑**：
    - 执行以下命令判断仓库是否为 git 仓库（若是，创建/验证 .gitignore）：

      ```sh
      git rev-parse --git-dir 2>/dev/null
      ```

    - 检查是否存在 Dockerfile* 文件或 plan.md 中提及 Docker → 创建/验证 .dockerignore
    - 检查是否存在 .eslintrc* 文件 → 创建/验证 .eslintignore
    - 检查是否存在 eslint.config.* 文件 → 确保配置中的 `ignores` 条目覆盖必要的匹配规则
    - 检查是否存在 .prettierrc* 文件 → 创建/验证 .prettierignore
    - 检查是否存在 .npmrc 或 package.json 文件 → 若涉及发布，创建/验证 .npmignore
    - 检查是否存在 Terraform 文件（*.tf）→ 创建/验证 .terraformignore
    - 检查是否需要 .helmignore（存在 Helm 图表）→ 创建/验证 .helmignore

   **若忽略文件已存在**：验证其包含核心匹配规则，仅追加缺失的关键规则
   **若忽略文件缺失**：根据检测到的技术栈，创建包含完整匹配规则集的忽略文件

   **按技术栈划分的通用匹配规则**（来自 plan.md 中的技术栈）：
    - **Node.js/JavaScript/TypeScript**：`node_modules/`、`dist/`、`build/`、`*.log`、`.env*`
    - **Python**：`__pycache__/`、`*.pyc`、`.venv/`、`venv/`、`dist/`、`*.egg-info/`
    - **Java**：`target/`、`*.class`、`*.jar`、`.gradle/`、`build/`
    - **C#/.NET**：`bin/`、`obj/`、`*.user`、`*.suo`、`packages/`
    - **Go**：`*.exe`、`*.test`、`vendor/`、`*.out`
    - **Ruby**：`.bundle/`、`log/`、`tmp/`、`*.gem`、`vendor/bundle/`
    - **PHP**：`vendor/`、`*.log`、`*.cache`、`*.env`
    - **Rust**：`target/`、`debug/`、`release/`、`*.rs.bk`、`*.rlib`、`*.prof*`、`.idea/`、`*.log`、`.env*`
    - **Kotlin**：`build/`、`out/`、`.gradle/`、`.idea/`、`*.class`、`*.jar`、`*.iml`、`*.log`、`.env*`
    - **C++**：`build/`、`bin/`、`obj/`、`out/`、`*.o`、`*.so`、`*.a`、`*.exe`、`*.dll`、`.idea/`、`*.log`、`.env*`
    - **C**：`build/`、`bin/`、`obj/`、`out/`、`*.o`、`*.a`、`*.so`、`*.exe`、`Makefile`、`config.log`、`.idea/`、`*.log`、`.env*`
    - **Swift**：`.build/`、`DerivedData/`、`*.swiftpm/`、`Packages/`
    - **R**：`.Rproj.user/`、`.Rhistory`、`.RData`、`.Ruserdata`、`*.Rproj`、`packrat/`、`renv/`
    - **通用规则**：`.DS_Store`、`Thumbs.db`、`*.tmp`、`*.swp`、`.vscode/`、`.idea/`

   **工具专属匹配规则**：
    - **Docker**：`node_modules/`、`.git/`、`Dockerfile*`、`.dockerignore`、`*.log*`、`.env*`、`coverage/`
    - **ESLint**：`node_modules/`、`dist/`、`build/`、`coverage/`、`*.min.js`
    - **Prettier**：`node_modules/`、`dist/`、`build/`、`coverage/`、`package-lock.json`、`yarn.lock`、`pnpm-lock.yaml`
    - **Terraform**：`.terraform/`、`*.tfstate*`、`*.tfvars`、`.terraform.lock.hcl`
    - **Kubernetes/k8s**：`*.secret.yaml`、`secrets/`、`.kube/`、`kubeconfig*`、`*.key`、`*.crt`

5. 解析 tasks.md 结构并提取以下信息：
    - **任务阶段**：搭建（Setup）、测试（Tests）、核心开发（Core）、集成（Integration）、优化（Polish）
    - **任务依赖**：顺序执行 vs 并行执行规则
    - **任务详情**：ID、描述、文件路径、并行标记 [P]
    - **执行流程**：执行顺序和依赖要求

6. 按照任务计划执行实施流程：
    - **分阶段执行**：完成一个阶段后再进入下一个阶段
    - **遵循依赖关系**：顺序任务按序执行，并行任务 [P] 可同时执行
    - **遵循TDD（测试驱动开发）思路**：对应功能的测试任务需先于实现任务执行
    - **基于文件的协调规则**：影响同一文件的任务必须顺序执行
    - **验证检查点**：每个阶段完成后必须执行该阶段的“验证”项；涉及 NFR（性能/功耗/内存）必须按 plan.md 的量化阈值验收，再继续执行

7. 实施执行规则：
    - **搭建优先**：初始化项目结构、依赖项、配置项
    - **先测后码**：若需为契约、实体、集成场景编写测试，需先完成测试任务
    - **核心开发**：实现模型、服务、CLI 命令、接口端点
    - **集成工作**：数据库连接、中间件、日志、外部服务集成
    - **优化与验证**：单元测试、性能优化、文档完善

8. 进度跟踪与错误处理：
    - 每个任务完成后汇报进度
    - 若任一非并行任务执行失败，终止整体执行
    - 对于并行任务 [P]，继续执行成功的任务，上报失败的任务
    - 提供包含上下文的清晰错误信息，便于调试
    - 若实施流程无法继续，给出下一步建议
    - **重要**：任务完成后，务必在 tasks 文件中将对应任务标记为 [x]

9. 完成验证：
    - 验证所有必填任务均已完成
    - 检查已实现功能是否匹配 `spec.md` 的 FR/NFR/AC（尤其是边界与异常场景）
    - 验证测试通过且覆盖率满足要求（若 plan/tasks 要求）
    - 确认实施过程符合 `plan.md` 的工程决策与约束
    - 确认 plan.md 中的算法/功耗/性能/内存验收指标达标（量化阈值）
    - 输出最终状态，汇总已完成的工作

注：本命令假定 tasks.md 中存在完整的任务拆分。若任务不完整或缺失，建议先运行 `/speckit.tasks` 重新生成任务列表。