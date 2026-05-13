# KD-001：[设计点名称]

> **EPIC 内文件路径**（示例）：`key-func-design/KD_001_<short_slug>.md`  
> **命名规则**：`KD_${三位序号}_${精炼slug}.md`（序号与 `epic-design.md` §7.1 中 **KD-001** 对齐；slug 建议英文/拼音，仅字母、数字、下划线）。
>
> **回链**：[`epic-design.md`](../epic-design.md) §七（关键设计清单与引用以该节为准；**不**使用 EPIC 根目录 `key-func-design.md`）。
>
> **KD 与 Feature 关系**：KD 是围绕关键技术方案、疑难点或方案亮点组织的设计单元，**不要求与 Feature 一一对应**；一个 KD 可支撑多个 Feature，一个 Feature 也可拆出多个 KD。
>
> **流程图归属（必须）**：本 KD 的**方案流程图**（及按需的**方案架构图**）**须直接绘制在本文档内**的对应章节（Mermaid）。跨 KD、跨 Feature 或端到端流程须在相关 KD 中互链说明，不再单独产出流程图集。若本设计点确无分支、单线逻辑且无需图示，须在「### 方案流程图」节标注 **N/A** 并一句话说明理由。
>
> **图表规范**：Mermaid 样式遵循 `.cursor/rules/mermaid-style-guide.mdc`；内容与真实代码一致遵循 `.cursor/rules/specify-diagram-requirements.mdc`。每张 `sequenceDiagram` **紧下方**须有「未读图也能理解分支差异」的协作者与过程说明。

**Epic**：EPIC-[编号] - [名称]
**KD 编号**：KD-001
**创建/更新日期**：[YYYY-MM-DD]

---

## 依赖的其他 KD

> 若无前置依赖，表格填 `—`，并写明「无前置依赖」。多个前置用多行；**须与 `epic-design.md` §7.1 中「前置 KD / 依赖」列一致**。

| 前置 KD | 对应文件（相对本目录） | 本 KD 如何建立在其上 |
| ------- | ---------------------- | -------------------- |
| —       | —                      | 无前置依赖 / 或示例：KD-001 → `./KD_001_xxx.md`，本 KD 复用其会话契约与生命周期约定 |

---

- **类型**：疑难点 | 方案亮点
- **背景/亮点说明**：疑难点→[为何是疑难点，涉及哪些组件或跨层关注点，易出现哪些坑]；亮点→[为何是亮点，创新点或最佳实践，可复用价值]
- **方案选型与取舍**：[对比了哪些候选方案，各自优劣，为什么选当前方案]（疑难点必填，亮点选填）
- **核心方案**：用**清晰、易懂、不过度冗长**的中文讲清本 KD 的**技术实现链路**，让评审者能据此判断方案是否可行。正文不强制按「第几段」切分，可按叙述需要自然组织，但**禁止**仅用标题或条目堆砌代替说明。重点不是罗列所有细节，而是把关键链路、关键机制和关键取舍讲到可验证。须满足：

  > - **链路闭环**：从触发到结果讲清主路径，必要时覆盖关键异常/降级路径；入口、中间处理、出口或副作用要交代清楚，读者能跟着文字走通。  
  > - **关键技术点露面**：凡影响方案可行性的技术点（协议、存储、线程/协程、缓存、序列化、安全、系统或第三方交互等）必须说明；无关或显而易见的实现细节不展开。  
  > - **关键环节可落地**：对链路中的关键环节说明「如何达成」——采用什么机制 / API / 数据结构 / 约定，谁负责，状态与数据如何传递或落盘，关键约束（性能、一致性、生命周期、兼容性等）如何满足；避免只写「会调用某某」而不写**怎样**调用、**为何**可行。  
  > - **与图互证**：叙述应与本节**模型架构图**（若有）、**方案架构图**（若有）、**关键类图**、流程图、时序图一致；图中出现的核心概念、实体、模块、类名与关键消息，在文字中应有对应关系，便于交叉检查。

  （模板中的以上引用块为撰稿提示，正式文档中删除引用块，改为连续正文即可。）
- **关联决策**：[零层/一层架构中的决策点]（若适用）
- **边界条件与注意事项**：[关键边界、异常、并发/生命周期等]（疑难点必填，亮点选填）

### 模型架构图（领域/概念建模；可选）

