---
description: "对抗性方案挑战：从多个独立视角对 spec / plan / design 进行非破坏性质量挑战，识别漏洞、风险与不可行点。在阶段转换前可选运行；多 Feature EPIC 或 CR 变更后强烈推荐。"
handoffs:
  - label: 修复 BLOCK/WARN 问题
    agent: aisdd.cr
    prompt: 根据 challenge 报告中的 BLOCK/WARN 发现，发起变更请求
    send: false
---

## 用户输入

```text
$ARGUMENTS
```

在继续操作前，你**必须**参考用户输入（若不为空）。`$ARGUMENTS` 须包含：

- **挑战目标**（必填）：`spec` / `plan` / `design`
- **可选范围限定**：Feature 标识（如 `FEAT-001`）或 EPIC 标识（如 `EPIC-002`）
- **可选侧重**：如 `仅安全` / `仅 NFR` / `仅架构`

示例：`/aisdd.challenge spec`、`/aisdd.challenge plan FEAT-001`、`/aisdd.challenge design 仅安全`

若 `$ARGUMENTS` 为空或未包含有效挑战目标，**立即终止**并提示：

```
用法：/aisdd.challenge <目标>
  目标：spec | plan | design
示例：/aisdd.challenge spec
```

## 目标

在进入下一阶段前，以**三个独立对抗角色**对目标文档进行质量挑战，发现单视角生成时的盲区：遗漏场景、可行性风险、范围蔓延、架构反模式等问题。

输出结构化挑战报告（不写入文件），供人类评审后决定是否触发 `/aisdd.cr`。

**与 `/aisdd.analyze` 的区别**：
- `/aisdd.analyze`：一致性检查（spec↔plan↔tasks 映射完整性）
- `/aisdd.challenge`：对抗性挑战（从不同角色视角主动找漏洞、风险、可行性问题）

**可选性说明**：
- 单 Feature EPIC（≤3 人天）：可跳过
- 多 Feature EPIC：**强烈推荐**（尤其 spec 和 plan 阶段）
- CR 变更后：**必须运行**（变更影响面不确定性高）

## 操作约束

**严格只读**：不修改任何文件，仅输出挑战报告。

**章程权威性**：`.specify/memory/constitution.md` 在分析范围内**不可协商**，违规自动升级为 BLOCK。

## 三角色挑战矩阵

根据 `$ARGUMENTS` 中的挑战目标，激活对应的三个挑战角色。若用户指定了侧重（如 `仅安全`），可仅激活对应角色，但须在报告中说明"仅执行部分角色"。

### 挑战目标：`spec`

| 角色 | 挑战视角 | 重点检测项 |
|------|----------|-----------|
| **需求完整性审计者** | "有哪些场景没有被覆盖？" | 边界场景、异常流程（失败路径）、角色权限边界、数据状态转换遗漏、并发竞态、AC 不可验证 |
| **NFR 可行性质疑者** | "这些指标真的能做到吗？" | NFR 是否可量化测量、Android 8.0+ 上是否可达、NFR 之间是否冲突（如高性能 vs 省电）、缺失测量基准或测量方法 |
| **范围与依赖哨兵** | "这里是否超出了 EPIC 目标？" | 范围蔓延（超出 epic.md 声明边界）、隐性外部依赖（系统权限/硬件/第三方服务）、未声明的技术假设、与其他 Feature 的隐性耦合 |

### 挑战目标：`plan`

| 角色 | 挑战视角 | 重点检测项 |
|------|----------|-----------|
| **架构风险评审者** | "这个设计会不会出问题？" | SOLID 原则违规、Android UI/Domain/Data 分层违规、Hilt DI 反模式（循环依赖/过度注入）、Room/协程/Compose 反模式、模块间循环依赖 |
| **技术债务评估者** | "我们在给未来挖坑吗？" | 过度工程化（YAGNI 违规）、临时取��方案（无说明理由）、硬编码假设（URL/阈值/配置）、可扩展性盲区（无法支持未来合理需求） |
| **可测试性与可观测性审查者** | "这个方案能被验证和监控吗？" | 核心逻辑是否可单元测试（依赖注入、接口抽象）、是否存在无法替换的具体依赖、日志/埋点/错误上报覆盖盲区、关键业务路径是否可观测 |

### 挑战目标：`design`

| 角色 | 挑战视角 | 重点检测项 |
|------|----------|-----------|
| **安全评审者** | "这里有安全漏洞吗？" | 数据存储安全（Room/SharedPreferences/文件 敏感字段）、网络传输安全（证书/加密）、Android 权限最小化、ContentProvider/Intent/WebView 安全风险、用户隐私合规 |
| **性能建模者** | "NFR 目标真的能达到吗？" | 主线程阻塞风险（IO/网络/数据库调用路径）、内存分配模式（泄漏根因、抖动热点）、Compose 重组风险（unstable 类型/不必要重组）、关键路径耗时估算与 NFR 目标对照 |
| **Android 生态兼容性审查者** | "在 API 24~35 上都能跑吗？" | API level 兼容性（`@RequiresApi` 漏标、废弃 API 使用）、Jetpack 库版本兼容约束、厂商 ROM 差异风险（厂商定制行为）、目标 SDK 35 行为变更影响（如 Photo Picker 强制要求等） |

