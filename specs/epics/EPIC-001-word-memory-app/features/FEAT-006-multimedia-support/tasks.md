# Tasks：多媒体支持

**Epic**：EPIC-001 - 无痛记忆单词神器APP
**Feature ID**：FEAT-006
**Feature Version**：v0.1.0（来自 `spec.md`）
**Plan Version**：v0.1.0（来自 `plan.md`）
**Tasks Version**：v0.1.0
**输入**：来自 `Feature 目录/` 的设计文档（`spec.md`、`plan.md`）

> 规则：
> - Task 只能拆解与执行 Plan 的既定 Story；**禁止**在 tasks.md 里改写 Plan 的技术决策或新增未决策的方案。
> - 每个 Task 必须包含：执行步骤、依赖关系（顺序/并行）、验证方式（可执行/可量化）。

## Task 行格式（首行必须严格遵循）

```text
- [ ] T001 [P?] [ST-001] <带路径的任务标题>
```

- **复选框**：必须以 `- [ ]` 开头（完成后改为 `- [x]`）
- **任务 ID**：T001、T002…（全局递增）
- **[P]**：可并行执行（不改同一文件，且无依赖）
- **[ST-xxx]**：必须绑定到 Plan 中的 Story ID
- **路径**：必须写出影响的关键文件路径（真实路径）

### Task 详细信息（紧随首行的子项）

- **依赖**：T???（无则写"无"）
- **步骤**：
  - 1) …
  - 2) …
- **验证**：
  - [ ] 单元/集成/手动验证步骤（可执行）
  - [ ] 指标（如 p95、mAh、内存 MB）与阈值（如适用）
- **产物**：涉及的文件/文档/脚本

## 路径约定（按 plan.md 的结构决策为准）

- **移动端**：`app/src/main/java/com/jacky/verity/multimedia/`

## 阶段 0：准备（可选但建议）

**目标**：对齐版本、冻结设计输入，避免 Implement 期返工

- [ ] T001 在 `specs/epics/EPIC-001-word-memory-app/features/FEAT-006-multimedia-support/` 中核对 `spec.md`、`plan.md` 的 Version 字段一致性并补齐变更记录
  - **依赖**：无
  - **步骤**：
    - 1) 确认 `Feature Version`（v0.1.0）、`Plan Version`（v0.1.0）已填写
    - 2) 确认 Plan 的 Story Breakdown 已完成（ST-001 至 ST-007）
    - 3) 确认所有 FR/NFR 已映射到 Story
  - **验证**：
    - [ ] tasks.md 中 `Plan Version` 与 plan.md 一致（v0.1.0）
    - [ ] Story 列表完整（7 个 Story）
  - **产物**：`spec.md`、`plan.md`、`tasks.md`

---

## 阶段 1：环境搭建（共享基础设施）

**目标**：项目初始化与基础结构搭建

- [ ] T010 按照 plan.md 的"结构决策"创建项目目录结构（路径：`app/src/main/java/com/jacky/verity/multimedia/`）
  - **依赖**：T001
  - **步骤**：
    - 1) 创建 `ui/components/` 目录
    - 2) 创建 `viewmodel/` 目录
    - 3) 创建 `domain/usecase/` 目录
    - 4) 创建 `domain/model/` 目录
    - 5) 创建 `data/loader/` 目录
    - 6) 创建 `data/audio/` 目录
    - 7) 创建 `data/image/` 目录
    - 8) 创建 `data/text/` 目录
    - 9) 创建 `data/cache/` 目录
    - 10) 创建 `di/` 目录
  - **验证**：
    - [ ] 目录结构与 plan.md B7 一致
  - **产物**：相关目录

- [ ] T011 在 `app/build.gradle.kts` 中添加 Coil 图片加载库依赖
  - **依赖**：T010
  - **步骤**：
    - 1) 添加 Coil 依赖（`io.coil-kt:coil-compose:2.x.x`）
    - 2) 确认 Kotlin Coroutines 依赖已存在
    - 3) 确认 Jetpack Compose 依赖已存在
  - **验证**：
    - [ ] 基础构建可通过（`./gradlew build`）
    - [ ] Coil 库可正常导入
  - **产物**：`build.gradle.kts`

- [ ] T012 [P] 配置代码检查与格式化工具（路径：`.editorconfig`、`ktlint.yml`）
  - **依赖**：T011
  - **步骤**：
    - 1) 配置 Kotlin 代码格式化规则
    - 2) 配置代码检查规则（如 ktlint）
  - **验证**：
    - [ ] lint/format 命令可运行
  - **产物**：配置文件

---

## 阶段 2：核心基础（阻塞性前置条件，阻塞所有 Story）

**目标**：所有 Story 实现前必须完成的核心基础设施搭建

**⚠️ 关键**：此阶段完成前，任何 Story 相关工作均不可启动

