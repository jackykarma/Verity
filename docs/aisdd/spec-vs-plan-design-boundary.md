# spec.md 与 plan.md / epic-design.md 的边界说明（spec 纯净度治理）

> **定位**：说明 AISDD 工作流中 **Feature 产品规格**（`spec.md`）与 **Feature 技术规约**（`plan.md`）/ **EPIC 软件设计说明书**（`epic-design.md` 及其子文件）的职责划分、技术污染识别、守护机制与实操判断方法，治理 spec.md「被回写技术细节」这一常见污染问题。
>
> **与姊妹文档的关系**：
>
> - `docs/aisdd/spec-vs-ux-design-boundary.md` 治理 spec.md ↔ ux-design.md 的边界（"系统必须做什么" vs "用户如何感知与操作"）
> - 本文档治理 spec.md ↔ plan.md / epic-design.md 的边界（"系统必须做什么" vs "怎么实现"）
>
> 二者**互补不重叠**；同时遵守可达到 spec.md 的完整纯净度治理。
>
> **相关文档**：`.specify/memory/constitution.md`（文档事实源治理）、`.specify/templates/spec-template.md`（含纯净度约束）、`.specify/templates/change-request-template.md`、`docs/aisdd/workflow-overview.md`

---

## 一、章程中的事实源归属

`.specify/memory/constitution.md` §七 约定：

| 文档 | 事实源角色 | 主要内容 | 禁触领域 |
|------|------------|----------|----------|
| `spec.md` | **需求事实源** | 范围（In/Out）、FR、NFR（量化指标）、AC、完整场景矩阵、依赖关系 | **任何技术实现细节** |
| `plan.md` | **Feature 轻量技术规约事实源** | 增量约束、能力边界、外部依赖、数据/NFR/安全硬约束 | 详细设计（架构图、类图、时序、表字段、接口签名） |
| `epic-design.md` 及子文件 | **架构与详细设计事实源** | 0/1 层架构、关键设计（KD）、接口设计、数据库设计、埋点设计、Story 拆解、L2 详细设计 | — |

**一句话总结**：

- **`spec.md`** 描述「**系统必须做什么 + 达到什么可验收结果**」（业务契约）
- **`plan.md`** 描述「在哪个技术框架内做、有什么硬约束、能力边界在哪里」（约束契约）
- **`epic-design.md`** 描述「**具体怎么做**——类、接口、时序、字段、流程」（实现契约）

---

## 二、技术污染识别清单（spec.md 必拦截）

写入 spec.md 时，逐条扫描下表，命中即视为污染：

| 污染类别 | 识别特征（关键词 / 模式） | 正确归属 | 反例 → 正例 |
|----------|---------------------------|----------|-------------|
| **类名 / 接口名** | PascalCase 带技术后缀：`*ViewModel` / `*Repository` / `*UseCase` / `*Manager` / `*Service` / `*DataSource` / `*Mapper` / `*Provider` / `*Helper` / `*Controller` / `*Presenter` / `*Interactor` | `plan.md §三 能力边界` / `epic-design.md` 类图 | ❌「`PhotoRepository` 须提供 `loadRecent(limit: Int)` 接口」→ ✅「系统须支持按数量批量加载最近照片」 |
| **框架 / 库名** | Hilt / Dagger / Room / Compose / Coroutines / Flow / LiveData / Retrofit / OkHttp / WorkManager / Glide / Coil / RxJava / Moshi / Gson / Kotlinx.serialization 等明确库/框架命名 | `epic-plan.md §技术栈` / `plan.md §二` | ❌「使用 Room 缓存最近 100 张照片」→ ✅「系统须本地缓存最近 100 张照片，支持离线浏览，缓存命中率 ≥ 95%」 |
| **数据存储细节** | Room / DAO / Entity / 表名 / 字段名 / 字段类型 / SQL 语句 / 索引 / 主键 / 外键 / 触发器 | `database-design.md` | ❌「`photos` 表新增 `cache_expire_at` 字段（INTEGER NOT NULL）」→ ✅「系统须为每张缓存照片记录过期时间，过期后自动清理」 |
| **API / 接口细节** | URL 路径（`/v1/...`、`/api/...`） / HTTP 方法 / 状态码 / Header / DTO 字段 / 请求体 schema | `interface-design.md` | ❌「调用 `POST /v1/photos/sync` 同步相册，返回 200/409」→ ✅「系统须支持云端相册同步，冲突时以最近修改时间为准」 |
| **代码结构** | 包路径（`com.xxx.yyy`） / 文件路径（`*.kt`/`*.java`） / Gradle 模块名 / 代码片段 / 函数签名 | `epic-design.md §一～§六` | ❌「在 `:feature:gallery:domain` 模块新增 `GalleryUseCase`」→ ✅「相册查询能力须作为独立 Feature 提供」 |
| **线程 / 并发原语** | `Dispatchers.IO/Main/Default` / `viewModelScope` / `launch` / `withContext` / `Mutex` / `Semaphore` / `synchronized` / `volatile` | `plan.md §二` / `epic-design.md` | ❌「图片解码须在 `Dispatchers.IO` 执行」→ ✅「图片解码不得阻塞 UI 线程，p95 ≤ 50ms」（写为 NFR） |
| **设计模式实现** | "用单例 / 观察者 / 策略 / 工厂模式实现……"且语义在代码层而非业务层 | `epic-design.md` | ❌「使用观察者模式实现相册变更通知」→ ✅「相册变更须实时通知所有订阅方（如 UI、备份模块）」 |
| **埋点字段** | 事件名（如 `click_gallery_btn`） / 参数 key / SDK 名（Firebase / 友盟 / 神策 / Mixpanel） | `analytics-tracking.md` | ❌「点击保存触发 `click_save_btn`（Firebase）」→ ✅「系统须记录用户保存操作以支撑用量分析」（埋点事件名归 analytics-tracking） |

