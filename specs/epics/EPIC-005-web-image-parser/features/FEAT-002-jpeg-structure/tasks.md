# Tasks：JPEG 分区解析与浏览

**Epic**：EPIC-005 - Web 端图片数据解析器  
**Feature ID**：FEAT-002  
**Feature Version**：v0.3.0  
**Tech Spec Version**：v0.1.0  
**Tasks Version**：v0.1.0  
**输入**：`spec.md` §解析内容目录、`tech-spec.md` FEAT-002 章节、`epic-design.md` §十二、`l2_design/ST-201_jpeg_segment_tree.md`、`KD_004_jpeg_structure.md`

---

## FR/NFR → Story → Task 追溯矩阵

| FR/NFR | Story | Task |
|--------|-------|------|
| FR-001, FR-002, FR-006, FR-007 | ST-201 | T210～T216 |
| FR-009, FR-011, FR-012 | ST-202 | T220～T225 |
| FR-003, FR-004, FR-008 | ST-203 | T230～T235 |
| FR-005 | ST-201 | T215 |
| NFR-PERF-001 | ST-201 | T216 |
| NFR-PERF-002 | ST-203 | T232 |
| NFR-MEM-001 | ST-201 | T216 |
| NFR-REL-001 | ST-201, ST-203 | T216, T234 |

---

## 阶段 0：准备

- [x] T001 确认 `spec.md` v0.3.0、解析内容目录 P0/P1 清单与 `test-assets/jpeg/` 样例映射
  - **依赖**：无
  - **验证**：[ ] `manifest.md` 已读
  - **产物**：—

---

## 阶段 1：环境前提

- [x] T005 确认 ST-101 脚手架、ST-103 Worker、ST-401 呈现契约已合并
  - **依赖**：T001
  - **外部**：FEAT-001 ST-103、FEAT-004 ST-401
  - **验证**：[ ] `import` 路径可用
  - **产物**：—

---

## 阶段 2：核心基础

- [x] T020 [ST-201] 创建 `apps/web-image-parser/src/format-jpeg/` 模块与 `JpegParser` 接口
  - **依赖**：T005
  - **设计引用**：`epic-design.md:§五 format-jpeg`
  - **产物**：`src/format-jpeg/index.ts`、`JpegParser.ts`

---

## 阶段 3：Story ST-201 - JPEG 段扫描与分区树

- [x] T210 [ST-201] 实现标记段扫描器 `JpegSegmentScanner.ts`（SOI…EOI 顺序）
  - **依赖**：T020
  - **设计引用**：`l2_design/ST-201_jpeg_segment_tree.md:功能设计:时序图`
  - **验证**：[ ] PAR-JPEG-001/002 必现
  - **产物**：`JpegSegmentScanner.ts`

- [x] T211 [P] [ST-201] `SegmentTreeBuilder.ts` 构建层级 DTO
  - **依赖**：T210
  - **设计引用**：`KD_004_jpeg_structure.md`
  - **验证**：[ ] 按文件偏移排序
  - **产物**：`SegmentTreeBuilder.ts`

- [x] T212 [ST-201] P0 目录项识别（APP0/1、DQT、SOF、SOS、图像数据、COM）
  - **依赖**：T211
  - **设计引用**：`spec.md` §解析内容目录 PAR-JPEG-001～015
  - **验证**：[ ] S-JPEG-01 P0 100%
  - **产物**：`segmentCatalog.ts`

- [x] T213 [P] [ST-201] PAR-JPEG-099 未知 APP 节点+警告态
  - **依赖**：T212
  - **验证**：[ ] S-JPEG-09 可见警告
  - **产物**：`UnknownSegmentHandler.ts`

- [x] T214 [ST-201] 截断/损坏文件部分成功（FR-006、FR-008）
  - **依赖**：T211
  - **验证**：[ ] S-JPEG-10、S-JPEG-09
  - **产物**：`JpegParser.ts`

- [x] T215 [P] [ST-201] 负载类型初判（图片/视频/元数据/其他）供呈现
  - **依赖**：T212
  - **设计引用**：`spec.md` FR-003
  - **产物**：`PayloadClassifier.ts`

- [x] T216 [ST-201] Worker 集成 `JpegParser.parse(buffer)` + 性能预算
  - **依赖**：T214, T215
  - **验证**：[ ] ≤20MB P95≤10s；内存≤150MB
  - **产物**：`src/worker/jpegParse.ts`

