---
description: "**EPIC 级**设计稿解析：从交互稿/视觉稿中提取并结构化交互逻辑与视觉规范。支持图片、Pencil(.pen)、Figma 链接三种输入源。须在所有 Feature 的 spec 均已输出之后运行；与 spec.md 交叉比对标出遗漏，产出可验证的 ux-design.md。无设计稿时进入兜底模式（AI 建议草案）。插入在 specify→plan 之间。"
handoffs:
  - label: 制定技术方案
    agent: aisdd.featureplan
    prompt: 完成 epic uidesign 后，基于 spec 与 EPIC 级 ux-design 制定技术方案
    send: true
  - label: 澄清交互/视觉约束
    agent: aisdd.clarify
    prompt: 需补充交互或视觉约束时，澄清后可再运行 epicuidesign；若 ux-design.md 已存在可直接说明更新范围由 AI 做增量更新
    send: false
---

## 用户输入

```text
$ARGUMENTS
```

在继续操作前，你**必须**参考用户输入（若不为空）。可用于：
- **EPIC 标识**（如 `EPIC-002`，用于定位 EPIC 目录；当 `SPECIFY_EPIC` 已设时可空）
- **解析侧重**：`交互` / `交互稿` → 侧重提取交互逻辑；`视觉` / `视觉稿` → 侧重提取视觉规范；不指定 → 全量（默认）
- **Figma 链接**：若用户直接提供 Figma URL，记录为输入源之一

## 前置条件

各 Feature 的 `spec.md` 应已完成。可与 `/aisdd.epicplan` 并行或在其前运行（须在所有 spec 输出之后）。

## 大纲

**核心定位**：从设计稿（交互稿/视觉稿）中**提取并结构化**交互逻辑与视觉规范，供团队验证 AI 理解是否完整、正确。**不是** AI 凭空创作 UX 设计。

**输入源**（五种，可组合；按置信度从高到低）：
- **设计说明文档**（`design/design-notes.md`）：设计师/产品手写的结构化上下文——聚焦图片关系、交互行为、导航、动效、适配等 AI 无法从截图推断的信息（模板：`.specify/templates/design-notes-template.md`）
- **Design Token 文件**（`design/design-tokens.json`）：从设计工具导出的精确色值/间距/字号/圆角/高程等数值，与 design-notes 互补无重叠（模板：`.specify/templates/design-tokens-template.json`）
- **Pencil 文件**：`.pen` 文件放在 `design/` 目录下，AI 通过 Pencil MCP 工具读取（`batch_get` 获取节点树、`get_screenshot` 获取截图、`snapshot_layout` 获取布局信息）
- **图片文件**：截图/导出图放在 `design/` 目录下（.png/.jpg/.webp），AI 通过 Read 工具读取图片进行视觉分析。推荐命名约定：`[序号]-[界面简称]-[状态].png`
- **Figma 链接**：用户在 `$ARGUMENTS` 中提供 Figma URL，或在 `design/figma-links.md` 中索引

**输入优先级**：design-notes 文字 > design-tokens 数值 > Pencil 节点树 > 图片视觉识别。冲突时采信高优先级来源。

**兜底模式**：当 `design/` 为空且无 Figma 链接时，AI 基于 spec.md 提出 UX 建议草案，所有内容标记为 `[AI 建议 - 待设计师确认]`。

**本命令是可选步骤**：并非所有 EPIC 在技术方案阶段都具备完整 UX/视觉稿。若设计稿尚未就绪，可跳过本命令直接进入 `/aisdd.epicplan`；后续设计稿就绪后再运行本命令，或直接说明更新范围由 AI 做增量更新。

**前置条件**：须在**所有 Feature 的 spec 均已输出**之后执行。

**推荐顺序**：epicuidesign（若有） → epicplan → 各 Feature plan。若先做 epicuidesign 再做 epicplan，epicplan 可参考 UX 结论校准技术约束。

---

执行步骤：

### 1. 环境与路径

从仓库根目录运行（通过 `SPECIFY_EPIC` 或 `$ARGUMENTS` 中的 EPIC 标识定位 EPIC，如 `EPIC-002`）：

```powershell
.specify/scripts/powershell/get-epic-paths.ps1 -EpicId "EPIC-002" -Json
```

解析 JSON 得到 `EPIC_DIR`、`EPIC_UX_DESIGN`、`EPIC_DESIGN_DIR`。

- 若 `EpicId` 未提供且 `$env:SPECIFY_EPIC` 未设：**终止**并提示「请设置 SPECIFY_EPIC 或在 $ARGUMENTS 中提供 EPIC 标识，如 EPIC-002」。
- 若 `EPIC_UX_DESIGN`（ux-design.md）**已存在**：**终止**并提示「ux-design.md 已存在，请直接说明要更新的章节或范围，由 AI 做增量更新」。

### 2. 前置条件检查（所有 Feature spec 已就绪）

