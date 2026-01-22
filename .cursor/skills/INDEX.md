# Bug 分析 Skills 索引

快速查找和定位所需的 Skill 和解决方案。

---

## 📚 文档导航

### 入门文档
- **[QUICK_START.md](QUICK_START.md)** - 5 分钟快速入门
- **[README.md](README.md)** - 完整系统文档
- **[SUMMARY.md](SUMMARY.md)** - 系统总结和统计
- **[INDEX.md](INDEX.md)** - 本文件,快速索引

---

## 🎯 按问题类型查找

### 🔴 应用崩溃或无响应
**使用:** [crash-anr-specialist/SKILL.md](crash-anr-specialist/SKILL.md)

**适用症状:**
- 应用突然关闭
- "应用已停止运行"
- FATAL EXCEPTION
- ANR 对话框
- 无响应超过 5 秒

**常见异常:**
- NullPointerException
- IndexOutOfBoundsException
- IllegalStateException
- ClassCastException
- ConcurrentModificationException

---

### 🟡 应用卡顿或运行慢
**使用:** [performance-specialist/SKILL.md](performance-specialist/SKILL.md)

**适用症状:**
- 启动时间长 (> 3 秒)
- 滑动不流畅
- 掉帧 (Skipped frames)
- 操作响应慢
- 动画卡顿

**优化领域:**
- 启动性能
- UI 渲染
- RecyclerView
- 内存性能
- CPU 使用

---

### 🟠 内存占用高或泄漏
**使用:** [memory-specialist/SKILL.md](memory-specialist/SKILL.md)

**适用症状:**
- OutOfMemoryError
- 内存持续增长
- 频繁 GC
- LeakCanary 报告
- 应用越用越慢

**泄漏类型:**
- Activity 泄漏
- Fragment 泄漏
- Handler 泄漏
- 监听器泄漏
- Bitmap 泄漏

---

### 🟣 偶发性错误或数据不一致
**使用:** [concurrency-specialist/SKILL.md](concurrency-specialist/SKILL.md)

**适用症状:**
- 应用卡死
- 数据不一致
- 难以复现的错误
- ConcurrentModificationException
- 线程相关问题

**问题类型:**
- 死锁
- 竞态条件
- 数据竞争
- 线程安全
- 协程并发

---

### 🔵 界面显示不正确
**使用:** [ui-rendering-specialist/SKILL.md](ui-rendering-specialist/SKILL.md)

**适用症状:**
- 控件位置错误
- 布局混乱
- 不同设备显示异常
- 过度绘制
- 配置变更后界面错乱

**问题类型:**
- 布局层级过深
- 过度绘制
- 屏幕适配
- View 生命周期
- Fragment 重叠

---

### 🟢 功能逻辑错误
**使用:** [logic-state-specialist/SKILL.md](logic-state-specialist/SKILL.md)

**适用症状:**
- 计算结果不正确
- 功能不符合预期
- 数据校验失败
- 状态丢失
- 业务流程错误

**问题类型:**
- 条件判断错误
- 状态不一致
- 数据校验不完整
- 边界条件未处理
- 异步逻辑错误

---

### ❓ 不确定问题类型
**使用:** [bug-analysis/SKILL.md](bug-analysis/SKILL.md) → [bug-classifier/SKILL.md](bug-classifier/SKILL.md)

**流程:**
1. 使用 Bug Analysis 作为入口
2. 自动调用 Bug Classifier 分类
3. 推荐相应的专家 Skill
4. 生成完整分析报告

---

## 🔍 按异常类型查找

### NullPointerException
**Skill:** [crash-anr-specialist](crash-anr-specialist/SKILL.md)  
**章节:** 崩溃分析流程 → NullPointerException

### IndexOutOfBoundsException
**Skill:** [crash-anr-specialist](crash-anr-specialist/SKILL.md)  
**章节:** 崩溃分析流程 → IndexOutOfBoundsException

### IllegalStateException
**Skill:** [crash-anr-specialist](crash-anr-specialist/SKILL.md)  
**章节:** 崩溃分析流程 → IllegalStateException

### OutOfMemoryError
**Skill:** [memory-specialist](memory-specialist/SKILL.md)  
**章节:** OOM 问题解决方案

### ConcurrentModificationException
**Skill:** [concurrency-specialist](concurrency-specialist/SKILL.md)  
**章节:** 线程安全问题 → 非线程安全的集合

---

## 🛠️ 按场景查找

### 启动优化
**Skill:** [performance-specialist](performance-specialist/SKILL.md)  
**章节:** 启动性能问题

### RecyclerView 优化
**Skill:** [performance-specialist](performance-specialist/SKILL.md)  
**章节:** UI 渲染性能问题 → RecyclerView 滑动卡顿

### Activity 泄漏
**Skill:** [memory-specialist](memory-specialist/SKILL.md)  
**章节:** 常见内存泄漏场景 → Activity 泄漏

### Handler 泄漏
**Skill:** [memory-specialist](memory-specialist/SKILL.md)  
**章节:** 常见内存泄漏场景 → Handler 泄漏

### 死锁
**Skill:** [concurrency-specialist](concurrency-specialist/SKILL.md)  
**章节:** 常见并发问题 → 死锁

### 竞态条件
**Skill:** [concurrency-specialist](concurrency-specialist/SKILL.md)  
**章节:** 常见并发问题 → 竞态条件

### 布局优化
**Skill:** [ui-rendering-specialist](ui-rendering-specialist/SKILL.md)  
**章节:** 常见 UI 问题 → 布局问题

### 过度绘制
**Skill:** [ui-rendering-specialist](ui-rendering-specialist/SKILL.md)  
**章节:** 常见 UI 问题 → 过度绘制