> **定位**：仅当本 KD 涉及**领域概念建模**时使用，描述核心概念、实体与值对象、属性要点、实体间关系（关联/组合/聚合）、可选状态枚举或生命周期。与 `epic-design.md` **§三 领域模型**可对齐但**范围缩至本设计点**。若本 KD 不涉及领域概念建模，本节直接写 **N/A：不涉及领域概念建模** 即可。
>
> **何时需要**：涉及**新业务实体**、**复杂状态与流转**、**多实体一致性/事务边界**、**领域规则依赖的概念关系**时绘制。若本 KD 仅为基础设施、UI 壳层、流程编排、接口适配或其他不引入领域概念的设计点，不需要绘制模型架构图。
>
> **与「方案架构图」的分工**：
>
> | 维度 | 模型架构图（本节） | 方案架构图（下一节） |
> |---|---|---|
> | 视角 | **业务/领域语义**（概念、数据与规则承载物） | **工程/运行时**（模块、组件、分层、调用与依赖） |
> | 典型元素 | 实体、值对象、枚举、关联、聚合边界 | ViewModel、Repository、DataSource、Feature 模块 |
> | 回答的问题 | 处理的对象是什么、它们如何关联 | 谁在运行时协作、数据如何流经各层 |
>
> **表达形式**：优先使用 Mermaid `classDiagram`（概念级类图：可只列关键属性/关联，**不必**等同于 §八 落码级类图）；涉及强表结构预览时可用 `erDiagram`。须与 `epic-design.md` §三 术语一致，**禁止**引入 §三 未定义且无说明的新概念名。
>
> **要求**：标注只读/可变、拥有方（如订单「拥有」订单行）；关系箭头与基数（1、*、0..1）须与正文「核心方案」一致。

```mermaid
%%{init: {'theme': 'base', 'themeVariables': { 'primaryColor': '#E3F2FD', 'primaryTextColor': '#1565C0', 'primaryBorderColor': '#1976D2', 'lineColor': '#546E7A'}}}%%
classDiagram
  direction TB
  class AggregateRoot["聚合根 / 实体示例"] {
    <<实体>>
    +id: Id
    +status: OrderStatus
    +confirm() void
  }
  class ChildEntity["子实体 / 值对象示例"] {
    <<值对象或子实体>>
    +quantity: Int
  }
  class RelatedConcept["关联概念"] {
    <<实体或外部引用>>
  }

  AggregateRoot "1" *-- "n" ChildEntity : 组合
  AggregateRoot "1" --> "1" RelatedConcept : 关联

  style AggregateRoot fill:#E3F2FD,stroke:#1976D2,stroke-width:2px
  style ChildEntity fill:#E8F5E9,stroke:#388E3C,stroke-width:2px
  style RelatedConcept fill:#FFF3E0,stroke:#F57C00,stroke-width:2px
```

**模型说明**：

- **概念与职责**：列出图中每个核心概念的一句话领域含义（与 §三 词汇表对应）。
- **关系与约束**：说明关联/组合/聚合的业务理由； cardinality 与不变量（如「一个 X 至多一个 Y」）。
- **状态与事件**（若适用）：关键状态枚举、允许迁移，或与后续方案流程图中分支的对应关系。

### 方案架构图（涉及多组件/跨模块协作时推荐）

> **何时需要**：当本设计点涉及**多个组件/模块协作**、**跨层调用**或**引入新的架构元素**时，用架构图先将参与方与依赖关系可视化；**建议在已理解领域模型（上一节）后再画本节**。若设计点局限于单一模块内部逻辑且无跨组件协作，可省略本节。
>
> **与 epic-design §四/§五 的区别**：§四/§五 是 EPIC 级全局架构，本节是**设计点局部架构**——仅展示与本 KD 直接相关的组件/模块及其关系，粒度更细、聚焦更窄。
>
> **要求**：
>
> - subgraph 按职责或技术分层组织，标注所属工程模块名称（如 `:feature:xxx`）
> - 静态依赖用实线箭头（`-->`），动态协作/事件/回调用虚线箭头（`-.->`）
> - 须标注关键数据流方向与协议（如 Flow、Callback、Intent 等）
> - 新增组件用蓝色主色，复用已有组件用绿色成功色，外部依赖用橙色警告色

```mermaid
%%{init: {'theme': 'base', 'themeVariables': { 'primaryColor': '#E3F2FD', 'primaryTextColor': '#1565C0', 'primaryBorderColor': '#1976D2', 'lineColor': '#546E7A'}}}%%
flowchart TB
  subgraph LayerA["[分层/模块 A]"]
    CompA1["组件 A1（新增）"]
    CompA2["组件 A2（复用）"]
  end
  subgraph LayerB["[分层/模块 B]"]
    CompB1["组件 B1"]
  end
  External["外部依赖/系统能力"]

  CompA1 --> CompB1
  CompA2 -.-> CompA1
  CompB1 --> External

  style CompA1 fill:#E3F2FD,stroke:#1976D2,stroke-width:2px
  style CompA2 fill:#E8F5E9,stroke:#388E3C,stroke-width:2px
  style CompB1 fill:#E3F2FD,stroke:#1976D2,stroke-width:2px
  style External fill:#FFF3E0,stroke:#F57C00,stroke-width:2px
  style LayerA fill:#FAFAFA,stroke:#BDBDBD,stroke-width:1px
  style LayerB fill:#FAFAFA,stroke:#BDBDBD,stroke-width:1px
```

