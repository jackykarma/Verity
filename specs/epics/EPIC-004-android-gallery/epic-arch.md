# EPIC 架构：EPIC-004 - Android 端相册 App 一期

（各 Feature 的 plan 的 A2/A3.1 须继承本架构；须基于现有工程代码，遵循 constitution。）

**Epic**：EPIC-004 - Android 端相册 App 一期
**Epic Version**：v0.1.9（来自 `epic.md`）
**epic-arch Version**：v0.1.1
**创建/更新日期**：2026-02-12
**输入**：`epic.md`、各 `features/*/spec.md`、现有工程代码、`.specify/memory/constitution.md`、用户架构约束

> **原则**：从**整个 EPIC 需求**整体看待与设计技术架构，保证各 Feature 的 plan 基于同一套 0 层/1 层与规范；须基于**现有工程代码**做演进式设计，遵循 constitution。本架构采纳用户指定的：插件化框架 + 轻量插件、DDD、MVI、Jetpack Compose、Kotlin 2.1.21。

## 0 层架构（EPIC 与外部/现有工程边界）

### 边界说明

- **本 EPIC 范围**：相册一期四大功能（时间轴、图集、搜索、大图），采用**插件化框架**组织；大功能模块以**插件 APK**（内销）或 **AAB DFM**（外销）交付，小子功能以**轻量插件**（AAR 动态加载）方式扩展。
- **外部依赖**：Android MediaStore、Storage Access Framework、存储与照片权限。
- **现有工程衔接**：宿主 App（`:app`）作为 Host，提供导航壳、插件加载与基础能力；本 EPIC 新增相册业务模块，可演进为插件或 DFM 形态；现有 `MainActivity` 与 Compose Theme 作为基础复用。

### 主要子系统/模块

| 模块                        | 形态           | 说明                                 |
| ------------------------- | ------------ | ---------------------------------- |
| **Host（宿主）**              | app 模块       | 主壳、导航、插件框架、基础设施                    |
| **Gallery Plugin（相册主模块）** | 插件 APK / DFM | 时间轴、图集、搜索、大图（四大 Feature 合一或按需拆分）   |
| **轻量插件（可选）**              | AAR 动态加载     | 小子功能如特定过滤器、格式扩展等                   |
| **媒体库/数据层**               | 库模块          | 共享 MediaStore 抽象与索引（由时间轴 Owner 设计） |
| **大图加载与缓存**               | 库模块          | 大图采样、解码、缓存（由大图浏览 Owner 设计）         |

### 0 层架构图

```mermaid
%%{init: {'theme': 'base', 'themeVariables': { 'primaryColor': '#E3F2FD', 'primaryTextColor': '#1565C0', 'primaryBorderColor': '#1976D2', 'lineColor': '#546E7A'}}}%%
flowchart TB
  subgraph EPIC["本 EPIC 范围"]
    subgraph Host["宿主 Host"]
      Nav[Navigation Shell]
      PluginLoader[Plugin Loader 抽象]
    end
    subgraph GalleryPlugin["相册插件 / DFM"]
      Timeline[时间轴列表 FEAT-001]
      Album[图集管理 FEAT-002]
      Search[搜索 FEAT-003]
      Viewer[大图浏览 FEAT-004]
    end
    subgraph SharedLib["共享库模块"]
      MediaLib[媒体库/数据层]
      ImageLoader[大图加载与缓存]
    end
  end

  subgraph External["外部系统"]
    MediaStore[MediaStore]
    Storage[Storage/权限]
  end

  External --> MediaLib
  MediaLib --> Timeline
  MediaLib --> Album
  MediaLib --> Search
  ImageLoader --> Viewer
  MediaLib --> Viewer
  Timeline --> Viewer
  Search --> Viewer
  Album --> Viewer
  PluginLoader --> GalleryPlugin
  Nav --> GalleryPlugin

  style EPIC fill:#E3F2FD,stroke:#1976D2
  style Host fill:#E8F5E9,stroke:#388E3C
  style GalleryPlugin fill:#E3F2FD,stroke:#1976D2
  style SharedLib fill:#FFF3E0,stroke:#F57C00
  style External fill:#FFF8E1,stroke:#FFC107
```

