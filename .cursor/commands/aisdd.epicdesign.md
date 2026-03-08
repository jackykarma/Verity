---
description: "**EPIC 级**软件设计说明书。在 epic-plan.md 及各 Feature plan.md 完成后运行；基于 epic.md、epic-plan.md、各 feature spec/plan 及**现有工程代码**，按章节范围参数分阶段产出设计说明书（0 层/1 层架构、关键设计、全景类图与关键时序、Story 拆解、L2 详细设计）。供人类评审与后续 tasks/implement 阶段 AI 编码引用。"
handoffs:
  - label: 审批关卡（design-ready）
    agent: aisdd.gate
    prompt: design-ready 关卡——冻结设计说明书后进入 tasks 拆解
    send: false
  - label: EPIC 级跨 Feature 分析（建议在 design-ready 关卡前）
    agent: aisdd.epicanalyze
    prompt: 运行跨 Feature 一致性与质量分析
    send: false
  - label: 生成任务（Story → Task）
    agent: aisdd.featuretasks
    prompt: 将设计说明书中的 Story 拆解为可执行 tasks.md
    send: true
  - label: 补充需求或澄清
    agent: aisdd.clarify
    prompt: 需补充设计边界或约束时，澄清后可再运行 epicdesign 或直接说明要更新的章节/参数由 AI 做增量更新
    send: false
---

## 用户输入

```text
$ARGUMENTS
```

在继续操作前，你**必须**参考用户输入（若不为空）。可用于：**EPIC 标识**（如 `EPIC-002`）、**章节范围参数**（见下表）、或补充设计侧重范围。

**当参数为 `-h` 时**：仅输出下方「参数说明」帮助信息，不执行任何文件操作。

## 章节范围参数（分阶段输出）

通过参数控制本次调用产出的章节范围，建议按从粗到细的顺序逐步推进：

| 参数 | 对应章节 | 产出文件 | 内容 |
|------|----------|----------|------|
| **无参数**（默认） | §1~§2 填充；§3~§6 占位 | `epic-design.md`（完整章节骨架） | 首次调用：建立完整 §1~§6 骨架 + 填充零层/一层架构（§1~§2），其余占位 |
| **arch** | §1~§2 | `epic-design.md` §1~§2 | 重新生成零层/一层架构（覆盖已有） |
| **key** | §3 | `key-func-design.md` + `epic-design.md` §3 摘要引用 | 关键疑难点/亮点设计、方案流程图、核心调用链时序图 |
| **diagram** | §4 | `key-diagram.md` + `epic-design.md` §4 摘要引用 | 无范围：全景骨架类图；`diagram FEAT-001`：该 Feature 的子类图 + 完整时序图 |
| **story** | §5 | `epic-design.md` §5 | Story 列表、依赖关系图、FR/NFR 覆盖矩阵 |
| **l2** | §6 | 各 `features/FEAT-xxx/story_detail_design.md` + `epic-design.md` §6 索引表 | 按 Story 产出 L2 详细设计；可限定范围：`l2 FEAT-001` 或 `l2 ST-001` |
| **all** | §1~§5 一次性 | 上述对应文件（不含 l2） | 小 EPIC 或上下文充裕时一次性产出 |
| **-h** | — | — | 仅输出参数帮助，不产出任何文件 |

**推荐顺序**：（无参数）→ key → diagram → story → l2

**`-h` 帮助输出**（当且仅当参数为 `-h` 时输出，不执行写入）：

```
/aisdd.epicdesign 参数说明：

  (无参数)   首次调用，建立 epic-design.md 完整章节骨架 + 填充 §1~§2（零层/一层架构），§3~§6 占位
  arch       重新生成零层/一层架构（§1~§2）
  key        产出关键功能疑难设计（§3）→ key-func-design.md（含流程图 + 核心调用链时序图）
  diagram    产出全景骨架类图（§4）→ key-diagram.md §7.2
             可指定范围：diagram FEAT-001（该 Feature 的子类图 + 完整时序图）
  story      产出 Story 拆解（§5）
  l2         产出 L2 详细设计（§6）→ 各 Feature 的 story_detail_design.md
             可指定范围：l2 FEAT-001 或 l2 ST-001
  all        一次性产出 §1~§5（不含 l2），适用于小 EPIC
  -h         显示本帮助信息

推荐顺序：(默认) → key → diagram → diagram FEAT-001 → diagram FEAT-002 → … → story → l2
```

## 产出文件组

| 文件 | 对应章节 | 内容 |
|------|----------|------|
| `epic-design.md` | §1~§2、§5 + 各章节摘要/引用 | 设计总览（零层/一层架构、Story 拆解、子文件引用） |
| `key-func-design.md` | §3 | 关键功能疑难点/亮点设计、方案流程图、核心调用链时序图、Feature 流程图集 |
| `key-diagram.md` | §4 | 全景骨架类图、Feature 子类图（含方法签名）、关键时序图 |
| `features/FEAT-xxx/story_detail_design.md` | §6 | 各 Story 落码级 L2 详细设计 |