---

## 三、判断分界点（核心法则）

不确定一条内容能否留在 spec.md 时，**逐项自问**：

| # | 问题 | 若结论为 | 行动 |
|---|------|----------|------|
| 1 | 删掉这条后，「系统必须做什么 + 在什么前提下 + 达到什么可验收结果」是否仍完整？ | 仍完整 | 这是技术细节，从 spec.md 删除 |
| 2 | 上条结论为「不完整」时，是否能改写为只含业务语言的等价表述？ | 能 | 改写后保留在 spec.md |
| 3 | 改写后是否仍包含框架/库/类名/接口/表名/SQL/API 路径/代码/包路径/线程原语/埋点字段？ | 是 | 继续改写，剥离技术词汇 |
| 4 | 是否在描述「业务能力 / 业务规则 / 业务边界 / 可量化指标」？ | 是 | 是合法的 spec.md 内容 |
| 5 | 是否在描述「技术实现选型 / 类结构 / 函数签名 / 数据模型 / 接口契约」？ | 是 | 归 `plan.md` / `epic-design.md` / 其子文件 |

### 三方判断速记

| 维度 | 核心问题 | 归属 | 示例 |
|------|----------|------|------|
| **What & Why & 量化阈值** | 系统**必须**产生什么结果？要达到什么可测指标？ | `spec.md` | 「批量删除操作 5s 内完成」 |
| **How constrained & 边界** | 在哪个技术约束下做？能力边界与外部依赖在哪？ | `plan.md` | 「批量删除依赖 FEAT-010 的相册基础能力；并发上限 16 张」 |
| **How implemented & 详细设计** | 类、接口、时序、字段、流程**具体**怎样？ | `epic-design.md` 与子文件 | 「`GalleryBulkDeleteService` 接收 `List<PhotoId>`，调用 `PhotoDao.deleteByIds` 批量删除」 |

---

## 四、NFR 的特殊处理

NFR（非功能需求）是 spec.md 中**最易被技术细节"污染搭车"**的章节，需特别注意：

| 写法 | 合法性 | 解释 |
|------|--------|------|
| `NFR-PERF-001：前台启动 p95 ≤ 1.2s` | ✅ 合法 | 纯量化指标 |
| `NFR-MEM-001：相册浏览峰值内存增量 ≤ 200MB` | ✅ 合法 | 纯量化指标 + 业务边界 |
| `NFR-POWER-001：Top5% 用户单日新增 ≤ 5mAh（上限：单日触发 200 次、单次任务 ≤ 30s）` | ✅ 合法 | 量化 + 触发条件（业务语义） |
| `NFR-PERF-002：图片解码须在 Dispatchers.IO 执行` | ❌ 污染 | 出现线程原语，归 `plan.md` |
| `NFR-PERF-003：使用 WorkManager 调度后台同步以达成功耗目标` | ❌ 污染 | 出现框架名，归 `plan.md` 或 `epic-design.md` |
| `NFR-OBS-001：关键链路打点须发往 Firebase Analytics` | ❌ 污染 | 出现 SDK 名，归 `analytics-tracking.md`；spec.md 应写「关键链路须可观测，覆盖率 ≥ 90%」 |

