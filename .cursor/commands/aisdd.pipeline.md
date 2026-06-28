---
description: "AISDD 端到端流水线编排：从当前进度自动推进各阶段（epicspec → featurespec → techspec → epicdesign → featuretasks → implement），并在实现后进入「构建/测试/验收 → 修复 → 复验」迭代闭环，直至所有 Task 完成、构建通过、测试用例全部通过、spec 的 FR/AC/NFR 全部达成。遇设计缺口或需求变更走 /aisdd.cr，不擅改已冻结产物。"
handoffs:
  - label: 处理设计缺口 / 需求变更
    agent: aisdd.cr
    prompt: 流水线检测到设计缺口或需求变更，发起 CR 并分步更新下游产物，再回到 /aisdd.pipeline 继续推进
    send: false
  - label: 质量评审（可选）
    agent: aisdd.challenge
    prompt: 关键阶段转换前/全部完成后运行对应 /aisdd.challenge 目标做对抗性或一致性评审
    send: false
---

## 用户输入

```text
$ARGUMENTS
```

在继续操作前，你**必须**解析用户输入（若不为空）。`$ARGUMENTS` 可包含：**EPIC 标识**（如 `EPIC-002`）、阶段范围与行为开关（见「参数说明」）。

**当参数为 `-h` 时**：仅输出「参数说明」「阶段状态机」「完成定义（DoD）」三节作为帮助，**不执行**任何文件操作或代码改动。

---

## 命令定位

`/aisdd.pipeline` 是 AISDD 的**编排器（Orchestrator）**：它本身**不重新实现**各阶段逻辑，而是**按顺序调用既有 `/aisdd.*` 命令的执行规则**，在阶段之间做**前置门禁**与**状态判定**，并在实现阶段后驱动**实现-验证-修复迭代闭环**，直至达成「完成定义（DoD）」。

- **唯一事实源**：各阶段的产出规则仍以对应命令文件为准（`aisdd.epicspec.md`、`aisdd.featurespec.md`、`aisdd.techspec.md`、`aisdd.epicdesign.md`、`aisdd.featuretasks.md`、`aisdd.implement.md`）。执行每个阶段前**必须完整阅读**对应命令文件并严格遵循。
- **全流程总览**：阶段顺序、产出物、事实源与裁剪规则见 `docs/aisdd/workflow-overview.html`（§六命令执行顺序、§四裁剪档位）。
- **治理红线**：遵循 `.specify/memory/constitution.md` 与 `.cursor/rules/aisdd-document-boundaries.mdc`——**不得**反向改写已冻结的 `spec.md` / `tech-spec.md` / `epic-design.md`。

---

## 参数说明

| 参数 | 说明 | 默认 |
|------|------|------|
| `EPIC-xxx` | 目标 EPIC 标识（如 `EPIC-002`）。缺省时按当前 git 分支 / `$env:SPECIFY_EPIC` / 工作目录推断；推断失败则终止并询问 | 推断 |
| `--feature=FEAT-xxx` | 仅推进指定 Feature（可逗号分隔多个）。缺省为 EPIC 下全部 Feature | 全部 |
| `--from=<stage>` | 流水线起始阶段 | 自动（按现状续跑） |
| `--until=<stage>` | 流水线终止阶段（含），到此即停 | `implement` |
| `--auto` | **自动模式**：阶段间不停顿连续推进，仅在「硬暂停点」停下 | ✅ 默认 |
| `--interactive` | **交互模式**：每个阶段完成后暂停，输出小结并等待确认再继续 | 关 |
| `--with-challenge` | 在各阶段转换前插入对应 `/aisdd.challenge`（spec/techspec/design/feature），BLOCK 视为硬暂停 | 关（默认跳过评审） |
| `--with-ux` | 在 techspec 前/并行执行 `/aisdd.featureuidesign`（需 `design/` 素材） | 关 |
| `--with-research` | 在 techspec/epicdesign 前执行 `/aisdd.featureresearch`（Brownfield 推荐） | 关 |
| `--max-iters=N` | 实现-验证-修复闭环单 Feature 最大迭代次数；超限转硬暂停 | `5` |
| `--scope=all\|ST-xxx\|Txxx` | implement 阶段的执行粒度，透传给 `/aisdd.implement`；多 Feature 默认逐 Feature `all` | `all` |
| `--dry-run` | 只做状态扫描与计划编排，输出阶段计划与门禁结果，**不**写文件、**不**改代码 | 关 |
| `-h` | 仅输出帮助，不执行 | — |

