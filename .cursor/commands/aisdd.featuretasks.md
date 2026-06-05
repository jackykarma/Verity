---
description: "基于 EPIC 软件设计说明书的 Story 拆解（ST-xxx）、EPIC 根 tech-spec.md（本 Feature 章节）的技术规约与 spec.md 的 FR/NFR，为该 Feature 生成可执行、按依赖排序且内置追溯矩阵的 tasks.md（Story → Task）。支持全量（无参数/all）与按 ST-xxx 增量合并；严禁反向改写已冻结的 spec/tech-spec/design（SE/TL 在 EPIC 分支产出与维护）。"
handoffs:
  - label: 项目实施
    agent: aisdd.implement
    prompt: 分阶段启动实施（全量 all、Story ST-xxx 或 Task Txxx；/aisdd.analyze 为可选，非前置条件）
    send: true
---

## 用户输入

```text
$ARGUMENTS
```

在继续操作前，你**必须**解析用户输入（若不为空），确定**生成范围**（见下文「范围参数」）。

## 范围参数

| 参数 | 行为 | 对已有 `tasks.md` |
|------|------|-------------------|
| **无参数** / **`all`** | **全量**：为本 Feature §十二中的**全部** Story 生成 Task | 不存在则创建；存在则**整份重写**（覆盖未勾选与已勾选任务，须警告用户） |
| **`ST-xxx`**（可多个，空格或逗号分隔） | **增量**：仅为指定 Story 生成/更新 Task | **合并更新**：保留其他 Story 阶段与 `- [x]` 进度；仅替换指定 Story 阶段及其追溯矩阵行 |
| **`-h`** | 仅输出参数帮助 | 不读写文件 |

**示例**：

```text
/aisdd.featuretasks
/aisdd.featuretasks all
/aisdd.featuretasks ST-001
/aisdd.featuretasks ST-401 ST-402
/aisdd.featuretasks ST-401,ST-402
/aisdd.featuretasks -h
```

**`-h` 帮助输出**（当且仅当参数为 `-h` 时输出，不执行写入）：

```text
/aisdd.featuretasks 参数说明：

  (无参数) / all   为本 Feature 全部 Story 生成 tasks.md（整份重写）
  ST-xxx           仅为指定 Story 增量生成/更新 Task（可多个：ST-001 ST-002 或 ST-001,ST-002）
  -h               显示本帮助信息

推荐：L2 就绪后先对首个 Story 跑 ST-xxx 增量生成；全部 Story 就绪后跑 all 做全量核对；或一次性 all。
```

## 前置条件

| 模式 | 前置条件 |
|------|----------|
| **全量**（无参数 / `all`） | `epic-design.md` §十二 Story 拆解已完成；本 Feature 各 Story 的 L2 已就绪，或 §十三 已标注由 `tasks.md` DoD 承接 |
| **增量**（`ST-xxx`） | 指定 Story 已在 §十二 中定义；该 Story 的 L2 已就绪，或 §十三 已标注由 `tasks.md` DoD 承接；**不要求**其他 Story 的 L2 已完成 |

完成后**可直接**进入 `/aisdd.implement`（可仅实现已生成 Task 的 Story）；`/aisdd.analyze`（feature / epic）为**可选**质量检查，非必经、非阻塞。

## 大纲

执行主体：**SE/TL（或架构师）**。开发者应将 `tasks.md` 视为只读执行清单；如需调整任务边界/顺序/验证方式，提交变更提案（PR/Issue/评论）并由 SE/TL 更新后再继续实现（建议使用 `.specify/templates/change-request-template.md` 作为 CR 模板）。

1. **环境搭建**：从代码库根目录运行 `.specify/scripts/powershell/check-prerequisites.ps1 -Json` 脚本，并解析 FEATURE_DIR（功能目录）和 AVAILABLE_DOCS（可用文档列表）。所有路径必须为绝对路径。

