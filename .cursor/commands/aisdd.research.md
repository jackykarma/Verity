---
description: "Feature 级代码熟悉：在本 Feature 的 spec.md（及可选 ux-design.md）完成后，调研需求所涉存量代码；报告默认写入 features/FEAT-xxx/research/。"
handoffs:
  - label: 继续下一 Feature
    agent: aisdd.featurespec
    prompt: 若 EPIC 尚有 Feature 未完成 spec/ux/research，继续下一 Feature；否则进入 techspec
    send: false
  - label: EPIC 技术规格书
    agent: aisdd.techspec
    prompt: 全部 Feature 的 spec（及可选 ux-design、research）就绪后，运行 /aisdd.techspec
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
| 自由文本 | 可选，缩小调研子范围（如「批量删除流程」）；默认以整份 spec + ux 驱动 |
| `--skip` | 本 Feature 为纯 Greenfield，跳过调研（不写报告） |

**不支持**：`--save`（**默认即保存**）、平台选型、方案建议类输出。

示例：
- `/aisdd.research`
- `/aisdd.research FEAT-002`
- `/aisdd.research 相册批量删除`
- `/aisdd.research FEAT-001 --skip`

---

## 目标与时机

**时机**：本 Feature **`spec.md` 完成之后**；若存在 **`ux-design.md`** 须先读完。**位于** featurespec / featureuidesign **之后**、techspec **之前**。

**目的**：在 techspec/epicdesign 之前，熟悉本 Feature 需求所涉存量代码——模块、逻辑、异常处理、状态与调用链。

**产出（默认落盘）**：
- `{FEATURE_DIR}/research/codebase-{slug}-{YYYYMMDD}.md`
- 需求 ↔ 代码落点、调用链、异常路径现状、技术债观察（仅事实，无方案）

---

## 前置条件

1. 本 Feature **`spec.md` 已存在**
2. **`ux-design.md`**：若已产出则必读
3. 运行 `check-prerequisites.ps1 -Json -PathsOnly`，解析 `FEATURE_DIR`、`FEATURE_SPEC`
4. **`FEATURE_DIR` 不可解析则终止**（无法默认保存）

---

## 文档生命周期（强制）

| 规则 | 说明 |
|------|------|
| **存放位置** | `{FEATURE_DIR}/research/` |
| **默认保存** | 调研完成**必须**写入文件，不仅对话输出 |
| **一次性快照** | 写完即冻结；techspec/design/CR **不得**回写 |
| **更新认知** | 新建带新日期的文件，不修订旧报告 |
| **非事实源** | 下游只读辅助，不得当作约束或决策依据 |

---

## 操作约束

- **严格只读**：不修改代码或既有文档
- **事实优先**：结论须可追溯至文件路径
- **禁止方案化表述**：不写「应复用/应重构/推荐在 tech-spec 中…」
- **基于真实代码**：类名、包路径须来自工程

---

## 执行步骤

### 1. 解析

- 解析 Feature 标识、可选子主题、`--skip`
- `--skip` → 记录原因，建议下一步，终止

### 2. 加载上下文

必载：`spec.md`、`research-template.md`、`constitution.md`（分层惯例）  
按需：`ux-design.md`、`epic.md`、工程源码

### 3. 代码熟悉

按下列维度**只记录现状**（范围由 spec/ux 驱动，不做无关穷举）：

1. **需求 ↔ 代码落点索引（必填）** — FR / 关键 AC / P0 场景 → 包/类/方法或「未见实现」；ux 入口 → UI 层入口类
2. **模块定位** — 包/Gradle module、分层位置
3. **关键类型与公开接口** — 已有签名与字段（据源码）
4. **典型调用链与数据流** — UI 到 Data 现有路径（Mermaid 类名须真实）
5. **异常、边界与失败路径（必填）** — 对照 spec 场景矩阵，记录代码中已有处理或「未见实现」
6. **状态、生命周期与持久化**
7. **依赖与耦合**
8. **测试与样例**（若存在）
9. **观察到的限制与技术债**（仅事实，无修复建议）

**搜索策略**：入口类、导航、ViewModel、Repository、DI Module → 沿调用链向下。

### 4. 生成并保存报告（强制）

1. 按 `research-template.md` 生成 Markdown
2. **立即写入** `{FEATURE_DIR}/research/codebase-{slug}-{YYYYMMDD}.md`（目录不存在则创建）
3. `slug`：子主题或 `feature-overview`
4. **禁止覆盖**已有文件

多子主题需拆分时可写多个文件，均落在同一 `research/` 目录，**无需额外参数**。

### 5. 完成提示

- 3～5 条事实摘要
- **已写入路径**：`{FEATURE_DIR}/research/codebase-...md`
- 声明：非事实源，techspec/design/CR 不回写
- 下一步：继续下一 Feature 或全部就绪后 `/aisdd.techspec`

---

## 与现有命令的关系

```text
featurespec → featureuidesign（可选）→ research → … 全部 Feature 完成后 → techspec → epicdesign → …
```

| 命令 | 关系 |
|------|------|
| featurespec / featureuidesign | 前置 |
| techspec / epicdesign | 后续；可读 research 辅助差距分析 |
| cr | 不得更新 `features/*/research/` |

## 上下文

$ARGUMENTS