- [x] T217 [P] [ST-201] UI `JpegSegmentTree.tsx` 树组件
  - **依赖**：T216
  - **验证**：[ ] 展开/折叠/选中
  - **产物**：`src/format-jpeg/ui/JpegSegmentTree.tsx`

**检查点**：ST-201——S-JPEG-01 完整树

---

## 阶段 4：Story ST-202 - EXIF/IPTC/MakerNote 字段级

- [x] T220 [ST-202] 集成 EXIF 解析（exifr 或等价）IFD0/Exif/GPS/Interop
  - **依赖**：T216
  - **设计引用**：`spec.md` FR-009、PAR-JPEG-C06
  - **验证**：[ ] S-JPEG-03 GPS 可读
  - **产物**：`ExifExtractor.ts`

- [x] T221 [P] [ST-202] MakerNote 字段级（Canon/Nikon/Sony/… §MakerNote 表）
  - **依赖**：T220
  - **设计引用**：`spec.md` FR-011、§MakerNote
  - **验证**：[ ] S-JPEG-11～13 AC-008 ≥95%
  - **产物**：`MakerNoteDecoder.ts`

- [x] T222 [P] [ST-202] IPTC 字段（FR-012）
  - **依赖**：T220
  - **验证**：[ ] S-JPEG-05、S-JPEG-15
  - **产物**：`IptcExtractor.ts`

- [x] T223 [ST-202] EXIF 内缩略图子节点+预览引用（PAR-JPEG-025）
  - **依赖**：T221
  - **验证**：[ ] 缩略图可走 FEAT-004 预览
  - **产物**：`ThumbnailExtractor.ts`

- [x] T224 [P] [ST-202] MPO/渐进式 P1 段（PAR-JPEG-019/020）基础支持
  - **依赖**：T212
  - **验证**：[ ] 有样例则列入 manifest 验收
  - **产物**：`MpoHandler.ts`

- [x] T225 [ST-202] P1 覆盖率自检脚本对照 §解析内容目录
  - **依赖**：T221, T222
  - **验证**：[ ] P1≥95% 或 LIM 登记
  - **产物**：`scripts/jpeg-catalog-audit.ts`

---

## 阶段 5：Story ST-203 - JPEG 与呈现/工作台联调

- [x] T230 [ST-203] 选中分区→`ContentPresenter.present()`  wiring
  - **依赖**：T217, T215；**外部**：FEAT-004 ST-402
  - **设计引用**：`interface-design.md`
  - **验证**：[ ] SC-002 主图预览
  - **产物**：`JpegDetailPane.tsx`

- [x] T231 [ST-203] 解析状态回传 `ParseResultReporter.ts`（FR-008）
  - **依赖**：T214
  - **验证**：[ ] FEAT-001 状态与树一致
  - **产物**：`ParseResultReporter.ts`

- [x] T232 [ST-203] 选中到呈现触发 P95≤500ms（不含解码）
  - **依赖**：T230
  - **验证**：[ ] NFR-PERF-002
  - **产物**：—

- [x] T233 [P] [ST-203] 快速切换分区 SC-009
  - **依赖**：T230
  - **验证**：[ ] 与 FEAT-004 序号一致
  - **产物**：—

- [x] T234 [ST-203] E2E：上传→解析→选 EXIF 段→可读（E2E-001/005）
  - **依赖**：T230, T231
  - **验证**：[ ] `test-assets/jpeg/S-JPEG-01_*`
  - **产物**：`e2e/jpeg-happy-path.spec.ts`

- [x] T235 [ST-203] 呈现失败不破坏树（SC-012）
  - **依赖**：T230
  - **验证**：[ ] 损坏图段预览失败仍可选其他段
  - **产物**：—

---

## 依赖关系与执行顺序

| Story | 依赖 |
|-------|------|
| ST-201 | ST-103、ST-401 |
| ST-202 | ST-201 |
| ST-203 | ST-201、ST-402、ST-104 |

**MVP 路径**：ST-201 → ST-203（最小）→ ST-202 补齐字段级

---

## 变更记录

| 版本 | 日期 | 变更摘要 |
|------|------|----------|
| v0.1.0 | 2026-05-22 | 初始 Task 拆解 |