**判断要点**：NFR 应只描述「**结果性指标 + 业务触发条件**」，不写「用什么实现」。

---

## 五、CR 变更时的边界守护

`/aisdd.cr` 命令对 `spec.md` 的修改受**严格限制**（详见 `aisdd.cr.md` 步骤 7 与 `change-request-template.md` §4）：

| CR 类型 | 是否可改 spec.md | 可改字段 | 禁触红线 |
|---------|------------------|----------|----------|
| **需求类** | ✅ 可改 | FR / NFR（量化） / AC / 范围（In/Out） / 完整场景矩阵 / 依赖关系 | 任何技术实现细节 |
| **技术方案类** | 🚫 默认不改 | **唯一例外**：NFR 指标本身的数值/口径调整（如从 `p95 ≤ 200ms` 放宽到 `p95 ≤ 500ms`） | 不得粘贴实现方案、库选型、类名、接口签名等 |
| **混合类** | ⚠️ 需预先标注 | 必须在 CR 文件 §3.1 影响范围中**显式标注** spec.md 的修改范围；未标注的字段不得擅自改动 | 同上 |

`/aisdd.cr` 在写入 spec.md 前会执行**纯净度自检**（扫描技术污染清单），命中即按 block_ask 流程拦截，让用户在「改写 / 移出 / 保留并说明 / 拆分」之间四选一。

---

## 六、工作流中的边界守护机制

### 6.1 写入侧守护（拦截污染进入 spec.md）

| 命令 / 文件 | 守护规则位置 | 触发时机 |
|------------|--------------|----------|
| `aisdd.featurespec.md` | 「spec / 技术细节边界守护」节（§通用指南） | 单 Feature 模式写入 spec.md 时 |
| `aisdd.featurespec.md`（`--batch`） | §B-3 子 Agent「写入前纯净度自检」+ §B-4「技术污染」BLOCK 检查 | 批量并行写入各 Feature spec.md 时 |
| `aisdd.epicspec.md` | 「epic.md 纯净度边界守护」节（§通用指南） | 写入 epic.md 与 Feature 拆分条目时 |
| `aisdd.clarify.md` | 步骤 5「写入前纯净度自检」+ 步骤 6 验证 | 整合澄清答案至 spec.md 时 |
| `aisdd.cr.md` | 步骤 7「写 spec 前的纯净度自检」+ 核心规则「spec 纯净度守护」 | CR 流程中写入 spec.md 时 |
| `epic-template.md` | 顶部「epic.md 纯净度约束」 | 撰写/编辑 epic.md 时 |
| `spec-template.md` | 顶部「spec.md 纯净度约束」+ 三处易污染章节防污注释 | 文档撰写者参考 |
| `change-request-template.md` | §4 下游更新清单「spec.md 禁触红线」 | CR 评审与执行时 |

### 6.2 读取侧守护（防止下游命令反写 spec.md）

| 命令 | 红线位置 | 红线内容 |
|------|----------|----------|
| `aisdd.featureplan.md` | 核心规则「spec 单向消费」 | 单 Feature 模式：plan 仅只读消费 spec；发现缺口须停下并走 CR/clarify |
| `aisdd.featureplan.md`（`--batch`） | §B-3 子 Agent「spec 单向消费（禁写红线）」 | 批量生成 plan 时禁止子 Agent 回写 spec |
| `aisdd.epicuidesign.md` | 「核心规则」「spec 单向消费」 | ux-design 仅只读消费 spec/epic；遗漏登记在 ux-design「遗漏与待确认」，改 spec 走 CR/clarify |
| `aisdd.epicdesign.md` | §4「各阶段通用禁令」+ 核心规则「spec / plan 单向消费」 | design 各阶段仅只读消费 spec/plan；Story 拆解不得反写 spec |
| `aisdd.featuretasks.md` | 步骤 3「只写执行事实源」 | tasks 只创建/更新 tasks.md，不回填 spec.md 追溯表 |
| `aisdd.implement.md` | 步骤 2「强制约束」 | implement 不得改写 spec.md 的 FR/NFR/AC |

### 6.3 拦截后的标准提示格式（block_ask）

