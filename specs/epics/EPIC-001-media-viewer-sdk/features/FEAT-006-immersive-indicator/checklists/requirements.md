# 需求质量清单：FEAT-006 沉浸式体验与 Indicator

**Feature ID**：FEAT-006
**Feature 名称**：沉浸式体验与 Indicator
**关联 spec.md**：`specs/epics/EPIC-001-media-viewer-sdk/features/FEAT-006-immersive-indicator/spec.md`
**检查时间**：2026-03-22
**检查状态**：通过

---

## 一、FR 质量检查

> 规则：每条 FR 必须可测试，不得出现"提升体验/更稳定/更快"等不可验证表述；每条 FR 须有对应 AC。

| FR ID | FR 摘要 | 是否可测试 | 对应 AC | 问题/备注 |
|---|---|---|---|---|
| FR-001 | edge-to-edge 布局，内容延伸至系统栏下方 | 是 | AC-049 | 无 |
| FR-002 | 透传 WindowInsets 数值给接入方 | 是 | AC-052 | 无 |
| FR-003 | 单击非媒体区域触发 `onTapOutsideMedia` | 是 | AC-050 | 无 |
| FR-004 | 媒体手势及长按实况图期间不触发 `onTapOutsideMedia` | 是 | AC-050 | 无 |
| FR-005 | SDK 不操作系统栏显隐，控制权归接入方 | 是 | 隐含于 AC-049～AC-052 | 可通过检查 SDK 源码无 WindowInsetsController 调用验证 |
| FR-006 | 提供默认横线 Indicator，当前页高亮，底部 24dp | 是 | AC-053 | 无 |
| FR-007 | 提供 `IndicatorAdapter` 接口，注册后替换默认样式 | 是 | AC-054、AC-056 | 无 |
| FR-008 | 翻页/进度变化时在主线程回调 Adapter | 是 | AC-054、AC-055 | 主线程验证可通过断言 `Looper.myLooper() == Looper.getMainLooper()` |
| FR-009 | Indicator 支持脱离 SDK 容器独立放置 | 是 | AC-056（含自定义场景） | 无 |
| FR-010 | `setIndicatorVisible(Boolean)` 控制整体显隐 | 是 | AC-051、AC-057 | 无 |
| FR-011 | Indicator 支持进度显示（0.0～1.0） | 是 | AC-055 | 无 |

**FR 质量结论**：全部 11 条 FR 均可测试，每条均有对应 AC，无模糊表述。通过。

---

## 二、NFR 质量检查

> 规则：每条 NFR 必须量化并附带可操作的验收方式。

| NFR ID | 类别 | 量化指标 | 验收方式 | 是否量化 | 问题/备注 |
|---|---|---|---|---|---|
| NFR-PERF-001 | 性能 | 帧率 ≥ 60fps，p99 帧耗时 ≤ 16.6ms | Android Profiler / Perfetto | 是 | 无 |
| NFR-PERF-002 | 性能 | 回调延迟 p95 ≤ 50ms | 埋点计时或 Systrace | 是 | 无 |
| NFR-POWER-001 | 功耗 | 额外功耗增量为 0（无独立计时器/Coroutine） | Battery Historian，无额外 WakeLock | 是 | 无 |
| NFR-MEM-001 | 内存 | 默认 Indicator 增量 ≤ 2MB，无泄漏 | LeakCanary + Heap Dump | 是 | 无 |
| NFR-SEC-001 | 安全隐私 | 不读取接入方 UI 内容，insets 只读 | 代码审查 + 静态分析 | 是（定性可验证） | 无 |
| NFR-SEC-002 | 安全隐私 | 回调仅传 Int+Float，无需额外权限 | 权限声明检查 + 回调参数审查 | 是 | 无 |
| NFR-OBS-001 | 可观测性 | 关键事件输出 Debug 日志，TAG 统一 | 日志过滤验证 | 是（定性可验证） | 无 |
| NFR-OBS-002 | 可观测性 | `onTapOutsideMedia` 触发时记录坐标+页码 | 日志验证 | 是 | 无 |
| NFR-REL-001 | 可靠性 | API 26 及以上不崩溃，使用 WindowInsetsCompat | API 26 模拟器/真机验证 AC-049、AC-052 | 是 | 无 |
| NFR-REL-002 | 可靠性 | 接入方回调异常时 SDK 不崩溃，降级记录日志 | 模拟接入方回调抛异常的单元测试 | 是 | 无 |
| NFR-REL-003 | 可靠性 | 配置变更后 Indicator 页码/可见状态正确恢复 | 旋转屏幕后验证 Indicator 状态 | 是 | 无 |

**NFR 质量结论**：全部 11 条 NFR 均已量化或提供可操作验收方式，覆盖性能/功耗/内存/安全隐私/可观测性/可靠性六类。通过。

---

## 三、AC 完整性检查

> 规则：每条 AC 须可验证，须引用对应 FR/NFR ID；与 Epic 输入的关键 AC 对齐。