### 插件化策略（内销 vs 外销）

| 发行形态     | 插件形态            | 加载方式                                            | 框架/技术                         |
| -------- | --------------- | ----------------------------------------------- | ----------------------------- |
| **内销**   | 插件 APK          | 运行时加载、侧载                                        | Shadow / VirtualAPK 等插件框架     |
| **外销**   | AAB DFM         | Play Feature Delivery（install-time / on-demand） | Play Core Library、SplitCompat |
| **统一抽象** | `IPluginLoader` | 内销实现加载 APK，外销实现加载 DFM                           | 通过 Build Variant 切换实现类        |

### 轻量插件（小子功能）

| 项目     | 说明                                                         |
| ------ | ---------------------------------------------------------- |
| **形态** | AAR 包（类、资源、可选 .so）                                         |
| **加载** | 动态下载 → DexClassLoader 加载类 + AssetManager.addAssetPath 加载资源 |
| **接口** | 宿主定义接口，轻量插件实现；宿主 ClassLoader 加载接口，插件 ClassLoader 加载实现      |
| **适用** | 体积小、独立可替换的子能力（如特定滤镜、格式扩展等）                                 |

## 1 层架构（分层与模块职责）

### 分层说明（DDD + 四层）

| 层级        | 名称             | 职责                               | 与现有工程对应                       |
| --------- | -------------- | -------------------------------- | ----------------------------- |
| **应用层**   | Application    | 应用逻辑、用例编排、MVI Intent 处理          | 新增，对应 ViewModel / UseCase 调用链 |
| **领域层**   | Domain         | 业务逻辑、业务规则、领域服务、实体与值对象            | 新增                            |
| **数据层**   | Data           | Repository 实现、DataSource、本地/远程数据 | 新增                            |
| **基础设施层** | Infrastructure | 基础工具、SDK 封装、MediaStore 封装、文件访问   | 新增或复用现有工具                     |

依赖方向：应用层 → 领域层 → 数据层；基础设施层被数据层与领域层依赖，不反向依赖业务。

### MVI 架构约定

- **State**：不可变数据类，表示 UI 与业务状态。
- **Intent**：用户意图（点击、滑动、输入等）或系统事件。
- **Reducer**：`(State, Intent) -> State`，纯函数更新状态。
- **ViewModel**：接收 Intent，调用 UseCase/Repository，通过 Reducer 产出新 State，经 `StateFlow` 导出；不直接持有可变的 UI 引用。
- **UI**：Compose 消费 `stateFlow.collectAsState()`，根据 State 渲染；发送 Intent 至 ViewModel。

### 模块职责

| 模块       | 职责                             | Owner Feature |
| -------- | ------------------------------ | ------------- |
| 媒体库/数据层  | MediaStore 抽象、索引、媒体项查询、图集 CRUD | FEAT-001      |
| 列表 UI/导航 | 网格列表、快滑条、日/月/年切换、进入大图契约        | FEAT-001      |
| 大图加载与缓存  | 大图采样、解码、内存缓存、Bitmap 回收         | FEAT-004      |

### 1 层架构图

