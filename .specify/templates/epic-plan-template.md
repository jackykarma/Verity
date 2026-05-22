# 【已废弃】请使用 tech-spec-template.md

> 本模板已由 **`.specify/templates/tech-spec-template.md`** 取代。新 EPIC 请运行 `/aisdd.techspec`，产出 `tech-spec.md`，勿再创建 `epic-plan.md`。

---

# EPIC 技术规约（Epic Plan）：EPIC-[编号] - [EPIC 名称]

> **定位**：本文档只在**多 Feature 且存在跨 Feature 技术约束**时产出，用于冻结 EPIC 级公共规约。它不替代 Feature `plan.md`，也不承载详细设计。
>
> **写入范围**：全局技术栈锁定、跨 Feature 依赖方向、共享能力 Owner、统一错误/日志/安全原则、Feature plan 执行顺序。
>
> **NFR 量化评估**：性能/功耗/内存/安全/RomSize 等**不在本文件**做预算与分配，由 `/aisdd.epicdesign nfr` 产出 **`nfr.md`** 统一预估与验证（对照各 Feature `spec.md` 的 NFR 指标）。
>
> **接口与契约**：跨 Feature 版本策略、错误响应格式、方法签名与错误码等**不在本文件**定义，由 `/aisdd.epicdesign` 产出 **`interface-design.md`**（及 L2）承接。
>
> **禁止写入**：0/1 层架构图、组件清单、类图、时序图、流程图、接口方法签名、数据库表字段、Story 拆解、L2 设计、NFR 预算表。上述内容进入 `/aisdd.epicdesign` 及其子文件。
>
> **裁剪规则**：单 Feature EPIC 可省略本文件，将必要 EPIC 约束合并到唯一 Feature 的 `plan.md`；纯修复/≤3 人天小改动可跳过本文件。
>
> **输入**：`epic.md`、各 `features/*/spec.md`、现有工程代码、`.specify/memory/constitution.md`

**Epic**：EPIC-[编号] - [名称]
**Epic Version**：v0.1.0（来自 `epic.md`）
**epic-plan Version**：v0.1.0
**创建/更新日期**：[YYYY-MM-DD]

---

## 一、EPIC 级公共约束

> 只记录会影响多个 Feature 或实现期不能擅改的公共约束。若与 constitution 或现有工程一致，写“沿用现有工程默认规则”即可。

| 维度 | 约束 |
|------|------|
| **Language/Version** | [例如：Kotlin 2.x / Java 17] |
| **UI 框架** | [例如：Jetpack Compose] |
| **构建系统** | [例如：Gradle Kotlin DSL] |
| **最低/目标 API** | [例如：API 24 / API 35] |
| **依赖注入** | [例如：Hilt] |
| **测试框架** | [例如：JUnit、Robolectric] |
| **Target Platform** | [例如：Android 8+] |

**其他工程约束**：[例如：单模块/多模块、源码目录约定；无增量则写“沿用现有工程默认规则”]

---

## 二、跨 Feature 边界与依赖规则

> 只定义边界原则和依赖方向，不画架构图，不列组件清单。具体 0/1 层架构见 EPIC 软件设计说明书。

- **分层原则**：[表示层 / 领域层 / 数据层 或项目实际分层；无增量则写“沿用现有工程默认规则”]
- **依赖方向**：[谁可依赖谁；禁止反向依赖]
- **Feature 边界**：[哪些能力归属哪个 Feature；哪些属于共享能力]
- **跨层/跨 Feature 禁止项**：[例如：UI 不得直接依赖 DataSource；Consumer 不得绕过 Owner 直接访问底层资源]

---

## 三、统一运行时约束

- **线程/协程**：[EPIC 级统一调度、取消、主线程约束；无增量则写 N/A]
- **错误处理**：[统一错误类型、传播规则、用户提示原则；无增量则写 N/A]
- **日志/可观测性**：[统一日志字段、采样、脱敏、指标口径；无增量则写 N/A]
- **权限/安全/合规**：[统一权限、敏感数据、合规约束；无增量则写 N/A]

## 四、数据与存储总约束

- **System of Record 原则**：[哪些数据以服务端/DB/文件为权威；无统一要求则 N/A]
- **缓存策略边界**：[允许缓存的范围、失效原则、一致性要求]
- **迁移/回滚原则**：[Room/File/DataStore 迁移红线；无则 N/A]
- **详细设计位置**：表结构、字段、索引、迁移步骤在 `database-design.md` 中设计。

---

## 五、跨 Feature 共享能力识别

> 与 `epic.md`「跨 Feature 技术策略」对齐；后续 Feature plan 必须复用 Owner 设计，不得另起炉灶。

| 共享能力名称 | 类型 | Owner Feature | 消费方 Feature | plan 中记录什么 | 详细设计位置 |
|-------------|------|---------------|----------------|----------------|--------------|
| [例如：UI 基础框架] | Infrastructure | FEAT-001 | FEAT-002, FEAT-003 | 能力边界与约束 | `/aisdd.epicdesign` 后补链接 |
| [例如：统一错误处理] | Infrastructure | FEAT-001 | All | 统一错误原则 | `/aisdd.epicdesign` 后补链接 |

**Feature Plan 执行顺序**：[根据依赖关系，Owner 必须先完成 plan]

| 顺序 | Feature | 依赖（需先完成 plan 的 Feature） |
|------|---------|--------------------------------|
| 1 | FEAT-001 | 无 |
| 2 | FEAT-002 | FEAT-001 |
| 3 | FEAT-003 | FEAT-001, FEAT-002 |

---

## 六、Feature Plan 裁剪规则

> 用于指导后续各 Feature 的 `plan.md` 写到什么粒度，避免重复设计。

| Feature | plan 填写档位 | 必填重点 | 可省略内容 |
|---------|---------------|----------|------------|
| FEAT-001 | Lite / Standard | [例如：外部依赖、数据 SoR、NFR 增量] | [例如：无对外能力则省略能力表] |
| FEAT-002 | Lite / Standard | [待填写] | [待填写] |

---

## 与「跨 Feature 技术策略」的对应

| epic-plan 章节 | epic.md「跨 Feature 技术策略」对应项 |
|----------------|--------------------------------------|
| 一～四 | 技术约束 |
| 五 | 共享能力识别、Feature Plan 执行顺序 |
| 六 | Feature plan 裁剪策略 |

> 若 epic.md 该节尚为占位，可根据本 epic-plan 输出建议其内容；后续变更须双向同步。

---

## 变更记录（增量变更）

| 版本 | 日期 | 变更范围 | 变更摘要 | 影响 Feature / plan |
|------|------|----------|----------|---------------------|
| v0.1.0 | [YYYY-MM-DD] | 初始 | 初版 | — |