```
⚠️ 边界检查：以下内容疑似属于 plan.md / epic-design.md 而非 spec.md：

1. [具体条目，原文引用] → 命中类别：[类名/框架/数据存储/...] → 建议归入 [plan.md §x / epic-design.md §y / database-design.md / interface-design.md / analytics-tracking.md]
2. [具体条目，原文引用] → 命中类别：... → 建议归入 ...

请确认：
(a) 改写为业务语言后留在 spec.md（推荐——保留业务意图，剥离技术词汇）
(b) 移出 spec.md，记入待写清单交由 plan / epic-design 处理（推荐，若该信息属于技术决策）
(c) 确认保留原文（需说明理由——例如该术语已成为业务固定称呼）
(d) 拆分：业务部分留 spec，技术部分移入下游
```

---

## 七、典型场景示例

### 场景 1：从「实现」反推「需求」

**糟糕的 spec 条目**：

> FR-007：系统须使用 Room 数据库的 `photos` 表存储照片元数据，并通过 `PhotoDao.observeAll()` 暴露 `Flow<List<PhotoEntity>>` 供 UI 订阅。

**问题诊断**：含 Room（框架）、表名、DAO 类名、方法签名、返回类型——全是技术决策。

**改写为合法 spec**：

> FR-007：系统须持久化照片元数据并支持以响应式方式订阅变更，新增/删除照片时所有订阅方须在 100ms 内收到通知。

技术决策（用 Room、DAO 命名、`Flow` 等）归 `plan.md §三 能力边界` 与 `database-design.md`。

### 场景 2：NFR 中的"实现搭车"

**糟糕的 NFR**：

> NFR-PERF-001：相册首屏 p95 ≤ 500ms；通过 Coil 异步加载缩略图 + LRU 内存缓存 + Glide 磁盘缓存策略实现。

**问题诊断**：指标本身合法，但"通过 Coil + LRU + Glide"是实现方案，是污染。

**改写为合法 NFR + plan 约束**：

- spec NFR-PERF-001：`相册首屏 p95 ≤ 500ms（前提：相册照片数 ≤ 10000，设备性能在中端机水平）`
- plan §二 增量约束：`图片加载采用 Coil（已有依赖）；磁盘缓存上限 500MB，淘汰策略 LRU`

### 场景 3：CR 技术方案变更被错误回写

**错误流程**：

```
用户：「把相册同步改用 WebSocket 推送，原 HTTP 轮询取消」
AI 走 /aisdd.cr → 技术方案类
错误：在 spec.md FR-012 中追加「采用 WebSocket 实现实时推送」
```

**正确流程**：

- spec.md FR-012 保持不变（业务描述：「相册变更须实时同步至云端，时延 ≤ 2s」）
- spec.md NFR-PERF-005 可调整：「相册同步时延：p95 ≤ 2s（原 ≤ 30s）」（仅指标）
- plan.md §三 能力边界：「同步通道从 HTTP 轮询调整为长连接推送」
- `interface-design.md` 更新协议契约
- `epic-design.md` 更新时序图

CR 文件 §3.1 影响范围必须**预先标注**：「spec.md：仅 NFR-PERF-005 数值调整；plan.md / interface-design.md / epic-design.md：全面更新」。

---

## 八、速记公式

| 文档 | 概括 |
|------|------|
| **`spec.md`** | **What + When + 量化指标 + 业务约束**——在什么条件下，系统**必须**达成什么可验收结果。 |
| **`plan.md`** | **Constraints + Boundaries**——在什么技术框架与约束内做，能力边界与外部依赖。 |
| **`epic-design.md` 及子文件** | **How + 详细设计**——架构、类、接口、时序、流程、字段。 |

**对 spec.md 的一句话守护**：「**所有人都能读懂，删掉技术词汇仍然完整可验收**」——这是 spec.md 的纯净度试金石。

---

## 九、版本记录

| 版本 | 日期 | 变更摘要 |
|------|------|----------|
| v0.1.0 | 2026-05-22 | 初版：spec.md ↔ plan.md / epic-design.md 边界说明；8 类技术污染识别清单；CR 类型化守护；与 `spec-vs-ux-design-boundary.md` 互补 |
| v0.1.1 | 2026-05-22 | §6.1/§6.2 补全 batch/clarify/epicuidesign 守护；对齐 featurespec/featureplan/epicdesign/epicuidesign 命令与 `epic-template.md` 顶部约束 |
