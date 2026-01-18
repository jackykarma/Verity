---
description: 生成工程级 Plan（Plan-A/Plan-B + Story Breakdown），包含工程决策、风险评估与算法/功耗/性能/内存量化验收指标。
handoffs:
  - label: 生成任务（Story → Task）
    agent: speckit.tasks
    prompt: 将 Plan 的 Story Breakdown 拆解为可执行 tasks.md
    send: true
  - label: 同步 EPIC 总览（可选）
    agent: speckit.epicsync
    prompt: 将本 Feature 的 plan 进展同步到 EPIC 总览
    send: false
  - label: 创建检查清单
    agent: speckit.checklist
    prompt: 为以下领域创建检查清单……
    send: false
---

## 用户输入

```text
$ARGUMENTS
```

在继续操作前，你**必须**参考用户输入内容（若不为空）。

## 大纲

目标：生成 `plan.md`（工程级蓝图），并在文档内完成：
- **Plan-A**：工程决策、模块架构、关键流程、风险与消解、边界/异常枚举、算法/功耗/性能/内存评估（必须量化 + 验收指标）。
- **Plan-B**：技术规约与实现约束（保留原 spec-kit 约定：技术背景字段、合规性检查、项目结构等）。
- **Story Breakdown**：把 Feature 拆为可开发的技术 Story（ST-xxx），并映射覆盖 FR/NFR。

执行步骤：

1. **环境搭建**：从代码库根目录运行 `.specify/scripts/powershell/setup-plan.ps1 -Json`，解析 JSON 得到：
   - `FEATURE_SPEC`（spec.md 路径）
   - `IMPL_PLAN`（plan.md 路径）
   - `SPECS_DIR`、`BRANCH`
   - 对于参数中包含单引号（如 "I'm Groot"），使用转义语法：例如 'I'\''m Groot'（或尽可能使用双引号："I'm Groot"）。

2. **加载上下文（只加载必要部分）**：
   - 读取 `FEATURE_SPEC`（提取：Epic/Feature 元信息、FR/NFR、验收与边界场景、依赖）
   - 读取 `.specify/memory/constitution.md`（提取 MUST/SHOULD 约束，作为 Plan 关卡）
   - 读取 `.specify/templates/plan-template.md`（作为结构与输出格式）

3. **填充 Plan-A（工程决策 & 风险评估）**：
   - 技术选型：候选对比 + 决策理由（禁止空泛）
   - 模块级架构：0层概览 + 1层模块表（边界/职责/依赖/约束）
   - 关键流程：必须同时包含正常与异常流程（使用 Mermaid 图 + 易懂文字说明）
   - 风险：给出风险表（风险描述 + 触发条件 + 范围 + 消解策略 + 绑定到 Story/Task）
   - 边界/异常：枚举数据/状态/生命周期/并发/用户行为
   - **算法/功耗/性能/内存评估**：必须量化，并写明验收阈值与测试方法

4. **填充 Plan-B（技术规约 & 实现约束）**：
   - 保留并填写“技术背景”字段（必须保留英文 Key 以供工具链提取）
   - 架构细化、数据模型、接口规范/协议、合规性检查、项目结构

5. **Story Breakdown（Plan 阶段末尾）**：
   - 产出 ST-xxx（Functional / Design-Enabler / Infrastructure / Optimization）
   - 每个 Story 必须标注：覆盖 FR/NFR、依赖、并行性、是否关键风险、验收/验证方式（高层）
   - 输出 Feature → Story 覆盖矩阵（确保 FR/NFR 不遗漏）

6. **写入 `IMPL_PLAN`**：覆盖写入 plan.md（保持模板标题层级）。

7. **可选：更新 Agent 上下文**（若项目使用该能力）：
   - 运行 `.specify/scripts/powershell/update-agent-context.ps1 -AgentType cursor-agent`

8. **完成报告**：输出 `plan.md` 路径、Plan Version、已生成的 Story 数量，并提示下一步：
   - （可选、需手动触发）`/speckit.fulldesign` 生成 Full Design 技术方案文档
   - `/speckit.tasks` 生成 tasks.md

核心规则：
- 所有评估（算法/功耗/性能/内存）必须可量化且带验收指标与测试方法。
- Plan 内容是 Implement 的唯一权威输入；Implement 期不得“边写边改设计”。
```