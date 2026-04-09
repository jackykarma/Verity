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

**`-h` 帮助输出**（当且仅当参数为 `-h` 时输出，不执行写入）：

```
/aisdd.cr 参数说明：

  (无参数)     交互式创建 CR：收集变更描述 → 影响分析 → 生成 CR 文件 → 分步执行下游更新
  analyze      仅执行影响分析并输出下游更新清单，不执行更新
  apply CR-xxx 基于已有 CR 文件，直接执行下游更新
  -h           显示本帮助信息
```

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
   - 读取各 `EPIC_DIR/features/*/spec.md`、`plan.md`、`tasks.md`（若有）
   - 读取 `EPIC_DIR/epic-plan.md`（若有）
   - 读取 `EPIC_DIR/epic-design.md`（若有）
   - 读取 `EPIC_DIR/ux-design.md`（若有）
   - 读取 `.specify/templates/change-request-template.md`

4. **影响分析**：
   - **判断变更类型**：需求类（Scope/FR/NFR/AC）/ 交互类 / 技术方案类 / 混合
   - **定位受影响的产物**：逐个检查 spec/ux-design/plan/epic-plan/epic-design/l2_design（各 ST 文件）/tasks，列出需要更新的文件与章节
   - **参考 workflow-overview.md §7.3 变更影响速查表**确定更新链路
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
   - 按变更类型走对应流程（参考 workflow-overview.md §7.1 / §7.2）：
     - **需求类**：更新 spec → 检查 ux-design → 检查 plan → 检查 epic-design → 检查 l2_design（各 ST 文件）→ 更新 tasks
     - **技术方案类**：检查 NFR 是否需调整 → 更新 plan/epic-plan → 更新 epic-design → 更新 l2_design（各 ST 文件）→ 检查 Story 拆解 → 更新 tasks
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
   | 始终 | 运行 `/aisdd.analyze` 确认变更后各产物无矛盾 |
   | tasks.md 有更新 | 受影响的 Task（列出 Task ID）需重新执行 `/aisdd.implement`；实现完成后运行 `/aisdd.verify` 验证 |
   | epic-design / l2_design 有更新 | 若 `design-ready` 关卡已冻结，建议重新运行 `/aisdd.gate design-ready` 更新冻结基线 |
   | tasks.md 有更新且 `tasks-ready` 已冻结 | 建议重新运行 `/aisdd.gate tasks-ready` 更新冻结基线 |
   | 代码已实现部分受影响的 Story | 实现完成后运行 `/aisdd.verify`（可指定范围：`story ST-xxx` 或 `feat FEAT-xxx`）验证实现与更新后设计一致 |

核心规则：
- **精准更新**：只更新 CR 影响分析中列出的产物章节，不扩散修改
- **版本追踪**：每份更新的文档须更新 Version 与变更记录表
- **分步确认**：每步更新后提示用户 check，不一次性全部改完
- **数据一致**：更新后各产物之间的引用关系须保持一致
