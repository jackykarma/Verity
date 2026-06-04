# Tasks：图片接入与解析工作台

**Epic**：EPIC-005 - Web 端图片数据解析器  
**Feature ID**：FEAT-001  
**Feature Version**：v0.1.0  
**Tech Spec Version**：v0.1.0  
**Tasks Version**：v0.1.0  
**输入**：`spec.md`、`tech-spec.md`、`epic-design.md` §十二、`l2_design/ST-103_worker_orchestration.md`、`key-func-design/KD_001_*`、`KD_003_*`

---

## FR/NFR → Story → Task 追溯矩阵

| FR/NFR | Story | Task |
|--------|-------|------|
| FR-001～003 | ST-102 | T110～T114 |
| FR-004, FR-006, FR-007, FR-009 | ST-103 | T120～T128 |
| FR-005, FR-008 | ST-104 | T130～T134 |
| NFR-PERF-001 | ST-103 | T125, T126 |
| NFR-PERF-002 | ST-102 | T112 |
| NFR-MEM-001 | ST-104 | T133 |
| NFR-SEC-001 | ST-102, ST-104 | T114, T134 |
| NFR-REL-001 | ST-103 | T127 |
| NFR-OBS-001 | ST-103 | T128 |

---

## 阶段 0：准备

- [x] T001 核对 `spec.md`、`tech-spec.md`、`epic-design.md` ST-101～104 版本一致并记录基线
  - **依赖**：无
  - **验证**：[ ] Tasks Version 与模板字段完整
  - **产物**：本文件

---

## 阶段 1：Story ST-101 - 工程脚手架与 shared 内核

**目标**：Vite+React+TS 空壳可运行

- [x] T010 [ST-101] 初始化 `apps/web-image-parser/`（Vite、React、TS、pnpm、Vitest）
  - **依赖**：T001
  - **设计引用**：`epic-design.md:§五`；`tech-spec.md` 第一部分 §二
  - **步骤**：1) `pnpm create vite` 或等价 2) 配置 `tsconfig` strict 3) 五模块目录 `shell|present|format-jpeg|format-heic|shared|worker`
  - **验证**：[ ] `pnpm dev` 启动
  - **产物**：`apps/web-image-parser/package.json`、`vite.config.ts`

- [x] T011 [P] [ST-101] 实现 `src/shared/SessionStore.ts` 与会话类型 `ParseSession.ts`
  - **依赖**：T010
  - **设计引用**：`key-func-design/KD_001_session_worker.md`
  - **验证**：[ ] 单测：单例、换文件清空
  - **产物**：`src/shared/SessionStore.ts`、`src/shared/types/session.ts`

- [x] T012 [P] [ST-101] 定义失败枚举 `src/shared/types/errors.ts`（文件级/解析级）
  - **依赖**：T010
  - **设计引用**：`tech-spec.md` §三 错误语义
  - **验证**：[ ] 与 `interface-design.md` 错误码对齐
  - **产物**：`errors.ts`

- [x] T013 [ST-101] 根组件 `WorkbenchPage` 占位与 `pnpm test` CI 脚本
  - **依赖**：T011
  - **验证**：[ ] `pnpm test` 通过
  - **产物**：`src/shell/WorkbenchPage.tsx`、`src/main.tsx`

**检查点**：ST-101——全 EPIC 阻塞解除

---

## 阶段 2：核心基础（Shell 编排前置）

- [x] T020 [ST-103] 创建 `ParseWorkerBridge.ts` 桩（消息类型 `parseMessages.ts`）
  - **依赖**：T013；**外部**：FEAT-004 ST-401 类型可 import
  - **设计引用**：`KD_001_session_worker.md`；`interface-design.md` Worker 协议
  - **产物**：`src/shared/ParseWorkerBridge.ts`、`src/shared/types/parseMessages.ts`

---

## 阶段 3：Story ST-102 - 文件接入与校验

- [x] T110 [ST-102] 实现 `src/shell/IngestService.ts`（拖放+选择、单文件）
  - **依赖**：T011
  - **设计引用**：`spec.md` FR-001
  - **验证**：[ ] SC-001 拖放 JPEG
  - **产物**：`IngestService.ts`

- [x] T111 [P] [ST-102] 魔数/扩展名校验 JPEG、HEIC（FR-002）
  - **依赖**：T110
  - **验证**：[ ] SC-007 PNG 拒绝
  - **产物**：`src/shared/fileSniff.ts`

- [x] T112 [ST-102] 50MB 大小校验（FR-003）与 P95≤1s 反馈
  - **依赖**：T110
  - **设计引用**：`spec.md` FR-003、NFR-PERF-002
  - **验证**：[ ] SC-006 51MB 拒绝
  - **产物**：`IngestService.ts`

- [x] T113 [P] [ST-102] UI 接入区组件 `FileIngestZone.tsx`
  - **依赖**：T110
  - **验证**：[ ] 授权拒绝 SC-014 提示
  - **产物**：`src/shell/components/FileIngestZone.tsx`

