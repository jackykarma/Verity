# Git Commit & Push Skill

> 自动化 Git 提交和推送流程，遵循 Commitizen 中文规范

## 概述

这是一个智能 Git 提交助手，帮助你快速、规范地提交代码并推送到 GitHub 远程仓库。

### 核心特性

- 🎯 **自动化流程**: 一键完成检查、暂存、提交、推送
- 📝 **规范提交**: 严格遵循 Commitizen 中文规范
- 🤖 **智能生成**: 自动分析代码变更并生成提交信息
- 🔒 **安全检查**: 防止提交敏感文件 (密钥、配置等)
- 💡 **最佳实践**: 提供提交拆分建议和优化指导
- 🌍 **中文支持**: 完整的中文提交信息和交互

## 快速开始

### 基本用法

只需告诉 AI:

```
提交代码并推送到 GitHub
```

或者:

```
遵循 Commitizen 规范提交我的改动
```

AI 会自动:
1. 检查 Git 状态和代码变更
2. 分析改动类型和影响范围
3. 生成符合规范的提交信息
4. 向你确认后执行提交和推送

### 示例对话

**用户**: "我完成了登录功能，提交一下"

**AI 响应**:
```
📋 将要提交的文件:
- app/src/main/java/LoginActivity.kt (修改)
- app/src/main/res/layout/activity_login.xml (新增)

💬 提交信息:
✨ feat(登录): 实现用户登录功能

- 添加账号密码登录逻辑
- 实现登录表单验证
- 集成 JWT token 认证
- 添加记住密码功能

确认提交并推送? [Y/n]
```

**用户**: "确认"

**AI 执行**:
```bash
✅ 提交成功!

Commit: a7f8e9d
分支: feature/login → origin/feature/login

🔗 查看: https://github.com/username/repo/commit/a7f8e9d
```

## 提交类型速查

| Emoji | 类型 | 说明 | 示例 |
|-------|------|------|------|
| ✨ | `feat` | 新功能 | feat(登录): 添加指纹登录 |
| 🐛 | `fix` | Bug 修复 | fix(支付): 修复金额计算错误 |
| 📝 | `docs` | 文档 | docs(README): 更新安装说明 |
| 💄 | `style` | 样式 | style(主题): 统一按钮样式 |
| ♻️ | `refactor` | 重构 | refactor(网络): 优化请求封装 |
| ⚡️ | `perf` | 性能优化 | perf(列表): 使用 RecyclerView |
| ✅ | `test` | 测试 | test(工具): 添加单元测试 |
| 🔧 | `chore` | 工具/依赖 | chore(依赖): 升级 Kotlin 版本 |
| 🎨 | `ui` | UI 改进 | ui(主页): 优化卡片布局 |

