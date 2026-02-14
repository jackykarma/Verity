# Story L2 详细设计与 L0/L1 覆盖规范

本文档定义 speckit Deep 阶段 Story 详细设计（L2）对 L0（0 层架构）、L1（1 层架构 / 全景类图）的覆盖要求，确保所有 Story 的 L2 输出合起来能完整覆盖上层设计。

---

## 一、问题背景

在定制的 speckit 流程中发现：Story 的 L2 详细设计并未完全覆盖 0 层和 1 层设计：

- **类覆盖缺口**：所有 Story 详细设计中出现的类加起来，没有 L1 全景类图完整
- **粒度不足**：按道理所有 Story 的详细设计合起来，应比 L1 关键类更多、类的方法/成员更详细

若 L2 不完整覆盖 L1，会导致：
- 实现时缺少设计指导，部分类/接口需临时补充
- 需求追溯断裂，无法从 L1 精确落到 Story/Task
- 评审难以发现设计缺口

---

## 二、覆盖原则

### 2.1 核心原理：L2 是 L1 的细化，只会更多不会更少

**L2 层设计是更详细的设计实现**，因此：

- **L2 的类、字段、成员只会比 L1 更多**，而不是更少
- **若 L2 比 L1 更少**，则说明 **L1 设计出现问题**：L1 可能过度设计、包含了不应在实现范围内出现的类，或 L1 与 L2 的边界划分有误，需回到 L1 修订

诊断规则：L2 类/成员 < L1 → 优先检查并修正 L1，而非强行在 L2 凑数。

### 2.2 类覆盖原则

| 层级 | 说明 | 覆盖关系 |
|------|------|----------|
| **L0** | EPIC/Feature 0 层架构图：系统边界、外部依赖、主要子系统 | 所有 Story 的 L2 流程/时序合起来，应覆盖 L0 中本 Feature 涉及的全部主流程与异常路径 |
| **L1** | plan.md A3.2.2 全景类图 + A3.1 组件清单 | **每个 L1 类必须至少被一个 Story 的 L2 类图覆盖**；L2 类图应为 L1 对应类的细化版 |
| **L2** | story_detail_design 中每个 Story 的类图/时序图 | 所有 Story 的 L2 类图并集 **≥** L1；类数、方法数、成员数 **≥** L1（通常更多） |

### 2.3 粒度原则

- **L2 类图**：对 L1 中已出现的类，在 L2 中应展示**更多**或至少相等的方法签名、成员变量；L2 还会引入 L1 未列出的辅助类（如 DTO、Mapper、内部实现类）
- **L2 时序图**：比 L1 更细，包含更多 participant、更多调用步骤
- **若 L2 比 L1 少**：视为 L1 设计问题，应回到 A3.2.2 审视 L1 是否包含冗余或超出实现范围的类

---

## 三、L1→L2 覆盖矩阵（强制）

在 `story_detail_design.md` 文档**末尾**必须包含「L1 类覆盖矩阵」，用于显式追溯：

| L1 类（来自 plan A3.2.2） | 覆盖的 Story | 覆盖的 L2 类图位置 | 备注 |
|---------------------------|--------------|---------------------|------|
| TimelineScreen            | ST-003       | ST-003 类图         | 表示层 |
| TimelineViewModel         | ST-002       | ST-002 类图         | 应用层 |
| MediaRepository           | ST-001       | ST-001 类图         | 接口 |
| ...                       | ...          | ...                 | ... |

**要求**：
- 矩阵必须包含 A3.2.2 全景类图中的**所有**类
- 每个 L1 类至少对应一个 Story
- 若某类被多个 Story 涉及，可填多个 Story（如 `ST-001, ST-002`），主覆盖 Story 写前面

---

## 四、Story L2 设计时的检查清单

每个 Story 输出 L2 设计时，执行以下自检：

### 4.1 设计前

- [ ] 已阅读 plan.md 的 A3.2.2 全景类图，明确本 Story 负责覆盖的 L1 类
- [ ] 已阅读 A3.1 组件清单，确认本 Story 落在哪些组件边界内

### 4.2 设计时

- [ ] 本 Story 的类图包含「本 Story 负责覆盖」的全部 L1 类
- [ ] 类的方法签名、成员变量不少于 L1 全景类图对应类，且更细化（含参数类型、返回类型）
- [ ] 本 Story 涉及但 L1 未列出的辅助类（如 DTO、Mapper）已显式画出
- [ ] 时序图 participant 使用真实类名，覆盖正常+异常分支

### 4.3 全部 Story 输出后

- [ ] 填写「L1 类覆盖矩阵」，确认无 L1 类遗漏
- [ ] 检查：所有 Story 的类图并集 ≥ L1 全景类图
- [ ] 运行 `/speckit.analyze` 执行 L1 类覆盖检查（若已扩展）

---

## 五、与 speckit 命令的关系

| 命令 | 作用 |
|------|------|
| **speckit.plan --phase=deep** | 输出 Story L2 时，必须按本规范生成覆盖矩阵；每个 Story 的类图须覆盖其负责的 L1 类 |
| **speckit.analyze** | 若 story_detail_design 存在，解析 plan A3.2.2 与 story_detail_design 各 Story 类图，检查 L1 类是否均被覆盖；缺失时报告 CRITICAL |
| **story_detail_design_template** | 模板末尾包含 L1 类覆盖矩阵占位，执行 Deep 后必须填写 |

---

## 六、示例：FEAT-001 覆盖矩阵

以 FEAT-001 时间轴列表为例，L1 全景类图包含：TimelineScreen、TimelineViewModel、TimelineUiState、TimelineIntent、MediaRepository、MediaRepositoryImpl、MediaStoreDataSource、MediaItem、MediaViewerContext、TimelineError。

| L1 类 | 覆盖的 Story | 覆盖的 L2 类图位置 |
|-------|--------------|---------------------|
| TimelineScreen | ST-003 | ST-003 类图 |
| TimelineViewModel | ST-002 | ST-002 类图 |
| TimelineUiState | ST-002 | ST-002 类图 |
| TimelineIntent | ST-002 | ST-002 类图 |
| MediaRepository | ST-001 | ST-001 类图 |
| MediaRepositoryImpl | ST-001 | ST-001 类图 |
| MediaStoreDataSource | ST-001 | ST-001 类图 |
| MediaItem | ST-001, ST-002 | ST-001 类图（主） |
| MediaViewerContext | ST-002 | ST-002 类图 |
| TimelineError | ST-001, ST-002 | ST-001 类图（主） |

若某 L1 类未被任何 Story 覆盖：优先判断是否为 L1 过度设计（该类不在实际实现范围内）→ 若是，回到 A3.2.2 修正 L1；若非，则补充到相应 Story 的 L2 类图，或说明该类为纯占位/后续 Story 覆盖，并记录在矩阵备注中。