- [ ] T020 在 `app/src/main/java/com/jacky/verity/multimedia/domain/model/` 中创建核心数据模型（ResourceType.kt、Resource.kt、ResourceError.kt）
  - **依赖**：T012
  - **步骤**：
    - 1) 创建 `ResourceType` sealed class（Audio、Image、Example、Phonetic）
    - 2) 创建 `Resource` sealed class（AudioResource、ImageResource、TextResource）
    - 3) 创建 `ResourceError` sealed class（FileNotFound、FormatError、LoadTimeout、CacheError）
    - 4) 创建 `MultimediaResource` data class（id、type、path、size、cached、cachedAt）
    - 5) 创建 `ResourceCache` data class（id、type、cachedPath、cachedAt、accessCount、size）
  - **验证**：
    - [ ] 数据模型与 plan.md B3 一致
    - [ ] 所有字段类型正确
    - [ ] Sealed Class 定义正确
  - **产物**：`ResourceType.kt`、`Resource.kt`、`ResourceError.kt`、`MultimediaResource.kt`、`ResourceCache.kt`

- [ ] T021 [P] 在 `app/src/main/java/com/jacky/verity/multimedia/di/` 中创建依赖注入模块（MultimediaModule.kt）
  - **依赖**：T020
  - **步骤**：
    - 1) 创建 MultimediaModule（使用 Hilt/Dagger/Koin）
    - 2) 提供 Context 实例（用于文件系统访问）
    - 3) 提供应用私有目录路径
    - 4) 提供缓存目录路径（`cache/multimedia/`）
  - **验证**：
    - [ ] 依赖注入配置正确
    - [ ] 所有依赖可正常注入
  - **产物**：`MultimediaModule.kt`

**检查点**：基础层就绪——数据模型、依赖注入已就绪，Story 实现可启动

---

## 阶段 3：Story ST-001 - 资源加载器基础框架（类型：Infrastructure）

**目标**：ResourceLoader 接口可用，支持资源类型识别和加载路由，错误处理完善

**验证方式（高层）**：
- ResourceLoader 接口可用，支持资源类型识别
- 错误处理完善（ResourceError 正确映射）
- 资源加载事件记录正常（符合 NFR-OBS-001）
- 降级策略执行时间 ≤ 200ms（符合 NFR-PERF-003）

### ST-001 任务

- [ ] T100 [P] [ST-001] 在 `app/src/main/java/com/jacky/verity/multimedia/data/loader/` 中创建 ResourceLoader 接口（ResourceLoader.kt）
  - **依赖**：T020
  - **步骤**：
    - 1) 定义 `ResourceLoader` 接口
    - 2) 定义 `loadResource(type: ResourceType, path: String?): Result<Resource>` 方法
    - 3) 定义 `preloadResources(resources: List<Pair<ResourceType, String?>>): Result<Unit>` 方法
    - 4) 定义 `clearCache(): Result<Unit>` 方法
    - 5) 定义 `getCacheSize(): Long` 方法
  - **验证**：
    - [ ] 接口定义与 plan.md B4.1 一致
    - [ ] 方法签名正确（suspend 函数）
  - **产物**：`ResourceLoader.kt`

- [ ] T101 [ST-001] 在 `app/src/main/java/com/jacky/verity/multimedia/data/loader/` 中实现 ResourceLoaderImpl（ResourceLoaderImpl.kt）
  - **依赖**：T100
  - **步骤**：
    - 1) 实现 `ResourceLoaderImpl` 类
    - 2) 实现资源类型识别和路由逻辑（根据 ResourceType 路由到对应的加载器）
    - 3) 实现错误处理（将底层异常转换为 ResourceError）
    - 4) 实现并发控制（使用 Semaphore 控制最多 5 个并发加载任务）
    - 5) 实现加载超时处理（超时时间 5 秒）
  - **验证**：
    - [ ] 资源类型识别正确
    - [ ] 加载路由正确（Audio → AudioPlayer、Image → ImageLoader、Text → TextRenderer）
    - [ ] 错误处理正确（异常转换为 ResourceError）
    - [ ] 并发控制正常（最多 5 个并发）
    - [ ] 超时处理正常（5 秒超时）
  - **产物**：`ResourceLoaderImpl.kt`

- [ ] T102 [ST-001] 在 `app/src/main/java/com/jacky/verity/multimedia/data/loader/` 中实现可观测性埋点（资源加载事件记录）
  - **依赖**：T101
  - **步骤**：
    - 1) 在 ResourceLoaderImpl 中记录资源加载成功事件（资源类型、文件大小、加载耗时、缓存命中情况）
    - 2) 在 ResourceLoaderImpl 中记录资源加载失败事件（资源类型、错误类型、文件路径）
    - 3) 使用结构化日志（如 Timber）
    - 4) 敏感信息脱敏（不记录文件完整路径）
  - **验证**：
    - [ ] 资源加载成功事件正确记录（符合 NFR-OBS-001）
    - [ ] 资源加载失败事件正确记录（符合 NFR-OBS-003）
    - [ ] 敏感信息已脱敏
  - **产物**：ResourceLoaderImpl 中的埋点代码