遍历 `EPIC_DIR/features/` 下每个**子目录**，若某子目录存在且其中**无 `spec.md`**，则**终止**并提示：「须在**所有** Feature 的 spec 输出后再运行 /aisdd.epicuidesign。以下 Feature 目录尚未具备 spec：\[列出缺 spec 的目录名\]。」

### 3. 扫描设计素材

扫描 `EPIC_DESIGN_DIR`（`design/`）目录和 `$ARGUMENTS`，按类型分类收集设计素材：

**3a. 设计说明文档**（`design/design-notes.md`）— **上下文与行为的权威来源**：
- 若存在，**必须首先读取**，其中的信息将作为后续图片解析的上下文锚点
- 聚焦：图片归属与关系（同界面不同状态、跳转关系）、隐式交互行为、导航结构、动效参数、适配策略
- **不重复精确数值**（色值/间距等由 design-tokens 承载）；若未提供 design-tokens，notes §一可含简要数值

**3b. Design Token 文件**（`design/design-tokens.json`）— **精确数值的权威来源**：
- 若存在，读取并解析 JSON 结构
- Token 中的色值、间距、字号、圆角、高程等数值直接引用，**不再从截图中猜测**这些数值
- 与 design-notes 互补：notes 提供上下文与行为，tokens 提供精确数值
- 在 ux-design.md 的视觉规范章节中引用 Token 值时标注 `✅ 高`（来源：design-tokens.json）

**3c. 图片文件**（`.png` / `.jpg` / `.jpeg` / `.webp`）：
- 使用 Read 工具逐个读取图片
- 若图片有命名约定（`[序号]-[界面]-[状态].png`），自动推断界面归属和状态分组
- 若无命名约定且无 design-notes，将每张图的归属列入「待确认项」

**3d. Pencil 文件**（`.pen`）：
- 使用 Pencil MCP `open_document(filePath)` 打开文件
- 使用 `batch_get(filePath)` 读取顶层节点树，了解整体结构
- 使用 `snapshot_layout(filePath)` 获取布局信息
- 对关键 Frame 使用 `get_screenshot(filePath, nodeId)` 获取截图以辅助视觉分析

**3e. Figma 链接**：
- 从 `$ARGUMENTS` 中提取 Figma URL
- 若 `design/figma-links.md` 存在，读取其中的链接列表
- 记录链接，提示用户 AI 无法直接访问 Figma，需要用户将相关页面导出为截图放入 `design/`，或在 Pencil 中打开

**3f. 评估输入质量等级**：
- **A 级**：design-notes + design-tokens + 图片/Pencil 齐备
- **B 级**：有 design-notes 或 design-tokens 之一 + 图片/Pencil
- **C 级**：仅有图片/Pencil（无结构化补充）
- **D 级**：无任何设计素材 → 进入**兜底模式**（步骤 5c）

记录输入质量等级，写入 ux-design.md 元信息。非 D 级进入**解析模式**（步骤 5a/5b）。

### 4. 加载需求上下文

读取以下文件作为交叉比对的需求参照：
- `EPIC_DIR/epic.md`：背景、范围、Feature 列表
- 各 `EPIC_DIR/features/*/spec.md`：FR、NFR、AC、用户旅程、边界场景
- `.specify/templates/ux-design-template.md`：输出模板结构
- `design/design-notes.md`（若存在，已在步骤 3a 读取）：作为图片解析的上下文参照
- `design/design-tokens.json`（若存在，已在步骤 3b 读取）：作为精确数值参照

### 5. 解析与提取

根据**解析侧重**（从 `$ARGUMENTS` 解析：`交互` / `视觉` / 全量默认）和素材类型执行解析：

**5a. 交互稿解析**（当侧重为「交互」或「全量」时执行）：

逐页/逐屏分析设计稿，提取：
1. **信息架构**：识别所有界面、层级关系、导航入口
2. **页面流转**：识别界面间的跳转关系，用 Mermaid flowchart 还原
3. **逐屏交互规则**：每个界面内的操作触发、响应行为、目标状态
4. **状态定义**：识别 Loading/空态/错误态/成功态/离线态等各状态的视觉表现
5. **反馈方式**：Toast/Snackbar/Dialog/内联提示等反馈机制
6. **异常与边界**：设计稿中体现的异常处理方案
7. **导航与手势**：返回行为、手势交互、Deep Link
8. **交叉比对**：将提取结果与 spec.md 中的 FR/AC/用户旅程逐条比对，标出设计稿未覆盖的场景 → 写入「遗漏与待确认」章节

**输入融合规则**：若 design-notes 中有某界面的交互说明，以 design-notes 为准并标 `✅ 高`；若仅从图片推断则标 `⚠️ 中` 或 `❓ 低`。

每条提取的规则**必须标注来源**（文件名/页面/区域）**及置信度**（`✅ 高` / `⚠️ 中` / `❓ 低`）。

**5b. 视觉稿解析**（当侧重为「视觉」或「全量」时执行）：

