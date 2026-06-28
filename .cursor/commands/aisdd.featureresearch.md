---
description: "Feature 级代码调研（Brownfield）：帮助设计者熟悉存量代码，并为 epicdesign 提供设计参考；Greenfield 可跳过。报告默认写入 features/FEAT-xxx/research/。"
handoffs:
  - label: 继续下一 Feature
    agent: aisdd.featurespec
    prompt: 若 EPIC 尚有 Feature 未完成 spec/ux/调研，继续下一 Feature；否则进入 techspec
    send: false
  - label: EPIC 技术规格书
    agent: aisdd.techspec
    prompt: 全部 Feature 的 spec（及可选 ux-design；Brownfield 的 research）就绪后，运行 /aisdd.techspec
    send: false
---

## 用户输入

```text
$ARGUMENTS
```

在继续操作前，你**必须**参考用户输入（若不为空）。

**参数（极简）**：

| 输入 | 说明 |
|------|------|
| （空） | 当前 Feature（`check-prerequisites.ps1` 解析） |
| `FEAT-xxx` | 指定 Feature |
| 自由文本 | 可选，缩小调研子范围；默认以整份 spec + ux 驱动 |
| `--skip` | 声明本 Feature **纯 Greenfield**（无存量代码可调研），跳过且不写报告 |

**不支持**：`--save`（**默认即保存**）、平台选型、方案建议类输出。

示例：
- `/aisdd.featureresearch`
- `/aisdd.featureresearch FEAT-002`
- `/aisdd.featureresearch FEAT-001 --skip`

---

## 何时运行 / 何时跳过

| 类型 | 是否运行 | 说明 |
|------|----------|------|
| **Brownfield** | ✅ 推荐 | spec/ux 涉及的 FR 在代码库中有**部分或全部**存量实现，需弄清**技术实现流程与原理** |
| **纯 Greenfield** | ❌ 跳过 | 本 Feature **全新能力**，代码库中**无**可对读的存量实现（需求↔代码索引全部为「未见实现」且无可深读的关联模块） |
| **混合** | ✅ 部分调研 | 仅对**已有代码落点**写流程与原理；「未见实现」的 FR 在索引表标注即可，**不编造**流程 |

**跳过方式**：
- 用户显式 `--skip`，或
- 执行 §适用性判断后确认纯 Greenfield → 输出跳过说明（原因 + 下一步），**不写** `research/` 报告

**禁止**：无存量代码仍生成空报告或虚构流程。

---

## 调研目标与时机

**时机**：本 Feature **`spec.md` 完成之后**；若存在 **`ux-design.md`** 须先读完。**位于** featurespec / featureuidesign **之后**、techspec / epicdesign **之前**。

**调研目标**（Brownfield）：

1. **帮助设计者熟悉当前相关代码** — 对照 spec/ux，弄清存量实现的模块落点、**技术实现流程与原理**、异常与状态机制，降低读码成本。
2. **为后续 epicdesign 提供设计参考** — 产出只读事实快照，供 `/aisdd.epicdesign` 理解「现状是什么」；**不替代** design 阶段的方案决策与完整分析。

**边界（须与目标并存）**：
- 报告**只记录事实**，不写方案建议
- 是 epicdesign 的**参考输入**，**不是**约束源；design 须独立分析并做出自己的设计决策
- 写完即冻结；techspec/design/CR **不得**回写 `research/`

**产出（Brownfield，默认落盘）**：
- `{FEATURE_DIR}/research/codebase-{slug}-{YYYYMMDD}.md`
- 含：需求↔代码索引、**实现流程**、**工作原理**、异常路径、技术债观察（仅事实）

---

## 前置条件

1. 本 Feature **`spec.md` 已存在**
2. **`ux-design.md`**：若已产出则必读
3. 运行 `check-prerequisites.ps1 -Json -PathsOnly`，解析 `FEATURE_DIR`、`FEATURE_SPEC`
4. **`FEATURE_DIR` 不可解析则终止**（Brownfield 落盘时需要）

