# Bug 分析 Skills 快速入门

## 5 分钟快速上手

### 第 1 步: 识别您的问题

选择最符合您情况的描述:

- 🔴 **应用崩溃或无响应** → 使用 `crash-anr-specialist`
- 🟡 **应用卡顿或运行慢** → 使用 `performance-specialist`
- 🟠 **内存占用高或泄漏** → 使用 `memory-specialist`
- 🟣 **偶发性错误或数据不一致** → 使用 `concurrency-specialist`
- 🔵 **界面显示不正确** → 使用 `ui-rendering-specialist`
- 🟢 **功能逻辑错误** → 使用 `logic-state-specialist`
- ❓ **不确定问题类型** → 使用 `bug-analysis` (入口)

### 第 2 步: 准备信息

收集以下信息:

**必需:**
- Bug 描述
- 复现步骤
- 日志 (logcat)

**可选但有用:**
- 设备型号和 Android 版本
- 应用版本
- 截图或录屏
- 堆栈跟踪
- 性能数据

### 第 3 步: 请求分析

**方式 1: 使用入口 Skill (推荐新手)**
```
用户: 请使用 bug-analysis skill 分析这个问题:

[描述问题]
[粘贴日志]
```

**方式 2: 直接使用专家 Skill (推荐熟练用户)**
```
用户: 请使用 crash-anr-specialist 分析这个崩溃:

[粘贴堆栈跟踪]
```

---

## 常见场景示例

### 场景 1: 应用崩溃 (最常见)

**症状:**
- 应用突然关闭
- 显示 "应用已停止运行"
- Logcat 显示 "FATAL EXCEPTION"

**如何使用:**
```
用户: 应用崩溃了,请帮我分析:

FATAL EXCEPTION: main
java.lang.NullPointerException: Attempt to invoke virtual method 
'java.lang.String com.example.User.getName()' on a null object reference
at com.example.MainActivity.updateUI(MainActivity.java:45)
at com.example.MainActivity.onCreate(MainActivity.java:30)
```

**期望输出:**
- 问题类型: NullPointerException
- 根因: User 对象为 null
- 修复代码
- 预防建议

---

### 场景 2: 列表滑动卡顿

**症状:**
- RecyclerView 滑动不流畅
- 掉帧
- Logcat 显示 "Skipped frames"

**如何使用:**
```
用户: RecyclerView 滑动很卡,请帮我优化:

Choreographer: Skipped 45 frames! The application may be doing 
too much work on its main thread.

[粘贴 Adapter 代码]
```

**期望输出:**
- 性能瓶颈分析
- onBindViewHolder 优化建议
- 具体优化代码
- 性能提升预期

---

### 场景 3: 内存泄漏

**症状:**
- 应用使用时间越长越慢
- 最终 OOM 崩溃
- LeakCanary 报告泄漏

**如何使用:**
```
用户: LeakCanary 报告 Activity 泄漏:

MainActivity leaked
Leak trace:
- MainActivity (Activity)
- MyHandler (Handler)
- Runnable (anonymous class)

[粘贴相关代码]
```

**期望输出:**
- 泄漏链分析
- 泄漏原因
- 修复方案 (使用 WeakReference)
- 内存管理最佳实践

---

### 场景 4: ANR (应用无响应)

**症状:**
- 应用卡住不动
- 显示 "应用无响应" 对话框
- 5 秒内未响应触摸

**如何使用:**
```
用户: 应用出现 ANR:

ANR in com.example.myapp (com.example.myapp/.MainActivity)
PID: 12345
Reason: Input dispatching timed out

[粘贴 ANR trace]
```

**期望输出:**
- 主线程阻塞分析
- 阻塞代码定位
- 异步处理方案
- 性能优化建议

---

### 场景 5: 界面显示错误

**症状:**
- 控件位置不对
- 不同设备显示不一致
- 布局混乱

**如何使用:**
```
用户: 界面在平板上显示不正确:

[上传截图]

布局文件:
[粘贴 XML 代码]
```

**期望输出:**
- 布局问题分析
- 适配方案
- 优化后的布局代码
- 多设备测试建议

---

### 场景 6: 业务逻辑错误

**症状:**
- 计算结果不正确
- 功能不符合预期
- 数据不一致

**如何使用:**
```
用户: 购物车总价计算不正确:

期望: 100 + 50 = 150
实际: 显示 100

[粘贴计算逻辑代码]
```

**期望输出:**
- 逻辑错误分析
- 修复代码
- 单元测试建议
- 边界条件处理

---

## 技巧和窍门

### 技巧 1: 提供完整日志

**不好:**
```
用户: 应用崩溃了
```

**好:**
```
用户: 应用崩溃了,这是完整的堆栈跟踪:

[完整的 logcat 输出,包括异常类型、消息和堆栈]
```

### 技巧 2: 说明复现步骤

**不好:**
```
用户: 有时候会崩溃
```

**好:**
```
用户: 崩溃复现步骤:
1. 打开应用
2. 点击 "我的" 标签
3. 点击 "设置"
4. 点击 "退出登录"
5. 应用崩溃
```

### 技巧 3: 提供相关代码

**不好:**
```
用户: MainActivity 有问题
```

**好:**
```
用户: MainActivity.onCreate() 崩溃:

[粘贴 onCreate 方法的完整代码]
```

### 技巧 4: 说明设备信息

**不好:**
```
用户: 在某些设备上有问题
```

**好:**
```
用户: 问题出现在:
- 小米 11 (Android 12)
- 华为 P40 (Android 10)

不出现在:
- 三星 S21 (Android 13)
```

---

## 常见问题 (FAQ)

### Q1: 我应该使用哪个 Skill?

**A:** 如果不确定,使用 `bug-analysis` (入口 Skill),它会自动调用 `bug-classifier` 来确定类型。

### Q2: 可以同时使用多个 Skill 吗?

**A:** 可以! 某些复杂问题可能需要多个专家协作。例如,内存泄漏导致的 OOM 崩溃需要 Memory Specialist 和 Crash Specialist。

### Q3: 如果没有日志怎么办?

**A:** 尽可能提供详细的问题描述和复现步骤。但强烈建议提供日志,这样可以更准确地定位问题。

**获取日志:**
```bash
adb logcat > log.txt
```

### Q4: Skill 会自动修复代码吗?

**A:** Skill 会提供详细的修复方案和代码示例,但需要您手动应用修复。这样可以确保您理解修复的原因。

### Q5: 如何提高分析准确性?

**A:** 提供更多信息:
- 完整的日志
- 相关代码
- 复现步骤
- 设备信息
- 应用版本

---

## 下一步

### 深入学习

阅读完整的 Skill 文档:
- `bug-analysis/SKILL.md` - 系统概述
- `bug-classifier/SKILL.md` - 分类逻辑
- 各个专家 Skill 的 SKILL.md - 详细解决方案

### 实践练习

尝试分析一些常见问题:
1. 创建一个会崩溃的简单应用
2. 使用 Skill 分析和修复
3. 验证修复效果

### 工具准备

安装推荐的调试工具:
- Android Studio Profiler
- LeakCanary
- Layout Inspector
- Logcat

---

## 获取帮助

如果遇到问题:
1. 查看 `README.md` 了解系统架构
2. 阅读具体 Skill 的文档
3. 提供更详细的信息重新分析

---

**祝您 Bug 分析顺利! 🚀**
