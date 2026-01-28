---
description: 对 epic.md 做增量更新，仅重写 $ARGUMENTS 指定范围的章节，其余保留；不改动 Feature Registry。
handoffs: []
---

## 用户输入

```text
$ARGUMENTS
```

在继续操作前，你**必须**参考用户输入（若不为空）。`$ARGUMENTS` 为**必填**，用于指定「本次更新范围」。

格式须包含 **EPIC 标识**（如 `EPIC-001`）以及**本次更新范围**。示例：
- `EPIC-001 范围：整体FR/NFR`
- `EPIC-001 范围：Feature 拆分`
- `EPIC-001 范围：背景、目标与价值、范围`

## 大纲

目标：对 `specs/epics/<EPIC-xxx-*>/epic.md` 做**增量更新**，仅重写/重算 `$ARGUMENTS` 指定范围对应的章节，其余原文保留；在「变更记录」中**追加一行**。

强制约束：
- **增量规则**：仅重写/重算指定范围对应的章节，禁止全量重写。
- **禁止修改**：`Feature Registry（自动同步区）` 及其 `BEGIN_FEATURE_REGISTRY` / `END_FEATURE_REGISTRY` 之间的内容由 `/speckit.epicsync` 维护，本命令**不得改写**。

## 执行步骤

### 1. 解析 `$ARGUMENTS`

- 提取 `EPIC-xxx`（如 `EPIC-001`）。
- 剩余部分解析为「本次更新范围」（如：整体 FR/NFR、Feature 拆分、背景/范围/约束等）。

### 2. 定位 EPIC 目录与 epic.md

- 在 `specs/epics/` 下查找名称以 `EPIC-xxx-` 开头的目录（如 `EPIC-001-offline-sync`）。
- 若存在多个匹配，取第一个；或要求 `$ARGUMENTS` 中明确 short-name 以 disambiguate。
- 若未找到目录或其中 `epic.md` 不存在：**终止**并提示先运行 `/speckit.specify`。

### 3. 加载上下文

- 读取 `epic.md`、`.specify/templates/epic-template.md`（用于识别章节标题与「变更记录」格式）。

### 4. 确定可更新范围

与 [epic-template.md](.specify/templates/epic-template.md) 对应，**不得修改 Feature Registry 区块**。可更新章节包括：

| 可更新范围 | 对应 epic-template 章节 |
|-----------|-------------------------|
| 背景、目标与价值 | `## 背景、目标与价值` |
| 范围 | `## 范围` |
| 约束与假设 | `## 约束与假设` |
| 依赖关系 | `## 依赖关系` |
| EPIC 级风险与里程碑 | `## EPIC 级风险与里程碑`（含 风险、里程碑） |
| Feature 拆分 | `## Feature 拆分`（Feature 列表、Feature 边界说明） |
| 通用能力 | `## 通用能力`（能力清单、能力→Capability Feature 映射） |
| 整体 FR / NFR | `## 整体 FR / NFR`（EPIC-FR、EPIC-NFR） |
| EPIC 验收 | `## EPIC 验收`（验收前置条件、端到端验收场景、验收通过准则、验收结论） |

- **变更记录**：仅**追加**一行，不作为「范围」重写。

### 5. 生成/重算

- 根据 `$ARGUMENTS` 中的范围，**仅**重写对应章节。
- 可从 epic 描述、用户补充中推理，或做结构化 placeholder；若不新增 EPIC 级决策，可引用现有描述。
- 其余章节原文保留。

### 6. 变更记录

- 在「变更记录（增量变更）」表**追加一行**。
- 若该表不存在：在 `Feature Registry` **之前**，按 epic-template 格式插入「变更记录」节与表头，再追加。
- 表列建议：`版本 | 日期 | 变更范围 | 变更摘要 | 影响模块/Feature | 是否需要回滚`。
- **版本**：在变更记录中更新文档头部 `**EPIC Version**`（如 v0.1.0 → v0.2.0）。规则：凡涉及 FR/NFR/AC/设计决策的为 **Minor**；纯澄清/格式为 **Patch**。

### 7. 写回

- 仅替换受影响章节的原文，写回 `epic.md`。
- 不得改写 `BEGIN_FEATURE_REGISTRY` / `END_FEATURE_REGISTRY` 之间的内容。

### 8. 完成报告

输出：
- `epic.md` 路径
- EPIC Version（更新后）
- 本次更新范围摘要

若 EPIC 层变更影响跨 Feature：建议通过 CR 明确影响面，并对受影响 Feature 逐个执行 feature-update / plan-update / tasks，再运行 `/speckit.epicsync` 同步总览。

## 与现有命令的关系

- **`/speckit.specify`**：创建 EPIC 和 epic.md；specify-update 只做**增量更新**，不创建。
- **`/speckit.epicsync`**：只更新 epic.md 的 Feature Registry；specify-update **不碰** Feature Registry。
