# L2 Story 详细设计（二层详细设计）

本文档与 **EPIC 软件设计说明书**（`epic-design.md`）配套使用：`epic-design.md` 的 §6 为 L2 索引表，指向本文档中各 Story 的详细设计。本文档由 `/aisdd.epicdesign` 在各 Feature 目录下生成，是 `tasks.md` 和 `/aisdd.implement` 的**详细设计事实源**。

**使用方式**：置于 Feature 目录下（`specs/epics/EPIC-xxx/features/FEAT-xxx/story_detail_design.md`），便于 Feature 级独立评审。

**覆盖要求**：
- **Standard 深度**：各 Story 写入概要（需求/DoD + 简要功能设计说明）
- **Deep 深度**：所有 Story 必须补齐完整详细设计（类图/时序图/触发条件/系统响应），不得遗漏

---

## 文档约定

**覆盖要求**：
- 对每个 Story，必须同时覆盖：**需求描述**、**功能设计（类图/时序图/触发条件/系统响应）**。
- **禁止省略或引用**：所有内容须在本文档内完整书写，不得使用「见 A3」「同上」「参见 plan.md」等省略或引用方式。

**图表完整性**：
- **类图**：须为**完整详细**的类图，覆盖本 Story 涉及的全部关键类、接口与方法签名；**不得引用** plan.md 组件设计（A3）的类图。
- **时序图**：须为**完整详细**的时序图，覆盖正常流程与所有关键异常分支；**不得引用** plan.md 组件设计的时序图。
- 类图、时序图须基于本工程实际架构与真实代码，遵循 `.cursor/rules/specify-diagram-requirements.mdc`。

**引用约定**：
- tasks.md 的每个 Task 应明确引用对应 Story 的详细设计入口（例如：`story_detail_design.md:ST-001:功能设计:时序图`）。

---

### ST-001 Detailed Design：[标题]

#### 1) 需求及描述

- **需求描述**：[Story 做什么，为什么需要，关联的 FR/NFR]
- **需求依赖**：[依赖的其他 Story、外部模块、前置条件]
- **使用范围**：[哪些模块/页面会使用，影响范围]
- **使用接口**：[对外暴露的接口/方法签名]
- **DoD（验收标准）**：
  - [ ] [功能验收：引用 FR-xxx]
  - [ ] [NFR 验收：性能/功耗/内存阈值，引用 NFR-xxx]

#### 2) 功能设计

##### 功能设计关键说明

> **目的**：用精炼的文字说清楚该 Story 的实现核心与关键技术路径。
>
> **要求**：3-5 段精炼文字（每段 2-3 句话），覆盖：核心实现思路、关键技术选型、主要类职责、数据流向、失败处理策略。

**核心实现思路**：
- [一句话说明本 Story 的实现核心]
- [关键技术决策：为什么选择这个方案而非其他方案]

**关键类与职责划分**：
- [列出 2-4 个核心类，每个类一句话说明职责]
- [说明类之间的协作关系：谁依赖谁，为什么这样分层]

**失败处理与边界**：
- [关键错误场景的处理策略：重试/降级/提示]
- [资源释放与取消语义：协程取消时如何保证一致性]

##### 类图（完整详细，不可引用）

> **完整性**：须在本文档内绘制**完整详细**的类图，覆盖本 Story 涉及的全部关键类、接口与方法签名；**不得引用** plan.md 组件设计（A3）的类图。
> **真实代码**：基于本工程实际架构与真实代码，使用真实类名。遵循 `.cursor/rules/specify-diagram-requirements.mdc`。

```mermaid
%%{init: {'theme': 'base', 'themeVariables': { 'primaryColor': '#E3F2FD', 'primaryTextColor': '#1565C0', 'primaryBorderColor': '#1976D2', 'lineColor': '#546E7A'}}}%%
classDiagram
    direction TB
    
    class StoryComponent {
        +placeholder: String
        +execute() Unit
    }
```

**关键类职责说明**：

| 类/接口 | 核心职责 | 关键方法说明 |
|---|---|---|
| [类名] | [做什么] | [方法1]：用途；[方法2]：用途 |

##### 时序图（完整详细：正常+异常，不可引用）

> **完整性**：须在本文档内绘制**完整详细**的时序图，覆盖正常流程与**所有**关键异常分支；**不得引用** plan.md 组件设计的时序图。
> **覆盖要求**：从触发到响应的完整方法调用链，不得遗漏核心交互步骤；须使用 `alt/else` 明确区分正常与异常分支。
> **真实代码**：participant 使用本工程真实类名。遵循 `.cursor/rules/specify-diagram-requirements.mdc`。

```mermaid
%%{init: {'theme': 'base', 'themeVariables': { 'actorBkg': '#E3F2FD', 'actorBorder': '#1976D2', 'actorTextColor': '#1565C0', 'signalColor': '#1976D2', 'signalTextColor': '#212121', 'noteBkgColor': '#FFF8E1', 'noteBorderColor': '#FFC107'}}}%%
sequenceDiagram
    autonumber
    
    participant UI as UI
    participant UC as UseCase
    participant Repo as Repository
    participant DS as DataSource

    UI->>UC: execute(...)
    UC->>Repo: getData()
    
    alt 正常
        Repo->>DS: fetch()
        DS-->>Repo: data
        Repo-->>UC: Success
        UC-->>UI: Success(result)
    else 异常
        Repo->>DS: fetch()
        DS-->>Repo: error
        Repo-->>UC: Failure
        UC-->>UI: Failure/fallback
    end
```

##### 触发条件与系统响应

| 触发条件 | 系统响应（正常流程） | 异常处理 |
|---|---|---|
| [用户操作/事件] | [正常流程描述] | [异常情况及对策] |

---

### ST-002 Detailed Design：[标题]

（同 ST-001 结构）

---

*更多 Story 按相同结构追加。*