**检查点**：至此，ST-001 应具备完整功能且可独立测试——ResourceLoader 接口可用，支持资源类型识别和加载路由，错误处理完善

---

## 阶段 4：Story ST-002 - 音频播放功能（类型：Functional）

**目标**：用户能够播放单词发音（音频文件或 TTS），播放启动延迟 ≤ 500ms（p95），降级策略正常工作

**验证方式（高层）**：
- 能够播放音频文件（MediaPlayer）
- 能够播放 TTS（TextToSpeech）
- 播放启动延迟 ≤ 500ms（p95）（符合 NFR-PERF-001）
- 音频文件不存在时降级到 TTS（符合 FR-006、NFR-REL-003）
- TTS 初始化失败时静默跳过（符合 FR-006、NFR-REL-003）
- 音频播放事件记录正常（符合 NFR-OBS-002）
- 音频播放成功率 ≥ 98%（符合 NFR-REL-001）
- 音频播放功耗符合要求（符合 NFR-POWER-001）

### ST-002 任务

- [ ] T200 [P] [ST-002] 在 `app/src/main/java/com/jacky/verity/multimedia/data/audio/` 中创建 AudioPlayer 接口（AudioPlayer.kt）
  - **依赖**：T101
  - **步骤**：
    - 1) 定义 `AudioPlayer` 接口
    - 2) 定义 `playAudio(path: String?): Result<Unit>` 方法
    - 3) 定义 `playTTS(text: String): Result<Unit>` 方法
    - 4) 定义 `stopAudio()` 方法
    - 5) 定义 `isPlaying(): Boolean` 方法
  - **验证**：
    - [ ] 接口定义与 plan.md B4.1 一致
    - [ ] 方法签名正确（suspend 函数）
  - **产物**：`AudioPlayer.kt`

- [ ] T201 [ST-002] 在 `app/src/main/java/com/jacky/verity/multimedia/data/audio/` 中实现 AudioPlayerImpl（AudioPlayerImpl.kt）
  - **依赖**：T200
  - **步骤**：
    - 1) 实现 `AudioPlayerImpl` 类
    - 2) 实现 MediaPlayer 音频播放（播放音频文件）
    - 3) 实现 TextToSpeech TTS 播放（文本转语音）
    - 4) 实现播放控制（播放/停止）
    - 5) 实现播放状态管理（isPlaying）
    - 6) 实现播放启动延迟优化（预加载、异步初始化）
    - 7) 实现音频文件不存在时的降级逻辑（降级到 TTS）
    - 8) 实现 TTS 初始化失败时的降级逻辑（静默跳过）
  - **验证**：
    - [ ] 能够播放音频文件（MediaPlayer）
    - [ ] 能够播放 TTS（TextToSpeech）
    - [ ] 播放启动延迟 ≤ 500ms（p95）（符合 NFR-PERF-001）
    - [ ] 音频文件不存在时降级到 TTS（符合 FR-006）
    - [ ] TTS 初始化失败时静默跳过（符合 FR-006）
    - [ ] 播放控制正常（播放/停止）
    - [ ] 播放状态管理正常
  - **产物**：`AudioPlayerImpl.kt`

- [ ] T202 [ST-002] 在 `app/src/main/java/com/jacky/verity/multimedia/data/audio/` 中实现可观测性埋点（音频播放事件记录）
  - **依赖**：T201
  - **步骤**：
    - 1) 在 AudioPlayerImpl 中记录音频播放成功事件（播放时长、是否使用 TTS）
    - 2) 在 AudioPlayerImpl 中记录音频播放失败事件（错误类型、是否尝试 TTS）
    - 3) 在 AudioPlayerImpl 中记录 TTS 使用事件（TTS 使用情况）
    - 4) 使用结构化日志（如 Timber）
  - **验证**：
    - [ ] 音频播放成功事件正确记录（符合 NFR-OBS-002）
    - [ ] 音频播放失败事件正确记录（符合 NFR-OBS-002）
    - [ ] TTS 使用事件正确记录（符合 NFR-OBS-002）
  - **产物**：AudioPlayerImpl 中的埋点代码

- [ ] T203 [ST-002] 在 `app/src/main/java/com/jacky/verity/multimedia/domain/usecase/` 中实现 PlayAudioUseCase（PlayAudioUseCase.kt）
  - **依赖**：T201
  - **步骤**：
    - 1) 创建 `PlayAudioUseCase` 类
    - 2) 实现业务逻辑（调用 AudioPlayer，处理错误）
    - 3) 实现降级策略（音频文件不存在 → TTS，TTS 失败 → 静默跳过）
  - **验证**：
    - [ ] UseCase 逻辑正确
    - [ ] 错误处理正确（Result<T>）
    - [ ] 降级策略正确
  - **产物**：`PlayAudioUseCase.kt`