完整列表见 [SKILL.md](./SKILL.md#commitizen-中文规范)

## 使用场景

### ✅ 适用场景

- 完成功能开发需要提交时
- 修复 Bug 后需要推送
- 代码重构完成
- 性能优化完成
- 文档更新
- 依赖升级
- 紧急热修复

### 🎯 典型命令

```
"提交代码"
"推送到 GitHub"
"commit 并 push"
"创建符合规范的提交"
"提交所有改动"
"只提交 MainActivity.kt"
"修复的 bug 提交一下"
```

## 高级功能

### 1. 多文件智能分类

自动识别多类型改动并建议拆分提交:

```
检测到多种类型的改动:
- 新增登录功能 (feat)
- 修复网络 bug (fix)

建议分成两次提交以保持历史清晰。
```

### 2. 安全检查

自动检测敏感文件:

```
🚨 安全警告: 检测到敏感文件!
- .env (环境变量)
- key.properties (签名密钥)

已自动排除，仅提交安全文件。
```

### 3. Breaking Change 处理

识别不兼容变更并添加标记:

```
⚠️ 检测到 BREAKING CHANGE

提交信息将包含:
BREAKING CHANGE: API 接口签名变更
```

### 4. 新分支自动设置上游

首次推送新分支时自动使用 `-u` 参数:

```bash
git push -u origin feature/new-feature
```

### 5. 冲突处理建议

推送失败时提供解决方案:

```
❌ 推送失败: 远程分支有新提交

建议: git pull --rebase origin <branch>
```

## 工作流程

```
1. 用户请求提交
   ↓
2. 检查 Git 状态
   ├─ git status
   ├─ git diff
   └─ 安全检查
   ↓
3. 分析代码变更
   ├─ 识别改动类型
   ├─ 确定影响范围
   └─ 理解改动目的
   ↓
4. 生成提交信息
   ├─ 选择 emoji 和类型
   ├─ 编写简短描述
   └─ 添加详细说明
   ↓
5. 向用户确认
   ├─ 显示文件列表
   ├─ 展示提交信息
   └─ 说明操作步骤
   ↓
6. 执行 Git 操作
   ├─ git add
   ├─ git commit
   └─ git push
   ↓
7. 验证并报告
   └─ 返回提交 hash 和链接
```

## 最佳实践

### ✅ 推荐做法

1. **原子提交**: 每次提交只做一件事
2. **及时提交**: 完成功能点立即提交
3. **有意义的信息**: 描述"做了什么"和"为什么"
4. **使用中文**: 团队沟通更高效
5. **代码审查**: 推送前先自己 review

### ❌ 避免错误

1. 提交信息过于简单: "修改"、"更新"
2. 一次提交包含多个不相关改动
3. 提交敏感信息 (密钥、密码)
4. 直接在 main/master 分支提交
5. 提交后不推送

## 提交信息模板

### 标准格式

```
<emoji> <类型>(<范围>): <简短描述>

<详细描述>
- 变更点 1
- 变更点 2
- 变更点 3

<footer>
```

### 示例 1: 新功能

```
✨ feat(支付): 添加支付宝支付功能

- 集成支付宝 SDK 4.2.0
- 实现支付流程和回调处理
- 添加支付结果页面
- 完善订单状态更新逻辑

Closes #123
```

### 示例 2: Bug 修复

```
🐛 fix(列表): 修复下拉刷新数据重复

问题: 刷新时未清空旧数据导致重复显示
解决: 在刷新前清空列表并重置分页状态

Fixes #456
```

### 示例 3: 性能优化

```
⚡️ perf(图片): 优化图片加载性能

- 使用 Coil 替换 Glide 减少内存占用
- 添加图片尺寸压缩和格式转换
- 实现三级缓存策略
- 启用硬件加速解码

测试: 内存占用降低 40%, 加载速度提升 30%
```

## 文件说明

- **SKILL.md**: 完整的 Skill 定义和使用指南
- **examples.md**: 15+ 个详细使用示例
- **README.md**: 本文档，快速参考

## 故障排除

### 问题 1: Git 未初始化

```
错误: fatal: not a git repository
解决: git init
```

### 问题 2: 未配置远程仓库

```
错误: No configured push destination
解决: git remote add origin <仓库地址>
```

### 问题 3: 认证失败

```
错误: Authentication failed
解决: 使用 Personal Access Token 或配置 SSH key
```

### 问题 4: 推送被拒绝

```
错误: Updates were rejected
解决: git pull --rebase origin <branch>
```

更多问题见 [SKILL.md 错误处理章节](./SKILL.md#错误处理)

## 常用命令速查

```bash
# 查看状态
git status

# 查看改动
git diff
git diff --staged

# 暂存文件
git add <file>
git add .

# 提交
git commit -m "提交信息"

# 推送
git push origin <branch>

# 查看日志
git log --oneline -5

# 撤销操作
git reset HEAD <file>    # 取消暂存
git checkout -- <file>   # 放弃修改
```

## 参考资源

- [Commitizen 官方文档](https://github.com/commitizen/cz-cli)
- [约定式提交规范](https://www.conventionalcommits.org/zh-hans/)
- [Gitmoji 指南](https://gitmoji.dev/)
- [Git 最佳实践](https://git-scm.com/book/zh/v2)

## 贡献

如有改进建议或发现问题，欢迎反馈!

## 许可

MIT License

---

**记住**: 好的提交信息是代码历史的文档，也是团队协作的基础! 🚀
