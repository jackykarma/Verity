# Tasks：大图浏览

**Epic**：EPIC-004 - Android 端相册 App 一期
**Feature ID**：FEAT-004
**Feature Version**：v0.1.0（来自 `spec.md`）
**Plan Version**：v0.1.3（来自 `plan.md`）
**Tasks Version**：v0.1.0
**输入**：来自 `Feature 目录/` 的设计文档（`spec.md`、`plan.md`）

> 规则：
> - Task 只能拆解与执行 Plan 的既定 Story；**禁止**在 tasks.md 里改写 Plan 的技术决策或新增未决策的方案。
> - 每个 Task 必须包含：执行步骤、依赖关系（顺序/并行）、验证方式（可执行/可量化）。
> - 设计引用指向 plan.md 对应章节。

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
- **包结构**：viewer/（PhotoViewerScreen、ThumbnailStrip 等）、data/loader/（BigImageLoader 等）
- **前置依赖**：FEAT-001 MediaViewerContext、MediaItem；列表/图集/搜索提供进入入口

---

## 阶段 0：准备（版本/输入冻结）

**目标**：对齐版本、冻结设计输入，避免 Implement 期返工

- [ ] T001 在 `specs/epics/EPIC-004-android-gallery/features/FEAT-004-photo-viewer/` 中核对 `spec.md`、`plan.md` 的 Version 字段一致性并补齐变更记录
  - **依赖**：无
  - **设计引用**：N/A
  - **步骤**：
    - 1) 确认 `Feature Version`（v0.1.0）、`Plan Version`（v0.1.3）已填写
    - 2) 确认 Plan 的 Story Breakdown 已完成（ST-001～ST-004）
    - 3) 确认 FEAT-001 的 MediaViewerContext、进入大图导航已实现
  - **验证**：
    - [ ] tasks.md 中 `Plan Version` 与 plan.md 一致
  - **产物**：`spec.md`、`plan.md`、`tasks.md`

---

## 阶段 1：Story ST-001 - BigImageLoader 与采样解码（类型：Infrastructure）

**目标**：load/recycle 可用，内存可控

**验证方式**：单元测试 decode、cache；内存 profiling；NFR-MEM-001、NFR-REL-001

- [ ] T010 [P] [ST-001] 在 `feature-gallery/.../data/loader/ImageDecoder.kt` 中实现 ImageDecoder：BitmapFactory + inSampleSize 根据目标 width/height 计算采样率
  - **依赖**：T001
  - **设计引用**：plan.md:ST-001、A3.1.2.1:BigImageLoaderImpl
  - **步骤**：
    - 1) 从 ContentResolver 读取 InputStream
    - 2) 计算 inSampleSize
    - 3) 解码返回 Bitmap
  - **验证**：
    - [ ] 单元测试 decode 逻辑
  - **产物**：`data/loader/ImageDecoder.kt`

- [ ] T011 [ST-001] 在 `feature-gallery/.../data/loader/BigImageLoader.kt` 中定义 BigImageLoader 接口（load(uri, width, height): Bitmap?、recycle(bitmap): Unit）
  - **依赖**：T001
  - **设计引用**：plan.md:A3.1.2.1:BigImageLoader
  - **步骤**：
    - 1) 定义接口方法
  - **验证**：
    - [ ] 编译通过
  - **产物**：`data/loader/BigImageLoader.kt`

- [ ] T012 [ST-001] 在 `feature-gallery/.../data/loader/BigImageLoaderImpl.kt` 中实现 BigImageLoaderImpl：LruCache 50MB；组合 ImageDecoder；load 时先查 cache，未命中则 decode 并 put；recycle 离屏 Bitmap 并 remove 出 cache
  - **依赖**：T010、T011
  - **设计引用**：plan.md:ST-001、A3.1.2.2:时序图
  - **步骤**：
    - 1) LruCache<Uri, Bitmap> 约 50MB
    - 2) load 流程：cache.get → decode → cache.put
    - 3) recycle 供 ViewModel 在 OnPageChanged 时调用
  - **验证**：
    - [ ] 单元测试 cache 命中/未命中
    - [ ] 内存 profiling 无泄漏（NFR-MEM-001）
    - [ ] 文件损坏时返回 null 或占位，不崩溃（NFR-REL-001）
  - **产物**：`data/loader/BigImageLoaderImpl.kt`

**检查点**：ST-001 完成，BigImageLoader 可用

---

## 阶段 2：Story ST-002 - 大图 UI 与 HorizontalPager（类型：Functional）

**目标**：进入大图无黑图、展示当前页

**验证方式**：UI 测试进入过渡；NFR-PERF-001

