---
description: "前置技术调研：在 EPIC 规格或 Feature 方案制定前，对技术可行性、Android 平台 API、第三方库、存量代码结构进行结构化调研，输出调研报告与下游文档的输入建议。减少 spec/plan 阶段的技术假设与不确定性。"
handoffs:
  - label: 进入 EPIC 规格说明
    agent: aisdd.epicspec
    prompt: 调研完成，基于调研结论填写 EPIC 规格说明（调研报告中的「输入建议」可直接参考）
    send: false
  - label: 进入 Feature 技术规约
    agent: aisdd.featureplan
    prompt: 调研完成，基于调研结论制定 Feature 技术规约（调研报告中的「推荐方案」可直接参考）
    send: false
  - label: 澄清剩余不确定项
    agent: aisdd.clarify
    prompt: 调研中发现需澄清的需求边界或技术假设，运行 /aisdd.clarify 进一步确认
    send: false
---

## 用户输入

```text
$ARGUMENTS
```

在继续操作前，你**必须**参考用户输入（若不为空）。

**参数解析（最先执行）**：

| 参数格式 | 研究类型 | 说明 |
|---------|----------|------|
| `platform <topic>` | **Android 平台 API** | 调研系统 API、权限、兼容性限制（如 `platform MediaStore`、`platform BLE`） |
| `library <name>` | **第三方库评估** | 功能覆盖、引入成本、版本兼容性（如 `library CameraX`、`library ExoPlayer`） |
| `pattern <topic>` | **架构/设计模式** | 在本工程 Kotlin/Compose/Hilt/Room 约束下的适用性（如 `pattern offline-first`） |
| `feasibility <requirement>` | **可行性分析** | 判断某需求在约束下是否可实现（如 `feasibility 后台实时录音`） |
| `codebase <topic>` | **存量代码考古** | 理解已有实现、识别复用点与技术债（如 `codebase 媒体播放模块`） |
| 自由文本 / 无参数 | **综合调研** | 自动判断研究维度，组合多个研究类型 |

**附加标志**：
- `--save`：将报告写入文件（`EPIC_DIR/research/<topic>-<YYYYMMDD>.md`，若 EPIC 上下文存在）
- `--parallel`：多个独立研究维度时，启动并行子 Agent（适合同时调研 2 个以上不相关主题）

示例：
- `/aisdd.research platform MediaStore API`
- `/aisdd.research feasibility 后台实时录音 --save`
- `/aisdd.research library CameraX library ExoPlayer --parallel`
- `/aisdd.research codebase 视频播放模块`

---

## 目标

在进入 `epicspec` / `featureplan` 前，通过结构化调研**消除技术不确定性**，为后续文档提供可靠的技术输入。

**调研的核心价值**：
- **减少 spec/plan 中的技术假设**：将「我们以为可以」变为「已验证可以」
- **提前识别可行性障碍**：在投入文档编写前发现 API 限制、权限壁垒、兼容性问题
- **发现存量代码复用机会**：遵循 constitution 演进式设计原则，先问「现有代码能否支撑」
- **规避架构风险**：在早期识别可能导致方案推翻的技术约束

**适用时机**：

| 场景 | 推荐运行时机 |
|------|------------|
| 涉及不熟悉的平台 API / 权限 | `epicspec` 之前 |
| 评估引入新第三方库 | `featureplan` 之前 |
| 需求技术可行性存疑 | `featurespec` 之前 |
| 改造已有模块 | `featureplan` 之前（codebase 类型） |
| 多个技术方案需对比 | `epicplan` 之前 |

---

## 操作约束

- **严格只读**：不修改任何代码或文档
- **事实优先**：每条发现须说明信息来源（Android 官方文档 / 代码文件路径 / 第三方文档）
- **与 constitution 对齐**：调研结论须在「演进式设计」原则下给出，不得以「调研发现」为由建议推翻现有架构
- **不替代 spec/plan**：调研报告是上游输入，不是 spec 或 plan 的替代品

---

## 执行步骤

### 1. 解析研究类型与范围

从 `$ARGUMENTS` 提取：
- 研究类型（platform / library / pattern / feasibility / codebase / 综合）
- 研究主题（关键词或描述）
- 附加标志（`--save`、`--parallel`）

若同时包含多个研究主题（如 `library CameraX library ExoPlayer`），拆分为独立研究任务列表。若含 `--parallel` 且任务数 ≥ 2，进入**并行研究模式**（见步骤 3P）。

### 2. 加载上下文