- [ ] T204 [ST-002] 在 `app/src/main/java/com/jacky/verity/multimedia/ui/components/` 中实现 AudioPlayerButton 组件（AudioPlayerButton.kt）
  - **依赖**：T203
  - **步骤**：
    - 1) 创建 `AudioPlayerButton` Compose 函数
    - 2) 实现播放按钮 UI
    - 3) 实现播放状态显示（播放中、已停止）
    - 4) 实现点击事件处理（调用 UseCase）
    - 5) 实现错误提示显示
  - **验证**：
    - [ ] 播放按钮 UI 正常
    - [ ] 播放状态显示正常
    - [ ] 点击事件处理正常
    - [ ] 错误提示清晰
    - [ ] UI 符合 Material Design 规范
  - **产物**：`AudioPlayerButton.kt`

**检查点**：至此，ST-002 应具备完整功能且可独立测试——用户能够播放单词发音（音频文件或 TTS），播放启动延迟符合要求，降级策略正常工作

---

## 阶段 5：Story ST-003 - 图片加载功能（类型：Functional）

**目标**：用户能够看到单词相关图片，图片加载时间 ≤ 1 秒（p95），加载失败时显示占位图

**验证方式（高层）**：
- 能够加载和显示图片（Coil）
- 图片加载时间 ≤ 1 秒（p95）（符合 NFR-PERF-001）
- 图片加载失败时显示占位图（符合 FR-007、NFR-REL-003）
- 图片内存占用符合要求（符合 NFR-MEM-001）
- 图片加载事件记录正常（符合 NFR-OBS-001）
- 图片加载成功率 ≥ 95%（符合 NFR-REL-001）

### ST-003 任务

- [ ] T300 [P] [ST-003] 在 `app/src/main/java/com/jacky/verity/multimedia/data/image/` 中创建 ImageLoader 接口（ImageLoader.kt）
  - **依赖**：T101
  - **步骤**：
    - 1) 定义 `ImageLoader` 接口
    - 2) 定义 `loadImage(path: String): Result<ImageBitmap>` 方法
    - 3) 定义 `loadImageWithPlaceholder(path: String, placeholder: ImageBitmap?): Result<ImageBitmap>` 方法
  - **验证**：
    - [ ] 接口定义与 plan.md B4.1 一致
    - [ ] 方法签名正确（suspend 函数）
  - **产物**：`ImageLoader.kt`

- [ ] T301 [ST-003] 在 `app/src/main/java/com/jacky/verity/multimedia/data/image/` 中实现 ImageLoaderImpl（ImageLoaderImpl.kt）
  - **依赖**：T300
  - **步骤**：
    - 1) 实现 `ImageLoaderImpl` 类
    - 2) 使用 Coil 库加载图片（异步加载）
    - 3) 实现图片加载超时处理（超时时间 5 秒）
    - 4) 实现图片加载失败时的降级逻辑（返回占位图）
    - 5) 实现图片内存管理（Coil 自动管理，确保及时释放）
  - **验证**：
    - [ ] 能够加载和显示图片（Coil）
    - [ ] 图片加载时间 ≤ 1 秒（p95）（符合 NFR-PERF-001）
    - [ ] 图片加载失败时返回占位图（符合 FR-007）
    - [ ] 图片内存占用符合要求（符合 NFR-MEM-001）
    - [ ] 图片加载完成后及时释放临时内存（符合 NFR-MEM-002）
  - **产物**：`ImageLoaderImpl.kt`

- [ ] T302 [ST-003] 在 `app/src/main/java/com/jacky/verity/multimedia/data/image/` 中实现可观测性埋点（图片加载事件记录）
  - **依赖**：T301
  - **步骤**：
    - 1) 在 ImageLoaderImpl 中记录图片加载成功事件（文件大小、加载耗时、缓存命中情况）
    - 2) 在 ImageLoaderImpl 中记录图片加载失败事件（错误类型、文件路径）
    - 3) 使用结构化日志（如 Timber）
    - 4) 敏感信息脱敏（不记录文件完整路径）
  - **验证**：
    - [ ] 图片加载成功事件正确记录（符合 NFR-OBS-001）
    - [ ] 图片加载失败事件正确记录（符合 NFR-OBS-003）
    - [ ] 敏感信息已脱敏
  - **产物**：ImageLoaderImpl 中的埋点代码

- [ ] T303 [ST-003] 在 `app/src/main/java/com/jacky/verity/multimedia/ui/components/` 中实现 ImageView 组件（ImageView.kt）
  - **依赖**：T301
  - **步骤**：
    - 1) 创建 `ImageView` Compose 函数
    - 2) 实现图片展示 UI（使用 Coil 的 AsyncImage）
    - 3) 实现占位图显示（加载中、加载失败）
    - 4) 实现错误提示显示
  - **验证**：
    - [ ] 图片展示 UI 正常
    - [ ] 占位图显示正常（加载中、加载失败）
    - [ ] 错误提示清晰
    - [ ] UI 符合 Material Design 规范
  - **产物**：`ImageView.kt`

