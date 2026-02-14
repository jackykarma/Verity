# Tasks：搜索

**Epic**：EPIC-004 - Android 端相册 App 一期
**Feature ID**：FEAT-003
**Feature Version**：v0.1.1（来自 `spec.md`）
**Plan Version**：v0.1.4（来自 `plan.md`）
**Tasks Version**：v0.1.1
**输入**：来自 `Feature 目录/` 的设计文档（`spec.md`、`plan.md`、`story_detail_design.md`）

> 规则：
> - Task 只能拆解与执行 Plan 的既定 Story；**禁止**在 tasks.md 里改写 Plan 的技术决策或新增未决策的方案。
> - 每个 Task 必须包含：执行步骤、依赖关系（顺序/并行）、验证方式（可执行/可量化）。
> - 若 plan 含 Story Detailed Design（L2）：每个 Task 必须提供**设计引用**（指向 story_detail_design.md 对应 ST-xxx 的小节/图表/异常矩阵）。

## Task 行格式（首行必须严格遵循）

```text
- [ ] T001 [P?] [ST-xxx] <带路径的任务标题>
```

- **复选框**：必须以 `- [ ]` 开头（完成后改为 `- [x]`）
- **任务 ID**：T001、T002…（全局递增）
- **[P]**：可并行执行（不改同一文件，且无依赖）
- **[ST-xxx]**：必须绑定到 Plan 中的 Story ID
- **路径**：必须写出影响的关键文件路径（真实路径）

## 路径约定（按 plan.md 结构决策）

- **feature-gallery 模块**：`feature-gallery/src/main/java/com/jacky/verity/gallery/`
- **包结构**：search/（SearchScreen、SearchViewModel、SearchQueryParser 等）
- **前置依赖**：FEAT-001 MediaRepository、MediaViewerContext；FEAT-002 AlbumRepository

---

## 阶段 0：准备（版本/输入冻结）

**目标**：对齐版本、冻结设计输入，避免 Implement 期返工

- [ ] T001 在 `specs/epics/EPIC-004-android-gallery/features/FEAT-003-search/` 中核对 `spec.md`、`plan.md` 的 Version 字段一致性并补齐变更记录
  - **依赖**：无
  - **设计引用**：N/A
  - **步骤**：
    - 1) 确认 `Feature Version`（v0.1.1）、`Plan Version`（v0.1.4）已填写
    - 2) 确认 Plan 的 Story Breakdown 已完成（ST-001、ST-002）
    - 3) 确认 FEAT-001、FEAT-002 的 MediaRepository、AlbumRepository 已实现
  - **验证**：
    - [ ] tasks.md 中 `Plan Version` 与 plan.md 一致
  - **产物**：`spec.md`、`plan.md`、`tasks.md`

---

## 阶段 1：Story ST-001 - MediaRepository.search 扩展与 SearchQueryParser（类型：Infrastructure）

**目标**：search 可返回 PagingData；解析常见自然语言

**验证方式**：单元测试 Parser；集成测试 search；NFR-REL-001

- [ ] T010 [P] [ST-001] 在 `feature-gallery/.../search/SearchCondition.kt` 中定义 SearchCondition 值对象（keyword, dateFrom, dateTo, albumId）
  - **依赖**：T001
  - **设计引用**：story_detail_design.md:ST-001:功能设计:类图；plan.md:A3.3:SearchCondition
  - **步骤**：
    - 1) 定义 data class，不可变
    - 2) keyword: String?；dateFrom: Long?；dateTo: Long?；albumId: Long?
  - **验证**：
    - [ ] 编译通过
  - **产物**：`search/SearchCondition.kt`

- [ ] T011 [ST-001] 在 `feature-gallery/.../search/SearchQueryParser.kt` 中实现 SearchQueryParser（无 Android 依赖的领域组件）：规则解析自然语言（日期、图集、keyword）；解析失败降级为 keyword 或 Result.failure(ParseFailed)；需注入 AlbumRepository 获取图集列表用于 matchAlbumKeyword
  - **依赖**：T010、FEAT-002 AlbumRepository
  - **设计引用**：story_detail_design.md:ST-001:功能设计:时序图；plan.md:A3.3:SearchQueryParser
  - **步骤**：
    - 1) 实现 parse(queryText: String, albums: List<Album>): Result<SearchCondition>
    - 2) 日期规则：如 "昨天"、"2025年1月" 等
    - 3) 图集规则：匹配 albums 名称
    - 4) 降级：无法解析时 fallbackToKeyword 或返回 ParseFailed
  - **验证**：
    - [ ] 单元测试：日期、图集、keyword、降级用例
  - **产物**：`search/SearchQueryParser.kt`

