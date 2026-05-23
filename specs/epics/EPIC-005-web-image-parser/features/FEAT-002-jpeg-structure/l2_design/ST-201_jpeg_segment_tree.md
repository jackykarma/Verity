# L2 Story 详细设计：ST-201 JPEG 段树

## L2 依赖与引用

| 类型 | 说明 |
| --- | --- |
| **关联 KD** | [`KD_004_jpeg_structure.md`](../../../key-func-design/KD_004_jpeg_structure.md) |
| **前置 ST** | ST-103、ST-401 |
| **对外契约** | `JpegParser.parse`、`JpegTreeAdapter.toPresentRequest` |

---

## ST-201 Detailed Design：JPEG 标记段扫描与分区树

#### 1) 需求及描述

- **DoD**：
  - [ ] `[FR-002]` P0 目录 100%（S-JPEG-01/02/10）
  - [ ] `[FR-006]` 未知段 PAR-JPEG-099 可见
  - [ ] `[FR-008]` 状态回传 success/partial/failed
  - [ ] `[NFR-PERF-001]` S-JPEG-01 ≤10s（集成）

#### 2) 功能设计

**核心实现思路**：`scanMarkers(buffer)` 返回 `RawSegment[]`；`SegmentTreeBuilder` 按 offset 排序并挂 EXIF 子树占位（ST-202 填充字段）。图像段 `loadType=image` 并计算 `byteRange` 供 `contentRef`。

**失败**：截断→`partial`；魔数非 FF D8→`failed`。

##### 类图

（见 KD-004 `JpegParser`+`SegmentTreeBuilder`）

##### 时序图

（见 KD-004 Worker 内 parse 主路径；本 Story 不重复异常分支，实现时须含截断 alt）

#### 协作者与过程说明

仅在 Worker 执行扫描；主线程 `JpegTreeAdapter` 只读 DTO。与 ST-202 边界：本 Story 不实现 MakerNote 字段表，仅创建节点与原始摘要。
