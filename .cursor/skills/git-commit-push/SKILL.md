---
name: git-commit-push
description: Git 提交和推送助手。自动化 Git 提交流程，遵循 Commitizen 中文规范，包括代码检查、暂存、提交和推送。当用户需要提交代码、推送到远程仓库、创建符合规范的提交信息时使用。
---

# Git Commit & Push - Git 提交推送助手

这是一个自动化 Git 提交和推送流程的 Skill，严格遵循 Commitizen 规范，使用中文提交信息。

## 功能特性

- ✅ 自动检查 Git 状态和代码变更
- ✅ 遵循 Commitizen 中文提交规范
- ✅ 智能生成提交信息
- ✅ 支持多文件暂存和批量提交
- ✅ 自动推送到远程仓库
- ✅ 安全检查（避免提交敏感文件）

## 何时使用

- 用户说"提交代码"、"推送到 GitHub"、"commit 并 push"
- 用户说"创建提交"、"保存更改"、"上传代码"
- 用户完成功能开发需要提交时
- 用户说"遵循 Commitizen 规范提交"

## Commitizen 中文规范

提交信息格式:
```
<类型>(<范围>): <简短描述>

<详细描述>

<footer>
```

### 提交类型 (必填)

| 类型 | 说明 | 示例 |
|------|------|------|
| `✨ feat` | 新功能 | feat(登录): 添加指纹登录功能 |
| `🐛 fix` | 修复 Bug | fix(支付): 修复订单金额计算错误 |
| `📝 docs` | 文档变更 | docs(README): 更新安装说明 |
| `💄 style` | 代码格式（不影响功能） | style(主题): 统一按钮圆角样式 |
| `♻️ refactor` | 重构（不是新功能也不是修复） | refactor(网络): 优化 HTTP 请求封装 |
| `⚡️ perf` | 性能优化 | perf(列表): 使用 RecyclerView 优化滚动 |
| `✅ test` | 添加或修改测试 | test(工具): 添加日期格式化单元测试 |
| `🔧 chore` | 构建/工具/依赖变更 | chore(依赖): 升级 Kotlin 到 1.9.0 |
| `🎨 ui` | UI/UX 改进 | ui(主页): 优化卡片阴影效果 |
| `🚀 build` | 构建系统变更 | build(gradle): 配置多渠道打包 |
| `👷 ci` | CI/CD 配置变更 | ci(github): 添加自动化测试流程 |
| `⏪️ revert` | 回滚提交 | revert: 撤销 feat(登录) 提交 |

### 范围 (可选)

指明改动影响的模块或功能,例如:
- `登录`、`支付`、`首页`、`商品详情`
- `网络`、`数据库`、`缓存`、`工具`
- `用户模块`、`订单模块`、`评论模块`

### 描述规范

- **简短描述**: 不超过 50 个字符，使用祈使句，描述做了什么
- **详细描述**: 说明为什么做这个改动，改动的影响范围（可选）
- **Footer**: 关闭的 Issue 或 Breaking Changes（可选）

### 示例

```
✨ feat(用户): 添加微信登录功能

- 集成微信 SDK
- 实现授权登录流程
- 添加用户信息绑定逻辑

Closes #123
```

```
🐛 fix(支付): 修复支付宝回调异常导致订单状态不更新

问题原因: 回调参数验签失败未捕获异常
解决方案: 添加 try-catch 并记录错误日志

Fixes #456
```

## 工作流程

### 第 1 步: 检查 Git 状态

运行以下命令检查当前状态:

```bash
git status
git diff
git diff --staged
```

**输出内容:**
- 未追踪的文件
- 已修改但未暂存的文件
- 已暂存待提交的文件
- 具体的代码变更内容

**安全检查** - 确认以下文件不在提交列表:
- `.env`、`.env.local`、`local.properties`
- `*.jks`、`*.keystore`、`key.properties`
- `credentials.json`、`secrets.xml`
- API keys、passwords、tokens

如发现敏感文件，**警告用户并停止操作**。

### 第 2 步: 分析代码变更