逐页分析设计稿，提取：
1. **主题与色板**：提取主色、辅色、背景、表面、错误等色值（Light/Dark）
2. **布局结构**：提取关键界面的布局区域、尺寸、间距，用 Markdown 表格展示
3. **组件清单**：识别使用的组件、对应 Material 组件、自定义样式参数
4. **动效/过渡**：识别或从标注中读取动效类型、时长、缓动曲线
5. **响应与适配**：屏幕尺寸分级、折叠屏、字体缩放、横竖屏策略
6. **无障碍**：触控区域、对比度、内容描述等
7. **交叉比对**：将提取结果与 spec.md 中的 NFR（性能/适配/无障碍要求）比对，标出差异

**输入融合规则**：
- 色值/间距/字号/圆角/高程 → 若 design-tokens.json 有值则直接引用（`✅ 高`），否则从图片推测（`❓ 低`）
- 动效参数 → 若 design-notes 有说明则采信（`✅ 高`），否则标 `❓ 低`（AI 无法从静态图片识别动效）
- 组件类型/布局结构 → 图片可较可靠识别（`⚠️ 中`），有 design-notes 佐证时升为 `✅ 高`

每项提取的规范**必须标注来源及置信度**。

**5c. 兜底模式**（当无任何设计素材时执行）：

基于 epic.md 与各 spec.md 的 FR/NFR/用户旅程，**提出 UX 建议草案**：
- 填充模板各章节，但所有内容前缀标记 `[AI 建议 - 待设计师确认]`
- 在「遗漏与待确认」章节说明：本文档为 AI 建议草案，非基于设计稿解析，需设计师评审并提供正式设计稿
- 「设计稿来源」表填写「暂无 — AI 建议草案」

### 6. 填充 ux-design.md

按 `.specify/templates/ux-design-template.md` 结构填充，写入 `EPIC_UX_DESIGN`。

元信息须包含：
- **Epic / Epic Version / ux-design Version / 日期**
- **解析模式**：交互 / 视觉 / 全量 / 兜底
- **输入质量等级**：A / B / C / D（步骤 3f 的评估结果）
- **设计稿来源**：列出所有解析的设计素材（含 design-notes / design-tokens 的有无状态）
- **需求参照**：`epic.md`、各 `features/*/spec.md`

确保从**整个 EPIC 需求整体**视角填充，保证跨 Feature 导航、风格与交互一致。

### 7. 完成报告

输出：
1. `ux-design.md` 路径
2. **输入质量等级**：A / B / C / D 及其依据
3. 解析统计：解析了多少设计素材、提取了多少交互规则/视觉规范
4. **置信度分布**：`✅ 高` / `⚠️ 中` / `❓ 低` 各多少条
5. **遗漏摘要**：设计稿未覆盖的 spec 场景数量及关键项
6. **待确认摘要**：AI 无法确定的细节数量
7. 提示下一步：
   - 请 review ux-design.md 中的「遗漏与待确认」章节
   - **重点关注 `❓ 低` 置信度条目**，确认或纠正
   - 若有遗漏，补充设计稿后可重新运行或说明更新范围做增量更新
   - 若尚未做 EPIC 技术规约可运行 `/aisdd.epicplan "EPIC-xxx"`
   - 对各 Feature 设置 `SPECIFY_FEATURE` 后运行 `/aisdd.featureplan`

**若输入质量为 C/D 级**，在完成报告中额外醒目提示：

```
📋 输入质量提升建议：当前为 [C/D] 级，AI 对视觉细节的理解精度有限。建议补充：
- design/design-notes.md（模板：.specify/templates/design-notes-template.md）
  → 补充图片间关系、交互细节、动效参数等 AI 无法从截图推断的信息
- design/design-tokens.json（模板：.specify/templates/design-tokens-template.json）
  → 补充精确色值、间距、字号、圆角等数值
补充后说明更新范围，AI 可做增量更新以提升准确度。
```

---

## 核心规则

- **解析而非创作**：从设计素材**提取**交互与视觉规范，不凭空发明 UX（兜底模式除外，且须标记 `[AI 建议 - 待设计师确认]`）
- **spec 单向消费（禁写红线）**：对 `epic.md`、各 Feature `spec.md` 仅**只读**消费——用于交叉比对与「遗漏与待确认」登记。**禁止**反向修改 spec/epic 的任何章节（含 FR/NFR/AC/范围/场景）。设计稿覆盖但 spec 未写的场景：写入 `ux-design.md`「遗漏与待确认」章节，并建议用户走 `/aisdd.cr`（需求类）或 `/aisdd.clarify` 补全 spec；**不得**在 ux-design 流程中直接改 spec
- **ux-design 事实源边界**：交互形态、视觉细节、布局结构、状态视觉表现归本文件；「系统必须做什么 + 可验收结果」归 spec（详见 `docs/aisdd/spec-vs-ux-design-boundary.md`）
- **技术决策不归 ux-design**：线程模型、存储选型、API 契约、类结构等写入 `plan.md` / `epic-design.md`，不在 ux-design 中展开（见 `docs/aisdd/spec-vs-plan-design-boundary.md`）
