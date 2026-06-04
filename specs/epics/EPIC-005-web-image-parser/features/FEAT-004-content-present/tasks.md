# Tasks：分区内容多形态呈现

**Epic**：EPIC-005 - Web 端图片数据解析器  
**Feature ID**：FEAT-004  
**Feature Version**：v0.2.0（来自 `spec.md`）  
**Tech Spec Version**：v0.1.0（来自 EPIC 根 `tech-spec.md`）  
**Tasks Version**：v0.1.0  
**输入**：`spec.md`、`tech-spec.md`（EPIC + Feature FEAT-004 章节）、`epic-design.md` §十二、`l2_design/ST-401_present_contract.md`、`interface-design.md`

> Task 仅拆解既定 Story；**禁止**改写 spec/tech-spec/design 技术决策。

---

## FR/NFR → Story → Task 追溯矩阵

| FR/NFR | Story | Task |
|--------|-------|------|
| FR-001, FR-007 | ST-401 | T010, T011, T012 |
| FR-002～004, FR-010, FR-011 | ST-402 | T020～T026 |
| FR-005, FR-006, FR-008, FR-009 | ST-402, ST-403 | T024, T030～T033 |
| FR-007 | ST-401 | T011 |
| NFR-PERF-001 | ST-402 | T021, T022 |
| NFR-PERF-002 | ST-402 | T023 |
| NFR-MEM-001 | ST-403 | T030, T031 |
| NFR-SEC-001 | ST-401, ST-402 | T010, T025 |
| NFR-REL-001 | ST-403 | T032, T033 |
| NFR-OBS-001 | ST-403 | T033 |

---

## 阶段 0：准备

**目标**：对齐版本与冻结输入

- [x] T001 核对 `spec.md` v0.2.0、`tech-spec.md` v0.1.0、`epic-design.md` Story ST-401～403 与本 `tasks.md` 版本一致
  - **依赖**：无
  - **设计引用**：`epic-design.md:§十二.6`
  - **步骤**：1) 记录输入基线于本文件头部 2) 确认 `interface-design.md` 呈现契约章节可读
  - **验证**：[ ] 版本字段一致
  - **产物**：本 `tasks.md`

---

## 阶段 1：环境前提（共享脚手架）

**目标**：确认 `apps/web-image-parser/` 已由 FEAT-001 ST-101 创建

- [x] T005 验证工程可构建且 `src/shared/` 存在（阻塞 ST-401）
  - **依赖**：T001；**外部**：FEAT-001 ST-101 完成
  - **设计引用**：`epic-design.md:§五 一层架构`
  - **步骤**：1) `cd apps/web-image-parser && pnpm install && pnpm build` 2) 确认无报错
  - **验证**：[ ] `pnpm test` 可运行（空套件通过）
  - **产物**：—

---

## 阶段 2：核心基础（呈现模块骨架）

**目标**：建立 `src/present/` 模块边界，供 Story 增量填充

- [x] T010 [P] [ST-401] 创建 `apps/web-image-parser/src/present/index.ts` 与 `ContentPresenter` 空实现桩
  - **依赖**：T005
  - **设计引用**：`key-func-design/KD_002_content_present.md:关键类图`；`l2_design/ST-401_present_contract.md:功能设计:类图`
  - **步骤**：1) 导出 `ContentPresenter` 2) `present()` 返回 stub `PresentResult`
  - **验证**：[ ] 002/003 可 import 不报错
  - **产物**：`src/present/ContentPresenter.ts`、`src/present/index.ts`

---

## 阶段 3：Story ST-401 - 呈现契约与策略矩阵

**目标**：冻结 `PresentRequest`/`PresentResult`、`PayloadKind`、策略路由

**验证方式（高层）**：契约单元测试；空引用 → NO_CONTENT

- [x] T011 [ST-401] 定义 `apps/web-image-parser/src/shared/types/present.ts`（PayloadKind、PresentRequest、PresentResult、PresentStatus）
  - **依赖**：T010
  - **设计引用**：`l2_design/ST-401_present_contract.md:功能设计:类图`；`interface-design.md` 呈现契约
  - **验证**：[ ] 类型与 `interface-design.md` 字段一致
  - **产物**：`src/shared/types/present.ts`

- [x] T012 [P] [ST-401] 实现 `PresentStrategyRouter.ts` 路由矩阵（图片/视频/音频/元数据/其他/混合）
  - **依赖**：T011
  - **设计引用**：`spec.md` FR-001；`epic-design.md` ST-401
  - **验证**：[ ] 单元测试覆盖 6 类 PayloadKind 路由
  - **产物**：`src/present/PresentStrategyRouter.ts`