2. **解析范围参数**：从 `$ARGUMENTS` 解析：
   - `-h` → 仅输出上方帮助，终止
   - 无参数 / `all` → **全量模式**，目标 Story = 本 Feature 在 §十二 中的全部 ST-xxx
   - 一个或多个 `ST-xxx`（支持空格/逗号分隔）→ **增量模式**，目标 Story = 解析出的列表
   - 校验每个 ST-xxx 属于当前 Feature 且存在于 `epic-design.md` §十二；否则终止并列出合法 Story ID
   - 若用户输入含 `all` 与其他 ST-xxx 混用 → 终止并提示互斥

3. **加载设计文档**：从 FEATURE_DIR 及 EPIC 目录中读取以下文档：
    - **必需文档**：
        - **EPIC 软件设计说明书**（`epic-design.md`，从 EPIC_DIR 读取）：提取 **Story 拆解**（§十二：Story 列表、依赖关系、§十二.6 FR/NFR 覆盖矩阵）、**L2 详细设计**（各 `l2_design/`，索引见 §十三，若有）、**关键类图与关键时序**（§七 KD，若有）、**架构章节**（§一～§六）
        - EPIC 根 `tech-spec.md`（本 Feature 对应第二节：增量约束、能力边界、数据/NFR/安全硬约束）
        - spec.md（Epic/Feature 元信息、FR/NFR、验收与边界场景）
    - **可选文档**：EPIC 根 `ux-design.md`、`nfr.md`、`interface-design.md`、`database-design.md`、`analytics-tracking.md`、`research/codebase-*.md`（调研快照，只读辅助）
    - 注意：并非所有 EPIC 都包含全部可选文档。需基于实际存在的文件生成任务。

4. **追溯矩阵生成与一致性核对（只写入 tasks.md）**：
    - 从 `epic-design.md` §十二.6 覆盖矩阵提取 FR/NFR → Story 映射；**全量模式**写入完整追溯矩阵，**增量模式**仅更新目标 Story 相关行（保留其他 Story 行不变）。
    - 核对 `tech-spec.md` 轻量规约是否已被 `epic-design.md` 承接：对照 epic-design §一～§六架构、§七 KD（若有）、接口/数据库/埋点子文件（若有）与 L2（若有），逐项检查 tech-spec.md §二（增量约束）、§三（能力边界与外部依赖）、§四（数据/NFR/安全硬约束）。
    - 若发现 spec/tech-spec 与 design 矛盾或缺失，**停止生成 tasks.md**，输出差异并建议走 `/aisdd.cr` 或更新指定设计章节；不得在本命令中反向修改已冻结的 `spec.md` 或 `tech-spec.md`。
    - **只写执行事实源**：本步骤只创建/更新 `tasks.md`，不回填 `spec.md` 追溯表，不追加 `tech-spec.md` 变更记录。

5. **执行任务生成流程**：
    - 加载 tech-spec.md 并提取轻量技术规约、能力边界、数据/NFR/安全硬约束
    - 从 **EPIC 软件设计说明书**的 **§十二 Story 拆解** 提取**目标 Story 列表**（全量 = 本 Feature 全部 ST-xxx；增量 = 参数指定的 ST-xxx），包括：目标、改动范围、依赖、覆盖 FR/NFR、验证条件
    - 从 spec.md 提取 FR/NFR 与 AC（验收标准）
    - 从 `database-design.md` 或各 L2 提取实体/表结构并映射至对应 Story
    - 从 EPIC 根 `interface-design.md` 或各 L2 提取接口契约并映射至对应 Story
    - 按 Story 组织生成任务（详见下文「任务生成规则」）
    - 生成展示 Story 完成顺序的依赖关系章节（Story/Task 双层）
    - 为每个 Story 生成并行执行示例（仅列 [P] 任务）
    - 验证任务完整性（全量：全部 Story 均有 Task；增量：目标 Story 均有 Task）

