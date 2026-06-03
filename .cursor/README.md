# Cursor Agent 配置

本仓库 Agent 相关文件统一放在 `.cursor/`：

| 路径 | 内容 |
|------|------|
| `.cursor/commands/` | AISDD 斜杠命令（`/aisdd.*`） |
| `.cursor/rules/` | 项目 Rules（`.mdc`） |
| `.cursor/skills/` | Agent Skills |

新增官方 skill 示例：

```powershell
npx skills add https://github.com/anthropics/skills --skill pptx
```

若 `npx skills` 默认装入 `.agents/skills/`，请手动移到 `.cursor/skills/` 或指定 Cursor 项目 skills 目录。