## 大纲

目标：在 **EPIC 根**产出 **EPIC 软件设计说明书**及配套子文件，作为面向人类评审与后续 Task/Implement 阶段 AI 编码引用的设计方案文档。与各 Feature 的 `plan.md`（技术规约）共同约束 tasks.md 与代码实现。文档结构**从整体到局部**，通过参数控制每次输出的章节范围。

**前置条件**：
- `epic-plan.md` 已产出（/aisdd.epicplan）
- 至少一个 Feature 的 `plan.md` 已产出（/aisdd.featureplan）
- 须遵循 `.specify/memory/constitution.md` 的演进式设计原则

执行步骤：

1. **环境与路径**：从仓库根运行：

```powershell
.specify/scripts/powershell/get-epic-paths.ps1 -EpicId "EPIC-002" -Json
```

解析 JSON 得到 `EPIC_DIR`、`EPIC_PLAN`。若 `EPIC_PLAN` 不存在：**终止**并提示先运行 `/aisdd.epicplan`。若用户输入为 `-h`：**仅输出上方参数说明**，终止，不读写文件。

2. **解析章节范围参数**：从 `$ARGUMENTS` 中解析参数（无参数 | arch | key | diagram | story | l2 [范围] | all | -h）。无参数时视为首次调用（默认行为）。

3. **加载上下文**（执行产出前）：
   - 读取 `EPIC_DIR/epic.md`、`EPIC_DIR/epic-plan.md`
   - 读取各 `EPIC_DIR/features/*/spec.md`、`plan.md`
   - 若存在：读取 `EPIC_DIR/ux-design.md`
   - 读取 `.specify/memory/constitution.md`
   - 读取 `.specify/templates/epic-design-doc-template.md`、`key-func-design-template.md`、`key-diagram-template.md`、`story_detail_design_template.md`
   - 读取 `.cursor/rules/specify-diagram-requirements.mdc`、`.cursor/rules/mermaid-style-guide.mdc`
   - **分析现有工程代码**：架构分层、模块划分、包组织、现有框架

4. **根据参数产出**：
   - **无参数**：生成/更新 `epic-design.md`，含完整 §1~§6 骨架；§1~§2 填充内容，§3~§6 占位（提示运行对应参数产出）。
   - **arch**：重写 `epic-design.md` 的 §1~§2。
   - **key**：产出 `key-func-design.md`，并更新 `epic-design.md` 的 §3 为摘要 + 引用该文件。
   - **diagram**（无范围）：产出 `key-diagram.md` 的 §7.2 全景骨架类图，并更新 `epic-design.md` 的 §4 为摘要 + 引用。
   - **diagram FEAT-xxx**：产出 `key-diagram.md` 中该 Feature 的子类图（§7.2.x）+ 完整时序图（§7.3 SEQ-xxx），并更新 `epic-design.md` §4 的索引表。
   - **story**：更新 `epic-design.md` 的 §5（Story 列表、依赖图、FR/NFR 矩阵）。
   - **l2**：在各 Feature 目录下产出/更新 `story_detail_design.md`，并更新 `epic-design.md` 的 §6 为索引表；若带范围则仅处理指定 FEAT 或 ST。
   - **all**：依次执行 arch + key + diagram + story 的产出（不执行 l2）。

5. **子文件引用规则**：当 §3、§4、§6 内容在子文件中时，`epic-design.md` 对应章节仅保留**摘要 + 引用链接**（见 `.cursor/rules/aisdd-epicdesign.mdc` 中的示例）。

6. **完成报告**：输出本次产出的文件路径、对应章节，并提示下一步：
   - 默认/arch 完成 → 提示继续 `key`
   - key 完成 → 提示继续 `diagram`（全景骨架类图）
   - diagram（无范围）完成 → 提示继续 `diagram FEAT-001`（逐个 Feature 的子类图 + 完整时序图）
   - diagram FEAT-xxx 完成 → 提示继续下一个 Feature 的 `diagram FEAT-yyy`；全部 Feature 完成后提示继续 `story`
   - story 完成 → 提示继续 `l2`
   - l2 完成 → 提示：`/aisdd.epicanalyze` → `/aisdd.gate design-ready` → `/aisdd.featuretasks`（自动含回填 plan.md §一互校 + spec.md 需求追溯表）

核心规则：
- 所有图表必须使用 **Mermaid 格式**，遵循 `.cursor/rules/mermaid-style-guide.mdc`
- 图表内容须基于本工程**实际架构与真实代码**，遵循 `.cursor/rules/specify-diagram-requirements.mdc`
- 设计说明书是 tasks.md 与 implement 阶段的**设计事实源**，与 plan.md 的技术规约共同约束实现
- **L2 详细设计统一分文件**：epic-design.md 的 §6 仅为索引表，详细设计写在各 Feature 的 `story_detail_design.md` 中
- **章节骨架先行**：首次（无参数）调用必须输出完整 §1~§6 骨架，未填充章节保留占位提示；后续调用仅更新指定章节
