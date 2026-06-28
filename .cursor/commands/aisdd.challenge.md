---
description: "质量评审（对抗性挑战 + 一致性分析，只读非阻塞）。目标：spec | techspec | design | feature | epic | epic pre-tasks；不 gate featuretasks 或 implement。"
handoffs:
  - label: 修复 BLOCK/WARN/CRITICAL 问题
    agent: aisdd.cr
    prompt: 根据评审报告中的 BLOCK/WARN/CRITICAL 发现，发起变更请求
    send: false
---

## 用户输入

```text
$ARGUMENTS
```

在继续操作前，你**必须**参考用户输入（若不为空）。`$ARGUMENTS` 须包含**评审目标**（必填）：

| 目标 | 用法示例 | 模式 | 典型时机 |
|------|----------|------|----------|
| **spec** | `/aisdd.challenge spec` | 对抗性挑战 | featurespec 后 → techspec 前 |
| **techspec** | `/aisdd.challenge techspec FEAT-001` | 对抗性挑战 | techspec 后 → epicdesign 前 |
| **design** | `/aisdd.challenge design 仅安全` | 对抗性挑战 | epicdesign 后 → featuretasks 前 |
| **feature**（默认 scope） | `/aisdd.challenge feature`、`/aisdd.challenge feature FEAT-001` | 一致性分析 | tasks 就绪后 → implement 前 |
| **epic** | `/aisdd.challenge epic`、`/aisdd.challenge EPIC-002` | 一致性分析 | 全部 tasks 完成后（多 Feature 可选） |
| **epic pre-tasks** | `/aisdd.challenge epic pre-tasks` | 一致性分析 | epicdesign 后 → featuretasks 前 |

**可选参数**：Feature 标识（`FEAT-xxx`）、EPIC 标识（`EPIC-xxx`）、侧重（`仅安全` / `仅 NFR` / `仅架构`）。

**判定规则**（按优先级）：

1. 含 `pre-tasks`（与 `epic` 联用）→ epic 一致性模式且不校验 tasks
2. 含 `epic` 或匹配 `EPIC-\d+` → epic 一致性模式
3. 含 `feature` 或匹配 `FEAT-\d+`（且无 spec/techspec/design 目标）→ feature 一致性模式
4. 含 `spec` / `techspec` / `design` → 对抗性挑战模式
5. `$ARGUMENTS` 为空 → **立即终止**并提示用法

若 `$ARGUMENTS` 为空或未包含有效目标，**立即终止**并提示：

```
用法：/aisdd.challenge <目标>
  对抗性：spec | techspec | design
  一致性：feature | epic | epic pre-tasks
示例：/aisdd.challenge spec
      /aisdd.challenge feature
      /aisdd.challenge epic pre-tasks
```

## 可选性（强制）

- **全流程可选**：所有目标均**不是** `featuretasks`、`implement` 或 EPIC 交付的**必经步骤**。
- **不阻塞实现**：用户**未运行**本命令也可直接 `/aisdd.implement`；不得以「未 challenge/review」为由拒绝实现。
- **报告不自动拦截**：即使存在 BLOCK/CRITICAL，也仅**建议**修复；是否继续 implement 由用户决定（须在报告末尾确认）。
- **裁剪**：单 Feature EPIC、Fast Track（≤3 人天）可**跳过全部**评审；多 Feature 在 spec/techspec/design 阶段**强烈推荐**对抗性挑战；CR 变更后 techspec/design **必须**重跑对应对抗性目标。
- **一致性分析**（feature / epic / epic pre-tasks）：多 Feature 质量加码时选用，**非** implement 前置必做。

## 操作约束（共用）

**严格只读**：不修改任何文件。输出结构化 Markdown 报告（不写入文件）。整改方案须用户明确批准后再由其他命令执行。

**章程权威性**：`.specify/memory/constitution.md` **不可协商**；对抗性模式违规 → **BLOCK**；一致性模式违规 → **CRITICAL**。

---

## 模式 A：对抗性挑战（目标 = spec | techspec | design）

在进入下一阶段前，以**三个独立对抗角色**对目标文档进行质量挑战，发现单视角生成时的盲区：遗漏场景、可行性风险、范围蔓延、架构反模式等问题。

输出结构化挑战报告，供人类评审后决定是否触发 `/aisdd.cr`。

### 三角色挑战矩阵

根据挑战目标，激活对应的三个挑战角色。若用户指定了侧重（如 `仅安全`），可仅激活对应角色，但须在报告中说明「仅执行部分角色」。

#### 挑战目标：`spec`