**检查点**：至此，ST-003 应具备完整功能且可独立测试——用户能够看到单词相关图片，图片加载时间符合要求，加载失败时显示占位图

---

## 阶段 6：Story ST-004 - 文本渲染功能（类型：Functional）

**目标**：用户能够看到单词例句和音标，文本渲染时间 ≤ 100ms（p95），格式正确清晰

**验证方式（高层）**：
- 能够显示例句（多行文本、换行、标点）
- 能够显示音标（IPA 格式）
- 文本渲染时间 ≤ 100ms（p95）（符合 NFR-PERF-001）
- 格式正确清晰

### ST-004 任务

- [ ] T400 [P] [ST-004] 在 `app/src/main/java/com/jacky/verity/multimedia/data/text/` 中创建 TextRenderer 接口（TextRenderer.kt）
  - **依赖**：T101
  - **步骤**：
    - 1) 定义 `TextRenderer` 接口
    - 2) 定义 `renderText(text: String, format: TextFormat?): FormattedText` 方法
    - 3) 定义文本格式化逻辑（换行、标点处理）
  - **验证**：
    - [ ] 接口定义正确
    - [ ] 方法签名正确
  - **产物**：`TextRenderer.kt`

- [ ] T401 [ST-004] 在 `app/src/main/java/com/jacky/verity/multimedia/data/text/` 中实现 TextRendererImpl（TextRendererImpl.kt）
  - **依赖**：T400
  - **步骤**：
    - 1) 实现 `TextRendererImpl` 类
    - 2) 实现文本格式化（多行文本、换行、标点处理）
    - 3) 实现音标格式化（IPA 格式显示）
    - 4) 实现文本渲染优化（快速渲染，避免阻塞主线程）
  - **验证**：
    - [ ] 能够显示例句（多行文本、换行、标点）
    - [ ] 能够显示音标（IPA 格式）
    - [ ] 文本渲染时间 ≤ 100ms（p95）（符合 NFR-PERF-001）
    - [ ] 格式正确清晰
  - **产物**：`TextRendererImpl.kt`

- [ ] T402 [ST-004] 在 `app/src/main/java/com/jacky/verity/multimedia/ui/components/` 中实现 TextDisplay 组件（TextDisplay.kt）
  - **依赖**：T401
  - **步骤**：
    - 1) 创建 `TextDisplay` Compose 函数
    - 2) 实现文本展示 UI（支持多行文本）
    - 3) 实现音标展示 UI（IPA 格式）
    - 4) 实现文本样式（字体、颜色、间距）
  - **验证**：
    - [ ] 文本展示 UI 正常
    - [ ] 音标展示 UI 正常
    - [ ] 文本样式正确
    - [ ] UI 符合 Material Design 规范
  - **产物**：`TextDisplay.kt`

**检查点**：至此，ST-004 应具备完整功能且可独立测试——用户能够看到单词例句和音标，文本渲染时间符合要求，格式正确清晰

---

## 阶段 7：Story ST-005 - 资源缓存管理（类型：Infrastructure）

**目标**：资源缓存正常工作，缓存命中率 ≥ 70%，缓存查询时间 ≤ 50ms（p95），内存占用 ≤ 50MB

**验证方式（高层）**：
- 缓存正常工作（内存缓存 + 磁盘缓存）
- 缓存命中率 ≥ 70%（符合 NFR-PERF-002）
- 缓存查询时间 ≤ 50ms（p95）（符合 NFR-PERF-002）
- 内存占用 ≤ 50MB（符合 NFR-MEM-001）
- 缓存数据持久化正常（符合 NFR-REL-002）
- 缓存生命周期正常（应用退出时清理内存缓存，磁盘缓存保留）（符合 NFR-MEM-003）

### ST-005 任务

- [ ] T500 [P] [ST-005] 在 `app/src/main/java/com/jacky/verity/multimedia/data/cache/` 中创建 CacheManager 接口（CacheManager.kt）
  - **依赖**：T101
  - **步骤**：
    - 1) 定义 `CacheManager` 接口
    - 2) 定义 `getCached(id: String): Resource?` 方法
    - 3) 定义 `cache(id: String, resource: Resource): Result<Unit>` 方法
    - 4) 定义 `clearCache(): Result<Unit>` 方法
    - 5) 定义 `getCacheSize(): Long` 方法
  - **验证**：
    - [ ] 接口定义与 plan.md B4.1 一致
    - [ ] 方法签名正确（suspend 函数）
  - **产物**：`CacheManager.kt`