| AC ID | 引用 FR/NFR | 是否可验证 | 与 Epic 关键 AC 对齐 | 问题/备注 |
|---|---|---|---|---|
| AC-049 | FR-001 | 是 | 对齐 Epic AC-049 | 无 |
| AC-050 | FR-003、FR-004 | 是 | 对齐 Epic AC-050 | 无 |
| AC-051 | FR-010 | 是 | 对齐 Epic AC-051 | 无 |
| AC-052 | FR-002 | 是 | 对齐 Epic AC-052 | 无 |
| AC-053 | FR-006 | 是 | 对齐 Epic AC-053 | 无 |
| AC-054 | FR-007、FR-008 | 是 | 对齐 Epic AC-054 | 无 |
| AC-055 | FR-011、NFR-PERF-001 | 是 | 对齐 Epic AC-055 | 无 |
| AC-056 | FR-007 | 是 | 对齐 Epic AC-056 | 无 |
| AC-057 | FR-010 | 是 | 对齐 Epic AC-057 | 无 |

**AC 完整性结论**：9 条 AC 全部来源于 Epic 关键 AC 要求（AC-049～AC-057），每条均引用 FR/NFR，均可验证。通过。

---

## 四、核心用户旅程覆盖检查

| 旅程 | 描述 | 覆盖 FR | 验收场景数量 | 是否充分 |
|---|---|---|---|---|
| 旅程 1 - 沉浸模式切换 | 点击非媒体区域触发菜单显隐，内容延伸无黑边 | FR-001、FR-002、FR-003、FR-004、FR-005 | 5 个 | 是 |
| 旅程 2 - Indicator 翻页同步与幻灯片进度 | 翻页高亮同步，幻灯片进度填充，自定义 Adapter | FR-006～FR-011 | 5 个 | 是 |

**旅程覆盖结论**：2 条核心用户旅程满足最低 2 个要求，FR 覆盖完整（沉浸类 FR-001～FR-005，Indicator 类 FR-006～FR-011）。通过。

---

## 五、边界场景覆盖检查

| 边界场景 | 是否覆盖 | 期望行为描述 | 问题/备注 |
|---|---|---|---|
| 宿主 Activity 未启用 edge-to-edge | 是 | 功能退化，不崩溃 | 无 |
| 未注册 `onTapOutsideMedia` 回调 | 是 | 不报错，无默认行为 | 无 |
| 未注册自定义 `IndicatorAdapter` | 是 | 显示默认样式，SDK 内部处理 | 无 |
| Item 数量为 1 | 是 | 单个单元，不崩溃 | 无 |
| Item 数量为 0 | 是 | 不显示单元，不崩溃 | 无 |
| 幻灯片进度回调线程安全 | 是 | 主线程回调，接入方可直接操作 View | 无 |
| 快速连续翻页 | 是 | 跟随最终落页，不闪烁 | 无 |
| Activity 旋转/配置变更 | 是 | 页码/可见状态正确恢复 | 无 |

**边界场景结论**：8 个边界场景均已覆盖，包含 Edge Case（0 个 Item）、生命周期（旋转）、线程安全、手势冲突等关键维度。通过。

---

## 六、依赖关系完整性检查

| 依赖项 | 类型 | 接口契约 | 故障模式是否已描述 | 问题/备注 |
|---|---|---|---|---|
| FEAT-002（Media Pager） | 上游 | 翻页回调接口（currentIndex, itemCount） | 是（FEAT-002 未集成则 onPageChanged 不触发） | 无 |
| FEAT-007（幻灯片，间接） | 上游 | onProgressChanged(progress: Float) | 是（FEAT-007 未集成则退化为静态 Indicator） | 无 |
| 宿主 Activity edge-to-edge | 外部前提 | WindowCompat.setDecorFitsSystemWindows | 是（未启用则功能退化，不崩溃） | 无 |
| FEAT-009（事件回调） | 下游 | 接口命名与交付时机对齐 | 暂无独立故障模式（属接口协调） | 无 |

**依赖完整性结论**：上游依赖（FEAT-002、FEAT-007）和外部前提（edge-to-edge）均已明确契约与故障模式，下游影响（FEAT-007、FEAT-009、接入方）已列明。通过。

---

## 七、范围边界检查

| 能力点 | In Scope | Out of Scope | 是否明确 |
|---|---|---|---|
| edge-to-edge 布局 | 是 | — | 是 |
| 透传 insets 数值 | 是 | — | 是 |
| 系统栏显隐操作 | 否 | 是（接入方执行） | 是 |
| 菜单 UI | 否 | 是（接入方实现） | 是 |
| 默认 Indicator | 是 | — | 是 |
| 自定义 IndicatorAdapter | 是 | — | 是 |
| 幻灯片计时逻辑 | 否 | 是（归 FEAT-007） | 是 |
| onTapOutsideMedia 回调 | 是 | — | 是 |
| Indicator 脱离容器独立放置 | 是 | — | 是 |

**范围边界结论**：In Scope 与 Out of Scope 边界清晰，系统栏控制权归属、菜单 UI、幻灯片计时三项易产生歧义的范围均已明确排除。通过。

---

## 八、整体评估结论

| 检查维度 | 结论 | 问题数量 |
|---|---|---|
| FR 质量（可测试性 + AC 覆盖） | 通过 | 0 |
| NFR 质量（量化 + 验收方式） | 通过 | 0 |
| AC 完整性（与 Epic 对齐） | 通过 | 0 |
| 核心用户旅程覆盖 | 通过 | 0 |
| 边界场景覆盖 | 通过 | 0 |
| 依赖关系完整性 | 通过 | 0 |
| 范围边界清晰度 | 通过 | 0 |

**整体结论**：FEAT-006 spec.md 质量良好，无阻塞性问题，可进入 Plan 阶段审批。
