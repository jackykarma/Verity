# L2 Story 详细设计：ST-301 HEIC 容器树

## L2 依赖与引用

| 类型 | 说明 |
| --- | --- |
| **关联 KD** | [`KD_005_heic_structure.md`](../../../key-func-design/KD_005_heic_structure.md) |
| **前置 ST** | ST-103、ST-401 |
| **对外契约** | `HeicParser.parse`、`HeicEnvDetector.detect` |

---

## ST-301 Detailed Design：BMFF 容器树与 meta 子树

#### 1) 需求及描述

- **DoD**：
  - [ ] `[FR-002]` P0 容器项 100%（S-HEIC-01）
  - [ ] `[FR-011]` meta 子树可展开 hdlr/pitm/iinf/iloc/iprp
  - [ ] `[FR-005]` 不支持环境前置拦截
  - [ ] `[NFR-OBS-001]` 区分 ENV vs 损坏

#### 2) 功能设计

**核心实现思路**：`HeicEnvDetector` 在 `ParseOrchestrator.startParse` 内 format===heic 时调用。Worker 内 mp4box `onReady` 回调构建 `SegmentNodeDto`；`pitm` 标记主图项 `isPrimary=true`。

**失败**：mdat 截断→partial；ftyp 非 heic→failed。

##### 类图

（见 KD-005 `HeicParser`+`HeicEnvDetector`）

##### 时序图

（见 KD-005；ST-302 扩展 Live Photo/轨；本 Story 仅保证容器+主图项节点）

#### 协作者与过程说明

mp4box 异步解析须在 Worker 内 await `onReady` 再 postMessage DONE。环境不支持时不启动 Worker（节省资源）。