- [ ] T501 [ST-005] 在 `app/src/main/java/com/jacky/verity/multimedia/data/cache/` 中实现 MemoryCache（MemoryCache.kt）
  - **依赖**：T500
  - **步骤**：
    - 1) 实现 `MemoryCache` 类（使用 LruCache）
    - 2) 实现 LRU 淘汰策略（容量 50MB）
    - 3) 实现缓存查询（getCached）
    - 4) 实现缓存写入（cache）
    - 5) 实现缓存清理（clearCache）
  - **验证**：
    - [ ] 内存缓存正常工作（LRU 策略）
    - [ ] 内存占用 ≤ 50MB（符合 NFR-MEM-001）
    - [ ] LRU 淘汰策略正常（容量满时淘汰最久未使用的资源）
    - [ ] 缓存查询时间 ≤ 50ms（p95）（符合 NFR-PERF-002）
  - **产物**：`MemoryCache.kt`

- [ ] T502 [ST-005] 在 `app/src/main/java/com/jacky/verity/multimedia/data/cache/` 中实现 DiskCache（DiskCache.kt）
  - **依赖**：T500
  - **步骤**：
    - 1) 实现 `DiskCache` 类
    - 2) 实现缓存文件存储（应用私有目录 `cache/multimedia/`）
    - 3) 实现缓存元数据管理（`cache/multimedia/metadata.json`）
    - 4) 实现缓存查询（getCached）
    - 5) 实现缓存写入（cache）
    - 6) 实现缓存清理（清理最久未访问的缓存文件，总大小 ≤ 100MB）
  - **验证**：
    - [ ] 磁盘缓存正常工作
    - [ ] 缓存文件存储在应用私有目录（符合 NFR-SEC-001）
    - [ ] 缓存总大小 ≤ 100MB
    - [ ] 缓存清理策略正常（清理最久未访问的缓存文件）
    - [ ] 缓存数据持久化正常（符合 NFR-REL-002）
  - **产物**：`DiskCache.kt`

- [ ] T503 [ST-005] 在 `app/src/main/java/com/jacky/verity/multimedia/data/cache/` 中实现 CacheManagerImpl（CacheManagerImpl.kt）
  - **依赖**：T501、T502
  - **步骤**：
    - 1) 实现 `CacheManagerImpl` 类
    - 2) 实现两级缓存协调（先查内存缓存，再查磁盘缓存）
    - 3) 实现缓存写入（同时写入内存缓存和磁盘缓存）
    - 4) 实现缓存清理（清理内存缓存和磁盘缓存）
    - 5) 实现缓存大小计算（getCacheSize）
    - 6) 实现缓存生命周期管理（应用退出时清理内存缓存，磁盘缓存保留）
  - **验证**：
    - [ ] 两级缓存协调正常（先查内存，再查磁盘）
    - [ ] 缓存命中率 ≥ 70%（符合 NFR-PERF-002）
    - [ ] 缓存查询时间 ≤ 50ms（p95）（符合 NFR-PERF-002）
    - [ ] 缓存数据持久化正常（符合 NFR-REL-002）
    - [ ] 缓存生命周期正常（应用退出时清理内存缓存，磁盘缓存保留）（符合 NFR-MEM-003）
  - **产物**：`CacheManagerImpl.kt`

- [ ] T504 [ST-005] 在 `app/src/main/java/com/jacky/verity/multimedia/data/loader/` 中集成缓存管理到 ResourceLoaderImpl
  - **依赖**：T503、T101
  - **步骤**：
    - 1) 在 ResourceLoaderImpl 中集成 CacheManager
    - 2) 实现加载前查询缓存逻辑
    - 3) 实现加载后缓存资源逻辑
    - 4) 实现缓存命中事件记录
  - **验证**：
    - [ ] 加载前查询缓存正常
    - [ ] 加载后缓存资源正常
    - [ ] 缓存命中事件记录正常
  - **产物**：ResourceLoaderImpl 中的缓存集成代码

**检查点**：至此，ST-005 应具备完整功能且可独立测试——资源缓存正常工作，缓存命中率和查询时间符合要求，内存占用符合要求

---

## 阶段 8：Story ST-006 - 资源预加载功能（类型：Optimization）

**目标**：资源预加载功能正常工作，预加载不影响用户操作，预加载资源在用户查看时已就绪

**验证方式（高层）**：
- 资源预加载功能正常工作
- 预加载资源在用户查看时已就绪
- 预加载不影响用户操作
- 预加载不消耗过多电池（符合 NFR-POWER-002）

### ST-006 任务

- [ ] T600 [ST-006] 在 `app/src/main/java/com/jacky/verity/multimedia/domain/usecase/` 中实现 PreloadResourcesUseCase（PreloadResourcesUseCase.kt）
  - **依赖**：T101、T201、T301、T401、T503
  - **步骤**：
    - 1) 创建 `PreloadResourcesUseCase` 类
    - 2) 实现预加载逻辑（批量加载资源，最多 5 个并发）
    - 3) 实现预加载时机判断（用户空闲时）
    - 4) 实现预加载队列管理（避免重复预加载）
  - **验证**：
    - [ ] 预加载逻辑正确
    - [ ] 预加载时机判断正确（用户空闲时）
    - [ ] 预加载队列管理正常（避免重复预加载）
  - **产物**：`PreloadResourcesUseCase.kt`