根据研究类型，加载相关上下文：

**通用加载（所有类型）**：
- `.specify/memory/constitution.md`（技术栈约束：Kotlin / Compose / Hilt / Room / API 24~35）
- 若 EPIC 上下文存在（`SPECIFY_EPIC` 环境变量或 `$ARGUMENTS` 含 EPIC 标识）：读取 `epic.md`（需求范围与 Feature 边界）

**按类型加载**：

| 研究类型 | 额外加载 |
|---------|---------|
| `platform` | — （主要依赖 WebSearch 与 AI 知识） |
| `library` | — （主要依赖 WebSearch 与 AI 知识） |
| `pattern` | 读取工程代码中相关模块目录（架构分层参考） |
| `feasibility` | 读取相关 `spec.md`（若存在）、权限清单 |
| `codebase` | **重点**：遍历相关模块代码文件，理解现有实现 |
| 综合 | 按涉及类型组合加载 |

### 3. 单研究主题执行

针对单个研究主题，按研究类型执行对应分析：

---

#### 3A. platform — Android 平台 API 调研

**调研维度**：

1. **API 可用性与版本范围**
   - 目标 API 在 Android 8.0（API 24）\~ Android 15（API 35）的可用性
   - 是否存在 `@RequiresApi` 限制；低 API 版本的兼容方案（如 `Build.VERSION.SDK_INT` 判断）
   - 是否在目标 SDK 35 存在行为变更（Android 15 breaking changes）

2. **权限模型**
   - 所需权限（`INTERNET`、`READ_MEDIA_IMAGES` 等）
   - 是否为危险权限（需运行时申请）；Android 10+/11+/13+ 权限变更影响
   - 是否涉及特殊权限（`MANAGE_EXTERNAL_STORAGE`、`SYSTEM_ALERT_WINDOW` 等）

3. **使用限制与后台行为**
   - 后台执行限制（Doze / App Standby / Background Execution Limits）
   - 是否需要前台 Service；通知要求
   - Battery optimization 影响

4. **替代 API 与 Jetpack 封装**
   - 是否有 Jetpack 库封装（如 CameraX vs Camera2、WorkManager vs JobScheduler）
   - 官方推荐方案是否与本工程技术栈兼容

5. **Android 15 / targetSdk 35 专项**
   - 是否受 Photo Picker 强制要求影响
   - 是否受 Edge-to-edge 强制影响
   - 其他目标 SDK 35 新行为

---

#### 3B. library — 第三方库评估

**调研维度**：

1. **功能覆盖**
   - 核心功能是否满足需求；边界能力（哪些不支持）
   - Kotlin / Compose 兼容性（是否有官方 Kotlin API；是否支持 Compose 集成）

2. **引入成本**
   - APK 体积增量（大致估算）
   - 传递依赖（是否引入不必要的大型依赖）
   - 与现有 Hilt / Room / Coroutines 的兼容性

3. **维护状态**
   - GitHub Stars / 最近 commit 活跃度（近 6 个月）
   - 是否由 Google / JetBrains 官方维护
   - 是否有已知严重 bug / 安全漏洞

4. **版本兼容性**
   - 最低 Android API 要求
   - 与工程当前 Gradle / AGP 版本兼容性

5. **替代方案对比**
   - 如有 2 个以上候选库，输出对比矩阵

---

#### 3C. pattern — 架构/设计模式调研

**调研维度**：

1. **模式适配性**
   - 该模式在 Kotlin / Jetpack Compose / MVVM / Hilt / Room 技术栈下的成熟实践
   - 与工程现有架构分层（UI / Domain / Data）的契合度

2. **存量代码适配**
   - 读取相关模块，判断当前代码与该模式的差距
   - 「演进路径」：以最小改动从现状迁移到该模式需要哪些步骤

3. **已知陷阱**
   - 该模式在 Android 生态中的常见反模式
   - 与 Compose 重组、配置变更（Configuration Change）的兼容注意点

---

#### 3D. feasibility — 可行性分析

**调研维度**：

1. **需求分解**
   - 将待验证需求拆分为独立的技术假设（每条假设可单独验证）

2. **逐假设验证**
   - 对每个技术假设，结合 platform / library / codebase 研究，给出：
     - ✅ 可行（有成熟 API / 实现方案）
     - ⚠️ 有条件可行（需特定权限 / 版本限制 / 额外工作量）
     - ❌ 不可行（API 限制 / 系统策略 / 无可用方案）