基于 `git diff` 输出，分析:

1. **变更类型**: 判断属于哪种提交类型（feat/fix/refactor 等）
2. **影响范围**: 识别改动的模块或功能
3. **核心目的**: 理解为什么做这些改动

**示例分析:**
- 修改 `LoginActivity.kt`: 添加指纹识别 → `feat(登录)`
- 修改 `PaymentUtil.kt`: 修复金额计算 bug → `fix(支付)`
- 修改多个网络请求类: 统一错误处理 → `refactor(网络)`

### 第 3 步: 生成提交信息

根据 Commitizen 规范生成提交信息:

**格式:**
```
<emoji> <类型>(<范围>): <简短描述>

<详细描述>
- 变更点 1
- 变更点 2
- 变更点 3

<footer>
```

**生成规则:**
1. 类型前添加对应 emoji（参考上表）
2. 范围控制在 2-4 个字
3. 简短描述不超过 50 字符
4. 详细描述列出主要变更点（3-5 条）
5. 如有相关 Issue，添加 `Closes #xxx` 或 `Fixes #xxx`

**示例输出:**
```
✨ feat(登录): 添加指纹登录功能

- 集成 BiometricPrompt API
- 实现指纹识别流程
- 添加降级到密码登录逻辑
- 更新登录界面 UI

Closes #789
```

### 第 4 步: 向用户确认

**展示以下信息:**

```markdown
## 📋 将要提交的文件

- `app/src/main/java/LoginActivity.kt` (修改)
- `app/src/main/res/layout/activity_login.xml` (修改)
- `app/build.gradle` (添加依赖)

## 💬 提交信息

\`\`\`
✨ feat(登录): 添加指纹登录功能

- 集成 BiometricPrompt API
- 实现指纹识别流程
- 添加降级到密码登录逻辑
- 更新登录界面 UI

Closes #789
\`\`\`

## 🎯 操作步骤

1. git add (上述文件)
2. git commit -m "(上述提交信息)"
3. git push origin <当前分支>

---

**请确认是否继续?** (如需修改提交信息，请告诉我)
```

### 第 5 步: 执行 Git 操作

用户确认后，按顺序执行:

**5.1 暂存文件**
```bash
git add <file1> <file2> <file3>
# 或
git add .  # 如果用户要求添加所有文件
```

**5.2 创建提交**
```bash
git commit -m "$(cat <<'EOF'
✨ feat(登录): 添加指纹登录功能

- 集成 BiometricPrompt API
- 实现指纹识别流程
- 添加降级到密码登录逻辑
- 更新登录界面 UI

Closes #789
EOF
)"
```

**注意**: 使用 HEREDOC 确保多行提交信息格式正确。

**5.3 推送到远程**
```bash
git push origin <branch-name>
```

如果是新分支且未关联远程:
```bash
git push -u origin <branch-name>
```

### 第 6 步: 验证结果

执行后检查:

```bash
git log -1 --pretty=fuller
git status
```

**向用户报告:**
```markdown
## ✅ 提交成功

**Commit Hash**: `a1b2c3d`
**分支**: `feature/fingerprint-login`
**推送状态**: 已推送到 origin/feature/fingerprint-login

**提交详情**:
\`\`\`
✨ feat(登录): 添加指纹登录功能

- 集成 BiometricPrompt API
- 实现指纹识别流程
- 添加降级到密码登录逻辑
- 更新登录界面 UI

Closes #789
\`\`\`

🔗 查看提交: https://github.com/<用户>/<仓库>/commit/a1b2c3d
```

## 高级场景

### 场景 1: 多类型变更

如果一次提交包含多种类型的改动（不推荐），询问用户:

```
检测到多种类型的改动:
- 新增登录功能 (feat)
- 修复网络请求 bug (fix)

建议分成两次提交。是否需要我帮你拆分?
```

### 场景 2: Breaking Changes

如果变更不兼容旧版本:

```
⚠️ 检测到不兼容改动

提交信息应添加 BREAKING CHANGE:

♻️ refactor(网络): 重构 API 请求接口

BREAKING CHANGE: NetworkManager.request() 签名变更
- 旧: request(url: String, params: Map)
- 新: request(config: RequestConfig)

迁移指南见文档 #123
```

### 场景 3: Hotfix 紧急修复

对于紧急修复，简化流程:

```bash
git add <修复文件>
git commit -m "🚑 hotfix(支付): 紧急修复生产环境支付崩溃"
git push origin main
```

并提醒: "建议后续创建 hotfix 分支遵循 Git Flow。"

### 场景 4: 修改上一次提交

如果用户说"修改上次提交"或"补充提交":

```bash
# 检查上次提交是否已推送
git log -1
git status

# 如果未推送,可以修改
git add <新文件>
git commit --amend --no-edit
# 或修改提交信息
git commit --amend -m "新的提交信息"

# 推送 (如果已修改已推送的提交,需要 force push)
git push --force-with-lease origin <branch>
```

**警告用户**: "上次提交已推送到远程，使用 --force 会覆盖远程历史，团队其他成员可能受影响。确认继续?"

### 场景 5: 检测到冲突

如果 push 失败:

```
❌ 推送失败: 远程分支有新提交

建议操作:
1. git pull --rebase origin <branch>
2. 解决冲突 (如有)
3. git push origin <branch>

是否需要我帮你处理?
```

## 注意事项

### ✅ 最佳实践

1. **原子提交**: 每次提交只做一件事
2. **有意义的信息**: 描述"做了什么"和"为什么"，不是"怎么做"
3. **使用中文**: 团队沟通更高效
4. **及时提交**: 完成一个功能点立即提交
5. **代码审查**: 推送前自己先 review 一遍

### ⚠️ 避免的错误

1. ❌ 提交信息过于简单: "修改"、"更新"、"fix bug"
2. ❌ 一次提交包含多个不相关的改动
3. ❌ 提交敏感信息 (密钥、密码、token)
4. ❌ 提交后不推送导致远程分支落后
5. ❌ 直接在 main/master 分支提交 (应使用功能分支)

### 🔐 安全检查清单

推送前确认:
- [ ] 没有 `.env` 文件
- [ ] 没有密钥文件 (`.jks`, `.keystore`)
- [ ] 没有 API keys 或 secrets
- [ ] 没有本地配置文件 (不应被提交的)
- [ ] 没有临时文件或 IDE 配置

## 快速参考

### 常用命令速查

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
git reset HEAD <file>  # 取消暂存
git checkout -- <file>  # 放弃修改
```

### Emoji 速查表

```
✨ :sparkles:        新功能
🐛 :bug:             Bug 修复
📝 :memo:            文档
💄 :lipstick:        样式
♻️ :recycle:         重构
⚡️ :zap:            性能优化
✅ :white_check_mark: 测试
🔧 :wrench:          配置/工具
🎨 :art:             UI/UX
🚀 :rocket:          构建/部署
👷 :construction_worker: CI
⏪️ :rewind:          回滚
🚑 :ambulance:       紧急热修复
```

## 错误处理

### 1. Git 未初始化
```
错误: fatal: not a git repository

解决: 运行 git init 初始化仓库
```

### 2. 未配置远程仓库
```
错误: fatal: No configured push destination

解决: git remote add origin <仓库地址>
```

### 3. 认证失败
```
错误: Authentication failed

解决:
- GitHub: 使用 Personal Access Token 替代密码
- 配置 SSH key: ssh-keygen 并添加到 GitHub
```

### 4. 推送被拒绝
```
错误: Updates were rejected because the remote contains work

解决:
1. git pull --rebase origin <branch>
2. 解决冲突
3. git push origin <branch>
```

## 总结

使用这个 Skill,你可以:
1. 自动化 Git 提交流程
2. 确保提交信息符合 Commitizen 规范
3. 避免提交敏感信息
4. 高效推送到 GitHub
5. 保持清晰的提交历史

**记住**: 好的提交信息是代码历史的文档，也是团队协作的基础。
