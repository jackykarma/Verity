---
description: 变更请求（CR）：中途新增/修改/删除需求或技术方案变更时，创建 CR、自动影响分析、生成下游更新清单并按流程分步执行更新。
handoffs:
  - label: 澄清变更需求
    agent: aisdd.clarify
    prompt: 澄清变更的具体内容与边界
    send: true
  - label: 一致性分析
    agent: aisdd.analyze
    prompt: 运行一致性分析，确认变更后各产物无矛盾
    send: true
---

## 用户输入

```text
$ARGUMENTS
```

在继续操作前，你**必须**参考用户输入（若不为空）。可用于：**EPIC 标识**（如 `EPIC-002`）、**变更描述**、或指向已填写的 CR 文件路径。

**当参数为 `-h` 时**：仅输出下方「参数说明」帮助信息，不执行任何文件操作。

## 参数说明

| 参数 | 说明 |
|------|------|
| 无参数（默认） | 交互式：收集变更描述 → 自动影响分析 → 生成 CR 文件 → 提示确认后分步执行下游更新 |
| `analyze` | 仅执行影响分析并输出下游更新清单，不执行更新 |
| `apply CR-xxx` | 基于已有 CR 文件（EPIC 目录下的 `CR-xxx.md`），直接执行下游更新 |
| `-h` | 显示本帮助信息 |

**`-h` 帮助输出**：当且仅当参数为 `-h` 时，输出上方「参数说明」表格作为帮助，不执行任何文件操作。

## 大纲

目标：为中途变更（新增/修改/删除需求，或技术方案变更）提供**端到端自动化**——从收集变更描述到影响分析，到生成 CR 文件，再到按流程分步更新下游产物。

**前置条件**：当前 EPIC 至少有 `epic.md` 和一个 Feature 的 `spec.md`（否则无变更基准）。

执行步骤：

1. **环境与路径**：从仓库根运行：

```powershell
.specify/scripts/powershell/get-epic-paths.ps1 -EpicId "EPIC-xxx" -Json
```

解析 JSON 得到 `EPIC_DIR`。若用户输入为 `-h`：**仅输出上方参数说明**，终止。

2. **收集变更描述**（无参数/analyze 模式）：
   - 若用户输入含变更描述：直接使用
   - 否则：提示用户描述「改了什么 / 为什么改 / 哪些 Feature 受影响」

3. **加载当前 EPIC 产物**：
   - 读取 `EPIC_DIR/epic.md`
   - 读取各 `EPIC_DIR/features/*/spec.md`、`tech-spec.md`、`tasks.md`（若有）
   - 读取 `EPIC_DIR/tech-spec.md`（若有）
   - 读取 `EPIC_DIR/epic-design.md`（若有）
   - 读取 `EPIC_DIR/ux-design.md`（若有）
   - 读取 `.specify/templates/change-request-template.md`

4. **影响分析**：
   - **判断变更类型**：需求类（Scope/FR/NFR/AC）/ 交互类 / 技术方案类 / 混合
   - **定位受影响的产物**：逐个检查 spec/ux-design/tech-spec/epic-design/l2_design（各 ST 文件）/tasks，列出需要更新的文件与章节
   - **`research/` 永久排除**：`EPIC_DIR/research/` 下代码调研快照**不得**列入下游更新清单；方案或需求变更时**不**修订、不覆盖已有调研报告（需新调研则新建带日期的文件，走 `/aisdd.research`）
   - **参考 workflow-overview.html §7.3 变更影响速查表**确定更新链路
   - **风险评估**：识别变更带来的风险（性能/兼容/工期等）

5. **生成 CR 文件**（无参数模式）：
   - 基于模板 `change-request-template.md` 在 EPIC 目录下生成 `CR-[YYYYMMDD]-[短编号].md`
   - 自动填充：变更内容、影响分析（影响范围 + 下游更新清单）
   - 变更原因与证据、风险与回滚策略由用户补充或从输入中提取

6. **输出影响分析结果**（所有模式）：
   - 列出变更类型、受影响 Feature、受影响产物与章节
   - 列出下游更新清单（带执行顺序）
   - analyze 模式到此结束，不执行更新

