---
name: bug-classifier
description: Android bug 自动分类器。分析 bug 症状、日志和行为,将其分类为崩溃、性能、内存、并发、UI 或逻辑问题,并推荐相应的专家 skill。当需要确定 bug 类型或选择分析方向时使用。
---

# Bug Classifier - Android Bug 分类器

自动分析 bug 特征并分类到正确的专家领域。

## 分类决策树

### 1. Crash / ANR 类型

**关键特征:**
- 应用强制关闭 (Force Close)
- "Application Not Responding" 对话框
- 进程终止
- 堆栈跟踪显示异常

**日志关键词:**
```
FATAL EXCEPTION
AndroidRuntime: FATAL
java.lang.RuntimeException
java.lang.NullPointerException
java.lang.IndexOutOfBoundsException
ANR in
Input dispatching timed out
```

**推荐 Skill:** `crash-anr-specialist`

---

### 2. Performance 类型

**关键特征:**
- 应用卡顿、响应慢
- 启动时间长
- 帧率下降 (< 60 FPS)
- UI 冻结但不崩溃
- 操作延迟

**日志关键词:**
```
Skipped frames
Choreographer: Skipped
slow operation
GC_FOR_ALLOC
long time
timeout (但不是 ANR)
```

**性能指标:**
- 启动时间 > 3 秒
- 帧率 < 60 FPS
- CPU 使用率 > 80%
- 主线程阻塞 > 16ms

**推荐 Skill:** `performance-specialist`

---

### 3. Memory 类型

**关键特征:**
- OutOfMemoryError
- 内存持续增长
- 应用被系统杀死
- 内存泄漏
- Bitmap 相关错误

**日志关键词:**
```
OutOfMemoryError
OOM
java.lang.OutOfMemoryError
GC_FOR_ALLOC
Failed to allocate
onTrimMemory
onLowMemory
```

**内存指标:**
- 内存占用持续增长
- GC 频繁触发
- 可用堆内存 < 10%

**推荐 Skill:** `memory-specialist`

---

### 4. Concurrency 类型

**关键特征:**
- 死锁
- 竞态条件
- 数据不一致
- 线程同步问题
- 偶发性问题 (难以复现)

**日志关键词:**
```
deadlock
thread
synchronized
ConcurrentModificationException
IllegalStateException (在多线程场景)
NetworkOnMainThreadException
```

**代码特征:**
- 多个线程访问共享资源
- 使用 synchronized, volatile, Lock
- 异步操作和回调
- RxJava, Coroutines 相关

**推荐 Skill:** `concurrency-specialist`

---

### 5. UI / Rendering 类型

**关键特征:**
- 界面显示错误
- 布局混乱
- 控件位置不正确
- 渲染异常
- 动画卡顿
- 视觉错误

**日志关键词:**
```
View
Layout
inflate
measure
draw
CalledFromWrongThreadException
Only the original thread that created a view hierarchy can touch its views
```

**视觉问题:**
- 控件重叠
- 文字被截断
- 图片不显示
- 颜色错误
- 适配问题

**推荐 Skill:** `ui-rendering-specialist`

---

### 6. Logic / State 类型

**关键特征:**
- 功能不符合预期
- 数据错误但不崩溃
- 业务流程错误
- 状态管理问题
- 计算结果错误

**特征:**
- 没有崩溃或性能问题
- 逻辑错误
- 状态不一致
- 数据校验失败
- 业务规则违反

**推荐 Skill:** `logic-state-specialist`

---

## 分类流程

### 步骤 1: 初步筛选

```
是否有崩溃或 ANR?
  ├─ 是 → Crash/ANR 类型
  └─ 否 → 继续

是否有 OOM 或内存相关错误?
  ├─ 是 → Memory 类型
  └─ 否 → 继续

是否有性能问题 (卡顿、慢)?
  ├─ 是 → Performance 类型
  └─ 否 → 继续

是否涉及多线程或并发?
  ├─ 是 → Concurrency 类型
  └─ 否 → 继续

是否是 UI 显示问题?
  ├─ 是 → UI/Rendering 类型
  └─ 否 → Logic/State 类型
```

### 步骤 2: 分析日志

1. 搜索关键异常和错误
2. 检查堆栈跟踪
3. 查看性能指标
4. 识别问题模式

### 步骤 3: 确定严重程度

