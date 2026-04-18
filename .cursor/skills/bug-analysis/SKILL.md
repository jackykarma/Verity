---
name: bug-analysis
description: Android bug 分析入口工具。自动分类 bug 类型并调用相应的专家 skill 进行深度分析。适用于崩溃、ANR、性能问题、内存泄漏、并发问题、UI 渲染和逻辑状态错误。当用户报告 bug、应用崩溃、性能下降或任何异常行为时使用。
---

# Bug Analysis - Android Bug 分析入口

这是 Android bug 分析系统的入口 skill,负责接收 bug 报告并协调专家 skill 进行分析。

## 工作流程

### 第 1 步: 收集 Bug 信息

首先收集以下信息:

**必需信息:**
- Bug 描述和复现步骤
- 发生时间和频率
- 影响的 Android 版本和设备
- 日志文件 (logcat, crash logs, ANR traces)

**可选但有用的信息:**
- 用户操作序列
- 网络状态
- 应用版本
- 相关的代码提交
- 性能指标 (CPU, 内存, 电池)

### 第 2 步: 调用分类器

使用 `bug-classifier` skill 对 bug 进行分类:

```markdown
请使用 bug-classifier skill 分析以下 bug:
[粘贴收集到的 bug 信息]
```

分类器会返回 bug 类型和建议的专家 skill。

### 第 3 步: 调用专家 Skill

根据分类结果,调用相应的专家 skill:

| Bug 类型 | 专家 Skill | 何时使用 |
|---------|-----------|---------|
| Crash / ANR | `crash-anr-specialist` | 应用崩溃、无响应、强制关闭 |
| Performance | `performance-specialist` | 卡顿、慢启动、帧率下降 |
| Memory | `memory-specialist` | 内存泄漏、OOM、内存占用过高 |
| Concurrency | `concurrency-specialist` | 死锁、竞态条件、线程问题 |
| UI/Rendering | `ui-rendering-specialist` | 界面错乱、渲染问题、布局异常 |
| Logic/State | `logic-state-specialist` | 业务逻辑错误、状态不一致 |

### 第 4 步: 生成分析报告

整合专家分析结果,生成完整的 bug 分析报告:

```markdown
# Bug 分析报告

## Bug 概述
- **类型**: [Bug 类型]
- **严重程度**: [Critical/High/Medium/Low]
- **影响范围**: [受影响的功能和用户]

## 根因分析
[专家 skill 提供的根因分析]

## 解决方案
### 短期修复
[快速修复方案]

### 长期优化
[根本性改进方案]

## 预防措施
[避免类似问题的建议]

## 测试建议
[验证修复的测试方案]
```

## 快速启动示例

**场景 1: 应用崩溃**
```
用户: 应用在点击提交按钮时崩溃了

助手: 让我分析这个崩溃问题。
1. 先收集 logcat 日志
2. 使用 bug-classifier 确认是崩溃类型
3. 调用 crash-anr-specialist 进行深度分析
4. 生成修复方案
```

**场景 2: 性能问题**
```
用户: 列表滑动很卡顿

助手: 让我分析这个性能问题。
1. 收集性能指标 (帧率、CPU、内存)
2. 使用 bug-classifier 确认是性能类型
3. 调用 performance-specialist 进行分析
4. 提供优化建议
```

## 多类型 Bug 处理

如果一个 bug 涉及多个类型,按优先级处理:

1. **Crash/ANR** - 最高优先级,先解决崩溃
2. **Memory** - 次高优先级,可能导致崩溃
3. **Performance** - 影响用户体验
4. **Concurrency** - 可能导致其他问题
5. **UI/Rendering** - 视觉问题
6. **Logic/State** - 功能问题

## 协作模式

各专家 skill 之间可以互相协作:

- Memory Specialist 可能发现并发问题 → 调用 Concurrency Specialist
- Performance Specialist 可能发现内存问题 → 调用 Memory Specialist
- Crash Specialist 可能发现 UI 问题 → 调用 UI Specialist

## 输出格式

始终提供:
1. **问题摘要** - 一句话描述问题
2. **根因** - 技术层面的原因
3. **修复方案** - 具体的代码修改建议
4. **验证方法** - 如何确认问题已解决

## 注意事项

- 始终基于实际日志和数据分析,不要猜测
- 提供可执行的修复代码,不只是建议
- 考虑 Android 版本兼容性
- 评估修复的影响范围和风险
- 建议相应的单元测试和集成测试