### 屏幕适配
**Skill:** [ui-rendering-specialist](ui-rendering-specialist/SKILL.md)  
**章节:** 屏幕适配问题

### 状态管理
**Skill:** [logic-state-specialist](logic-state-specialist/SKILL.md)  
**章节:** 状态管理问题

### 数据校验
**Skill:** [logic-state-specialist](logic-state-specialist/SKILL.md)  
**章节:** 数据校验问题

---

## 🎓 按学习路径查找

### 初学者路径
1. **[QUICK_START.md](QUICK_START.md)** - 快速入门
2. **[crash-anr-specialist](crash-anr-specialist/SKILL.md)** - 最常见的崩溃问题
3. **[performance-specialist](performance-specialist/SKILL.md)** - 基础性能优化
4. **[ui-rendering-specialist](ui-rendering-specialist/SKILL.md)** - UI 基础

### 进阶路径
1. **[memory-specialist](memory-specialist/SKILL.md)** - 内存管理
2. **[concurrency-specialist](concurrency-specialist/SKILL.md)** - 并发编程
3. **[logic-state-specialist](logic-state-specialist/SKILL.md)** - 架构设计

### 专家路径
1. **[bug-classifier](bug-classifier/SKILL.md)** - 问题分类方法论
2. **[bug-analysis](bug-analysis/SKILL.md)** - 系统性分析方法
3. 所有专家 Skills 的高级技巧

---

## 📊 按代码量查找

### 最详细 (> 600 行)
1. **[performance-specialist](performance-specialist/SKILL.md)** - 700 行
2. **[concurrency-specialist](concurrency-specialist/SKILL.md)** - 650 行
3. **[crash-anr-specialist](crash-anr-specialist/SKILL.md)** - 600 行
4. **[memory-specialist](memory-specialist/SKILL.md)** - 600 行
5. **[logic-state-specialist](logic-state-specialist/SKILL.md)** - 600 行

### 中等详细 (400-600 行)
1. **[ui-rendering-specialist](ui-rendering-specialist/SKILL.md)** - 550 行
2. **[bug-classifier](bug-classifier/SKILL.md)** - 400 行

### 简洁 (< 400 行)
1. **[bug-analysis](bug-analysis/SKILL.md)** - 200 行

---

## 🔧 按工具查找

### Android Studio Profiler
- **[performance-specialist](performance-specialist/SKILL.md)** - CPU/内存分析
- **[memory-specialist](memory-specialist/SKILL.md)** - Memory Profiler

### LeakCanary
- **[memory-specialist](memory-specialist/SKILL.md)** - 内存泄漏检测

### Layout Inspector
- **[ui-rendering-specialist](ui-rendering-specialist/SKILL.md)** - 布局分析

### StrictMode
- **[performance-specialist](performance-specialist/SKILL.md)** - 性能监控
- **[concurrency-specialist](concurrency-specialist/SKILL.md)** - 线程违规检测

### Logcat
- **[crash-anr-specialist](crash-anr-specialist/SKILL.md)** - 崩溃日志分析
- 所有 Skills - 日志分析

---

## 📱 按 Android 版本查找

### Android 12+ 特性
- **[ui-rendering-specialist](ui-rendering-specialist/SKILL.md)** - 刘海屏适配
- **[performance-specialist](performance-specialist/SKILL.md)** - 启动优化

### Android 11+ 特性
- **[memory-specialist](memory-specialist/SKILL.md)** - 内存管理
- **[ui-rendering-specialist](ui-rendering-specialist/SKILL.md)** - 折叠屏适配

### 通用版本
- 所有 Skills 适用于 Android 5.0+

---

## 🎯 快速查找表

| 症状 | Skill | 章节 |
|------|-------|------|
| 应用崩溃 | crash-anr-specialist | 崩溃分析流程 |
| ANR | crash-anr-specialist | ANR 分析流程 |
| 启动慢 | performance-specialist | 启动性能问题 |
| 卡顿 | performance-specialist | UI 渲染性能 |
| 内存泄漏 | memory-specialist | 内存泄漏场景 |
| OOM | memory-specialist | OOM 解决方案 |
| 死锁 | concurrency-specialist | 死锁 |
| 数据不一致 | concurrency-specialist | 竞态条件 |
| 布局错误 | ui-rendering-specialist | 布局问题 |
| 适配问题 | ui-rendering-specialist | 屏幕适配 |
| 逻辑错误 | logic-state-specialist | 业务逻辑错误 |
| 状态丢失 | logic-state-specialist | 状态管理 |

---

## 🔗 相关资源

### 官方文档
- [Android Developers](https://developer.android.com/)
- [Kotlin Documentation](https://kotlinlang.org/docs/)
- [Jetpack Guide](https://developer.android.com/jetpack)

### 推荐工具
- [Android Studio](https://developer.android.com/studio)
- [LeakCanary](https://square.github.io/leakcanary/)
- [Stetho](https://facebook.github.io/stetho/)

### 社区资源
- [Stack Overflow](https://stackoverflow.com/questions/tagged/android)
- [Reddit r/androiddev](https://www.reddit.com/r/androiddev/)
- [Android Weekly](https://androidweekly.net/)

---

## 💡 使用提示

### 快速定位
1. 确定问题症状
2. 在本索引中查找对应章节
3. 直接跳转到相关 Skill
4. 查看具体解决方案

### 深度学习
1. 从 QUICK_START 开始
2. 阅读完整的 README
3. 深入学习相关 Skill
4. 实践和验证

### 问题反馈
如果找不到需要的内容:
1. 查看 README 的完整目录
2. 使用文本搜索功能
3. 查看 SUMMARY 了解系统全貌

---

**最后更新:** 2026-01-22  
**版本:** 1.0  
**Skills 数量:** 8 个  
**文档数量:** 11 个