**架构说明**：

- **参与组件**：[列出本设计点涉及的所有组件，说明各自在本设计点中的角色]
- **依赖与协作关系**：[说明组件间的依赖方向与协作方式——谁调用谁、数据如何流转、事件如何传递]
- **新增 vs 复用**：[哪些是本设计点新增的组件/接口，哪些是复用已有的，复用时有无适配/扩展]

### 方案流程图（验逻辑分支；**默认必须在本 KD 文档内绘制**）

> **强制**：流程图代码块**放在本文件本节**，与 `epic-design.md` §七「每个设计点同时给出流程图」一致。用流程图将核心方案的**处理逻辑**可视化：先做什么、再做什么、什么条件走哪条分支。粒度与 epic-design §五 对齐（组件/模块级），节点使用组件或步骤名称。涉及多步决策、分支或异常路径时**不可省略**；仅当确无分支且评审无需图示时，本节写 **N/A** + 理由。

```mermaid
%%{init: {'theme': 'base', 'themeVariables': { 'primaryColor': '#E3F2FD', 'primaryTextColor': '#212121', 'primaryBorderColor': '#1976D2', 'lineColor': '#546E7A'}}}%%
flowchart TD
  Start([触发条件]) --> Step1[步骤/组件 1]
  Step1 --> Decision{关键决策?}
  Decision -->|条件 A| Step2[步骤/组件 2]
  Decision -->|条件 B| Step3[步骤/组件 3]
  Step2 --> End([结果])
  Step3 --> End

  style Start fill:#E8F5E9,stroke:#388E3C
  style End fill:#E8F5E9,stroke:#388E3C
  style Decision fill:#FFF3E0,stroke:#F57C00
```

**工作流程**：

1. [步骤 1：触发条件是什么，发生了什么]
2. [步骤 2：关键决策点——根据什么条件走哪条分支]
3. [步骤 3：各分支分别做什么，最终结果是什么]

### 关键类图（验方案可行性；必须）

> **定位**：用 **Mermaid `classDiagram`** 固化本 KD 涉及的**关键类与接口**（工程真实类名/接口名，须与代码或已定命名一致），并写出与方案直接相关的**关键字段**与**关键方法**（含参数/返回值类型或 Kotlin/Java 可辨识的简写），验证「类型与职责是否撑得起方案」。**本节为必填**；若确无新增/涉及类型（极罕见），须写 **N/A** 并说明理由。
>
> **要求**：
>
> - **类名/接口名**：须为本工程**真实**或设计已定稿名称；新增类型在类旁注释 `<<新增>>` 并可用主色样式，改动现有类型用 `<<修改>>` 与警告色样式（便于评审扫读）。
> - **字段**：列出与状态、数据流、持久化、跨层传递**直接相关**的属性（含类型）。
> - **方法**：须列出本 KD 涉及的所有**公共方法**（含完整签名：方法名 + 参数类型 + 返回值类型）。不得省略任何公共 API，哪怕是辅助方法——key-diagram 层已删除，全量签名由本节保障。
> - **关系**：`-->` 依赖、`<|..` 实现、`<|--` 继承等须与「核心方案」叙述及下文**核心调用链时序图**的 participant 一致。
> - **顺序建议**：先完成本节类图，再画**核心调用链时序图**，避免 participant 与类型脱节。

```mermaid
%%{init: {'theme': 'base', 'themeVariables': { 'primaryColor': '#E3F2FD', 'primaryTextColor': '#1565C0', 'primaryBorderColor': '#1976D2', 'lineColor': '#546E7A'}}}%%
classDiagram
  direction TB
  class XxxViewModel {
    <<新增>>
    -repository: XxxRepository
    +uiState: StateFlow~UiState~
    +onSubmit(id: String) void
  }
  class XxxRepository {
    <<interface>>
    <<修改>>
    +load(id: String) Flow~Result~Data~~
  }
  class XxxRepositoryImpl {
    <<新增>>
    -remote: XxxApi
    +load(id: String) Flow~Result~Data~~
  }

  XxxViewModel --> XxxRepository
  XxxRepository <|.. XxxRepositoryImpl

  style XxxViewModel fill:#E3F2FD,stroke:#1976D2,stroke-width:2px
  style XxxRepository fill:#FFF3E0,stroke:#F57C00,stroke-width:2px
  style XxxRepositoryImpl fill:#E3F2FD,stroke:#1976D2,stroke-width:2px
```

