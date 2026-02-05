# 动效规范（FEAT-002）

## 时长

| 类型       | 上限   | CSS 变量                    |
|------------|--------|-----------------------------|
| 点击反馈   | ≤ 300ms | `--anim-duration-click` (280ms) |
| 场景/面板过渡 | ≤ 500ms | `--anim-duration-transition` (400ms) |

## 缓动

- **默认**：`--anim-easing` = `cubic-bezier(0.22, 1, 0.36, 1)`（ease-out）
- **可爱风弹性**：`--anim-easing-bounce` = `cubic-bezier(0.34, 1.56, 0.64, 1)`（轻微回弹）

## 可爱风原则

- 圆角：使用 design-system 的 `--radius-*`，避免直角
- 柔和色彩：使用 `--color-*` 变量
- 轻微弹性：点击反馈可用 scale 0.98 + 上述 bounce 缓动

## 资源预算

- 动效相关 CSS/JS/雪碧图总体积 ≤ 500KB（NFR-PERF-002）
- 非首屏动效可懒加载
