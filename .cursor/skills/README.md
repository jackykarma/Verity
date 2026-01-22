# Android Bug 分析 Skills 系统

这是一套完整的 Android bug 分析和解决方案系统,包含 8 个专业的 skill,可以帮助您快速定位和解决各种类型的 Android bug。

## 系统架构

```
Bug Analysis (入口 Skill)
 ├─ Bug Classifier (分类器)
 ├─ Crash / ANR Specialist (崩溃和 ANR 专家)
 ├─ Performance Specialist (性能优化专家)
 ├─ Memory Specialist (内存问题专家)
 ├─ Concurrency Specialist (并发问题专家)
 ├─ UI / Rendering Specialist (UI 渲染专家)
 └─ Logic / State Specialist (逻辑和状态专家)
```

## Skills 说明

### 1. Bug Analysis (入口 Skill)
**文件:** `bug-analysis/SKILL.md`

**功能:**
- Bug 分析系统的入口点
- 协调各个专家 skill
- 生成完整的分析报告

**使用场景:**
- 收到 bug 报告时
- 需要系统性分析问题时
- 不确定 bug 类型时

**使用方法:**
```
用户: 应用在点击按钮时崩溃了,这是日志 [粘贴日志]
助手: 让我使用 bug-analysis skill 来分析这个问题
```

---

### 2. Bug Classifier (分类器)
**文件:** `bug-classifier/SKILL.md`

**功能:**
- 自动分析 bug 特征
- 将 bug 分类到正确的类型
- 推荐相应的专家 skill

**分类类型:**
- Crash / ANR
- Performance
- Memory
- Concurrency
- UI / Rendering
- Logic / State

**使用场景:**
- 需要确定 bug 类型
- 不确定应该调用哪个专家
- 多类型 bug 需要优先级排序

**使用方法:**
```
用户: 这个 bug 是什么类型的? [粘贴日志]
助手: 让我使用 bug-classifier 来分析
```

---

### 3. Crash / ANR Specialist
**文件:** `crash-anr-specialist/SKILL.md`

**功能:**
- 分析崩溃堆栈跟踪
- 定位 ANR 原因
- 提供修复方案

**处理的异常类型:**
- NullPointerException
- IndexOutOfBoundsException
- IllegalStateException
- ClassCastException
- ConcurrentModificationException
- ANR (Input/Broadcast/Service Timeout)

**使用场景:**
- 应用崩溃
- 出现 ANR
- 强制关闭
- 未捕获异常

**使用方法:**
```
用户: 应用崩溃了,这是堆栈跟踪 [粘贴堆栈]
助手: 让我使用 crash-anr-specialist 来分析
```

---

### 4. Performance Specialist
**文件:** `performance-specialist/SKILL.md`

**功能:**
- 分析性能瓶颈
- 优化启动时间
- 解决卡顿问题
- 提升帧率

**优化领域:**
- 启动性能
- UI 渲染性能
- RecyclerView 性能
- 内存性能
- CPU 性能

**使用场景:**
- 应用卡顿
- 启动慢
- 滑动不流畅
- 帧率下降
- CPU/内存占用高

**使用方法:**
```
用户: 列表滑动很卡
助手: 让我使用 performance-specialist 来分析
```

---

### 5. Memory Specialist
**文件:** `memory-specialist/SKILL.md`

**功能:**
- 检测内存泄漏
- 分析 OOM 原因
- 解决内存抖动
- 优化内存使用

**处理的问题:**
- Activity/Fragment 泄漏
- Handler 泄漏
- 监听器泄漏
- 单例泄漏
- Bitmap OOM
- 大对象 OOM

**使用场景:**
- OutOfMemoryError
- 内存持续增长
- 频繁 GC
- LeakCanary 报告泄漏

**使用方法:**
```
用户: 应用内存占用越来越高
助手: 让我使用 memory-specialist 来分析
```

---

### 6. Concurrency Specialist
**文件:** `concurrency-specialist/SKILL.md`

**功能:**
- 分析死锁问题
- 解决竞态条件
- 处理线程同步
- 优化协程使用

**处理的问题:**
- 死锁
- 竞态条件
- 数据竞争
- 线程安全问题
- 协程并发问题

**使用场景:**
- 应用卡死
- 数据不一致
- 偶发性错误
- ConcurrentModificationException
- 多线程问题

**使用方法:**
```
用户: 应用偶尔会卡死,难以复现
助手: 让我使用 concurrency-specialist 来分析
```

---

### 7. UI / Rendering Specialist
**文件:** `ui-rendering-specialist/SKILL.md`

**功能:**
- 分析布局问题
- 优化渲染性能
- 解决适配问题
- 处理 View 生命周期

**处理的问题:**
- 布局层级过深
- 过度绘制
- 界面显示错误
- 屏幕适配问题
- View 状态丢失
- Fragment 重叠

**使用场景:**
- 界面显示不正确
- 布局混乱
- 不同设备显示异常
- 配置变更后界面错乱