3. **整体可行性结论**
   - 综合评估：可直接实现 / 需调整需求边界 / 需放弃

4. **替代方案（若主方案不可行）**
   - 说明降级方案或需求裁剪建议

---

#### 3E. codebase — 存量代码考古

**调研维度**：

1. **模块定位**
   - 相关代码所在包/模块路径
   - 模块归属层（UI / Domain / Data）与职责

2. **现有能力评估**
   - 可**直接复用**：无需修改即可满足新需求
   - 需**扩展**：核心逻辑可用，但需增加参数/方法/配置
   - 需**适配**：现有实现可参考，但接口不兼容，需改造
   - 需**新建**：无相关实现，需从头构建

3. **技术债识别**
   - 相关模块是否存在已知技术债（硬编码 / 过时 API / 不规范实现）
   - 技术债是否影响本次需求的实现难度

4. **接口契约**
   - 现有模块对外暴露的接口（方法签名 / 数据模型）
   - 与新需求的接口兼容性

---

### 3P. 并行研究模式（`--parallel` 或多主题）

> **适用场景**：同时调研 2 个以上不相关主题（如同时评估两个候选库、同时调研平台 API + 存量代码）。

**优先使用 Agent 工具并行执行**：为每个研究主题启动独立子 Agent。

每个子 Agent 的任务描述模板：

```
你是专注于单一主题的技术调研 Agent，只做一件事：对指定主题进行深度调研并返回结构化发现。

研究类型：[platform / library / pattern / feasibility / codebase]
研究主题：[具体主题描述]
技术栈约束（只读，来自 constitution.md）：
  - 语言：Kotlin
  - UI：Jetpack Compose
  - 最低支持：Android 8.0（API 24）
  - 目标版本：Android 15（API 35）
  - 架构：UI/Domain/Data 分层；Hilt DI；Room

执行：按对应研究类型（3A/3B/3C/3D/3E）的调研维度逐项分析。

返回：
{
  topic: "研究主题",
  type: "platform|library|...",
  findings: [{ dimension, fact, source, confidence: "high|medium|low" }],
  risks: [{ description, severity: "high|medium|low", mitigation }],
  recommendation: "推荐方案与理由",
  downstream_inputs: { spec: [...], plan: [...] }
}
```

**降级方案**（若 Agent 工具不可用）：按主题顺序依次执行，每个主题完整执行 3A~3E 对应分析后继续下一个。

收集所有子 Agent 结果后，合并输出统一报告。

---

### 4. 生成调研报告

输出 Markdown 格式报告（若含 `--save` 则同时写入文件）：

```markdown
## 技术调研报告

**调研主题**：[主题名称]
**研究类型**：platform / library / pattern / feasibility / codebase（可多选）
**调研日期**：YYYY-MM-DD
**技术栈约束**：Kotlin / Compose / API 24~35 / Hilt / Room

---

### 调研摘要

[2~4 句话总结：核心发现、主要结论、对后续工作的影响]

---

### 详细发现

#### [研究类型 A]：[主题]

| 维度 | 发现 | 信息来源 | 置信度 |
|------|------|---------|--------|
| API 可用性 | MediaStore.Images.Media.getBitmap() 在 API 29 废弃，应使用 ImageDecoder | Android 官方文档 | 高 |
| 权限 | READ_MEDIA_IMAGES（API 33+）/ READ_EXTERNAL_STORAGE（API 32-） | Android 官方文档 | 高 |
| 后台限制 | 后台不可访问媒体文件，需前台 Service 或用户主动触发 | 实测 + 文档 | 中 |

（每个研究主题输出一个独立小节）

---

### 风险登记表

| ID | 风险描述 | 严重程度 | 消解方案 |
|----|---------|---------|---------|
| R-001 | MediaStore 在 API 29 以下行为不一致 | 中 | 按版本分支处理，低版本使用旧 API |
| R-002 | 后台录音被系统策略限制（Android 11+） | 高 | 改为前台 Service + 通���，或改变需求边界 |

---

### 存量代码复用评估（codebase 类型专属）

| 模块/文件 | 现有能力 | 复用评估 | 建议操作 |
|---------|---------|---------|---------|
| `media/MediaRepository.kt` | 读取本地图片列表 | 可扩展 | 增加视频文件类型过滤参数 |
| `player/VideoPlayer.kt` | 视频播放基础能力 | 可直接复用 | 无需改动 |
| `audio/AudioRecorder.kt` | 不存在 | 需新建 | 参考现有 Camera 模块的 Service 模式 |

---

### 推荐方案

**推荐**：[具体推荐，含理由]

**替代方案**（若主方案不可行）：[说明]

**否决方案**（若存在明显不可行项）：[说明否决理由]

---

### 未解决的不确定项

（需通过 `/aisdd.clarify` 或进一步调研解答）

| 序号 | 不确定问题 | 影响 | 建议下一步 |
|------|-----------|------|-----------|
| 1 | 用户设备中是否有超大媒体文件（> 500MB）需要处理？ | 影响流式读取方案选型 | 通过 /aisdd.clarify 向 PM 确认 |

---

### 下游文档输入建议

**→ spec.md 建议补充**：
- NFR-PERF-xxx：媒体文件读取响应时间需在 API 29+ / 28- 分别定义
- FR-xxx：需明确「后台权限」的用户感知范围（前台 Service 通知文案）

**→ plan.md 建议补充**：
- §三 架构约束：MediaStore 访问须在 Data 层，禁止 UI 层直接调用
- §五 接口契约：`MediaRepository.queryMedia(type, apiLevel)` 需处理版本分支
- §四 数据模型：`MediaFile` 实体须包含 `uri`（非 path），兼容 Scoped Storage

**→ epic-plan.md 建议补充**（若为 EPIC 级结论）：
- 跨 Feature 共享能力：MediaRepository 作为 Capability Feature，避免多 Feature 各自实现
```

