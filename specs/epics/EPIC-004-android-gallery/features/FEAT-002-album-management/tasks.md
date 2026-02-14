# Tasks：图集管理

**Epic**：EPIC-004 - Android 端相册 App 一期
**Feature ID**：FEAT-002
**Feature Version**：v0.1.2（来自 `spec.md`）
**Plan Version**：v0.1.5（来自 `plan.md`）
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
- **包结构**：album/（AlbumListScreen、AlbumDetailScreen 等）、data/album/、domain/
- **前置依赖**：FEAT-001 MediaRepository、MediaViewerContext 已就绪

---

## 阶段 0：准备（版本/输入冻结）

**目标**：对齐版本、冻结设计输入，避免 Implement 期返工

- [x] T001 在 `specs/epics/EPIC-004-android-gallery/features/FEAT-002-album-management/` 中核对 `spec.md`、`plan.md` 的 Version 字段一致性并补齐变更记录
  - **依赖**：无
  - **设计引用**：N/A
  - **步骤**：
    - 1) 确认 `Feature Version`（v0.1.2）、`Plan Version`（v0.1.5）已填写
    - 2) 确认 Plan 的 Story Breakdown 已完成（ST-001～ST-004）
    - 3) 确认 FEAT-001 的 MediaRepository、MediaViewerContext 已实现
  - **验证**：
    - [ ] tasks.md 中 `Plan Version` 与 plan.md 一致
  - **产物**：`spec.md`、`plan.md`、`tasks.md`

---

## 阶段 1：环境搭建（本 Feature 无新增模块）

**目标**：本 Feature 与 FEAT-001 共处 `:feature-gallery`，无需新增模块；确认 FEAT-001 已完成并可用

- [x] T010 确认 feature-gallery 模块已包含 FEAT-001 的 MediaRepository、MediaViewerContext、MediaItem；在 `feature-gallery/build.gradle.kts` 中补充 Room 依赖（若尚未添加）
  - **依赖**：T001
  - **设计引用**：plan.md:B7、依赖 FEAT-001
  - **步骤**：
    - 1) 检查 feature-gallery 已含 MediaRepository、MediaViewerContext
    - 2) 添加 Room 依赖（kapt/ksp + room-runtime、room-ktx）
  - **验证**：
    - [ ] `./gradlew :feature-gallery:compileDebugKotlin` 通过
  - **产物**：`feature-gallery/build.gradle.kts` 更新

---

## 阶段 2：Story ST-001 - Room 数据库与图集数据访问（类型：Infrastructure）

**目标**：图集 CRUD 可用，列表正确合并系统+用户

**验证方式**：单元测试 DAO、Repository；Migration 测试；NFR-REL-001 增删失败明确提示

- [x] T020 [P] [ST-001] 在 `feature-gallery/.../domain/Album.kt` 中定义 Album 实体（id, name, source: 系统/用户, coverUri 等）
  - **依赖**：T010
  - **设计引用**：story_detail_design.md:ST-001:功能设计:类图；plan.md:领域概念
  - **步骤**：
    - 1) 定义 Album 领域模型
    - 2) 区分系统图集与用户图集（source 或 isUserCreated）
  - **验证**：
    - [ ] 编译通过
  - **产物**：`domain/Album.kt`

- [x] T021 [P] [ST-001] 在 `feature-gallery/.../domain/AlbumRepository.kt` 中定义 AlbumRepository 接口（getAllAlbums、createAlbum、deleteAlbum、addMediaToAlbum、removeMediaFromAlbum）
  - **依赖**：T010
  - **设计引用**：story_detail_design.md:ST-001:功能设计:类图；plan.md:B4.1:AlbumRepository
  - **步骤**：
    - 1) 定义接口方法签名
  - **验证**：
    - [ ] 接口与 plan 一致
  - **产物**：`domain/AlbumRepository.kt`

