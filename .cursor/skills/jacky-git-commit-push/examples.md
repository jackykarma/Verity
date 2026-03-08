# Git Commit Push - 使用示例

## 示例 1: 新功能提交

### 用户请求
```
我完成了指纹登录功能的开发，帮我提交代码并推送到 GitHub
```

### Skill 执行流程

**步骤 1: 检查状态**
```bash
$ git status
On branch feature/fingerprint-login
Changes not staged for commit:
  modified:   app/src/main/java/com/example/LoginActivity.kt
  modified:   app/src/main/res/layout/activity_login.xml
  modified:   app/build.gradle

$ git diff
# 显示具体改动...
```

**步骤 2: 分析变更**
- 修改了 `LoginActivity.kt`: 添加了 BiometricPrompt 相关代码
- 修改了 `activity_login.xml`: 添加了指纹图标按钮
- 修改了 `build.gradle`: 添加了 androidx.biometric 依赖

**判断**: 这是新增功能 → `feat(登录)`

**步骤 3: 生成提交信息**
```
✨ feat(登录): 添加指纹登录功能

- 集成 BiometricPrompt API 实现生物识别
- 添加指纹识别按钮和交互逻辑
- 实现降级到密码登录的备用方案
- 更新登录界面 UI 支持双登录模式
```

**步骤 4: 执行提交**
```bash
$ git add app/src/main/java/com/example/LoginActivity.kt \
         app/src/main/res/layout/activity_login.xml \
         app/build.gradle

$ git commit -m "$(cat <<'EOF'
✨ feat(登录): 添加指纹登录功能

- 集成 BiometricPrompt API 实现生物识别
- 添加指纹识别按钮和交互逻辑
- 实现降级到密码登录的备用方案
- 更新登录界面 UI 支持双登录模式
EOF
)"

$ git push origin feature/fingerprint-login
```

**步骤 5: 报告结果**
```
✅ 提交成功!

Commit: a7f8e9d
分支: feature/fingerprint-login → origin/feature/fingerprint-login

查看提交: https://github.com/username/repo/commit/a7f8e9d
```

---

## 示例 2: Bug 修复

### 用户请求
```
修复了支付金额显示错误的 bug，提交一下
```

### Skill 执行流程

**步骤 1: 检查变更**
```bash
$ git diff
diff --git a/app/src/main/java/PaymentUtil.kt b/app/src/main/java/PaymentUtil.kt
- fun formatAmount(amount: Int): String = (amount / 100).toString()
+ fun formatAmount(amount: Int): String = String.format("%.2f", amount / 100.0)
```

**步骤 2: 生成提交信息**
```
🐛 fix(支付): 修复支付金额显示精度丢失

问题: 金额计算使用整数除法导致小数部分丢失
解决: 改用浮点数除法并格式化为两位小数

Fixes #1234
```

**步骤 3: 执行并推送**
```bash
$ git add app/src/main/java/PaymentUtil.kt
$ git commit -m "..."
$ git push origin main
```

---

## 示例 3: 代码重构

### 用户请求
```
我重构了网络请求模块，统一了错误处理逻辑，帮我 commit 并 push
```

### 分析变更
```bash
$ git status
modified:   network/ApiService.kt
modified:   network/ErrorHandler.kt
modified:   network/RetrofitClient.kt
modified:   utils/NetworkUtil.kt
```

### 生成提交信息
```
♻️ refactor(网络): 统一 API 错误处理逻辑

- 抽取公共错误处理到 ErrorHandler 单例
- 统一 HTTP 状态码和业务错误码映射
- 移除各接口重复的 try-catch 代码
- 添加全局网络异常拦截器

提升代码复用性和可维护性
```

---

## 示例 4: 性能优化

### 用户请求
```
优化了首页列表的加载性能，提交到 GitHub
```

### 变更内容
- 使用 DiffUtil 优化 RecyclerView 刷新
- 添加图片懒加载
- 实现分页加载

### 生成提交
```
⚡️ perf(首页): 优化列表加载性能

- 使用 DiffUtil 代替 notifyDataSetChanged 减少无效刷新
- 集成 Coil 实现图片懒加载和内存缓存
- 实现分页加载降低单次数据量
- 添加 ViewHolder 复用优化

测试数据: 列表滑动帧率从 45fps 提升到 58fps
```

---

## 示例 5: 文档更新