---

### 5. 综合评级

```markdown
### 综合评级

| 评级 | 条件 |
|------|------|
| ✅ 可直接进入规格/方案阶段 | 无 ❌ 不可行项，H 级风险已有消解方案 |
| ⚠️ 需调整需求或方案后进入 | 存在 ⚠️ 有条件可行项，需确认降级方案 |
| ❌ 存在阻塞性技术障碍 | 存在 ❌ 不可行项且无替代方案 |

**本次评级**：[✅ / ⚠️ / ❌] — [一句话说明]
```

---

### 6. 完成报告

输出：
- 综合评级与关键发现摘要
- 建议下一步：
  - 若 ✅ → 直接进入 `/aisdd.epicspec` 或 `/aisdd.featureplan`（使用调研报告中的「下游文档输入建议」）
  - 若 ⚠️ → 先运行 `/aisdd.clarify` 解决不确定项后再进入规格阶段
  - 若 ❌ → 提示需调整需求边界（与 PM 对齐后再开始规格）
  - 若 `--save` → 提示报告已写入 `research/<topic>-<date>.md`；后续 `/aisdd.epicplan`、`/aisdd.featureplan`、`/aisdd.epicdesign` 会扫描 `research/` 目录作为参考性补充信息

---

## 调研原则

- **事实优先**：每条发现须标注信息来源（官方文档 / 代码文件 / 实测结论）；无来源的推测标注置信度为「低」
- **演进式视角**：codebase 类调研须先问「现有代码能否支撑」，再考虑新建
- **不替代设计**：调研报告是输入，不是设计方案；具体架构决策在 `plan.md` 中做
- **适度广度**：调研聚焦能影响 spec/plan 决策的关键问题，不追求穷举
- **时效性**：使用 WebSearch 时注意 Android API / 库版本的时效性；标注调研日期

---

## 与现有命令的关系

| 命令 | 职责 | 与 research 的关系 |
|------|------|------------------|
| `/aisdd.epicspec` | 填写 EPIC 规格说明 | research 是其可选前置（高不确定性时） |
| `/aisdd.featurespec` | 生成 Feature spec.md | research 为其提供 NFR / AC 的技术依据 |
| `/aisdd.epicplan` | 生成 epic-plan.md | **扫描** `EPIC_DIR/research/` 作为**参考性补充信息**（非约束源），辅助了解技术背景 |
| `/aisdd.featureplan` | 生成 Feature plan.md | **扫描** `EPIC_DIR/research/` 作为**参考性补充信息**（非约束源），辅助方案选型 |
| `/aisdd.epicdesign` | 生成 EPIC 设计说明书 | **扫描** `EPIC_DIR/research/` 作为**参考性补充信息**（非约束源），辅助设计决策 |
| `/aisdd.clarify` | 需求澄清 | research 发现的不确定项通过 clarify 解决 |
| `/aisdd.challenge` | 对抗性挑战 | challenge 在 spec/plan 完成后运行；research 在更早期 |
| `/aisdd.epicuidesign` | 设计稿解析 | 两者并行，不互相依赖 |
