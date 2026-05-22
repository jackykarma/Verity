---
描述：基于 EPIC 软件设计说明书的 Story 拆解（ST-xxx）、plan.md 的技术规约与 spec.md 的 FR/NFR，为该 Feature 生成一份可执行、按依赖关系排序且内置追溯矩阵的 tasks.md 文件（Story → Task），严禁反向改写已冻结的 spec/plan/design 技术决策（本工作流由 SE/TL 在 EPIC 分支产出与维护）。
交接项：
  - 标签：项目实施
    执行主体：aisdd.implement
    提示语：分阶段启动实施工作（/aisdd.analyze 为可选，非前置条件）
    发送状态：是

---

## 用户输入

```text
$ARGUMENTS
```

在继续操作前，你**必须**参考用户输入（若不为空）。

## 前置条件

`epic-design.md` 及按需 L2 设计应已完成。完成后**可直接**进入 `/aisdd.implement`；`/aisdd.analyze`（feature / epic）为**可选**质量检查，非必经、非阻塞。

## 大纲

执行主体：**SE/TL（或架构师）**。开发者应将 `tasks.md` 视为只读执行清单；如需调整任务边界/顺序/验证方式，提交变更提案（PR/Issue/评论）并由 SE/TL 更新后再继续实现（建议使用 `.specify/templates/change-request-template.md` 作为 CR 模板）。

1. **环境搭建**：从代码库根目录运行 `.specify/scripts/powershell/check-prerequisites.ps1 -Json` 脚本，并解析 FEATURE_DIR（功能目录）和 AVAILABLE_DOCS（可用文档列表）。所有路径必须为绝对路径。

2. **加载设计文档**：从 FEATURE_DIR 及 EPIC 目录中读取以下文档：
    - **必需文档**：
        - **EPIC 软件设计说明书**（`epic-design.md`，从 EPIC_DIR 读取）：提取 **Story 拆解**（§十二：Story 列表、依赖关系、§十二.6 FR/NFR 覆盖矩阵）、**L2 详细设计**（各 `l2_design/`，索引见 §十三，若有）、**关键类图与关键时序**（§七 KD，若有）、**架构章节**（§一～§六）
        - plan.md（**轻量技术规约**：增量约束、能力边界、数据/NFR/安全硬约束）
        - spec.md（Epic/Feature 元信息、FR/NFR、验收与边界场景）
    - **可选文档**：epic-plan.md（EPIC 级技术约束）、data-model.md、contracts/、research.md、quickstart.md
    - 注意：并非所有项目都包含全部文档。需基于实际可用的文档生成任务。

3. **追溯矩阵生成与一致性核对（只写入 tasks.md）**：
    - 从 `epic-design.md` §十二.6 覆盖矩阵提取 FR/NFR → Story 映射，并在 `tasks.md` 中生成 FR/NFR → Story → Task 追溯矩阵。
    - 核对 `plan.md` 轻量规约是否已被 `epic-design.md` 承接：对照 epic-design §一～§六架构、§七 KD（若有）、接口/数据库/埋点子文件（若有）与 L2（若有），逐项检查 plan.md §二（增量约束）、§三（能力边界与外部依赖）、§四（数据/NFR/安全硬约束）。
    - 若发现 spec/plan 与 design 矛盾或缺失，**停止生成 tasks.md**，输出差异并建议走 `/aisdd.cr` 或更新指定设计章节；不得在本命令中反向修改已冻结的 `spec.md` 或 `plan.md`。
    - **只写执行事实源**：本步骤只创建/更新 `tasks.md`，不回填 `spec.md` 追溯表，不追加 `plan.md` 变更记录。

4. **执行任务生成流程**：
    - 加载 plan.md 并提取轻量技术规约、能力边界、数据/NFR/安全硬约束
    - 从 **EPIC 软件设计说明书**的 **§十二 Story 拆解** 提取 Story 列表（ST-xxx），包括：目标、改动范围、依赖、覆盖 FR/NFR、验证条件
    - 从 spec.md 提取 FR/NFR 与 AC（验收标准）
    - 从 `database-design.md` 或各 L2 提取实体/表结构并映射至对应 Story
    - 从 `interface-design.md`、contracts/ 目录或各 L2 提取接口端点并映射至对应 Story
    - 若存在 research.md：提取决策信息并纳入环境搭建阶段任务
    - 按 Story 组织生成任务（详见下文「任务生成规则」）
    - 生成展示 Story 完成顺序的依赖关系章节（Story/Task 双层）
    - 为每个 Story 生成并行执行示例（仅列 [P] 任务）
    - 验证任务完整性

