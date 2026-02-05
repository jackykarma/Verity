# 星光小镇 Starlit Town

EPIC-003 独立 HTML 游戏（FEAT-001 游戏基础框架与地图；FEAT-002 动效与交互体验能力已接入）。

## 运行方式

- **本地 HTTP 服务**（推荐，ES 模块需同源）：在项目根目录执行  
  `npx serve starlit-town -p 3750`  
  浏览器访问 `http://localhost:3750`
- 或使用任意静态服务器将 `starlit-town/` 作为根目录提供。

## 功能

- 入口页：开始游戏 / 继续上次进度
- 地图：家 / 学校 / 公园 / 商店 / 神秘森林 场景切换
- 每日循环：早上 → 白天 → 晚上
- 进度本地持久化（IndexedDB 优先，localStorage 降级）
- 动效与交互（FEAT-002）：统一点击反馈、场景切换过渡、降级配置（full/reduced/off）、动效队列防堆叠

## 目录结构

- `index.html` 入口
- `css/` 设计系统与页面样式（含动效变量与反馈类）
- `js/entry/` 入口视图，`js/map/` 地图视图，`js/game/` 状态与每日循环，`js/storage/` 存储抽象，`js/animations/` 动效组件与队列
- `assets/` 资源（预留）