### 用户请求
```
更新了 README，添加了项目环境配置说明
```

### 生成提交
```
📝 docs(README): 添加开发环境配置说明

- 新增 Android Studio 版本要求
- 添加 Gradle 配置步骤
- 说明必需的 SDK 和工具链
- 补充常见问题解决方案
```

---

## 示例 6: UI 优化

### 用户请求
```
调整了按钮样式和颜色，统一了品牌色
```

### 生成提交
```
💄 style(主题): 统一应用品牌色和按钮样式

- 更新主题色为新的品牌蓝 #1E88E5
- 统一按钮圆角半径为 8dp
- 调整按钮内边距提升点击体验
- 同步登录、支付、设置页面的视觉风格
```

---

## 示例 7: 依赖升级

### 用户请求
```
升级了 Kotlin 和 Compose 版本
```

### 生成提交
```
🔧 chore(依赖): 升级 Kotlin 和 Compose 版本

- Kotlin: 1.8.0 → 1.9.22
- Compose: 1.4.0 → 1.6.0
- Compose Compiler: 1.4.0 → 1.5.8

更新说明: 支持新的 Compose 稳定性改进
```

---

## 示例 8: 多文件新增功能

### 用户请求
```
实现了用户个人资料编辑功能，包括头像上传、昵称修改等
```

### 变更文件
```
new file:   ProfileEditActivity.kt
new file:   ProfileEditViewModel.kt
new file:   res/layout/activity_profile_edit.xml
modified:   ProfileActivity.kt
modified:   UserRepository.kt
```

### 生成提交
```
✨ feat(个人中心): 实现用户资料编辑功能

新增:
- ProfileEditActivity: 个人资料编辑页面
- ProfileEditViewModel: 资料编辑业务逻辑
- 头像选择和裁剪功能
- 昵称、签名、性别等字段编辑

修改:
- ProfileActivity: 添加进入编辑页入口
- UserRepository: 添加更新用户信息接口

Closes #567
```

---

## 示例 9: 紧急热修复

### 用户请求
```
生产环境出现支付崩溃，我已修复，需要紧急推送
```

### 检测到严重问题
```
⚠️ 检测到紧急修复!

建议使用 hotfix 分支:
1. git checkout -b hotfix/payment-crash
2. 提交修复
3. 推送并创建紧急 PR
4. 合并后打 tag

继续当前分支提交? [y/N]
```

### 生成提交 (紧急场景)
```
🚑 hotfix(支付): 修复支付回调空指针崩溃

问题: PaymentCallback 未判空导致 NullPointerException
影响: 所有支付成功后崩溃，影响用户体验和订单状态更新
修复: 添加空值检查和默认值处理

Fixes #999 (Critical)
```

---

## 示例 10: 回滚提交

### 用户请求
```
上次提交有问题，需要回滚
```

### Skill 执行
```bash
$ git log --oneline -3
a1b2c3d feat(登录): 添加第三方登录
e4f5g6h fix(支付): 修复金额计算
i7j8k9l refactor(网络): 优化请求

回滚哪个提交? [输入 hash 或序号]
> a1b2c3d

$ git revert a1b2c3d
```

### 生成回滚提交
```
⏪️ revert: 撤销 feat(登录) 添加第三方登录

原因: 第三方 SDK 存在兼容性问题导致应用崩溃
影响范围: 登录模块
后续计划: 修复 SDK 问题后重新引入

This reverts commit a1b2c3d
```

---

## 示例 11: Breaking Change

### 用户请求
```
重构了 API 请求接口，不兼容旧版本，提交代码
```

### 检测到不兼容变更
```
⚠️ 检测到 BREAKING CHANGE

旧接口签名:
- NetworkManager.request(url: String, params: Map<String, Any>)

新接口签名:
- NetworkManager.request(config: RequestConfig)

这会影响所有使用网络请求的模块!
```

### 生成提交 (含 Breaking Change 标记)
```
♻️ refactor(网络): 重构 API 请求接口架构

BREAKING CHANGE: NetworkManager.request() 方法签名变更

变更详情:
- 旧: request(url: String, params: Map<String, Any>)
- 新: request(config: RequestConfig)

迁移指南:
```kotlin
// 旧用法
NetworkManager.request("/api/user", mapOf("id" to 123))

