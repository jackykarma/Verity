# EPIC 技术规格书（Tech Spec）：EPIC-006 - 贪食蛇网页游戏

**Epic**：EPIC-006 - 贪食蛇网页游戏
**Epic Version**：v0.1.0
**Tech Spec Version**：v0.1.0
**创建/更新日期**：2026-06-28

---

## Tech Spec 前置检查

| 检查项 | 结论 |
|--------|------|
| 已阅读 `epic.md`，提取 Feature 列表、跨 Feature 技术策略 | 是 |
| 已阅读**所有** Feature 的 `spec.md` | 是 |
| 已完成 EPIC 级与各 Feature 的差距分析（可复用 / 需扩展 / 需新增） | 是 |
| 已对照现有工程代码校准技术栈与分层 | 是 |

---

## 变更记录（增量变更）

| 版本 | 日期 | 变更范围 | 变更摘要 | 影响 Feature |
|------|------|----------|----------|--------------|
| v0.1.0 | 2026-06-28 | 初始 | 初版 | FEAT-001 |

---

# 第一部分：EPIC 级公共规约

## 一、EPIC 级公共约束

| 维度 | 约束 |
|------|------|
| **Language/Version** | TypeScript ~6.x |
| **UI 框架** | React 19.x |
| **构建系统** | Vite 8.x |
| **最低/目标 API** | N/A（Web） |
| **依赖注入** | N/A |
| **测试框架** | Vitest + @testing-library/react |
| **Target Platform** | 现代浏览器（Chrome/Firefox/Safari/Edge 近 2 年版本） |

**其他工程约束**：
- 应用位于 `apps/snake-game-web/`，与 `apps/web-image-parser/` 同级
- ESM 模块；`npm run dev` / `npm run build` / `npm test`
- 纯前端，无后端 API

---

## 二、跨 Feature 边界与依赖规则

- **分层原则**：Presentation（React 组件）→ Game Engine（纯 TS 逻辑）→ Types
- **依赖方向**：UI 依赖 Game Engine；Game Engine 不依赖 React
- **Feature 边界**：FEAT-001 独占全部能力
- **跨层禁止项**：Game Engine 不得 import React

---

## 三、统一运行时约束

- **线程/协程**：单线程；游戏循环使用 `setInterval`/`requestAnimationFrame` + React state
- **错误处理**：游戏逻辑异常不崩溃页面；边界条件在 Engine 内处理
- **日志/可观测性**：开发环境 console 可选；生产无埋点
- **权限/安全/合规**：无 PII；无外部 API

---

## 四、数据与存储总约束

- **System of Record**：内存状态（React state + Game Engine）
- **缓存策略边界**：N/A
- **迁移/回滚原则**：N/A
- **详细设计位置**：N/A（无持久化）

---

## 五、跨 Feature 共享能力识别

N/A：单 Feature EPIC。

**Feature 规约编写顺序**：

| 顺序 | Feature | 依赖 |
|------|---------|------|
| 1 | FEAT-001 | 无 |

---

# 第二部分：各 Feature 技术规约

## FEAT-001 - 贪食蛇网页游戏

### 一、规约摘要

| 项 | 内容 |
|---|---|
| Feature 类型 | Product |
| 差距分析结论 | **Greenfield 新增** `apps/snake-game-web/`；复用 monorepo 内 Vite+React 工程模式（参考 `web-image-parser`） |
| 主要增量 | 游戏引擎（蛇/食物/碰撞/计分）、Canvas 渲染、键盘输入 |

### 二、增量约束

- 棋盘：固定网格（建议 20×20），每格等宽
- 游戏 tick：100ms（10 tick/s）
- 初始蛇长：3 格，居中，向右
- 方向输入：ArrowUp/Down/Left/Right + WASD；禁止 180° 立即反向
- 暂停：Space 或 UI 按钮
- 渲染：HTML Canvas 2D

### 三、能力边界与外部依赖

| 能力 | Owner | 边界 |
|------|-------|------|
| 游戏逻辑 | FEAT-001 | 纯函数 + class，可单测 |
| UI 壳层 | FEAT-001 | React 组件，不含业务算法 |
| 外部依赖 | — | 无 |

### 四、数据 / NFR / 安全硬约束

| ID | 硬约束 |
|----|--------|
| NFR-PERF-001 | 首屏 ≤ 3s（dev） |
| NFR-PERF-002 | tick 100ms ±10ms |
| NFR-SEC-001 | 无网络请求、无 PII |
| NFR-REL-001 | 刷新重置；标签切换不强制重置 |

### 五、详细设计位置

- 架构与 Story：`epic-design.md`
- KD：`key-func-design/KD_001_snake-game-engine.md`