6. **生成/合并 tasks.md 文件**：

    **全量模式**（无参数 / `all`）：以 `.specify/templates/tasks-template.md` 为模板**整份填充**，包含：
    - 从设计说明书中提取的正确功能名称
    - 阶段 0：准备（版本/输入冻结检查）
    - 阶段 1：环境搭建任务（项目初始化）
    - 阶段 2：核心基础（阻塞性前置条件）
    - 阶段 3+：**每个** Story 对应一个阶段
    - 每个阶段包含：Story 目标、任务列表、依赖关系、验证方式
    - 最后阶段：优化与跨领域关注点
    - 所有任务必须遵循严格的清单格式（详见下文「任务生成规则」）
    - 每个任务需标注清晰的文件路径
    - 每个 Task 必须提供 **设计引用**（指向 `epic-design.md` §七 KD 清单、`key-func-design/KD_*_*.md` 中关键类图/时序图，或各 Feature 的 `l2_design/ST-xxx_<slug>.md:功能设计:类图/时序图`）
    - FR/NFR → Story → Task 追溯矩阵（作为执行期追溯事实源）
    - 展示 Story 完成顺序的依赖关系章节
    - 每个 Story 的并行执行示例
    - 增量交付策略
    - 若覆盖已有 `tasks.md`：**须在报告与用户确认区明确警告**将丢失未备份的勾选进度与手工编辑

    **增量模式**（`ST-xxx`）：在已有 `tasks.md` 上**合并**，规则如下：
    - **保留**：非目标 Story 的全部阶段与 Task（含 `- [x]` 状态、依赖、设计引用、步骤、验证、产物）
    - **保留或创建骨架**：阶段 0～2；若文件不存在则按模板创建阶段 0～2 骨架后再写入目标 Story 阶段
    - **替换**：删除目标 Story 的旧阶段章节（含该 Story 全部 Task），写入新生成的 Story 阶段
    - **Task ID**：新 Task ID 从当前文件中已有最大 T 编号 +1 递增分配（**不重编号**其他 Story 的 Task）
    - **追溯矩阵**：更新目标 Story 涉及 FR/NFR 行；删除矩阵中仅指向被替换 Story 的旧 Task 引用
    - **全局章节**：重算并更新「依赖关系与执行顺序」「并行示例」「落地策略」——可包含尚未生成 Task 的 Story 占位说明（标注「待 /aisdd.featuretasks ST-xxx」）
    - **Tasks Version**：补丁 +0.0.1；在文件头或变更记录中注明本次增量范围（如 `ST-401`）
    - **禁止**：增量模式下不得删除或覆盖非目标 Story 的任何 Task

7. **报告输出**：输出生成的 tasks.md 文件路径及汇总信息：
    - **生成模式**：全量 / 增量（列出 ST-xxx）
    - 任务总数（全量）或本次新增/更新任务数（增量）
    - 各 Story（ST-xxx）对应的任务数量
    - 识别出的可并行执行机会
    - 每个 Story 的验证方式摘要
    - 建议的 MVP 范围
    - 格式验证

生成的 tasks.md 需可直接执行——每个任务的描述需足够具体，确保大语言模型（LLM）无需额外上下文即可完成。

### 增量合并示例（Story 模式）

已有 `tasks.md` 含 ST-401 完成（T010–T012 为 `- [x]`），运行 `/aisdd.featuretasks ST-402`：

1. 保留阶段 0～2 与 ST-401 阶段不变
2. 删除原 ST-402 阶段（若曾存在）
3. 追加 ST-402 新 Task，ID 从 T013 起
4. 更新追溯矩阵中 ST-402 相关行
5. 刷新依赖关系章节，ST-401 仍标注已完成

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
    - 将 EPIC 根 `interface-design.md` 或 L2 中的每个契约/接口端点映射至其服务对应的 Story

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
