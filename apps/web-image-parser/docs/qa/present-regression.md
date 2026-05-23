# 呈现路径回归记录（T040）

> 对照 `specs/epics/EPIC-005-web-image-parser/test-assets/manifest.md`  
> 更新：2026-05-22  
> 自动化：`npm run audit:jpeg`、`src/present/__tests__/presentPerf.test.ts`

## 验收摘要

| 负载类型 | 呈现策略 | 已验证样例 | 状态 |
|---------|---------|-----------|------|
| JPEG 主图 | `image` → ImagePreviewRenderer | S-JPEG-01 | ✅ |
| JPEG EXIF 可读 | `readable` → ReadableRenderer | S-JPEG-01 EXIF IFD | ✅ |
| JPEG MakerNote | `readable` | S-JPEG-11～17 | ✅ |
| JPEG 缩略图 | `image`（blobUrl） | S-JPEG-01（含缩略图时） | ✅ |
| JPEG ICC/元数据 | `readable` | S-JPEG-04 | ✅ |
| HEIC 主图 | `image`（全文件 byteRange） | S-HEIC-01 | ✅（环境 A/B） |
| HEIC ipma/iref | `readable` | S-HEIC-01 | ✅ |
| HEIC 视频轨 | `video` | — | 📥 待 S-HEIC-03/04 |
| HEIC 音频轨 | `audio` | — | 📥 待 S-HEIC-11 |
| HEIC Live Photo | `mixed` | — | 📥 待 S-HEIC-03 |
| 深度/HDR 辅助图 | `image` + auxSubtype | — | 📥 待 S-HEIC-16/17 |

## AC-001 图片负载进预览路径

已入库 JPEG/HEIC 样例中，凡 `loadType === 'image'` 的节点均经 `PresentStrategyRouter` 路由至 `image` 策略；Vitest 契约测试 `presentContract.test.ts` 覆盖空负载与策略解析。

## 已知限制（LIM）

- 无 MPO 样例（S-JPEG-06）→ MPF/MPO 混合呈现未 E2E 验收
- 无 Motion JPEG 样例（S-JPEG-08）→ 视频播放路径未验收
- HEIC 环境 C 级浏览器仅可读/metadata，预览降级为 readable 说明

## 执行命令

```bash
cd apps/web-image-parser
npm test
npm run audit:jpeg
npm run test:e2e
```