## 执行步骤

### 1. 解析挑战目标与 EPIC 上下文

从 `$ARGUMENTS` 解析：挑战目标（`spec`/`plan`/`design`）、可选 Feature/EPIC 标识、可选侧重。

定位 EPIC 路径：

```powershell
.specify/scripts/powershell/get-epic-paths.ps1 -EpicId "EPIC-xxx" -Json
```

（若 `$ARGUMENTS` 含 EPIC 标识则直接使用；否则通过 `SPECIFY_EPIC` 环境变量或当前上下文推导。）

### 2. 加载挑战目标文档

根据挑战目标，加载对应文档：

**`spec` 模式** — 加载：
- 各 Feature `spec.md`（FR / NFR / AC / 边界场景 / 核心实体）
- `epic.md`（EPIC 范围声明、Feature 拆分边界）
- `.specify/memory/constitution.md`

**`plan` 模式** — 加载：
- `epic-plan.md`（若存在；EPIC 技术规约与 NFR 预算框架）
- 各 Feature `plan.md`（轻量技术规约、能力边界、数据/NFR/安全硬约束、Design 输入清单）
- 各 Feature `spec.md`（作为 plan 的需求基线对照）
- `.specify/memory/constitution.md`

**`design` 模式** — 加载：
- `epic-design.md`（0/1 层架构、全景类图、关键时序、Story 拆解）
- 各 Feature `l2_design/ST-xxx_*.md`（L2 详细设计，若存在）
- `epic-plan.md`（作为 NFR 基线对照）
- `.specify/memory/constitution.md`

若必要文件缺失，终止并提示：「请先运行 `/aisdd.[featurespec|featureplan|epicdesign]` 生成目标文档后再执行挑战。」

### 3. 三角色对抗分析

**执行要求**：以三种独立视角分别执行分析，每个角色独立工作，不受其他角色结论影响，模拟独立评审。

> 若平台支持，可使用 Agent 工具并行启动三个子 Agent，各自执行对应角色分析后返回结构化发现列表，以缩短分析耗时。

**每个角色的分析约束**：
- **至少尝试找出 3 条有实质内容的问题**（若真的无问题，须给出"未发现"的具体理由，而非直接跳过）
- **问题须具体可查**：指向具体文档章节/需求 ID/类名/方法名，禁止泛化描述
- **BLOCK 须论证**：须说明"为什么这会导致方案在实现阶段确定性失败"，不允许将主观偏好标注为 BLOCK
- **章程违规自动 BLOCK**：任何违反 `.specify/memory/constitution.md` MUST 条款的发现直接升级为 BLOCK

每个角色的原始输出格式（内部使用，不直接输出）：

```
角色：[角色名]
[角色简写][序号]：[BLOCK|WARN|NOTE] | 位置：[文档:章节] | 问题：[具体描述] | 建议：[最小修复方案]
```

### 4. 合并、去重与排序

将三个角色的发现进行：

1. **去重**：同一实质问题被多角色发现时，保留最高级别，合并为一条，标注"多角色共同发现"
2. **排序**：BLOCK > WARN > NOTE，同级别按影响范围排序
3. **ID 分配**：格式 `CH-[目标首字母][序号]`，如 `CH-S1`（spec）、`CH-P3`（plan）、`CH-D2`（design）

**严重程度定义**：

| 级别 | 判定标准 |
|------|---------|
| **BLOCK** | 若不修复，方案在实现阶段将遭遇确定性失败、安全漏洞、架构崩溃，或违反 constitution MUST 条款 |
| **WARN** | 存在较高风险，建议进入下一阶段前修复；若跳过须人工确认风险自担 |
| **NOTE** | 改进建议，不影响进入下一阶段，可记录为已知优化项或纳入后续迭代 |

### 5. 生成挑战报告

输出 Markdown 格式报告（**不写入文件**）：

