---
description: **EPIC 级**交互与视觉设计。须在**所有 Feature 的 spec 均已输出**之后运行；基于 epic.md 与各 feature spec.md 进行**整个 EPIC** 的交互与视觉设计，产出 EPIC 根下的 ux-design.md 与 design/；设计稿支持 Figma 链接、截图（design/）、本地 HTML（design/）。须从整个需求整体看待与设计，保证导航、风格与跨 Feature 交互一致。插入在 specify→plan 之间。
handoffs:
  - label: 制定技术方案
    agent: speckit.plan
    prompt: 完成 epic uidesign 后，基于 spec 与 EPIC 级 ux-design 制定技术方案
    send: true
  - label: 澄清交互/视觉约束
    agent: speckit.clarify
    prompt: 需补充交互或视觉约束时，澄清后可再运行 epicuidesign 或 epicuidesign-update
    send: false
---

## 用户输入

```text
$ARGUMENTS
```

在继续操作前，你**必须**参考用户输入（若不为空）。可用于：**EPIC 标识**（如 `EPIC-002`，用于定位 EPIC 目录；当 `SPECIFY_EPIC` 已设时可空）、或补充交互/视觉的侧重范围。

## 大纲

目标：在 **EPIC 根**（`specs/epics/<EPIC-xxx>/`）下产出 `ux-design.md` 与 `design/` 目录（可选），为**各 Feature 的 plan** 提供**整体**交互与视觉设计输入。**须从整个 EPIC 需求整体**看待与设计（导航、跨 Feature 流程、统一风格与交互），而非针对单个 Feature。

**设计稿**可选用：**Figma 链接**、**截图**（放于 `design/`，如 .png/.jpg）、**本地 HTML**（`design/*.html`）；在 ux-design.md 的「设计稿索引」中登记形式与路径/链接；可含「所属 Feature」列区分。**须在 epic.md 已存在、EPIC 根下 ux-design.md 尚不存在时运行**；若已存在，请改用 `/speckit.epicuidesign-update`。

**前置条件**：须在**所有 Feature 的 spec 均已输出**之后执行，以保证整个 EPIC 的交互与视觉设计完整、一致。

执行步骤：

1. **环境与路径**：从仓库根目录运行（通过 `SPECIFY_EPIC` 或 `$ARGUMENTS` 中的 EPIC 标识定位 EPIC，如 `EPIC-002`）：

```powershell
.specify/scripts/powershell/get-epic-paths.ps1 -EpicId "EPIC-002" -Json
```

解析 JSON 得到 `EPIC_DIR`、`EPIC_UX_DESIGN`、`EPIC_DESIGN_DIR`。若 `EpicId` 未提供且 `$env:SPECIFY_EPIC` 未设：**终止**并提示「请设置 SPECIFY_EPIC 或在 $ARGUMENTS 中提供 EPIC 标识，如 EPIC-002」。若 `EPIC_UX_DESIGN`（ux-design.md）**已存在**：**终止**并提示「请使用 /speckit.epicuidesign-update 做增量更新」。

2. **前置条件检查（所有 Feature spec 已就绪）**：遍历 `EPIC_DIR/features/` 下每个**子目录**，若某子目录存在且其中**无 `spec.md`**，则**终止**并提示：「须在**所有** Feature 的 spec 输出后再运行 /speckit.epicuidesign。以下 Feature 目录尚未具备 spec：\[列出缺 spec 的目录名\]。请对缺 spec 的 Feature 运行 /speckit.feature 或 /speckit.specify，待全部完成后再运行本命令。」

3. **加载上下文**：读取 `EPIC_DIR/epic.md`、各 `EPIC_DIR/features/*/spec.md`、`.specify/templates/ux-design-template.md`。  
   **输入**：epic.md 与各 feature spec，以保障**整体**信息架构、跨 Feature 导航与统一交互/视觉。

4. **创建 design/ 与占位**（可选）：若 `EPIC_DESIGN_DIR` 不存在，可创建目录及 `design/index.html` 占位；占位页说明：设计稿可选用 **Figma 链接**、**截图**、**本地 HTML**；在 ux-design.md 的「设计稿索引」中登记，可含「所属 Feature」列。若确定仅用 Figma 链接且不需 design/，可跳过本步。

5. **填充 ux-design.md**：按 **epic.md 与各 feature spec** 的 FR/NFR、验收与场景、核心实体、**跨 Feature 流程与导航**，填充 ux-design-template 各章节（信息架构、**跨 Feature 导航与流程**、交互说明、视觉规范、设计稿索引；可按 **Feature 分节** 或分表），写入 `EPIC_UX_DESIGN`。  
   元信息：**Epic**、**Epic Version**、**ux-design Version**、日期；**输入**：`epic.md`、各 `features/*/spec.md`。**设计稿索引**须支持：Figma 链接、`design/xxx.png`、`design/xxx.html`；可加「所属 Feature」列。

6. **完成报告**：输出 ux-design.md 路径（EPIC 根）、design 路径（若已创建），并提示下一步：对各 Feature 设置 `SPECIFY_FEATURE` 后运行 `/speckit.plan`。