// 新用法
NetworkManager.request(RequestConfig(
    url = "/api/user",
    params = mapOf("id" to 123)
))
```

影响范围: 所有网络请求调用处需要更新
详细文档: docs/migration/network-refactor.md
```

---

## 示例 12: 批量提交多模块

### 用户请求
```
我今天完成了登录、注册和忘记密码三个功能，一起提交
```

### Skill 建议
```
⚠️ 检测到多个独立功能

建议分成 3 次提交以保持提交历史清晰:

1. 登录功能 (LoginActivity.kt, login_layout.xml)
2. 注册功能 (RegisterActivity.kt, register_layout.xml)
3. 忘记密码 (ForgotPasswordActivity.kt, forgot_password_layout.xml)

是否分开提交? [Y/n]
```

### 用户选择 Yes, 依次生成
```
✨ feat(登录): 实现用户登录功能
...

✨ feat(注册): 实现用户注册功能
...

✨ feat(密码): 实现忘记密码功能
...
```

---

## 示例 13: 检测到敏感文件

### 用户请求
```
全部文件提交
```

### Skill 检测
```bash
$ git status
modified:   app/src/main/java/MainActivity.kt
new file:   .env
new file:   key.properties
```

### 安全警告
```
🚨 安全警告: 检测到敏感文件!

以下文件不应提交到 Git:
- .env (包含 API keys 和环境变量)
- key.properties (包含签名密钥配置)

建议操作:
1. 添加到 .gitignore:
   echo ".env" >> .gitignore
   echo "key.properties" >> .gitignore

2. 仅提交安全文件:
   git add app/src/main/java/MainActivity.kt

是否继续? [y/N]
```

---

## 示例 14: 首次推送新分支

### 用户请求
```
我在新分支 feature/dark-mode 开发了暗黑模式，提交并推送
```

### 检测分支状态
```bash
$ git branch -vv
* feature/dark-mode  a1b2c3d 本地开发分支
  main               e4f5g6h [origin/main] 主分支
```

### 执行推送
```bash
$ git push -u origin feature/dark-mode
```

### 提示
```
✅ 新分支首次推送成功!

分支: feature/dark-mode → origin/feature/dark-mode
上游已设置: -u origin feature/dark-mode

下次提交可直接使用: git push

💡 建议: 在 GitHub 创建 Pull Request 进行代码审查
```

---

## 示例 15: 组合多种类型 (不推荐但需处理)

### 用户代码变更
```
modified:   LoginActivity.kt   (feat: 添加登录功能)
modified:   PaymentUtil.kt     (fix: 修复金额计算)
modified:   README.md          (docs: 更新文档)
```

### Skill 建议
```
⚠️ 检测到混合类型变更

当前改动包含:
1. 新功能 (LoginActivity.kt)
2. Bug 修复 (PaymentUtil.kt)
3. 文档更新 (README.md)

强烈建议分成 3 次提交:
- ✨ feat(登录): 添加登录功能
- 🐛 fix(支付): 修复金额计算错误
- 📝 docs(README): 更新项目文档

这样可以:
✓ 保持提交历史清晰
✓ 方便代码审查
✓ 便于回滚某个单独改动

是否分开提交? [Y/n]
```

---

## 快速命令示例

### 快速提交当前所有改动
```
用户: "提交所有文件"

执行:
$ git add .
$ git commit -m "..."
$ git push
```

### 只提交特定文件
```
用户: "只提交 MainActivity.kt"

执行:
$ git add app/src/main/java/MainActivity.kt
$ git commit -m "..."
$ git push
```

### 修改上次提交信息
```
用户: "修改上次提交的信息"

执行:
$ git commit --amend -m "新的提交信息"
$ git push --force-with-lease origin <branch>
```

---

## 总结

这些示例展示了 `jacky-git-commit-push` skill 的各种使用场景:

1. ✅ 标准功能提交
2. ✅ Bug 修复
3. ✅ 代码重构
4. ✅ 性能优化
5. ✅ 文档更新
6. ✅ 样式调整
7. ✅ 依赖管理
8. ✅ 紧急热修复
9. ✅ 回滚操作
10. ✅ Breaking Changes
11. ✅ 批量提交建议
12. ✅ 敏感文件检测
13. ✅ 新分支推送
14. ✅ 混合类型处理

**关键原则**:
- 遵循 Commitizen 规范
- 原子化提交
- 安全第一
- 清晰的提交历史
