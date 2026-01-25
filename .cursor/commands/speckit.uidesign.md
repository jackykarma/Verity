---
description: 基于 spec.md 进行交互与视觉澄清，产出 ux-design.md 与 design/（可选）；设计稿支持 Figma 链接、截图（design/）、本地 HTML（design/）。插入在 specify→plan 之间。
handoffs:
  - label: 制定技术方案
    agent: speckit.plan
    prompt: 完成 uidesign 后，基于 spec 与 ux-design 制定技术方案
    send: true
  - label: 澄清交互/视觉约束
    agent: speckit.clarify
    prompt: 需补充交互或视觉约束时，澄清后可再运行 uidesign 或 uidesign-update
    send: false
---

## 用户输入

```text
$ARGUMENTS
```

在继续操作前，你**必须**参考用户输入（若不为空）。可用于补充交互或视觉的侧重范围。

## 大纲

目标：在当前 Feature 下产出 `ux-design.md` 与 `design/` 目录（可选），为 plan 提供交互与视觉设计输入。**设计稿**可选用：**Figma 链接**、**截图**（放于 `design/`，如 .png/.jpg）、**本地 HTML**（`design/*.html`）；在 ux-design.md 的「设计稿索引」中登记形式与路径/链接。**须在 spec.md 已存在、ux-design.md 尚不存在时运行**；若 ux-design.md 已存在，请改用 `/speckit.uidesign-update`。

执行步骤：

1. **环境与路径**：从仓库根目录运行：

```powershell
.specify/scripts/powershell/check-prerequisites.ps1 -Json -PathsOnly
```

解析 JSON 得到 `FEATURE_DIR`、`FEATURE_SPEC`。若 `FEATURE_SPEC`（spec.md）不存在：**终止**并提示先运行 `/speckit.feature`。

2. **加载上下文**：读取 `spec.md`、`.specify/templates/ux-design-template.md`。

3. **若 `FEATURE_DIR/ux-design.md` 已存在**：**终止**并提示「请使用 /speckit.uidesign-update 做增量更新」。

4. **创建 design/ 与占位**（可选）：若 `FEATURE_DIR/design` 不存在，可创建目录及 `design/index.html` 占位，以支持后续添加**截图**或**本地 HTML**；占位页说明：设计稿可选用 **Figma 链接**（在 ux-design.md 设计稿索引填 URL）、**截图**（.png/.jpg 等放于本目录）、**本地 HTML**（放于本目录）；在 ux-design.md 的「设计稿索引」中登记形式（Figma/截图/HTML）与路径或链接。若确定仅用 Figma 链接且不需 design/，可跳过本步。

5. **填充 ux-design.md**：按 spec 的 FR/NFR、验收与场景、核心实体，填充 ux-design-template 各章节（信息架构、交互说明、视觉规范、设计稿索引先填占位行），写入 `FEATURE_DIR/ux-design.md`。**设计稿索引**须支持三种形式：**Figma 链接**（填 URL）、**截图**（`design/xxx.png` 等）、**本地 HTML**（`design/xxx.html`）。元信息中的 Epic、Feature ID、Feature Version、日期须与 spec 或当前上下文一致。

6. **完成报告**：输出 ux-design.md 路径、design 路径（若已创建），并提示下一步：`/speckit.plan`。
