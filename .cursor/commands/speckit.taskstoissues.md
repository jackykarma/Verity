---
description: 根据可用的设计工件，将现有任务转换为该功能对应的、按依赖关系排序的可执行 GitHub 议题。
tools: ['github/github-mcp-server/issue_write']
---

## 用户输入

```text
$ARGUMENTS
```

在继续操作前，你**必须**参考用户输入（若不为空）。

## 大纲

1. 从代码库根目录运行 `.specify/scripts/powershell/check-prerequisites.ps1 -Json -RequireTasks -IncludeTasks` 命令，并解析出 FEATURE_DIR（功能目录）和 AVAILABLE_DOCS（可用文档）列表。所有路径必须为绝对路径。对于参数中包含单引号的情况（如 "I'm Groot"），需使用转义语法：例如 'I'\''m Groot'（若可行，也可使用双引号："I'm Groot"）。
2. 从执行的脚本中，提取**任务**的路径。
3. 通过运行以下命令获取 Git 远程仓库地址：

```bash
git config --get remote.origin.url
```

> [!注意]
> 仅当远程仓库地址为 GitHub 网址时，才可继续执行后续步骤。

4. 针对列表中的每一项任务，通过 GitHub MCP 服务器在与 Git 远程仓库地址对应的代码库中创建一个新的议题。

> [!注意]
> 在任何情况下，都不得在与远程仓库地址不匹配的代码库中创建议题。

### 翻译说明
1. 技术术语统一：
    - `task` 译为「任务」（符合项目管理语境）
    - `GitHub issue` 译为「GitHub 议题」（GitHub 官方中文术语）
    - `dependency-ordered` 译为「按依赖关系排序的」（准确体现任务执行逻辑）
    - `Git remote` 译为「Git 远程仓库地址」（兼顾技术准确性和可读性）
    - `repo root` 译为「代码库根目录」（通用技术表述）
2. 指令类表述：
    - `MUST`/`UNDER NO CIRCUMSTANCES` 等强约束词汇，译为「必须」「在任何情况下都不得」，保留原文语气强度
    - 脚本命令、参数名（如 `-Json`）不翻译，符合技术文档规范
3. 格式保留：
    - 保持原有的分级列表、代码块、警告提示框（`[!CAUTION]` 译为 `[!注意]`）格式
    - 变量（如 `$ARGUMENTS`/`FEATURE_DIR`）保留原文，确保可识别性