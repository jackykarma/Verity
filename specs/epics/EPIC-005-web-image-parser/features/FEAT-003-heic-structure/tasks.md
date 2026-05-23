# Tasks：HEIC 分区解析与浏览

**Epic**：EPIC-005 - Web 端图片数据解析器  
**Feature ID**：FEAT-003  
**Feature Version**：v0.3.0  
**Plan Version**：v0.1.0  
**Tasks Version**：v0.1.0  
**输入**：`spec.md` §解析内容目录、`tech-spec.md` FEAT-003、`epic-design.md` §十二、`l2_design/ST-301_heic_container_tree.md`、`KD_005_heic_structure.md`

---

## FR/NFR → Story → Task 追溯矩阵

| FR/NFR | Story | Task |
|--------|-------|------|
| FR-001, FR-002, FR-006, FR-011, FR-015 | ST-301 | T310～T318 |
| FR-004, FR-009, FR-012, FR-013, FR-014 | ST-302 | T320～T327 |
| FR-005, FR-007, FR-008 | ST-303 | T330～T336 |
| FR-003 | ST-301, ST-302 | T315, T320 |
| NFR-PERF-001 | ST-301 | T317 |
| NFR-PERF-002 | ST-303 | T333 |
| NFR-REL-001 | ST-301, ST-303 | T317, T335 |
| NFR-OBS-001 | ST-303 | T336 |

---

## 阶段 0：准备

- [x] T001 确认 `spec.md` v0.3.0、ENV-HEIC-A/B/C 与 `test-assets/heic/` 状态
  - **依赖**：无
  - **验证**：[ ] 待手动样例（Live Photo/深度/音轨）在 manifest 已标注
  - **产物**：—

---

## 阶段 1：环境前提

- [x] T005 确认 ST-103、ST-401、ST-402 已就绪
  - **依赖**：T001
  - **外部**：FEAT-001、FEAT-004
  - **产物**：—

---

## 阶段 2：核心基础

- [x] T020 [ST-301] 创建 `src/format-heic/` 与 `HeicParser` 接口
  - **依赖**：T005
  - **设计引用**：`KD_005_heic_structure.md`
  - **产物**：`src/format-heic/HeicParser.ts`

---

## 阶段 3：Story ST-301 - BMFF 容器树与 meta 子树

- [x] T310 [ST-301] BMFF 解析集成（mp4box.js 或等价）`BmffReader.ts`
- [x] T311 [ST-301] ftyp/mdat/idat 顶层节点（PAR-HEIC-001/011）
- [x] T312 [ST-301] meta 子树展开 hdlr/pitm/iinf/iloc/iprp/ipco（FR-011）
- [x] T314 [P] [ST-301] PAR-HEIC-099 未知 box
- [x] T315 [ST-301] 主图/缩略图项识别（PAR-HEIC-101/102）
- [x] T317 [ST-301] Worker `heicParse.ts` + ≤20MB P95≤10s / ≤200MB

- [x] T313 [P] [ST-301] ipma/iref/grpl P1 节点
- [x] T316 [ST-301] 截断 mdat 部分成功
- [x] T318 [P] [ST-301] UI `HeicSegmentTree.tsx`

---

## 阶段 4：Story ST-302 - Live Photo / 音视频轨 / 辅助图

- [x] T320 [ST-302] 视频/音频轨分列节点（FR-015、PAR-HEIC-301/305）
  - **依赖**：T318
  - **设计引用**：`spec.md` FR-015
  - **验证**：[ ] 不得合并为单一「媒体」节点
  - **产物**：`TrackCatalog.ts`

- [x] T321 [ST-302] Live Photo iref 关联展示（PAR-HEIC-302、C02）
  - **依赖**：T313, T320
  - **验证**：[ ] S-HEIC-03（待样例）主图+视频可辨
  - **产物**：`LivePhotoLinker.ts`

- [x] T322 [ST-302] 音频负载上报→FEAT-004 播放（FR-012）
  - **依赖**：T320；**外部**：ST-402 AudioRenderer
  - **验证**：[ ] AC-008
  - **产物**：`AudioTrackPresenter.ts`

- [x] T323 [P] [ST-302] 深度图/HDR 增益预览引用（FR-013、PAR-HEIC-110/111/113）
  - **依赖**：T315
  - **验证**：[ ] AC-009
  - **产物**：`AuxImageCatalog.ts`

- [x] T324 [ST-302] Exif 项字段级（FR-014，对齐 FEAT-002）
  - **依赖**：T312
  - **验证**：[ ] AC-010
  - **产物**：`HeicExifExtractor.ts`

- [x] T325 [P] [ST-302] XMP/IPTC P1（PAR-HEIC-203/204）
  - **依赖**：T312
  - **产物**：`MetadataItemExtractor.ts`

- [x] T326 [ST-302] 视频轨播放 wiring（FR-004）
  - **依赖**：T320, T321
  - **验证**：[ ] 起播≥3s 或 PLAYBACK_FAILED
  - **产物**：`HeicDetailPane.tsx`

- [x] T327 [P] [ST-302] 网格/旋转属性 ispe/irot/clap（PAR-HEIC-103/109）
  - **依赖**：T315
  - **产物**：`GridItemHandler.ts`

---

## 阶段 5：Story ST-303 - 环境检测与 HEIC 联调

- [x] T330 [ST-303] `HeicEnvDetector.ts`（ENV-HEIC-A/B/C）
  - **依赖**：T317
  - **设计引用**：`spec.md` FR-005、§浏览器支持环境
  - **验证**：[ ] SC-007 非支持环境说明
  - **产物**：`HeicEnvDetector.ts`

- [x] T331 [ST-303] 与 FEAT-001 `FormatSlot` 集成 HEIC 视图
  - **依赖**：T318, T330
  - **验证**：[ ] HEIC 文件激活 heic 槽
  - **产物**：`HeicWorkbenchView.tsx`

- [x] T332 [ST-303] 选中→呈现全链路（对齐 JPEG FR-008）
  - **依赖**：T326, T331
  - **验证**：[ ] SC-013 体验检查表
  - **产物**：—

- [x] T333 [ST-303] NFR-PERF-002 选中≤500ms
  - **依赖**：T332
  - **产物**：—

- [x] T334 [ST-303] E2E HEIC（E2E-002/006）`test-assets/heic/S-HEIC-01_*`
  - **依赖**：T332
  - **产物**：`e2e/heic-happy-path.spec.ts`

- [x] T335 [ST-303] 不支持环境与损坏区分（NFR-OBS-001）
  - **依赖**：T330, T316
  - **产物**：—

- [x] T336 [P] [ST-303] Beta 样例补齐后回归（S-HEIC-03/11/16 待手动）
  - **依赖**：T334
  - **验证**：[ ] manifest 待手动项转 ✅
  - **产物**：QA 记录

---

## 依赖关系与执行顺序

| Story | 依赖 |
|-------|------|
| ST-301 | ST-103、ST-401 |
| ST-302 | ST-301、ST-402 |
| ST-303 | ST-301、ST-104、ST-203（体验参考） |

**Beta 路径**：ST-301 → ST-302 → ST-303（可与 JPEG 后半并行）

---

## 变更记录

| 版本 | 日期 | 变更摘要 |
|------|------|----------|
| v0.1.0 | 2026-05-22 | 初始 Task 拆解 |