**阶段标识（`<stage>`）**：`epicspec` → `featurespec` → `techspec` → `epicdesign` → `featuretasks` → `implement`。

**示例**：

```text
/aisdd.pipeline EPIC-002
/aisdd.pipeline EPIC-002 --until=featuretasks
/aisdd.pipeline EPIC-002 --feature=FEAT-001 --scope=ST-401
/aisdd.pipeline EPIC-002 --with-challenge --max-iters=8
/aisdd.pipeline EPIC-002 --dry-run
/aisdd.pipeline -h
```

---

## 阶段状态机

每个阶段都遵循「**检测产物 → 满足则跳过 / 不满足则执行 → 门禁校验**」。检测以脚本输出与文件存在性为准，**不靠假设**。

| # | 阶段 | 产物 / 完成判据 | 执行命令 | 前置门禁 |
|---|------|----------------|----------|----------|
| 1 | **epicspec** | `epic.md` 已填充「Feature 拆分列表」 | `/aisdd.epicspec` | EPIC 目录存在（否则提示先跑 `create-new-epic.ps1`） |
| 2 | **featurespec** | 每个目标 Feature 的 `spec.md` 存在且已填充 FR/NFR/AC | `/aisdd.featurespec`（多 Feature 用 `--batch`） | `epic.md` 已有 Feature 拆分 |
| — | _challenge spec_ | （`--with-challenge`）评审报告无 BLOCK | `/aisdd.challenge spec` | 全部 `spec.md` 就绪 |
| — | _ux-design_ | （`--with-ux`）`ux-design.md` | `/aisdd.featureuidesign` | `spec.md` 就绪 + `design/` 素材 |
| — | _research_ | （`--with-research`）`research/codebase-*.md` | `/aisdd.featureresearch` | `spec.md` 就绪（Brownfield） |
| 3 | **techspec** | `tech-spec.md` 存在（`HAS_TECH_SPEC=true`） | `/aisdd.techspec EPIC-xxx` | 全部 `spec.md` 就绪 |
| — | _challenge techspec_ | （`--with-challenge`）无 BLOCK | `/aisdd.challenge techspec` | `tech-spec.md` 就绪 |
| 4 | **epicdesign** | `epic-design.md` 存在且**至少含 Story 拆解（§十二）**；复杂/高风险 Story 有 `l2_design/ST-xxx_*.md` | `/aisdd.epicdesign EPIC-xxx`（大 EPIC 分阶段 `0`/`1`/`key`/`story`/`l2`） | `HAS_TECH_SPEC=true` |
| — | _challenge design_ | （`--with-challenge`）无 BLOCK | `/aisdd.challenge design` | `epic-design.md` 至少 story 阶段 |
| 5 | **featuretasks** | 每个目标 Feature 的 `tasks.md` 存在，且 §十二全部 Story 均有 Task | `/aisdd.featuretasks`（逐 Feature；全量 `all`） | 该 Feature 在 `epic-design.md §十二` 已有 Story 拆解 |
| 6 | **implement** | 见下「实现-验证-修复闭环」DoD | `/aisdd.implement <scope>` + 验证修复闭环 | 该 Feature `tasks.md` 就绪 |

**门禁失败处理**：若某阶段前置不满足且其上游阶段在 `[--from, --until]` 范围内，则**先回填上游阶段**再继续；若上游超出范围，则**硬暂停**并报告缺失。

---

## 执行流程

### S0. 解析与状态扫描（必做）

1. 解析 `$ARGUMENTS`：EPIC 标识、`--feature`、`--from` / `--until`、模式开关。`-h` 仅输出帮助后终止。
2. 从仓库根运行脚本获取 EPIC 路径与状态（PowerShell 环境）：