7. **分步执行下游更新**（无参数/apply 模式）：
   - 提示用户确认下游更新清单
   - 按变更类型走对应流程（参考 workflow-overview.html §7.1 / §7.2）：
     - **需求类**：更新 spec → 检查 ux-design → 检查 tech-spec → 检查 epic-design → 检查 l2_design（各 ST 文件）→ 更新 tasks
       - **更新 spec 的硬约束**：**只允许**修改 FR / NFR（量化指标） / AC / 范围（In/Out，含背景与价值表中的 In/Out） / 完整场景矩阵；**绝对禁止**写入类名、接口、框架、库、表名、字段、SQL、API 路径、代码片段、包路径、文件路径、线程原语、埋点字段等技术实现细节（业务假设、平台/合规约束、领域实体语义改 `tech-spec.md` §二～§四 或 `epic-design.md` §三；详见 `.cursor/rules/aisdd-document-boundaries.mdc`）
     - **技术方案类**：检查 NFR 是否需调整 → 更新 tech-spec.md → 更新 epic-design → 更新 l2_design（各 ST 文件）→ 检查 Story 拆解 → 更新 tasks
       - **spec 禁触红线**：技术方案类 CR **默认不修改 spec.md**；**唯一例外**是「NFR 指标本身需要调整」（如从 `p95 ≤ 200ms` 放宽到 `p95 ≤ 500ms`）——此时只能修改 NFR 行的数值/口径，不得在 spec.md 中粘贴实现方案、库选型、类名等技术决策
     - **混合类**：在 CR 文件 §3.1 影响范围中**预先标注** spec.md 的修改范围（仅 NFR 指标 / 仅 FR/AC 文字 / FR/AC+NFR / 无），按对应路径执行；未在 CR 中标注的字段**不得**在执行阶段顺手改动
   - **写 spec 前的纯净度自检**（每次写入 spec.md 前必须执行）：逐条扫描即将写入的内容是否含技术污染特征（参见 `aisdd.featurespec.md` §「spec / 技术细节边界守护」8 类识别表）；命中即按 block_ask 流程拦截，让用户三选一后再决定是否写入
   - 每步更新后：
     - 更新文件的变更记录表（Version +0.0.1）
     - 输出已更新的文件与章节
     - 提示用户 check 后继续下一步

8. **完成报告**：
   - 输出 CR 文件路径
   - 列出所有已更新的文件清单
   - 根据本次变更实际影响的阶段，输出**后续必要步骤提醒**：

   | 条件 | 提醒内容 |
   |------|---------|
   | 可选（质量加码） | 可运行 `/aisdd.analyze` / `/aisdd.analyze epic` 确认变更后各产物无矛盾；**非** implement 前置必做 |
   | tasks.md 有更新 | 更新 Version 与变更记录；受影响的 Task（列出 Task ID）需重新执行 `/aisdd.implement Txxx` 或 `/aisdd.implement ST-xxx`，实现后对照更新后的设计与 spec 自检 |
   | epic-design / l2_design 有更新 | 更新对应文档 Version 与变更记录；可选重跑 `/aisdd.analyze epic` |
   | 代码已实现部分受影响的 Story | 重新实现或修复后，对照更新后的 `epic-design.md` / L2 与 `spec.md` 自检实现一致性 |

核心规则：
- **`research/` 不回写**：代码调研快照不参与 CR；禁止将 `research/` 纳入影响范围或执行更新
- **精准更新**：只更新 CR 影响分析中列出的产物章节，不扩散修改
- **版本追踪**：每份更新的文档须更新 Version 与变更记录表
- **分步确认**：每步更新后提示用户 check，不一次性全部改完
- **数据一致**：更新后各产物之间的引用关系须保持一致
- **spec 纯净度守护（红线，不可豁免）**：
  - `spec.md` 是**纯粹的产品规格**事实源，本命令在任何变更类型下都**不得**向 `spec.md` 写入技术实现细节（类名、接口、框架、库、表名、字段、SQL、API 路径、代码、包路径、线程原语、埋点字段等）
  - 技术方案类 CR **默认不动 spec.md**，例外仅限 NFR 指标本身的数值调整
  - 写入 spec.md 前必须执行「纯净度自检」（见步骤 7），命中污染特征即按 block_ask 流程拦截
  - 详见 `.cursor/rules/aisdd-document-boundaries.mdc` 与 `.specify/templates/spec-template.md` 顶部「纯净度约束」