| 级别 | 定义 | 示例 |
|------|------|------|
| **Critical** | 导致崩溃或数据丢失 | Crash, ANR, OOM |
| **High** | 严重影响用户体验 | 主功能不可用、严重卡顿 |
| **Medium** | 影响部分功能 | 次要功能异常、轻微卡顿 |
| **Low** | 轻微影响 | UI 小瑕疵、边缘场景问题 |

### 步骤 4: 输出分类结果

```markdown
## Bug 分类结果

**主要类型:** [类型名称]
**严重程度:** [Critical/High/Medium/Low]
**推荐专家:** [专家 skill 名称]

**次要类型:** [如果有多个类型]

**关键证据:**
- [日志片段 1]
- [日志片段 2]
- [性能指标]

**分析建议:**
[调用专家 skill 的具体建议]
```

## 复杂场景处理

### 多类型 Bug

某些 bug 可能涉及多个类型:

**示例: 内存泄漏导致 OOM 崩溃**
- 主要类型: Memory
- 次要类型: Crash
- 分析顺序: 先用 Memory Specialist 找泄漏,再确认崩溃点

**示例: 主线程阻塞导致 ANR**
- 主要类型: Performance
- 次要类型: Crash (ANR)
- 分析顺序: 先用 Performance Specialist 找阻塞原因

### 不明确的 Bug

如果无法明确分类:

1. 收集更多信息
2. 尝试复现
3. 使用最相关的专家 skill
4. 必要时调用多个专家协作

## 分类示例

### 示例 1: NullPointerException

**输入:**
```
FATAL EXCEPTION: main
java.lang.NullPointerException: Attempt to invoke virtual method 
'java.lang.String com.example.User.getName()' on a null object reference
at com.example.MainActivity.updateUI(MainActivity.java:45)
```

**输出:**
```markdown
**主要类型:** Crash / ANR
**严重程度:** Critical
**推荐专家:** crash-anr-specialist

**关键证据:**
- FATAL EXCEPTION 导致应用崩溃
- NullPointerException 在 MainActivity.updateUI()
- 空对象引用

**分析建议:**
使用 crash-anr-specialist 分析:
1. 检查 User 对象的初始化
2. 添加空值检查
3. 追溯 User 对象来源
```

### 示例 2: 列表滑动卡顿

**输入:**
```
用户报告: 列表滑动时明显卡顿
日志: Choreographer: Skipped 45 frames! The application may be doing too much work on its main thread.
```

**输出:**
```markdown
**主要类型:** Performance
**严重程度:** High
**推荐专家:** performance-specialist

**关键证据:**
- Skipped 45 frames (严重掉帧)
- 主线程工作过多
- 列表滑动场景

**分析建议:**
使用 performance-specialist 分析:
1. 检查 RecyclerView Adapter 的 onBindViewHolder
2. 查找主线程的耗时操作
3. 分析布局复杂度
4. 检查图片加载
```

### 示例 3: 内存持续增长

**输入:**
```
用户报告: 应用使用一段时间后变慢,最终崩溃
Memory Profiler: 内存从 50MB 增长到 380MB
日志: GC_FOR_ALLOC freed 2MB, 8% free 372MB/380MB
```

**输出:**
```markdown
**主要类型:** Memory
**次要类型:** Performance (内存增长导致 GC 频繁)
**严重程度:** High
**推荐专家:** memory-specialist

**关键证据:**
- 内存持续增长 (50MB → 380MB)
- 频繁 GC
- 最终导致崩溃

**分析建议:**
使用 memory-specialist 分析:
1. 使用 Memory Profiler 查找泄漏
2. 检查 Activity/Fragment 泄漏
3. 检查 Bitmap 和大对象
4. 分析对象引用链
```

## 输出模板

```markdown
# Bug 分类报告

## 分类结果
- **主要类型:** [类型]
- **次要类型:** [如果有]
- **严重程度:** [级别]
- **推荐专家:** [skill 名称]

## 关键证据
[列出支持分类的证据]

## 下一步行动
1. 调用 [专家 skill] 进行深度分析
2. [其他建议]

## 注意事项
[特殊情况说明]
```

## 分类准确性提示

- 优先基于日志和堆栈跟踪,而非用户描述
- 崩溃和 ANR 始终是最高优先级
- 内存问题可能伪装成性能问题
- 并发问题通常难以复现
- 不确定时,选择最接近的类型并说明不确定性