- [x] T013 [ST-401] 契约单元测试 `apps/web-image-parser/src/present/__tests__/presentContract.test.ts`
  - **依赖**：T011, T012
  - **验证**：[ ] AC-005 契约字段；空引用 FR-006 文案键存在
  - **产物**：测试文件

**检查点**：ST-401 完成——002/003 可类型安全调用 `ContentPresenter.present`

---

## 阶段 4：Story ST-402 - 图片/视频/音频/可读渲染器

**目标**：四类渲染 + FR-009/010/011 降级

**验证方式**：S-JPEG-01 预览；视频/音频样例起播≥3s 或失败说明

- [x] T020 [P] [ST-402] 实现 `src/present/renderers/ReadableRenderer.ts`（结构化字段、十六进制辅助）
- [x] T021 [P] [ST-402] 实现 `src/present/renderers/ImagePreviewRenderer.ts`（静态预览、失败降级）
- [x] T022 [P] [ST-402] 实现 `src/present/renderers/VideoPlaybackRenderer.ts`（起播/暂停/进度/时长）
- [x] T023 [P] [ST-402] 实现 `src/present/renderers/AudioPlaybackRenderer.ts`
- [x] T024 [ST-402] 实现 `src/present/renderers/AuxImageRenderer.ts`（深度/HDR/透明子类型，FR-011）
- [x] T025 [ST-402] 组装 `ContentPresenter.present()` 串联 Router + Renderers
- [x] T026 [ST-402] 混合负载 `MixedPayloadPresenter`（可读摘要 + 主媒体，FR-005/008）

**检查点**：ST-402 完成——图片必预览、视频/音频可播

---

## 阶段 5：Story ST-403 - 预览缓存 LRU 与统一文案

**目标**：PreviewCache≤3、统一文案、请求序号防竞态

- [x] T030 [ST-403] 实现 `apps/web-image-parser/src/present/PreviewCache.ts`（LRU≤3）
  - **依赖**：T025
  - **设计引用**：`spec.md` NFR-MEM-001；`tech-spec.md` 第一部分 §四
  - **验证**：[ ] AC-005 连续 10 分区无 OOM
  - **产物**：`PreviewCache.ts`

- [x] T031 [P] [ST-403] 实现 `apps/web-image-parser/src/present/copy.ts`（FR-006 文案表）
  - **依赖**：T025
  - **设计引用**：`interface-design.md` 错误码映射
  - **验证**：[ ] 与 FEAT-002/003 提示口径一致（文案 key 对照表）
  - **产物**：`copy.ts`

- [x] T032 [ST-403] 呈现请求序号 + `AbortController` 防快速切换错乱（SC-010）
  - **依赖**：T030
  - **设计引用**：`epic-design.md` §六 RISK-004
  - **验证**：[ ] 快速切换 3 分区最终与最后选中一致
  - **产物**：`ContentPresenter.ts`（增强）

- [x] T033 [ST-403] 观测字段钩子 `PresentTelemetry`（失败类型枚举，无文件内容）
  - **依赖**：T031
  - **设计引用**：`spec.md` NFR-OBS-001
  - **验证**：[ ] 预览/播放失败可记录 kind+partitionId
  - **产物**：`src/present/PresentTelemetry.ts`

**检查点**：ST-403 完成——FEAT-004 全量 AC 可验收

---

## 阶段 6：优化与跨领域

- [x] T040 [P] 对照 `test-assets/manifest.md` 回归清单，补齐呈现路径缺口样例验证记录
  - **依赖**：T033
  - **验证**：[ ] 图片负载 100% 进预览路径（AC-001）
  - **产物**：`docs/qa/present-regression.md`（可选）

---

## 依赖关系与执行顺序

### Story 依赖

- **ST-401** → 依赖 ST-101（FEAT-001）、本 Feature T010～T013
- **ST-402** → 依赖 ST-401
- **ST-403** → 依赖 ST-402

### 跨 Feature

- FEAT-002 ST-203、FEAT-003 ST-302/303 依赖本 Feature ST-402 完成

### 并行示例：ST-402

```text
T020 ReadableRenderer | T021 ImagePreview | T022 Video | T023 Audio  （可并行）
→ T024 AuxImage → T025 组装 → T026 Mixed
```

---

## 落地策略

### MVP（与 EPIC M3 对齐）

1. ST-401 → ST-402（至少 Image+Readable）→ 与 FEAT-002 ST-203 联调
2. ST-402 视频/音频/辅助图 → ST-403

### 增量交付

每完成一 Story 独立 `pnpm test` + 样例手动验证后再合并。

---

## 变更记录

| 版本 | 日期 | 变更摘要 |
|------|------|----------|
| v0.1.0 | 2026-05-22 | 初始 Task 拆解（ST-401～403） |