---

## 文档生命周期（强制）

| 规则 | 说明 |
|------|------|
| **存放位置** | `{FEATURE_DIR}/research/`（**仅 Brownfield 有报告**） |
| **默认保存** | Brownfield 调研完成**必须**写入文件 |
| **Greenfield** | **不创建** `research/` 报告文件 |
| **一次性快照** | 写完即冻结；techspec/design/CR **不得**回写 |
| **非事实源 / 设计参考** | 下游（尤其 epicdesign）**可读**以熟悉代码、辅助设计；**不得**当作约束或决策依据 |

---

## 操作约束

- **严格只读**：不修改代码或既有文档
- **事实优先**：流程与原理须可追溯至文件路径
- **禁止方案化表述**：不写「应复用/应重构/推荐在 tech-spec 中…」
- **基于真实代码**：类名、包路径须来自工程

---

## 执行步骤

### 1. 解析

- 解析 Feature 标识、可选子主题、`--skip`
- `--skip` → 输出 Greenfield 跳过说明，建议下一步，**终止**（不写报告）

### 2. 加载上下文

必载：`spec.md`、`research-template.md`、`constitution.md`  
按需：`ux-design.md`、`epic.md`、工程源码

### 3. 适用性判断（Brownfield vs Greenfield）

对照 spec/ux 在代码库中**快速搜索**（SemanticSearch + Grep + 读入口类）：

- 若**不存在**任何与本 Feature FR/场景/ux 入口可关联的存量实现 → **纯 Greenfield** → 跳过（同 `--skip`），完成报告说明「无需调研」
- 若存在部分或全部落点 → **继续** §4 完整调研
- 不确定时：向用户确认一次；用户确认 Greenfield 则跳过

### 4. 代码调研（Brownfield / 混合）

按下列维度**只记录现状**：

1. **需求 ↔ 代码落点索引（必填）** — FR/AC/P0 场景 → 包/类/方法或「未见实现」
2. **模块定位** — 包/Gradle module、分层
3. **关键类型与公开接口** — 已有签名与字段
4. **技术实现流程与原理（必填，有存量代码时）**
   - **实现流程**：触发 → 调用链 → 数据流（时序/流程图，类名真实）
   - **工作原理**：并发/缓存/状态驱动/线程边界等**可观察机制**（据源码，附证据位置）
5. **异常、边界与失败路径（必填）** — 对照 spec 场景矩阵
6. **状态、生命周期与持久化**
7. **依赖与耦合**
8. **测试与样例**（若存在）
9. **观察到的限制与技术债**

**搜索策略**：ux/spec 入口 → ViewModel/Repository/DI → 沿调用链向下。

### 5. 生成并保存报告（仅 Brownfield / 混合）

1. 按 `research-template.md` 生成 Markdown（**必须含**「技术实现流程与原理」节）
2. **立即写入** `{FEATURE_DIR}/research/codebase-{slug}-{YYYYMMDD}.md`
3. **禁止覆盖**已有文件

### 6. 完成提示

**Brownfield**：3～5 条摘要 + 已写入路径 + 声明非事实源 + 下一步

**Greenfield（跳过）**：
- 说明跳过原因（无存量代码 / 用户 `--skip`）
- 声明：本 Feature **无需** `research/` 报告，可直接进入 techspec 流水线
- 下一步：下一 Feature 或全部就绪后 `/aisdd.techspec`

---

## 与现有命令的关系

```text
featurespec → featureuidesign（可选）→ featureresearch（Brownfield 才跑）→ … → techspec → epicdesign → …
```

| 命令 | 关系 |
|------|------|
| featurespec / featureuidesign | 前置 |
| techspec | 后续；**可读** Brownfield 的 `research/` 辅助差距分析 |
| **epicdesign** | 主要下游消费者；**可读** `research/` 作为**设计参考**（熟悉存量代码），但须独立做完整设计 |
| cr | 不得更新 `features/*/research/` |

## 上下文

$ARGUMENTS