- [ ] T012 [ST-001] 在 `feature-gallery/.../data/` 中实现 SearchMediaPagingSource 或扩展 MediaStoreDataSource：根据 SearchCondition 构建 selection/selectionArgs；支持 keyword（DISPLAY_NAME LIKE）、dateFrom/dateTo（DATE_TAKEN）、albumId（BUCKET_ID 或 _ID IN album_media）
  - **依赖**：T010、FEAT-001 MediaStoreDataSource、FEAT-002 AlbumDao
  - **设计引用**：story_detail_design.md:ST-001:功能设计:类图；plan.md:A3.3:SearchMediaPagingSource
  - **步骤**：
    - 1) 实现 buildSelection(condition): Pair<String, Array<String>>
    - 2) 用户图集 albumId：albumMediaDao.getMediaIdsByAlbumId，再 _ID IN (...)
    - 3) sortOrder 固定 DATE_TAKEN DESC
  - **验证**：
    - [ ] 单元测试 buildSelection 逻辑
  - **产物**：`data/SearchMediaPagingSource.kt` 或 MediaStoreDataSource 扩展

- [ ] T013 [ST-001] 在 `feature-gallery/.../data/MediaRepositoryImpl.kt` 中扩展 MediaRepository 接口与实现：增加 search(condition: SearchCondition): Flow<PagingData<MediaItem>>；使用 SearchMediaPagingSource；在 `feature-gallery/.../domain/MediaRepository.kt` 中补充 search 方法签名
  - **依赖**：T012、T011
  - **设计引用**：story_detail_design.md:ST-001:功能设计:时序图；plan.md:A3.3:MediaRepository.search
  - **步骤**：
    - 1) domain/MediaRepository 增加 search(condition): Flow<PagingData<MediaItem>>
    - 2) MediaRepositoryImpl 实现，Pager + SearchMediaPagingSource
  - **验证**：
    - [ ] 集成测试：search 返回有效 PagingData
    - [ ] 媒体库不可用时明确提示（NFR-REL-001）
  - **产物**：`domain/MediaRepository.kt`、`data/MediaRepositoryImpl.kt` 更新

**检查点**：ST-001 完成，search 与 Parser 可用

---

## 阶段 2：Story ST-002 - 搜索 UI 与结果列表（类型：Functional）

**目标**：搜索入口可用、结果展示、进入大图

**验证方式**：UI 测试、端到端搜索；NFR-PERF-001、NFR-PERF-002

- [ ] T020 [P] [ST-002] 在 `feature-gallery/.../search/SearchIntent.kt` 中定义 sealed SearchIntent（SearchQuery、SelectDateRange、SelectAlbum、ClearCondition、OnPhotoClick 等）
  - **依赖**：T013
  - **设计引用**：story_detail_design.md:ST-002:功能设计；plan.md:A3:SearchViewModel
  - **步骤**：
    - 1) 定义各 Intent
  - **验证**：
    - [ ] 编译通过
  - **产物**：`search/SearchIntent.kt`

- [ ] T021 [P] [ST-002] 在 `feature-gallery/.../search/SearchUiState.kt` 中定义 SearchUiState（queryText, condition, items, showRefinePrompt, isLoading 等）
  - **依赖**：T013
  - **设计引用**：story_detail_design.md:ST-002:功能设计；plan.md:A3:SearchUiState
  - **步骤**：
    - 1) 定义 data class
  - **验证**：
    - [ ] 编译通过
  - **产物**：`search/SearchUiState.kt`