- [x] T114 [ST-102] 接入流程集成测试 `IngestService.test.ts`
  - **依赖**：T111, T112
  - **验证**：[ ] AC-001～003
  - **产物**：`__tests__/IngestService.test.ts`

---

## 阶段 4：Story ST-103 - Worker 桥接与解析编排

- [x] T120 [ST-103] 实现 `src/worker/entry.ts` 与 `worker/vite.worker.ts` 配置
  - **依赖**：T020
  - **设计引用**：`l2_design/ST-103_worker_orchestration.md:功能设计:时序图`
  - **产物**：`src/worker/entry.ts`

- [x] T121 [ST-103] 实现 `ParseOrchestrator.ts` 状态机（ParsePhase）
  - **依赖**：T120
  - **设计引用**：`l2_design/ST-103_worker_orchestration.md:类图`
  - **验证**：[ ] FR-004 五态可测
  - **产物**：`src/shell/ParseOrchestrator.ts`

- [x] T122 [ST-103] 解析任务去重 `taskGeneration`（SC-010）
  - **依赖**：T121
  - **验证**：[ ] 双击仅一次 PARSE_START
  - **产物**：`ParseOrchestrator.ts`

- [x] T123 [ST-103] 取消与 `worker.terminate()`（FR-009）
  - **依赖**：T121
  - **验证**：[ ] SC-003 取消后 CANCELLED
  - **产物**：`ParseOrchestrator.ts`

- [x] T124 [ST-103] 120s 超时 watchdog（SC-009）
  - **依赖**：T121
  - **设计引用**：`tech-spec.md` 解析超时默认 120s
  - **验证**：[ ] 超时文案+可取消
  - **产物**：`ParseOrchestrator.ts`

- [x] T125 [ST-103] Worker 内动态 import `format-jpeg` / `format-heic` 路由
  - **依赖**：T120
  - **验证**：[ ] JPEG/HEIC 各走对应 parser
  - **产物**：`src/worker/entry.ts`

- [x] T126 [ST-103] 解析完成信号→列表首屏≤10s（与 Format 联调指标）
  - **依赖**：T125；**外部**：FEAT-002 ST-201
  - **验证**：[ ] S-JPEG-01 P95≤10s
  - **产物**：—

- [x] T127 [ST-103] 20 次连续操作稳定性（NFR-REL-001）
  - **依赖**：T122, T123
  - **验证**：[ ] 无需刷新页面
  - **产物**：E2E 或脚本

- [x] T128 [P] [ST-103] 文件级观测 `FileLevelTelemetry`（NFR-OBS-001）
  - **依赖**：T121
  - **产物**：`src/shell/FileLevelTelemetry.ts`

---

## 阶段 5：Story ST-104 - 浏览框架布局与隐私说明

- [x] T130 [ST-104] 三区布局 `src/shell/layout/WorkbenchLayout.tsx`（树槽+详情槽）
  - **依赖**：T114, T121
  - **设计引用**：`KD_003_workbench_orchestration.md`
  - **验证**：[ ] SC-012 框架可见
  - **产物**：`WorkbenchLayout.tsx`

- [x] T131 [ST-104] 解析状态 UI 绑定 `ParseStatusBar.tsx`
  - **依赖**：T130
  - **验证**：[ ] 进行中/成功/失败/部分成功/已取消
  - **产物**：`ParseStatusBar.tsx`

- [x] T132 [ST-104] 格式视图槽位 `FormatSlot.tsx`（JPEG/HEIC 互斥挂载）
  - **依赖**：T130
  - **设计引用**：`tech-spec.md` FEAT-001 §三
  - **产物**：`FormatSlot.tsx`

- [x] T133 [P] [ST-104] 隐私说明 FR-008（首次/帮助入口）
  - **依赖**：T130
  - **验证**：[ ] AC-006 可见
  - **产物**：`PrivacyNotice.tsx`

- [x] T134 [ST-104] 换文件清理会话（FR-006、SC-004）
  - **依赖**：T130, T121
  - **验证**：[ ] 旧树消失、无残留
  - **产物**：`ParseOrchestrator.reset()`

---

## 阶段 6：优化

- [x] T140 [P] Playwright 冒烟：`test-assets` 上传→解析→见框架
  - **依赖**：T134
  - **产物**：`e2e/workbench-smoke.spec.ts`

---

## 依赖关系与执行顺序

| Story | 依赖 |
|-------|------|
| ST-101 | 无 |
| ST-102 | ST-101 |
| ST-103 | ST-101、**FEAT-004 ST-401** |
| ST-104 | ST-102、ST-103 |

**MVP**：ST-101 →（并行 FEAT-004 ST-401）→ ST-102 → ST-103 → ST-104

---

## 变更记录

| 版本 | 日期 | 变更摘要 |
|------|------|----------|
| v0.1.0 | 2026-05-22 | 初始 Task 拆解 |
