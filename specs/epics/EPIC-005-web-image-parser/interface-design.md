# 接口设计：EPIC-005 - Web 端图片数据解析器

> **定位**：模块间 TypeScript 契约（非 HTTP API）。与 [`tech-spec.md`](./tech-spec.md) 第二部分能力边界对齐。

**Epic**：EPIC-005  
**创建/更新日期**：2026-05-22

---

### 9.1 对外提供的接口

> 本 EPIC 无对外 HTTP/SDK；以下为 **apps/web-image-parser** 内部公共契约。

#### 9.1.1 接口清单

| 接口ID | 接口名称 | 类型 | 所属模块 | 消费方 |
|--------|----------|------|----------|--------|
| API-001 | ContentPresenter.present | 函数调用 | present | shell, format-* |
| API-002 | ParseOrchestrator.startParse | 函数调用 | shell | WorkbenchPage |
| API-003 | JpegParser.parse | Worker 消息 | format-jpeg | ParseWorker |
| API-004 | HeicParser.parse | Worker 消息 | format-heic | ParseWorker |
| API-005 | HeicEnvDetector.detect | 函数调用 | format-heic | shell |

#### 9.1.2 关键接口详述

##### API-001：ContentPresenter.present

- **消费方**：`WorkbenchPage`、`JpegTreeAdapter`、`HeicTreeAdapter`
- **签名**：`present(req: PresentRequest): Promise<PresentResult>`

**PresentRequest**：

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| segmentId | string | 是 | 会话内唯一 |
| sessionId | string | 是 | 绑定 ArrayBuffer |
| payloadKind | PayloadKind | 是 | image/video/audio/metadata/other/mixed |
| auxSubtype | AuxSubtype \| null | 否 | depth/hdrGain/alpha |
| contentRef | ContentRef \| null | 否 | byteRange 或 blobUrl |
| readablePayload | ReadablePayload \| null | 否 | 字段表/hex |

**PresentResult**：

| 字段 | 类型 | 说明 |
|------|------|------|
| status | 'success' \| 'failed' \| 'degraded' | |
| failureKind | PresentFailureKind \| null | PREVIEW_FAILED, PLAYBACK_FAILED, NO_CONTENT, PAYLOAD_TOO_LARGE, ENV_UNSUPPORTED |
| viewModel | PresentViewModel | UI 渲染 Discriminated Union |

- **错误**：不得抛未捕获异常；失败走 `status=failed`。
- **并发**：非幂等；以 `presentSeq` 丢弃过期异步结果。

##### API-002：ParseOrchestrator.startParse

- **签名**：`startParse(file: File): Promise<void>`
- **前置**：`IngestService.validate(file).ok===true`
- **副作用**：`disposeAll` 旧会话；`phase→parsing`
- **完成**：监听 `ParseWorkerBridge` 事件更新 phase 与 tree

##### API-003 / API-004：Worker 消息协议

**主线程 → Worker**：

```typescript
type WorkerInbound =
  | { type: 'PARSE_START'; sessionId: string; format: 'jpeg' | 'heic'; buffer: ArrayBuffer }
  | { type: 'PARSE_ABORT' };
```

**Worker → 主线程**：

```typescript
type WorkerOutbound =
  | { type: 'PARSE_PROGRESS'; percent: number }
  | { type: 'PARSE_DONE'; sessionId: string; status: ParseStatus; tree: SegmentTreeDto | null; failureType?: FailureType; message?: string };
```

**SegmentTreeDto**：

| 字段 | 类型 | 说明 |
|------|------|------|
| rootId | string | 根节点 |
| nodes | SegmentNodeDto[] | 扁平列表+parentId |
| warnings | string[] | 部分成功摘要 |

**SegmentNodeDto**：

| 字段 | 类型 |
|------|------|
| id, parentId, label, parCatalogId | string |
| offset, length | number |
| loadType | PayloadKind |
| warning | boolean |

### 9.2 依赖的外部接口

| 接口ID | 名称 | 提供方 | 用途 |
|--------|------|--------|------|
| EXT-001 | File API | 浏览器 | 读本地文件 |
| EXT-002 | Worker postMessage | 浏览器 | 后台解析 |
| EXT-003 | HTMLMediaElement | 浏览器 | 音视频播放 |
| EXT-004 | createImageBitmap | 浏览器 | 图片预览 |

### 9.3 版本与兼容

- 契约版本 `CONTRACT_VERSION = 1`；破坏性变更须同步更新 002/003 适配器并走 CR。
