---
description: "生成 Feature 级技术规约与实现约束，在 epic-plan.md 的 EPIC 级约束下编写。详细架构设计（0/1 层架构、全景类图、时序、Story 拆解、L2 设计）在 /speckit.epicdesign 阶段产出。"
handoffs:
  - label: 审批关卡（plan-ready，在所有 Feature plan 完成后）
    agent: speckit.gate
    prompt: plan-ready 关卡——冻结 epic-plan 与各 plan 后进入设计说明书阶段
    send: false
  - label: 输出 EPIC 软件设计说明书
    agent: speckit.epicdesign
    prompt: 各 Feature plan 完成后，产出 EPIC 软件设计说明书（含架构图、Story 拆解）+ 各 Feature 的 story_detail_design.md（L2 设计）
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

目标：生成 `plan.md`（Feature 级技术规约与实现约束）。

**plan.md 的定位**：Feature 级技术约束与实现规范。详细架构设计（0 层/1 层架构图、全景类图、关键时序图、Story 拆解、L2 详细设计）由后续 `/speckit.epicdesign` 阶段在 EPIC 级统一产出。

**方案设计的输入（必须考虑）**：**spec 需求**（spec.md）与 **EPIC 级 epic uidesign**（`specs/epics/<EPIC>/ux-design.md` + Figma 链接 / `design/` 下截图或 HTML）。设计稿在 ux-design.md 的「设计稿索引」中登记。若 epic uidesign 未执行则仅以 spec 为输入。

建议：在 **EPIC 分支** 执行，并确保已通过 `SPECIFY_FEATURE` 选中目标 Feature。

执行步骤：

1. **环境搭建**：从代码库根目录运行 `.specify/scripts/powershell/setup-plan.ps1 -Json`，解析 JSON 得到：
   - `FEATURE_SPEC`（spec.md 路径）
   - `IMPL_PLAN`（plan.md 路径）
   - `SPECS_DIR`、`BRANCH`、`UX_DESIGN`、`DESIGN_DIR`
   - `EPIC_PLAN`（在 EPIC 工作流下为 **EPIC 级** epic-plan.md 路径，若存在）

2. **加载上下文**：
   - 读取 `FEATURE_SPEC`（提取：Epic/Feature 元信息、FR/NFR、验收与边界场景、依赖）——**spec 需求**为方案设计的主要输入。
   - 若 `EPIC_PLAN` 存在（**EPIC 级** epic-plan.md）：读取 epic-plan.md，提取 **EPIC 级技术约束与规约**；技术规约须在其约束下展开，不得违反 EPIC 规约。
   - 若 `UX_DESIGN` 存在：读取 ux-design.md，提取信息架构、交互规则、视觉规范、设计稿索引（按所属 Feature 过滤）。
   - 读取 `.specify/memory/constitution.md`（提取 MUST/SHOULD 约束，作为 Plan 关卡）
   - 读取 `.specify/templates/plan-template.md`（作为结构与输出格式）
   - 读取 `.cursor/rules/specify-diagram-requirements.mdc`，确保图表基于本工程实际架构
   - **注意**：模板中所有图表须遵循 `.cursor/rules/mermaid-style-guide.mdc` 配色规范

3. **填充 plan.md 内容**：

   按 plan-template.md 模板填充以下内容：

   - **Plan 前置检查**：验证 EPIC 级规约遵从、共享能力依赖
   - **技术规约与实现约束**（§一~§八）：
     - 一、设计说明书 ↔ 技术规约一致性互校
     - 二、技术背景
     - 三、架构约束与演进规则
     - 四、数据模型与状态管理
     - 五、接口与契约规范
     - 六、合规性检查（如适用）
     - 七、项目结构约定
     - 八、源代码结构
   - **Story 索引表**：轻量 Story 索引（详细设计指向后续 EPIC 软件设计说明书中的对应章节）

4. **写入 `IMPL_PLAN`**：覆盖写入 plan.md。

5. **可选：更新 Agent 上下文**（若项目使用该能力）：
   - 运行 `.specify/scripts/powershell/update-agent-context.ps1 -AgentType cursor-agent`

6. **完成报告**：输出：
   - `plan.md` 路径
   - Plan Version
   - 已生成的章节清单
   - **下一步提示**：若所有 Feature plan 已完成 → `/speckit.gate plan-ready`（审批关卡）→ `/speckit.epicdesign` 产出 EPIC 软件设计说明书（含架构图、Story 拆解）+ 各 Feature 的 story_detail_design.md（L2 设计）

核心规则：
- **文档格式要求（强制）**：所有技术图表必须使用 **Mermaid 格式**，遵循 `.cursor/rules/mermaid-style-guide.mdc`
- **EPIC 规约遵从**：plan.md 的技术规约不得违反 epic-plan.md 的约束
- 执行主体：**SE/TL（或架构师）**。开发者应将 `plan.md` 视为只读输入；如需变更必须提交变更提案。
- Plan 的技术规约是后续 EPIC 设计说明书与 Implement 阶段的约束输入之一。
