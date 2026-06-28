# EPIC 技术规格书（Tech Spec）：EPIC-007 - 星之卡比跳跃小游戏

**Epic**：EPIC-007 - 星之卡比跳跃小游戏
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
- 应用位于 `apps/kirby-platformer-web/`，与 `apps/snake-game-web/` 同级
- ESM 模块；`npm run dev` / `npm run build` / `npm test`
- 纯前端，无后端 API

---

## 二、跨 Feature 边界与依赖规则

- **分层原则**：Presentation（React 组件）→ Game Engine（纯 TS 逻辑）→ Types/Level Data
- **依赖方向**：UI 依赖 Game Engine；Game Engine 不依赖 React
- **Feature 边界**：FEAT-001 独占全部能力
- **跨层禁止项**：Game Engine 不得 import React

---

## 三、统一运行时约束

- **线程/协程**：单线程；游戏循环使用 `requestAnimationFrame` + React state
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

## FEAT-001 - 卡比跳跃网页游戏

### 一、规约摘要

| 项 | 内容 |
|---|---|
| Feature 类型 | Product |
| 差距分析结论 | **Greenfield 新增** `apps/kirby-platformer-web/`；复用 monorepo 内 Vite+React 工程模式（参考 `snake-game-web`） |
| 主要增量 | 平台跳跃引擎（物理/碰撞/镜头）、关卡数据、Canvas 渲染、键盘输入 |

### 二、增量约束

- 视口：800×480 px；关卡宽度 2400 px
- 物理：固定时间步 1/60s；重力 1800 px/s²；跳跃初速 -520 px/s；最大水平速度 220 px/s
- 卡比碰撞盒：32×32 px
- 输入：ArrowLeft/Right + A/D 移动；Space/ArrowUp/W 跳跃
- 暂停：Space（非跳跃时）或 UI 按钮；通关/失败后 Space 仅用于暂停逻辑禁用
- 渲染：HTML Canvas 2D；镜头 X = clamp(kirby.x - viewport/3, 0, levelWidth - viewport)
- 关卡元素：地面、浮空平台、星星（collectible）、终点旗杆、死亡线（y > levelHeight + 50）

### 三、能力边界与外部依赖

| 能力 | Owner | 边界 |
|------|-------|------|
| 游戏逻辑 | FEAT-001 | 纯 TS class，可单测 |
| UI 壳层 | FEAT-001 | React 组件，不含业务算法 |
| 外部依赖 | — | 无 |

### 四、数据 / NFR / 安全硬约束

| ID | 硬约束 |
|----|--------|
| NFR-PERF-001 | 首屏 ≤ 3s（dev） |
| NFR-PERF-002 | rAF 循环稳定，目标 60 FPS |
| NFR-SEC-001 | 无网络请求、无 PII |
| NFR-REL-001 | 刷新重置；标签切换不强制重置 |

### 五、详细设计位置

- 架构与 Story：`epic-design.md`
- KD：`key-func-design/KD_001_kirby-platformer-engine.md`