```powershell
.specify/scripts/powershell/get-epic-paths.ps1 -EpicId "EPIC-xxx" -Json
```

   解析 `EPIC_DIR`、`EPIC_DESIGN_DIR`、`TECH_SPEC`、`HAS_TECH_SPEC`、`HAS_FEATURE_RESEARCH`。

3. 读取 `epic.md`，提取 Feature 列表（FEAT-xxx + 名称 + 依赖）。按 `--feature` 过滤目标集合。
4. 逐 Feature 扫描产物存在性：`spec.md`、`ux-design.md`、`tech-spec.md`（EPIC 级）、`epic-design.md` 及其 §十二、`tasks.md` 及其勾选进度（`- [ ]` / `- [x]` 计数）。
5. **输出「流水线计划表」**（每个阶段：`已完成 ✅ / 待执行 ▶ / 跳过(范围外) ⏭ / 阻塞 ⛔`）与本次将从哪个阶段开始、到哪个阶段结束。
6. 若 `--dry-run`：到此为止，仅输出计划，**不**执行后续。
7. **Feature 执行顺序**：按 `epic.md` 依赖关系拓扑排序（被依赖最多的 Capability Owner 优先），与 `workflow-overview.html §8.3.1` 一致。

### S1–S5. 设计阶段推进（epicspec → featuretasks）

对范围内每个阶段，按「阶段状态机」逐项执行：

- **产物已满足判据** → 标记跳过，继续下一阶段。
- **未满足** → 完整阅读对应 `/aisdd.*` 命令文件，按其规则执行；执行后**重新扫描**确认产物达标。
- **多 Feature 提速**：`featurespec` 用 `--batch`；`epicdesign`/`featuretasks` 可逐 Feature 推进，完成一个 Feature 的 `tasks.md` 即可进入其 implement 闭环（流水线并行，见 `workflow-overview.html §8.2`）。
- **`--with-challenge`**：在阶段转换前运行对应 `/aisdd.challenge`；报告含 **BLOCK** → 硬暂停（走 `/aisdd.cr`）；仅 WARN/CRITICAL 在自动模式下记录并继续，在交互模式下询问。
- **交互模式**：每阶段完成后输出小结并等待确认。

### S6. 实现-验证-修复闭环（核心）

> 这是本命令的核心：对每个 `tasks.md` 就绪的目标 Feature，循环「实现 → 验证 → 修复」直到该 Feature 达成 DoD。

**前置**：从仓库根运行

```powershell
.specify/scripts/powershell/check-prerequisites.ps1 -Json -RequireTasks -IncludeTasks
```

解析 `FEATURE_DIR` 与 `AVAILABLE_DOCS`；确保 `tasks.md` 存在。

**单 Feature 闭环（迭代 i = 1..max-iters）**：

1. **实现**：按 `aisdd.implement.md` 执行 `/aisdd.implement <scope>`（默认 `all`；`--scope` 可指定 Story/Task）。严格遵守其必读输入清单与红线，完成的 Task 标 `[x]`。
2. **验证**（按顺序，全部需通过）：
   - **构建/编译**：自动探测构建入口并执行——优先仓库内 `gradlew`/`gradlew.bat`（Android：如 `./gradlew :module:assembleDebug` 或 `compileDebugKotlin`），web 子项目用其 `package.json` 脚本（如 `npm run build`）。无法确定时先用 lint/类型检查兜底，并在报告中说明。
   - **测试用例**：运行 `tasks.md` 测试阶段定义的用例与相关单元/集成测试（Android：`./gradlew test` / `testDebugUnitTest` 或受影响模块；web：`npm test`）。**目标是全部通过**。
   - **验收标准（AC）**：逐条对照本 Feature `spec.md` 的 FR/AC、`tech-spec.md` 的 NFR 硬约束、`epic-design.md`/L2 设计与（若有）`ux-design.md`，核对实现是否满足；UI Task 对照设计稿。
3. **判定**：
   - **全部通过**（构建✅ + 测试✅ + 全部 Task `[x]` + AC/NFR 满足）→ 该 Feature **达成 DoD**，跳出闭环。
   - **存在失败** → 进入第 4 步分类修复。