```mermaid
%%{init: {'theme': 'base', 'themeVariables': { 'primaryColor': '#E3F2FD', 'primaryTextColor': '#1565C0', 'primaryBorderColor': '#1976D2', 'lineColor': '#546E7A'}}}%%
flowchart TB
  subgraph Presentation["表示层 Presentation"]
    UI[Compose UI]
  end

  subgraph Application["应用层 Application"]
    VM[ViewModel MVI]
    UC[UseCase / 用例编排]
  end

  subgraph Domain["领域层 Domain"]
    Entity[实体 / 值对象]
    DomainSvc[领域服务]
    RepoInterface[Repository 接口]
  end

  subgraph Data["数据层 Data"]
    RepoImpl[Repository 实现]
    DataSource[DataSource]
  end

  subgraph Infrastructure["基础设施层 Infrastructure"]
    MediaStoreWrap[MediaStore 封装]
    FileUtil[文件工具]
    ImageSDK[图片解码 SDK]
  end

  UI -->|Intent| VM
  VM -->|StateFlow State| UI
  VM --> UC
  UC --> RepoInterface
  UC --> DomainSvc
  DomainSvc --> Entity
  RepoInterface --> RepoImpl
  RepoImpl --> DataSource
  DataSource --> MediaStoreWrap
  DataSource --> ImageSDK
  RepoImpl --> FileUtil

  style Presentation fill:#E3F2FD,stroke:#1976D2
  style Application fill:#E3F2FD,stroke:#1976D2
  style Domain fill:#E8F5E9,stroke:#388E3C
  style Data fill:#FFF3E0,stroke:#F57C00
  style Infrastructure fill:#FFF8E1,stroke:#FFC107
```

## 规范与约束（所有 Feature plan 必须遵守）

### DDD 设计要点（所有 Feature plan 须在 A0/A3 中显式对齐）

| 概念 | 定义 | 本 EPIC 落地示例 | 设计约束 |
|------|------|------------------|----------|
| **实体 (Entity)** | 具身份标识、生命周期，可通过 id 区分 | MediaItem（id）、Album（id） | 不可变优先；identity 由领域定义，非 DB 主键语义 |
| **值对象 (Value Object)** | 无 identity，由属性值全等判定相等 | TimelineViewMode、FilterCondition、MediaViewerContext、SearchCondition | 不可变；可 `data class`；可包含领域校验逻辑 |
| **聚合 (Aggregate)** | 一组强一致性边界的实体与值对象，以聚合根为唯一入口 | 媒体项以 MediaItem 为根；图集以 Album 为根，Album 维护 mediaIds | 跨聚合不直接引用，通过 id；Repository 按聚合根提供接口 |
| **领域服务 (Domain Service)** | 跨实体/聚合、无状态的业务逻辑 | TimelineGroupingService（按 viewMode 分组）、SearchQueryParser（解析自然语言→SearchCondition） | 无 Android 依赖；接口定义在领域层 |
| **Repository** | 聚合的集合抽象，屏蔽存储细节 | MediaRepository、AlbumRepository | 接口在领域层，实现注入；返回领域对象，非 DTO |
| **限界上下文 (Bounded Context)** | 领域模型与术语的边界 | 媒体库（时间轴/图集/搜索）、大图浏览、图集管理 | 跨上下文通过明确契约（如 MediaViewerContext）交互 |

### 面向对象 7 大原则（设计须显式遵循）

| 原则 | 含义 | 本 EPIC 落地要求 |
|------|------|------------------|
| **SRP 单一职责** | 类仅有一个引起变化的原因 | ViewModel 仅编排；DataSource 仅查询；分组逻辑抽到 DomainService；UI 仅渲染与发 Intent |
| **OCP 开闭** | 对扩展开放、对修改封闭 | Repository 接口扩展 `search()` 而非改 `getMediaPager` 签名；FilterCondition 用 sealed 扩展新类型；错误用 sealed 不 if-else 扩散 |
| **LSP 里氏替换** | 子类型可替换基类型 | MediaRepositoryImpl 可替换 MediaRepository；AlbumRepositoryImpl 可替换 AlbumRepository；实现不破坏接口契约 |
| **ISP 接口隔离** | 多个特定接口优于一个通用接口 | MediaRepository（媒体查询）与 AlbumRepository（图集 CRUD）分离；BigImageLoader（加载）与媒体查询分离；避免上帝接口 |
| **DIP 依赖倒置** | 依赖抽象，不依赖具体 | ViewModel 依赖 MediaRepository 接口；Repository 接口在领域层，DataSource 在数据层；Hilt 注入实现 |
| **迪米特法则** | 最少知识，不链式穿透 | UI 不直连 DataSource；ViewModel 不暴露 Paging 内部；跨 Feature 通过 MediaViewerContext 等契约传递，不传递 Repository |
| **合成复用** | 组合优于继承 | ViewModel 组合 Repository、UseCase；MediaRepositoryImpl 组合 DataSource；避免为复用而深继承，优先委派与组合 |