- [x] T022 [ST-001] 在 `feature-gallery/.../data/album/` 中创建 AlbumEntity、AlbumDao、album_media 关联表，以及 AlbumDatabase
  - **依赖**：T020
  - **设计引用**：story_detail_design.md:ST-001:功能设计:类图；plan.md:B7:AlbumEntity、AlbumDao
  - **步骤**：
    - 1) 创建 AlbumEntity、AlbumMediaCrossRef（album_media）
    - 2) 创建 AlbumDao（CRUD、getMediaIdsByAlbumId 等）
    - 3) 创建 AlbumDatabase，配置 Migration
  - **验证**：
    - [ ] 单元测试 DAO 增删改查
    - [ ] Migration 测试
  - **产物**：`data/album/AlbumEntity.kt`、`AlbumDao.kt`、`AlbumDatabase.kt`

- [x] T023 [ST-001] 在 `feature-gallery/.../data/album/AlbumRepositoryImpl.kt` 中实现 AlbumRepositoryImpl：合并系统 bucket（MediaStore BUCKET_ID/BUCKET_DISPLAY_NAME）与用户图集；实现 getAllAlbums、createAlbum、deleteAlbum、addMediaToAlbum、removeMediaFromAlbum
  - **依赖**：T021、T022、FEAT-001 MediaRepository/MediaStoreDataSource
  - **设计引用**：story_detail_design.md:ST-001:功能设计:时序图；plan.md:A3:方案选型（系统 bucket + Room）
  - **步骤**：
    - 1) 查询 MediaStore 获取系统图集
    - 2) 查询 Room 获取用户图集
    - 3) 合并排序后返回
    - 4) 增删失败时返回 Result 或抛出，供 UI Toast
  - **验证**：
    - [ ] 单元测试/集成测试 Repository
    - [ ] 列表正确合并系统+用户
    - [ ] 增删失败有明确错误（NFR-REL-001）
  - **产物**：`data/album/AlbumRepositoryImpl.kt`

**检查点**：ST-001 完成，AlbumRepository 可用

---

## 阶段 3：Story ST-002 - 图集列表 UI 与创建/删除（类型：Functional）

**目标**：图集列表展示、创建、删除可用

**验证方式**：UI 测试

- [x] T030 [ST-002] 在 `feature-gallery/.../album/AlbumListViewModel.kt` 中实现 AlbumListViewModel（MVI）：加载图集列表、CreateAlbum、DeleteAlbum Intent
  - **依赖**：T023
  - **设计引用**：story_detail_design.md:ST-002:功能设计；plan.md:A3:AlbumListViewModel
  - **步骤**：
    - 1) 注入 AlbumRepository
    - 2) 实现 LoadAlbums、CreateAlbum、DeleteAlbum
    - 3) 仅用户图集可删除
  - **验证**：
    - [ ] ViewModel 单元测试或 UI 验证
  - **产物**：`album/AlbumListViewModel.kt`

- [x] T031 [ST-002] 在 `feature-gallery/.../album/AlbumListScreen.kt` 中实现 AlbumListScreen：图集列表 UI（系统+用户），新增入口、「+」按钮
  - **依赖**：T030
  - **设计引用**：story_detail_design.md:ST-002:功能设计；plan.md:A3:AlbumListScreen、ux-design
  - **步骤**：
    - 1) LazyColumn 或网格展示图集
    - 2) 用户图集显示删除入口，系统图集不显示
  - **验证**：
    - [ ] 图集列表正确展示
  - **产物**：`album/AlbumListScreen.kt`

- [x] T032 [ST-002] 在 `feature-gallery/.../album/CreateAlbumDialog.kt` 中实现 CreateAlbumDialog：输入图集名称、取消/创建按钮
  - **依赖**：T030
  - **设计引用**：story_detail_design.md:ST-002:功能设计；plan.md:CreateAlbumDialog、ux-design:创建图集弹窗
  - **步骤**：
    - 1) 弹窗 UI，名称输入
    - 2) 创建成功后关闭并刷新列表
  - **验证**：
    - [ ] 创建图集可用
  - **产物**：`album/CreateAlbumDialog.kt`