- [ ] T020 [P] [ST-002] 在 `feature-gallery/.../viewer/PhotoViewerIntent.kt` 中定义 sealed PhotoViewerIntent（Init、OnPageChanged、OnThumbClick 等）
  - **依赖**：T012
  - **设计引用**：plan.md:A3:PhotoViewerViewModel
  - **步骤**：
    - 1) 定义各 Intent
  - **验证**：
    - [ ] 编译通过
  - **产物**：`viewer/PhotoViewerIntent.kt`

- [ ] T021 [P] [ST-002] 在 `feature-gallery/.../viewer/PhotoViewerUiState.kt` 中定义 PhotoViewerUiState（itemList, currentIndex, images: Map<Int, Bitmap>, isLoading 等）
  - **依赖**：T012
  - **设计引用**：plan.md:A3:PhotoViewerViewModel
  - **步骤**：
    - 1) 定义 data class
  - **验证**：
    - [ ] 编译通过
  - **产物**：`viewer/PhotoViewerUiState.kt`

- [ ] T022 [ST-002] 在 `feature-gallery/.../viewer/PhotoViewerViewModel.kt` 中实现 PhotoViewerViewModel：接收 MediaViewerContext；预加载窗口 [current-1, current+1]；调用 BigImageLoader.load；OnPageChanged 时 recycle 离屏、更新预加载、load 新邻页
  - **依赖**：T020、T021、T012
  - **设计引用**：plan.md:A3.1.2.2:时序图、A3.2.1:流程 1
  - **步骤**：
    - 1) Init(context) 计算预加载窗口
    - 2) load 当前页 + 邻页
    - 3) OnPageChanged 时 recycle、更新窗口、load 新邻页
  - **验证**：
    - [ ] ViewModel 单元测试或 UI 验证
  - **产物**：`viewer/PhotoViewerViewModel.kt`

- [ ] T023 [ST-002] 在 `feature-gallery/.../viewer/PhotoViewerScreen.kt` 中实现 PhotoViewerScreen：接收 MediaViewerContext；HorizontalPager + beyondViewportPageCount；共享元素过渡（Modifier.sharedElement，key="image-${item.id}" 与列表侧一致）；zoomable 缩放；展示当前页 Bitmap
  - **依赖**：T022
  - **设计引用**：plan.md:A3.2.1:流程 1、A1:进入过渡、疑难点 5 共享元素
  - **步骤**：
    - 1) HorizontalPager 展示 itemList
    - 2) 共享元素过渡 300–350ms，key 与 FEAT-001 列表侧一致
    - 3) zoomable modifier（如 foundation zoomable）
  - **验证**：
    - [ ] 进入大图自然过渡、无黑图（NFR-PERF-001）
  - **产物**：`viewer/PhotoViewerScreen.kt`

**检查点**：ST-002 完成，大图 UI 可用

---

## 阶段 3：Story ST-003 - 滑动切换、预加载、缩图轴（类型：Functional）

**目标**：滑动丝滑无黑图、缩图轴可用

**验证方式**：滑动流畅度测试；NFR-PERF-002

- [ ] T030 [ST-003] 在 PhotoViewerViewModel 中完善 OnPageChanged 预加载逻辑：离屏 recycle、邻页 load；确保 beyondViewportPageCount 与预加载窗口一致
  - **依赖**：T023
  - **设计引用**：plan.md:A3.2.1:流程 2、ST-003
  - **步骤**：
    - 1) 滑动时立即 recycle 离屏
    - 2) 加载新邻页
  - **验证**：
    - [ ] 滑动无黑图、无可见加载过程（NFR-PERF-002）
  - **产物**：`viewer/PhotoViewerViewModel.kt` 更新

- [ ] T031 [ST-003] 在 `feature-gallery/.../viewer/ThumbnailStrip.kt` 中实现 ThumbnailStrip：底部缩图轴、LazyRow + Coil 缩图；focusIndex 居中（scrollToItem）；点击切换当前页
  - **依赖**：T023
  - **设计引用**：plan.md:A3.1.2.1:ThumbnailStrip、FR-001
  - **步骤**：
    - 1) LazyRow 展示 itemList 缩图
    - 2) focusIndex 变化时 animateScrollToItem 使焦点居中
    - 3) 点击 item 触发 OnThumbClick，ViewModel 更新 currentIndex
  - **验证**：
    - [ ] 缩图轴焦点居中、点击切换可用
  - **产物**：`viewer/ThumbnailStrip.kt`

**检查点**：ST-003 完成，滑动与缩图轴可用

---

## 阶段 4：Story ST-004 - 视频、实况图与多格式支持（类型：Functional）

**目标**：视频、实况图、GIF 可播放/展示

**验证方式**：格式支持测试；NFR-REL-001