- [ ] T601 [ST-006] 在 `app/src/main/java/com/jacky/verity/multimedia/data/loader/` 中实现预加载功能到 ResourceLoaderImpl
  - **依赖**：T600
  - **步骤**：
    - 1) 在 ResourceLoaderImpl 中实现 `preloadResources` 方法
    - 2) 实现预加载任务管理（队列化、并发控制）
    - 3) 实现预加载取消逻辑（用户操作时取消预加载）
  - **验证**：
    - [ ] 预加载功能正常工作
    - [ ] 预加载资源在用户查看时已就绪
    - [ ] 预加载不影响用户操作（可取消）
    - [ ] 预加载不消耗过多电池（符合 NFR-POWER-002）
  - **产物**：ResourceLoaderImpl 中的预加载功能代码

**检查点**：至此，ST-006 应具备完整功能且可独立测试——资源预加载功能正常工作，预加载不影响用户操作，预加载资源在用户查看时已就绪

---

## 阶段 9：Story ST-007 - 错误处理和异常场景（类型：Infrastructure）

**目标**：所有异常场景都有明确的错误处理和降级策略，用户能够理解错误原因，功能可用性得到保障

**验证方式（高层）**：
- 所有异常场景都有明确的错误处理和降级策略
- 降级策略执行时间 ≤ 200ms（符合 NFR-PERF-003）
- 降级方案执行成功率 100%（符合 NFR-REL-003）
- 错误日志记录完善（符合 NFR-OBS-003）

### ST-007 任务

- [ ] T700 [ST-007] 在 `app/src/main/java/com/jacky/verity/multimedia/data/loader/` 中完善 ResourceLoaderImpl 的错误处理
  - **依赖**：T101、T201、T301、T401、T503
  - **步骤**：
    - 1) 完善所有异常场景的错误处理（文件不存在、格式不支持、加载超时、缓存失败等）
    - 2) 实现降级策略（音频文件不存在 → TTS，图片加载失败 → 占位图，文本加载失败 → 空文本）
    - 3) 实现降级策略执行时间优化（≤ 200ms）
    - 4) 实现错误提示生成（用户友好的错误信息）
  - **验证**：
    - [ ] 所有异常场景都有明确的错误处理
    - [ ] 降级策略执行时间 ≤ 200ms（符合 NFR-PERF-003）
    - [ ] 降级方案执行成功率 100%（符合 NFR-REL-003）
    - [ ] 错误提示用户友好
  - **产物**：ResourceLoaderImpl 中的错误处理代码

- [ ] T701 [ST-007] 在 `app/src/main/java/com/jacky/verity/multimedia/data/` 中完善错误日志记录
  - **依赖**：T700
  - **步骤**：
    - 1) 在所有加载器中记录错误日志（错误类型、文件路径、错误详情）
    - 2) 使用结构化日志（如 Timber）
    - 3) 敏感信息脱敏（不记录文件完整路径）
  - **验证**：
    - [ ] 错误日志记录完善（符合 NFR-OBS-003）
    - [ ] 错误日志便于问题排查
    - [ ] 敏感信息已脱敏
  - **产物**：所有加载器中的错误日志记录代码

- [ ] T702 [ST-007] 在 `app/src/main/java/com/jacky/verity/multimedia/ui/components/` 中完善 UI 组件的错误处理
  - **依赖**：T700
  - **步骤**：
    - 1) 在 AudioPlayerButton 中完善错误提示显示
    - 2) 在 ImageView 中完善错误提示显示
    - 3) 在 TextDisplay 中完善错误提示显示
    - 4) 确保错误提示不影响其他内容展示
  - **验证**：
    - [ ] UI 组件的错误提示清晰
    - [ ] 错误提示不影响其他内容展示
    - [ ] UI 符合 Material Design 规范
  - **产物**：UI 组件中的错误处理代码

**检查点**：至此，ST-007 应具备完整功能且可独立测试——所有异常场景都有明确的错误处理和降级策略，降级策略执行时间符合要求，错误日志记录完善

---

## 依赖关系与执行顺序

### 阶段依赖

- **环境搭建（阶段 1）**：无依赖——可立即启动
- **核心基础（阶段 2）**：依赖环境搭建完成——阻塞所有 Story
- **Story（阶段 3+）**：均依赖核心基础阶段完成
    - ST-001：无依赖（基础设施 Story）
    - ST-002、ST-003、ST-004、ST-005：依赖 ST-001 完成
    - ST-006：依赖 ST-001、ST-002、ST-003、ST-004、ST-005 完成
    - ST-007：依赖 ST-001、ST-002、ST-003、ST-004、ST-005 完成
    - 完成后，部分 Story 可并行推进（ST-002、ST-003、ST-004、ST-005 可并行）
- **优化完善（ST-006、ST-007）**：依赖所有功能 Story 完成

### Story 依赖