- [ ] T022 [ST-002] 在 `feature-gallery/.../search/SearchViewModel.kt` 中实现 SearchViewModel：接收 SearchIntent；调用 SearchQueryParser.parse；调用 MediaRepository.search(condition)；debounce 300–500ms 再触发搜索；condition 变化时 flatMapLatest 重新 search
  - **依赖**：T020、T021、T011、T013
  - **设计引用**：story_detail_design.md:ST-002:功能设计:时序图；plan.md:A3.3:debounce
  - **步骤**：
    - 1) 注入 MediaRepository、SearchQueryParser、AlbumRepository
    - 2) 用户输入 debounce 后 parse，成功则 search，失败则 showRefinePrompt
    - 3) 条件 Chip（日期、图集）更新 condition 后重新 search
  - **验证**：
    - [ ] ViewModel 单元测试或 UI 验证
  - **产物**：`search/SearchViewModel.kt`

- [ ] T023 [ST-002] 在 `feature-gallery/.../search/SearchScreen.kt` 中实现 SearchScreen：搜索框、条件 Chip（日期、图集）；结果网格复用 FEAT-001 的 LazyVerticalGrid + Paging + Coil；无结果时空态提示；点击照片构建 MediaViewerContext(source="search") 进入大图
  - **依赖**：T022
  - **设计引用**：story_detail_design.md:ST-002:功能设计；plan.md:ux-design、B4.1:MediaViewerContext
  - **步骤**：
    - 1) 搜索框 + 条件 Chip
    - 2) 结果网格复用 FEAT-001 模式
    - 3) 无匹配结果时显示空态（AC-005）
    - 4) 点击构建 MediaViewerContext，导航至大图
  - **验证**：
    - [ ] UI 测试：搜索、条件、结果、进入大图
    - [ ] 结果列表缩图即滑即现无白块（NFR-PERF-001、NFR-PERF-002）
  - **产物**：`search/SearchScreen.kt`

**检查点**：ST-002 完成，搜索 UI 与进入大图可用

---

## 阶段 3：优化与跨领域关注点

**目标**：主导航集成、空态与错误提示

- [ ] T030 在 app 或导航层注册 SearchScreen 路由，并接入主导航（搜索入口）
  - **依赖**：T023
  - **设计引用**：plan.md:ux-design、主导航
  - **步骤**：
    - 1) 注册搜索路由
    - 2) 主导航增加搜索入口
  - **验证**：
    - [ ] 可从主导航进入搜索
  - **产物**：导航配置

- [ ] T031 搜索失败、无结果、解析失败时的明确提示（showRefinePrompt、空态文案）
  - **依赖**：T023
  - **设计引用**：plan.md:A5:异常场景、AC-005、NFR-REL-001
  - **步骤**：
    - 1) 无结果：空态「无匹配结果」
    - 2) 解析失败：提示用户细化条件
    - 3) 媒体库不可用：明确提示
  - **验证**：
    - [ ] 各异常场景正确展示
  - **产物**：`search/SearchScreen.kt` 更新

---

## 依赖关系与执行顺序

### 阶段依赖

- **阶段 0**：无依赖
- **阶段 1（ST-001）**：依赖 T001、FEAT-001、FEAT-002 已完成
- **阶段 2（ST-002）**：依赖 ST-001
- **阶段 3**：依赖 ST-002

### Story 依赖

- **ST-001**：FEAT-001、FEAT-002
- **ST-002**：ST-001

### 并行执行场景

- T010、T011 可并行启动（SearchCondition 先于 Parser）
- T020、T021 可并行（ST-002 内）

---

## 并行示例：Story ST-001

```text
可并行：T010 SearchCondition.kt、T011 SearchQueryParser.kt（T011 依赖 T010，但 T010 完成后 T011 可独立开发）
```

## 并行示例：Story ST-002

```text
可并行：T020 SearchIntent.kt、T021 SearchUiState.kt
```

---

## 落地策略

### MVP 范围

1. ST-001：search 与 Parser 可用
2. ST-002：搜索 UI、结果列表、进入大图

### 增量交付

1. ST-001 完成 → 搜索能力可用
2. ST-002 完成 → 搜索入口与结果展示可用

---

## 备注

- 本 Feature 与 FEAT-001、FEAT-002 共处 `:feature-gallery`，按 search 分包
- SearchQueryParser 无 Android 依赖，可独立单元测试
- 进入大图使用 MediaViewerContext(source="search")
- 用户图集 albumId 需通过 AlbumDao 查 album_media 获取 mediaIds，再构建 _ID IN 查询