- [ ] T040 [ST-004] 在 `feature-gallery/.../viewer/VideoPlayerComponent.kt` 中实现 VideoPlayerComponent：ExoPlayer/Media3 播放视频；接收 uri、自动播放或点击播放
  - **依赖**：T023
  - **设计引用**：plan.md:A3.1.2.1:VideoPlayerComponent、A3.2.1:流程 3、FR-004
  - **步骤**：
    - 1) 添加 Media3 依赖
    - 2) 实现 VideoPlayerComponent Composable
    - 3) 支持 MP4、MOV、AVI、MKV、WebM、3GP、M4V
  - **验证**：
    - [ ] 视频可播放
  - **产物**：`viewer/VideoPlayerComponent.kt`

- [ ] T041 [ST-004] 在 PhotoViewerScreen 中按 MediaItem 类型分流：Image 静态图 → BigImageLoader；GIF → Coil 或 ImageDecoder 管线；Video → VideoPlayerComponent；LivePhoto → 首帧 BigImageLoader + 视频段 VideoPlayerComponent
  - **依赖**：T040、T023
  - **设计引用**：plan.md:A3.2.1:流程 3、FR-002、FR-003、FR-004
  - **步骤**：
    - 1) 根据 mimeType/类型选择展示组件
    - 2) 实况图：HEIC 首帧 + 视频段（videoUri 或 motionPhotoVideoOffset）
    - 3) 格式不支持时占位提示（NFR-REL-001）
  - **验证**：
    - [ ] 图片、GIF、视频、实况图可正确展示/播放
    - [ ] 异常文件有提示不崩溃
  - **产物**：`viewer/PhotoViewerScreen.kt` 更新

**检查点**：ST-004 完成，多格式支持可用

---

## 阶段 5：优化与跨领域关注点

**目标**：大图路由注册、返回与异常处理

- [ ] T050 在 app 或导航层注册 PhotoViewerScreen 路由，接收 MediaViewerContext 参数；列表/图集/搜索点击时导航至大图并传入 context
  - **依赖**：T023
  - **设计引用**：plan.md:B4.1:MediaViewerContext、FEAT-001 进入大图
  - **步骤**：
    - 1) 注册大图路由（如 photoViewer/{serializedContext} 或 NavBackStackEntry 传递）
    - 2) FEAT-001/002/003 点击时构建 MediaViewerContext 并 navigate
  - **验证**：
    - [ ] 从时间轴/图集/搜索均可进入大图
  - **产物**：导航配置、FEAT-001/002/003 导航调用更新

- [ ] T051 大图页返回按钮、系统返回键；文件损坏/格式不支持占位与提示
  - **依赖**：T041
  - **设计引用**：plan.md:NFR-REL-001、边界与异常场景
  - **步骤**：
    - 1) 返回按钮、BackHandler
    - 2) load 失败时展示占位或「格式不支持」提示
  - **验证**：
    - [ ] 返回可用；异常文件不崩溃
  - **产物**：`viewer/PhotoViewerScreen.kt` 更新

---

## 依赖关系与执行顺序

### 阶段依赖

- **阶段 0**：无依赖
- **阶段 1（ST-001）**：依赖 T001、FEAT-001
- **阶段 2（ST-002）**：依赖 ST-001
- **阶段 3（ST-003）**：依赖 ST-002
- **阶段 4（ST-004）**：依赖 ST-002（可与 ST-003 并行）
- **阶段 5**：依赖 ST-002、ST-003、ST-004

### Story 依赖

- **ST-001**：FEAT-001
- **ST-002**：ST-001
- **ST-003**：ST-002
- **ST-004**：ST-002（可与 ST-003 并行）

### 并行执行场景

- T010、T011 可并行（ST-001 内）
- T020、T021 可并行（ST-002 内）
- ST-003 与 ST-004 可并行（不同模块）

---

## 并行示例：Story ST-001

```text
可并行：T010 ImageDecoder.kt、T011 BigImageLoader.kt
```

## 并行示例：Story ST-002

```text
可并行：T020 PhotoViewerIntent.kt、T021 PhotoViewerUiState.kt
```

## 并行示例：ST-003 与 ST-004

```text
ST-002 完成后，ST-003（滑动+缩图轴）与 ST-004（视频/实况图）可并行开发
```

---

## 落地策略

### MVP 范围

1. ST-001：BigImageLoader 可用
2. ST-002：大图 UI、HorizontalPager、共享元素过渡
3. ST-003：滑动预加载、缩图轴

### 增量交付

1. ST-001 + ST-002 完成 → 静态图大图可浏览
2. ST-003 完成 → 滑动丝滑、缩图轴可用
3. ST-004 完成 → 视频、实况图、GIF 支持

---

## 备注

- 本 Feature 与 FEAT-001/002/003 共处 `:feature-gallery`，按 viewer 分包
- MediaViewerContext 由 FEAT-001 定义，列表/图集/搜索传入
- 共享元素 key 必须与 FEAT-001 列表侧一致：`"image-${item.id}"`
- BigImageLoader 可后续拆至 `:gallery-image-loader` 库供列表复用
