# Speckit 流程检查报告

基于 `.cursor/commands/` 下所有 speckit 命令及 `.specify/scripts/` 脚本的梳理结果。

---

## 一、总览

| 类型 | 命令 | 说明 |
|------|------|------|
| **入口/前置** | `speckit.constitution` | 项目章程（`.specify/memory/constitution.md`），可先于或与 specify 并行 |
| **EPIC 入口** | `speckit.specify` | 创建 EPIC 目录 + epic.md + Feature 拆分列表；**不**创建 Feature 目录/spec |
| **Feature 入口** | `speckit.feature` | 在当前 EPIC 下创建 Feature 目录 + spec.md |
| **澄清** | `speckit.clarify` | 首次交互式澄清（plan 之前），不维护变更记录 |
| **EPIC 设计** | `speckit.epicuidesign` | 所有 Feature spec 输出后，EPIC 根下 ux-design.md + design/ |
| **方案** | `speckit.plan` | 生成 plan.md（Lite → Standard → Deep） |
| **任务** | `speckit.tasks` | 基于 plan Story + spec FR/NFR 生成 tasks.md |
| **分析** | `speckit.analyze` | tasks 生成后，对 spec/plan/tasks 做一致性分析（只读） |
| **实施** | `speckit.implement` | 按 tasks.md 执行实现 |
| **增量更新** | `speckit.specify-update` / `feature-update` / `plan-update` / `epicuidesign-update` | 按范围增量更新对应工件 |
| **辅助** | `speckit.epicsync` | 将当前 Feature 状态/版本/链接同步到 epic.md 的 Feature Registry |
| **辅助** | `speckit.checklist` | 为当前 Feature 生成自定义检查清单 |
| **辅助** | `speckit.taskstoissues` | 将 tasks 转为 GitHub Issues（需 GitHub MCP） |

---

## 二、主流程（从零到交付）

```
constitution（可选/可先做）
       ↓
specify → epic.md + Feature 拆分列表
       ↓
对每个 Feature：feature → spec.md
       ↓
clarify（建议，plan 之前）
       ↓
epicuidesign（所有 Feature spec 就绪后，EPIC 级 ux-design）
       ↓
对每个 Feature：plan（Lite → Standard → Deep）→ plan.md
       ↓
tasks → tasks.md
       ↓
analyze（可选，实施前一致性检查）
       ↓
implement（按 tasks 执行）
```

**可选穿插**：`epicsync`（plan/tasks 后同步到 epic.md）、`checklist`（按需生成检查清单）、`taskstoissues`（tasks 后转 GitHub Issues）。

---

## 三、前置与依赖关系

### 3.1 环境与脚本依赖

| 脚本 | 用途 | 被调用命令 |
|------|------|------------|
| `check-prerequisites.ps1 -Json` | Feature 上下文 + 可用文档 | plan, tasks |
| `check-prerequisites.ps1 -Json -PathsOnly` | 仅路径，不校验工件存在 | clarify, feature-update, plan-update, checklist, epicsync |
| `check-prerequisites.ps1 -Json -RequireTasks -IncludeTasks` | 要求 tasks.md 存在并纳入 AVAILABLE_DOCS | implement, analyze, taskstoissues |
| `create-new-epic.ps1 -Json "$ARGUMENTS"` | 创建 EPIC 目录，输出 EPIC_* | specify |
| `create-new-feature.ps1 -Json "$ARGUMENTS"` | 创建 Feature 目录，输出 FEATURE_* / SPEC_FILE 等 | feature |
| `get-epic-paths.ps1 -EpicId "EPIC-xxx" -Json` | EPIC 目录、ux-design.md、design 路径 | epicuidesign, epicuidesign-update |
| `setup-plan.ps1 -Json` | plan 环境（FEATURE_DIR、spec、plan 路径、UX_DESIGN 等） | plan |
| `sync-epic-overview.ps1 -Notes "$ARGUMENTS"` | 无模型方式同步 Feature 到 epic.md | 文档说明，epicsync 逻辑等同 |
| `update-agent-context.ps1 -AgentType cursor-agent` | 更新 Agent 上下文 | plan |

以上脚本均存在于 `.specify/scripts/powershell/`，参数与命令描述一致。

### 3.2 命令间前置条件（摘要）