4. **失败分类与处置**：
   - **(a) 实现缺陷 / 编译错误 / 测试未通过（代码侧）** → 在不偏离冻结设计的前提下**直接修复代码**，必要时补齐缺失测试任务；`i += 1` 后回到第 2 步复验。
   - **(b) 测试缺失或不充分** → 按 `tasks.md` 测试阶段补齐用例，再复验。
   - **(c) 设计缺口 / 需求歧义 / AC 无法满足须改方案或改需求** → **不擅改**冻结的 `spec.md` / `tech-spec.md` / `epic-design.md`；**硬暂停**，发起 `/aisdd.cr`（影响分析 → 生成 CR → 分步更新下游），CR 落地后回到 S1 重新扫描受影响阶段并续跑。
   - **(d) 外部阻塞**（缺依赖、环境/权限、需人工决策）→ 硬暂停并清晰列出阻塞项与建议。
5. **迭代上限**：若 `i` 达 `--max-iters` 仍未通过 → 硬暂停，输出**诊断报告**（剩余失败项、已尝试的修复、疑似根因、建议下一步），等待人工。

**多 Feature**：按依赖序对每个目标 Feature 重复单 Feature 闭环；被依赖的 Capability/接口先完成，下游 Feature 可在其稳定后继续。

### S7. 收尾与总报告

全部目标 Feature 达成 DoD（或到达 `--until`）后，输出**流水线总报告**：

- 各阶段最终状态（✅/⏭/⛔）与产出物路径
- 每个 Feature：Task 完成数 / 总数、构建结果、测试结果（通过/失败用例数）、AC 覆盖核对结论、闭环迭代次数
- 本次产生的 CR（若有）及其状态
- 仍未达成项（若因硬暂停未全完成）与精确的「继续命令」（如 `/aisdd.pipeline EPIC-002 --feature=FEAT-003`）
- 全部完成时给出合并/发布建议

---

## 完成定义（DoD）

流水线视为**全部完成**当且仅当（在 `--until` 范围内）：

1. 范围内每个 Feature 的 `tasks.md` **全部 Task = `[x]`**；
2. 项目**构建/编译通过**（无错误）；
3. **测试用例全部通过**（`tasks.md` 测试阶段用例 + 受影响单元/集成测试）；
4. 每个 Feature `spec.md` 的 **FR / AC 全部满足**，`tech-spec.md` 的 **NFR 硬约束达成**，实现与 `epic-design.md`/L2/（有则）`ux-design.md` 一致；
5. **无未解决的 BLOCK**（`--with-challenge` 时）与未关闭的 CR。

---

## 硬暂停点（自动模式下也会停）

自动模式持续推进，但遇以下情形**必须停下**并报告，绝不静默绕过：

- 需走 `/aisdd.cr` 的设计缺口 / 需求变更（红线：不擅改冻结产物）；
- `--with-challenge` 评审出现 **BLOCK**；
- 实现-验证-修复闭环达 `--max-iters` 仍不通过；
- 破坏性或高风险操作（删除/重命名大量文件、改 git 分支策略、修改 NFR 目标值等）需人工确认；
- 前置上游阶段缺失且超出 `[--from, --until]` 范围；
- 构建/测试入口无法确定且无安全兜底。

---

## 红线（强制）

- **不重新发明阶段逻辑**：每阶段严格按对应 `/aisdd.*` 命令文件执行。
- **不反向改写冻结产物**：`spec.md` / `tech-spec.md` / `epic-design.md` 及其子文件的变更一律走 `/aisdd.cr`；见 `.cursor/rules/aisdd-document-boundaries.mdc`。
- **`research/` 不参与回写**：方案变更不修订调研快照，需新认知则新建带日期的调研文件。
- **进度真实**：Task 仅在真正完成且通过验证后标 `[x]`；验证结果以实际构建/测试输出为准，不臆造。
- **范围克制**：只推进 `[--from, --until]` 与 `--feature` 限定的阶段与 Feature，不扩散修改。