**使用方法:**
```
用户: 界面在平板上显示不正确
助手: 让我使用 ui-rendering-specialist 来分析
```

---

### 8. Logic / State Specialist
**文件:** `logic-state-specialist/SKILL.md`

**功能:**
- 分析业务逻辑错误
- 解决状态管理问题
- 处理数据校验
- 优化异步逻辑

**处理的问题:**
- 条件判断错误
- 状态不一致
- 数据校验失败
- 边界条件未处理
- 异步操作顺序错误

**使用场景:**
- 功能不符合预期
- 数据错误但不崩溃
- 状态丢失
- 计算结果不正确

**使用方法:**
```
用户: 购物车总价计算不正确
助手: 让我使用 logic-state-specialist 来分析
```

---

## 使用流程

### 标准流程

1. **报告 Bug**
   ```
   用户: [描述 bug 和提供日志]
   ```

2. **调用入口 Skill**
   ```
   助手: 让我使用 bug-analysis skill 来分析这个问题
   ```

3. **自动分类**
   - Bug Analysis 会调用 Bug Classifier
   - 确定 bug 类型和严重程度

4. **调用专家 Skill**
   - 根据分类结果调用相应的专家
   - 进行深度分析

5. **生成报告**
   - 整合分析结果
   - 提供修复方案
   - 给出预防建议

### 快速流程 (已知类型)

如果您已经知道 bug 类型,可以直接调用专家 skill:

```
用户: 应用崩溃了,NullPointerException [粘贴日志]
助手: 让我使用 crash-anr-specialist 来分析
```

---

## 示例场景

### 场景 1: 应用崩溃

**用户输入:**
```
应用在点击提交按钮时崩溃了,这是日志:

FATAL EXCEPTION: main
java.lang.NullPointerException: Attempt to invoke virtual method 
'java.lang.String com.example.User.getName()' on a null object reference
at com.example.MainActivity.updateUI(MainActivity.java:45)
```

**处理流程:**
1. Bug Analysis 收集信息
2. Bug Classifier 识别为 Crash 类型
3. Crash/ANR Specialist 分析堆栈
4. 定位到 User 对象为 null
5. 提供修复代码
6. 建议添加空值检查

---

### 场景 2: 性能问题

**用户输入:**
```
RecyclerView 滑动很卡顿,有时候会跳帧
```

**处理流程:**
1. Bug Analysis 收集性能数据
2. Bug Classifier 识别为 Performance 类型
3. Performance Specialist 分析
4. 检查 onBindViewHolder 耗时
5. 发现主线程加载图片
6. 提供优化方案

---

### 场景 3: 内存泄漏

**用户输入:**
```
LeakCanary 报告 Activity 泄漏:

MainActivity leaked
Leak trace:
- MainActivity (Activity)
- MyHandler (Handler)
- Runnable
```

**处理流程:**
1. Bug Analysis 识别为内存问题
2. Bug Classifier 确认为 Memory 类型
3. Memory Specialist 分析泄漏链
4. 识别 Handler 持有 Activity 引用
5. 提供使用 WeakReference 的方案

---

## 多类型 Bug 处理

某些 bug 可能涉及多个类型,系统会按优先级处理:

**优先级顺序:**
1. Crash/ANR (最高)
2. Memory
3. Performance
4. Concurrency
5. UI/Rendering
6. Logic/State

**示例:**
```
内存泄漏导致 OOM 最终崩溃

处理顺序:
1. Memory Specialist 找到泄漏源
2. Crash/ANR Specialist 确认崩溃点
3. 提供综合修复方案
```

---

## 最佳实践

### 1. 提供完整信息

- 完整的日志 (logcat)
- 复现步骤
- 设备信息
- 应用版本
- 用户操作序列

### 2. 使用正确的 Skill

- 不确定类型时使用 Bug Analysis
- 已知类型时直接使用专家 Skill
- 复杂问题可能需要多个专家协作

### 3. 验证修复

- 实施修复方案后测试
- 使用单元测试验证
- 长时间运行测试
- 不同设备测试

### 4. 预防措施

- 遵循专家建议的最佳实践
- 使用相应的调试工具
- 添加监控和日志
- 定期代码审查

---

## 调试工具推荐

### Crash / ANR
- Android Studio Debugger
- Logcat
- Firebase Crashlytics
- StrictMode

### Performance
- Android Profiler
- Systrace
- Layout Inspector
- GPU Profiling

### Memory
- Memory Profiler
- LeakCanary
- MAT (Memory Analyzer Tool)
- Heap Dump

### Concurrency
- Thread Dump
- StrictMode
- Thread Sanitizer

### UI / Rendering
- Layout Inspector
- GPU Overdraw
- Show Layout Bounds
- Hierarchy Viewer

### Logic / State
- Debugger
- Unit Tests
- Logging
- Assertions

---

## 贡献和反馈

如果您发现任何问题或有改进建议,欢迎反馈!

---

## 版本历史

- **v1.0** (2026-01-22)
  - 初始版本
  - 包含 8 个 skills
  - 完整的分析和解决方案系统