**检查点**：ST-002 完成，图集列表与创建/删除可用

---

## 阶段 4：Story ST-003 - 图集内列表与按类型筛选（类型：Functional）

**目标**：图集内照片列表、按类型查看、进入大图

**验证方式**：UI 测试类型筛选；NFR-PERF-001

- [x] T040 [ST-003] 扩展 MediaRepository（或 MediaStoreDataSource）支持按 albumId 筛选：selection 增加 `_ID IN (SELECT media_id FROM album_media WHERE album_id=?)`；支持 mediaTypeFilter 参数（图片、视频、GIF、实况、杜比）
  - **依赖**：T023、FEAT-001 MediaRepository
  - **设计引用**：story_detail_design.md:ST-003:功能设计；plan.md:MediaRepository 按 albumId 筛选
  - **步骤**：
    - 1) 在 MediaRepository 增加 getMediaPagerByAlbum(albumId, mediaTypeFilter) 或扩展 getMediaPager 参数
    - 2) 用户图集：先 albumMediaDao.getMediaIdsByAlbumId，再 ContentResolver query _ID IN (...)
    - 3) 系统图集：MediaStore BUCKET_ID 筛选
  - **验证**：
    - [ ] 图集内列表正确加载
  - **产物**：`data/MediaRepositoryImpl.kt` 或 `MediaStoreDataSource.kt` 更新

- [x] T041 [ST-003] 在 `feature-gallery/.../album/AlbumDetailViewModel.kt` 中实现 AlbumDetailViewModel：加载图集内媒体列表、MediaTypeFilter 切换（图片、视频、GIF、实况、杜比）
  - **依赖**：T040
  - **设计引用**：story_detail_design.md:ST-003:功能设计；plan.md:AlbumDetailViewModel、FR-006
  - **步骤**：
    - 1) 调用 MediaRepository.getMediaPagerByAlbum(albumId, mediaTypeFilter)
    - 2) 支持 MediaTypeFilter 切换
  - **验证**：
    - [ ] 类型筛选后列表正确
  - **产物**：`album/AlbumDetailViewModel.kt`

- [x] T042 [ST-003] 在 `feature-gallery/.../album/AlbumDetailScreen.kt` 中实现 AlbumDetailScreen：复用 FEAT-001 网格（LazyVerticalGrid + Coil）；日/月/年切换改为 MediaTypeFilter Tab；点击进入大图，构造 MediaViewerContext(source="album")
  - **依赖**：T041
  - **设计引用**：story_detail_design.md:ST-003:功能设计；plan.md:AlbumDetailScreen、B4.1:MediaViewerContext
  - **步骤**：
    - 1) 网格展示图集内照片
    - 2) 类型筛选项（Tab/Chip）
    - 3) 点击构建 MediaViewerContext(itemList, currentIndex, source="album")，导航至大图
  - **验证**：
    - [ ] 图集内列表、类型筛选、进入大图可用
    - [ ] 缩图即滑即现（NFR-PERF-001）
  - **产物**：`album/AlbumDetailScreen.kt`

**检查点**：ST-003 完成，图集内列表与进入大图可用

---

## 阶段 5：Story ST-004 - 选图面板与添加/移出照片（类型：Functional）

**目标**：向图集添加、移出照片，数据一致

**验证方式**：端到端测试添加/移出；NFR-REL-001

- [x] T050 [ST-004] 在 `feature-gallery/.../album/MediaPickerSheet.kt` 中实现 MediaPickerSheet：BottomSheet + 多选网格，从媒体库选择照片
  - **依赖**：T042
  - **设计引用**：story_detail_design.md:ST-004:功能设计；plan.md:MediaPickerSheet、ux-design:选图面板
  - **步骤**：
    - 1) BottomSheet 展示媒体库（可复用 MediaRepository 或独立查询）
    - 2) 多选模式，确认后返回选中的 MediaItem 列表
  - **验证**：
    - [ ] 多选可选、确认返回
  - **产物**：`album/MediaPickerSheet.kt`