### 技术栈

| 项目         | 约定                              |
| ---------- | ------------------------------- |
| **语言**     | Kotlin 2.1.21                   |
| **UI**     | Jetpack Compose                 |
| **构建**     | Gradle Kotlin DSL               |
| **最低 API** | Android 10（API 29，与 epic.md 一致） |
| **目标 API** | Android 15（API 35）              |
| **架构**     | DDD 四层 + MVI                    |
| **依赖注入**   | Hilt（推荐，Plan 阶段落实）              |

### 分层与依赖

- **依赖方向**：表示层 → 应用层 → 领域层 ← 数据层；基础设施层仅被数据层/领域层依赖。
- **禁止**：领域层、数据层不得依赖 Android UI 或 ViewModel；基础设施层不得依赖业务层。
- **模块边界**：媒体库/数据层、大图加载由指定 Feature Owner 设计，其他 Feature 通过接口消费。

### 接口与契约

- **跨 Feature**：Repository 接口定义在领域层；媒体项、图集等实体在领域层共享。
- **错误语义**：使用 `Result<T>` 或 `sealed class` 表示成功/失败，不抛未捕获异常到 UI。
- **线程**：IO 操作统一在 `Dispatchers.IO`；主线程仅处理 UI 与 State 更新。

### 插件化与构建

- **插件框架选型**：须同时支持内销插件 APK 与外销 AAB DFM；通过 Product Flavor（如 `domestic` / `overseas`）或 Build Variant 切换 `IPluginLoader` 实现。
- **轻量插件**：AAR 形态通过 DexClassLoader + AssetManager 加载；宿主接口、插件实现分离，避免 ClassLoader 冲突。
- **演进路径**：一期可先采用单模块（`:app` + `:feature-gallery`）实现，接口与分包按插件化预留；后续再拆分为插件 APK / DFM。

### 其他约束

- **安全**：仅访问用户授权的媒体库与存储；遵守 Android 存储与隐私规范。
- **性能**：列表缩图即滑即现无白块；大图进入无黑图、滑动丝滑；内存可控（见 epic.md NFR）。
- **可观测性**：本期可不实现埋点；若引入需统一事件口径。

## 与「跨 Feature 技术策略」的对应

| epic-arch 章节 | epic.md「跨 Feature 技术策略」对应项                   |
| ------------ | -------------------------------------------- |
| 0 层架构图       | 共享能力识别（媒体库/数据层、列表 UI、大图加载）、Feature Plan 执行顺序 |
| 1 层架构图       | 共享能力识别、技术约束（分层、依赖方向）                         |
| 规范与约束        | 技术约束（媒体库复用、列表契约、大图加载责任）、插件化与 DDD/MVI 约定      |
| 插件化策略        | 内销插件 APK、外销 AAB DFM 兼容；轻量插件 AAR 动态加载         |

## 变更记录（增量变更）

| 版本     | 日期         | 变更范围 | 变更摘要                                       | 影响 Feature / plan |
| ------ | ---------- | ---- | ------------------------------------------ | ----------------- |
| v0.1.0 | 2026-02-12 | 初始   | 初版：插件化 + DDD + MVI + Compose，Kotlin 2.1.21 | —                 |
| v0.1.1 | 2026-02-12 | 规范与约束 | 新增 DDD 设计要点、面向对象 7 大原则章节，明确落地要求 | 各 Feature plan   |
