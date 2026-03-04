---
description: "对当前 Feature 的 plan.md 做增量更新；plan 范围由 spec 变更推导（传 spec 范围）或纯方案变更时由 $ARGUMENTS 指定（传 plan 范围），其余保留；在「变更记录」中追加一行。"
handoffs:
  - label: 更新 EPIC 设计说明书（当 plan 变更影响设计时）
    agent: speckit.epicdesign-update
    prompt: 范围：受影响的设计章节（因 Feature plan 变更）
    send: false
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

在继续操作前，你**必须**参考用户输入（若不为空）。`$ARGUMENTS` 为**必填**。**plan 的更新范围由「spec 变更」推导，或由「纯 plan 变更」时人工指定**，不得要求用户凭空枚举 plan 章节。

### 两种用法

| 触发场景 | `$ARGUMENTS` 传什么 | 如何确定要改的 plan 章节 |
|----------|---------------------|--------------------------|
| **spec 已变更** | **spec 范围**：`FR 与 NFR`、`验收标准`、`边界与异常场景`、`依赖关系`、`核心实体`、`假设与约束`、`需求追溯` | 按**保守映射**从 spec 范围推导受影响的 plan 章节 |
| **纯技术方案变更** | **plan 范围**：`§二 技术背景`、`§三 架构约束`、`§四 数据模型`、`§五 接口规范`、`§六 合规性`、`§七 项目结构`、`§八 源代码结构`、`Story 索引表` 等 | 按用户指定的 plan 范围更新 |
| **epic-plan 已变更** | **plan 范围**：例如 `§三 架构约束、§八 源代码结构（因 epic-plan 变更）` | 按用户给出的 plan 范围更新 |
| **epic uidesign 已变更** | **plan 范围**：例如 `§四 数据模型（因 uidesign 变更）` | 按用户给出的 plan 范围更新 |

### 保守映射：spec 范围 → 受影响的 plan 范围

| spec 范围 | 受影响的 plan 范围 |
|-----------|---------------------|
| FR、NFR、验收标准 | §二 技术背景、§四 数据模型、§五 接口规范、Story 索引表 |
| 边界与异常场景 | §五 接口规范、§八 源代码结构 |
| 依赖关系 | §五 接口规范 |
| 核心实体 | §四 数据模型 |
| 假设与约束 | §三 架构约束、§六 合规性、§八 源代码结构 |

## 大纲

目标：对当前 Feature 的 `plan.md` 做**增量更新**，仅重写由 spec 变更推导或由 $ARGUMENTS 指定的 plan 章节，其余原文保留；在「变更记录（增量变更）」表中**追加一行**。

强制约束：
- **增量规则**：仅重写步骤 3 确定的 plan 章节，禁止全量重写。
- **变更记录**：在「变更记录（增量变更）」表追加一行。
- **版本**：凡涉及 FR/NFR/AC/设计决策的为 **Minor**；纯澄清/格式为 **Patch**。

## 执行步骤

### 1. 环境与路径

从仓库根运行：

```powershell
.specify/scripts/powershell/check-prerequisites.ps1 -Json
```

- 若脚本**退出非零**：终止并提示先运行 `/speckit.plan`。
- 若脚本**成功**：解析 JSON 得到 `FEATURE_DIR`；令 `IMPL_PLAN` = `FEATURE_DIR`/plan.md，`FEATURE_SPEC` = `FEATURE_DIR`/spec.md。

### 2. 加载上下文

- 读取 `plan.md`、`spec.md`、`.specify/memory/constitution.md`、`.specify/templates/plan-template.md`。
- 若变更涉及 EPIC 规约：读取 epic-plan.md。
- 重写时仅处理步骤 3 确定的 plan 章节。

### 3. 确定可更新范围（plan 章节）

先**解析 `$ARGUMENTS`**，再得到本次要重写的 **plan 章节集合**：

1. **若 `$ARGUMENTS` 为 spec 范围**：按保守映射推导受影响的 plan 章节（取并集）。
2. **若 `$ARGUMENTS` 为 plan 范围**：直接以用户指定的 plan 章节为可更新范围。

**plan 章节与 plan-template 的对应**（用于写回时定位）：

| plan 范围 | 对应 plan-template 章节 |
|-----------|--------------------------|
| §一 | `## 一、设计说明书 ↔ 技术规约一致性互校` |
| §二 | `## 二、技术背景` |
| §三 | `## 三、架构约束与演进规则` |
| §四 | `## 四、数据模型与状态管理` |
| §五 | `## 五、接口与契约规范` |
| §六 | `## 六、合规性检查` |
| §七 | `## 七、项目结构` |
| §八 | `## 八、源代码结构` |
| Story 索引表 | `## Story 索引表` |

### 4. 生成/重算

- 仅对步骤 3 确定的 plan 章节做重算或重写。
- 不得引入 plan/spec 中未出现或已推翻的决策。
- 图表须遵循 `.cursor/rules/mermaid-style-guide.mdc`。

### 5. 变更记录

在 plan 的「变更记录（增量变更）」表追加一行。

### 6. 写回

仅替换受影响章节的原文，写回 `IMPL_PLAN`。

### 7. 完成报告

输出：
- `plan.md` 路径
- Plan Version（更新后）
- 本次更新范围摘要
- 若变更影响 EPIC 设计说明书，建议运行 `/speckit.epicdesign-update`

## 与现有命令的关系

- **`/speckit.plan`**：从无到有生成 plan，或全量覆盖 plan.md。
- **`/speckit.plan-update`**：在已有 plan 上按范围增量更新。
- **`/speckit.epicdesign-update`**：当 plan 变更影响 EPIC 设计说明书时。