5. **生成 tasks.md 文件**：以 `.specify/templates/tasks-template.md` 为模板填充内容，包含：
    - 从设计说明书中提取的正确功能名称
    - 阶段 0：准备（版本/输入冻结检查）
    - 阶段 1：环境搭建任务（项目初始化）
    - 阶段 2：核心基础（阻塞性前置条件）
    - 阶段 3+：每个 Story 对应一个阶段
    - 每个阶段包含：Story 目标、任务列表、依赖关系、验证方式
    - 最后阶段：优化与跨领域关注点
    - 所有任务必须遵循严格的清单格式（详见下文「任务生成规则」）
    - 每个任务需标注清晰的文件路径
    - 每个 Task 必须提供 **设计引用**（指向 `epic-design.md` §七 KD 清单、`key-func-design/KD_*_*.md` 中关键类图/时序图，或各 Feature 的 `l2_design/ST-xxx_<slug>.md:功能设计:类图/时序图`）
    - FR/NFR → Story → Task 追溯矩阵（作为执行期追溯事实源）
    - 展示 Story 完成顺序的依赖关系章节
    - 每个 Story 的并行执行示例
    - 增量交付策略

6. **报告输出**：输出生成的 tasks.md 文件路径及汇总信息：
    - 任务总数
    - 各 Story（ST-xxx）对应的任务数量
    - 识别出的可并行执行机会
    - 每个 Story 的验证方式摘要
    - 建议的 MVP 范围
    - 格式验证

任务生成上下文：$ARGUMENTS

生成的 tasks.md 需可直接执行——每个任务的描述需足够具体，确保大语言模型（LLM）无需额外上下文即可完成。

## 任务生成规则

**核心要求**：任务必须按 Story（ST-xxx）组织，以支持独立实施和验证；Story 来自 **EPIC 软件设计说明书**的 §十二 Story 拆解，不得擅自发明新 Story。

**测试任务可选**：仅当功能规格中明确要求，或用户指定采用测试驱动开发（TDD）方式时，才生成测试任务。

### 清单格式（必填）

每个任务必须严格遵循以下格式：

```text
- [ ] [任务ID] [P?] [ST-xxx] 带文件路径的描述内容
```

**格式组成说明**：

1. **复选框**：必须以 `- [ ]`（Markdown 复选框格式）开头
2. **任务ID**：按执行顺序编排的序列号（T001、T002、T003……）
3. **[P] 标记**：仅当任务可并行执行时添加
4. **[ST-xxx] 标签**：Story 阶段的任务必填（与 EPIC 设计说明书的 Story 拆解对齐）
5. **描述内容**：清晰的操作指令 + 精确的文件路径

**示例**：

- ✅ 正确格式：`- [ ] T001 按实施计划创建项目结构`
- ✅ 正确格式：`- [ ] T005 [P] 在 src/middleware/auth.py 中实现认证中间件`
- ✅ 正确格式：`- [ ] T012 [P] [ST-001] 在 src/models/user.py 中创建用户模型`
- ❌ 错误格式：`- [ ] 创建用户模型`（缺少任务ID和 [ST-xxx] 标签）

### 设计引用规则

每个 Task 必须包含 **设计引用**，指向 EPIC 软件设计说明书中的对应设计：

```text
设计引用：key-func-design/KD_001_<slug>.md:关键类图/核心调用链时序图
设计引用：l2_design/ST-001_<slug>.md:功能设计:类图
设计引用：l2_design/ST-002_<slug>.md:功能设计:时序图
```

### 任务组织规则

1. **基于 Story（EPIC 设计说明书 §十二）** - 核心组织维度：
    - 每个 Story（ST-xxx）对应一个独立阶段
    - 标注 Story 间依赖（以设计说明书为准）

2. **基于接口设计**：
    - 将 `interface-design.md`、contracts/ 或 L2 中的每个契约/接口端点映射至其服务对应的 Story

3. **基于数据设计**：
    - 将 `database-design.md` 或 L2 中的每个实体/表结构映射至其所属 Story

4. **基于环境搭建/基础设施**：
    - 共享基础设施 → 环境搭建阶段（第 1 阶段）
    - 基础/阻塞性任务 → 核心基础阶段（第 2 阶段）

### 阶段结构

- **第 0 阶段**：准备（版本/输入冻结检查）
- **第 1 阶段**：环境搭建（项目初始化）
- **第 2 阶段**：核心基础（阻塞性前置条件）
- **第 3 阶段及以后**：按依赖与优先级组织的 Story（ST-001、ST-002…）
- **最终阶段**：优化与跨领域关注点
