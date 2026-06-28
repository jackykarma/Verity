# Tasks：卡比跳跃网页游戏

**Epic**：EPIC-007 - 星之卡比跳跃小游戏
**Feature ID**：FEAT-001
**Feature Version**：v0.1.0
**Tech Spec Version**：v0.1.0
**Tasks Version**：v0.1.0
**输入**：spec.md、tech-spec.md、epic-design.md、KD_001

## 阶段 0：准备

- [x] T001 [ST-001] 确认 EPIC 文档与分支就绪
  - **依赖**：无
  - **设计引用**：epic-design.md §十二
  - **步骤**：1) 确认 epic.md、spec.md、tech-spec.md、epic-design.md 存在
  - **验证**：[x] 文档齐全
  - **产物**：specs/epics/EPIC-007-kirby-platformer-web/

## 阶段 1：环境搭建（ST-001）

- [x] T002 [ST-001] 初始化 apps/kirby-platformer-web Vite+React+TS 项目
  - **依赖**：T001
  - **设计引用**：epic-design.md §三
  - **步骤**：
    - 1) 创建 package.json、vite.config.ts、tsconfig
    - 2) 创建 index.html、src/main.tsx、src/App.tsx
    - 3) 配置 vitest
  - **验证**：
    - [x] `npm install` 成功
    - [x] `npm run dev` 可启动
  - **产物**：apps/kirby-platformer-web/

- [x] T003 [P] [ST-001] 实现 GameCanvas 空关卡渲染
  - **依赖**：T002
  - **设计引用**：epic-design.md §四 GameCanvas
  - **步骤**：
    - 1) 创建 src/components/GameCanvas.tsx
    - 2) 绘制天空背景与地面占位
  - **验证**：
    - [x] 页面显示横版关卡视口
  - **产物**：apps/kirby-platformer-web/src/components/GameCanvas.tsx

## 阶段 2：游戏引擎（ST-002）

- [x] T004 [ST-002] 实现 PlatformerGameEngine 核心逻辑
  - **依赖**：T002
  - **设计引用**：KD_001_kirby-platformer-engine.md
  - **步骤**：
    - 1) 创建 src/game/types.ts、constants.ts、levelData.ts
    - 2) 实现 PlatformerGameEngine：移动、跳跃、重力、碰撞、收集、通关、死亡
  - **验证**：
    - [x] 单元测试覆盖移动/跳跃/碰撞/收集/通关/掉落
  - **产物**：apps/kirby-platformer-web/src/game/

- [x] T005 [P] [ST-002] 编写 PlatformerGameEngine 单元测试
  - **依赖**：T004
  - **设计引用**：KD_001
  - **步骤**：创建 src/game/__tests__/PlatformerGameEngine.test.ts
  - **验证**：
    - [x] `npm test` 通过
  - **产物**：apps/kirby-platformer-web/src/game/__tests__/

## 阶段 3：UI 集成（ST-003）

- [x] T006 [ST-003] 实现 usePlatformerGame hook（rAF + 键盘）
  - **依赖**：T004
  - **设计引用**：KD_001 时序图
  - **步骤**：创建 src/hooks/usePlatformerGame.ts
  - **验证**：
    - [x] 卡比可移动跳跃；镜头跟随
  - **产物**：apps/kirby-platformer-web/src/hooks/usePlatformerGame.ts

- [x] T007 [ST-003] 集成 GameCanvas 绘制卡比、平台、星星、旗杆
  - **依赖**：T003, T006
  - **设计引用**：epic-design.md §四
  - **步骤**：GameCanvas 根据 state 绘制并应用 cameraX
  - **验证**：
    - [x] 卡比、平台、星星、旗杆可见
  - **产物**：apps/kirby-platformer-web/src/components/GameCanvas.tsx

- [x] T008 [P] [ST-003] 实现 HudPanel 与 GameOverlay
  - **依赖**：T006
  - **设计引用**：epic-design.md §四
  - **步骤**：HudPanel、GameOverlay（暂停/通关/失败/重开）
  - **验证**：
    - [x] 暂停、通关、失败、重新开始可用
  - **产物**：apps/kirby-platformer-web/src/components/

- [x] T009 [ST-003] App 组装与样式 polish
  - **依赖**：T007, T008
  - **设计引用**：spec.md AC-001~008
  - **步骤**：App.tsx 组装；卡比主题 CSS
  - **验证**：
    - [x] AC 全部满足
    - [x] `npm run build` 成功
    - [x] `npm test` 通过
  - **产物**：apps/kirby-platformer-web/src/App.tsx

## 追溯矩阵

| FR/NFR | Story | Task |
|--------|-------|------|
| FR-001 | ST-001, ST-003 | T003, T009 |
| FR-002 | ST-002, ST-003 | T004, T006 |
| FR-003 | ST-002 | T004 |
| FR-004 | ST-003 | T006, T007 |
| FR-005 | ST-002, ST-003 | T004, T007 |
| FR-006 | ST-002, ST-003 | T004, T008 |
| FR-007 | ST-002, ST-003 | T004, T008 |
| FR-008 | ST-003 | T006, T008 |
| FR-009 | ST-003 | T008, T009 |
| NFR-PERF-001 | ST-001 | T002 |
| NFR-PERF-002 | ST-002 | T004 |
| AC-008 | ST-003 | T005, T009 |

## 依赖关系与执行顺序

T001 → T002 → T003/T004 → T005/T006 → T007/T008 → T009

## 并行示例

- T003 与 T004 可并行（不同目录）
- T005 与 T006 在 T004 后可并行
- T008 与 T007 部分并行