| 角色 | 挑战视角 | 重点检测项 |
|------|----------|-----------|
| **需求完整性审计者** | 「有哪些场景没有被覆盖？」 | 边界场景、异常流程、角色权限边界、数据状态转换遗漏、并发竞态、AC 不可验证 |
| **NFR 可行性质疑者** | 「这些指标真的能做到吗？」 | NFR 是否可量化测量、Android 8.0+ 上是否可达、NFR 冲突、缺失测量基准 |
| **范围与依赖哨兵** | 「这里是否超出了 EPIC 目标？」 | 范围蔓延、隐性外部依赖、未声明的技术假设、与其他 Feature 的隐性耦合 |

#### 挑战目标：`techspec`

| 角色 | 挑战视角 | 重点检测项 |
|------|----------|-----------|
| **架构风险评审者** | 「这个设计会不会出问题？」 | SOLID 违规、Android 分层违规、Hilt DI 反模式、Room/协程/Compose 反模式、模块循环依赖 |
| **技术债务评估者** | 「我们在给未来挖坑吗？」 | 过度工程化、临时取舍无说明、硬编码假设、可扩展性盲区 |
| **可测试性与可观测性审查者** | 「这个方案能被验证和监控吗？」 | 核心逻辑可单测性、无法替换的具体依赖、日志/埋点/错误上报盲区 |

#### 挑战目标：`design`

| 角色 | 挑战视角 | 重点检测项 |
|------|----------|-----------|
| **安全评审者** | 「这里有安全漏洞吗？」 | 数据存储安全、网络传输安全、权限最小化、ContentProvider/Intent/WebView 风险、隐私合规 |
| **性能建模者** | 「NFR 目标真的能达到吗？」 | 主线程阻塞、内存泄漏/抖动、Compose 重组风险、关键路径耗时与 NFR 对照 |
| **Android 生态兼容性审查者** | 「在 API 24~35 上都能跑吗？」 | API level 兼容、Jetpack 版本约束、厂商 ROM 差异、目标 SDK 35 行为变更 |

### A-1. 解析目标与 EPIC 上下文

从 `$ARGUMENTS` 解析挑战目标、可选 Feature/EPIC 标识、可选侧重。

```powershell
.specify/scripts/powershell/get-epic-paths.ps1 -EpicId "EPIC-xxx" -Json
```

### A-2. 加载挑战目标文档

**`spec` 模式** — 各 Feature `spec.md`、`epic.md`、`constitution.md`

**`techspec` 模式** — `tech-spec.md`、各 Feature `spec.md`、`constitution.md`

**`design` 模式** — `epic-design.md`、各 Feature `l2_design/ST-xxx_*.md`（若存在）、`tech-spec.md`、`constitution.md`

若必要文件缺失，终止并提示先运行对应产出命令。

### A-3. 三角色对抗分析

以三种独立视角分别执行分析；若平台支持，可并行启动三个子 Agent。

**每个角色的分析约束**：
- 至少尝试找出 3 条有实质内容的问题（若无问题须给出具体理由）
- 问题须具体可查：指向文档章节/需求 ID/类名/方法名
- BLOCK 须论证确定性失败场景
- 章程违规自动 BLOCK

### A-4. 合并、去重与排序

1. 去重：同一问题多角色发现时保留最高级别，标注「多角色共同发现」
2. 排序：BLOCK > WARN > NOTE
3. ID 分配：`CH-[目标首字母][序号]`（如 `CH-S1`、`CH-T3`、`CH-D2`）

| 级别 | 判定标准 |
|------|---------|
| **BLOCK** | 确定性失败、安全漏洞、架构崩溃，或违反 constitution MUST |
| **WARN** | 较高风险，建议修复；跳过须人工确认 |
| **NOTE** | 改进建议，不影响进入下一阶段 |

### A-5. 对抗性报告格式

```markdown
## /aisdd.challenge [目标] 对抗性评审报告

**EPIC**：EPIC-xxx - [名称]
**挑战目标**：spec / techspec / design
**挑战日期**：YYYY-MM-DD
**文档版本**：[各目标文档版本号]
**激活角色**：[角色A] | [角色B] | [角色C]

### 挑战发现汇总

| ID | 角色 | 级别 | 位置 | 问题描述 | 建议 |

### BLOCK 级问题明细
（展开每条 BLOCK：失败场景、影响范围、最小修复方案）

### 挑战统计
- 总发现数：X（BLOCK / WARN / NOTE）
- 多角色共同发现：X 条

### 综合评级

| 评级 | 条件 |
|------|------|
| ✅ 可进入下一阶段 | 0 BLOCK，WARN ≤ 3 |
| ⚠️ 建议修复后进入 | 0 BLOCK，WARN > 3 |
| ❌ 存在阻塞问题 | BLOCK ≥ 1 |

**本次评级**：[✅ / ⚠️ / ❌]

### 后续建议
- BLOCK → `/aisdd.cr` 修复后重跑本目标
- WARN → 修复或记录「已知风险，人工确认自担」
- 进入下一阶段见 workflow §六
```