- [x] T051 [ST-004] 在 AlbumDetailViewModel 中实现 AddMediaToAlbum、RemoveMediaFromAlbum；AlbumDetailScreen 中「添加照片」打开 MediaPickerSheet，「移出」从当前列表移除
  - **依赖**：T050、T023
  - **设计引用**：story_detail_design.md:ST-004:功能设计；plan.md:FR-004
  - **步骤**：
    - 1) 添加：MediaPickerSheet 确认后调用 AlbumRepository.addMediaToAlbum
    - 2) 移出：调用 AlbumRepository.removeMediaFromAlbum
    - 3) 失败时 Toast 提示（NFR-REL-001）
  - **验证**：
    - [ ] 添加/移出照片成功，列表刷新
    - [ ] 失败时有 Toast
  - **产物**：`album/AlbumDetailViewModel.kt`、`AlbumDetailScreen.kt` 更新

**检查点**：ST-004 完成，选图面板与添加/移出可用

---

## 阶段 6：优化与跨领域关注点

**目标**：主导航集成、空态与错误处理

- [x] T060 在 app 或导航层注册 AlbumListScreen、AlbumDetailScreen 路由，并接入主导航（图集入口）
  - **依赖**：T031、T042
  - **设计引用**：plan.md:ux-design、主导航
  - **步骤**：
    - 1) 注册图集列表、图集详情路由
    - 2) 主导航增加图集 Tab/入口
  - **验证**：
    - [ ] 可从主导航进入图集
  - **产物**：导航配置

- [x] T061 图集列表空态、图集内空态、媒体库不可用时的降级提示
  - **依赖**：T031、T042
  - **设计引用**：plan.md:外部依赖策略、NFR-REL-001
  - **步骤**：
    - 1) 无图集时展示空态
    - 2) 图集内无照片时展示空态
    - 3) 权限/MediaStore 异常时提示
  - **验证**：
    - [ ] 各空态与异常场景正确展示
  - **产物**：`album/AlbumListScreen.kt`、`AlbumDetailScreen.kt` 更新

---

## 依赖关系与执行顺序

### 阶段依赖

- **阶段 0**：无依赖
- **阶段 1**：依赖 T001、FEAT-001 已完成
- **阶段 2（ST-001）**：依赖阶段 1
- **阶段 3（ST-002）**：依赖 ST-001
- **阶段 4（ST-003）**：依赖 ST-001
- **阶段 5（ST-004）**：依赖 ST-003
- **阶段 6**：依赖 ST-002、ST-003

### Story 依赖

- **ST-001**：FEAT-001 MediaRepository
- **ST-002**：ST-001
- **ST-003**：ST-001、FEAT-001
- **ST-004**：ST-003

### 并行执行场景

- T020、T021 可并行（ST-001 内）
- ST-002 与 ST-003 可并行启动（不同 UI 路径），但均依赖 ST-001

---

## 并行示例：Story ST-001

```text
可并行：T020 Album.kt、T021 AlbumRepository.kt
```

---

## 落地策略

### MVP 范围

1. ST-001：AlbumRepository 可用
2. ST-002：图集列表、创建、删除
3. ST-003：图集内列表、类型筛选、进入大图

### 增量交付

1. ST-001 完成 → 供 FEAT-003 搜索图集条件使用
2. ST-002 + ST-003 完成 → 图集浏览与进入大图可用
3. ST-004 完成 → 添加/移出照片可用

---

## 备注

- 本 Feature 与 FEAT-001 共处 `:feature-gallery`，按 album 分包
- AlbumRepository 供 FEAT-003 搜索图集维度条件使用
- 进入大图使用 MediaViewerContext(source="album")