**类图说明**：

- **各类/接口职责**：各用一句话说明在本 KD 方案中的角色。
- **关键成员与方案**：字段/方法如何支撑「核心方案」中的数据与调用；哪些成员在核心时序中会出现。
- **与模型架构图**：若上文有模型架构图，说明领域概念如何映射到本图类/接口（不必逐字重复，标出对应关系即可）。

### 核心调用链时序图（讲清协作/调用流程；必须）

> 用时序图讲清本 KD 的**工作流程、协作流程与核心方法调用流程**，验证方案在类协作层面**走不走得通**：谁触发、谁负责、谁调用谁、关键数据如何返回、职责分配是否合理、核心调用链是否有断点。**participant 须与上一节「关键类图」中的类/接口一致**（名称一致；若时序中需抽象为模块，须在「协作过程」中说明与具体类的对应关系）。
>
> **图后文字说明（必须）**：本节每张时序图代码块**紧下方**须有「**协作过程**」等小节，在 **KD 粒度**说明协作链、工作过程与 `alt/else` 分支含义（见 `.cursor/rules/specify-diagram-requirements.mdc` §四），不得仅列步骤标题而无实质内容，也不需要展开到 L2 落码细节。
>
> **粒度控制**：KD 阶段重点讲清**主干成功路径 + 影响方案可行性的关键异常/降级分支**；不要求展开到每个局部实现细节、内部私有方法或 Story 级边界条件。更细的方法调用、字段级转换、UI 细节和单 Story 专属分支，放到 L2 Story 设计中细化。

```mermaid
%%{init: {'theme': 'base', 'themeVariables': { 'actorBkg': '#E3F2FD', 'actorBorder': '#1976D2', 'actorTextColor': '#1565C0', 'signalColor': '#1976D2', 'signalTextColor': '#212121', 'noteBkgColor': '#FFF8E1', 'noteBorderColor': '#FFC107'}}}%%
sequenceDiagram
  autonumber
  participant A as [类/模块 A]
  participant B as [类/模块 B]
  participant C as [类/模块 C]
  A->>B: 方法名()
  B->>C: 方法名()
  alt 成功
    C-->>B: 结果
    B-->>A: 结果
  else 异常A（如网络错误）
    C-->>B: IOException
    B-->>A: 降级/错误
  else 异常B（如数据异常）
    C-->>B: DataException
    B-->>A: 错误处理
  end
```

**协作过程**（按下列结构在 **KD 粒度**展开；每项应有实质内容，不得仅列标题或一句话带过；目标是**未读图也能理解主干协作与关键分支差异**）：

1. **触发与入口**
   - 谁（哪个角色/组件）在什么条件下发起交互，对应图中的首条或首批消息
   - 触发的前置状态是什么（如页面已加载、用户已登录、数据已就绪等）

2. **协作链与职责**
   - 沿调用方向，**逐跳**说明「谁调用谁、为了什么、方法语义、输入/输出数据是什么」
   - 每一跳的调用方与被调用方分别承担什么职责——为什么由它来做而不是其他组件
   - 与 epic-design §五 一层架构中的分层/模块边界是什么关系（跨层调用还是同层协作）

3. **工作过程与数据流**
   - **主干流程**：说明核心环节按什么顺序协作，关键判断发生在哪里，判断结果如何影响后续流程
   - **数据流转**：说明关键输入从哪来（内存/缓存/持久化/网络等）、经过哪些核心组件、最终输出到哪里；字段级转换和局部实现细节留给 L2
   - **关键机制**：只说明影响方案可行性的机制（如协程调度、缓存策略、序列化方式、加密方式、生命周期绑定等），讲清采用什么、为什么可行、满足什么关键约束

4. **分支与异常**
   - 对图中**每个 `alt/else`**（及重要的 `opt/loop`）**分别**说明：
     - 进入条件：什么情况下走这条分支
     - 差异行为：各分支在处理逻辑、调用链、数据流上有什么不同
     - 可见结果：最终对调用方/用户的可见结果是什么（返回值、UI 状态、副作用等）
   - 异常分支须说明错误传播路径（谁产生错误→谁捕获→谁处理→最终用户看到什么）

5. **结束条件**
   - 正常结束：最终产出什么结果、系统/UI 处于什么状态
   - 异常结束：各类异常路径最终的可见结果分别是什么
   - 与流程图或其他设计章节的一致性说明（如适用）

- **精确化与补全**：各 Story 的 L2 详细设计（`l2_design/ST-xxx_*.md`）在本 KD 类图/时序基础上，按 Story 切片补充本 Story 的细化类图/时序；KD 已讲清的主干协作不重复展开，只补充 Story 专属细节、边界条件与落码级调用。