---

## 模式 B：一致性分析（目标 = feature | epic | epic pre-tasks）

工件间映射、术语、契约与章程的一致性检查（`feature` / `epic` / `epic pre-tasks` 目标）。

### B-1. Feature 范围（目标 = feature）

**运行时的输入要求（非流程门禁）**：须已有 `tasks.md`（由 `/aisdd.featuretasks` 产出；增量模式下至少含目标 Story 的 Task）；缺失则终止并提示先补 tasks。

```powershell
.specify/scripts/powershell/check-prerequisites.ps1 -Json -RequireTasks -IncludeTasks
```

解析 `FEATURE_DIR`、`FEATURE_SPEC`、`TECH_SPEC`、`TASKS`。加载 `spec.md`、`tech-spec.md`、`tasks.md`、`constitution.md`。

**检测（最多 50 条）**：

| 类别 | 内容 |
|------|------|
| A 重复项 | 近似重复 FR/表述 |
| B 模糊性 | 不可量化形容词、未解决占位符 |
| C 描述不充分 | 无对象的需求、AC 不对齐、任务引用未定义组件 |
| D 章程一致性 | 违反 MUST、缺失强制章节 |
| E 覆盖缺口 | 无任务的需求、无需求映射的任务、NFR 无任务体现 |
| F 不一致性 | 术语漂移、实体矛盾、任务顺序矛盾、技术栈冲突 |

**报告格式**：

```markdown
## Feature 一致性分析报告

**Feature**：FEAT-xxx | **EPIC**：（若可知）

| ID | 类别 | 严重程度 | 位置 | 摘要 | 建议 |

**覆盖情况汇总** | **章程问题** | **未映射任务** | **指标**
```

严重程度：CRITICAL / HIGH / MEDIUM / LOW。

### B-2. EPIC 范围（目标 = epic | epic pre-tasks）

**前置条件**：`epic-design.md` 已产出（至少 story 阶段）；`pre-tasks` 模式不要求各 Feature 已有 `tasks.md`。

```powershell
.specify/scripts/powershell/get-epic-paths.ps1 -EpicId "EPIC-xxx" -Json
```

加载 EPIC 级产物与各 Feature 产物（spec、tech-spec、tasks、l2、ux-design 等）。

**检测（最多 60 条）**：

| 类别 | 内容 |
|------|------|
| A 术语一致性 | 跨 Feature / 与 tech-spec 术语统一 |
| B 接口契约 | Owner tech-spec §三 与消费方引用、错误码体系 |
| C NFR 量化 | spec NFR ↔ `nfr.md` 评估结论 |
| D 共享能力 | epic.md ↔ tech-spec 第一部分 ↔ Owner/Consumer |
| E Story 与覆盖 | FR/NFR 覆盖矩阵、Story 依赖无环、ST 与 tasks/l2 一致 |
| F 架构一致性 | 分层约束、模块归属、类图与 L2 一致 |
| G 版本与变更 | Version 对齐、变更记录是否级联 |
| H 章程合规 | tech-spec 前置检查、MUST 违规 |

**pre-tasks 模式**：跳过 E 中与 `tasks.md` 强相关的行（标注 N/A：tasks 未生成）。

**报告格式**：

```markdown
## EPIC 跨 Feature 一致性分析报告

**EPIC**：EPIC-xxx | **模式**：全量 / pre-tasks | **产物覆盖**：…

| ID | 类别 | 严重程度 | 涉及 Feature | 位置 | 摘要 | 建议 |

### NFR 验证汇总 | ### 共享能力覆盖 | ### Story 覆盖矩阵 | ### EPIC 健康度
```

### B-3. 一致性分析后续行动

- CRITICAL → **建议**修复（`/aisdd.cr` 等）；用户接受风险时可继续 implement（报告须记录）
- 多 Feature EPIC → 可选再运行 `epic` 目标；**不得**暗示为 implement 前置必做

---

## 操作原则

- 高价值、低 token；发现表行数上限见各模式
- 无问题时输出成功摘要与覆盖统计
- 禁止虚构缺失章节
- 禁止修改任何文件（严格只读）
- 向用户询问：「是否需要我为排名前 N 的 BLOCK/WARN/CRITICAL 问题提供具体整改建议？」（**不自动执行**）

## 与现有命令的关系

对抗性目标（spec / techspec / design）插在阶段转换前；一致性目标（feature / epic / epic pre-tasks）在 tasks 前后按需插入。完整顺序见 `docs/aisdd/workflow-overview.html` §六。发现 BLOCK/WARN/CRITICAL 后走 `/aisdd.cr` 修复。

## 上下文

$ARGUMENTS
