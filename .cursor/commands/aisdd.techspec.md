---
description: "产出 EPIC 根目录唯一技术规格书 tech-spec.md（合并原 epic-plan 与各 Feature plan）。基于 epic.md、各 spec.md 及现有工程代码，冻结 EPIC 级公共约束与各 Feature 增量规约。不含详细设计。"
handoffs:
  - label: 对抗性挑战（多 Feature 推荐）
    agent: aisdd.challenge
    prompt: tech-spec 完成后运行 /aisdd.challenge techspec 对抗性检测技术规约
    send: false
  - label: 输出 EPIC 软件设计说明书
    agent: aisdd.epicdesign
    prompt: tech-spec 完成后产出 EPIC 软件设计说明书
    send: true
  - label: 补充需求或澄清
    agent: aisdd.clarify
    prompt: 需补充技术边界时澄清；若 tech-spec.md 已存在可说明更新范围做增量更新
    send: false
---

## 用户输入

```text
$ARGUMENTS
```

可用于：**EPIC 标识**（如 `EPIC-002`）、**更新范围**（如「仅更新 FEAT-002 章节」）、或规约侧重说明。

## 前置条件

1. `epic.md` 已存在
2. **所有** Feature 的 `spec.md` 已完成（Spec Ready）
3. 可与 `/aisdd.epicuidesign` 并行（若已有 `ux-design.md` 须读取）

可选：多 Feature EPIC 在运行前先执行 `/aisdd.challenge spec`。

## 大纲

在 **EPIC 根**（`specs/epics/<EPIC-xxx>/`）产出 **唯一** `tech-spec.md`，结构见 `.specify/templates/tech-spec-template.md`：

- **第一部分**：原 `epic-plan` 内容（EPIC 公共约束、跨 Feature 边界、运行时、数据总约束、共享能力、编写顺序）
- **第二部分**：为 `epic.md` 中**每个 Feature** 各一节（规约摘要、增量约束、能力边界、数据/NFR/安全硬约束）

**禁止写入**：架构图、类图、时序、接口签名、表字段、Story、NFR 预算表（→ `nfr.md`）、接口契约（→ `interface-design.md`）。

**裁剪**：纯修复/≤3 人天 EPIC 可仅填第一部分 + 涉及 Feature 的精简第二节；其余 Feature 节标注「遵循快速通道，见 epic-design §十二」。

## 执行步骤

### 1. 环境与路径

```powershell
.specify/scripts/powershell/get-epic-paths.ps1 -EpicId "EPIC-002" -Json
```

解析 `EPIC_DIR`、`TECH_SPEC`、`HAS_TECH_SPEC`。未设 `SPECIFY_EPIC` 且无 EPIC 标识时**终止**。

若 `HAS_TECH_SPEC` 为 false，创建文件：

```powershell
.specify/scripts/powershell/setup-techspec.ps1 -EpicId "EPIC-002" -Json
```

若 `HAS_TECH_SPEC` 为 true 且用户未说明更新范围：**终止**并提示「请说明要更新的章节（如：第一部分 §三、或 FEAT-002 整节）」。

### 2. 前置检查

遍历 `EPIC_DIR/features/*/`，缺 `spec.md` 的目录**终止**并列出。

### 3. 加载上下文

- `epic.md`、各 `features/*/spec.md`
- `.specify/templates/tech-spec-template.md`
- `constitution.md`
- `ux-design.md`（若存在）
- `research/`（若存在，只读辅助，不得作为约束依据，不得回写 research）
- **现有工程代码**（差距分析、技术栈校准）

### 4. 填充 tech-spec.md

1. 填写 **Tech Spec 前置检查**、**变更记录**（初版 v0.1.0）
2. **第一部分** 六节：与 `epic.md`「跨 Feature 技术策略」对齐
3. **第二部分**：按 epic Feature 列表顺序，为每个 Feature 复制模板中的 Feature 节结构并填写；Owner Feature 章节逻辑上先于 Consumer（可在一次写入中完成，但 Consumer 须引用 Owner 能力边界）
4. 无增量的子项写「无增量，遵循第一部分 EPIC 级规约」或 `N/A`

**多 Feature 并行撰写（可选）**：上下文充裕时，可对第二部分各 Feature 节并行起草，主 Agent 合并并执行 **§5 能力边界检查**。

### 5. 跨 Feature 能力边界检查

| 检查项 | 级别 |
|--------|------|
| Owner §三 能力边界与 Consumer §三 依赖对齐 | BLOCK |
| 各 Feature 增量约束与第一部分一致 | WARN |
| 共享能力重复实现（未引用 Owner） | WARN |
| 数据 SoR 冲突 | WARN |

输出简要检查表（≤20 条）。完整对抗性挑战 → `/aisdd.challenge techspec`。

### 6. 完成报告

- `tech-spec.md` 路径
- Tech Spec Version
- 已覆盖 Feature 列表
- 能力边界检查摘要
- 下一步：`/aisdd.challenge techspec`（推荐）→ `/aisdd.epicdesign`

## 核心规则

- **演进式设计**、**差距分析**、**模板结构保护**（constitution）
- **spec 单向消费**：禁止修改任何 `spec.md`
- **一份事实源**：不得再创建 `epic-plan.md` 或各 Feature `plan.md`
- SE/TL 产出；DEV 只读，变更走 CR