- **ST-001**：依赖阶段 2 完成
- **ST-002**：依赖 ST-001 完成
- **ST-003**：依赖 ST-001 完成
- **ST-004**：依赖 ST-001 完成
- **ST-005**：依赖 ST-001 完成
- **ST-006**：依赖 ST-001、ST-002、ST-003、ST-004、ST-005 完成
- **ST-007**：依赖 ST-001、ST-002、ST-003、ST-004、ST-005 完成

### 单 Story 内部顺序

- 接口定义先于实现
- 核心功能实现先于集成
- 可观测性埋点在功能实现后添加
- UI 组件在 UseCase 实现后添加
- 本 Story 完成后，再推进下一 Story

### 并行执行场景

- 所有标记 [P] 的环境搭建任务可并行
- 所有标记 [P] 的核心基础任务可并行（阶段 2 内）
- 核心基础阶段完成后，ST-001 可启动
- ST-001 完成后，ST-002、ST-003、ST-004、ST-005 可并行启动（如团队容量允许）
- 单 Story 下所有标记 [P] 的任务可并行
- 不同团队成员可并行开发不同 Story

---

## 并行示例：Story ST-001

```bash
# 批量启动 ST-001 的可并行任务：
任务："T100 [P] [ST-001] 在 app/src/main/java/com/jacky/verity/multimedia/data/loader/ 中创建 ResourceLoader 接口"
任务："T102 [P] [ST-001] 在 app/src/main/java/com/jacky/verity/multimedia/data/loader/ 中实现可观测性埋点"
```

## 并行示例：Story ST-002、ST-003、ST-004、ST-005

```bash
# ST-001 完成后，可并行启动以下 Story：
任务："ST-002：音频播放功能"（T200-T204）
任务："ST-003：图片加载功能"（T300-T303）
任务："ST-004：文本渲染功能"（T400-T402）
任务："ST-005：资源缓存管理"（T500-T504）
```

---

## 落地策略

### 先完成 MVP（优先完成关键 Story 集合）

1. 完成阶段 1：环境搭建
2. 完成阶段 2：核心基础（关键——阻塞所有 Story）
3. 完成阶段 3：Story ST-001（资源加载器基础框架）
4. 完成阶段 4：Story ST-002（音频播放功能）
5. 完成阶段 5：Story ST-003（图片加载功能）
6. **暂停并验证**：独立验证 ST-001、ST-002、ST-003
7. 如就绪，进行部署/演示

### 增量交付

1. 完成环境搭建 + 核心基础 → 基础层就绪
2. 新增 ST-001 → 独立验证 → 部署/演示（基础能力就绪）
3. 新增 ST-002 → 独立验证 → 部署/演示（音频播放就绪）
4. 新增 ST-003 → 独立验证 → 部署/演示（图片加载就绪）
5. 新增 ST-004 → 独立验证 → 部署/演示（文本渲染就绪）
6. 新增 ST-005 → 独立验证 → 部署/演示（缓存管理就绪）
7. 新增 ST-006 → 独立验证 → 部署/演示（预加载优化就绪）
8. 新增 ST-007 → 独立验证 → 部署/演示（错误处理完善就绪）
9. 每个 Story 均需在不破坏已有 Story 的前提下新增价值

### 团队并行策略

多开发者协作场景：

1. 团队共同完成环境搭建 + 核心基础
2. 核心基础完成后：
    - 开发者 A：负责 ST-001（资源加载器基础框架）
3. ST-001 完成后：
    - 开发者 A：负责 ST-002（音频播放功能）
    - 开发者 B：负责 ST-003（图片加载功能）
    - 开发者 C：负责 ST-004（文本渲染功能）
    - 开发者 D：负责 ST-005（资源缓存管理）
4. ST-002、ST-003、ST-004、ST-005 完成后：
    - 开发者 A：负责 ST-006（资源预加载功能）
    - 开发者 B：负责 ST-007（错误处理和异常场景）
5. 各 Story 独立完成并集成

---

## 备注

- [P] 标记的任务 = 涉及不同文件，无依赖关系
- [ST-xxx] 标签将任务关联至 Plan 的 Story，便于追溯
- 每个 Story 需可独立完成、独立验证
- 实现前验证测试用例执行失败（如适用）
- 完成单个任务或逻辑分组后提交代码
- 可在任意检查点暂停，独立验证对应 Story
- 避免：模糊的任务描述、同一文件冲突、破坏独立性的跨 Story 依赖

## 任务统计

- **总任务数**：42 个任务
- **Story 任务分布**：
  - ST-001：3 个任务
  - ST-002：5 个任务
  - ST-003：4 个任务
  - ST-004：3 个任务
  - ST-005：5 个任务
  - ST-006：2 个任务
  - ST-007：3 个任务
- **可并行任务**：标记 [P] 的任务可在同一 Story 内并行执行
- **建议 MVP 范围**：ST-001、ST-002、ST-003（基础能力 + 音频播放 + 图片加载）