```markdown
## /aisdd.challenge [目标] 挑战报告

**EPIC**：EPIC-xxx - [名称]
**挑战目标**：spec / plan / design
**挑战日期**：YYYY-MM-DD
**文档版本**：[各目标文档版本号，如 spec v1.2 / plan v0.8]
**激活角色**：[角色A] | [角色B] | [角色C]（或「仅 [角色名]」）

---

### 挑战发现汇总

| ID | 角色 | 级别 | 位置（文档:章节） | 问题描述 | 建议 |
|----|------|------|-----------------|---------|------|
| CH-S1 | 需求完整性审计者 | BLOCK | spec.md:§FR-004 | 未定义用户登录失效后的数据恢复场景 | 补充异常流程 AC，覆盖 Token 过期时本地缓存处理 |
| CH-S2 | NFR 可行性质疑者 | WARN | spec.md:§NFR-02 | "响应时间 < 200ms" 未定义测量环境（网络条件/设备规格） | 增加测量基准：Wi-Fi / 中端设备（4GB RAM）下 P95 |
| CH-S3 | 范围与依赖哨兵 | NOTE | spec.md:§FR-007 | 该需求隐含需要 WRITE_EXTERNAL_STORAGE 权限，在 API 29+ 已废弃 | 明确声明使用 MediaStore API，并在 NFR 中注明 API 29+ 兼容要求 |

---

### BLOCK 级问题明细

（仅展开 BLOCK 级问题，每条包含：失败场景描述、影响范围、最小修复方案）

**CH-S1 - 未定义用户登录失效后的数据恢复场景**

- **失败场景**：用户 Token 在后台静默过期，应用重启后无法区分「正常未登录」与「会话丢失」，导致本地缓存数据处理逻辑歧义，实现阶段必然出现分歧
- **影响范围**：FEAT-001 的登录模块 + FEAT-002 的数据同步模块（至少 2 个 Feature 受影响）
- **最小修复方案**：在 spec.md §异常场景 下新增「Token 失效场景」AC，明确：本地缓存保留策略、用户提示行为、自动重试逻辑

---

### 挑战统计

- 总发现数：X（BLOCK: X | WARN: X | NOTE: X）
- 多角色共同发现：X 条
- 涉及文档：spec.md / plan.md / epic-design.md（列出实际涉及文件）

---

### 综合评级

| 评级 | 条件 |
|------|------|
| ✅ 可进入下一阶段 | 0 BLOCK，WARN ≤ 3 |
| ⚠️ 建议修复后进入下一阶段 | 0 BLOCK，WARN > 3 |
| ❌ 存在阻塞问题 | BLOCK ≥ 1 |

**本次评级**：[✅ / ⚠️ / ❌] — [一句话说明原因]

---

### 后续建议

- **若存在 BLOCK**：运行 `/aisdd.cr` 发起变更请求修复后，可重新运行 `/aisdd.challenge [目标]` 验证
- **若存在 WARN**：评估风险后选择修复（`/aisdd.cr`）或记录「已知风险，人工确认自担」后继续
- **NOTE 问题**：可作为技术债务记录，纳入后续迭代
- **进入下一阶段**：评级 ✅ 或 ⚠️（人工确认后）→ spec 后 `/aisdd.epicplan` 或 `/aisdd.epicuidesign`；plan 后 `/aisdd.epicdesign`；design 后 `/aisdd.featuretasks`
```

### 6. 提供整改建议

向用户询问：「是否需要我为排名前 N 的 BLOCK/WARN 问题提供具体的整改建议？」（**不自动执行**整改。）

## 操作原则

- **禁止修改任何文件**（严格只读）
- **问题须具体可查**：每条发现须指向具体文档章节/需求 ID/类名，禁止泛化描述（如"存在潜在风险"这类无定位的表述）
- **三角色独立性**：每个角色分析时不参考其他角色的已有结论，确保视角独立
- **BLOCK 须论证**：BLOCK 级须说明确定性失败场景，不允许将主观偏好标注为 BLOCK
- **章程违规自动 BLOCK**：任何违反 constitution MUST 条款的发现直接升级为 BLOCK
- **禁止无发现敷衍**：若某角色真的无发现，须给出具体理由（"已检查 §FR-001~FR-012，所有 AC 均包含可量化验收标准"）

## 与现有命令的关系

| 命令 | 职责 | 适用阶段 | 性质 |
|------|------|----------|------|
| `/aisdd.challenge spec` | 对抗性挑战 spec 漏洞、NFR 可行性、范围边界 | `featurespec` 完成后，进入 `epicplan` 前 | **可选（多 Feature 推荐）** |
| `/aisdd.challenge plan` | 对抗性挑战架构风险、技术债务、可测试性 | `featureplan/epicplan` 完成后，进入 `epicdesign` 前 | **可选（多 Feature 推荐）** |
| `/aisdd.challenge design` | 对抗性挑战安全、性能可达性、生态兼容性 | `epicdesign` 完成后，进入 `featuretasks` 前 | **可选（多 Feature 推荐）** |
| `/aisdd.analyze` | 一致性检查（spec↔plan↔tasks 映射） | `featuretasks` 后，进入 `implement` 前 | 已有 |
| `/aisdd.epicanalyze` | EPIC 跨 Feature 一致性分析 | `epicdesign` 后，进入 `featuretasks` 前 | 已有 |
| `/aisdd.cr` | 变更请求（修复 challenge 发现的 BLOCK/WARN） | challenge 后发现问题时 | 已有 |

**建议执行顺序**（多 Feature EPIC）：

```
/aisdd.featurespec × N  →  /aisdd.challenge spec  →  /aisdd.epicplan / epicuidesign
/aisdd.featureplan × N  →  /aisdd.challenge plan  →  /aisdd.epicanalyze  →  /aisdd.epicdesign
/aisdd.epicdesign       →  /aisdd.challenge design  →  /aisdd.epicanalyze  →  /aisdd.featuretasks
/aisdd.featuretasks × N →  /aisdd.analyze × N     →  /aisdd.implement
/aisdd.implement        →  /aisdd.verify           →  合并/发布
```