| 命令 | 前置条件 | 不满足时提示 |
|------|----------|--------------|
| specify | 无（constitution 可选） | - |
| feature | 当前 EPIC 已存在（先 specify） | 先运行 `/speckit.specify` |
| clarify | spec.md 存在 | 先运行 `/speckit.feature` |
| epicuidesign | epic 存在；ux-design.md **不存在**；**所有** Feature 目录下均有 spec.md | 列出缺 spec 的 Feature，先 feature/specify |
| epicuidesign-update | ux-design.md **已存在** | 先运行 `/speckit.epicuidesign` |
| plan | spec.md 存在；setup-plan 可解析路径 | FEATURE_SPEC 等缺失时终止 |
| plan-update | FEATURE_SPEC、IMPL_PLAN 存在 | 先运行 `/speckit.plan` |
| tasks | plan.md（含 Story Breakdown）、spec.md 存在 | - |
| analyze | spec.md、plan.md、**tasks.md** 均存在 | 先运行 `/speckit.tasks` |
| implement | tasks.md 存在；可选检查 checklist 通过 | 先补全 tasks / 或显式“继续” |
| epicsync | FEATURE_SPEC 存在；spec 中 Epic 字段存在；epic 目录 + epic.md 存在 | 先 feature / clarify / specify |
| feature-update | FEATURE_SPEC 存在 | 先运行 `/speckit.feature` |
| specify-update | 目标 EPIC 目录及 epic.md 存在 | 先运行 `/speckit.specify` |
| checklist | FEATURE_SPEC 存在 | 先运行 `/speckit.feature` |
| taskstoissues | tasks.md 存在；远程为 GitHub | 仅 GitHub 时可继续 |

---

## 四、增量更新与级联

- **specify-update**：只更新 epic.md 指定范围，**不**改 Feature Registry（由 epicsync 维护）；不创建 EPIC。
- **feature-update**：按「范围 + 变更意图」更新 spec，可**级联** plan（默认）：推导受影响的 plan 范围并调用与 plan-update 相同的增量逻辑。
- **plan-update**：按「spec 范围」或「plan 范围」仅重写对应 plan 章节，其余保留。
- **epicuidesign-update**：仅更新 ux-design.md 指定范围；若影响某 Feature 的 spec/plan，handoff 到 feature-update / plan-update，再可 handoff tasks。

级联顺序与文档一致：feature-update →（可选）plan-update → 需时再 tasks。

---

## 五、Handoff 与建议下一步

各命令内 handoffs 与完成报告中的「下一步」一致，无冲突：

- **constitution** → 可 handoff speckit.feature（构建规范）。
- **specify** → 对每个 Feature 建议 `/speckit.feature <描述>`。
- **feature** → clarify（建议）→ epicuidesign（若未做）→ plan。
- **clarify** → plan。
- **epicuidesign** → 对各 Feature 设 SPECIFY_FEATURE 后 `/speckit.plan`。
- **plan** → tasks；可选 epicsync、checklist。
- **tasks** → analyze（建议）→ implement；可选 epicsync。
- **analyze** → 若有 CRITICAL，建议先整改再 implement。
- **implement** → 无强制 handoff（按 tasks 执行到底）。

---

## 六、一致性检查结果

| 检查项 | 状态 | 说明 |
|--------|------|------|
| 脚本存在性 | ✅ | 所有引用脚本均在 `.specify/scripts/powershell/` 存在 |
| check-prerequisites 参数 | ✅ | PathsOnly / RequireTasks / IncludeTasks 与脚本定义一致 |
| 前置条件闭环 | ✅ | 任一命令终止时均提示先运行的前置命令，且该前置命令在流程中存在 |
| 增量更新边界 | ✅ | specify-update 不写 Feature Registry；feature-update 与 plan-update 范围推导一致（7.3 保守映射） |
| EPIC/Feature 层级 | ✅ | EPIC 由 specify 创建；Feature 由 feature 创建；epicuidesign 在 EPIC 根，plan/tasks/implement 在 Feature 级 |
| 章程权威 | ✅ | analyze 以 constitution 为不可协商；constitution 与模板同步要求明确 |

---

## 七、可选改进建议（非错误）

1. **tasks 与 check-prerequisites**：`speckit.tasks` 使用 `check-prerequisites.ps1 -Json`（不要求 tasks.md 存在），符合「生成 tasks」的语义；implement/analyze/taskstoissues 使用 `-RequireTasks -IncludeTasks`，逻辑正确，无需修改。
2. **epicuidesign 与 EPIC 标识**：epicuidesign / epicuidesign-update 示例中为 `EPIC-002`，文档已说明可通过 `$ARGUMENTS` 或 `SPECIFY_EPIC` 提供，无冲突。
3. **feature-update 级联**：文档明确「默认级联 plan」「可关闭级联后单独运行 plan-update」，与 plan-update 的「spec 范围 → plan 范围」推导一致。

---

**结论**：Speckit 主流程、前置依赖、脚本引用、增量与级联逻辑、handoff 与完成报告均一致且闭环；未发现流程断裂或脚本缺失。
