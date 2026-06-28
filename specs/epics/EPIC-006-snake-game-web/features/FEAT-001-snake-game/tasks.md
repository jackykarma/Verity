# Tasks：贪食蛇网页游戏

**Epic**：EPIC-006 - 贪食蛇网页游戏
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
  - **产物**：specs/epics/EPIC-006-snake-game-web/

## 阶段 1：环境搭建（ST-001）

- [x] T002 [ST-001] 初始化 apps/snake-game-web Vite+React+TS 项目
  - **依赖**：T001
  - **设计引用**：epic-design.md §三 一层架构
  - **步骤**：
    - 1) 创建 package.json、vite.config.ts、tsconfig
    - 2) 创建 index.html、src/main.tsx、src/App.tsx
    - 3) 配置 vitest
  - **验证**：
    - [x] `npm install` 成功
    - [x] `npm run dev` 可启动
  - **产物**：apps/snake-game-web/

- [x] T003 [P] [ST-001] 实现 GameBoard Canvas 空棋盘渲染
  - **依赖**：T002
  - **设计引用**：epic-design.md §四 GameBoard
  - **步骤**：
    - 1) 创建 src/components/GameBoard.tsx
    - 2) 绘制 gridSize×gridSize 网格
  - **验证**：
    - [x] 页面显示空棋盘
  - **产物**：apps/snake-game-web/src/components/GameBoard.tsx

## 阶段 2：游戏引擎（ST-002）

- [x] T004 [ST-002] 实现 SnakeGameEngine 核心逻辑
  - **依赖**：T002
  - **设计引用**：KD_001_snake-game-engine.md
  - **步骤**：
    - 1) 创建 src/game/types.ts、constants.ts
    - 2) 实现 SnakeGameEngine：移动、吃食物、碰撞、spawnFood
  - **验证**：
    - [x] 单元测试覆盖移动/吃食物/撞墙/撞自身/禁止反向
  - **产物**：apps/snake-game-web/src/game/

- [x] T005 [P] [ST-002] 编写 SnakeGameEngine 单元测试
  - **依赖**：T004
  - **设计引用**：KD_001_snake-game-engine.md
  - **步骤**：创建 src/game/__tests__/SnakeGameEngine.test.ts
  - **验证**：
    - [x] `npm test` 通过（10/10）
  - **产物**：apps/snake-game-web/src/game/__tests__/

## 阶段 3：UI 集成（ST-003）

- [x] T006 [ST-003] 实现 useSnakeGame hook（interval + 键盘）
  - **依赖**：T004
  - **设计引用**：KD_001 时序图
  - **步骤**：创建 src/hooks/useSnakeGame.ts
  - **验证**：
    - [x] 蛇自动移动；方向键有效
  - **产物**：apps/snake-game-web/src/hooks/useSnakeGame.ts

- [x] T007 [ST-003] 集成 GameBoard 绘制蛇与食物
  - **依赖**：T003, T006
  - **设计引用**：epic-design.md §四
  - **步骤**：GameBoard 根据 state 绘制
  - **验证**：
    - [x] 蛇、食物、分数可见
  - **产物**：apps/snake-game-web/src/components/GameBoard.tsx

- [x] T008 [P] [ST-003] 实现 ScorePanel 与 GameOverlay
  - **依赖**：T006
  - **设计引用**：epic-design.md §四
  - **步骤**：ScorePanel、GameOverlay（暂停/结束/重开）
  - **验证**：
    - [x] 暂停、游戏结束、重新开始可用
  - **产物**：apps/snake-game-web/src/components/

- [x] T009 [ST-003] App 组装与样式 polish
  - **依赖**：T007, T008
  - **设计引用**：spec.md AC-001~006
  - **步骤**：App.tsx 组装；基础 CSS
  - **验证**：
    - [x] AC 全部满足
    - [x] `npm run build` 成功
    - [x] `npm test` 通过
  - **产物**：apps/snake-game-web/src/App.tsx

## 追溯矩阵

| FR/NFR | Story | Task |
|--------|-------|------|
| FR-001 | ST-001, ST-003 | T003, T009 |
| FR-002 | ST-002, ST-003 | T004, T006 |
| FR-003 | ST-002 | T004 |
| FR-004 | ST-002, ST-003 | T004, T008 |
| FR-005 | ST-003 | T006, T008 |
| FR-006 | ST-003 | T008, T009 |
| NFR-PERF-001 | ST-001 | T002 |
| NFR-PERF-002 | ST-002 | T004 |
| AC-006 | ST-003 | T005, T009 |

## 依赖关系与执行顺序

T001 → T002 → T003/T004 → T005/T006 → T007/T008 → T009

## 并行示例

- T003 与 T004 可并行（不同目录）
- T005 与 T006 在 T004 后可并行
- T008 与 T007 部分并行
